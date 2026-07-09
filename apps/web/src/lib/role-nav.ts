import {
  Books,
  CalendarBlank,
  ChartLineUp,
  CurrencyDollarSimple,
  Exam,
  GraduationCap,
  House,
  LinkSimple,
  Medal,
  PencilLine,
  Question,
  SquaresFour,
  Student,
  Trophy,
  User,
  UserGear,
  Users,
  VideoCamera,
} from "@phosphor-icons/react"
import type { Icon as PhosphorIcon } from "@phosphor-icons/react"
import type { UserRole } from "@mais-aprovacao/types"

export type RoleNavItem = { key: string; label: string; Icon: PhosphorIcon; href: string }

export const NAV_BY_ROLE: Record<UserRole, RoleNavItem[]> = {
  student: [
    { key: "dashboard", label: "Início", Icon: House, href: "/student/dashboard" },
    { key: "questoes", label: "Questões", Icon: Books, href: "/student/questoes" },
    { key: "simulados", label: "Simulados", Icon: Exam, href: "/student/simulados" },
    { key: "aulas", label: "Aulas", Icon: VideoCamera, href: "/student/aulas" },
    { key: "redacoes", label: "Redações", Icon: PencilLine, href: "/student/redacoes" },
    { key: "ranking", label: "Ranking", Icon: Trophy, href: "/student/ranking" },
    { key: "titulos", label: "Títulos e Evolução", Icon: Medal, href: "/student/titulos" },
    { key: "desempenho", label: "Meu Desempenho", Icon: ChartLineUp, href: "/student/desempenho" },
    { key: "suporte", label: "Suporte", Icon: Question, href: "/student/suporte" },
    { key: "perfil", label: "Perfil", Icon: User, href: "/student/perfil" },
  ],
  teacher: [
    { key: "inicio", label: "Início", Icon: House, href: "/teacher/dashboard" },
  ],
  manager: [
    { key: "dashboard", label: "Visão Geral", Icon: SquaresFour, href: "/manager/dashboard" },
    { key: "alunos", label: "Alunos", Icon: Users, href: "/manager/alunos" },
    { key: "financeiro", label: "Financeiro", Icon: CurrencyDollarSimple, href: "/manager/financeiro" },
    { key: "pedagogico", label: "Pedagógico", Icon: GraduationCap, href: "/manager/pedagogico" },
    { key: "eventos", label: "Eventos", Icon: CalendarBlank, href: "/manager/eventos" },
  ],
  parent: [
    { key: "meus-alunos", label: "Meus alunos", Icon: Student, href: "/parent/dashboard" },
  ],
  admin: [
    { key: "usuarios", label: "Usuários", Icon: UserGear, href: "/admin" },
    { key: "vinculos", label: "Vínculos", Icon: LinkSimple, href: "/admin/vinculos" },
  ],
}

export const MOBILE_NAV_BY_ROLE: Record<UserRole, RoleNavItem[]> = {
  student: NAV_BY_ROLE.student.filter((item) => ["dashboard", "questoes", "simulados", "redacoes"].includes(item.key)),
  manager: NAV_BY_ROLE.manager,
  teacher: NAV_BY_ROLE.teacher,
  parent: NAV_BY_ROLE.parent,
  admin: NAV_BY_ROLE.admin,
}
