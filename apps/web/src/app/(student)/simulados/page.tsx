"use client"

import { useState } from "react"
import { FileText, TrendingUp, X } from "lucide-react"
import { BRAND } from "@/components/navigation/StudentChrome"
import { PageTitle, EditorialStats, StripeCard, AnimatedProgressBar, InlineSVGChart, SectionTitle, DarkEmptyState } from "@/components/student/StudentSurface"
import { EXAMS, STUDENT } from "@/lib/mock-data"

const BANKS = ["Todas", "ENEM", "UFU", "UEG", "UFG", "UNESP"]

function scoreColor(s: number) {
  return s >= 60 ? "#0F6E56" : s >= 30 ? "#D97706" : "#D14000"
}

function ScoreDelta({ current, prev }: { current: number; prev: number | undefined }) {
  if (prev === undefined) return null
  const diff = current - prev
  if (Math.abs(diff) < 0.1) return <span className="text-[9px] text-[#888]">= anterior</span>
  return (
    <span className="text-[9px] font-[700]" style={{ color: diff > 0 ? "#0F6E56" : "#D14000" }}>
      {diff > 0 ? "+" : ""}{diff.toFixed(1)}pp
    </span>
  )
}

function NewExamModal({ onClose }: { onClose: () => void }) {
  const [bank, setBank] = useState("ENEM")
  const [qty, setQty] = useState(10)

  return (
    <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-t-[22px] lg:rounded-[22px] bg-white p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[18px] font-black text-[#111]">Novo Simulado</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-[#888] hover:bg-[#F5F5F5]">
            <X size={16} />
          </button>
        </div>

        <div className="mb-5">
          <p className="text-[11px] font-[700] uppercase tracking-wide text-[#AAAAAA] mb-2">Banca</p>
          <div className="flex flex-wrap gap-2">
            {["ENEM", "UFU", "UEG", "UFG", "UNESP"].map((b) => (
              <button
                key={b}
                onClick={() => setBank(b)}
                className="rounded-full px-3 py-1.5 text-[12px] font-[700] transition-colors"
                style={{
                  background: bank === b ? BRAND : "#F5F5F5",
                  color: bank === b ? "white" : "#888",
                }}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <p className="text-[11px] font-[700] uppercase tracking-wide text-[#AAAAAA] mb-2">Questões: {qty}</p>
          <input
            type="range" min={5} max={30} step={5} value={qty}
            onChange={(e) => setQty(Number(e.target.value))}
            className="w-full accent-[#2563EB]"
          />
          <div className="flex justify-between text-[10px] text-[#AAAAAA] mt-1">
            <span>5</span><span>10</span><span>15</span><span>20</span><span>25</span><span>30</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full rounded-full py-3.5 text-[14px] font-black text-white"
          style={{ background: BRAND }}
        >
          Iniciar Simulado
        </button>
      </div>
    </div>
  )
}

export default function SimuladosPage() {
  const [activeBank, setActiveBank] = useState("Todas")
  const [showModal, setShowModal] = useState(false)

  const filtered = activeBank === "Todas" ? EXAMS : EXAMS.filter((e) => e.bank === activeBank)
  const scores = EXAMS.map((e) => e.score)
  const avgScore = EXAMS.reduce((a, b) => a + b.score, 0) / EXAMS.length
  const bestScore = Math.max(...scores)

  const bankStats = ["UFG", "ENEM", "UFU", "UEG"].map((b) => {
    const ebs = EXAMS.filter((e) => e.bank === b)
    const avg = ebs.length ? ebs.reduce((a, c) => a + c.score, 0) / ebs.length : 0
    return { bank: b, avg, count: ebs.length, questions: ebs.length * 8 }
  })

  return (
    <div className="max-w-[760px] mx-auto px-4 pt-5 pb-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <PageTitle title="Simulados" />
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-[700] mt-2"
            style={{ background: "#EFF4FF", color: BRAND }}
          >
            🎯 Meta: superar 26.7%
          </span>
        </div>
        <button className="text-[12px] font-[600] text-[#AAAAAA] hover:text-[#111] mt-2">
          Histórico
        </button>
      </div>

      <button
        onClick={() => setShowModal(true)}
        className="w-full rounded-full py-3.5 text-[14px] font-black text-white mb-5 transition-opacity hover:opacity-90"
        style={{ background: BRAND }}
      >
        ＋ Novo Simulado
      </button>

      {/* Stats */}
      <div className="mb-5">
        <EditorialStats items={[
          { value: String(EXAMS.length), label: "simulados", color: "#111" },
          { value: `${avgScore.toFixed(1)}%`, label: "média geral", color: "#D14000", sub: "↑ meta: 26.7%" },
          { value: `${bestScore.toFixed(1)}%`, label: "recorde", color: "#D97706" },
          { value: `#${STUDENT.rank}`, label: "ranking", color: BRAND },
        ]} />
      </div>

      {/* Bank chips */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none mb-5 pb-0.5">
        {BANKS.map((b) => (
          <button
            key={b}
            onClick={() => setActiveBank(b)}
            className="flex-shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-[700] transition-colors"
            style={{
              background: activeBank === b ? BRAND : "#F5F5F5",
              color: activeBank === b ? "white" : "#888",
            }}
          >
            {b}
          </button>
        ))}
      </div>

      {/* Evolution chart */}
      <div className="rounded-[18px] border border-[#EBEBEB] bg-white p-4 mb-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} style={{ color: BRAND }} />
            <p className="text-[13px] font-[800] text-[#111]">Evolução de Desempenho</p>
          </div>
        </div>
        <InlineSVGChart data={EXAMS.map((e) => e.score)} color={BRAND} height={80} />
        <p className="text-[11px] mt-2" style={{ color: "#0F6E56" }}>
          Tendência de alta — você subiu 3pp nos últimos 3 simulados.
        </p>
      </div>

      {/* Exam list */}
      <div className="mb-5">
        <SectionTitle title="Últimos simulados" actionLabel="Ver todos →" />
        <div className="mt-3 flex flex-col gap-2">
          {filtered.length === 0 ? (
            <DarkEmptyState
              Icon={FileText}
              title="Nenhum simulado nesta banca."
              text="Faça seu primeiro simulado e acompanhe sua evolução."
              cta="Iniciar simulado →"
              onCta={() => setShowModal(true)}
            />
          ) : (
            filtered.map((exam, i) => (
              <StripeCard key={exam.id} color="#D97706">
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-[700] text-[#111]">{exam.title}</p>
                    <p className="text-[10px] text-[#888]">{exam.date} · {exam.duration} · {exam.totalQuestions} questões</p>
                    <div className="mt-1.5">
                      <AnimatedProgressBar pct={exam.score} color={scoreColor(exam.score)} height={3} delay={200 + i * 50} />
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[20px] font-black" style={{ color: scoreColor(exam.score) }}>
                      {exam.score.toFixed(1)}%
                    </p>
                    <ScoreDelta current={exam.score} prev={EXAMS[i + 1]?.score} />
                    <button className="text-[10px] font-[700] block mt-0.5" style={{ color: BRAND }}>Revisar →</button>
                  </div>
                </div>
              </StripeCard>
            ))
          )}
        </div>
      </div>

      {/* Bank breakdown */}
      <div>
        <SectionTitle title="Desempenho por banca" />
        <div className="mt-3 grid grid-cols-2 gap-3">
          {bankStats.map((bs) => (
            <div key={bs.bank} className="rounded-[14px] border border-[#EBEBEB] bg-white p-3">
              <p className="text-[10px] font-[500] uppercase tracking-wide text-[#AAAAAA] mb-1">{bs.bank}</p>
              <p className="text-[22px] font-black mb-1" style={{ color: scoreColor(bs.avg) }}>{bs.avg.toFixed(1)}%</p>
              <p className="text-[9px] text-[#AAAAAA] mb-1.5">{bs.count} simulados · {bs.questions} questões</p>
              <AnimatedProgressBar pct={bs.avg} color={scoreColor(bs.avg)} height={3} />
            </div>
          ))}
        </div>
      </div>

      {showModal && <NewExamModal onClose={() => setShowModal(false)} />}
    </div>
  )
}
