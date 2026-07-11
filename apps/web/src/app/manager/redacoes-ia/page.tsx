"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  BrainCircuit,
  Clock3,
  FileText,
  Filter,
  GraduationCap,
  TrendingDown,
} from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import {
  APROVA,
  Avatar,
  BentoCard,
  KpiCard,
  PageHeader,
  ProgressBar,
  RevealGroup,
  RevealItem,
  SectionTitle,
  AnimatedNumber,
} from "@/components/manager/ManagerSurface"
import { PERIOD_OPTIONS, type PeriodKey } from "@/lib/mock-manager-data"

type TeacherProfile = "leniente" | "rigoroso" | "consistente" | "neutro"

type TeacherAiRow = {
  id: string
  name: string
  initial: string
  profile: TeacherProfile
  turma: string
  corrected30d: number
  aiAvg: number
  teacherAvg: number
  correctionHours: number
  color: string
}

type CompetencyRow = {
  id: string
  name: string
  avgScore: number
  delta30d: number
  affectedStudentsPct: number
}

type OutlierCase = {
  id: string
  teacherName: string
  studentName: string
  turma: string
  theme: string
  aiScore: number
  finalScore: number
  correctedAt: string
}

const TURMAS = ["Todas", "Turma A", "Turma B", "Turma C", "Turma D", "Turma E"] as const

const TEACHER_AI_ROWS: TeacherAiRow[] = [
  {
    id: "t1",
    name: "Marina Alves",
    initial: "M",
    profile: "leniente",
    turma: "Turma A",
    corrected30d: 68,
    aiAvg: 700,
    teacherAvg: 824,
    correctionHours: 22,
    color: "#1B4DE4",
  },
  {
    id: "t2",
    name: "Carlos Mendes",
    initial: "C",
    profile: "rigoroso",
    turma: "Turma B",
    corrected30d: 54,
    aiAvg: 700,
    teacherAvg: 614,
    correctionHours: 37,
    color: "#E23030",
  },
  {
    id: "t4",
    name: "Bruno Lima",
    initial: "B",
    profile: "neutro",
    turma: "Turma C",
    corrected30d: 48,
    aiAvg: 700,
    teacherAvg: 758,
    correctionHours: 28,
    color: "#6C4BD9",
  },
  {
    id: "t5",
    name: "Fernanda Rocha",
    initial: "F",
    profile: "consistente",
    turma: "Turma D",
    corrected30d: 38,
    aiAvg: 700,
    teacherAvg: 695,
    correctionHours: 31,
    color: "#D97706",
  },
  {
    id: "t7",
    name: "Patrícia Neves",
    initial: "P",
    profile: "consistente",
    turma: "Turma E",
    corrected30d: 42,
    aiAvg: 700,
    teacherAvg: 720,
    correctionHours: 26,
    color: "#BE185D",
  },
  {
    id: "t8",
    name: "André Campos",
    initial: "A",
    profile: "neutro",
    turma: "Turma B",
    corrected30d: 22,
    aiAvg: 700,
    teacherAvg: 681,
    correctionHours: 34,
    color: "#059669",
  },
]

const COMPETENCIES: CompetencyRow[] = [
  { id: "c4", name: "Competência 4 - Coesão e coerência", avgScore: 132, delta30d: -4, affectedStudentsPct: 41 },
  { id: "c5", name: "Competência 5 - Intervenção", avgScore: 138, delta30d: -2, affectedStudentsPct: 36 },
  { id: "c3", name: "Competência 3 - Argumentação", avgScore: 146, delta30d: 1, affectedStudentsPct: 29 },
  { id: "c1", name: "Competência 1 - Norma-padrão", avgScore: 154, delta30d: 3, affectedStudentsPct: 18 },
  { id: "c2", name: "Competência 2 - Tema e repertório", avgScore: 158, delta30d: 5, affectedStudentsPct: 15 },
]

const OUTLIERS: OutlierCase[] = [
  {
    id: "case-001",
    teacherName: "Marina Alves",
    studentName: "Ana Beatriz Pereira",
    turma: "Turma A",
    theme: "Desafios para a inclusão digital de idosos no Brasil",
    aiScore: 720,
    finalScore: 860,
    correctedAt: "Hoje, 10:18",
  },
  {
    id: "case-002",
    teacherName: "Carlos Mendes",
    studentName: "Pedro Martins",
    turma: "Turma B",
    theme: "Caminhos para combater a evasão escolar no Brasil",
    aiScore: 740,
    finalScore: 600,
    correctedAt: "Ontem, 18:40",
  },
  {
    id: "case-003",
    teacherName: "Bruno Lima",
    studentName: "Isabela Cardoso",
    turma: "Turma C",
    theme: "O acesso à cultura em regiões periféricas",
    aiScore: 680,
    finalScore: 780,
    correctedAt: "Ontem, 14:05",
  },
  {
    id: "case-004",
    teacherName: "André Campos",
    studentName: "Bruna Carvalho",
    turma: "Turma B",
    theme: "Uso de tecnologia na educação básica",
    aiScore: 760,
    finalScore: 640,
    correctedAt: "Seg, 16:22",
  },
]

const PERIOD_MULTIPLIER: Record<PeriodKey, number> = {
  week: 0.28,
  month: 1,
  quarter: 2.9,
  year: 9.7,
}

const PROFILE_LABEL: Record<TeacherProfile, { label: string; color: string; bg: string }> = {
  leniente: { label: "Leniente", color: "#B45309", bg: "#FFF3DA" },
  rigoroso: { label: "Rigoroso", color: APROVA.error, bg: "#FDECEC" },
  consistente: { label: "Consistente", color: APROVA.successDeep, bg: "#E6F8F0" },
  neutro: { label: "Neutro", color: APROVA.inkMuted, bg: "#F0F2F7" },
}

function formatPct(value: number) {
  return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`
}

function getDivergencePct(row: Pick<TeacherAiRow, "aiAvg" | "teacherAvg">) {
  return ((row.teacherAvg - row.aiAvg) / row.aiAvg) * 100
}

function getDivergenceColor(divergencePct: number) {
  if (Math.abs(divergencePct) >= 12) return APROVA.error
  if (Math.abs(divergencePct) >= 7) return "#D97706"
  return APROVA.success
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <label className="flex min-w-[180px] flex-1 flex-col gap-1">
      <span className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: APROVA.inkMuted }}>{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-lg border border-[#E2E6EE] bg-white px-3 text-[12.5px] font-bold outline-none transition-colors focus:border-[#1B4DE4]"
        style={{ color: APROVA.ink }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  )
}

function ProfileBadge({ profile }: { profile: TeacherProfile }) {
  const meta = PROFILE_LABEL[profile]
  return (
    <span className="inline-flex rounded-full px-2 py-0.5 text-[10px] font-extrabold" style={{ background: meta.bg, color: meta.color }}>
      {meta.label}
    </span>
  )
}

export default function ManagerAiEssaysPage() {
  const [turma, setTurma] = useState("Todas")
  const [teacher, setTeacher] = useState("Todos")
  const [period, setPeriod] = useState<PeriodKey>("month")

  const filteredRows = useMemo(() => {
    return TEACHER_AI_ROWS.filter((row) => {
      const turmaMatch = turma === "Todas" || row.turma === turma
      const teacherMatch = teacher === "Todos" || row.name === teacher
      return turmaMatch && teacherMatch
    })
  }, [teacher, turma])

  const multiplier = PERIOD_MULTIPLIER[period]
  const totalCorrected = Math.round(filteredRows.reduce((sum, row) => sum + row.corrected30d, 0) * multiplier)
  const weightedAiAvg = filteredRows.length
    ? Math.round(filteredRows.reduce((sum, row) => sum + row.aiAvg * row.corrected30d, 0) / filteredRows.reduce((sum, row) => sum + row.corrected30d, 0))
    : 0
  const weightedFinalAvg = filteredRows.length
    ? Math.round(filteredRows.reduce((sum, row) => sum + row.teacherAvg * row.corrected30d, 0) / filteredRows.reduce((sum, row) => sum + row.corrected30d, 0))
    : 0
  const avgCorrectionHours = filteredRows.length
    ? Math.round(filteredRows.reduce((sum, row) => sum + row.correctionHours, 0) / filteredRows.length)
    : 0

  const chartRows = filteredRows.map((row) => {
    const divergencePct = getDivergencePct(row)
    return {
      professor: row.name.replace(" ", "\n"),
      ai: row.aiAvg,
      final: row.teacherAvg,
      divergencePct,
      fill: getDivergenceColor(divergencePct),
    }
  })

  const visibleOutliers = OUTLIERS.filter((item) => {
    const turmaMatch = turma === "Todas" || item.turma === turma
    const teacherMatch = teacher === "Todos" || item.teacherName === teacher
    return turmaMatch && teacherMatch
  })

  const mostDivergent = [...filteredRows].sort((a, b) => Math.abs(getDivergencePct(b)) - Math.abs(getDivergencePct(a)))[0]
  const weakestCompetency = COMPETENCIES[0]

  return (
    <RevealGroup className="mx-auto max-w-[1680px] px-4 pt-4 pb-10 lg:px-8 lg:pt-7">
      <RevealItem>
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <PageHeader
            kicker="Gestão pedagógica"
            title="Redações com IA"
            subtitle="Visão agregada para cruzar padrões da operação, professores, turmas e competências ENEM."
          />
          <Link
            href="/manager/professores"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg px-3 text-[12px] font-extrabold text-white"
            style={{ background: APROVA.blue }}
          >
            Abrir análise de professores <ArrowUpRight size={15} />
          </Link>
        </div>
      </RevealItem>

      <RevealItem className="mb-5">
        <BentoCard className="p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
            <div className="flex items-center gap-2 lg:w-[180px]">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: APROVA.blueSoft, color: APROVA.blue }}>
                <Filter size={18} />
              </div>
              <div>
                <p className="text-[12px] font-extrabold" style={{ color: APROVA.ink }}>Filtros</p>
                <p className="text-[11px]" style={{ color: APROVA.inkMuted }}>Dados mockados</p>
              </div>
            </div>
            <SelectField
              label="Turma"
              value={turma}
              onChange={setTurma}
              options={TURMAS.map((item) => ({ value: item, label: item }))}
            />
            <SelectField
              label="Professor"
              value={teacher}
              onChange={setTeacher}
              options={[{ value: "Todos", label: "Todos" }, ...TEACHER_AI_ROWS.map((row) => ({ value: row.name, label: row.name }))]}
            />
            <SelectField
              label="Período"
              value={period}
              onChange={(value) => setPeriod(value as PeriodKey)}
              options={PERIOD_OPTIONS}
            />
          </div>
        </BentoCard>
      </RevealItem>

      <RevealItem className="mb-5">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <KpiCard label="Redações corrigidas" value={<AnimatedNumber value={totalCorrected} />} icon={FileText} color={APROVA.blue} />
          <KpiCard label="Nota média final" value={<AnimatedNumber value={weightedFinalAvg} />} unit="/1000" icon={GraduationCap} color={APROVA.success} />
          <KpiCard label="Média sugerida pela IA" value={<AnimatedNumber value={weightedAiAvg} />} unit="/1000" icon={BrainCircuit} color="#6C4BD9" />
          <KpiCard label="Tempo médio de correção" value={<AnimatedNumber value={avgCorrectionHours} />} unit="h/prof." icon={Clock3} color={APROVA.gold} />
        </div>
      </RevealItem>

      {mostDivergent && (
        <RevealItem className="mb-5">
          <div className="grid gap-3 lg:grid-cols-[1fr_1fr]">
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
              <p className="flex items-center gap-2 text-[12.5px] font-extrabold text-red-800">
                <AlertTriangle size={16} />
                Maior divergência no filtro: {mostDivergent.name} ({formatPct(getDivergencePct(mostDivergent))} vs IA)
              </p>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
              <p className="flex items-center gap-2 text-[12.5px] font-extrabold text-amber-800">
                <TrendingDown size={16} />
                Reforço coletivo sugerido: {weakestCompetency.name}, média {weakestCompetency.avgScore}/200
              </p>
            </div>
          </div>
        </RevealItem>
      )}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.9fr)]">
        <RevealItem>
          <BentoCard className="p-4 lg:p-5">
            <SectionTitle title="IA sugerida vs. nota final por professor" kicker="Divergência de correção" />
            <div className="mt-4 h-[360px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartRows} margin={{ top: 10, right: 18, bottom: 8, left: -18 }}>
                  <CartesianGrid stroke="#EEF1F7" vertical={false} />
                  <XAxis dataKey="professor" tick={{ fontSize: 11, fontWeight: 700, fill: APROVA.inkMuted }} tickLine={false} axisLine={false} />
                  <YAxis domain={[500, 900]} tick={{ fontSize: 11, fill: APROVA.inkMuted }} tickLine={false} axisLine={false} />
                  <Tooltip
                    cursor={{ fill: "#F6F7FB" }}
                    formatter={(value, name, props) => {
                      if (name === "final") {
                        return [`${value} (${formatPct(props.payload.divergencePct)})`, "Nota final"]
                      }
                      return [`${value}`, "Sugestão IA"]
                    }}
                    labelFormatter={(label) => String(label).replace("\n", " ")}
                  />
                  <Legend formatter={(value) => value === "ai" ? "Sugestão IA" : "Nota final professor"} />
                  <Bar dataKey="ai" fill="#CBD5E1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="final" radius={[4, 4, 0, 0]}>
                    {chartRows.map((entry) => (
                      <Cell key={entry.professor} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {filteredRows.map((row) => {
                const divergence = getDivergencePct(row)
                return (
                  <div key={row.id} className="rounded-lg bg-[#F8FAFC] px-3 py-2">
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <span className="truncate text-[12px] font-extrabold" style={{ color: APROVA.ink }}>{row.name}</span>
                      <span className="text-[11px] font-extrabold tabular" style={{ color: getDivergenceColor(divergence) }}>{formatPct(divergence)}</span>
                    </div>
                    <ProgressBar pct={Math.min(100, Math.abs(divergence) * 5)} color={getDivergenceColor(divergence)} height={6} />
                  </div>
                )
              })}
            </div>
          </BentoCard>
        </RevealItem>

        <RevealItem>
          <BentoCard className="p-4 lg:p-5">
            <SectionTitle title="Competências mais fracas" kicker="Base de alunos" />
            <div className="mt-4 space-y-4">
              {COMPETENCIES.map((item, index) => (
                <div key={item.id}>
                  <div className="mb-1.5 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[12.5px] font-extrabold" style={{ color: APROVA.ink }}>
                        {index + 1}. {item.name}
                      </p>
                      <p className="text-[11px]" style={{ color: APROVA.inkMuted }}>{item.affectedStudentsPct}% da base abaixo de 140 pontos</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[13px] font-extrabold tabular" style={{ color: index === 0 ? APROVA.error : APROVA.ink }}>{item.avgScore}/200</p>
                      <p className={`text-[10.5px] font-bold tabular ${item.delta30d < 0 ? "text-red-700" : "text-emerald-700"}`}>{item.delta30d > 0 ? "+" : ""}{item.delta30d} pts</p>
                    </div>
                  </div>
                  <ProgressBar pct={(item.avgScore / 200) * 100} color={index === 0 ? APROVA.error : index === 1 ? "#D97706" : APROVA.blue} height={8} />
                </div>
              ))}
            </div>
          </BentoCard>
        </RevealItem>
      </div>

      <RevealItem className="mt-5">
        <BentoCard className="p-4 lg:p-5">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <SectionTitle title="Casos fora da curva" kicker={`${visibleOutliers.length} sinalizações automáticas`} />
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-2.5 py-1 text-[11px] font-extrabold text-red-700">
              <BarChart3 size={14} /> divergência maior que 12%
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-[12.5px]">
              <thead>
                <tr className="border-b border-[#EEF1F7]">
                  {["Professor", "Aluno / turma", "Tema", "IA", "Final", "Dif.", "Ação"].map((head) => (
                    <th key={head} className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wide" style={{ color: APROVA.inkMuted }}>{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleOutliers.map((item) => {
                  const divergence = ((item.finalScore - item.aiScore) / item.aiScore) * 100
                  const teacherMeta = TEACHER_AI_ROWS.find((row) => row.name === item.teacherName)
                  return (
                    <tr key={item.id} className="border-b border-[#F1F3F8] last:border-0">
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar initial={teacherMeta?.initial ?? item.teacherName[0]} size={30} color={teacherMeta?.color ?? APROVA.blue} />
                          <div>
                            <p className="font-extrabold" style={{ color: APROVA.ink }}>{item.teacherName}</p>
                            {teacherMeta && <ProfileBadge profile={teacherMeta.profile} />}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <p className="font-bold" style={{ color: APROVA.ink }}>{item.studentName}</p>
                        <p className="text-[11px]" style={{ color: APROVA.inkMuted }}>{item.turma} · {item.correctedAt}</p>
                      </td>
                      <td className="max-w-[280px] px-3 py-3">
                        <p className="truncate" style={{ color: APROVA.inkMuted }}>{item.theme}</p>
                      </td>
                      <td className="px-3 py-3 font-bold tabular" style={{ color: APROVA.inkMuted }}>{item.aiScore}</td>
                      <td className="px-3 py-3 font-extrabold tabular" style={{ color: APROVA.ink }}>{item.finalScore}</td>
                      <td className="px-3 py-3">
                        <span className="rounded-full px-2 py-1 text-[11px] font-extrabold tabular" style={{ background: `${getDivergenceColor(divergence)}18`, color: getDivergenceColor(divergence) }}>
                          {formatPct(divergence)}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <Link href={`/teacher/correcoes/analise-ia?case=${item.id}`} className="inline-flex items-center gap-1.5 text-[12px] font-extrabold" style={{ color: APROVA.blue }}>
                          Abrir caso <ArrowUpRight size={13} />
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {visibleOutliers.length === 0 && (
              <div className="py-8 text-center text-[12.5px] font-semibold" style={{ color: APROVA.inkMuted }}>
                Nenhum caso fora da curva para os filtros selecionados.
              </div>
            )}
          </div>
        </BentoCard>
      </RevealItem>
    </RevealGroup>
  )
}
