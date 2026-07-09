"use client"

import { Lightbulb } from "@phosphor-icons/react"
import type { ClassStatus, StudentRisk, AulaStatus, EssayStatus, TeacherInsight } from "@/lib/mock-teacher-data"
import { cn } from "@/lib/utils"

// Re-export the full ManagerSurface API
export {
  APROVA, BentoCard, NavyCard, PageHeader, SectionTitle, ProgressBar,
  Sparkline, GradientAreaChart, Avatar, Chip, ChipRow,
  Segmented, PrimaryButton, EmptyState, useCountUp, ToastContainer,
  showToast, RevealGroup, RevealItem, AnimatedNumber,
  KpiCard, TrendPill, ManagerStatusBadge, RiskBadge, AlertBanner,
  DataTable, type DataTableColumn,
} from "@/components/manager/ManagerSurface"

import { APROVA } from "@/components/student/StudentSurface"

// ─── TeacherClassBadge ───────────────────────────────────────────────────────

const CLASS_STATUS_MAP: Record<ClassStatus, { bg: string; color: string; label: string }> = {
  ativa:      { bg: "#E6F8F0", color: APROVA.successDeep, label: "Ativa" },
  atencao:    { bg: "#FFF3DA", color: "#B45309",           label: "Atenção" },
  encerrando: { bg: "#F0F2F7", color: APROVA.inkMuted,    label: "Encerrando" },
}

export function TeacherClassBadge({ status }: { status: ClassStatus }) {
  const s = CLASS_STATUS_MAP[status]
  return (
    <span className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold" style={{ background: s.bg, color: s.color }}>
      {s.label}
    </span>
  )
}

// ─── TeacherLessonBadge ──────────────────────────────────────────────────────

const AULA_STATUS_MAP: Record<AulaStatus, { bg: string; color: string; label: string; pulse?: boolean }> = {
  planejada:  { bg: APROVA.blueSoft,  color: APROVA.blue,       label: "Planejada" },
  ao_vivo:    { bg: "#FDECEC",        color: APROVA.error,      label: "Ao vivo", pulse: true },
  concluida:  { bg: "#E6F8F0",        color: APROVA.successDeep, label: "Concluída" },
  cancelada:  { bg: "#F0F2F7",        color: APROVA.inkMuted,   label: "Cancelada" },
}

export function TeacherLessonBadge({ status }: { status: AulaStatus }) {
  const s = AULA_STATUS_MAP[status]
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold" style={{ background: s.bg, color: s.color }}>
      {s.pulse && (
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.color, animation: "glowPulse 1.4s ease infinite" }} />
      )}
      {s.label}
    </span>
  )
}

// ─── TeacherEssayBadge ───────────────────────────────────────────────────────

const ESSAY_STATUS_MAP: Record<EssayStatus, { bg: string; color: string; label: string }> = {
  pendente:    { bg: "#FFF3DA", color: "#B45309",          label: "Pendente" },
  em_correcao: { bg: APROVA.blueSoft, color: APROVA.blue, label: "Em correção" },
  concluida:   { bg: "#E6F8F0", color: APROVA.successDeep, label: "Concluída" },
}

export function TeacherEssayBadge({ status }: { status: EssayStatus }) {
  const s = ESSAY_STATUS_MAP[status]
  return (
    <span className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold" style={{ background: s.bg, color: s.color }}>
      {s.label}
    </span>
  )
}

// ─── StudentAcademicBadge ────────────────────────────────────────────────────

const STUDENT_RISK_MAP: Record<StudentRisk, { bg: string; color: string; label: string }> = {
  otimo:   { bg: "#E6F8F0", color: APROVA.successDeep, label: "Ótimo" },
  atencao: { bg: "#FFF3DA", color: "#B45309",           label: "Atenção" },
  risco:   { bg: "#FDECEC", color: APROVA.error,        label: "Risco" },
}

export function StudentAcademicBadge({ status }: { status: StudentRisk }) {
  const s = STUDENT_RISK_MAP[status]
  return (
    <span className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold" style={{ background: s.bg, color: s.color }}>
      {s.label}
    </span>
  )
}

// ─── EssaySlaIndicator ───────────────────────────────────────────────────────

export function EssaySlaIndicator({ elapsedHours, slaHours }: { elapsedHours: number; slaHours: number }) {
  const overSla = elapsedHours > slaHours
  const nearSla = !overSla && elapsedHours / slaHours >= 0.8
  const color = overSla ? APROVA.error : nearSla ? "#B45309" : APROVA.successDeep
  const bg = overSla ? "#FDECEC" : nearSla ? "#FFF3DA" : "#E6F8F0"
  const label = overSla
    ? `+${elapsedHours - slaHours}h acima do SLA`
    : `${elapsedHours}h / ${slaHours}h`
  return (
    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: bg, color }}>
      {label}
    </span>
  )
}

// ─── TeacherInsightCard ──────────────────────────────────────────────────────

const INSIGHT_TONE_MAP = {
  warning: { bg: "rgba(255,197,41,0.10)", border: "rgba(255,197,41,0.30)", color: "#B45309" },
  error:   { bg: "rgba(226,48,48,0.08)",  border: "rgba(226,48,48,0.25)",  color: APROVA.error },
  success: { bg: "rgba(15,169,104,0.08)", border: "rgba(15,169,104,0.25)", color: APROVA.successDeep },
  info:    { bg: APROVA.blueSoft,          border: "rgba(27,77,228,0.20)",  color: APROVA.blue },
} as const

export function TeacherInsightCard({ insights }: { insights: TeacherInsight[] }) {
  return (
    <div className="flex flex-col gap-2">
      {insights.map((insight) => {
        const t = INSIGHT_TONE_MAP[insight.tone]
        return (
          <div
            key={insight.id}
            className="flex items-start gap-3 rounded-2xl px-3.5 py-3"
            style={{ background: t.bg, border: `1px solid ${t.border}` }}
          >
            <Lightbulb size={16} weight="fill" color={t.color} className="mt-0.5 shrink-0" />
            <p className="min-w-0 flex-1 text-[12.5px] font-semibold" style={{ color: APROVA.ink }}>{insight.text}</p>
            {insight.actionLabel && insight.href && (
              <a href={insight.href} className="shrink-0 text-[11.5px] font-extrabold" style={{ color: t.color }}>
                {insight.actionLabel} →
              </a>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── WeekdayDots ────────────────────────────────────────────────────────────

const DAY_LABELS = ["S", "T", "Q", "Q", "S", "S", "D"]

export function WeekdayDots({ days }: { days: boolean[] }) {
  return (
    <div className="flex items-center gap-1.5">
      {days.map((active, i) => (
        <div key={i} className="flex flex-col items-center gap-1">
          <div
            className="h-3 w-3 rounded-full"
            style={{ background: active ? APROVA.success : "#E2E6EE" }}
          />
          <span className="text-[9px] font-bold" style={{ color: APROVA.inkMuted }}>{DAY_LABELS[i]}</span>
        </div>
      ))}
    </div>
  )
}

// ─── RiskDistRow ────────────────────────────────────────────────────────────

export function RiskDistRow({
  label,
  count,
  total,
  color,
}: {
  label: string
  count: number
  total: number
  color: string
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className="flex items-center gap-3">
      <span className="w-14 text-[12px] font-bold" style={{ color }}>{label}</span>
      <div className="flex-1">
        <div className="h-2 w-full overflow-hidden rounded-full" style={{ background: "#EEF1F7" }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, background: color }}
          />
        </div>
      </div>
      <span className="w-6 text-right text-[12px] font-bold tabular" style={{ color: APROVA.ink }}>{count}</span>
      <span className="w-8 text-right text-[11px]" style={{ color: APROVA.inkMuted }}>{pct}%</span>
    </div>
  )
}

export { cn }
