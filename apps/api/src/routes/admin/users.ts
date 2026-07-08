import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { clerkClient } from "@clerk/fastify";
import { Prisma } from "@mais-aprovacao/db";
import { prisma } from "../../lib/prisma.js";
import { logSecurityEvent, requireAuth, requireRole } from "../../plugins/auth.js";
import { decodeCursor, encodeCursor, parseLimit } from "../../utils/cursor.js";
import { serializeUserProfile } from "../me/index.js";

const listUsersQuery = z.object({
  role: z.enum(["student", "teacher", "manager", "parent", "admin"]).optional(),
  q: z.string().max(200).optional(),
  limit: z.coerce.number().optional(),
  cursor: z.string().optional(),
});

const createManagerBody = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().max(320),
  password: z.string().min(8).max(200),
});

async function handleListUsers(req: FastifyRequest, reply: FastifyReply) {
  const parsed = listUsersQuery.safeParse(req.query);
  if (!parsed.success) {
    return reply.status(400).send({ error: "Invalid query", code: "VALIDATION_ERROR" });
  }

  const { role, q } = parsed.data;
  const limit = parseLimit(parsed.data.limit);
  const cursor = decodeCursor(parsed.data.cursor);

  // q e cursor viram cláusulas OR independentes — combinadas via AND para não colidir.
  const and: Prisma.UserWhereInput[] = [];
  if (q) {
    and.push({
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
      ],
    });
  }
  if (cursor) {
    and.push({
      OR: [
        { created_at: { lt: cursor.date } },
        { created_at: cursor.date, id: { lt: cursor.id } },
      ],
    });
  }

  const where: Prisma.UserWhereInput = {
    ...(role ? { role } : {}),
    ...(and.length ? { AND: and } : {}),
  };

  const rows = await prisma.user.findMany({
    where,
    orderBy: [{ created_at: "desc" }, { id: "desc" }],
    take: limit + 1,
  });

  const hasMore = rows.length > limit;
  const users = hasMore ? rows.slice(0, limit) : rows;
  const last = users[users.length - 1];

  return reply.send({
    users: users.map(serializeUserProfile),
    next_cursor: hasMore && last ? encodeCursor(last.created_at, last.id) : null,
  });
}

const patchUserBody = z.object({
  role: z.enum(["student", "teacher", "manager", "parent", "admin"]).optional(),
  name: z.string().min(1).max(200).optional(),
  avatar_url: z.string().url().nullable().optional(),
});

async function handlePatchUser(
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const parsed = patchUserBody.safeParse(req.body);
  if (!parsed.success) {
    return reply.status(400).send({ error: "Invalid body", code: "VALIDATION_ERROR" });
  }

  const target = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!target) {
    return reply.status(404).send({ error: "Usuário não encontrado", code: "USER_NOT_FOUND" });
  }

  const { role, name, avatar_url } = parsed.data;
  const roleChanged = role !== undefined && role !== target.role;

  const updated = await prisma.$transaction(async (tx) => {
    const user = await tx.user.update({
      where: { id: target.id },
      data: {
        ...(role !== undefined ? { role } : {}),
        ...(name !== undefined ? { name } : {}),
        ...(avatar_url !== undefined ? { avatar_url } : {}),
      },
    });

    if (roleChanged) {
      await tx.securityLog.create({
        data: {
          user_id: target.id,
          event_type: "ROLE_CHANGED",
          event_description: `Role alterada de ${target.role} para ${role}`,
          metadata: { old_role: target.role, new_role: role, changed_by: req.user.id },
        },
      });
    }

    return user;
  });

  if (roleChanged) {
    // Sincroniza o cache no Clerk; se falhar, compensa revertendo o banco —
    // banco e publicMetadata nunca ficam divergentes.
    try {
      await clerkClient.users.updateUserMetadata(target.clerk_id, {
        publicMetadata: { role },
      });
    } catch (err) {
      req.log.error({ err, user_id: target.id }, "falha ao sincronizar role no Clerk; revertendo");
      await prisma.user.update({ where: { id: target.id }, data: { role: target.role } });
      await logSecurityEvent({
        user_id: target.id,
        event_type: "ROLE_CHANGE_REVERTED",
        event_description: "Sincronização com o Clerk falhou; role revertida no banco.",
        metadata: { attempted_role: role, restored_role: target.role, changed_by: req.user.id },
      });
      return reply.status(502).send({ error: "Falha ao sincronizar role no Clerk", code: "CLERK_SYNC_FAILED" });
    }
  }

  return reply.send({ user: serializeUserProfile(updated) });
}

async function handleCreateManager(req: FastifyRequest, reply: FastifyReply) {
  const parsed = createManagerBody.safeParse(req.body);
  if (!parsed.success) {
    return reply.status(400).send({ error: "Invalid body", code: "VALIDATION_ERROR" });
  }

  const email = parsed.data.email.trim().toLowerCase();
  const name = parsed.data.name.trim();
  const [firstName, ...rest] = name.split(/\s+/);
  let clerkUserId: string | null = null;

  try {
    const clerkUser = await clerkClient.users.createUser({
      emailAddress: [email],
      password: parsed.data.password,
      firstName,
      lastName: rest.join(" ") || undefined,
      publicMetadata: { role: "manager" },
      unsafeMetadata: { created_by_admin_user_id: req.user.id },
    });
    clerkUserId = clerkUser.id;

    const user = await prisma.user.upsert({
      where: { clerk_id: clerkUser.id },
      update: { email, name, role: "manager" },
      create: { clerk_id: clerkUser.id, email, name, role: "manager" },
    });

    await logSecurityEvent({
      user_id: user.id,
      event_type: "MANAGER_CREATED",
      event_description: "Gestor criado pelo painel admin.",
      metadata: { created_by: req.user.id, email },
    });

    return reply.status(201).send({ user: serializeUserProfile(user) });
  } catch (err) {
    req.log.error({ err, email }, "falha ao criar gestor");
    if (clerkUserId) {
      try {
        await clerkClient.users.deleteUser(clerkUserId);
      } catch (rollbackErr) {
        req.log.error({ err: rollbackErr, clerk_id: clerkUserId }, "falha ao reverter usuário Clerk após erro local");
      }
    }
    return reply.status(502).send({ error: "Falha ao criar gestor no Clerk", code: "CLERK_CREATE_FAILED" });
  }
}

export async function adminUserRoutes(app: FastifyInstance) {
  const guard = [requireAuth, requireRole("admin")];

  app.get("/admin/users", { preHandler: guard }, handleListUsers);
  app.post("/admin/users/managers", { preHandler: guard }, handleCreateManager);
  app.patch<{ Params: { id: string } }>("/admin/users/:id", { preHandler: guard }, handlePatchUser);
}
