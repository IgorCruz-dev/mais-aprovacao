import {
  Books,
  CalendarBlank,
  ChartLineUp,
  CurrencyDollarSimple,
  Exam,
  GraduationCap,
  House,
  LinkSimple,
  ListChecks,
  Medal,
  Megaphone,
  PencilLine,
  Question,
  SquaresFour,
  Student,
  Trophy,
  User,
  UserGear,
  Users,
  UsersThree,
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
    { key: "dashboard",   label: "Início",       Icon: House,         href: "/teacher/dashboard" },
    { key: "turmas",      label: "Turmas",        Icon: UsersThree,    href: "/teacher/turmas" },
    { key: "alunos",      label: "Alunos",        Icon: Student,       href: "/teacher/alunos" },
    { key: "aulas",       label: "Aulas",         Icon: VideoCamera,   href: "/teacher/aulas" },
    { key: "correcoes",   label: "Correções",     Icon: PencilLine,    href: "/teacher/correcoes" },
    { key: "simulados",   label: "Simulados",     Icon: Exam,          href: "/teacher/simulados" },
    { key: "desempenho",  label: "Desempenho",    Icon: ChartLineUp,   href: "/teacher/desempenho" },
    { key: "comunicados", label: "Comunicados",   Icon: Megaphone,     href: "/teacher/comunicados" },
    { key: "agenda",      label: "Agenda",        Icon: CalendarBlank, href: "/teacher/agenda" },
    { key: "suporte",     label: "Suporte",       Icon: Question,      href: "/teacher/suporte" },
  ],
  manager: [
    { key: "dashboard", label: "Visão Geral", Icon: SquaresFour, href: "/manager/dashboard" },
    { key: "alunos", label: "Alunos", Icon: Users, href: "/manager/alunos" },
    { key: "financeiro", label: "Financeiro", Icon: CurrencyDollarSimple, href: "/manager/financeiro" },
    { key: "pedagogico", label: "Pedagógico", Icon: GraduationCap, href: "/manager/pedagogico" },
    { key: "eventos", label: "Eventos", Icon: CalendarBlank, href: "/manager/eventos" },
  ],
  parent: [
    { key: "dashboard",   label: "Visão geral",  Icon: House,                href: "/parent/dashboard" },
    { key: "alunos",      label: "Alunos",        Icon: Student,              href: "/parent/alunos" },
    { key: "desempenho",  label: "Desempenho",    Icon: ChartLineUp,          href: "/parent/desempenho" },
    { key: "atividades",  label: "Atividades",    Icon: ListChecks,           href: "/parent/atividades" },
    { key: "financeiro",  label: "Financeiro",    Icon: CurrencyDollarSimple, href: "/parent/financeiro" },
    { key: "comunicados", label: "Comunicados",   Icon: Megaphone,            href: "/parent/comunicados" },
    { key: "reunioes",    label: "Reuniões",      Icon: CalendarBlank,        href: "/parent/reunioes" },
    { key: "suporte",     label: "Suporte",       Icon: Question,             href: "/parent/suporte" },
  ],
  admin: [
    { key: "usuarios", label: "Usuários", Icon: UserGear, href: "/admin" },
    { key: "vinculos", label: "Vínculos", Icon: LinkSimple, href: "/admin/vinculos" },
  ],
}

export const MOBILE_NAV_BY_ROLE: Record<UserRole, RoleNavItem[]> = {
  student: NAV_BY_ROLE.student.filter((item) => ["dashboard", "questoes", "simulados", "redacoes"].includes(item.key)),
  manager: NAV_BY_ROLE.manager,
  teacher: NAV_BY_ROLE.teacher.filter((item) => ["dashboard", "turmas", "alunos", "correcoes"].includes(item.key)),
  parent: NAV_BY_ROLE.parent.filter((item) => ["dashboard", "alunos", "desempenho", "financeiro"].includes(item.key)),
  admin: NAV_BY_ROLE.admin,
}
