import AreaGate from "@/components/auth/AreaGate"
import RoleChrome from "@/components/navigation/RoleChrome"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AreaGate area="admin">
      <RoleChrome role="admin">{children}</RoleChrome>
    </AreaGate>
  )
}
