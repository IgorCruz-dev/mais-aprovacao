"use client"

import { useState } from "react"
import { Exam, Users, ChartBar, Warning } from "@phosphor-icons/react"
import {
  APROVA, BentoCard, PageHeader, Chip, ChipRow, ProgressBar,
  RevealGroup, RevealItem, KpiCard, AnimatedNumber, showToast,
} from "@/components/teacher/TeacherSurface"
import { SIMULADOS, TURMAS, type SimuladoStatus, type Simulado } from "@/lib/mock-teacher-data"

const STATUS_OPTIONS: { value: SimuladoStatus | "all"; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "agendado", label: "Agendados" },
  { value: "em_andamento", label: "Em andamento" },
  { value: "concluido", label: "Concluídos" },
]

const STATUS_BADGE_MAP: Record<SimuladoStatus, { bg: string; color: string; label: string }> = {
  agendado:     { bg: APROVA.blueSoft, color: APROVA.blue, label: "Agendado" },
  em_andamento: { bg: "#FFF3DA",       color: "#B45309",  label: "Em andamento" },
  concluido:    { bg: "#E6F8F0",       color: APROVA.successDeep, label: "Concluído" },
}

function SimuladoCard({ simulado }: { simulado: Simulado }) {
  const badge = STATUS_BADGE_MAP[simulado.status]
  const d = new Date(simulado.scheduledAt)
  const dateLabel = d.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })
  const turmaNames = simulado.turmaIds.map((id) => TURMAS.find((t) => t.id === id)?.nome ?? id).join(", ")

  return (
    <BentoCard>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: "#FFF3DA" }}>
            <Exam size={18} weight="fill" color="#D97706" />
          </div>
          <div className="min-w-0">
            <p className="text-[13.5px] font-bold" style={{ color: APROVA.ink }}>{simulado.title}</p>
            <p className="text-[11.5px]" style={{ color: APROVA.inkMuted }}>{turmaNames} · {dateLabel}</p>
          </div>
        </div>
        <span className="inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[11px] font-bold" style={{ background: badge.bg, color: badge.color }}>
          {badge.label}
        </span>
      </div>

      {simulado.status !== "agendado" && simulado.participacaoPct !== null && (
        <div className="mt-4 flex flex-col gap-3">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Participação", value: `${simulado.participacaoPct}%`, color: simulado.participacaoPct >= 80 ? APROVA.success : APROVA.gold },
              { label: "Média geral", value: simulado.mediaGeral !== null ? `${simulado.mediaGeral}%` : "—", color: simulado.mediaGeral !== null && simulado.mediaGeral >= 70 ? APROVA.success : APROVA.gold },
              { label: "Nota máxima", value: simulado.topScore !== null ? `${simulado.topScore}%` : "—", color: APROVA.blue },
            ].map(({ label, value, color }) => (
              <div key={label} className="rounded-xl p-2.5 text-center" style={{ background: "#F6F7FB" }}>
                <p className="font-display text-[18px] font-bold" style={{ color }}>{value}</p>
                <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: APROVA.inkMuted }}>{label}</p>
              </div>
            ))}
          </div>

          {simulado.participacaoPct !== null && (
            <div>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-[11.5px] font-bold" style={{ color: APROVA.inkMuted }}>Participação ({simulado.participantes}/{simulado.totalAlunos})</span>
                <span className="text-[11.5px] font-bold" style={{ color: APROVA.ink }}>{simulado.participacaoPct}%</span>
              </div>
              <ProgressBar pct={simulado.participacaoPct} height={7} color={simulado.participacaoPct >= 80 ? APROVA.success : APROVA.gold} />
            </div>
          )}

          {simulado.mediaBySubject && simulado.mediaBySubject.length > 0 && (
            <div>
              <p className="mb-2 text-[11.5px] font-bold uppercase tracking-wide" style={{ color: APROVA.inkMuted }}>Médias por área</p>
              <div className="flex flex-col gap-2">
                {simulado.mediaBySubject.map(({ subject, avg }) => (
                  <div key={subject} className="flex items-center gap-3">
                    <span className="w-40 truncate text-[12px] font-semibold" style={{ color: APROVA.ink }}>{subject}</span>
                    <div className="flex-1">
                      <ProgressBar pct={subject === "Redação" ? avg / 10 : avg} height={6} color={avg >= 70 || avg >= 700 ? APROVA.success : APROVA.gold} />
                    </div>
                    <span className="w-12 text-right text-[11.5px] font-bold tabular" style={{ color: APROVA.inkMuted }}>
                      {subject === "Redação" ? avg : `${avg}%`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {simulado.naoPraticiparam.length > 0 && (
            <div className="rounded-2xl p-3" style={{ background: "rgba(226,48,48,0.06)", border: "1px solid rgba(226,48,48,0.2)" }}>
              <div className="flex items-center gap-2 mb-1">
                <Warning size={14} weight="fill" color={APROVA.error} />
                <p className="text-[11.5px] font-bold" style={{ color: APROVA.error }}>{simulado.naoPraticiparam.length} alunos não participaram</p>
              </div>
              <p className="text-[11px]" style={{ color: APROVA.inkMuted }}>{simulado.naoPraticiparam.join(", ")}</p>
            </div>
          )}

          <button
            onClick={() => showToast(`Relatório de "${simulado.title}" em desenvolvimento`)}
            className="w-full rounded-2xl py-2.5 text-[13px] font-extrabold"
            style={{ background: APROVA.blueSoft, color: APROVA.blue }}
          >
            Ver relatório completo →
          </button>
        </div>
      )}

      {simulado.status === "agendado" && (
        <div className="mt-3 rounded-2xl px-3.5 py-3" style={{ background: APROVA.blueSoft }}>
          <p className="text-[12.5px] font-semibold" style={{ color: APROVA.blue }}>
            {simulado.totalAlunos} alunos esperados · {dateLabel}
          </p>
        </div>
      )}
    </BentoCard>
  )
}

export default function SimuladosPage() {
  const [statusFilter, setStatusFilter] = useState<SimuladoStatus | "all">("all")

  const filtered = SIMULADOS.filter((s) => statusFilter === "all" || s.status === statusFilter)
  const concluidos = SIMULADOS.filter((s) => s.status === "concluido")
  const avgParticipacao = concluidos.length > 0
    ? Math.round(concluidos.reduce((a, s) => a + (s.participacaoPct ?? 0), 0) / concluidos.length)
    : 0
  const avgMedia = concluidos.length > 0
    ? Math.round(concluidos.reduce((a, s) => a + (s.mediaGeral ?? 0), 0) / concluidos.length)
    : 0

  return (
    <RevealGroup className="mx-auto max-w-[1240px] px-4 pt-4 lg:px-8 lg:pt-7">
      <RevealItem>
        <PageHeader
          kicker="Avaliações"
          title="Simulados"
          subtitle={`${SIMULADOS.length} simulados · ${concluidos.length} concluídos`}
        />
      </RevealItem>

      <RevealItem className="mb-5">
        <div className="grid grid-cols-3 gap-3 lg:gap-4">
          <KpiCard label="Total de simulados" value={<AnimatedNumber value={SIMULADOS.length} />} icon={Exam} color="#D97706" />
          <KpiCard label="Participação média" value={<AnimatedNumber value={avgParticipacao} />} unit="%" icon={Users} color={APROVA.blue} />
          <KpiCard label="Média geral" value={<AnimatedNumber value={avgMedia} />} unit="%" icon={ChartBar} color={avgMedia >= 70 ? APROVA.success : APROVA.gold} />
        </div>
      </RevealItem>

      <RevealItem className="mb-5">
        <ChipRow>
          {STATUS_OPTIONS.map((o) => (
            <Chip
              key={o.value}
              active={statusFilter === o.value}
              onClick={() => setStatusFilter(o.value)}
              color={o.value === "concluido" ? APROVA.success : o.value === "agendado" ? APROVA.blue : "#B45309"}
            >
              {o.label}
            </Chip>
          ))}
        </ChipRow>
      </RevealItem>

      <RevealItem>
        <div className="flex flex-col gap-4">
          {filtered.map((s) => <SimuladoCard key={s.id} simulado={s} />)}
          {filtered.length === 0 && (
            <BentoCard>
              <p className="py-4 text-center text-[13px]" style={{ color: APROVA.inkMuted }}>Nenhum simulado com este filtro.</p>
            </BentoCard>
          )}
        </div>
      </RevealItem>
    </RevealGroup>
  )
}
