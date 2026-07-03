"use client"

import { Hammer, Check, ChevronRight } from "lucide-react"
import { BRAND } from "@/components/navigation/StudentChrome"
import { PageTitle, EditorialStats, DarkHeroCard, AnimatedProgressBar, StripeCard } from "@/components/student/StudentSurface"
import { STUDENT, LEVELS, PREVIOUS_MONTHS } from "@/lib/mock-data"

const currentLevel = LEVELS.find((l) => STUDENT.points >= l.min && STUDENT.points <= l.max) ?? LEVELS[0]
const nextLevel = LEVELS[LEVELS.indexOf(currentLevel) + 1]

function IdentityHero() {
  return (
    <DarkHeroCard watermark={STUDENT.tier}>
      {/* Tag */}
      <span
        className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[9px] font-[800] uppercase tracking-wide mb-3"
        style={{ background: "rgba(37,99,235,0.18)", color: "#93B8F8" }}
      >
        IDENTIDADE ATIVA
      </span>

      {/* Icon */}
      <div
        className="flex items-center justify-center rounded-[12px] mb-3"
        style={{ width: 44, height: 44, background: "rgba(255,255,255,0.1)" }}
      >
        <Hammer size={22} style={{ color: "rgba(255,255,255,0.8)" }} />
      </div>

      {/* Title */}
      <h2 className="text-[22px] font-black text-white leading-tight mb-1" style={{ letterSpacing: "-0.5px" }}>
        {STUDENT.monthlyIdentity}
      </h2>
      <p className="text-[12px] mb-4" style={{ color: "rgba(255,255,255,0.45)" }}>
        {STUDENT.monthlyIdentitySubtitle}
      </p>

      {/* Next tier pill */}
      {nextLevel && (
        <span
          className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-[600] mb-4"
          style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)" }}
        >
          {nextLevel.name} · {Math.max(0, nextLevel.min - STUDENT.points)} pts para avançar
        </span>
      )}

      {/* CTA */}
      <button
        className="flex items-center justify-center gap-2 w-full rounded-full py-3 text-[14px] font-black text-white transition-opacity hover:opacity-90"
        style={{ background: BRAND }}
      >
        Refazer check-in →
      </button>
    </DarkHeroCard>
  )
}

function LevelTrail() {
  const currentIdx = LEVELS.indexOf(currentLevel)

  return (
    <div className="rounded-[18px] border border-[#EBEBEB] bg-white p-4">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[14px] font-[800] text-[#111]">Trilha do mês</p>
        {nextLevel && (
          <span className="rounded-full px-2.5 py-1 text-[10px] font-[700]" style={{ background: "#EFF4FF", color: BRAND }}>
            Próximo: {nextLevel.name}
          </span>
        )}
      </div>

      <div className="relative">
        {/* Vertical connector line */}
        <div
          className="absolute left-5 top-5 bottom-5"
          style={{ width: 2, background: "#EBEBEB", zIndex: 0 }}
        />
        {/* Colored portion */}
        <div
          className="absolute left-5 top-5"
          style={{
            width: 2,
            height: `${Math.min(100, (currentIdx / Math.max(LEVELS.length - 1, 1)) * 100)}%`,
            background: BRAND,
            zIndex: 0,
          }}
        />

        <div className="flex flex-col gap-6 relative">
          {LEVELS.map((level, i) => {
            const isCurrentOrBefore = i <= currentIdx
            const isCurrent = i === currentIdx

            return (
              <div key={level.name} className="flex items-start gap-4 relative">
                {/* Circle */}
                <div
                  className="flex-shrink-0 flex items-center justify-center rounded-full z-10"
                  style={{
                    width: 40,
                    height: 40,
                    border: `2px solid ${isCurrentOrBefore ? BRAND : "#EBEBEB"}`,
                    background: isCurrent ? BRAND : isCurrentOrBefore ? "#EFF4FF" : "white",
                    color: isCurrent ? "white" : isCurrentOrBefore ? BRAND : "#CCCCCC",
                  }}
                >
                  {isCurrentOrBefore ? <Check size={18} /> : <ChevronRight size={16} />}
                </div>

                <div className="flex-1 min-w-0 pb-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-[14px] font-[800]" style={{ color: isCurrentOrBefore ? "#111" : "#CCCCCC" }}>
                      {level.name}
                    </p>
                    {isCurrent && (
                      <span className="rounded-full px-2 py-0.5 text-[9px] font-[800] text-white" style={{ background: BRAND }}>
                        AGORA
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] mb-2" style={{ color: isCurrentOrBefore ? "#888" : "#CCCCCC" }}>
                    {level.min} a {level.max === 9999 ? "∞" : level.max} pts
                  </p>
                  <AnimatedProgressBar
                    pct={isCurrent ? Math.min(100, ((STUDENT.points - level.min) / (level.max - level.min)) * 100) : i < currentIdx ? 100 : 0}
                    color={isCurrentOrBefore ? BRAND : "#EBEBEB"}
                    height={4}
                    background="#F0F0F0"
                    delay={200 + i * 100}
                  />
                  {!isCurrentOrBefore && (
                    <p className="text-[10px] mt-1" style={{ color: "#CCCCCC" }}>{level.min - STUDENT.points} pts necessários</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function PreviousMonths() {
  return (
    <div>
      <p className="text-[13px] font-[800] text-[#111] mb-3">Seus meses anteriores</p>
      <div className="flex flex-col gap-3">
        {PREVIOUS_MONTHS.map((m) => (
          <StripeCard key={m.month} color={m.tierColor}>
            <div className="flex items-start gap-3">
              <div
                className="flex-shrink-0 flex items-center justify-center rounded-[8px] font-black text-white text-[10px]"
                style={{ width: 36, height: 36, background: m.tierColor }}
              >
                {m.tier[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-[13px] font-[800] text-[#111]">{m.identity}</p>
                </div>
                <p className="text-[9px] font-[700] uppercase tracking-wide text-[#AAAAAA] mb-2">{m.label}</p>
                <div className="flex flex-wrap gap-1.5">
                  <span className="rounded-full px-2 py-0.5 text-[10px] font-[700]" style={{ background: "#EFF4FF", color: BRAND }}>
                    {m.pts} pts
                  </span>
                  <span className="rounded-full px-2 py-0.5 text-[10px] font-[700]" style={{ background: "#F0F7FF", color: m.tierColor }}>
                    {m.tier}
                  </span>
                  <span className="rounded-full px-2 py-0.5 text-[10px] font-[700] bg-[#F5F5F5] text-[#888]">
                    Ranking #{m.rank}
                  </span>
                </div>
                {m.delta !== null && (
                  <p className="text-[10px] mt-1.5" style={{ color: m.delta >= 0 ? "#0F6E56" : "#D14000" }}>
                    {m.delta >= 0 ? "+" : ""}{m.delta} pts vs. mês anterior
                  </p>
                )}
              </div>
            </div>
          </StripeCard>
        ))}
      </div>
    </div>
  )
}

export default function TitulosPage() {
  return (
    <div className="max-w-[760px] mx-auto px-4 pt-5 pb-8">
      <div className="flex items-start justify-between mb-4">
        <PageTitle title="Títulos e Evolução" />
        {STUDENT.checkinDone && (
          <span className="flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-[700] mt-1 flex-shrink-0" style={{ background: "#ECFDF5", color: "#0F6E56", border: "1px solid #0F6E56" }}>
            <Check size={11} /> Check-in de julho concluído
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="mb-5">
        <EditorialStats items={[
          { value: STUDENT.tier, label: "tier atual", color: BRAND },
          { value: `${STUDENT.points}`, label: "pontos", color: "#D97706" },
          { value: STUDENT.period, label: "período", color: "#111" },
        ]} />
      </div>

      <div className="flex flex-col gap-5">
        <IdentityHero />
        <LevelTrail />
        <PreviousMonths />
      </div>
    </div>
  )
}
