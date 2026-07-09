"use client"

import Link from "next/link"
import {
  BookOpen,
  CalendarCheck,
  CaretRight,
  CheckCircle,
  ClockCounterClockwise,
  Exam,
  Fire,
  PencilLine,
  VideoCamera,
  WarningCircle,
  XCircle,
} from "@phosphor-icons/react"
import type { Icon as PhosphorIcon } from "@phosphor-icons/react"
import type { ActivityStatus, ActivityType, FinanceStatus, StudentStatus } from "@/lib/mock-parent-data"
import {
  APROVA,
  Avatar,
  BentoCard,
  ProgressBar,
} from "@/components/student/StudentSurface"

export {
  APROVA,
  Avatar,
  BentoCard,
} from "@/components/student/StudentSurface"

export {
  KpiCard,
  AlertBanner,
  DataTable,
  TrendPill,
} from "@/components/manager/ManagerSurface"

// ─── StudentStatusBadge ───────────────────────────────────────────────────────

const STATUS_MAP: Record<StudentStatus, { bg: string; color: string; label: string }> = {
  otimo:   { bg: "#E6F8F0", color: APROVA.successDeep, label: "Ótimo" },
  atencao: { bg: "#FFF3DA", color: "#B45309",           label: "Atenção" },
  risco:   { bg: "#FDECEC", color: APROVA.error,        label: "Risco" },
}

export function StudentStatusBadge({ status }: { status: StudentStatus }) {
  const s = STATUS_MAP[status]
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold"
      style={{ background: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  )
}

// ─── FinanceStatusBadge ───────────────────────────────────────────────────────

const FINANCE_MAP: Record<FinanceStatus, { bg: string; color: string; label: string }> = {
  em_dia:          { bg: "#E6F8F0", color: APROVA.successDeep, label: "Em dia" },
  vence_em_breve:  { bg: "#FFF3DA", color: "#B45309",           label: "Vence em breve" },
  pendente:        { bg: "#FDECEC", color: APROVA.error,        label: "Pendente" },
}

export function FinanceStatusBadge({ status }: { status: FinanceStatus }) {
  const s = FINANCE_MAP[status]
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold"
      style={{ background: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  )
}

// ─── ActivityStatusBadge ──────────────────────────────────────────────────────

const ACTIVITY_STATUS_MAP: Record<ActivityStatus, { icon: PhosphorIcon; color: string; label: string }> = {
  concluido: { icon: CheckCircle, color: APROVA.successDeep, label: "Concluído" },
  pendente:  { icon: ClockCounterClockwise, color: "#B45309", label: "Pendente" },
  atrasado:  { icon: XCircle, color: APROVA.error, label: "Atrasado" },
}

export function ActivityStatusBadge({ status }: { status: ActivityStatus }) {
  const s = ACTIVITY_STATUS_MAP[status]
  const Icon = s.icon
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ color: s.color, background: s.color + "14" }}>
      <Icon size={11} weight="fill" />
      {s.label}
    </span>
  )
}

// ─── ActivityTypeIcon ─────────────────────────────────────────────────────────

const TYPE_MAP: Record<ActivityType, { Icon: PhosphorIcon; color: string; bg: string }> = {
  aula:     { Icon: VideoCamera,           color: "#0E8A5F", bg: "#E6F8F2" },
  questao:  { Icon: BookOpen,              color: APROVA.blue, bg: APROVA.blueSoft },
  simulado: { Icon: Exam,                  color: "#D97706", bg: "#FFF3DA" },
  redacao:  { Icon: PencilLine,            color: "#6C4BD9", bg: "#F0ECFF" },
  checkin:  { Icon: CalendarCheck,         color: APROVA.streak, bg: "#FEF0E9" },
}

export function ActivityTypeIcon({ type, size = 36 }: { type: ActivityType; size?: number }) {
  const t = TYPE_MAP[type]
  const Icon = t.Icon
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-xl"
      style={{ width: size, height: size, background: t.bg }}
    >
      <Icon size={size * 0.45} weight="fill" color={t.color} />
    </div>
  )
}

// ─── ActivityTimelineItem ─────────────────────────────────────────────────────

export function ActivityTimelineItem({
  type,
  desc,
  date,
  status,
  detail,
  studentName,
  showStudent = false,
  isFirst = false,
}: {
  type: ActivityType
  desc: string
  date: string
  status: ActivityStatus
  detail?: string
  studentName?: string
  showStudent?: boolean
  isFirst?: boolean
}) {
  return (
    <div
      className="flex items-start gap-3 py-3"
      style={{ borderTop: isFirst ? undefined : `1px solid #F1F3F8` }}
    >
      <ActivityTypeIcon type={type} size={36} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-1">
          <p className="text-[13px] font-semibold leading-snug" style={{ color: APROVA.ink }}>
            {showStudent && studentName && (
              <span className="font-extrabold">{studentName} — </span>
            )}
            {desc}
          </p>
          <ActivityStatusBadge status={status} />
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-2">
          <span className="text-[11px]" style={{ color: APROVA.inkMuted }}>{date}</span>
          {detail && (
            <span className="text-[11px] font-semibold" style={{ color: APROVA.inkMuted }}>· {detail}</span>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── WeekdayDots ─────────────────────────────────────────────────────────────

const WEEKDAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]

export function WeekdayDots({ days }: { days: boolean[] }) {
  return (
    <div className="flex gap-1.5">
      {days.map((active, i) => (
        <div key={i} className="flex flex-col items-center gap-1">
          <div
            className="rounded-full"
            style={{
              width: 10,
              height: 10,
              background: active ? APROVA.blue : "#E2E6F0",
              boxShadow: active ? `0 0 6px ${APROVA.blue}55` : undefined,
            }}
          />
          <span className="text-[8px] font-bold uppercase" style={{ color: active ? APROVA.blue : APROVA.inkMuted }}>
            {WEEKDAYS[i]}
          </span>
        </div>
      ))}
    </div>
  )
}

// ─── StudentSummaryCard ───────────────────────────────────────────────────────

export function StudentSummaryCard({
  student,
  compact = false,
}: {
  student: {
    id: string
    name: string
    initial: string
    color: string
    turma: string
    curso: string
    status: StudentStatus
    streak: number
    points: number
    questoesRespondidas: number
    simuladosFeitos: number
    redacoesEntregues: number
    mediaGeral: number
    frequencia: number
    activityDays: boolean[]
    lastActivity: string
    nextEvent: string
    financeiro: { status: FinanceStatus; valor: string; vencimento: string }
  }
  compact?: boolean
}) {
  return (
    <BentoCard className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar initial={student.initial} color={student.color} size={44} />
          <div className="min-w-0">
            <p className="text-[15px] font-extrabold leading-tight" style={{ color: APROVA.ink }}>
              {student.name}
            </p>
            <p className="text-[12px]" style={{ color: APROVA.inkMuted }}>{student.turma}</p>
            <p className="text-[11px]" style={{ color: APROVA.inkMuted }}>{student.curso}</p>
          </div>
        </div>
        <StudentStatusBadge status={student.status} />
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Média geral", value: `${student.mediaGeral}%` },
          { label: "Frequência", value: `${student.frequencia}%` },
          { label: "Streak", value: `${student.streak}d` },
        ].map((m) => (
          <div key={m.label} className="rounded-xl p-2.5 text-center" style={{ background: APROVA.surface }}>
            <p className="text-[18px] font-extrabold tabular" style={{ color: APROVA.ink }}>{m.value}</p>
            <p className="text-[9px] font-bold uppercase tracking-wide" style={{ color: APROVA.inkMuted }}>{m.label}</p>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: APROVA.inkMuted }}>Desempenho geral</span>
          <span className="text-[12px] font-extrabold" style={{ color: APROVA.blue }}>{student.mediaGeral}%</span>
        </div>
        <ProgressBar pct={student.mediaGeral} color={student.status === "otimo" ? APROVA.success : student.status === "atencao" ? APROVA.gold : APROVA.error} height={7} />
      </div>

      {!compact && (
        <>
          {/* Ofensiva */}
          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wide" style={{ color: APROVA.inkMuted }}>
              Ofensiva semanal
            </p>
            <WeekdayDots days={student.activityDays} />
          </div>

          {/* Financeiro inline */}
          <div className="flex items-center justify-between rounded-xl px-3 py-2" style={{ background: APROVA.surface }}>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: APROVA.inkMuted }}>Mensalidade</p>
              <p className="text-[13px] font-extrabold" style={{ color: APROVA.ink }}>{student.financeiro.valor}</p>
              <p className="text-[10px]" style={{ color: APROVA.inkMuted }}>Vence {student.financeiro.vencimento}</p>
            </div>
            <FinanceStatusBadge status={student.financeiro.status} />
          </div>
        </>
      )}

      {/* Next event */}
      <div className="flex items-start gap-2 rounded-xl px-3 py-2" style={{ background: APROVA.blueSoft }}>
        <Fire size={14} weight="fill" color={APROVA.streak} className="mt-0.5 shrink-0" />
        <p className="text-[11.5px] font-semibold" style={{ color: APROVA.blue }}>
          Próximo: <span className="font-extrabold">{student.nextEvent}</span>
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <p className="text-[11px]" style={{ color: APROVA.inkMuted }}>Última atividade: {student.lastActivity}</p>
        <Link
          href={`/parent/alunos/${student.id}`}
          className="flex items-center gap-1 rounded-full px-3 py-1.5 text-[12px] font-extrabold text-white transition-transform hover:scale-[1.02]"
          style={{ background: APROVA.blue }}
        >
          Ver acompanhamento <CaretRight size={12} weight="bold" />
        </Link>
      </div>
    </BentoCard>
  )
}

// ─── InsightCard ─────────────────────────────────────────────────────────────

export function InsightCard({ text, icon: Icon = WarningCircle, color = APROVA.blue }: { text: string; icon?: PhosphorIcon; color?: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl p-4" style={{ background: color + "0f", border: `1px solid ${color}22` }}>
      <Icon size={18} weight="fill" color={color} className="mt-0.5 shrink-0" />
      <p className="text-[12.5px] leading-relaxed" style={{ color: APROVA.ink }}>{text}</p>
    </div>
  )
}
