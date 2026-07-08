import { redirect } from "next/navigation"
import { ROLE_TO_DASHBOARD } from "@mais-aprovacao/utils"
import AccountPending from "@/components/auth/AccountPending"
import { getApiUser } from "@/lib/auth"

export default async function DashboardResolverPage() {
  const result = await getApiUser()

  if (result.status === "unauthenticated") redirect("/sign-in")
  if (result.status === "not_provisioned") return <AccountPending />
  if (result.status === "error") return <AccountPending variant="error" />

  redirect(ROLE_TO_DASHBOARD[result.user.role])
}
