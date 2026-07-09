import RoleChrome from "@/components/navigation/RoleChrome"
import { ToastContainer } from "@/components/student/StudentSurface"
import AreaGate from "@/components/auth/AreaGate"

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <AreaGate area="student">
      <RoleChrome role="student">
        {children}
        <ToastContainer />
      </RoleChrome>
    </AreaGate>
  )
}
