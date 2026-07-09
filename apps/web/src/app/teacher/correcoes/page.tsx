"use client"

import { useMemo, useState } from "react"
import { PencilLine, Timer, CheckCircle } from "@phosphor-icons/react"
import {
  APROVA, BentoCard, PageHeader, Chip, ChipRow, SectionTitle, AlertBanner,
  DataTable, type DataTableColumn, Avatar, RevealGroup, RevealItem,
  AnimatedNumber, KpiCard, showToast,
} from "@/components/teacher/TeacherSurface"
import { TeacherEssayBadge, EssaySlaIndicator } from "@/components/teacher/TeacherSurface"
import { REDACOES, type EssayStatus, type Redacao } from "@/lib/mock-teacher-data"

const STATUS_OPTIONS: { value: EssayStatus | "all"; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "pendente", label: "Pendentes" },
  { value: "em_correcao", label: "Em correção" },
  { value: "concluida", label: "Concluídas" },
]

function timeAgo(isoDate: string): string {
  const diff = Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000 / 3600)
  if (diff < 1) return "Há menos de 1h"
  if (diff === 1) return "Há 1h"
  if (diff < 24) return `Há ${diff}h`
  const days = Math.floor(diff / 24)
  return `Há ${days} dia${days > 1 ? "s" : ""}`
}

export default function CorrecoesPage() {
  const [statusFilter, setStatusFilter] = useState<EssayStatus | "all">("all")

  const filtered = useMemo(() => {
    return REDACOES
      .filter((r) => statusFilter === "all" || r.status === statusFilter)
      .sort((a, b) => {
        if (a.overSla && !b.overSla) return -1
        if (!a.overSla && b.overSla) return 1
        return b.elapsedHours - a.elapsedHours
      })
  }, [statusFilter])

  const pending = REDACOES.filter((r) => r.status === "pendente")
  const inProgress = REDACOES.filter((r) => r.status === "em_correcao")
  const done = REDACOES.filter((r) => r.status === "concluida")
  const overSlaList = REDACOES.filter((r) => r.overSla)

  const avgSla = done.length > 0
    ? Math.round(done.reduce((a, r) => a + r.elapsedHours, 0) / done.length)
    : 0

  const columns: DataTableColumn<Redacao>[] = [
    {
      key: "student", header: "Aluno",
      render: (r) => (
        <div className="flex items-center gap-2.5">
          <Avatar initial={r.studentInitial} size={30} />
          <div className="min-w-0">
            <p className="truncate text-[12.5px] font-bold" style={{ color: APROVA.ink }}>{r.studentName}</p>
            <p className="text-[10.5px]" style={{ color: APROVA.inkMuted }}>{r.turmaNome}</p>
          </div>
        </div>
      ),
    },
    {
      key: "theme", header: "Tema",
      render: (r) => <span className="block max-w-[200px] truncate text-[12px]" style={{ color: APROVA.inkMuted }}>{r.theme}</span>,
    },
    {
      key: "submitted", header: "Enviada",
      render: (r) => <span className="text-[12px]" style={{ color: APROVA.inkMuted }}>{timeAgo(r.submittedAt)}</span>,
    },
    { key: "status", header: "Status", render: (r) => <TeacherEssayBadge status={r.status} /> },
    {
      key: "sla", header: "SLA",
      render: (r) => <EssaySlaIndicator elapsedHours={r.elapsedHours} slaHours={r.slaHours} />,
    },
    {
      key: "score", header: "Nota",
      render: (r) => r.score !== null
        ? <span className="font-bold tabular" style={{ color: r.score >= 700 ? APROVA.success : r.score >= 500 ? "#B45309" : APROVA.error }}>{r.score}/1000</span>
        : <span style={{ color: APROVA.inkMuted }}>—</span>,
    },
    {
      key: "action", header: "",
      render: (r) => (
        <button
          onClick={() => showToast(r.status === "concluida" ? `Redação de ${r.studentName} — ${r.theme}` : `Corrigindo: ${r.theme}`)}
          className="rounded-lg px-2.5 py-1.5 text-[11.5px] font-extrabold"
          style={{
            background: r.status === "concluida" ? APROVA.blueSoft : APROVA.blue,
            color: r.status === "concluida" ? APROVA.blue : "#fff",
          }}
        >
          {r.status === "concluida" ? "Ver →" : "Corrigir →"}
        </button>
      ),
    },
  ]

  return (
    <RevealGroup className="mx-auto max-w-[1240px] px-4 pt-4 lg:px-8 lg:pt-7">
      <RevealItem>
        <PageHeader
          kicker="Pedagógico"
          title="Correções"
          subtitle={`${pending.length} pendentes · ${done.length} concluídas este mês`}
        />
      </RevealItem>

      <RevealItem className="mb-5">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          <KpiCard
            label="Pendentes"
            value={<AnimatedNumber value={pending.length} />}
            icon={PencilLine}
            color={pending.length > 0 ? APROVA.error : APROVA.success}
          />
          <KpiCard
            label="Em correção"
            value={<AnimatedNumber value={inProgress.length} />}
            icon={Timer}
            color={APROVA.blue}
          />
          <KpiCard
            label="Concluídas este mês"
            value={<AnimatedNumber value={done.length} />}
            icon={CheckCircle}
            color={APROVA.success}
          />
          <KpiCard
            label="Tempo médio (SLA)"
            value={<AnimatedNumber value={avgSla} />}
            icon={Timer}
            color={APROVA.gold}
            unit="h"
          />
        </div>
      </RevealItem>

      {overSlaList.length > 0 && (
        <RevealItem className="mb-4">
          <AlertBanner
            tone="error"
            text={`${overSlaList.length} redaç${overSlaList.length > 1 ? "ões" : "ão"} com SLA vencido — ${overSlaList.map((r) => r.studentName).join(", ")}.`}
            actionLabel="Corrigir agora"
            href="#fila"
          />
        </RevealItem>
      )}

      <RevealItem className="mb-4">
        <ChipRow>
          {STATUS_OPTIONS.map((o) => (
            <Chip
              key={o.value}
              active={statusFilter === o.value}
              onClick={() => setStatusFilter(o.value)}
              color={o.value === "pendente" ? "#B45309" : o.value === "em_correcao" ? APROVA.blue : o.value === "concluida" ? APROVA.success : APROVA.blue}
            >
              {o.label} {o.value !== "all" && `(${REDACOES.filter((r) => r.status === o.value).length})`}
            </Chip>
          ))}
        </ChipRow>
      </RevealItem>

      <RevealItem>
        <BentoCard>
          <SectionTitle title="Fila de correção" kicker={`${filtered.length} redações`} />
          <DataTable columns={columns} rows={filtered} pageSize={10} emptyMessage="Nenhuma redação com este filtro." />
        </BentoCard>
      </RevealItem>
    </RevealGroup>
  )
}
