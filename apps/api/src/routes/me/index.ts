import type { FastifyInstance } from "fastify";
import { z } from "zod";
import type { User } from "@mais-aprovacao/db";
import { prisma } from "../../lib/prisma.js";
import { requireAuth } from "../../plugins/auth.js";

export function serializeUserProfile(user: User) {
  return {
    id: user.id,
    clerk_id: user.clerk_id,
    email: user.email,
    name: user.name,
    role: user.role,
    avatar_url: user.avatar_url,
    created_at: user.created_at.toISOString(),
  };
}

const patchMeBody = z.object({
  name: z.string().min(1).max(200).optional(),
  avatar_url: z.string().url().nullable().optional(),
});

export async function meRoutes(app: FastifyInstance) {
  app.get("/me", { preHandler: [requireAuth] }, async (req, reply) => {
    return reply.send({ user: serializeUserProfile(req.user) });
  });

  app.patch("/me", { preHandler: [requireAuth] }, async (req, reply) => {
    const parsed = patchMeBody.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: "Invalid body", code: "VALIDATION_ERROR" });
    }

    const { name, avatar_url } = parsed.data;
    if (name === undefined && avatar_url === undefined) {
      return reply.send({ user: serializeUserProfile(req.user) });
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(avatar_url !== undefined ? { avatar_url } : {}),
      },
    });

    return reply.send({ user: serializeUserProfile(user) });
  });
}
