import { ManagerChrome } from "@/components/navigation/ManagerChrome"
import { ToastContainer } from "@/components/student/StudentSurface"
import AreaGate from "@/components/auth/AreaGate"

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  return (
    <AreaGate area="manager">
      <ManagerChrome>
        {children}
        <ToastContainer />
      </ManagerChrome>
    </AreaGate>
  )
}
