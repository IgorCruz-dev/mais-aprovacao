import { ManagerChrome } from "@/components/navigation/ManagerChrome"
import { ToastContainer } from "@/components/student/StudentSurface"

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  return (
    <ManagerChrome>
      {children}
      <ToastContainer />
    </ManagerChrome>
  )
}
