import RoleChrome from "@/components/navigation/RoleChrome"
import { ToastContainer } from "@/components/student/StudentSurface"
import AreaGate from "@/components/auth/AreaGate"

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  return (
    <AreaGate area="manager">
      <RoleChrome role="manager">
        {children}
        <ToastContainer />
      </RoleChrome>
    </AreaGate>
  )
}
