"use client"

import { useState } from "react"
import { Trophy, Calendar, ChevronDown, ChevronUp } from "lucide-react"
import { BRAND } from "@/components/navigation/StudentChrome"
import { PageTitle, EditorialStats, DarkHeroCard, AnimatedProgressBar, SectionTitle } from "@/components/student/StudentSurface"
import { STUDENT, RANKING_PODIUM, RANKING_HISTORY } from "@/lib/mock-data"

function PodiumCard() {
  const first = RANKING_PODIUM[0]
  const second = RANKING_PODIUM[1]
  const third = RANKING_PODIUM[2]

  return (
    <DarkHeroCard>
      <div className="flex items-end justify-center gap-4 mt-2 mb-3">
        {/* 2nd */}
        <div className="flex flex-col items-center gap-1">
          <div
            className="flex items-center justify-center rounded-full font-black text-white text-[14px]"
            style={{ width: 40, height: 40, background: second.color, border: "1.5px solid rgba(255,255,255,0.2)" }}
          >
            {second.initial}
          </div>
          <span className="text-[12px] font-black" style={{ color: "rgba(255,255,255,0.6)" }}>2°</span>
          <p className="text-[11px] font-[800] text-white">{second.name}</p>
          <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.5)" }}>{second.pts} pts</p>
          <div className="w-14 rounded-t-sm" style={{ height: 50, background: "rgba(255,255,255,0.08)" }} />
        </div>

        {/* 1st */}
        <div className="flex flex-col items-center gap-1 -mb-0">
          {/* Crown */}
          <svg width="20" height="16" viewBox="0 0 20 16" fill="none" aria-hidden="true">
            <path d="M2 14L4 6L8 10L10 2L12 10L16 6L18 14H2Z" fill="#D97706" stroke="#F59E0B" strokeWidth="1" />
          </svg>
          <div
            className="flex items-center justify-center rounded-full font-black text-white text-[16px]"
            style={{ width: 56, height: 56, background: first.color, border: `2px solid ${BRAND}` }}
          >
            {first.initial}
          </div>
          <span className="text-[18px] font-black" style={{ color: "#D97706" }}>1°</span>
          <p className="text-[13px] font-[800] text-white">{first.name}</p>
          <p className="text-[11px] font-[700] text-white">{first.pts} pts</p>
          <div className="w-14 rounded-t-sm" style={{ height: 70, background: "rgba(255,255,255,0.08)" }} />
        </div>

        {/* 3rd */}
        <div className="flex flex-col items-center gap-1">
          <div
            className="flex items-center justify-center rounded-full font-black text-white text-[14px]"
            style={{ width: 40, height: 40, background: third.color, border: "1.5px solid rgba(255,255,255,0.2)" }}
          >
            {third.initial}
          </div>
          <span className="text-[12px] font-black" style={{ color: "rgba(255,255,255,0.6)" }}>3°</span>
          <p className="text-[11px] font-[800] text-white">{third.name}</p>
          <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.5)" }}>{third.pts} pts</p>
          <div className="w-14 rounded-t-sm" style={{ height: 40, background: "rgba(255,255,255,0.08)" }} />
        </div>
      </div>
    </DarkHeroCard>
  )
}

function MonthlyHistory() {
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <div>
      <SectionTitle title="Histórico" />
      <div className="mt-3 divide-y divide-[#F0F0F0]">
        {RANKING_HISTORY.map((h) => {
          const isOpen = expanded === h.month
          return (
            <div key={h.month}>
              <button
                className="w-full flex items-center py-3 gap-3 text-left"
                onClick={() => setExpanded(isOpen ? null : h.month)}
              >
                <span className="flex-1 text-[13px] font-[700] text-[#111]">{h.month}</span>
                <span className="text-[12px] text-[#888]">#{h.rank}</span>
                <span className="text-[12px] font-[800]" style={{ color: BRAND }}>{h.pts} pts</span>
                {isOpen ? <ChevronUp size={14} className="text-[#888]" /> : <ChevronDown size={14} className="text-[#888]" />}
              </button>
              {isOpen && (
                <div className="pb-3 pl-2" style={{ animation: "slideUp 0.25s ease" }}>
                  <p className="text-[12px] text-[#666]">Identidade: <span className="font-[700] text-[#111]">{h.identity}</span></p>
                  <p className="text-[12px] text-[#666] mt-0.5">Tier: <span className="font-[700]" style={{ color: BRAND }}>{h.tier}</span></p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function RankingPage() {
  const ptsToTop = RANKING_PODIUM[0].pts - STUDENT.points
  const ptsToPodium = RANKING_PODIUM[2].pts - STUDENT.points

  return (
    <div className="max-w-[760px] mx-auto px-4 pt-5 pb-8">
      <div className="flex items-start justify-between mb-4">
        <PageTitle title="Ranking" />
        <span className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-[700] mt-1" style={{ background: "#EFF4FF", color: BRAND }}>
          <Calendar size={12} /> Julho 2026
        </span>
      </div>

      {/* Stats */}
      <div className="mb-5">
        <EditorialStats items={[
          { value: `#${STUDENT.rank}`, label: "posição", color: BRAND },
          { value: `${STUDENT.points}`, label: "pontos", color: "#D97706" },
        ]} />
      </div>

      {/* Podium */}
      <div className="mb-4">
        <PodiumCard />
      </div>

      {/* My position */}
      <div
        className="rounded-full px-4 py-2.5 text-center text-[12px] font-[700] mb-5"
        style={{ background: "#EFF4FF", color: BRAND }}
      >
        Você está em <strong>#{STUDENT.rank}</strong> com {STUDENT.points} pts —{" "}
        {ptsToPodium > 0 ? `${ptsToPodium} pts para o pódio` : "você está no pódio! 🎉"}
      </div>

      {/* Progress to top */}
      <div className="rounded-[18px] border border-[#EBEBEB] bg-white p-4 mb-5">
        <div className="flex justify-between text-[12px] mb-2">
          <span className="font-[700] text-[#111]">Corrida para o topo</span>
          <span className="font-[700]" style={{ color: BRAND }}>{STUDENT.points} / {RANKING_PODIUM[0].pts} pts</span>
        </div>
        <AnimatedProgressBar pct={(STUDENT.points / RANKING_PODIUM[0].pts) * 100} color={BRAND} height={8} />
        <p className="text-[11px] text-[#888] mt-1.5">Faltam {ptsToTop} pts para o 1° lugar</p>
      </div>

      <MonthlyHistory />
    </div>
  )
}
