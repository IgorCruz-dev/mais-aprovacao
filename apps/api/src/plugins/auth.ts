import type { FastifyReply, FastifyRequest, preHandlerHookHandler } from "fastify";
import { getAuth } from "@clerk/fastify";
import type { User, UserRole } from "@mais-aprovacao/db";
import { prisma } from "../lib/prisma.js";

declare module "fastify" {
  interface FastifyRequest {
    user: User;
  }
}

/**
 * Verifica o session token do Clerk e carrega o registro local em `users`.
 * A role SEMPRE vem do banco — o publicMetadata do token é só cache do frontend.
 */
export async function requireAuth(req: FastifyRequest, reply: FastifyReply) {
  const { userId } = getAuth(req);
  if (!userId) {
    return reply.status(401).send({ error: "Unauthorized", code: "UNAUTHORIZED" });
  }

  const user = await prisma.user.findUnique({ where: { clerk_id: userId } });
  if (!user) {
    return reply.status(404).send({ error: "User not found", code: "USER_NOT_FOUND" });
  }

  req.user = user;
}

/**
 * Factory de preHandler de role. Exige `requireAuth` antes no array de preHandlers.
 * `admin` sempre passa, em qualquer rota protegida por role.
 */
export function requireRole(...allowed: UserRole[]): preHandlerHookHandler {
  return async function checkRole(req: FastifyRequest, reply: FastifyReply) {
    const role = req.user?.role;
    if (!role) {
      return reply.status(401).send({ error: "Unauthorized", code: "UNAUTHORIZED" });
    }
    if (role === "admin" || allowed.includes(role)) return;
    return reply.status(403).send({ error: "Forbidden", code: "FORBIDDEN" });
  };
}

export async function logSecurityEvent(data: {
  user_id?: string | null;
  event_type: string;
  event_description?: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    await prisma.securityLog.create({
      data: {
        user_id: data.user_id ?? null,
        event_type: data.event_type,
        event_description: data.event_description ?? null,
        metadata: (data.metadata ?? {}) as object,
      },
    });
  } catch {
    // Auditoria nunca derruba a operação principal.
  }
}
