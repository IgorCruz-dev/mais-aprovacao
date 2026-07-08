import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { logSecurityEvent, requireAuth, requireRole } from "../../plugins/auth.js";
import { decodeCursor, encodeCursor, parseLimit } from "../../utils/cursor.js";

const USER_SELECT = { id: true, name: true, email: true } as const;

const listLinksQuery = z.object({
  verified: z.enum(["true", "false"]).optional(),
  limit: z.coerce.number().optional(),
  cursor: z.string().optional(),
});

async function handleListLinks(req: FastifyRequest, reply: FastifyReply) {
  const parsed = listLinksQuery.safeParse(req.query);
  if (!parsed.success) {
    return reply.status(400).send({ error: "Invalid query", code: "VALIDATION_ERROR" });
  }

  const limit = parseLimit(parsed.data.limit);
  const cursor = decodeCursor(parsed.data.cursor);

  const rows = await prisma.parentStudentLink.findMany({
    where: {
      ...(parsed.data.verified !== undefined ? { verified: parsed.data.verified === "true" } : {}),
      ...(cursor
        ? {
            OR: [
              { created_at: { lt: cursor.date } },
              { created_at: cursor.date, id: { lt: cursor.id } },
            ],
          }
        : {}),
    },
    include: {
      parent: { select: USER_SELECT },
      student: { select: USER_SELECT },
    },
    orderBy: [{ created_at: "desc" }, { id: "desc" }],
    take: limit + 1,
  });

  const hasMore = rows.length > limit;
  const links = hasMore ? rows.slice(0, limit) : rows;
  const last = links[links.length - 1];

  return reply.send({
    links: links.map((link) => ({
      id: link.id,
      verified: link.verified,
      created_at: link.created_at.toISOString(),
      parent: link.parent,
      student: link.student,
    })),
    next_cursor: hasMore && last ? encodeCursor(last.created_at, last.id) : null,
  });
}

async function handleVerifyLink(
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const link = await prisma.parentStudentLink.findUnique({ where: { id: req.params.id } });
  if (!link) {
    return reply.status(404).send({ error: "Vínculo não encontrado", code: "LINK_NOT_FOUND" });
  }

  // Idempotente: verificar um vínculo já verificado só retorna o vínculo.
  const updated = link.verified
    ? link
    : await prisma.parentStudentLink.update({ where: { id: link.id }, data: { verified: true } });

  if (!link.verified) {
    await logSecurityEvent({
      user_id: link.parent_user_id,
      event_type: "PARENT_LINK_VERIFIED",
      event_description: "Vínculo responsável↔aluno verificado pelo admin.",
      metadata: { link_id: link.id, student_user_id: link.student_user_id, verified_by: req.user.id },
    });
  }

  return reply.send({
    link: {
      id: updated.id,
      parent_user_id: updated.parent_user_id,
      student_user_id: updated.student_user_id,
      verified: updated.verified,
      created_at: updated.created_at.toISOString(),
    },
  });
}

export async function adminParentLinkRoutes(app: FastifyInstance) {
  const guard = [requireAuth, requireRole("admin")];

  app.get("/admin/parent-links", { preHandler: guard }, handleListLinks);
  app.patch<{ Params: { id: string } }>(
    "/admin/parent-links/:id/verify",
    { preHandler: guard },
    handleVerifyLink
  );
}
