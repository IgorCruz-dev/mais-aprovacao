"use client"

import { useState } from "react"
import {
  Exam, Plus, ClockCounterClockwise, TrendUp, X, Target,
  ChartBar, ArrowRight, Trophy,
} from "@phosphor-icons/react"
import {
  APROVA, MODULES, BentoCard, NavyCard, PageHeader, GoldButton, Chip, ChipRow,
  GradientAreaChart, ProgressBar, SectionTitle, EmptyState, HeroMetric, Avatar, PrimaryButton, ExpandableChart,
} from "@/components/student/StudentSurface"
import { EXAMS, EXAM_STATS, EXAM_SUMMARY, RANKING_PODIUM, RANKING_NEIGHBORS } from "@/lib/mock-data"

const BANKS = ["Todos", "ENEM", "UFU", "UEG", "UFG", "UNESP"]
const scoreColor = (s: number) => (s >= 12 ? APROVA.success : s >= 8 ? APROVA.gold : APROVA.error)

function NewExamModal({ onClose }: { onClose: () => void }) {
  const [bank, setBank] = useState("ENEM")
  const [qty, setQty] = useState(20)
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 lg:items-center" onClick={onClose}>
      <div className="w-full max-w-md rounded-t-[24px] bg-white p-6 lg:rounded-[24px]" onClick={(e) => e.stopPropagation()} style={{ animation: "slideUp 0.25s ease" }}>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-[19px] font-extrabold" style={{ color: APROVA.ink }}>Novo Simulado</h2>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[#F0F2F7]" style={{ color: APROVA.inkMuted }}><X size={16} /></button>
        </div>
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wide" style={{ color: APROVA.inkMuted }}>Banca</p>
        <div className="mb-5 flex flex-wrap gap-2">
          {["ENEM", "UFU", "UEG", "UFG", "UNESP"].map((b) => <Chip key={b} active={bank === b} onClick={() => setBank(b)} color={MODULES.simulados}>{b}</Chip>)}
        </div>
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wide" style={{ color: APROVA.inkMuted }}>Questões: {qty}</p>
        <input type="range" min={5} max={30} step={5} value={qty} onChange={(e) => setQty(Number(e.target.value))} className="mb-6 w-full" style={{ accentColor: MODULES.simulados }} />
        <PrimaryButton full color={MODULES.simulados} onClick={onClose}>Iniciar Simulado</PrimaryButton>
      </div>
    </div>
  )
}

export default function SimuladosPage() {
  const [bank, setBank] = useState("Todos")
  const [modal, setModal] = useState(false)

  const filtered = bank === "Todos" ? EXAMS : EXAMS.filter((e) => e.bank === bank)
  const bankStats = ["UFG", "ENEM", "UFU", "UEG"].map((b) => {
    const list = EXAMS.filter((e) => e.bank === b)
    const avg = list.length ? list.reduce((a, c) => a + c.score, 0) / list.length : 0
    return { bank: b, avg, count: list.length }
  })
  const chronological = [...EXAMS].reverse()

  return (
    <div className="mx-auto max-w-[1080px] px-4 pt-5 lg:px-8 lg:pt-7">
      <PageHeader
        title="Simulados"
        kicker="Prova cronometrada"
        subtitle="Replique as condições reais e acompanhe sua nota estimada."
        action={<GoldButton onClick={() => setModal(true)}><Plus size={16} weight="bold" /> Novo Simulado</GoldButton>}
      />

      {/* meta + histórico */}
      <div className="mb-5 flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold" style={{ background: MODULES.simulados + "18", color: "#B45309" }}>
          <Target size={13} weight="fill" /> Meta do mês: superar 26,7% em ENEM
        </span>
        <button className="ml-auto inline-flex items-center gap-1.5 text-[12px] font-bold" style={{ color: APROVA.inkMuted }}>
          <ClockCounterClockwise size={14} /> Histórico
        </button>
      </div>

      {/* 4 cards resumo (bento) */}
      <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <BentoCard><HeroMetric value={EXAM_SUMMARY.done} label="Realizados" size={40} color={APROVA.ink} /></BentoCard>
        <BentoCard><HeroMetric value={`${EXAM_SUMMARY.avg}%`} label="Média geral" size={40} color={APROVA.error} /><p className="mt-1 text-[11px] font-bold" style={{ color: APROVA.inkMuted }}>turma: {EXAM_SUMMARY.classAvg}%</p></BentoCard>
        <BentoCard><HeroMetric value={`${EXAM_SUMMARY.best}%`} label="Melhor" size={40} color={APROVA.gold} /></BentoCard>
        <BentoCard><HeroMetric value={`#${EXAM_SUMMARY.rank}`} label="Ranking" size={40} color={APROVA.blue} /></BentoCard>
      </div>

      {/* nota estimada ENEM — diferencial */}
      <div className="mb-5">
        <NavyCard halftone="blue" ribbon="Estimativa">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.14em]" style={{ color: APROVA.blueBright }}>Nota estimada no ENEM</p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-display text-[56px] font-bold tabular text-white">{EXAM_SUMMARY.estimatedEnem}</span>
                <span className="text-[14px] font-bold" style={{ color: "rgba(255,255,255,0.5)" }}>/ 1000</span>
              </div>
              <p className="mt-2 max-w-[340px] text-[12px]" style={{ color: "rgba(255,255,255,0.6)" }}>
                Convertida da sua média de acertos para a escala TRI. Suba a média e a estimativa acompanha.
              </p>
            </div>
            <div className="flex items-center gap-6 rounded-2xl px-5 py-4" style={{ background: "rgba(255,255,255,0.06)" }}>
              <div className="text-center">
                <p className="font-display text-[26px] font-extrabold text-white tabular">{EXAM_SUMMARY.avg}%</p>
                <p className="text-[10px] uppercase tracking-wide" style={{ color: "rgba(255,255,255,0.5)" }}>você</p>
              </div>
              <div className="h-10 w-px" style={{ background: "rgba(255,255,255,0.15)" }} />
              <div className="text-center">
                <p className="font-display text-[26px] font-extrabold tabular" style={{ color: APROVA.gold }}>{EXAM_SUMMARY.classAvg}%</p>
                <p className="text-[10px] uppercase tracking-wide" style={{ color: "rgba(255,255,255,0.5)" }}>turma</p>
              </div>
            </div>
          </div>
        </NavyCard>
      </div>

      {/* tabs banca */}
      <div className="mb-5"><ChipRow>{BANKS.map((b) => <Chip key={b} active={bank === b} onClick={() => setBank(b)} color={MODULES.simulados}>{b}</Chip>)}</ChipRow></div>

      {/* bloco duplo: evolução + por banca */}
      <div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <BentoCard>
          <div className="mb-1 flex items-center gap-2"><TrendUp size={16} weight="bold" color={MODULES.simulados} /><SectionTitle title="Evolução de desempenho" /></div>
          <ExpandableChart data={chronological.map((e) => e.score)} color={MODULES.simulados}>
            <GradientAreaChart data={chronological.map((e) => e.score)} color={MODULES.simulados} height={130} labels={chronological.map((_, i) => `#${i + 1}`)} valueFormat={(v) => `${v.toFixed(0)}%`} />
          </ExpandableChart>
          <p className="mt-1 text-[11.5px] font-semibold" style={{ color: APROVA.success }}>Tendência de alta — +3pp nos últimos 3 simulados.</p>
        </BentoCard>
        <BentoCard>
          <div className="mb-3 flex items-center gap-2"><ChartBar size={16} weight="bold" color={MODULES.simulados} /><SectionTitle title="Desempenho por banca" /></div>
          <div className="flex flex-col gap-3">
            {bankStats.map((bs) => (
              <div key={bs.bank}>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-[12px] font-bold" style={{ color: APROVA.ink }}>{bs.bank}</span>
                  <span className="text-[12px] font-extrabold tabular" style={{ color: scoreColor(bs.avg) }}>{bs.avg.toFixed(1)}%</span>
                </div>
                <ProgressBar pct={bs.avg * 5} color={scoreColor(bs.avg)} height={6} />
                <p className="mt-0.5 text-[10px]" style={{ color: "#9AA1B0" }}>{bs.count} simulados</p>
              </div>
            ))}
          </div>
        </BentoCard>
      </div>

      {/* últimos simulados */}
      <div className="mb-5">
        <SectionTitle title="Últimos simulados" actionLabel="Ver todos" />
        {filtered.length === 0 ? (
          <EmptyState icon={Exam} title={`Nenhum simulado ${bank} ainda`} text={`Faça seu primeiro simulado ${bank} e comece a acompanhar sua evolução por banca.`} cta={`Fazer meu primeiro simulado ${bank}`} onCta={() => setModal(true)} />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {filtered.map((exam) => {
              const stats = EXAM_STATS[exam.id]
              return (
                <BentoCard key={exam.id} hover className="flex items-center gap-4 p-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl" style={{ background: MODULES.simulados + "14" }}>
                    <Exam size={22} weight="duotone" color={MODULES.simulados} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-extrabold" style={{ color: APROVA.ink }}>{exam.title}</p>
                    <p className="text-[11px]" style={{ color: APROVA.inkMuted }}>{exam.date} · {exam.duration}</p>
                    {stats && <p className="mt-0.5 text-[11px]" style={{ color: APROVA.inkMuted }}>ENEM ~<span className="font-bold" style={{ color: APROVA.ink }}>{stats.estimatedScore}</span> · turma {stats.classAvg}%</p>}
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-display text-[22px] font-extrabold tabular" style={{ color: scoreColor(exam.score) }}>{exam.score.toFixed(1)}%</p>
                    <button className="inline-flex items-center gap-0.5 text-[11px] font-bold" style={{ color: APROVA.blue }}>Revisar <ArrowRight size={11} weight="bold" /></button>
                  </div>
                </BentoCard>
              )
            })}
          </div>
        )}
      </div>

      {/* ranking geral */}
      <div>
        <div className="mb-3 flex items-center gap-2"><Trophy size={16} weight="fill" color={APROVA.gold} /><SectionTitle title="Ranking geral" /></div>
        <BentoCard className="p-2">
          {RANKING_PODIUM.map((p, i) => (
            <div key={p.rank} className="flex items-center gap-3 px-3 py-2.5" style={{ borderBottom: i < RANKING_PODIUM.length - 1 ? "1px solid #F1F3F8" : undefined }}>
              <span className="w-6 text-center font-display text-[13px] font-black tabular" style={{ color: i === 0 ? APROVA.goldDeep : APROVA.inkMuted }}>{p.rank}</span>
              <Avatar initial={p.initial} color={p.color} size={30} />
              <span className="min-w-0 flex-1 truncate text-[13px] font-bold" style={{ color: APROVA.ink }}>{p.name}</span>
              <span className="text-[12px] font-extrabold tabular" style={{ color: APROVA.inkMuted }}>{p.pts} pts</span>
            </div>
          ))}
          {RANKING_NEIGHBORS.map((n) => (
            <div key={n.rank} className="flex items-center gap-3 rounded-xl px-3 py-2.5" style={{ background: n.isMe ? APROVA.blueSoft : "transparent", border: n.isMe ? `1.5px solid ${APROVA.blue}` : "1px solid transparent", marginTop: n.rank === RANKING_NEIGHBORS[0].rank ? 6 : 0 }}>
              <span className="w-6 text-center font-display text-[13px] font-black tabular" style={{ color: n.isMe ? APROVA.blue : APROVA.inkMuted }}>{n.rank}</span>
              <Avatar initial={n.initial} color={n.color} size={30} />
              <span className="min-w-0 flex-1 truncate text-[13px] font-bold" style={{ color: APROVA.ink }}>{n.name}{n.isMe && <span className="font-semibold" style={{ color: APROVA.blue }}> (você)</span>}</span>
              <span className="text-[12px] font-extrabold tabular" style={{ color: n.isMe ? APROVA.blue : APROVA.inkMuted }}>{n.pts} pts</span>
            </div>
          ))}
        </BentoCard>
      </div>

      {modal && <NewExamModal onClose={() => setModal(false)} />}
    </div>
  )
}
