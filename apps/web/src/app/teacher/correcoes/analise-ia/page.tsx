"use client"

import { useMemo, useState } from "react"
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  Edit3,
  FileText,
  Flag,
  LineChart,
  Sparkles,
} from "lucide-react"
import { Button, Input } from "@mais-aprovacao/ui"
import {
  APROVA,
  Avatar,
  BentoCard,
  PageHeader,
  ProgressBar,
  RevealGroup,
  RevealItem,
  SectionTitle,
} from "@/components/teacher/TeacherSurface"

type HighlightTone = "info" | "warning" | "success"

type EssaySegment = {
  text: string
  highlight?: {
    id: string
    tone: HighlightTone
    label: string
  }
}

type Competency = {
  id: string
  title: string
  score: number
  tone: HighlightTone | "danger"
  justification: string
  evidence: string[]
  alert?: string
}

const student = {
  name: "Lívia Martins",
  initial: "L",
  className: "3o ano B - Extensivo ENEM",
  theme: "Desafios para a inclusão digital de idosos no Brasil",
  submittedAt: "Hoje, 09:42",
  aiScore: 760,
}

const essayLines: EssaySegment[][] = [
  [{ text: "A Constituição Federal de 1988 garante a todos os cidadãos o acesso" }],
  [{ text: "a direitos essenciais para a participação social. Entretanto, na sociedade" }],
  [
    { text: "brasileira atual, " },
    { text: "muitos idosos permanecem afastados do uso pleno das tecnologias digitais", highlight: { id: "theme", tone: "info", label: "recorte temático" } },
    { text: "," },
  ],
  [{ text: "o que limita sua autonomia e seu contato com serviços públicos, bancos e familiares." }],
  [{ text: "Nesse cenário, a exclusão digital da terceira idade ocorre principalmente pela" }],
  [
    { text: "falta de políticas de formação continuada e pela " },
    { text: "visão social de que aprender tecnologia é algo apenas dos jovens", highlight: { id: "argument", tone: "success", label: "argumentação" } },
    { text: "." },
  ],
  [{ text: "Em primeiro lugar, é preciso considerar que o acesso à internet não significa," }],
  [{ text: "necessariamente, inclusão digital. Embora celulares estejam mais presentes nas" }],
  [{ text: "famílias brasileiras, grande parte dos idosos utiliza esses aparelhos apenas para" }],
  [
    { text: "ligações ou mensagens simples, pois " },
    { text: "não recebeu orientação segura para lidar com aplicativos, senhas e golpes virtuais", highlight: { id: "c2", tone: "success", label: "desenvolvimento" } },
    { text: "." },
  ],
  [{ text: "Como consequência, atividades comuns, como marcar consultas pelo aplicativo do" }],
  [{ text: "posto de saúde ou acompanhar benefícios sociais, tornam-se fontes de ansiedade." }],
  [{ text: "Esse problema revela que a cidadania também depende de habilidades digitais." }],
  [{ text: "Além disso, a cultura brasileira ainda associa envelhecimento à incapacidade de" }],
  [{ text: "aprendizagem. Tal pensamento reforça o isolamento dos idosos, porque familiares" }],
  [
    { text: "e instituições, muitas vezes, " },
    { text: "fazem por eles as tarefas digitais em vez de ensiná-los", highlight: { id: "c3", tone: "info", label: "causa social" } },
    { text: "." },
  ],
  [{ text: "Dessa forma, a pessoa idosa passa a depender de terceiros para resolver situações" }],
  [{ text: "cotidianas e perde confiança para experimentar novas ferramentas. Esse processo" }],
  [{ text: "é agravado pela linguagem pouco acessível de muitos sistemas, que não consideram" }],
  [{ text: "limitações de visão, memória e ritmo de aprendizagem desse público." }],
  [{ text: "Portanto, a inclusão digital de idosos deve ser tratada como uma política de" }],
  [{ text: "cidadania. Para isso, o Ministério da Educação, em parceria com prefeituras e" }],
  [
    { text: "universidades públicas, deve " },
    { text: "criar oficinas gratuitas em escolas e centros comunitários", highlight: { id: "c5-action", tone: "warning", label: "ação" } },
    { text: "," },
  ],
  [{ text: "com monitores capacitados e materiais impressos de linguagem simples." }],
  [
    { text: "Essas aulas poderiam ensinar uso de aplicativos básicos, segurança na internet e" },
    { text: "acesso a serviços públicos", highlight: { id: "c5-method", tone: "warning", label: "meio" } },
    { text: "." },
  ],
  [
    { text: "Assim, " },
    { text: "os idosos teriam mais autonomia e participação social", highlight: { id: "c5-effect", tone: "warning", label: "efeito parcial" } },
    { text: "," },
  ],
  [
    { text: "mas a proposta ainda precisaria detalhar melhor " },
    { text: "como alcançar idosos que vivem em regiões rurais ou com mobilidade reduzida", highlight: { id: "c5-gap", tone: "warning", label: "lacuna" } },
    { text: "." },
  ],
]

const competencies: Competency[] = [
  {
    id: "c1",
    title: "Competência 1 - norma-padrão",
    score: 160,
    tone: "success",
    justification: "Texto claro, com boa organização sintática e poucos desvios pontuais de pontuação.",
    evidence: ["Períodos bem construídos na introdução", "Uso adequado de conectivos como 'Entretanto' e 'Portanto'"],
  },
  {
    id: "c2",
    title: "Competência 2 - compreensão do tema",
    score: 160,
    tone: "success",
    justification: "Compreende o recorte de inclusão digital de idosos e mobiliza repertório jurídico pertinente.",
    evidence: ["Constituição Federal de 1988", "Distinção entre acesso à internet e inclusão digital"],
  },
  {
    id: "c3",
    title: "Competência 3 - argumentação",
    score: 160,
    tone: "info",
    justification: "Argumentos consistentes, mas com alguma repetição de relação causa-consequência.",
    evidence: ["Dependência de terceiros", "Isolamento e perda de confiança"],
  },
  {
    id: "c4",
    title: "Competência 4 - coesão",
    score: 160,
    tone: "info",
    justification: "Boa progressão textual. A IA percebe repetição de conectores no início dos parágrafos.",
    evidence: ["Em primeiro lugar", "Além disso", "Portanto"],
    alert: "Repetição de estrutura entre parágrafos argumentativos.",
  },
  {
    id: "c5",
    title: "Competência 5 - intervenção",
    score: 120,
    tone: "danger",
    justification: "A proposta apresenta agente, ação, meio e efeito, mas detalha pouco o alcance da medida.",
    evidence: ["Oficinas gratuitas", "Monitores capacitados", "Falta detalhamento para áreas rurais"],
    alert: "Proposta de intervenção incompleta.",
  },
]

const alerts = [
  { icon: AlertTriangle, title: "Proposta de intervenção incompleta", text: "Falta detalhar a execução para idosos sem mobilidade ou fora dos centros urbanos.", tone: "warning" },
  { icon: Flag, title: "Fuga parcial do tema", text: "Um trecho amplia para serviços públicos em geral; manter foco em inclusão digital da terceira idade.", tone: "info" },
  { icon: LineChart, title: "Repetição de estrutura", text: "Parágrafos seguem padrão causa-consequência muito semelhante.", tone: "info" },
]

const history = [
  { label: "R1", score: 620 },
  { label: "R2", score: 660 },
  { label: "R3", score: 700 },
  { label: "R4", score: 720 },
  { label: "Atual", score: 760 },
]

const toneClass: Record<HighlightTone, string> = {
  info: "bg-blue-100 text-blue-950 ring-blue-200",
  warning: "bg-amber-100 text-amber-950 ring-amber-200",
  success: "bg-emerald-100 text-emerald-950 ring-emerald-200",
}

function ScorePill({ score, tone }: { score: number; tone: Competency["tone"] }) {
  const colors = {
    success: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    info: "bg-blue-50 text-blue-700 ring-blue-200",
    warning: "bg-amber-50 text-amber-700 ring-amber-200",
    danger: "bg-red-50 text-red-700 ring-red-200",
  }

  return (
    <span className={`inline-flex h-8 min-w-14 items-center justify-center rounded-md px-2 text-[12px] font-extrabold tabular ring-1 ${colors[tone]}`}>
      {score}
    </span>
  )
}

function HistoryChart() {
  const max = 1000
  const points = history.map((item, index) => ({
    ...item,
    x: 18 + index * 66,
    y: 96 - (item.score / max) * 76,
  }))
  const path = points.map((p, index) => `${index === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")

  return (
    <div className="rounded-lg bg-white p-3 ring-1 ring-[#E6EAF2]">
      <svg viewBox="0 0 300 128" className="h-32 w-full" role="img" aria-label="Evolução das últimas redações">
        <path d="M18 100 H282" stroke="#E6EAF2" strokeWidth="1" />
        <path d="M18 62 H282" stroke="#E6EAF2" strokeWidth="1" />
        <path d={path} fill="none" stroke={APROVA.blue} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p) => (
          <g key={p.label}>
            <circle cx={p.x} cy={p.y} r="5" fill="#fff" stroke={APROVA.blue} strokeWidth="3" />
            <text x={p.x} y="119" textAnchor="middle" className="fill-slate-500 text-[10px] font-bold">{p.label}</text>
            <text x={p.x} y={p.y - 10} textAnchor="middle" className="fill-slate-900 text-[10px] font-extrabold">{p.score}</text>
          </g>
        ))}
      </svg>
    </div>
  )
}

function EssayText() {
  return (
    <div className="rounded-lg bg-[#FFFDF7] px-4 py-5 ring-1 ring-[#E8E1D2] lg:px-7 lg:py-7">
      <div className="space-y-1 font-serif text-[17px] leading-[1.85] text-[#1F2937]">
        {essayLines.map((line, index) => (
          <p key={index} className="flex gap-3">
            <span className="w-7 shrink-0 select-none pt-0.5 text-right font-sans text-[11px] leading-[2.8] text-slate-400">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span>
              {line.map((segment, segmentIndex) => {
                if (!segment.highlight) return <span key={segmentIndex}>{segment.text}</span>

                return (
                  <mark
                    key={segmentIndex}
                    title={segment.highlight.label}
                    className={`rounded px-1 py-0.5 ring-1 ${toneClass[segment.highlight.tone]}`}
                  >
                    {segment.text}
                  </mark>
                )
              })}
            </span>
          </p>
        ))}
      </div>
    </div>
  )
}

export default function AiEssayReviewPage() {
  const [teacherScore, setTeacherScore] = useState(student.aiScore)
  const totalByCompetencies = useMemo(() => competencies.reduce((sum, item) => sum + item.score, 0), [])
  const scoreDelta = teacherScore - student.aiScore

  return (
    <RevealGroup className="mx-auto max-w-[1480px] px-4 pt-4 pb-10 lg:px-8 lg:pt-7">
      <RevealItem>
        <PageHeader
          kicker="Correção assistida por IA"
          title="Análise de redação"
          subtitle="A IA sugere evidências e notas por competência; a decisão final permanece com o professor."
        />
      </RevealItem>

      <RevealItem className="mb-4">
        <BentoCard className="p-4 lg:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <Avatar initial={student.initial} size={42} />
              <div className="min-w-0">
                <p className="text-[14px] font-extrabold" style={{ color: APROVA.ink }}>{student.name}</p>
                <p className="text-[12px]" style={{ color: APROVA.inkMuted }}>{student.className} · enviada {student.submittedAt}</p>
              </div>
            </div>
            <div className="flex flex-col gap-2 lg:items-end">
              <p className="text-[12px] font-bold uppercase tracking-[0.14em]" style={{ color: APROVA.inkMuted }}>Tema ENEM fictício</p>
              <p className="max-w-[680px] text-[14px] font-bold text-slate-900 lg:text-right">{student.theme}</p>
            </div>
          </div>
        </BentoCard>
      </RevealItem>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_430px] xl:items-start">
        <RevealItem>
          <BentoCard className="p-4 lg:p-6">
            <div className="mb-5 flex flex-col gap-3 border-b border-[#EEF1F7] pb-4 lg:flex-row lg:items-center lg:justify-between">
              <SectionTitle title="Redação do aluno" kicker="Texto original com evidências destacadas" />
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-800 ring-1 ring-blue-100">Tema / causa</span>
                <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-800 ring-1 ring-emerald-100">Argumentação</span>
                <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-800 ring-1 ring-amber-100">Intervenção</span>
              </div>
            </div>
            <EssayText />
          </BentoCard>
        </RevealItem>

        <RevealItem>
          <aside className="sticky top-4 space-y-4 xl:top-6">
            <BentoCard className="overflow-hidden p-0">
              <div className="border-b border-blue-100 bg-blue-50/70 px-4 py-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-blue-700 ring-1 ring-blue-100">
                    <Bot size={20} />
                  </div>
                  <div>
                    <p className="flex items-center gap-2 text-[14px] font-extrabold text-slate-950">
                      Assistente de revisão
                      <span className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.1em] text-blue-700 ring-1 ring-blue-100">
                        <Sparkles size={11} /> IA
                      </span>
                    </p>
                    <p className="mt-1 text-[12px] leading-5 text-slate-600">
                      Sugestão gerada a partir da matriz ENEM. Revise os trechos antes de confirmar.
                    </p>
                  </div>
                </div>
              </div>

              <div className="px-4 py-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-slate-950 px-3 py-3 text-white">
                    <p className="text-[11px] font-bold text-white/55">Nota sugerida IA</p>
                    <p className="mt-1 text-[32px] font-extrabold tabular leading-none">{student.aiScore}</p>
                  </div>
                  <label className="rounded-lg bg-white px-3 py-3 ring-1 ring-[#E6EAF2]">
                    <span className="text-[11px] font-bold text-slate-500">Nota do professor</span>
                    <Input
                      value={teacherScore}
                      onChange={(event) => setTeacherScore(Number(event.target.value))}
                      min={0}
                      max={1000}
                      step={20}
                      type="number"
                      className="mt-1 h-9 border-slate-200 text-[22px] font-extrabold tabular"
                    />
                  </label>
                </div>
                <div className="mt-3 flex items-center justify-between text-[12px]">
                  <span className="font-semibold text-slate-500">Soma das competências: {totalByCompetencies}</span>
                  <span className={`font-extrabold tabular ${scoreDelta === 0 ? "text-emerald-700" : "text-amber-700"}`}>
                    {scoreDelta === 0 ? "sem ajuste" : `${scoreDelta > 0 ? "+" : ""}${scoreDelta} pontos`}
                  </span>
                </div>
              </div>

              <div className="border-t border-[#EEF1F7] px-4 py-4">
                <p className="mb-3 flex items-center gap-2 text-[13px] font-extrabold text-slate-900">
                  <FileText size={16} /> Notas por competência
                </p>
                <div className="space-y-4">
                  {competencies.map((item) => (
                    <section key={item.id} className="border-t border-[#EEF1F7] pt-4 first:border-t-0 first:pt-0">
                      <div className="mb-2 flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h2 className="text-[12.5px] font-extrabold leading-5 text-slate-950">{item.title}</h2>
                          {item.alert && <p className="mt-0.5 text-[11px] font-bold text-red-700">{item.alert}</p>}
                        </div>
                        <ScorePill score={item.score} tone={item.tone} />
                      </div>
                      <ProgressBar pct={(item.score / 200) * 100} height={6} color={item.tone === "danger" ? APROVA.error : item.tone === "success" ? APROVA.success : APROVA.blue} />
                      <p className="mt-2 text-[12px] leading-5 text-slate-600">{item.justification}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {item.evidence.map((evidence) => (
                          <span key={evidence} className="rounded-md bg-slate-100 px-2 py-1 text-[10.5px] font-bold text-slate-600">
                            {evidence}
                          </span>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              </div>
            </BentoCard>

            <BentoCard className="p-4">
              <p className="mb-3 flex items-center gap-2 text-[13px] font-extrabold text-slate-900">
                <LineChart size={16} /> Histórico da aluna
              </p>
              <HistoryChart />
              <p className="mt-2 text-[12px] font-semibold text-slate-500">
                Evolução de 620 para 760 nas últimas cinco redações, com maior ganho em repertório e coesão.
              </p>
            </BentoCard>

            <BentoCard className="p-4">
              <p className="mb-3 flex items-center gap-2 text-[13px] font-extrabold text-slate-900">
                <AlertTriangle size={16} /> Sinalizações automáticas
              </p>
              <div className="space-y-3">
                {alerts.map((alert) => {
                  const Icon = alert.icon
                  return (
                    <div key={alert.title} className="flex gap-3 border-t border-[#EEF1F7] pt-3 first:border-t-0 first:pt-0">
                      <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${alert.tone === "warning" ? "bg-amber-50 text-amber-700" : "bg-blue-50 text-blue-700"}`}>
                        <Icon size={16} />
                      </div>
                      <div>
                        <p className="text-[12px] font-extrabold text-slate-950">{alert.title}</p>
                        <p className="mt-0.5 text-[11.5px] leading-5 text-slate-600">{alert.text}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </BentoCard>

            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
              <Button className="h-11 gap-2 rounded-lg bg-[#0A0F1E] text-white hover:bg-[#111827]">
                <CheckCircle2 size={17} /> Confirmar nota
              </Button>
              <Button variant="secondary" className="h-11 gap-2 rounded-lg border border-slate-200 bg-white text-slate-900 hover:bg-slate-50">
                <Edit3 size={17} /> Ajustar e corrigir manualmente
              </Button>
            </div>
          </aside>
        </RevealItem>
      </div>
    </RevealGroup>
  )
}
