"use client"

import { useState } from "react"
import { PenLine, ChevronDown, ChevronUp } from "lucide-react"
import { BRAND } from "@/components/navigation/StudentChrome"
import { PageTitle, StripeCard, StatusBadge, AnimatedProgressBar, DarkEmptyState } from "@/components/student/StudentSurface"
import { ESSAYS, type Essay } from "@/lib/mock-data"

const ESSAY_TYPES = [
  { label: "ENEM · 1000", key: "ENEM" },
  { label: "UFU · 80", key: "UFU" },
  { label: "UEG · 100", key: "UEG" },
  { label: "FUVEST · 50", key: "FUVEST" },
  { label: "VUNESP · 11", key: "VUNESP" },
]

function scoreColor(score: number, max: number) {
  const pct = (score / max) * 100
  return pct >= 70 ? "#0F6E56" : pct >= 50 ? "#D97706" : "#D14000"
}

function EssayCard({ essay }: { essay: Essay }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <StripeCard color="#534AB7" onClick={() => essay.competencies && setExpanded((e) => !e)}>
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-[10px] font-[800] uppercase rounded-[6px] px-1.5 py-0.5" style={{ background: "#EDE9FE", color: "#534AB7" }}>{essay.type}</span>
            <span className="text-[10px] text-[#AAAAAA] ml-auto">{essay.date}</span>
          </div>
          <p className="text-[13px] font-[800] text-[#111] leading-snug mb-1.5">{essay.theme}</p>
          <StatusBadge status={essay.status} />
        </div>

        {essay.score !== undefined && (
          <div className="text-right flex-shrink-0">
            <p className="text-[22px] font-black leading-none" style={{ color: scoreColor(essay.score, essay.maxScore) }}>
              {essay.score}
            </p>
            <p className="text-[10px] text-[#AAAAAA]">/{essay.maxScore}</p>
          </div>
        )}
      </div>

      {essay.score !== undefined && (
        <div className="mt-2">
          <AnimatedProgressBar
            pct={(essay.score / essay.maxScore) * 100}
            color={scoreColor(essay.score, essay.maxScore)}
            height={5}
          />
        </div>
      )}

      {essay.competencies && (
        <div className="mt-2">
          <button
            className="flex items-center gap-1 text-[11px] font-[700]"
            style={{ color: BRAND }}
            onClick={(e) => { e.stopPropagation(); setExpanded((x) => !x) }}
          >
            Ver correção {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>

          {expanded && (
            <div className="mt-3 border-t border-[#F0F0F0] pt-3" style={{ animation: "slideUp 0.25s ease" }}>
              <p className="text-[11px] font-[700] uppercase tracking-wide text-[#AAAAAA] mb-2">Competências</p>
              <div className="flex flex-col gap-2">
                {essay.competencies.map((c) => (
                  <div key={c.c}>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="font-[700] text-[#111]">C{c.c}</span>
                      <span className="font-[800]" style={{ color: scoreColor(c.score, c.maxScore) }}>{c.score}/{c.maxScore}</span>
                    </div>
                    <AnimatedProgressBar pct={(c.score / c.maxScore) * 100} color={scoreColor(c.score, c.maxScore)} height={4} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </StripeCard>
  )
}

export default function RedacoesPage() {
  const [activeType, setActiveType] = useState<string>("ENEM")
  const [sortOrder, setSortOrder] = useState("Mais recente")
  const [statusFilter, setStatusFilter] = useState("Todas as situações")

  const filtered = ESSAYS.filter((e) => e.type === activeType)

  return (
    <div className="max-w-[760px] mx-auto px-4 pt-5 pb-8">
      <PageTitle
        title="Minhas Redações"
        subtitle="Acompanhe envios, correções e notas."
      />

      <button
        className="w-full rounded-full py-3.5 text-[14px] font-black text-white mt-4 mb-5 transition-opacity hover:opacity-90"
        style={{ background: BRAND }}
      >
        ＋ Nova Redação
      </button>

      {/* Type chips */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none mb-3 pb-0.5">
        {ESSAY_TYPES.map(({ label, key }) => (
          <button
            key={key}
            onClick={() => setActiveType(key)}
            className="flex-shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-[700] transition-colors"
            style={{
              background: activeType === key ? "#534AB7" : "#F5F5F5",
              color: activeType === key ? "white" : "#888",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Sort/status filters */}
      <div className="flex gap-2 mb-5">
        {[statusFilter, sortOrder].map((label, i) => (
          <button
            key={i}
            className="flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-[600] text-[#888] border border-[#EBEBEB] bg-white hover:bg-[#F5F5F5] transition-colors"
          >
            {label} <ChevronDown size={12} />
          </button>
        ))}
      </div>

      {/* Essay list */}
      <div className="flex flex-col gap-3">
        {filtered.length === 0 ? (
          <DarkEmptyState
            Icon={PenLine}
            title="Nenhuma redação nesta banca ainda."
            text="Escreva agora e receba correção com notas por competência."
            cta="Escrever agora →"
          />
        ) : (
          filtered.map((essay) => <EssayCard key={essay.id} essay={essay} />)
        )}
      </div>
    </div>
  )
}
