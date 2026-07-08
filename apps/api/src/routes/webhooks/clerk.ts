import type { FastifyInstance, FastifyRequest } from "fastify";
import { verifyWebhook } from "@clerk/fastify/webhooks";
import { clerkClient } from "@clerk/fastify";
import type { UserJSON } from "@clerk/fastify";
import type { WebhookEvent } from "@clerk/fastify/webhooks";
import { Prisma } from "@mais-aprovacao/db";
import type { UserRole } from "@mais-aprovacao/db";
import { prisma } from "../../lib/prisma.js";
import { logSecurityEvent } from "../../plugins/auth.js";

const ALL_ROLES: readonly UserRole[] = ["student", "teacher", "manager", "parent", "admin"];
// Roles que podem nascer de self-signup — manager/admin só por promoção do admin.
const SELF_SIGNUP_ROLES: readonly UserRole[] = ["student", "teacher", "parent"];

function extractEmail(data: UserJSON): string | null {
  const primary = data.email_addresses?.find((e) => e.id === data.primary_email_address_id);
  return primary?.email_address ?? data.email_addresses?.[0]?.email_address ?? null;
}

function extractName(data: UserJSON, email: string): string {
  const name = [data.first_name, data.last_name].filter(Boolean).join(" ").trim();
  return name || email.split("@")[0];
}

/**
 * Resolve a role de um usuário novo: publicMetadata (fonte já consolidada) >
 * unsafeMetadata.requested_role (escolhido no cadastro, whitelisted) > 'student'.
 * Retorna também se a role precisa ser consolidada no publicMetadata via Backend SDK.
 */
function resolveRole(data: UserJSON): { role: UserRole; needsConsolidation: boolean } {
  const publicRole = (data.public_metadata as Record<string, unknown> | null)?.role;
  if (typeof publicRole === "string" && ALL_ROLES.includes(publicRole as UserRole)) {
    return { role: publicRole as UserRole, needsConsolidation: false };
  }

  const requested = (data.unsafe_metadata as Record<string, unknown> | null)?.requested_role;
  if (typeof requested === "string" && SELF_SIGNUP_ROLES.includes(requested as UserRole)) {
    return { role: requested as UserRole, needsConsolidation: true };
  }

  return { role: "student", needsConsolidation: true };
}

async function handleUserCreatedOrUpdated(evt: WebhookEvent, req: FastifyRequest) {
  const data = evt.data as UserJSON;
  const email = extractEmail(data);
  if (!email) {
    req.log.warn({ clerk_id: data.id }, "clerk webhook: user sem email, ignorado");
    return;
  }

  const name = extractName(data, email);
  const avatar_url = data.image_url ?? null;
  const { role, needsConsolidation } = resolveRole(data);

  await prisma.user.upsert({
    where: { clerk_id: data.id },
    // Role NÃO é sincronizada do Clerk no update — o banco é a fonte de verdade
    // e trocas de role só entram pelo endpoint de admin (que grava banco + Clerk).
    update: { email, name, avatar_url },
    create: { clerk_id: data.id, email, name, avatar_url, role },
  });

  if (evt.type === "user.created" && needsConsolidation) {
    await clerkClient.users.updateUserMetadata(data.id, { publicMetadata: { role } });
  }
}

async function handleUserDeleted(evt: WebhookEvent) {
  const clerkId = (evt.data as { id?: string }).id;
  if (!clerkId) return;

  // Soft handling: mantém o registro e os dados acadêmicos vinculados.
  const user = await prisma.user.findUnique({ where: { clerk_id: clerkId } });
  await logSecurityEvent({
    user_id: user?.id ?? null,
    event_type: "CLERK_USER_DELETED",
    event_description: "Usuário deletado no Clerk; registro local mantido (soft delete).",
    metadata: { clerk_id: clerkId },
  });
}

export async function clerkWebhookRoutes(app: FastifyInstance) {
  app.post("/webhooks/clerk", async (req, reply) => {
    let evt: WebhookEvent;
    try {
      evt = await verifyWebhook(req, { signingSecret: process.env.CLERK_WEBHOOK_SECRET });
    } catch {
      return reply.status(400).send({ error: "Invalid webhook signature", code: "INVALID_SIGNATURE" });
    }

    const eventId = req.headers["svix-id"];
    if (typeof eventId !== "string" || !eventId) {
      return reply.status(400).send({ error: "Missing svix-id header", code: "INVALID_PAYLOAD" });
    }

    // Idempotência: (source, event_id) é UNIQUE — reenvio do mesmo evento não reprocessa.
    try {
      await prisma.webhookEvent.create({
        data: {
          source: "clerk",
          event_id: eventId,
          event_type: evt.type,
          payload: evt.data as unknown as Prisma.InputJsonValue,
        },
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        return reply.status(200).send({ received: true, event_id: eventId, processed: false });
      }
      throw err;
    }

    try {
      switch (evt.type) {
        case "user.created":
        case "user.updated":
          await handleUserCreatedOrUpdated(evt, req);
          break;
        case "user.deleted":
          await handleUserDeleted(evt);
          break;
        default:
          req.log.info({ type: evt.type }, "clerk webhook: evento ignorado");
      }
    } catch (err) {
      req.log.error({ err, event_id: eventId }, "clerk webhook: falha no processamento");
      return reply.status(500).send({ error: "Webhook processing failed", code: "WEBHOOK_PROCESSING_FAILED" });
    }

    return reply.status(200).send({ received: true, event_id: eventId, processed: true });
  });
}
