import { StudentChrome } from "@/components/navigation/StudentChrome"
import { ToastContainer } from "@/components/student/StudentSurface"

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <StudentChrome>
      {children}
      <ToastContainer />
    </StudentChrome>
  )
}
