"use client"

import { useState } from "react"
import { Calendar, Flame, TrendingUp } from "lucide-react"
import { BRAND } from "@/components/navigation/StudentChrome"
import { PageTitle, EditorialStats, InlineSVGChart, AnimatedProgressBar, SectionTitle } from "@/components/student/StudentSurface"
import { STUDENT, SUBJECTS_PERFORMANCE, COMPETENCIES, EXAMS } from "@/lib/mock-data"

type Period = "7d" | "15d" | "30d" | "90d"
type ModuleKey = "questoes" | "simulados" | "redacoes"

const MODULE_CONFIG: Record<ModuleKey, { label: string; color: string }> = {
  questoes: { label: "Questões", color: "#185FA5" },
  simulados: { label: "Simulados", color: "#D97706" },
  redacoes: { label: "Redações", color: "#534AB7" },
}

function compColor(pct: number) {
  return pct >= 75 ? "#0F6E56" : pct >= 60 ? "#D97706" : "#D14000"
}

export default function DesempenhoPage() {
  const [period, setPeriod] = useState<Period>("30d")
  const [activeModules, setActiveModules] = useState<Set<ModuleKey>>(new Set(["questoes", "simulados"]))
  const [essayBank, setEssayBank] = useState("ENEM")

  const toggleModule = (m: ModuleKey) => {
    setActiveModules((prev) => {
      const next = new Set(prev)
      if (next.has(m)) { if (next.size > 1) next.delete(m) }
      else next.add(m)
      return next
    })
  }

  const avgEssay = 750
  const lastEssay = 780
  const bestEssay = 780
  const medianEssay = 750

  const avgScore = EXAMS.reduce((a, b) => a + b.score, 0) / EXAMS.length
  const bestScore = Math.max(...EXAMS.map((e) => e.score))

  return (
    <div className="max-w-[760px] mx-auto px-4 pt-5 pb-8">
      <div className="flex items-start justify-between mb-4">
        <PageTitle title="Meu Desempenho" subtitle="Redações, simulados e hábitos." />
        <span className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-[700] mt-1" style={{ background: "#EFF4FF", color: BRAND }}>
          <Calendar size={12} /> Julho 2026
        </span>
      </div>

      {/* Stats */}
      <div className="mb-5">
        <EditorialStats items={[
          { value: `#${STUDENT.rank}`, label: "ranking", color: BRAND },
          { value: `${STUDENT.points}`, label: "pontos", color: "#D97706", sub: "200 pts p/ Estrategista" },
          { value: String(avgEssay), label: "redação", color: "#0F6E56" },
          { value: String(EXAMS.length), label: "simulados", color: "#111" },
          { value: `${STUDENT.streak}d`, label: "ofensiva", color: "#E84A00" },
        ]} />
      </div>

      {/* Evolution chart */}
      <div className="rounded-[18px] border border-[#EBEBEB] bg-white p-4 mb-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[13px] font-[800] text-[#111]">Evolução Recente</p>
        </div>

        {/* Period chips */}
        <div className="flex gap-2 mb-3 overflow-x-auto scrollbar-none">
          {(["7d", "15d", "30d", "90d"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className="flex-shrink-0 rounded-full px-3 py-1 text-[12px] font-[700] transition-colors"
              style={{ background: period === p ? BRAND : "#F5F5F5", color: period === p ? "white" : "#888" }}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Module type chips */}
        <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-none">
          {(Object.entries(MODULE_CONFIG) as [ModuleKey, { label: string; color: string }][]).map(([key, { label, color }]) => {
            const active = activeModules.has(key)
            return (
              <button
                key={key}
                onClick={() => toggleModule(key)}
                className="flex-shrink-0 flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-[700] transition-colors border"
                style={{
                  background: active ? color : "#F5F5F5",
                  color: active ? "white" : "#888",
                  borderColor: active ? color : "#EBEBEB",
                }}
              >
                <span className="w-2 h-2 rounded-full" style={{ background: active ? "rgba(255,255,255,0.7)" : color }} />
                {label}
              </button>
            )
          })}
        </div>

        <InlineSVGChart data={EXAMS.map((e) => e.score)} color={BRAND} height={80} />
      </div>

      {/* Essay depth */}
      <div className="rounded-[18px] border border-[#EBEBEB] bg-white p-4 mb-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[13px] font-[800] text-[#111]">Redação em Profundidade</p>
          <button className="text-[11px] font-[700]" style={{ color: BRAND }}>Ver redações →</button>
        </div>

        {/* Bank chips */}
        <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-none">
          {["ENEM", "UFU", "UEG"].map((b) => (
            <button
              key={b}
              onClick={() => setEssayBank(b)}
              className="flex-shrink-0 rounded-full px-3 py-1 text-[11px] font-[700] transition-colors"
              style={{ background: essayBank === b ? "#534AB7" : "#F5F5F5", color: essayBank === b ? "white" : "#888" }}
            >
              {b}
            </button>
          ))}
        </div>

        {/* 2x2 grid */}
        <div className="grid grid-cols-2 border border-[#F0F0F0] rounded-[12px] overflow-hidden mb-4">
          {[
            { label: "Média", value: `${avgEssay}/1000` },
            { label: "Última Nota", value: `${lastEssay}/1000` },
            { label: "Melhor Nota", value: `${bestEssay}/1000` },
            { label: "Mediana", value: `${medianEssay}/1000` },
          ].map((s, i) => (
            <div
              key={s.label}
              className="p-3"
              style={{
                borderRight: i % 2 === 0 ? "1px solid #F0F0F0" : undefined,
                borderBottom: i < 2 ? "1px solid #F0F0F0" : undefined,
              }}
            >
              <p className="text-[9px] font-[500] uppercase tracking-wide text-[#AAAAAA] mb-1">{s.label}</p>
              <p className="text-[18px] font-black text-[#111]">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Competencies */}
        <p className="text-[13px] font-[800] text-[#111] mb-3">Competências</p>
        <div className="flex flex-col divide-y divide-[#F0F0F0]">
          {COMPETENCIES.map((c) => {
            const pct = (c.score / c.max) * 100
            const color = compColor(pct)
            return (
              <div key={c.label} className="py-2.5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[12px] font-[700] text-[#111]">{c.label} — {c.name}</span>
                  <span className="text-[12px] font-[800]" style={{ color }}>{c.score}/{c.max}</span>
                </div>
                <AnimatedProgressBar pct={pct} color={color} height={4} />
              </div>
            )
          })}
        </div>

        {/* Highlight pills */}
        <div className="flex gap-2 mt-3">
          <span className="rounded-full px-2.5 py-1 text-[10px] font-[700]" style={{ background: "#FFF9E6", color: "#D97706" }}>↓ C2 · 70%</span>
          <span className="rounded-full px-2.5 py-1 text-[10px] font-[700]" style={{ background: "#ECFDF5", color: "#0F6E56" }}>↑ C1 · 80%</span>
        </div>
      </div>

      {/* Subject performance */}
      <div className="mb-5">
        <SectionTitle title="Performance por Matéria" />
        <div className="mt-3 flex flex-col gap-3">
          {SUBJECTS_PERFORMANCE.map((s) => {
            const pct = s.attempts > 0 ? (s.correct / s.attempts) * 100 : 0
            return (
              <div key={s.subject} className="rounded-[14px] border border-[#EBEBEB] bg-white p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[13px] font-[700] text-[#111]">{s.subject}</p>
                  <p className="text-[11px] text-[#888]">{s.attempts} tentativas · {s.correct} acertos</p>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-[#888] w-14">Precisão</span>
                    <div className="flex-1">
                      <AnimatedProgressBar pct={pct} color={s.color} height={5} />
                    </div>
                    <span className="text-[10px] font-[700] w-8 text-right" style={{ color: s.color }}>{pct.toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-[#888] w-14">Volume</span>
                    <div className="flex-1">
                      <AnimatedProgressBar pct={Math.min(100, (s.attempts / 200) * 100)} color="#FFD600" height={5} />
                    </div>
                    <span className="text-[10px] font-[700] text-[#888] w-8 text-right">{s.attempts}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Support cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-[18px] border border-[#EBEBEB] bg-white p-4">
          <p className="text-[11px] font-[700] uppercase tracking-wide text-[#AAAAAA] mb-3">Simulados</p>
          {[
            { l: "Melhor TRI", v: `${bestScore.toFixed(1)}%`, c: "#D97706" },
            { l: "Média recente", v: `${avgScore.toFixed(1)}%`, c: "#D14000" },
            { l: "Total", v: `${EXAMS.length}`, c: "#111" },
          ].map((s) => (
            <div key={s.l} className="flex justify-between items-center py-1">
              <span className="text-[11px] text-[#888]">{s.l}</span>
              <span className="text-[12px] font-[800]" style={{ color: s.c }}>{s.v}</span>
            </div>
          ))}
        </div>
        <div className="rounded-[18px] border border-[#EBEBEB] bg-white p-4">
          <p className="text-[11px] font-[700] uppercase tracking-wide text-[#AAAAAA] mb-3">Ranking</p>
          {[
            { l: "Posição", v: `#${STUDENT.rank}`, c: BRAND },
            { l: "Pontos", v: `${STUDENT.points}`, c: "#D97706" },
          ].map((s) => (
            <div key={s.l} className="flex justify-between items-center py-1">
              <span className="text-[11px] text-[#888]">{s.l}</span>
              <span className="text-[12px] font-[800]" style={{ color: s.c }}>{s.v}</span>
            </div>
          ))}
          <p className="text-[10px] mt-2" style={{ color: BRAND }}>200 pts para Estrategista</p>
        </div>
      </div>
    </div>
  )
}
