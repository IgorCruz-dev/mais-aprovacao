"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import type { LucideIcon } from "lucide-react"
import { X } from "lucide-react"
import { BRAND } from "@/components/navigation/StudentChrome"
import { cn } from "@/lib/utils"

// ─── Decoration ─────────────────────────────────────────────────────────────

export function ConcentricDecoration() {
  return (
    <svg
      className="pointer-events-none absolute"
      style={{ top: -16, right: -16, opacity: 0.15 }}
      width={130}
      height={130}
      viewBox="0 0 130 130"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="65" cy="65" r="63" stroke={BRAND} strokeWidth="1.5" />
      <circle cx="65" cy="65" r="39" stroke={BRAND} strokeWidth="1" />
      <circle cx="65" cy="65" r="14" fill={BRAND} />
    </svg>
  )
}

// ─── PageTitle ───────────────────────────────────────────────────────────────

export function PageTitle({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle?: string
  action?: React.ReactNode
}) {
  return (
    <header className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-[28px] font-black leading-tight text-[#111]" style={{ letterSpacing: "-1px" }}>
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-[13px] text-[#AAAAAA]">{subtitle}</p>}
      </div>
      {action}
    </header>
  )
}

// ─── Pill ────────────────────────────────────────────────────────────────────

export function Pill({
  children,
  color = BRAND,
  background = "#EFF4FF",
  border,
  className = "",
  onClick,
}: {
  children: React.ReactNode
  color?: string
  background?: string
  border?: string
  className?: string
  onClick?: () => void
}) {
  return (
    <span
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold",
        onClick && "cursor-pointer",
        className
      )}
      style={{ color, background, border }}
    >
      {children}
    </span>
  )
}

// ─── EditorialStats ──────────────────────────────────────────────────────────

export function EditorialStats({
  items,
  align = "center",
}: {
  items: { value: React.ReactNode; label: string; sub?: string; color?: string }[]
  align?: "center" | "left"
}) {
  return (
    <div className="flex items-stretch overflow-x-auto scrollbar-none">
      {items.map((item, index) => (
        <div key={`${item.label}-${index}`} className="flex shrink-0 items-center">
          <div className={align === "center" ? "min-w-[88px] text-center" : "min-w-[100px] text-left"}>
            <div className="text-[18px] font-black leading-none" style={{ color: item.color ?? "#111" }}>
              {item.value}
            </div>
            <div className="mt-1 text-[9px] font-[500] uppercase tracking-wide text-[#AAAAAA]">{item.label}</div>
            {item.sub && (
              <div className="mt-0.5 text-[9px] font-bold" style={{ color: BRAND }}>
                {item.sub}
              </div>
            )}
          </div>
          {index < items.length - 1 && <div className="mx-3 shrink-0 bg-[#DDDDDD]" style={{ width: 1, height: 22 }} />}
        </div>
      ))}
    </div>
  )
}

// ─── ProgressBar (static) ────────────────────────────────────────────────────

export function ProgressBar({
  pct,
  color = BRAND,
  height = 7,
  background = "#F0F0F0",
}: {
  pct: number
  color?: string
  height?: number
  background?: string
}) {
  const clamped = Math.max(0, Math.min(100, pct))
  return (
    <div className="w-full overflow-hidden rounded-full" style={{ height, background }}>
      <div className="h-full rounded-full" style={{ width: `${clamped}%`, background: color }} />
    </div>
  )
}

// ─── AnimatedProgressBar ─────────────────────────────────────────────────────

export function AnimatedProgressBar({
  pct,
  color,
  height = 7,
  background = "#F0F0F0",
  delay = 100,
}: {
  pct: number
  color?: string
  height?: number
  background?: string
  delay?: number
}) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const t = setTimeout(() => setCurrent(Math.max(0, Math.min(100, pct))), delay)
    return () => clearTimeout(t)
  }, [pct, delay])

  const fillColor =
    color ??
    (current >= 60 ? "#0F6E56" : current >= 30 ? "#D97706" : current > 0 ? "#D14000" : BRAND)

  return (
    <div className="w-full overflow-hidden rounded-full" style={{ height, background }}>
      <div
        className="h-full rounded-full"
        style={{
          width: `${current}%`,
          background: fillColor,
          transition: "width 0.6s ease",
        }}
      />
    </div>
  )
}

// ─── DarkHeroCard ────────────────────────────────────────────────────────────

export function DarkHeroCard({
  children,
  watermark,
  className,
}: {
  children: React.ReactNode
  watermark?: string
  className?: string
}) {
  return (
    <div
      className={cn("relative overflow-hidden rounded-[22px] p-5", className)}
      style={{ background: "#111111" }}
    >
      <ConcentricDecoration />
      {watermark && (
        <div
          className="pointer-events-none select-none absolute bottom-3 right-4 font-black leading-none"
          style={{ fontSize: 80, color: `rgba(37,99,235,0.07)` }}
          aria-hidden="true"
        >
          {watermark}
        </div>
      )}
      <div className="relative z-10">{children}</div>
    </div>
  )
}

// ─── ModuleCard (quick action) ───────────────────────────────────────────────

export function ModuleCard({
  icon: Icon,
  title,
  subtitle,
  color,
  onClick,
}: {
  icon: LucideIcon
  title: string
  subtitle: string
  color: string
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col gap-2 rounded-[18px] p-4 text-left w-full transition-transform duration-150 hover:scale-[1.02] active:scale-[0.97]"
      style={{ background: color }}
    >
      <Icon size={24} className="text-white" />
      <div>
        <p className="text-[14px] font-[800] text-white">{title}</p>
        <p className="text-[11px] text-white/60">{subtitle}</p>
      </div>
    </button>
  )
}

// ─── FilterChips ─────────────────────────────────────────────────────────────

export function FilterChips({
  chips,
  onRemove,
  onAdd,
}: {
  chips: { id: string; label: string; color?: string }[]
  onRemove?: (id: string) => void
  onAdd?: () => void
}) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-none pb-0.5">
      {chips.map((chip) => (
        <div
          key={chip.id}
          className="flex-shrink-0 flex items-center gap-1 rounded-full px-3 py-1.5 text-[12px] font-[700] border"
          style={{
            background: "#EFF4FF",
            borderColor: BRAND,
            color: BRAND,
          }}
        >
          {chip.color && (
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: chip.color }} />
          )}
          {chip.label}
          {onRemove && (
            <button
              onClick={() => onRemove(chip.id)}
              className="ml-0.5 flex items-center justify-center rounded-full hover:bg-blue-200 transition-colors"
              style={{ width: 14, height: 14 }}
            >
              <X size={10} style={{ color: BRAND }} />
            </button>
          )}
        </div>
      ))}
      {onAdd && (
        <button
          onClick={onAdd}
          className="flex-shrink-0 flex items-center gap-1 rounded-full px-3 py-1.5 text-[12px] font-[600] border text-[#888] hover:bg-[#F5F5F5] transition-colors"
          style={{ background: "#F5F5F5", borderColor: "#EBEBEB" }}
        >
          + Filtros
        </button>
      )}
    </div>
  )
}

// ─── SectionTitle ────────────────────────────────────────────────────────────

export function SectionTitle({
  title,
  action,
  actionLabel,
}: {
  title: string
  action?: () => void
  actionLabel?: string
}) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-[13px] font-[800] text-[#111]">{title}</p>
      {action && actionLabel && (
        <button onClick={action} className="text-[12px] font-[700]" style={{ color: BRAND }}>
          {actionLabel}
        </button>
      )}
    </div>
  )
}

// ─── StripeCard ──────────────────────────────────────────────────────────────

export function StripeCard({
  color,
  children,
  className,
  onClick,
}: {
  color: string
  children: React.ReactNode
  className?: string
  onClick?: () => void
}) {
  return (
    <div
      className={cn(
        "relative flex rounded-[14px] border border-[#EBEBEB] bg-white overflow-hidden",
        onClick && "cursor-pointer hover:shadow-sm transition-shadow",
        className
      )}
      onClick={onClick}
    >
      <div className="flex-shrink-0 rounded-l-[14px]" style={{ width: 4, background: color }} />
      <div className="flex-1 min-w-0 p-3">{children}</div>
    </div>
  )
}

// ─── StatusBadge ─────────────────────────────────────────────────────────────

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    Corrigida: { bg: "#ECFDF5", color: "#0F6E56" },
    Aguardando: { bg: "#FFF8E1", color: "#D97706" },
    Enviada: { bg: "#EFF4FF", color: BRAND },
    "Em andamento": { bg: "#EFF4FF", color: BRAND },
    Concluída: { bg: "#ECFDF5", color: "#0F6E56" },
    "Não iniciada": { bg: "#F5F5F5", color: "#888" },
  }
  const style = map[status] ?? { bg: "#F5F5F5", color: "#888" }
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-[700]"
      style={{ background: style.bg, color: style.color }}
    >
      {status}
    </span>
  )
}

// ─── InlineSVGChart ──────────────────────────────────────────────────────────

export function InlineSVGChart({
  data,
  color = BRAND,
  height = 80,
  showLabels = true,
}: {
  data: number[]
  color?: string
  height?: number
  showLabels?: boolean
}) {
  const [drawn, setDrawn] = useState(false)
  const pathRef = useRef<SVGPathElement>(null)
  const [len, setLen] = useState(500)

  useEffect(() => {
    const t = setTimeout(() => setDrawn(true), 150)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (pathRef.current) {
      const l = pathRef.current.getTotalLength()
      if (l > 0) setLen(l)
    }
  })

  if (!data.length) return null

  const W = 300
  const H = height
  const pad = 10
  const minVal = Math.min(...data)
  const maxVal = Math.max(...data)
  const range = maxVal - minVal || 1

  const pts = data.map((v, i) => {
    const x = pad + (i / Math.max(data.length - 1, 1)) * (W - 2 * pad)
    const y = H - pad - ((v - minVal) / range) * (H - 2 * pad)
    return { x, y, v }
  })

  const linePath = pts.reduce((acc, p, i) => acc + (i === 0 ? `M${p.x},${p.y}` : ` L${p.x},${p.y}`), "")
  const areaPath = linePath + ` L${pts[pts.length - 1].x},${H} L${pts[0].x},${H} Z`

  const bestIdx = data.indexOf(Math.max(...data))

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }}>
      <defs>
        <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.12" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Grid lines */}
      {[0.25, 0.5, 0.75].map((f) => (
        <line key={f} x1={pad} y1={pad + f * (H - 2 * pad)} x2={W - pad} y2={pad + f * (H - 2 * pad)} stroke="#F0F0F0" strokeWidth="1" />
      ))}
      {/* Area */}
      <path d={areaPath} fill="url(#areaFill)" />
      {/* Line */}
      <path
        ref={pathRef}
        d={linePath}
        stroke={color}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={len || undefined}
        strokeDashoffset={drawn ? 0 : len || 500}
        style={{ transition: "stroke-dashoffset 0.8s ease" }}
      />
      {/* Points */}
      {pts.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={i === bestIdx ? 5 : 3}
          fill={color}
          opacity={drawn ? 1 : 0}
          style={{ transition: `opacity 0.4s ease ${0.5 + i * 0.05}s` }}
        />
      ))}
      {/* X labels */}
      {showLabels &&
        pts.map((p, i) => (
          <text key={i} x={p.x} y={H - 1} textAnchor="middle" fill="#AAAAAA" fontSize="7" fontFamily="inherit">
            #{i + 1}
          </text>
        ))}
    </svg>
  )
}

// ─── DarkEmptyState ──────────────────────────────────────────────────────────

export function DarkEmptyState({
  Icon,
  title,
  text,
  cta,
  onCta,
}: {
  Icon: LucideIcon
  title: string
  text: string
  cta?: string
  onCta?: () => void
}) {
  return (
    <div className="relative overflow-hidden rounded-[18px] bg-[#111] p-5">
      <ConcentricDecoration />
      <div className="relative z-10">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-[14px] bg-white/10">
          <Icon size={28} className="text-white/30" />
        </div>
        <h3 className="text-[16px] font-[800] text-white leading-tight">{title}</h3>
        <p className="mt-2 text-[12px] text-white/45 leading-relaxed">{text}</p>
        {cta && (
          <button
            onClick={onCta}
            className="mt-4 w-full rounded-full px-4 py-2.5 text-[13px] font-black text-white transition-opacity hover:opacity-90"
            style={{ background: BRAND }}
          >
            {cta}
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Toast ───────────────────────────────────────────────────────────────────

interface ToastItem {
  id: string
  message: string
  icon?: string
}

let globalToastAdd: ((msg: string, icon?: string) => void) | null = null

export function showToast(message: string, icon?: string) {
  globalToastAdd?.(message, icon)
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const addToast = useCallback((message: string, icon?: string) => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { id, message, icon }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000)
  }, [])

  useEffect(() => {
    globalToastAdd = addToast
    return () => { globalToastAdd = null }
  }, [addToast])

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="flex items-center gap-2 rounded-xl px-4 py-3 text-[13px] font-[700] text-white shadow-xl pointer-events-auto"
          style={{ background: "#111", animation: "slideUp 0.3s ease" }}
        >
          {t.icon && <span>{t.icon}</span>}
          {t.message}
        </div>
      ))}
    </div>
  )
}
