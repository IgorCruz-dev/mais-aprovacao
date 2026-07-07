"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import type { Icon as PhosphorIcon } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

// ─── Design tokens (+aprovação) ──────────────────────────────────────────────

export const APROVA = {
  blue: "#1B4DE4",
  blueBright: "#4D7CFF",
  blueSoft: "#E9EEFD",
  gold: "#FFC529",
  goldDeep: "#B78600",
  navy: "#060E27",
  navy2: "#101E45",
  surface: "#F4F6FB",
  ink: "#0A0F1E",
  inkMuted: "#5D6678",
  streak: "#F2600C",
  success: "#0FA968",
  successDeep: "#0A8754",
  error: "#E23030",
} as const

export const MODULES = {
  questoes: "#1B4DE4",
  simulados: "#D97706",
  redacoes: "#6C4BD9",
  aulas: "#0E8A5F",
} as const

export function faixaColor(pct: number) {
  return pct >= 70 ? APROVA.success : pct >= 40 ? APROVA.gold : APROVA.error
}

// ─── useCountUp ──────────────────────────────────────────────────────────────

export function useCountUp(target: number, durationMs = 900, decimals = 0) {
  const [value, setValue] = useState(0)
  const raf = useRef<number | null>(null)
  useEffect(() => {
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / durationMs)
      const eased = 1 - Math.pow(1 - p, 3)
      setValue(target * eased)
      if (p < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => { if (raf.current) cancelAnimationFrame(raf.current) }
  }, [target, durationMs])
  return decimals > 0 ? value.toFixed(decimals) : Math.round(value).toLocaleString("pt-BR")
}

// ─── BentoCard ───────────────────────────────────────────────────────────────

export function BentoCard({
  children,
  className,
  hover = false,
  onClick,
  as = "div",
  style,
}: {
  children: React.ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
  as?: "div" | "button"
  style?: React.CSSProperties
}) {
  const Comp = as
  return (
    <Comp
      onClick={onClick}
      className={cn(
        "aprova-card p-5 text-left",
        hover && "aprova-card-hover cursor-pointer",
        className
      )}
      style={style}
    >
      {children}
    </Comp>
  )
}

// ─── Ribbon (fita diagonal / selo) ───────────────────────────────────────────

export function Ribbon({ label, color = APROVA.gold, textColor = APROVA.navy }: { label: string; color?: string; textColor?: string }) {
  return (
    <div
      className="pointer-events-none absolute -right-11 top-5 rotate-45 px-12 py-1 text-[10px] font-black uppercase tracking-wider shadow-md"
      style={{ background: color, color: textColor }}
    >
      {label}
    </div>
  )
}

// ─── NavyCard (hero escuro com halftone) ─────────────────────────────────────

export function NavyCard({
  children,
  className,
  halftone = "white",
  ribbon,
  ribbonColor,
  watermark,
  style,
}: {
  children: React.ReactNode
  className?: string
  halftone?: "white" | "gold" | "blue" | "none"
  ribbon?: string
  ribbonColor?: string
  watermark?: React.ReactNode
  style?: React.CSSProperties
}) {
  return (
    <div
      className={cn("relative overflow-hidden rounded-[22px] p-5", className)}
      style={{
        background: `radial-gradient(120% 140% at 15% 0%, ${APROVA.navy2} 0%, ${APROVA.navy} 60%)`,
        boxShadow: "0 20px 48px -20px rgba(6,14,39,0.55)",
        ...style,
      }}
    >
      {halftone !== "none" && (
        <div
          className={cn(
            "pointer-events-none absolute inset-0",
            halftone === "white" && "aprova-halftone",
            halftone === "gold" && "aprova-halftone-gold",
            halftone === "blue" && "aprova-halftone-blue"
          )}
          style={{ maskImage: "radial-gradient(120% 120% at 90% 10%, black, transparent 70%)" }}
        />
      )}
      {watermark && (
        <div
          className="pointer-events-none absolute -bottom-6 -right-2 select-none font-black leading-none"
          style={{ fontSize: 150, color: "rgba(255,255,255,0.035)" }}
          aria-hidden
        >
          {watermark}
        </div>
      )}
      {ribbon && <Ribbon label={ribbon} color={ribbonColor ?? APROVA.gold} />}
      <div className="relative z-10">{children}</div>
    </div>
  )
}

// ─── HeroMetric (métrica gigante) ────────────────────────────────────────────

export function HeroMetric({
  value,
  unit,
  label,
  color = APROVA.ink,
  size = 64,
  labelColor,
}: {
  value: React.ReactNode
  unit?: string
  label?: string
  color?: string
  size?: number
  labelColor?: string
}) {
  return (
    <div>
      {label && (
        <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: labelColor ?? APROVA.inkMuted }}>
          {label}
        </p>
      )}
      <div className="flex items-baseline gap-1.5">
        <span className="font-display font-bold tabular" style={{ fontSize: size, color }}>
          {value}
        </span>
        {unit && <span className="text-[15px] font-bold" style={{ color: labelColor ?? APROVA.inkMuted }}>{unit}</span>}
      </div>
    </div>
  )
}

// ─── SectionTitle ────────────────────────────────────────────────────────────

export function SectionTitle({
  title,
  actionLabel,
  onAction,
  kicker,
}: {
  title: string
  actionLabel?: string
  onAction?: () => void
  kicker?: string
}) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <div>
        {kicker && <p className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: APROVA.blue }}>{kicker}</p>}
        <h2 className="font-display text-[17px] font-bold" style={{ color: APROVA.ink }}>{title}</h2>
      </div>
      {actionLabel && (
        <button onClick={onAction} className="shrink-0 text-[12px] font-bold transition-opacity hover:opacity-70" style={{ color: APROVA.blue }}>
          {actionLabel}
        </button>
      )}
    </div>
  )
}

// ─── PageHeader ──────────────────────────────────────────────────────────────

export function PageHeader({
  title,
  subtitle,
  kicker,
  action,
}: {
  title: string
  subtitle?: string
  kicker?: string
  action?: React.ReactNode
}) {
  return (
    <header className="mb-6 flex items-end justify-between gap-4">
      <div className="min-w-0">
        {kicker && <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color: APROVA.blue }}>{kicker}</p>}
        <h1 className="font-display text-[30px] font-bold sm:text-[33px]" style={{ color: APROVA.ink }}>
          {title}
        </h1>
        {subtitle && <p className="mt-2 text-[13px]" style={{ color: APROVA.inkMuted }}>{subtitle}</p>}
      </div>
      {action}
    </header>
  )
}

// ─── ProgressBar ─────────────────────────────────────────────────────────────

export function ProgressBar({
  pct,
  color = APROVA.blue,
  height = 8,
  background = "#EEF1F7",
  glow = false,
  animate = true,
  delay = 120,
}: {
  pct: number
  color?: string
  height?: number
  background?: string
  glow?: boolean
  animate?: boolean
  delay?: number
}) {
  const [w, setW] = useState(animate ? 0 : Math.max(0, Math.min(100, pct)))
  useEffect(() => {
    if (!animate) return
    const t = setTimeout(() => setW(Math.max(0, Math.min(100, pct))), delay)
    return () => clearTimeout(t)
  }, [pct, animate, delay])
  return (
    <div className="w-full overflow-hidden rounded-full" style={{ height, background }}>
      <div
        className="h-full rounded-full"
        style={{
          width: `${w}%`,
          background: color,
          transition: "width 0.7s cubic-bezier(0.22,1,0.36,1)",
          boxShadow: glow ? `0 0 12px ${color}` : undefined,
        }}
      />
    </div>
  )
}

// Alias kept for existing pages that still import it
export const AnimatedProgressBar = ({ pct, color, height, background, delay }: { pct: number; color?: string; height?: number; background?: string; delay?: number }) => (
  <ProgressBar pct={pct} color={color} height={height} background={background} delay={delay} />
)

// ─── MilestoneBar (barra com marcos intermediários) ──────────────────────────

export function MilestoneBar({
  value,
  target,
  milestones,
  color = APROVA.gold,
  height = 14,
}: {
  value: number
  target: number
  milestones: { at: number; label: string }[]
  color?: string
  height?: number
}) {
  const [w, setW] = useState(0)
  const pct = Math.max(0, Math.min(100, (value / target) * 100))
  useEffect(() => {
    const t = setTimeout(() => setW(pct), 200)
    return () => clearTimeout(t)
  }, [pct])
  return (
    <div className="pb-6 pt-1">
      <div className="relative w-full rounded-full" style={{ height, background: "rgba(255,255,255,0.12)" }}>
        <div
          className="h-full rounded-full"
          style={{
            width: `${w}%`,
            background: `linear-gradient(90deg, ${APROVA.goldDeep}, ${color})`,
            transition: "width 0.9s cubic-bezier(0.22,1,0.36,1)",
            boxShadow: `0 0 16px ${color}`,
          }}
        />
        {milestones.map((m) => {
          const left = Math.min(100, (m.at / target) * 100)
          const reached = value >= m.at
          return (
            <div key={m.at} className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2" style={{ left: `${left}%` }}>
              <div
                className="rounded-full border-2"
                style={{
                  width: height + 4,
                  height: height + 4,
                  background: reached ? color : APROVA.navy,
                  borderColor: reached ? color : "rgba(255,255,255,0.35)",
                  boxShadow: reached ? `0 0 10px ${color}` : undefined,
                }}
              />
              <span
                className="absolute left-1/2 top-[calc(100%+4px)] -translate-x-1/2 whitespace-nowrap text-[9px] font-bold uppercase tracking-wide"
                style={{ color: reached ? color : "rgba(255,255,255,0.5)" }}
              >
                {m.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── GradientAreaChart ───────────────────────────────────────────────────────

export function GradientAreaChart({
  data,
  color = APROVA.blue,
  height = 120,
  labels,
  valueFormat = (v: number) => String(Math.round(v)),
}: {
  data: number[]
  color?: string
  height?: number
  labels?: string[]
  valueFormat?: (v: number) => string
}) {
  const [drawn, setDrawn] = useState(false)
  const pathRef = useRef<SVGPathElement>(null)
  const [len, setLen] = useState(600)
  const gid = useRef(`g${Math.random().toString(36).slice(2, 8)}`)

  useEffect(() => {
    const t = setTimeout(() => setDrawn(true), 120)
    return () => clearTimeout(t)
  }, [])
  useEffect(() => {
    if (pathRef.current) {
      const l = pathRef.current.getTotalLength()
      if (l > 0) setLen(l)
    }
  }, [data, height])

  if (!data.length) return null
  const W = 320
  const H = height
  const padX = 8
  const padTop = 16
  const padBottom = labels ? 20 : 10
  const minV = Math.min(...data)
  const maxV = Math.max(...data)
  const range = maxV - minV || 1

  const pts = data.map((v, i) => ({
    x: padX + (i / Math.max(data.length - 1, 1)) * (W - 2 * padX),
    y: padTop + (1 - (v - minV) / range) * (H - padTop - padBottom),
    v,
  }))
  const line = pts.reduce((a, p, i) => a + (i === 0 ? `M${p.x},${p.y}` : ` L${p.x},${p.y}`), "")
  const area = `${line} L${pts[pts.length - 1].x},${H - padBottom} L${pts[0].x},${H - padBottom} Z`
  const last = pts[pts.length - 1]

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }}>
      <defs>
        <linearGradient id={gid.current} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((f) => (
        <line key={f} x1={padX} x2={W - padX} y1={padTop + f * (H - padTop - padBottom)} y2={padTop + f * (H - padTop - padBottom)} stroke="#EEF1F7" strokeWidth="1" />
      ))}
      <path d={area} fill={`url(#${gid.current})`} opacity={drawn ? 1 : 0} style={{ transition: "opacity 0.6s ease 0.3s" }} />
      <path
        ref={pathRef}
        d={line}
        stroke={color}
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={len}
        strokeDashoffset={drawn ? 0 : len}
        style={{ transition: "stroke-dashoffset 0.9s ease" }}
      />
      {/* último ponto com glow + label fixo */}
      <circle cx={last.x} cy={last.y} r="7" fill={color} opacity={drawn ? 0.18 : 0} style={{ transition: "opacity 0.4s ease 0.8s" }} />
      <circle cx={last.x} cy={last.y} r="3.5" fill={color} opacity={drawn ? 1 : 0} style={{ transition: "opacity 0.4s ease 0.8s" }} />
      <g opacity={drawn ? 1 : 0} style={{ transition: "opacity 0.4s ease 1s" }}>
        <rect x={Math.min(last.x - 16, W - 34)} y={last.y - 22} width="32" height="15" rx="5" fill={color} />
        <text x={Math.min(last.x, W - 18)} y={last.y - 11.5} textAnchor="middle" fill="white" fontSize="9" fontWeight="800" fontFamily="inherit">
          {valueFormat(last.v)}
        </text>
      </g>
      {labels &&
        pts.map((p, i) => (
          <text key={i} x={p.x} y={H - 4} textAnchor="middle" fill="#AAB1C0" fontSize="7.5" fontFamily="inherit">
            {labels[i]}
          </text>
        ))}
    </svg>
  )
}

// ─── Sparkline ───────────────────────────────────────────────────────────────

export function Sparkline({ data, color = APROVA.blue, width = 64, height = 22 }: { data: number[]; color?: string; width?: number; height?: number }) {
  if (data.length < 2) return null
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - ((v - min) / range) * (height - 4) - 2
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  const lastX = width
  const lastY = height - ((data[data.length - 1] - min) / range) * (height - 4) - 2
  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lastX} cy={lastY} r="2.2" fill={color} />
    </svg>
  )
}

// ─── ExpandableChart ─────────────────────────────────────────────────────────
// Mobile: sparkline compacta + "ver gráfico" (evita gráfico espremido). Desktop: gráfico completo.

export function ExpandableChart({ data, color, children }: { data: number[]; color?: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const c = color ?? APROVA.blue
  return (
    <>
      <div className="hidden lg:block">{children}</div>
      <div className="lg:hidden">
        {!open ? (
          <button onClick={() => setOpen(true)} className="flex min-h-[52px] w-full items-center justify-between rounded-2xl bg-[#F6F7FB] px-4">
            <Sparkline data={data} color={c} width={130} height={34} />
            <span className="text-[12px] font-bold" style={{ color: c }}>Ver gráfico ↗</span>
          </button>
        ) : (
          <div>
            {children}
            <button onClick={() => setOpen(false)} className="mt-1 text-[12px] font-bold" style={{ color: c }}>Ocultar gráfico</button>
          </div>
        )}
      </div>
    </>
  )
}

// ─── Avatar ──────────────────────────────────────────────────────────────────

export function Avatar({ initial, color = APROVA.blue, size = 36, ring }: { initial: string; color?: string; size?: number; ring?: string }) {
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full font-display font-extrabold text-white"
      style={{ width: size, height: size, background: color, fontSize: size * 0.42, border: ring ? `2.5px solid ${ring}` : undefined }}
    >
      {initial}
    </div>
  )
}

// ─── Medal ───────────────────────────────────────────────────────────────────

const MEDAL_COLORS = ["#F5B428", "#B9C2CF", "#CD8246"]
export function Medal({ place, size = 22 }: { place: 1 | 2 | 3; size?: number }) {
  const c = MEDAL_COLORS[place - 1]
  return (
    <div
      className="flex items-center justify-center rounded-full font-display text-[11px] font-black text-white shadow"
      style={{ width: size, height: size, background: c, boxShadow: `0 2px 8px ${c}66` }}
    >
      {place}
    </div>
  )
}

// ─── StatPill ────────────────────────────────────────────────────────────────

export function StatPill({
  icon: Icon,
  value,
  label,
  iconColor,
  dark = false,
}: {
  icon: PhosphorIcon
  value: React.ReactNode
  label?: string
  iconColor?: string
  dark?: boolean
}) {
  return (
    <div
      className="inline-flex items-center gap-2 rounded-full px-3 py-1.5"
      style={{ background: dark ? "rgba(255,255,255,0.08)" : "#fff", border: dark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #EDF0F6" }}
    >
      <Icon size={16} weight="fill" color={iconColor ?? APROVA.blue} />
      <span className="text-[13px] font-extrabold tabular" style={{ color: dark ? "#fff" : APROVA.ink }}>{value}</span>
      {label && <span className="text-[11px] font-medium" style={{ color: dark ? "rgba(255,255,255,0.55)" : APROVA.inkMuted }}>{label}</span>}
    </div>
  )
}

// ─── Chip / ChipRow ──────────────────────────────────────────────────────────

export function Chip({
  active,
  onClick,
  children,
  color = APROVA.blue,
}: {
  active?: boolean
  onClick?: () => void
  children: React.ReactNode
  color?: string
}) {
  return (
    <button
      onClick={onClick}
      className="shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-[12px] font-bold transition-all duration-150"
      style={{
        background: active ? color : "#fff",
        color: active ? "#fff" : APROVA.inkMuted,
        border: `1.5px solid ${active ? color : "#E6E9F0"}`,
      }}
    >
      {children}
    </button>
  )
}

export function ChipRow({ children }: { children: React.ReactNode }) {
  return <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">{children}</div>
}

// ─── Segmented (toggle grande, ex: Tutor / Cronometrado) ─────────────────────

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string; icon?: PhosphorIcon }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full bg-[#EEF1F7] p-1">
      {options.map((o) => {
        const active = o.value === value
        const Icon = o.icon
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-bold transition-all duration-150"
            style={{ background: active ? "#fff" : "transparent", color: active ? APROVA.blue : APROVA.inkMuted, boxShadow: active ? "0 1px 4px rgba(10,15,30,0.1)" : undefined }}
          >
            {Icon && <Icon size={15} weight={active ? "fill" : "regular"} />}
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

// ─── StatusBadge ─────────────────────────────────────────────────────────────

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    Corrigida: { bg: "#E6F8F0", color: APROVA.successDeep },
    Aguardando: { bg: "#FFF3DA", color: APROVA.goldDeep },
    Enviada: { bg: APROVA.blueSoft, color: APROVA.blue },
    "Em andamento": { bg: APROVA.blueSoft, color: APROVA.blue },
    Concluída: { bg: "#E6F8F0", color: APROVA.successDeep },
    "Não iniciada": { bg: "#F0F2F7", color: APROVA.inkMuted },
  }
  const s = map[status] ?? { bg: "#F0F2F7", color: APROVA.inkMuted }
  return (
    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: s.bg, color: s.color }}>
      {status}
    </span>
  )
}

// ─── EmptyState (navy) ───────────────────────────────────────────────────────

export function EmptyState({
  icon: Icon,
  title,
  text,
  cta,
  onCta,
}: {
  icon: PhosphorIcon
  title: string
  text: string
  cta?: string
  onCta?: () => void
}) {
  return (
    <NavyCard halftone="blue" className="text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: "rgba(255,255,255,0.08)" }}>
        <Icon size={30} weight="duotone" color={APROVA.blueBright} />
      </div>
      <h3 className="font-display text-[17px] font-extrabold text-white">{title}</h3>
      <p className="mx-auto mt-2 max-w-[280px] text-[12.5px] leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>{text}</p>
      {cta && (
        <button
          onClick={onCta}
          className="mt-5 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-extrabold text-white transition-transform hover:scale-[1.03]"
          style={{ background: APROVA.blue }}
        >
          {cta}
        </button>
      )}
    </NavyCard>
  )
}

// ─── PrimaryButton ───────────────────────────────────────────────────────────

export function PrimaryButton({
  children,
  onClick,
  color = APROVA.blue,
  className,
  full = false,
}: {
  children: React.ReactNode
  onClick?: () => void
  color?: string
  className?: string
  full?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-[14px] font-extrabold text-white transition-transform hover:scale-[1.02] active:scale-[0.98]",
        full && "w-full",
        className
      )}
      style={{ background: color, boxShadow: `0 8px 20px -8px ${color}` }}
    >
      {children}
    </button>
  )
}

export function GoldButton({ children, onClick, className, full }: { children: React.ReactNode; onClick?: () => void; className?: string; full?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-[14px] font-extrabold transition-transform hover:scale-[1.02] active:scale-[0.98]",
        full && "w-full",
        className
      )}
      style={{ background: `linear-gradient(120deg, ${APROVA.gold}, #FFB300)`, color: APROVA.navy, boxShadow: `0 8px 20px -8px ${APROVA.gold}` }}
    >
      {children}
    </button>
  )
}

// ─── Toast ───────────────────────────────────────────────────────────────────

interface ToastItem { id: string; message: string; icon?: string }
let globalToastAdd: ((msg: string, icon?: string) => void) | null = null
export function showToast(message: string, icon?: string) { globalToastAdd?.(message, icon) }

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const add = useCallback((message: string, icon?: string) => {
    const id = Math.random().toString(36).slice(2)
    setToasts((p) => [...p, { id, message, icon }])
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3000)
  }, [])
  useEffect(() => { globalToastAdd = add; return () => { globalToastAdd = null } }, [add])
  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[100] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto flex items-center gap-2 rounded-2xl px-4 py-3 text-[13px] font-bold text-white shadow-xl"
          style={{ background: APROVA.navy, animation: "slideUp 0.3s ease" }}
        >
          {t.icon && <span>{t.icon}</span>}
          {t.message}
        </div>
      ))}
    </div>
  )
}
