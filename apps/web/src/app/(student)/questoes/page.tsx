"use client"

import { useState, useEffect } from "react"
import { Eye, Clock, EyeOff, Bookmark, Zap, Check, BookOpen } from "lucide-react"
import Link from "next/link"
import { BRAND } from "@/components/navigation/StudentChrome"
import { FilterChips, AnimatedProgressBar, showToast } from "@/components/student/StudentSurface"
import { QUESTIONS, SESSION_STATE, type Question } from "@/lib/mock-data"

type ViewMode = "standard" | "timer" | "hidden"
type Phase = "unanswered" | "correct" | "wrong"

const DIFFICULTY_COLORS: Record<string, string> = {
  Fácil: "#0F6E56",
  Médio: "#D97706",
  Difícil: "#D14000",
}

function SessionProgress({ current, total, pts, correct }: { current: number; total: number; pts: number; correct: number }) {
  const [barPct, setBarPct] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setBarPct((current / total) * 100), 150)
    return () => clearTimeout(t)
  }, [current, total])

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-[500] uppercase tracking-wide text-[#AAAAAA]">Questão</span>
          <span className="text-[22px] font-black text-[#111] leading-none">{current}</span>
          <span className="text-[12px] text-[#AAAAAA]">de {total}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-[800]" style={{ background: "#FFF8E1", color: "#CC7A00" }}>
            <Zap size={11} /> +{pts} pts
          </span>
          <span className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-[800]" style={{ background: "#ECFDF5", color: "#0F6E56" }}>
            <Check size={11} /> {correct} certas
          </span>
        </div>
      </div>
      <div className="w-full rounded-full overflow-hidden" style={{ height: 4, background: "#F0F0F0" }}>
        <div className="h-full rounded-full" style={{ width: `${barPct}%`, background: BRAND, transition: "width 0.6s ease" }} />
      </div>
    </div>
  )
}

function QuestionCard({ question, onCorrect, onWrong }: { question: Question; onCorrect: (pts: number) => void; onWrong: () => void }) {
  const [selected, setSelected] = useState<string | null>(null)
  const [phase, setPhase] = useState<Phase>("unanswered")

  const ptsByDiff: Record<string, number> = { Fácil: 10, Médio: 15, Difícil: 25 }
  const pts = ptsByDiff[question.difficulty] ?? 10
  const diffColor = DIFFICULTY_COLORS[question.difficulty] ?? "#888"

  const handleSelect = (id: string) => {
    if (phase !== "unanswered") return
    setSelected(id)
    if (id === question.correctId) { setPhase("correct"); onCorrect(pts) }
    else { setPhase("wrong"); onWrong() }
  }

  return (
    <div className="rounded-[18px] border border-[#EBEBEB] bg-white overflow-hidden">
      <div className="h-1" style={{ background: question.subjectColor }} />
      <div className="p-4">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="rounded-[6px] px-2 py-0.5 text-[10px] font-[800] uppercase" style={{ background: "#EFF4FF", color: BRAND }}>{question.subject}</span>
          <span className="rounded-[6px] px-2 py-0.5 text-[10px] font-[700] bg-[#F5F5F5] text-[#666]">{question.bank}</span>
          <span className="flex items-center gap-1 text-[10px] font-[700]" style={{ color: diffColor }}>
            <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: diffColor }} />
            {question.difficulty}
          </span>
          <span className="text-[11px] text-[#AAAAAA] ml-auto">{question.year}</span>
          <button className="text-[10px] text-[#AAAAAA] hover:text-[#666]">Reportar erro</button>
        </div>

        <p className="text-[13px] leading-[1.7] text-[#111] mb-4 pl-3" style={{ borderLeft: `3px solid ${question.subjectColor}` }}>
          {question.context}
        </p>

        <div className="flex flex-col gap-2">
          {question.alternatives.map((alt) => {
            const isSelected = selected === alt.id
            const isCorrect = alt.id === question.correctId
            const revealed = phase !== "unanswered"

            let bg = "transparent"
            let border = "#EBEBEB"
            let opacity = 1
            let letterBg = "#EFF4FF"
            let letterColor = BRAND
            let letterContent: React.ReactNode = alt.id

            if (revealed) {
              if (isCorrect) {
                bg = "#ECFDF5"; border = "#0F6E56"; letterBg = "#0F6E56"; letterColor = "white"; letterContent = "✓"
              } else if (isSelected) {
                bg = "#FFF4F0"; border = "#D14000"; letterBg = "#D14000"; letterColor = "white"; letterContent = "✗"
              } else {
                opacity = 0.35
              }
            }

            return (
              <button
                key={alt.id}
                onClick={() => handleSelect(alt.id)}
                disabled={revealed}
                className="flex items-center gap-3 w-full rounded-[12px] border px-3 py-2.5 text-left transition-all duration-150"
                style={{ background: bg, borderColor: border, opacity, cursor: revealed ? "default" : "pointer" }}
                onMouseEnter={(e) => { if (!revealed) { e.currentTarget.style.borderColor = BRAND; e.currentTarget.style.background = "#F5F8FF" } }}
                onMouseLeave={(e) => { if (!revealed) { e.currentTarget.style.borderColor = "#EBEBEB"; e.currentTarget.style.background = "transparent" } }}
              >
                <span className="flex-shrink-0 flex items-center justify-center rounded-[8px] text-[11px] font-[900]" style={{ width: 26, height: 26, background: letterBg, color: letterColor }}>
                  {letterContent}
                </span>
                <span className="text-[13px] font-[500] text-[#111]">{alt.text}</span>
              </button>
            )
          })}
        </div>

        {phase !== "unanswered" && (
          <div
            className="mt-4 rounded-[12px] p-3"
            style={{ background: phase === "correct" ? "#ECFDF5" : "#FFF4F0", borderLeft: `3px solid ${phase === "correct" ? "#0F6E56" : "#D14000"}`, animation: "slideUp 0.3s ease" }}
          >
            {phase === "correct" ? (
              <>
                <p className="text-[13px] font-[700] text-[#0F6E56]">Essa você soube. +{pts} pts ✓</p>
                <p className="text-[11px] text-[#888] mt-0.5">Continue no ritmo.</p>
              </>
            ) : (
              <>
                <p className="text-[13px] font-[700] text-[#D14000]">Não dessa vez.</p>
                <p className="text-[11px] text-[#888] mt-0.5">A {question.correctId} era a correta — fica ligado. Essa cai de novo.</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function SessionResult({ pts, correct, total, onRestart }: { pts: number; correct: number; total: number; onRestart: () => void }) {
  const pct = Math.round((correct / total) * 100)
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-[22px] bg-[#111] p-6 text-center">
        <p className="text-[12px] font-[700] uppercase tracking-wide mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>Sessão encerrada</p>
        <p className="text-[52px] font-black leading-none" style={{ color: pct >= 70 ? "#4ADE80" : pct >= 40 ? "#FCD34D" : "#F87171" }}>{pct}%</p>
        <p className="text-[14px] mt-2" style={{ color: "rgba(255,255,255,0.6)" }}>{correct} de {total} acertos · +{pts} pts ganhos</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-[14px] border border-[#EBEBEB] bg-white p-4 text-center">
          <p className="text-[28px] font-black text-[#0F6E56]">{correct}</p>
          <p className="text-[11px] text-[#888] mt-1">Acertos</p>
        </div>
        <div className="rounded-[14px] border border-[#EBEBEB] bg-white p-4 text-center">
          <p className="text-[28px] font-black text-[#D14000]">{total - correct}</p>
          <p className="text-[11px] text-[#888] mt-1">Erros</p>
        </div>
      </div>
      <button onClick={onRestart} className="w-full rounded-full py-3.5 text-[14px] font-black text-white" style={{ background: BRAND }}>
        Nova sessão
      </button>
      <Link href="/dashboard" className="w-full rounded-full py-3 text-[14px] font-[700] text-center border block" style={{ borderColor: BRAND, color: BRAND }}>
        Voltar para o início
      </Link>
    </div>
  )
}

export default function QuestoesPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("standard")
  const [filters, setFilters] = useState([
    { id: "lp", label: "Língua Portuguesa", color: "#185FA5" },
    { id: "unesp", label: "UNESP" },
  ])
  const [currentIdx, setCurrentIdx] = useState(SESSION_STATE.current - 1)
  const [pts, setPts] = useState(SESSION_STATE.pts)
  const [correct, setCorrect] = useState(SESSION_STATE.correct)
  const [cardKey, setCardKey] = useState(0)
  const [phase, setPhase] = useState<Phase>("unanswered")
  const [sessionDone, setSessionDone] = useState(false)
  const total = SESSION_STATE.total

  const question = QUESTIONS[currentIdx % QUESTIONS.length]

  const handleCorrect = (earnedPts: number) => { setPts((p) => p + earnedPts); setCorrect((c) => c + 1); setPhase("correct") }
  const handleWrong = () => setPhase("wrong")
  const handleNext = () => {
    if (currentIdx + 1 >= total) { setSessionDone(true); return }
    setCurrentIdx((i) => i + 1); setPhase("unanswered"); setCardKey((k) => k + 1)
  }
  const handleRestart = () => { setCurrentIdx(0); setPts(0); setCorrect(0); setPhase("unanswered"); setCardKey((k) => k + 1); setSessionDone(false) }

  const viewModes = [
    { mode: "standard" as ViewMode, Icon: Eye, title: "Modo padrão" },
    { mode: "timer" as ViewMode, Icon: Clock, title: "Modo cronômetro" },
    { mode: "hidden" as ViewMode, Icon: EyeOff, title: "Ocultar gabarito" },
  ]

  return (
    <div className="max-w-[760px] mx-auto px-4 pt-5 pb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BookOpen size={20} style={{ color: BRAND }} />
          <h1 className="text-[16px] font-[800] text-[#111]">Banco de Questões</h1>
        </div>
        <div className="flex items-center gap-1">
          {viewModes.map(({ mode, Icon, title }) => (
            <button key={mode} onClick={() => setViewMode(mode)} title={title} className="flex items-center justify-center rounded-[8px] transition-colors" style={{ width: 32, height: 32, background: viewMode === mode ? "rgba(37,99,235,0.1)" : "transparent", color: viewMode === mode ? BRAND : "#888" }}>
              <Icon size={16} />
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <FilterChips chips={filters} onRemove={(id) => setFilters((f) => f.filter((c) => c.id !== id))} onAdd={() => {}} />
      </div>

      {sessionDone ? (
        <SessionResult pts={pts} correct={correct} total={total} onRestart={handleRestart} />
      ) : (
        <div className="flex flex-col gap-4">
          <SessionProgress current={currentIdx + 1} total={total} pts={pts} correct={correct} />
          <div key={cardKey} style={{ animation: "pageIn 0.22s ease" }}>
            <QuestionCard question={question} onCorrect={handleCorrect} onWrong={handleWrong} />
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => showToast("Questão salva", "🔖")} className="flex items-center gap-1.5 text-[12px] font-[600] text-[#888] hover:text-[#111] transition-colors">
              <Bookmark size={14} /> Salvar
            </button>
            {phase !== "unanswered" && (
              <button onClick={handleNext} className="flex-1 rounded-full py-3 text-[14px] font-black text-white transition-opacity hover:opacity-90" style={{ background: BRAND, animation: "slideUp 0.25s ease" }}>
                {currentIdx + 1 >= total ? "Encerrar sessão" : "Próxima →"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
