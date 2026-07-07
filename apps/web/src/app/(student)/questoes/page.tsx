"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import {
  Books, ChartBar, ClockCounterClockwise, EyeSlash, GraduationCap,
  BookmarkSimple, Lightning, Check, X, Prohibit, Warning, CaretDown,
  NotePencil, ArrowRight, Timer, Users, FunnelSimple,
} from "@phosphor-icons/react"
import {
  APROVA, MODULES, BentoCard, NavyCard, Segmented, Chip, ChipRow,
  ProgressBar, PrimaryButton, showToast, faixaColor,
} from "@/components/student/StudentSurface"
import { QUESTIONS, QUESTION_META, type Question } from "@/lib/mock-data"

type Mode = "tutor" | "timer"
type Phase = "unanswered" | "correct" | "wrong"
type StatusFilter = "todas" | "nao-vistas" | "erradas" | "marcadas"

const DIFF_COLOR: Record<string, string> = { Fácil: APROVA.success, Médio: APROVA.gold, Difícil: APROVA.error }
const PTS_BY_DIFF: Record<string, number> = { Fácil: 10, Médio: 15, Difícil: 25 }
const TOTAL = 20

const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
  { key: "todas", label: "Todas" },
  { key: "nao-vistas", label: "Não vistas" },
  { key: "erradas", label: "Refazer erradas" },
  { key: "marcadas", label: "Marcadas" },
]

// ─── Progresso da sessão (segmentos) ───────────────────────────────────────────

function SessionProgress({ results, current, pts }: { results: (boolean | null)[]; current: number; pts: number }) {
  const correct = results.filter((r) => r === true).length
  return (
    <BentoCard className="p-4">
      <div className="mb-2.5 flex items-center justify-between">
        <div className="flex items-baseline gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: APROVA.inkMuted }}>Questão</span>
          <span className="font-display text-[22px] font-extrabold leading-none tabular" style={{ color: APROVA.ink }}>{current}</span>
          <span className="text-[12px]" style={{ color: APROVA.inkMuted }}>de {TOTAL}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-extrabold" style={{ background: "#FFF3DA", color: APROVA.goldDeep }}>
            <Lightning size={12} weight="fill" /> +{pts} pts
          </span>
          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-extrabold" style={{ background: "#E6F8F0", color: APROVA.successDeep }}>
            <Check size={12} weight="bold" /> {correct} certas
          </span>
        </div>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: TOTAL }).map((_, i) => {
          const r = results[i]
          const bg = i === current - 1 ? APROVA.blue : r === true ? APROVA.success : r === false ? APROVA.error : "#E6E9F0"
          return <div key={i} className="h-1.5 flex-1 rounded-full" style={{ background: bg, transition: "background 0.3s ease" }} />
        })}
      </div>
    </BentoCard>
  )
}

// ─── Barra de distribuição por alternativa ─────────────────────────────────────

function DistributionBar({ dist, correctId, selectedId }: { dist: Record<string, number>; correctId: string; selectedId: string | null }) {
  return (
    <div className="mt-4">
      <div className="mb-2 flex items-center gap-1.5">
        <Users size={13} weight="fill" color={APROVA.blue} />
        <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: APROVA.inkMuted }}>Como a turma respondeu</p>
      </div>
      <div className="flex flex-col gap-1.5">
        {Object.entries(dist).map(([alt, pct]) => {
          const isCorrect = alt === correctId
          const isPicked = alt === selectedId
          const color = isCorrect ? APROVA.success : isPicked ? APROVA.error : "#C4CAD6"
          return (
            <div key={alt} className="flex items-center gap-2">
              <span className="w-4 text-[11px] font-extrabold" style={{ color }}>{alt}</span>
              <div className="h-3.5 flex-1 overflow-hidden rounded-full" style={{ background: "#F0F2F7" }}>
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color, transition: "width 0.6s ease" }} />
              </div>
              <span className="w-9 text-right text-[11px] font-bold tabular" style={{ color }}>{pct}%</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Card da questão ───────────────────────────────────────────────────────────

function QuestionCard({
  question, mode, phase, selected, marked, struck,
  onSelect, onStrike, onToggleMark,
}: {
  question: Question
  mode: Mode
  phase: Phase
  selected: string | null
  marked: boolean
  struck: Set<string>
  onSelect: (id: string) => void
  onStrike: (id: string) => void
  onToggleMark: () => void
}) {
  const [showExpl, setShowExpl] = useState(false)
  const meta = QUESTION_META[question.id]
  const diffColor = DIFF_COLOR[question.difficulty] ?? APROVA.inkMuted
  const pts = PTS_BY_DIFF[question.difficulty] ?? 10
  const revealed = mode === "tutor" && phase !== "unanswered"

  return (
    <BentoCard className="overflow-hidden p-0">
      <div className="h-1.5" style={{ background: question.subjectColor }} />
      <div className="p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase" style={{ background: APROVA.blueSoft, color: APROVA.blue }}>{question.subject}</span>
          <span className="rounded-md bg-[#F0F2F7] px-2 py-0.5 text-[10px] font-bold" style={{ color: APROVA.inkMuted }}>{question.bank}</span>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold" style={{ color: diffColor }}>
            <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: diffColor }} /> {question.difficulty}
          </span>
          {meta && <span className="text-[10px]" style={{ color: "#9AA1B0" }}>· {meta.pctCorrect}% acertam</span>}
          <span className="ml-auto text-[11px]" style={{ color: "#9AA1B0" }}>{question.year}</span>
          <button className="inline-flex items-center gap-1 text-[10px] transition-colors hover:text-[#E23030]" style={{ color: "#9AA1B0" }}>
            <Warning size={12} /> Reportar
          </button>
        </div>

        <p className="mb-4 pl-3.5 text-[14px] leading-[1.75]" style={{ color: APROVA.ink, borderLeft: `3px solid ${question.subjectColor}` }}>
          {question.context}
        </p>

        <div className="flex flex-col gap-2.5">
          {question.alternatives.map((alt) => {
            const isSelected = selected === alt.id
            const isCorrect = alt.id === question.correctId
            const isStruck = struck.has(alt.id)
            let bg: string = "#fff", border: string = "#E6E9F0", letterBg: string = APROVA.blueSoft, letterColor: string = APROVA.blue
            let letter: React.ReactNode = alt.id, opacity = 1
            if (revealed) {
              if (isCorrect) { bg = "#EAFbF3"; border = APROVA.success; letterBg = APROVA.success; letterColor = "#fff"; letter = <Check size={13} weight="bold" /> }
              else if (isSelected) { bg = "#FDECEC"; border = APROVA.error; letterBg = APROVA.error; letterColor = "#fff"; letter = <X size={13} weight="bold" /> }
              else opacity = 0.4
            } else if (isSelected) { bg = "#F4F7FF"; border = APROVA.blue }
            if (isStruck && !revealed) opacity = 0.45

            return (
              <div key={alt.id} className="flex items-center gap-2">
                <button
                  onClick={() => onSelect(alt.id)}
                  disabled={revealed}
                  className="flex flex-1 items-center gap-3 rounded-2xl border px-3.5 py-3 text-left transition-all duration-150"
                  style={{ background: bg, borderColor: border, opacity, cursor: revealed ? "default" : "pointer" }}
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[12px] font-black" style={{ background: letterBg, color: letterColor }}>{letter}</span>
                  <span className="text-[13.5px] font-medium" style={{ color: APROVA.ink, textDecoration: isStruck ? "line-through" : undefined }}>{alt.text}</span>
                </button>
                {!revealed && (
                  <button
                    onClick={() => onStrike(alt.id)}
                    title="Riscar alternativa"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors"
                    style={{ color: isStruck ? APROVA.error : "#C4CAD6", background: isStruck ? "#FDECEC" : "transparent" }}
                  >
                    <Prohibit size={16} weight={isStruck ? "fill" : "regular"} />
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {/* pós-resposta Tutor */}
        {revealed && meta && (
          <div style={{ animation: "slideUp 0.3s ease" }}>
            <div className="mt-4 rounded-2xl p-3.5" style={{ background: phase === "correct" ? "#EAFbF3" : "#FDECEC", borderLeft: `3px solid ${phase === "correct" ? APROVA.success : APROVA.error}` }}>
              <p className="text-[13px] font-extrabold" style={{ color: phase === "correct" ? APROVA.successDeep : APROVA.error }}>
                {phase === "correct" ? `Boa! +${pts} pts` : `A resposta certa era a ${question.correctId}.`}
              </p>
            </div>

            <DistributionBar dist={meta.dist} correctId={question.correctId} selectedId={selected} />

            <button onClick={() => setShowExpl((s) => !s)} className="mt-4 flex w-full items-center justify-between rounded-xl bg-[#F6F7FB] px-3.5 py-2.5">
              <span className="text-[12.5px] font-extrabold" style={{ color: APROVA.ink }}>Ver explicação</span>
              <CaretDown size={15} color={APROVA.inkMuted} style={{ transform: showExpl ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
            </button>
            {showExpl && (
              <div className="mt-2 text-[13px] leading-relaxed" style={{ color: "#4A5162", animation: "slideUp 0.2s ease" }}>
                {meta.explanation}
              </div>
            )}

            {phase === "wrong" && meta.lessonId && (
              <Link href="/aulas" className="mt-3 flex items-center gap-2.5 rounded-2xl border border-dashed p-3 transition-colors hover:bg-[#F4F7FF]" style={{ borderColor: APROVA.blue }}>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: APROVA.blueSoft }}>
                  <GraduationCap size={18} weight="duotone" color={APROVA.blue} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-extrabold" style={{ color: APROVA.blue }}>Revisar aula sobre este tópico</p>
                  <p className="truncate text-[11px]" style={{ color: APROVA.inkMuted }}>{meta.lessonTitle}</p>
                </div>
                <ArrowRight size={15} color={APROVA.blue} />
              </Link>
            )}
          </div>
        )}

        {/* rodapé */}
        <div className="mt-4 flex items-center gap-3 border-t pt-3.5" style={{ borderColor: "#F1F3F8" }}>
          <button onClick={onToggleMark} className="inline-flex items-center gap-1.5 text-[12px] font-bold transition-colors" style={{ color: marked ? APROVA.gold : APROVA.inkMuted }}>
            <BookmarkSimple size={15} weight={marked ? "fill" : "regular"} /> {marked ? "Marcada" : "Marcar"}
          </button>
          <button onClick={() => showToast("Anotação salva no seu caderno", "📝")} className="inline-flex items-center gap-1.5 text-[12px] font-bold transition-colors hover:text-[#0A0F1E]" style={{ color: APROVA.inkMuted }}>
            <NotePencil size={15} /> Anotar
          </button>
        </div>
      </div>
    </BentoCard>
  )
}

// ─── Resultado da sessão ───────────────────────────────────────────────────────

function SessionResult({ results, pts, onRestart }: { results: (boolean | null)[]; pts: number; onRestart: () => void }) {
  const answered = results.filter((r) => r !== null).length
  const correct = results.filter((r) => r === true).length
  const pct = answered ? Math.round((correct / answered) * 100) : 0
  return (
    <div className="flex flex-col gap-4">
      <NavyCard halftone="gold" className="text-center">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.16em]" style={{ color: "rgba(255,255,255,0.5)" }}>Sessão encerrada</p>
        <p className="font-display text-[64px] font-bold tabular" style={{ color: faixaColor(pct) }}>{pct}%</p>
        <p className="mt-1 text-[13px]" style={{ color: "rgba(255,255,255,0.65)" }}>{correct} de {answered} acertos · +{pts} pts ganhos</p>
      </NavyCard>
      <div className="grid grid-cols-2 gap-3">
        <BentoCard className="p-4 text-center"><p className="font-display text-[30px] font-extrabold" style={{ color: APROVA.success }}>{correct}</p><p className="mt-1 text-[11px]" style={{ color: APROVA.inkMuted }}>Acertos</p></BentoCard>
        <BentoCard className="p-4 text-center"><p className="font-display text-[30px] font-extrabold" style={{ color: APROVA.error }}>{answered - correct}</p><p className="mt-1 text-[11px]" style={{ color: APROVA.inkMuted }}>Erros</p></BentoCard>
      </div>
      <PrimaryButton full onClick={onRestart}>Nova sessão</PrimaryButton>
      <Link href="/dashboard" className="rounded-full border py-3 text-center text-[13px] font-bold" style={{ borderColor: APROVA.blue, color: APROVA.blue }}>Voltar ao início</Link>
    </div>
  )
}

// ─── Página ────────────────────────────────────────────────────────────────────

export default function QuestoesPage() {
  const [mode, setMode] = useState<Mode>("tutor")
  const [status, setStatus] = useState<StatusFilter>("todas")
  const [filters, setFilters] = useState([
    { id: "lp", label: "Língua Portuguesa" },
    { id: "unesp", label: "UNESP" },
  ])
  const [idx, setIdx] = useState(2)
  const [results, setResults] = useState<(boolean | null)[]>(Array(TOTAL).fill(null).map((_, i) => (i < 2 ? true : null)))
  const [pts, setPts] = useState(20)
  const [phase, setPhase] = useState<Phase>("unanswered")
  const [selected, setSelected] = useState<string | null>(null)
  const [struck, setStruck] = useState<Set<string>>(new Set())
  const [marked, setMarked] = useState<Set<string>>(new Set())
  const [done, setDone] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [sheetOpen, setSheetOpen] = useState(false)

  const question = QUESTIONS[idx % QUESTIONS.length]

  useEffect(() => {
    if (mode !== "timer" || done) return
    const t = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(t)
  }, [mode, done])

  const handleSelect = (id: string) => {
    if (mode === "tutor" && phase !== "unanswered") return
    setSelected(id)
    if (mode === "tutor") {
      const ok = id === question.correctId
      setPhase(ok ? "correct" : "wrong")
      if (ok) setPts((p) => p + (PTS_BY_DIFF[question.difficulty] ?? 10))
      setResults((r) => { const n = [...r]; n[idx] = ok; return n })
    }
  }
  const handleStrike = (id: string) => setStruck((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  const toggleMark = () => setMarked((m) => { const n = new Set(m); n.has(question.id) ? n.delete(question.id) : n.add(question.id); return n })

  const handleNext = () => {
    if (mode === "timer" && selected) setResults((r) => { const n = [...r]; n[idx] = selected === question.correctId; return n })
    if (idx + 1 >= TOTAL) { setDone(true); return }
    setIdx((i) => i + 1); setPhase("unanswered"); setSelected(null); setStruck(new Set())
  }
  const handleRestart = () => {
    setIdx(0); setResults(Array(TOTAL).fill(null)); setPts(0); setPhase("unanswered")
    setSelected(null); setStruck(new Set()); setDone(false); setSeconds(0)
  }

  const resultCount = useMemo(() => 792 - filters.length * 130 - (status !== "todas" ? 200 : 0), [filters, status])
  const canAdvance = mode === "tutor" ? phase !== "unanswered" : selected !== null
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0")
  const ss = String(seconds % 60).padStart(2, "0")

  return (
    <div className="mx-auto max-w-[820px] px-4 pt-5 lg:px-6">
      {/* header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: APROVA.blueSoft }}>
            <Books size={20} weight="duotone" color={APROVA.blue} />
          </div>
          <h1 className="font-display text-[20px] font-extrabold" style={{ color: APROVA.ink }}>Banco de Questões</h1>
        </div>
        <div className="flex items-center gap-3">
          <Segmented<Mode>
            value={mode}
            onChange={(m) => { setMode(m); handleRestart() }}
            options={[{ value: "tutor", label: "Tutor", icon: GraduationCap }, { value: "timer", label: "Cronometrado", icon: Timer }]}
          />
          <div className="hidden items-center gap-1 sm:flex">
            {[ChartBar, ClockCounterClockwise, EyeSlash].map((Ic, i) => (
              <button key={i} className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-[#EEF1F7]" style={{ color: APROVA.inkMuted }}><Ic size={17} /></button>
            ))}
          </div>
        </div>
      </div>

      {/* filtros — mobile: botão único que abre bottom sheet */}
      <div className="mb-4 flex items-center gap-2 sm:hidden">
        <button onClick={() => setSheetOpen(true)} className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-full border border-[#E6E9F0] bg-white px-4 text-[13px] font-bold" style={{ color: APROVA.ink }}>
          <FunnelSimple size={16} weight="bold" color={APROVA.blue} /> Filtros
          <span className="rounded-full px-1.5 py-0.5 text-[10px] font-black text-white" style={{ background: APROVA.blue }}>{filters.length + (status !== "todas" ? 1 : 0)}</span>
        </button>
        <span className="shrink-0 text-[12px] font-bold" style={{ color: APROVA.inkMuted }}>{resultCount}</span>
      </div>

      {/* filtros — desktop inline */}
      <div className="mb-3 hidden items-center gap-2 sm:flex">
        <ChipRow>
          {filters.map((f) => (
            <button key={f.id} onClick={() => setFilters((x) => x.filter((c) => c.id !== f.id))} className="inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-[12px] font-bold" style={{ background: APROVA.blueSoft, color: APROVA.blue, border: `1.5px solid ${APROVA.blue}` }}>
              {f.label} <X size={11} weight="bold" />
            </button>
          ))}
          <button className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[#E6E9F0] bg-white px-3 py-1.5 text-[12px] font-bold" style={{ color: APROVA.inkMuted }}>+ Filtros</button>
        </ChipRow>
        <span className="ml-auto shrink-0 text-[12px] font-bold" style={{ color: APROVA.inkMuted }}>{resultCount} questões</span>
      </div>
      <div className="mb-4 hidden sm:block">
        <ChipRow>
          {STATUS_FILTERS.map((s) => (
            <Chip key={s.key} active={status === s.key} onClick={() => setStatus(s.key)}>{s.label}</Chip>
          ))}
        </ChipRow>
      </div>

      {/* bottom sheet de filtros (mobile) */}
      {sheetOpen && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/50 sm:hidden" onClick={() => setSheetOpen(false)}>
          <div className="w-full rounded-t-[24px] bg-white p-5 pb-8" onClick={(e) => e.stopPropagation()} style={{ animation: "slideUp 0.25s ease" }}>
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[#E6E9F0]" />
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-[17px] font-bold" style={{ color: APROVA.ink }}>Filtros</h3>
              <button onClick={() => setSheetOpen(false)} className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ color: APROVA.inkMuted }}><X size={18} /></button>
            </div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wide" style={{ color: APROVA.inkMuted }}>Ativos</p>
            <div className="mb-4 flex flex-wrap gap-2">
              {filters.length === 0 && <span className="text-[12px]" style={{ color: "#9AA1B0" }}>Nenhum filtro aplicado</span>}
              {filters.map((f) => (
                <button key={f.id} onClick={() => setFilters((x) => x.filter((c) => c.id !== f.id))} className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-[12px] font-bold" style={{ background: APROVA.blueSoft, color: APROVA.blue, border: `1.5px solid ${APROVA.blue}` }}>
                  {f.label} <X size={12} weight="bold" />
                </button>
              ))}
            </div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wide" style={{ color: APROVA.inkMuted }}>Status</p>
            <div className="mb-5 flex flex-wrap gap-2">
              {STATUS_FILTERS.map((s) => (
                <Chip key={s.key} active={status === s.key} onClick={() => setStatus(s.key)}>{s.label}</Chip>
              ))}
            </div>
            <PrimaryButton full onClick={() => setSheetOpen(false)}>Ver {resultCount} questões</PrimaryButton>
          </div>
        </div>
      )}

      {done ? (
        <SessionResult results={results} pts={pts} onRestart={handleRestart} />
      ) : (
        <div className="flex flex-col gap-4">
          {mode === "timer" && (
            <div className="flex items-center justify-center gap-2 rounded-2xl py-2.5" style={{ background: "#FFF3DA" }}>
              <Timer size={16} weight="fill" color={APROVA.goldDeep} />
              <span className="font-display text-[15px] font-extrabold tabular" style={{ color: APROVA.goldDeep }}>{mm}:{ss}</span>
              <span className="text-[11px]" style={{ color: APROVA.goldDeep }}>· feedback ao final</span>
            </div>
          )}
          <SessionProgress results={results} current={idx + 1} pts={pts} />
          <div key={idx} style={{ animation: "pageIn 0.22s ease" }}>
            <QuestionCard
              question={question} mode={mode} phase={phase} selected={selected}
              marked={marked.has(question.id)} struck={struck}
              onSelect={handleSelect} onStrike={handleStrike} onToggleMark={toggleMark}
            />
          </div>
          <div className="sticky bottom-[72px] z-20 -mx-4 border-t border-[#EEF1F7] bg-white/95 px-4 py-3 backdrop-blur lg:static lg:bottom-auto lg:mx-0 lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
            <PrimaryButton full onClick={handleNext} color={canAdvance ? APROVA.blue : "#C4CAD6"}>
              {idx + 1 >= TOTAL ? "Encerrar sessão" : mode === "timer" ? "Próxima questão →" : "Próxima →"}
            </PrimaryButton>
          </div>
        </div>
      )}
    </div>
  )
}
