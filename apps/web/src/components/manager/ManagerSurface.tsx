"use client"

import { useState } from "react"
import type { Icon as PhosphorIcon } from "@phosphor-icons/react"
import { CaretUp, CaretDown } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import {
  APROVA, BentoCard, NavyCard, PageHeader, SectionTitle, ProgressBar,
  Sparkline, GradientAreaChart, Avatar, Chip, ChipRow, Segmented,
  PrimaryButton, EmptyState, useCountUp, ToastContainer, showToast,
  RevealGroup, RevealItem, AnimatedNumber,
} from "@/components/student/StudentSurface"

export {
  APROVA, BentoCard, NavyCard, PageHeader, SectionTitle, ProgressBar,
  Sparkline, GradientAreaChart, Avatar, Chip, ChipRow, Segmented,
  PrimaryButton, EmptyState, useCountUp, ToastContainer, showToast,
  RevealGroup, RevealItem, AnimatedNumber,
}

// ─── KpiCard ─────────────────────────────────────────────────────────────────

export function KpiCard({
  label,
  value,
  unit,
  delta,
  deltaGoodDirection = "up",
  icon: Icon,
  color = APROVA.blue,
  sparklineData,
}: {
  label: string
  value: React.ReactNode
  unit?: string
  delta?: number
  deltaGoodDirection?: "up" | "down"
  icon?: PhosphorIcon
  color?: string
  sparklineData?: number[]
}) {
  return (
    <BentoCard>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: APROVA.inkMuted }}>{label}</p>
          <div className="flex items-baseline gap-1.5">
            <span className="font-display text-[28px] font-bold tabular" style={{ color: APROVA.ink }}>{value}</span>
            {unit && <span className="text-[12px] font-bold" style={{ color: APROVA.inkMuted }}>{unit}</span>}
          </div>
          {typeof delta === "number" && <TrendPill deltaPct={delta} goodDirection={deltaGoodDirection} />}
        </div>
        {Icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl" style={{ background: color + "14" }}>
            <Icon size={20} weight="fill" color={color} />
          </div>
        )}
      </div>
      {sparklineData && sparklineData.length > 1 && (
        <div className="mt-3">
          <Sparkline data={sparklineData} color={color} width={200} height={28} />
        </div>
      )}
    </BentoCard>
  )
}

// ─── TrendPill ───────────────────────────────────────────────────────────────

export function TrendPill({ deltaPct, goodDirection = "up" }: { deltaPct: number; goodDirection?: "up" | "down" }) {
  const positive = deltaPct >= 0
  const isGood = goodDirection === "up" ? positive : !positive
  const color = isGood ? APROVA.success : APROVA.error
  const Icon = positive ? CaretUp : CaretDown
  return (
    <span className="mt-1 inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-bold" style={{ background: color + "14", color }}>
      <Icon size={10} weight="bold" />
      {Math.abs(deltaPct).toFixed(1)}%
    </span>
  )
}

// ─── ManagerStatusBadge ──────────────────────────────────────────────────────

type StatusDomain = "enrollment" | "payment" | "essay" | "event"

const STATUS_MAPS: Record<StatusDomain, Record<string, { bg: string; color: string; label: string }>> = {
  enrollment: {
    active: { bg: "#E6F8F0", color: APROVA.successDeep, label: "Ativa" },
    expired: { bg: "#F0F2F7", color: APROVA.inkMuted, label: "Expirada" },
    cancelled: { bg: "#FDECEC", color: APROVA.error, label: "Cancelada" },
    pending: { bg: "#FFF3DA", color: APROVA.goldDeep, label: "Pendente" },
  },
  payment: {
    paid: { bg: "#E6F8F0", color: APROVA.successDeep, label: "Pago" },
    pending: { bg: "#FFF3DA", color: APROVA.goldDeep, label: "Pendente" },
    failed: { bg: "#FDECEC", color: APROVA.error, label: "Falhou" },
    refunded: { bg: "#F0F2F7", color: APROVA.inkMuted, label: "Reembolsado" },
  },
  essay: {
    pending: { bg: "#FFF3DA", color: APROVA.goldDeep, label: "Aguardando" },
    transcribing: { bg: APROVA.blueSoft, color: APROVA.blue, label: "Transcrevendo" },
    correcting: { bg: APROVA.blueSoft, color: APROVA.blue, label: "Corrigindo" },
    corrected: { bg: "#E6F8F0", color: APROVA.successDeep, label: "Corrigida" },
    seen: { bg: "#F0F2F7", color: APROVA.inkMuted, label: "Vista" },
    error: { bg: "#FDECEC", color: APROVA.error, label: "Erro" },
  },
  event: {
    scheduled: { bg: APROVA.blueSoft, color: APROVA.blue, label: "Agendado" },
    live: { bg: "#FDECEC", color: APROVA.error, label: "Ao vivo" },
    ended: { bg: "#F0F2F7", color: APROVA.inkMuted, label: "Encerrado" },
    cancelled: { bg: "#FDECEC", color: APROVA.error, label: "Cancelado" },
  },
}

export function ManagerStatusBadge({ domain, status }: { domain: StatusDomain; status: string }) {
  const s = STATUS_MAPS[domain][status] ?? { bg: "#F0F2F7", color: APROVA.inkMuted, label: status }
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: s.bg, color: s.color }}>
      {domain === "event" && status === "live" && (
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.color, animation: "glowPulse 1.4s ease infinite" }} />
      )}
      {s.label}
    </span>
  )
}

// ─── RiskBadge ───────────────────────────────────────────────────────────────

const RISK_MAP = {
  baixo: { bg: "#E6F8F0", color: APROVA.successDeep, label: "Baixo" },
  medio: { bg: "#FFF3DA", color: APROVA.goldDeep, label: "Médio" },
  alto: { bg: "#FDECEC", color: APROVA.error, label: "Alto" },
} as const

export function RiskBadge({ level }: { level: keyof typeof RISK_MAP }) {
  const r = RISK_MAP[level]
  return (
    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: r.bg, color: r.color }}>
      {r.label}
    </span>
  )
}

// ─── AlertBanner ─────────────────────────────────────────────────────────────

const ALERT_TONES = {
  warning: { bg: "rgba(255,197,41,0.14)", border: "rgba(255,197,41,0.4)", color: APROVA.goldDeep },
  error: { bg: "rgba(226,48,48,0.12)", border: "rgba(226,48,48,0.35)", color: APROVA.error },
  info: { bg: APROVA.blueSoft, border: "rgba(27,77,228,0.25)", color: APROVA.blue },
} as const

export function AlertBanner({
  tone = "warning",
  text,
  actionLabel,
  href,
}: {
  tone?: keyof typeof ALERT_TONES
  text: string
  actionLabel?: string
  href?: string
}) {
  const t = ALERT_TONES[tone]
  return (
    <div
      className="flex flex-wrap items-center gap-2 rounded-2xl px-4 py-3"
      style={{ background: t.bg, border: `1px solid ${t.border}` }}
    >
      <span className="min-w-0 flex-1 text-[12.5px] font-semibold" style={{ color: APROVA.ink }}>{text}</span>
      {actionLabel && href && (
        <a href={href} className="shrink-0 text-[12px] font-extrabold" style={{ color: t.color }}>
          {actionLabel} →
        </a>
      )}
    </div>
  )
}

// ─── DataTable ───────────────────────────────────────────────────────────────

export interface DataTableColumn<T> {
  key: string
  header: string
  render: (row: T) => React.ReactNode
  className?: string
}

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  pageSize = 10,
  emptyMessage = "Nenhum registro encontrado.",
}: {
  columns: DataTableColumn<T>[]
  rows: T[]
  pageSize?: number
  emptyMessage?: string
}) {
  const [page, setPage] = useState(0)
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize))
  const paged = rows.slice(page * pageSize, page * pageSize + pageSize)

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl py-10 text-center" style={{ background: "#F6F7FB" }}>
        <p className="text-[13px] font-semibold" style={{ color: APROVA.inkMuted }}>{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[12.5px]">
          <thead>
            <tr style={{ borderBottom: "1px solid #EDF0F6" }}>
              {columns.map((c) => (
                <th key={c.key} className={cn("whitespace-nowrap px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wide", c.className)} style={{ color: APROVA.inkMuted }}>
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map((row) => (
              <tr key={row.id} className="transition-colors hover:bg-[#F9FAFC]" style={{ borderBottom: "1px solid #F1F3F8" }}>
                {columns.map((c) => (
                  <td key={c.key} className={cn("whitespace-nowrap px-3 py-3", c.className)}>{c.render(row)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="mt-3 flex items-center justify-between px-1">
          <span className="text-[11.5px]" style={{ color: APROVA.inkMuted }}>
            Página {page + 1} de {totalPages} · {rows.length} registros
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="rounded-full px-3 py-1.5 text-[12px] font-bold disabled:opacity-30"
              style={{ background: "#F0F2F7", color: APROVA.ink }}
            >
              Anterior
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="rounded-full px-3 py-1.5 text-[12px] font-bold disabled:opacity-30"
              style={{ background: "#F0F2F7", color: APROVA.ink }}
            >
              Próxima
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
