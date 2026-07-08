import { StudentChrome } from "@/components/navigation/StudentChrome"
import { ToastContainer } from "@/components/student/StudentSurface"
import AreaGate from "@/components/auth/AreaGate"

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <AreaGate area="student">
      <StudentChrome>
        {children}
        <ToastContainer />
      </StudentChrome>
    </AreaGate>
  )
}
