"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Fire, MagnifyingGlass } from "@phosphor-icons/react"
import {
  APROVA, BentoCard, PageHeader, ChipRow, Chip, ProgressBar, Avatar,
  DataTable, type DataTableColumn, RevealGroup, RevealItem,
} from "@/components/teacher/TeacherSurface"
import { StudentAcademicBadge } from "@/components/teacher/TeacherSurface"
import { TEACHER_STUDENTS, TURMAS, type TeacherStudent, type StudentRisk } from "@/lib/mock-teacher-data"

const RISK_OPTIONS: { value: StudentRisk | "all"; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "otimo", label: "Ótimo" },
  { value: "atencao", label: "Atenção" },
  { value: "risco", label: "Risco" },
]

export default function AlunosPage() {
  const [turmaFilter, setTurmaFilter] = useState<string>("all")
  const [riskFilter, setRiskFilter] = useState<StudentRisk | "all">("all")
  const [search, setSearch] = useState("")

  const filtered = useMemo(() => {
    return TEACHER_STUDENTS.filter((s) => {
      if (turmaFilter !== "all" && s.turmaId !== turmaFilter) return false
      if (riskFilter !== "all" && s.riskLevel !== riskFilter) return false
      if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [turmaFilter, riskFilter, search])

  const columns: DataTableColumn<TeacherStudent>[] = [
    {
      key: "name", header: "Aluno",
      render: (r) => (
        <Link href={`/teacher/alunos/${r.id}`} className="flex items-center gap-2.5 hover:underline">
          <Avatar initial={r.initial} color={r.color} size={32} />
          <div className="min-w-0">
            <p className="truncate text-[12.5px] font-bold" style={{ color: APROVA.ink }}>{r.name}</p>
            <p className="text-[10.5px]" style={{ color: APROVA.inkMuted }}>{r.turmaNome}</p>
          </div>
        </Link>
      ),
    },
    { key: "status", header: "Status", render: (r) => <StudentAcademicBadge status={r.riskLevel} /> },
    {
      key: "media", header: "Média",
      render: (r) => (
        <div className="flex w-20 items-center gap-2">
          <ProgressBar pct={r.mediaGeral} height={6} color={r.mediaGeral >= 70 ? APROVA.success : r.mediaGeral >= 50 ? "#F59E0B" : APROVA.error} />
          <span className="w-8 text-right text-[11px] font-bold tabular" style={{ color: APROVA.inkMuted }}>{r.mediaGeral}%</span>
        </div>
      ),
    },
    {
      key: "freq", header: "Freq.",
      render: (r) => (
        <span className="font-bold tabular text-[12px]" style={{ color: r.frequencia >= 80 ? APROVA.success : r.frequencia >= 60 ? "#B45309" : APROVA.error }}>
          {r.frequencia}%
        </span>
      ),
    },
    {
      key: "streak", header: "Ofensiva",
      render: (r) => (
        <span className="inline-flex items-center gap-1 text-[12px] font-bold">
          <Fire size={13} weight="fill" color={r.streak > 0 ? APROVA.streak : APROVA.inkMuted} />
          <span style={{ color: r.streak > 0 ? APROVA.ink : APROVA.inkMuted }}>{r.streak}d</span>
        </span>
      ),
    },
    { key: "questoes", header: "Questões", render: (r) => <span className="tabular">{r.questoesRespondidas}</span> },
    { key: "simulados", header: "Simulados", render: (r) => <span className="tabular">{r.simuladosFeitos}</span> },
    {
      key: "redacoes", header: "Redações",
      render: (r) => (
        <span className="tabular" style={{ color: r.redacoesPendentes > 0 ? APROVA.error : APROVA.inkMuted }}>
          {r.redacoesEntregues}e / {r.redacoesPendentes}p
        </span>
      ),
    },
    { key: "last", header: "Última atividade", render: (r) => <span style={{ color: APROVA.inkMuted }}>{r.lastActivityAt}</span> },
  ]

  return (
    <RevealGroup className="mx-auto max-w-[1240px] px-4 pt-4 lg:px-8 lg:pt-7">
      <RevealItem>
        <PageHeader
          kicker="Gestão"
          title="Alunos"
          subtitle={`${filtered.length} de ${TEACHER_STUDENTS.length} alunos`}
        />
      </RevealItem>

      <RevealItem className="mb-4">
        <div className="flex flex-col gap-3">
          {/* Busca */}
          <div className="relative">
            <MagnifyingGlass size={15} className="absolute left-3 top-1/2 -translate-y-1/2" color={APROVA.inkMuted} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar aluno..."
              className="w-full rounded-2xl py-2.5 pl-9 pr-3 text-[13px] outline-none"
              style={{ background: "#F4F6FB", border: "1px solid #EEF1F7", color: APROVA.ink }}
            />
          </div>

          {/* Filtro por turma */}
          <ChipRow>
            <Chip active={turmaFilter === "all"} onClick={() => setTurmaFilter("all")}>Todas as turmas</Chip>
            {TURMAS.map((t) => (
              <Chip key={t.id} active={turmaFilter === t.id} onClick={() => setTurmaFilter(t.id)} color={APROVA.blue}>
                {t.nome}
              </Chip>
            ))}
          </ChipRow>

          {/* Filtro por risco */}
          <ChipRow>
            {RISK_OPTIONS.map((o) => (
              <Chip
                key={o.value}
                active={riskFilter === o.value}
                onClick={() => setRiskFilter(o.value)}
                color={o.value === "otimo" ? APROVA.success : o.value === "atencao" ? "#F59E0B" : o.value === "risco" ? APROVA.error : APROVA.blue}
              >
                {o.label}
              </Chip>
            ))}
          </ChipRow>
        </div>
      </RevealItem>

      <RevealItem>
        <BentoCard>
          <DataTable columns={columns} rows={filtered} pageSize={12} emptyMessage="Nenhum aluno encontrado com os filtros selecionados." />
        </BentoCard>
      </RevealItem>
    </RevealGroup>
  )
}
