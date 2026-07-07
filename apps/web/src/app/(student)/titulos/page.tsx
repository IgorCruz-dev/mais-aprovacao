"use client"

import { useState } from "react"
import {
  Check, CaretDown, Hammer, Lock, Sparkle, ArrowRight,
  Plant, Fire, Barbell, Sword, Crown, PencilLine, Exam, Medal as MedalIcon,
} from "@phosphor-icons/react"
import type { Icon as PhosphorIcon } from "@phosphor-icons/react"
import {
  APROVA, BentoCard, NavyCard, PageHeader, SectionTitle, ProgressBar,
} from "@/components/student/StudentSurface"
import { STUDENT, LEVELS, PREVIOUS_MONTHS, TITLES } from "@/lib/mock-data"

const currentLevel = LEVELS.find((l) => STUDENT.points >= l.min && STUDENT.points <= l.max) ?? LEVELS[0]
const currentIdx = LEVELS.indexOf(currentLevel)
const nextLevel = LEVELS[currentIdx + 1]

const TITLE_ICONS: Record<string, PhosphorIcon> = {
  seedling: Plant, flame: Fire, barbell: Barbell, sword: Sword,
  crown: Crown, pen: PencilLine, exam: Exam, medal: MedalIcon,
}

// ─── Emblema customizado ───────────────────────────────────────────────────────

function Emblem({ icon: Icon, color, size = 56, earned = true }: { icon: PhosphorIcon; color: string; size?: number; earned?: boolean }) {
  return (
    <div
      className="relative flex items-center justify-center rounded-2xl"
      style={{
        width: size, height: size,
        background: earned ? `linear-gradient(135deg, ${color}, ${color}99)` : "#EEF1F7",
        boxShadow: earned ? `0 8px 20px -8px ${color}` : undefined,
      }}
    >
      <div className="aprova-halftone pointer-events-none absolute inset-0 rounded-2xl opacity-40" />
      <Icon size={size * 0.5} weight={earned ? "fill" : "regular"} color={earned ? "#fff" : "#B4BAC7"} />
    </div>
  )
}

// ─── Hero de identidade ────────────────────────────────────────────────────────

function IdentityHero() {
  return (
    <NavyCard halftone="blue" watermark={currentLevel.name[0]}>
      <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide" style={{ background: "rgba(255,197,41,0.16)", color: APROVA.gold }}>
        <Sparkle size={12} weight="fill" /> Identidade ativa
      </span>
      <div className="mt-4 flex items-center gap-4">
        <Emblem icon={Hammer} color={currentLevel.color} size={64} />
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: "rgba(255,255,255,0.5)" }}>{currentLevel.name} · {STUDENT.points} pts no mês</p>
          <h2 className="font-display text-[24px] font-bold text-white">{STUDENT.monthlyIdentity}</h2>
        </div>
      </div>
      <p className="mt-3 text-[13px] leading-snug" style={{ color: "rgba(255,255,255,0.65)" }}>{STUDENT.monthlyIdentitySubtitle}</p>

      {nextLevel && (
        <div className="mt-4 flex items-center gap-2 rounded-2xl px-3.5 py-2.5" style={{ background: "rgba(255,255,255,0.06)" }}>
          <ArrowRight size={15} weight="bold" color={APROVA.gold} />
          <span className="text-[12px]" style={{ color: "rgba(255,255,255,0.75)" }}>
            Faltam <span className="font-extrabold text-white">{Math.max(0, nextLevel.min - STUDENT.points)} pts</span> para <span className="font-extrabold" style={{ color: APROVA.gold }}>{nextLevel.name}</span>
          </span>
        </div>
      )}

      <button className="mt-4 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-extrabold" style={{ background: APROVA.gold, color: APROVA.navy }}>
        Refazer check-in <ArrowRight size={14} weight="bold" />
      </button>
    </NavyCard>
  )
}

// ─── Trilha do mês (stepper vertical) ──────────────────────────────────────────

function LevelTrail() {
  return (
    <BentoCard className="h-full">
      <SectionTitle title="Trilha do mês" />
      <div className="relative">
        <div className="absolute bottom-5 left-[19px] top-5 w-0.5" style={{ background: "#EAECF3" }} />
        <div className="absolute left-[19px] top-5 w-0.5" style={{ height: `${(currentIdx / (LEVELS.length - 1)) * 100}%`, background: currentLevel.color, transition: "height 0.8s ease" }} />
        <div className="relative flex flex-col gap-5">
          {LEVELS.map((level, i) => {
            const done = i < currentIdx
            const current = i === currentIdx
            const locked = i > currentIdx
            return (
              <div key={level.name} className="flex items-start gap-3.5">
                <div
                  className="z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                  style={{
                    background: current ? level.color : done ? level.color + "22" : "#fff",
                    border: `2px solid ${locked ? "#EAECF3" : level.color}`,
                    animation: current ? "glowPulse 2.4s ease-in-out infinite" : undefined,
                  }}
                >
                  {done ? <Check size={17} weight="bold" color={level.color} /> : current ? <Sparkle size={17} weight="fill" color="#fff" /> : <Lock size={15} color="#C4CAD6" />}
                </div>
                <div className="min-w-0 flex-1 pb-1">
                  <div className="flex items-center gap-2">
                    <p className="font-display text-[14px] font-extrabold" style={{ color: locked ? "#B4BAC7" : APROVA.ink }}>{level.name}</p>
                    {current && <span className="rounded-full px-2 py-0.5 text-[9px] font-black text-white" style={{ background: level.color }}>AGORA</span>}
                  </div>
                  <p className="text-[11px]" style={{ color: locked ? "#C4CAD6" : APROVA.inkMuted }}>{level.min}–{level.max === 9999 ? "∞" : level.max} pts · {level.motto}</p>
                  {current && (
                    <div className="mt-2">
                      <ProgressBar pct={((STUDENT.points - level.min) / (level.max - level.min)) * 100} color={level.color} height={5} />
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </BentoCard>
  )
}

// ─── Conquistas (títulos com critério visível) ─────────────────────────────────

function Achievements() {
  return (
    <div>
      <SectionTitle title="Conquistas" kicker="Critério sempre visível" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {TITLES.map((t) => {
          const Icon = TITLE_ICONS[t.icon] ?? MedalIcon
          const color = t.earned ? APROVA.gold : APROVA.blue
          const pct = t.earned ? 100 : t.progress && t.target ? Math.min(100, (t.progress / t.target) * 100) : 0
          return (
            <BentoCard key={t.name} className="flex flex-col items-center p-4 text-center">
              <Emblem icon={Icon} color={t.earned ? APROVA.gold : APROVA.blue} size={48} earned={t.earned} />
              <p className="mt-2.5 text-[12.5px] font-extrabold" style={{ color: t.earned ? APROVA.ink : APROVA.inkMuted }}>{t.name}</p>
              <p className="mt-0.5 text-[10.5px] leading-tight" style={{ color: "#9AA1B0" }}>{t.condition}</p>
              {t.earned ? (
                <span className="mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-black uppercase" style={{ background: "#FFF3DA", color: APROVA.goldDeep }}><Check size={9} weight="bold" /> Conquistado</span>
              ) : (
                <div className="mt-2 w-full">
                  <ProgressBar pct={pct} color={color} height={4} />
                  <p className="mt-1 text-[9.5px] font-bold tabular" style={{ color: APROVA.inkMuted }}>{t.progress}/{t.target}</p>
                </div>
              )}
            </BentoCard>
          )
        })}
      </div>
    </div>
  )
}

// ─── Meses anteriores ──────────────────────────────────────────────────────────

function PreviousMonths() {
  const [open, setOpen] = useState<string | null>(null)
  return (
    <div>
      <SectionTitle title="Seus meses anteriores" />
      <div className="flex flex-col gap-3">
        {PREVIOUS_MONTHS.map((m) => {
          const isOpen = open === m.month
          return (
            <BentoCard key={m.month} className="p-0">
              <button onClick={() => setOpen(isOpen ? null : m.month)} className="flex w-full items-center gap-3 p-4 text-left">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-display text-[13px] font-black text-white" style={{ background: m.tierColor }}>{m.tier[0]}</div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-extrabold" style={{ color: APROVA.ink }}>{m.identity}</p>
                  <p className="text-[11px]" style={{ color: APROVA.inkMuted }}>{m.label} · {m.pts} pts · #{m.rank}</p>
                </div>
                <CaretDown size={16} color={APROVA.inkMuted} style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
              </button>
              {isOpen && (
                <div className="grid grid-cols-3 gap-3 border-t px-4 py-3.5" style={{ borderColor: "#F1F3F8", animation: "slideUp 0.2s ease" }}>
                  {[{ l: "Questões", v: m.questions }, { l: "Redações", v: m.essays }, { l: "Simulados", v: m.exams }].map((s) => (
                    <div key={s.l} className="text-center">
                      <p className="font-display text-[20px] font-extrabold tabular" style={{ color: APROVA.ink }}>{s.v}</p>
                      <p className="text-[10px] uppercase tracking-wide" style={{ color: APROVA.inkMuted }}>{s.l}</p>
                    </div>
                  ))}
                </div>
              )}
            </BentoCard>
          )
        })}
      </div>
    </div>
  )
}

export default function TitulosPage() {
  return (
    <div className="mx-auto max-w-[1080px] px-4 pt-5 lg:px-8 lg:pt-7">
      <PageHeader
        title="Títulos e Evolução"
        kicker="Sua jornada"
        action={
          STUDENT.checkinDone ? (
            <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold" style={{ background: "#E6F8F0", color: APROVA.successDeep }}>
              <Check size={12} weight="bold" /> Check-in de julho concluído
            </span>
          ) : undefined
        }
      />

      <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2"><IdentityHero /></div>
        <div className="lg:col-span-1"><LevelTrail /></div>
      </div>

      <div className="mb-6"><Achievements /></div>

      <PreviousMonths />
    </div>
  )
}
