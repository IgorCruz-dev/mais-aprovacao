"use client"

import { useState } from "react"
import { Plus, Users } from "@phosphor-icons/react"
import { VideoCamera } from "@phosphor-icons/react"
import {
  APROVA, BentoCard, PageHeader, Chip, ChipRow, ProgressBar,
  RevealGroup, RevealItem, AlertBanner, showToast,
} from "@/components/teacher/TeacherSurface"
import { TeacherLessonBadge } from "@/components/teacher/TeacherSurface"
import { AULAS, type AulaStatus, type Aula } from "@/lib/mock-teacher-data"

const STATUS_OPTIONS: { value: AulaStatus | "all"; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "ao_vivo", label: "Ao vivo" },
  { value: "planejada", label: "Planejadas" },
  { value: "concluida", label: "Concluídas" },
  { value: "cancelada", label: "Canceladas" },
]

function AulaCard({ aula }: { aula: Aula }) {
  const d = new Date(aula.scheduledAt)
  const dateLabel = d.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })
  const timeLabel = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
  const isLive = aula.status === "ao_vivo"

  return (
    <BentoCard
      className="relative"
      style={isLive ? { boxShadow: `0 0 0 2px ${APROVA.error}, 0 8px 24px -12px rgba(226,48,48,0.2)` } : undefined}
    >
      {isLive && (
        <div className="mb-3 flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: APROVA.error + "10" }}>
          <span className="h-2 w-2 rounded-full" style={{ background: APROVA.error, animation: "glowPulse 1.4s ease infinite" }} />
          <span className="text-[12px] font-extrabold uppercase tracking-wide" style={{ color: APROVA.error }}>Ao vivo agora</span>
        </div>
      )}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: isLive ? APROVA.error + "14" : APROVA.blueSoft }}>
            <VideoCamera size={18} weight="fill" color={isLive ? APROVA.error : APROVA.blue} />
          </div>
          <div className="min-w-0">
            <p className="text-[13.5px] font-bold" style={{ color: APROVA.ink }}>{aula.title}</p>
            <p className="text-[12px]" style={{ color: APROVA.inkMuted }}>{aula.turmaNome} · {aula.subject}</p>
          </div>
        </div>
        <TeacherLessonBadge status={aula.status} />
      </div>

      <div className="mt-3 flex flex-wrap gap-3 text-[12px]" style={{ color: APROVA.inkMuted }}>
        <span className="capitalize">{dateLabel}, {timeLabel}</span>
        <span>·</span>
        <span>{aula.durationMin}min</span>
        <span>·</span>
        <span className="flex items-center gap-1">
          <Users size={12} />
          {aula.attendeesCount !== null
            ? `${aula.attendeesCount}/${aula.attendeesExpected} presentes`
            : `${aula.attendeesExpected} esperados`}
        </span>
      </div>

      {aula.attendancePct !== null && (
        <div className="mt-3">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: APROVA.inkMuted }}>Presença</span>
            <span className="text-[11px] font-bold" style={{ color: aula.attendancePct >= 80 ? APROVA.success : APROVA.gold }}>{aula.attendancePct}%</span>
          </div>
          <ProgressBar
            pct={aula.attendancePct}
            height={6}
            color={aula.attendancePct >= 80 ? APROVA.success : APROVA.gold}
          />
        </div>
      )}

      {aula.description && (
        <p className="mt-3 text-[12px]" style={{ color: APROVA.inkMuted }}>{aula.description}</p>
      )}
    </BentoCard>
  )
}

export default function AulasPage() {
  const [statusFilter, setStatusFilter] = useState<AulaStatus | "all">("all")

  const filtered = AULAS.filter((a) => statusFilter === "all" || a.status === statusFilter)
    .sort((a, b) => {
      const order: AulaStatus[] = ["ao_vivo", "planejada", "concluida", "cancelada"]
      return order.indexOf(a.status) - order.indexOf(b.status) || a.scheduledAt.localeCompare(b.scheduledAt)
    })

  const liveAula = AULAS.find((a) => a.status === "ao_vivo")

  return (
    <RevealGroup className="mx-auto max-w-[1240px] px-4 pt-4 lg:px-8 lg:pt-7">
      <RevealItem>
        <PageHeader
          kicker="Gestão"
          title="Aulas"
          subtitle={`${AULAS.length} aulas no total`}
          action={
            <button
              onClick={() => showToast("Funcionalidade em desenvolvimento")}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-extrabold text-white"
              style={{ background: APROVA.blue }}
            >
              <Plus size={14} weight="bold" /> Planejar aula
            </button>
          }
        />
      </RevealItem>

      {liveAula && (
        <RevealItem className="mb-4">
          <AlertBanner
            tone="error"
            text={`Aula ao vivo em andamento: "${liveAula.title}" — ${liveAula.turmaNome}`}
            actionLabel="Ver detalhes"
            href="#live"
          />
        </RevealItem>
      )}

      <RevealItem className="mb-5">
        <ChipRow>
          {STATUS_OPTIONS.map((o) => (
            <Chip
              key={o.value}
              active={statusFilter === o.value}
              onClick={() => setStatusFilter(o.value)}
              color={o.value === "ao_vivo" ? APROVA.error : o.value === "planejada" ? APROVA.blue : o.value === "concluida" ? APROVA.success : APROVA.inkMuted}
            >
              {o.label}
            </Chip>
          ))}
        </ChipRow>
      </RevealItem>

      <RevealItem>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filtered.map((aula) => (
            <AulaCard key={aula.id} aula={aula} />
          ))}
          {filtered.length === 0 && (
            <BentoCard>
              <p className="py-4 text-center text-[13px]" style={{ color: APROVA.inkMuted }}>Nenhuma aula com este filtro.</p>
            </BentoCard>
          )}
        </div>
      </RevealItem>
    </RevealGroup>
  )
}
