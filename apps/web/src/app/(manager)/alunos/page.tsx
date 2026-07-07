"use client"

import { useMemo, useState } from "react"
import { Fire } from "@phosphor-icons/react"
import {
  APROVA, BentoCard, PageHeader, ChipRow, Chip, ProgressBar, Avatar,
  DataTable, ManagerStatusBadge, RiskBadge, type DataTableColumn,
} from "@/components/manager/ManagerSurface"
import { MANAGER_STUDENTS, type ManagerStudentRow } from "@/lib/mock-manager-data"

const COURSES = Array.from(new Set(MANAGER_STUDENTS.map((s) => s.course)))
const STATUSES: { value: ManagerStudentRow["enrollmentStatus"] | "all"; label: string }[] = [
  { value: "all", label: "Todos os status" },
  { value: "active", label: "Ativa" },
  { value: "pending", label: "Pendente" },
  { value: "expired", label: "Expirada" },
  { value: "cancelled", label: "Cancelada" },
]

export default function ManagerAlunosPage() {
  const [course, setCourse] = useState<string | "all">("all")
  const [status, setStatus] = useState<ManagerStudentRow["enrollmentStatus"] | "all">("all")
  const [onlyRisk, setOnlyRisk] = useState(false)

  const filtered = useMemo(() => {
    return MANAGER_STUDENTS.filter((s) => {
      if (course !== "all" && s.course !== course) return false
      if (status !== "all" && s.enrollmentStatus !== status) return false
      if (onlyRisk && s.riskLevel !== "alto") return false
      return true
    })
  }, [course, status, onlyRisk])

  const columns: DataTableColumn<ManagerStudentRow>[] = [
    {
      key: "name",
      header: "Aluno",
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <Avatar initial={row.initial} size={30} />
          <div className="min-w-0">
            <p className="truncate text-[12.5px] font-bold" style={{ color: APROVA.ink }}>{row.name}</p>
            <p className="text-[10.5px]" style={{ color: APROVA.inkMuted }}>{row.cohort}</p>
          </div>
        </div>
      ),
    },
    { key: "course", header: "Curso", render: (row) => <span style={{ color: APROVA.inkMuted }}>{row.course}</span> },
    { key: "status", header: "Matrícula", render: (row) => <ManagerStatusBadge domain="enrollment" status={row.enrollmentStatus} /> },
    {
      key: "progress",
      header: "Progresso",
      render: (row) => (
        <div className="flex w-28 items-center gap-2">
          <ProgressBar pct={row.progressPct} height={6} />
          <span className="w-8 text-right text-[11px] font-bold tabular" style={{ color: APROVA.inkMuted }}>{row.progressPct}%</span>
        </div>
      ),
    },
    {
      key: "streak",
      header: "Ofensiva",
      render: (row) => (
        <span className="inline-flex items-center gap-1 font-bold tabular" style={{ color: APROVA.ink }}>
          <Fire size={13} weight="fill" color={APROVA.streak} /> {row.streak}
        </span>
      ),
    },
    { key: "lastActivity", header: "Última atividade", render: (row) => <span style={{ color: APROVA.inkMuted }}>{row.lastActivityAt}</span> },
    { key: "risk", header: "Risco", render: (row) => <RiskBadge level={row.riskLevel} /> },
  ]

  return (
    <div className="mx-auto max-w-[1680px] px-4 pt-4 lg:px-8 lg:pt-7">
      <PageHeader kicker="Gestão" title="Alunos" subtitle={`${filtered.length} alunos encontrados`} />

      <div className="mb-4 flex flex-col gap-2">
        <ChipRow>
          <Chip active={course === "all"} onClick={() => setCourse("all")}>Todos os cursos</Chip>
          {COURSES.map((c) => (
            <Chip key={c} active={course === c} onClick={() => setCourse(c)}>{c}</Chip>
          ))}
        </ChipRow>
        <ChipRow>
          {STATUSES.map((s) => (
            <Chip key={s.value} active={status === s.value} onClick={() => setStatus(s.value)}>{s.label}</Chip>
          ))}
          <Chip active={onlyRisk} onClick={() => setOnlyRisk((v) => !v)} color={APROVA.error}>Em risco</Chip>
        </ChipRow>
      </div>

      <BentoCard>
        <DataTable columns={columns} rows={filtered} emptyMessage="Nenhum aluno encontrado para esses filtros." />
      </BentoCard>
    </div>
  )
}
