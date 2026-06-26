import type { FastifyRequest, FastifyReply } from "fastify";
import { getAuth } from "@clerk/fastify";

export async function requireAuth(req: FastifyRequest, reply: FastifyReply) {
  const { userId } = getAuth(req);
  if (!userId) {
    reply.status(401).send({ error: "Unauthorized" });
  }
}
