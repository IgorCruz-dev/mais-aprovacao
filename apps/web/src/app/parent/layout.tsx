import AreaGate from "@/components/auth/AreaGate"
import RoleChrome from "@/components/navigation/RoleChrome"

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  return (
    <AreaGate area="parent">
      <RoleChrome role="parent">{children}</RoleChrome>
    </AreaGate>
  )
}
