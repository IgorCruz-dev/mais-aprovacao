/**
 * Backfill de usuários do Clerk → tabela `users`.
 *
 * Rede de segurança para webhooks perdidos e bootstrap de ambiente:
 * lista todos os usuários do Clerk e faz upsert dos que faltam no banco.
 * A role de usuários novos segue a mesma regra do webhook
 * (publicMetadata.role > unsafeMetadata.requested_role > 'student').
 *
 * Uso (da pasta apps/api, com CLERK_SECRET_KEY e DATABASE_URL no ambiente):
 *   pnpm exec tsx scripts/backfill-clerk-users.ts
 *
 * Primeiro admin: cadastre-se normalmente, rode o backfill se preciso e então
 * promova via SQL (`UPDATE users SET role='admin' WHERE email='...'`) +
 * publicMetadata `{ "role": "admin" }` no Clerk Dashboard — só uma vez;
 * os próximos admins são promovidos pelo painel.
 */
import "dotenv/config";
import { createClerkClient } from "@clerk/fastify";
import type { User as ClerkUser } from "@clerk/fastify";
import { prisma } from "@mais-aprovacao/db";

const VALID_ROLES = ["student", "teacher", "manager", "parent", "admin"] as const;
type Role = (typeof VALID_ROLES)[number];
const SELF_SIGNUP_ROLES: readonly Role[] = ["student", "teacher", "parent"];

function resolveRole(user: ClerkUser): Role {
  const publicRole = user.publicMetadata?.role;
  if (typeof publicRole === "string" && VALID_ROLES.includes(publicRole as Role)) {
    return publicRole as Role;
  }
  const requested = user.unsafeMetadata?.requested_role;
  if (typeof requested === "string" && SELF_SIGNUP_ROLES.includes(requested as Role)) {
    return requested as Role;
  }
  return "student";
}

async function main() {
  const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
  let offset = 0;
  const limit = 100;
  let created = 0;
  let updated = 0;

  for (;;) {
    const page = await clerk.users.getUserList({ limit, offset, orderBy: "+created_at" });
    if (page.data.length === 0) break;

    for (const clerkUser of page.data) {
      const email =
        clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId)?.emailAddress ??
        clerkUser.emailAddresses[0]?.emailAddress;
      if (!email) {
        console.warn(`- pulado (sem email): ${clerkUser.id}`);
        continue;
      }

      const name =
        [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ").trim() || email.split("@")[0];
      const existing = await prisma.user.findUnique({ where: { clerk_id: clerkUser.id } });

      await prisma.user.upsert({
        where: { clerk_id: clerkUser.id },
        update: { email, name, avatar_url: clerkUser.imageUrl ?? null },
        create: {
          clerk_id: clerkUser.id,
          email,
          name,
          avatar_url: clerkUser.imageUrl ?? null,
          role: resolveRole(clerkUser),
        },
      });
      existing ? updated++ : created++;
    }

    offset += page.data.length;
    if (page.data.length < limit) break;
  }

  console.log(`Backfill concluído: ${created} criados, ${updated} atualizados.`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
