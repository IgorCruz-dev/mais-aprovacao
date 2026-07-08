import { redirect } from "next/navigation"
import type { UserRole } from "@mais-aprovacao/types"
import { ROLE_TO_DASHBOARD } from "@mais-aprovacao/utils"
import { getApiUser } from "@/lib/auth"
import { RoleProvider } from "./RoleProvider"
import AccountPending from "./AccountPending"

/**
 * Camada 2 da defesa: reconsulta a role real via API (banco) no layout de cada
 * route group e redireciona se divergir do claim que passou pelo middleware.
 */
export default async function AreaGate({ area, children }: { area: UserRole; children: React.ReactNode }) {
  const result = await getApiUser()

  if (result.status === "unauthenticated") redirect("/sign-in")
  if (result.status === "not_provisioned") return <AccountPending />
  if (result.status === "error") return <AccountPending variant="error" />

  const { user } = result
  if (user.role !== area && user.role !== "admin") {
    redirect(ROLE_TO_DASHBOARD[user.role])
  }

  return <RoleProvider user={user}>{children}</RoleProvider>
}
