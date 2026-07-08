import AreaGate from "@/components/auth/AreaGate"
import RoleChrome from "@/components/navigation/RoleChrome"

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <AreaGate area="teacher">
      <RoleChrome role="teacher">{children}</RoleChrome>
    </AreaGate>
  )
}
