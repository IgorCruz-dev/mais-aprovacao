import { House, ChartBar, Student, UserGear, LinkSimple } from "@phosphor-icons/react"
import type { Icon as PhosphorIcon } from "@phosphor-icons/react"
import type { UserRole } from "@mais-aprovacao/types"

export type RoleNavItem = { key: string; label: string; Icon: PhosphorIcon; href: string }

// Navegação das áreas não-aluno (o aluno usa o StudentChrome, mais rico).
export const NAV_BY_ROLE: Record<Exclude<UserRole, "student">, RoleNavItem[]> = {
  teacher: [
    { key: "inicio", label: "Início", Icon: House, href: "/teacher/dashboard" },
  ],
  manager: [
    { key: "visao-geral", label: "Visão geral", Icon: ChartBar, href: "/manager/dashboard" },
  ],
  parent: [
    { key: "meus-alunos", label: "Meus alunos", Icon: Student, href: "/parent/dashboard" },
  ],
  admin: [
    { key: "usuarios", label: "Usuários", Icon: UserGear, href: "/admin" },
    { key: "vinculos", label: "Vínculos", Icon: LinkSimple, href: "/admin/vinculos" },
  ],
}
