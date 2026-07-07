"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import {
  CaretDown, TrendUp, Target, Books, Exam, PencilLine,
  Warning, ArrowRight,
} from "@phosphor-icons/react"
import type { Icon as PhosphorIcon } from "@phosphor-icons/react"
import {
  APROVA, MODULES, BentoCard, PageHeader, SectionTitle,
  GradientAreaChart, ProgressBar, Sparkline, Chip, ChipRow, HeroMetric, EmptyState, ExpandableChart,
} from "@/components/student/StudentSurface"
import { STUDENT, SUBJECTS_PERFORMANCE, COMPETENCIES, EXAMS, EXAM_SUMMARY, ESSAY_TREND } from "@/lib/mock-data"

type Serie = "questoes" | "simulados" | "redacoes"
type Range = "7d" | "30d" | "90d"

const SERIES: Record<Serie, { label: string; color: string; icon: PhosphorIcon; data: number[]; hero: string; unit?: string }> = {
  questoes: { label: "Questões", color: MODULES.questoes, icon: Books, data: [12, 18, 9, 22, 27, 19, 31], hero: "248", unit: "resolvidas" },
  simulados: { label: "Simulados", color: MODULES.simulados, icon: Exam, data: [...EXAMS].reverse().map((e) => e.score), hero: `${EXAM_SUMMARY.avg}%`, unit: "média" },
  redacoes: { label: "Redações", color: MODULES.redacoes, icon: PencilLine, data: ESSAY_TREND, hero: "780", unit: "última nota" },
}

const compGradient = (pct: number) => (pct >= 80 ? APROVA.success : pct >= 65 ? APROVA.gold : APROVA.error)

function CompBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full" style={{ background: "#F0F2F7" }}>
      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${APROVA.error}, ${APROVA.gold} 55%, ${color})`, transition: "width 0.7s ease" }} />
    </div>
  )
}

export default function DesempenhoPage() {
  const [serie, setSerie] = useState<Serie>("questoes")
  const [range, setRange] = useState<Range>("30d")
  const [essayBank, setEssayBank] = useState("ENEM")

  const s = SERIES[serie]
  const essayAvg = 750, essayLast = 780, essayBest = 780

  // ordenar matérias por prioridade (menor precisão primeiro)
  const subjects = useMemo(() => {
    return [...SUBJECTS_PERFORMANCE]
      .map((x) => ({ ...x, pct: x.attempts ? (x.correct / x.attempts) * 100 : 0, spark: [x.correct, x.attempts / 8, x.correct * 1.5, x.attempts / 5, x.correct * 2].map((n) => Math.max(1, n)) }))
      .sort((a, b) => a.pct - b.pct)
  }, [])

  return (
    <div className="mx-auto max-w-[1080px] px-4 pt-5 lg:px-8 lg:pt-7">
      <PageHeader
        title="Meu Desempenho"
        kicker="Visão geral"
        subtitle="Onde você está forte, onde priorizar."
        action={<button className="inline-flex items-center gap-1.5 rounded-full border border-[#E6E9F0] bg-white px-3.5 py-2 text-[12px] font-bold" style={{ color: APROVA.ink }}>Julho 2026 <CaretDown size={13} /></button>}
      />

      {/* 5 cards resumo — variados */}
      <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <BentoCard className="lg:col-span-2"><HeroMetric value={`#${STUDENT.rank}`} label="Ranking da turma" size={44} color={APROVA.blue} /><p className="mt-1 text-[11px]" style={{ color: APROVA.inkMuted }}>de {STUDENT.totalStudents} alunos ativos</p></BentoCard>
        <BentoCard><HeroMetric value={STUDENT.points} label="Pontos no mês" size={36} color={APROVA.gold} /></BentoCard>
        <BentoCard><HeroMetric value={`${STUDENT.streak}d`} label="Ofensiva" size={36} color={APROVA.streak} /></BentoCard>
        <BentoCard><HeroMetric value={essayAvg} label="Média redação" size={36} color={APROVA.success} /></BentoCard>
        <BentoCard><HeroMetric value={EXAM_SUMMARY.done} label="Simulados" size={36} color={APROVA.ink} /></BentoCard>
        <BentoCard><HeroMetric value="248" label="Questões" size={36} color={MODULES.questoes} /></BentoCard>
      </div>

      {/* evolução recente */}
      <BentoCard className="mb-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2"><TrendUp size={16} weight="bold" color={s.color} /><SectionTitle title="Evolução recente" /></div>
          <ChipRow>{(["7d", "30d", "90d"] as Range[]).map((r) => <Chip key={r} active={range === r} onClick={() => setRange(r)}>{r}</Chip>)}</ChipRow>
        </div>
        <div className="mb-4"><ChipRow>{(Object.keys(SERIES) as Serie[]).map((k) => <Chip key={k} active={serie === k} onClick={() => setSerie(k)} color={SERIES[k].color}>{SERIES[k].label}</Chip>)}</ChipRow></div>
        <div className="mb-2"><HeroMetric value={s.hero} unit={s.unit} label={s.label} size={40} color={s.color} /></div>
        <ExpandableChart data={s.data} color={s.color}>
          <GradientAreaChart data={s.data} color={s.color} height={140} valueFormat={(v) => (serie === "simulados" ? `${v.toFixed(0)}%` : String(Math.round(v)))} />
        </ExpandableChart>
      </BentoCard>

      {/* redação em profundidade */}
      <BentoCard className="mb-5">
        <div className="mb-3 flex items-center gap-2"><PencilLine size={16} weight="bold" color={MODULES.redacoes} /><SectionTitle title="Redação em profundidade" actionLabel="Ver redações" /></div>
        <div className="mb-4"><ChipRow>{["ENEM", "UFU", "UEG"].map((b) => <Chip key={b} active={essayBank === b} onClick={() => setEssayBank(b)} color={MODULES.redacoes}>{b}</Chip>)}</ChipRow></div>

        {essayBank === "ENEM" ? (
          <>
            <div className="mb-4 grid grid-cols-3 gap-3">
              {[{ l: "Média", v: essayAvg }, { l: "Última", v: essayLast }, { l: "Melhor", v: essayBest }].map((x) => (
                <div key={x.l} className="rounded-2xl bg-[#F6F7FB] p-3 text-center">
                  <p className="font-display text-[24px] font-extrabold tabular" style={{ color: APROVA.ink }}>{x.v}</p>
                  <p className="text-[10px] uppercase tracking-wide" style={{ color: APROVA.inkMuted }}>{x.l} /1000</p>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-2.5">
              {COMPETENCIES.map((c) => {
                const pct = (c.score / c.max) * 100
                return (
                  <div key={c.label}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-[12px] font-bold" style={{ color: APROVA.ink }}>{c.label} · {c.name}</span>
                      <span className="text-[12px] font-extrabold tabular" style={{ color: compGradient(pct) }}>{c.score}/{c.max}</span>
                    </div>
                    <CompBar pct={pct} color={compGradient(pct)} />
                  </div>
                )
              })}
            </div>
          </>
        ) : (
          <EmptyState icon={PencilLine} title={`Sem redações ${essayBank} ainda`} text={`Envie sua primeira redação ${essayBank} para ver a análise por competência aqui.`} cta="Escrever agora" />
        )}
      </BentoCard>

      {/* performance por matéria — ordenado por prioridade */}
      <div>
        <SectionTitle title="Performance por matéria" kicker="Prioridade primeiro" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {subjects.map((sub, i) => (
            <BentoCard key={sub.subject} className="p-4">
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: sub.color }} />
                  <p className="text-[13px] font-extrabold" style={{ color: APROVA.ink }}>{sub.subject}</p>
                </div>
                {i === 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9.5px] font-black uppercase" style={{ background: "#FDECEC", color: APROVA.error }}>
                    <Warning size={10} weight="fill" /> Prioridade de estudo
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <ProgressBar pct={sub.pct} color={sub.color} height={6} />
                  <p className="mt-1 text-[10.5px]" style={{ color: APROVA.inkMuted }}>{sub.attempts} tentativas · {sub.correct} acertos</p>
                </div>
                <Sparkline data={sub.spark} color={sub.color} />
                <span className="w-11 text-right font-display text-[17px] font-extrabold tabular" style={{ color: sub.color }}>{sub.pct.toFixed(0)}%</span>
              </div>
              {i === 0 && (
                <Link href="/questoes" className="mt-3 inline-flex items-center gap-1.5 text-[11.5px] font-bold" style={{ color: APROVA.blue }}>
                  <Target size={13} weight="fill" /> Treinar {sub.subject} agora <ArrowRight size={11} weight="bold" />
                </Link>
              )}
            </BentoCard>
          ))}
        </div>
      </div>
    </div>
  )
}
