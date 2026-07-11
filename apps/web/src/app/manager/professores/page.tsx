"use client"

import { useState, useMemo } from "react"
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts"
import {
  CaretUp, CaretDown, X, Warning, Star, Users,
  PencilLine, VideoCamera, ChartLineUp, ArrowUpRight,
  SortAscending, Crown,
} from "@phosphor-icons/react"
import {
  APROVA, BentoCard, PageHeader, Avatar, AnimatedNumber, SectionTitle,
} from "@/components/manager/ManagerSurface"

// ─── Types & mock data ────────────────────────────────────────────────────────

type TeacherProfile = "leniente" | "rigoroso" | "consistente" | "neutro"

interface StudentEvolution {
  studentName: string
  from: number
  to: number
}

interface TeacherAnalysis {
  id: string
  name: string
  initial: string
  discipline: string
  color: string
  essaysCorrectedMonth: number
  avgGrade: number
  gradeDevPct: number
  profile: TeacherProfile
  lessonsInserted: number
  avgEngagement: number
  retentionRate: number
  studentsCount: number
  gradeHistory: number[]
  gradeDist: { range: string; teacher: number; global: number }[]
  lessonsPerMonth: number[]
  topEvolution: StudentEvolution
  rareEvolution: StudentEvolution | null
}

const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
const GLOBAL_AVG = 700
const GLOBAL_RETENTION = 78

const GRADE_RANGES = ["0–199", "200–399", "400–599", "600–799", "800–960"]
const GLOBAL_DIST  = [3, 12, 31, 38, 16]

const TEACHERS: TeacherAnalysis[] = [
  {
    id: "t1",
    name: "Marina Alves",
    initial: "M",
    discipline: "Redação",
    color: "#1B4DE4",
    essaysCorrectedMonth: 68,
    avgGrade: 824,
    gradeDevPct: +17.7,
    profile: "leniente",
    lessonsInserted: 3,
    avgEngagement: 84,
    retentionRate: 91,
    studentsCount: 142,
    gradeHistory:    [791, 806, 812, 818, 822, 817, 825, 820, 821, 826, 820, 824],
    gradeDist: GRADE_RANGES.map((range, i) => ({ range, teacher: [1, 4, 18, 42, 35][i], global: GLOBAL_DIST[i] })),
    lessonsPerMonth:  [2, 3, 2, 4, 3, 3, 2, 4, 3, 3, 4, 3],
    topEvolution:    { studentName: "Ana Beatriz P.", from: 440, to: 920 },
    rareEvolution:   { studentName: "Gabriel F.", from: 800, to: 960 },
  },
  {
    id: "t2",
    name: "Carlos Mendes",
    initial: "C",
    discipline: "Redação",
    color: "#E23030",
    essaysCorrectedMonth: 54,
    avgGrade: 614,
    gradeDevPct: -12.3,
    profile: "rigoroso",
    lessonsInserted: 2,
    avgEngagement: 71,
    retentionRate: 69,
    studentsCount: 98,
    gradeHistory:    [620, 618, 612, 608, 615, 610, 614, 612, 617, 613, 609, 614],
    gradeDist: GRADE_RANGES.map((range, i) => ({ range, teacher: [6, 22, 42, 26, 4][i], global: GLOBAL_DIST[i] })),
    lessonsPerMonth:  [1, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 2],
    topEvolution:    { studentName: "Pedro M.", from: 380, to: 720 },
    rareEvolution:   null,
  },
  {
    id: "t3",
    name: "Renata Souza",
    initial: "R",
    discipline: "Biologia",
    color: "#0FA968",
    essaysCorrectedMonth: 0,
    avgGrade: 702,
    gradeDevPct: +0.3,
    profile: "consistente",
    lessonsInserted: 8,
    avgEngagement: 91,
    retentionRate: 85,
    studentsCount: 186,
    gradeHistory:    [698, 701, 699, 703, 700, 702, 701, 699, 703, 702, 700, 702],
    gradeDist: GRADE_RANGES.map((range, i) => ({ range, teacher: [3, 11, 32, 38, 16][i], global: GLOBAL_DIST[i] })),
    lessonsPerMonth:  [6, 7, 8, 8, 7, 9, 8, 8, 7, 9, 8, 8],
    topEvolution:    { studentName: "Camila T.", from: 560, to: 880 },
    rareEvolution:   { studentName: "Lucas R.", from: 820, to: 960 },
  },
  {
    id: "t4",
    name: "Bruno Lima",
    initial: "B",
    discipline: "Redação",
    color: "#6C4BD9",
    essaysCorrectedMonth: 48,
    avgGrade: 758,
    gradeDevPct: +8.3,
    profile: "neutro",
    lessonsInserted: 4,
    avgEngagement: 78,
    retentionRate: 81,
    studentsCount: 124,
    gradeHistory:    [748, 752, 756, 760, 758, 754, 762, 758, 756, 759, 757, 758],
    gradeDist: GRADE_RANGES.map((range, i) => ({ range, teacher: [2, 8, 26, 44, 20][i], global: GLOBAL_DIST[i] })),
    lessonsPerMonth:  [3, 4, 3, 4, 4, 3, 5, 4, 3, 4, 4, 4],
    topEvolution:    { studentName: "Isabela C.", from: 520, to: 840 },
    rareEvolution:   null,
  },
  {
    id: "t5",
    name: "Fernanda Rocha",
    initial: "F",
    discipline: "História",
    color: "#D97706",
    essaysCorrectedMonth: 38,
    avgGrade: 695,
    gradeDevPct: -0.7,
    profile: "consistente",
    lessonsInserted: 6,
    avgEngagement: 83,
    retentionRate: 80,
    studentsCount: 108,
    gradeHistory:    [690, 692, 694, 697, 695, 693, 696, 695, 697, 694, 696, 695],
    gradeDist: GRADE_RANGES.map((range, i) => ({ range, teacher: [4, 13, 30, 37, 16][i], global: GLOBAL_DIST[i] })),
    lessonsPerMonth:  [5, 6, 5, 7, 6, 6, 5, 7, 6, 6, 7, 6],
    topEvolution:    { studentName: "Rafael S.", from: 480, to: 800 },
    rareEvolution:   null,
  },
  {
    id: "t6",
    name: "Lucas Martins",
    initial: "L",
    discipline: "Matemática",
    color: "#0891B2",
    essaysCorrectedMonth: 0,
    avgGrade: 688,
    gradeDevPct: -1.7,
    profile: "neutro",
    lessonsInserted: 10,
    avgEngagement: 76,
    retentionRate: 77,
    studentsCount: 163,
    gradeHistory:    [682, 684, 686, 688, 690, 687, 685, 689, 688, 686, 687, 688],
    gradeDist: GRADE_RANGES.map((range, i) => ({ range, teacher: [4, 14, 33, 35, 14][i], global: GLOBAL_DIST[i] })),
    lessonsPerMonth:  [8, 9, 10, 10, 9, 11, 10, 10, 9, 11, 10, 10],
    topEvolution:    { studentName: "Thiago N.", from: 400, to: 760 },
    rareEvolution:   null,
  },
  {
    id: "t7",
    name: "Patrícia Neves",
    initial: "P",
    discipline: "Português",
    color: "#BE185D",
    essaysCorrectedMonth: 42,
    avgGrade: 720,
    gradeDevPct: +2.9,
    profile: "consistente",
    lessonsInserted: 5,
    avgEngagement: 86,
    retentionRate: 84,
    studentsCount: 118,
    gradeHistory:    [712, 715, 718, 720, 722, 718, 721, 720, 719, 721, 720, 720],
    gradeDist: GRADE_RANGES.map((range, i) => ({ range, teacher: [2, 10, 29, 40, 19][i], global: GLOBAL_DIST[i] })),
    lessonsPerMonth:  [4, 5, 5, 5, 4, 6, 5, 5, 4, 6, 5, 5],
    topEvolution:    { studentName: "Mariana O.", from: 600, to: 880 },
    rareEvolution:   { studentName: "Felipe A.", from: 840, to: 960 },
  },
  {
    id: "t8",
    name: "André Campos",
    initial: "A",
    discipline: "Física",
    color: "#059669",
    essaysCorrectedMonth: 22,
    avgGrade: 681,
    gradeDevPct: -2.7,
    profile: "neutro",
    lessonsInserted: 4,
    avgEngagement: 74,
    retentionRate: 74,
    studentsCount: 87,
    gradeHistory:    [668, 672, 678, 680, 682, 679, 681, 683, 680, 679, 682, 681],
    gradeDist: GRADE_RANGES.map((range, i) => ({ range, teacher: [5, 15, 35, 34, 11][i], global: GLOBAL_DIST[i] })),
    lessonsPerMonth:  [3, 3, 4, 4, 3, 4, 4, 4, 3, 4, 4, 4],
    topEvolution:    { studentName: "Bruna C.", from: 440, to: 720 },
    rareEvolution:   null,
  },
]

// ─── Helpers & small components ───────────────────────────────────────────────

const PROFILE_META: Record<TeacherProfile, { label: string; bg: string; color: string }> = {
  leniente:    { label: "Leniente",    bg: "#FFF3DA", color: "#B45309"          },
  rigoroso:    { label: "Rigoroso",    bg: "#FDECEC", color: APROVA.error       },
  consistente: { label: "Consistente", bg: "#E6F8F0", color: APROVA.successDeep },
  neutro:      { label: "Dentro da média",  bg: "#F0F2F7", color: APROVA.inkMuted    },
}

function ProfileBadge({ profile, small }: { profile: TeacherProfile; small?: boolean }) {
  const m = PROFILE_META[profile]
  return (
    <span
      className={`inline-flex items-center rounded-full font-bold ${small ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-[11px]"}`}
      style={{ background: m.bg, color: m.color }}
    >
      {m.label}
    </span>
  )
}

function DeviationChip({ dev }: { dev: number }) {
  if (Math.abs(dev) < 2) return null
  const positive = dev > 0
  const color = Math.abs(dev) > 10 ? (positive ? "#B45309" : APROVA.error) : APROVA.inkMuted
  const bg    = Math.abs(dev) > 10 ? (positive ? "#FFF3DA" : "#FDECEC")   : "#F0F2F7"
  const Icon  = positive ? CaretUp : CaretDown
  return (
    <span
      className="ml-1.5 inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular"
      style={{ background: bg, color }}
    >
      <Icon size={9} weight="bold" />
      {Math.abs(dev).toFixed(1)}%
    </span>
  )
}

function EngBar({ pct }: { pct: number }) {
  const color = pct >= 85 ? APROVA.success : pct >= 70 ? APROVA.gold : APROVA.error
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-20 overflow-hidden rounded-full" style={{ background: "#EEF1F7" }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="w-8 text-right text-[11px] font-bold tabular" style={{ color: APROVA.ink }}>{pct}%</span>
    </div>
  )
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { color: string; name: string; value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl px-3 py-2.5 shadow-xl" style={{ background: APROVA.ink, border: "none" }}>
      <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.1em]" style={{ color: "rgba(255,255,255,0.45)" }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-[12px] font-bold" style={{ color: "white" }}>
          <span style={{ color: p.color }}>{p.name}:</span> {p.value}
        </p>
      ))}
    </div>
  )
}

// ─── Detail panel ─────────────────────────────────────────────────────────────

function AlertCard({ teacher }: { teacher: TeacherAnalysis }) {
  const { profile, gradeDevPct, name } = teacher
  if (profile !== "leniente" && profile !== "rigoroso") return null
  const isLenient = profile === "leniente"
  const tone = isLenient
    ? { bg: "#FFF3DA", border: "rgba(180,83,9,0.25)", color: "#B45309", icon: Warning }
    : { bg: "#FDECEC", border: "rgba(226,48,48,0.25)", color: APROVA.error, icon: Warning }
  const msg = isLenient
    ? `${name} atribui notas ${gradeDevPct.toFixed(1)}% acima da média geral — pode indicar leniência na correção.`
    : `${name} atribui notas ${Math.abs(gradeDevPct).toFixed(1)}% abaixo da média geral — pode indicar rigor excessivo ou critérios desalinhados.`
  const Icon = tone.icon
  return (
    <div
      className="flex items-start gap-3 rounded-2xl px-4 py-3"
      style={{ background: tone.bg, border: `1px solid ${tone.border}` }}
    >
      <Icon size={16} weight="fill" color={tone.color} className="mt-0.5 shrink-0" />
      <p className="text-[12.5px] font-semibold leading-snug" style={{ color: APROVA.ink }}>
        {msg}
      </p>
    </div>
  )
}

function GradeHistoryChart({ teacher }: { teacher: TeacherAnalysis }) {
  const data = teacher.gradeHistory.map((v, i) => ({
    month: MONTHS[i],
    [teacher.name.split(" ")[0]]: v,
    "Média geral": [692, 695, 698, 701, 699, 703, 697, 702, 700, 698, 704, 700][i],
  }))
  const firstName = teacher.name.split(" ")[0]
  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#EEF1F7" vertical={false} />
        <XAxis dataKey="month" tick={{ fill: APROVA.inkMuted, fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis domain={[550, 900]} tick={{ fill: APROVA.inkMuted, fontSize: 10 }} axisLine={false} tickLine={false} />
        <Tooltip content={<ChartTooltip />} />
        <Line type="monotone" dataKey={firstName} stroke={teacher.color} strokeWidth={2.5} dot={false} />
        <Line type="monotone" dataKey="Média geral" stroke="#D0D5E4" strokeWidth={1.5} strokeDasharray="5 4" dot={false} />
        <Legend iconType="plainline" iconSize={16} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}

function GradeDistChart({ teacher }: { teacher: TeacherAnalysis }) {
  const firstName = teacher.name.split(" ")[0]
  const data = teacher.gradeDist.map(d => ({ ...d, [firstName]: d.teacher }))
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} barGap={2} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#EEF1F7" vertical={false} />
        <XAxis dataKey="range" tick={{ fill: APROVA.inkMuted, fontSize: 9.5 }} axisLine={false} tickLine={false} />
        <YAxis unit="%" tick={{ fill: APROVA.inkMuted, fontSize: 10 }} axisLine={false} tickLine={false} />
        <Tooltip content={<ChartTooltip />} />
        <Bar dataKey={firstName} fill={teacher.color} fillOpacity={0.85} radius={[3, 3, 0, 0]} />
        <Bar dataKey="global" name="Média geral" fill="#D0D5E4" fillOpacity={0.7} radius={[3, 3, 0, 0]} />
        <Legend iconType="square" iconSize={10} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
      </BarChart>
    </ResponsiveContainer>
  )
}

function LessonsChart({ teacher }: { teacher: TeacherAnalysis }) {
  const data = teacher.lessonsPerMonth.map((v, i) => ({ month: MONTHS[i], Aulas: v }))
  return (
    <ResponsiveContainer width="100%" height={140}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#EEF1F7" vertical={false} />
        <XAxis dataKey="month" tick={{ fill: APROVA.inkMuted, fontSize: 9.5 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: APROVA.inkMuted, fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip content={<ChartTooltip />} />
        <Bar dataKey="Aulas" fill={APROVA.blue} fillOpacity={0.85} radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

function EvolutionCard({ ev, rare }: { ev: StudentEvolution; rare?: boolean }) {
  const gain = ev.to - ev.from
  return (
    <div
      className="flex flex-col gap-1.5 rounded-2xl p-3.5"
      style={{
        background: rare ? "linear-gradient(135deg, #FFF3DA, #FFFBF0)" : "#F6F7FB",
        border: rare ? "1.5px solid rgba(255,197,41,0.55)" : "1px solid #EEF1F7",
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-bold" style={{ color: APROVA.ink }}>{ev.studentName}</p>
        {rare ? (
          <span
            className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[9.5px] font-black uppercase tracking-wide"
            style={{ background: APROVA.gold, color: APROVA.navy }}
          >
            <Crown size={9} weight="fill" /> Topo da escala
          </span>
        ) : (
          <span className="rounded-full px-2 py-0.5 text-[9.5px] font-bold" style={{ background: "#E6F8F0", color: APROVA.successDeep }}>
            Evolução destaque
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className="font-display text-[22px] font-bold tabular" style={{ color: APROVA.inkMuted }}>{ev.from}</span>
        <ArrowUpRight size={16} color={rare ? APROVA.goldDeep : APROVA.success} weight="bold" />
        <span className="font-display text-[22px] font-bold tabular" style={{ color: rare ? APROVA.goldDeep : APROVA.successDeep }}>{ev.to}</span>
        <span className="ml-1 text-[11px] font-bold" style={{ color: rare ? APROVA.goldDeep : APROVA.success }}>+{gain} pts</span>
      </div>
      {rare && (
        <p className="text-[10.5px] leading-snug" style={{ color: "#92610A" }}>
          Salto no nível elite — ganhar pontos acima de 800 é exponencialmente mais difícil.
        </p>
      )}
    </div>
  )
}

function RetentionCompare({ teacher }: { teacher: TeacherAnalysis }) {
  const diff = teacher.retentionRate - GLOBAL_RETENTION
  const color = diff >= 0 ? APROVA.success : APROVA.error
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-end gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: APROVA.inkMuted }}>Este professor</p>
          <p className="font-display text-[38px] font-bold tabular leading-none" style={{ color: APROVA.ink }}>
            <AnimatedNumber value={teacher.retentionRate} />%
          </p>
        </div>
        <div className="pb-1 text-right">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: APROVA.inkMuted }}>Média cursinho</p>
          <p className="font-display text-[24px] font-bold tabular" style={{ color: APROVA.inkMuted }}>{GLOBAL_RETENTION}%</p>
        </div>
      </div>
      <div
        className="flex items-center gap-2 rounded-xl px-3 py-2"
        style={{ background: diff >= 0 ? "#E6F8F0" : "#FDECEC" }}
      >
        {diff >= 0
          ? <CaretUp size={13} weight="bold" color={color} />
          : <CaretDown size={13} weight="bold" color={color} />}
        <span className="text-[12px] font-semibold" style={{ color }}>
          {Math.abs(diff)}pp {diff >= 0 ? "acima" : "abaixo"} da média
        </span>
      </div>
    </div>
  )
}

function DetailPanel({ teacher, onClose }: { teacher: TeacherAnalysis; onClose: () => void }) {
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: "rgba(10,15,30,0.4)", backdropFilter: "blur(2px)" }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="fixed bottom-0 right-0 top-0 z-50 flex flex-col overflow-hidden"
        style={{
          width: "min(660px, 100vw)",
          background: "#F4F6FB",
          boxShadow: "-8px 0 48px rgba(10,15,30,0.18)",
          animation: "slideInRight 0.28s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <style>{`
          @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0.5; }
            to   { transform: translateX(0);    opacity: 1; }
          }
        `}</style>

        {/* Panel header */}
        <div
          className="flex shrink-0 items-center gap-3 px-6 py-4"
          style={{ background: "#fff", borderBottom: "1px solid #EEF1F7" }}
        >
          <Avatar initial={teacher.initial} color={teacher.color} size={40} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="font-display text-[17px] font-bold" style={{ color: APROVA.ink }}>{teacher.name}</p>
              <ProfileBadge profile={teacher.profile} small />
            </div>
            <p className="text-[12px]" style={{ color: APROVA.inkMuted }}>{teacher.discipline} · {teacher.studentsCount} alunos vinculados</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-[#F0F2F7]"
          >
            <X size={16} color={APROVA.inkMuted} />
          </button>
        </div>

        {/* Summary pills */}
        <div className="flex shrink-0 gap-2 overflow-x-auto px-6 py-3 scrollbar-none" style={{ borderBottom: "1px solid #EEF1F7", background: "#fff" }}>
          {[
            { label: "Nota média", value: teacher.avgGrade.toString(), sub: `vs ${GLOBAL_AVG} geral` },
            { label: "Redações/mês", value: teacher.essaysCorrectedMonth > 0 ? teacher.essaysCorrectedMonth.toString() : "—" },
            { label: "Aulas inseridas", value: teacher.lessonsInserted.toString() },
            { label: "Engajamento", value: `${teacher.avgEngagement}%` },
            { label: "Retenção", value: `${teacher.retentionRate}%` },
          ].map(p => (
            <div key={p.label} className="flex shrink-0 flex-col rounded-xl px-3 py-2" style={{ background: "#F4F6FB" }}>
              <p className="text-[9.5px] font-bold uppercase tracking-[0.12em]" style={{ color: APROVA.inkMuted }}>{p.label}</p>
              <p className="font-display text-[18px] font-bold tabular" style={{ color: APROVA.ink }}>{p.value}</p>
              {p.sub && <p className="text-[9px]" style={{ color: APROVA.inkMuted }}>{p.sub}</p>}
            </div>
          ))}
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="flex flex-col gap-5">

            {/* Alert */}
            <AlertCard teacher={teacher} />

            {/* Grade history */}
            <div className="rounded-2xl bg-white p-5" style={{ border: "1px solid #EEF1F7" }}>
              <SectionTitle title="Histórico de notas atribuídas" kicker="Últimos 12 meses" />
              <GradeHistoryChart teacher={teacher} />
            </div>

            {/* Grade distribution */}
            <div className="rounded-2xl bg-white p-5" style={{ border: "1px solid #EEF1F7" }}>
              <SectionTitle title="Distribuição de notas vs média geral" kicker="Comparativo" />
              <GradeDistChart teacher={teacher} />
            </div>

            {/* Student evolution */}
            <div className="rounded-2xl bg-white p-5" style={{ border: "1px solid #EEF1F7" }}>
              <SectionTitle title="Efetividade pedagógica" kicker="Evolução de alunos" />
              <div className="flex flex-col gap-3">
                {teacher.rareEvolution && <EvolutionCard ev={teacher.rareEvolution} rare />}
                <EvolutionCard ev={teacher.topEvolution} />
              </div>
            </div>

            {/* Retention + Lessons side by side */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-white p-5" style={{ border: "1px solid #EEF1F7" }}>
                <SectionTitle title="Retenção de alunos" kicker="Renovações" />
                <RetentionCompare teacher={teacher} />
              </div>
              <div className="rounded-2xl bg-white p-5" style={{ border: "1px solid #EEF1F7" }}>
                <SectionTitle title="Aulas inseridas / mês" kicker="Conteúdo" />
                <LessonsChart teacher={teacher} />
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

type SortKey = "name" | "essays" | "grade" | "lessons" | "engagement"

export default function ManagerProfessoresPage() {
  const [selected, setSelected]   = useState<TeacherAnalysis | null>(null)
  const [sortKey, setSortKey]     = useState<SortKey>("name")
  const [sortAsc, setSortAsc]     = useState(true)
  const [search, setSearch]       = useState("")

  function handleSort(key: SortKey) {
    if (sortKey === key) { setSortAsc(a => !a) } else { setSortKey(key); setSortAsc(true) }
  }

  const rows = useMemo(() => {
    const filtered = TEACHERS.filter(t =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.discipline.toLowerCase().includes(search.toLowerCase())
    )
    return [...filtered].sort((a, b) => {
      const v = (t: TeacherAnalysis) => {
        if (sortKey === "name")        return t.name
        if (sortKey === "essays")      return t.essaysCorrectedMonth
        if (sortKey === "grade")       return t.avgGrade
        if (sortKey === "lessons")     return t.lessonsInserted
        if (sortKey === "engagement")  return t.avgEngagement
        return 0
      }
      const [va, vb] = [v(a), v(b)]
      if (typeof va === "string") return sortAsc ? (va as string).localeCompare(vb as string) : (vb as string).localeCompare(va as string)
      return sortAsc ? (va as number) - (vb as number) : (vb as number) - (va as number)
    })
  }, [search, sortKey, sortAsc])

  const totalEssays   = TEACHERS.reduce((s, t) => s + t.essaysCorrectedMonth, 0)
  const avgEngagement = Math.round(TEACHERS.reduce((s, t) => s + t.avgEngagement, 0) / TEACHERS.length)
  const avgRetention  = Math.round(TEACHERS.reduce((s, t) => s + t.retentionRate, 0) / TEACHERS.length)
  const alerts        = TEACHERS.filter(t => t.profile === "leniente" || t.profile === "rigoroso").length

  function SortTh({ label, col }: { label: string; col: SortKey }) {
    const active = sortKey === col
    return (
      <th
        className="cursor-pointer select-none whitespace-nowrap px-4 py-2.5 text-left text-[10.5px] font-bold uppercase tracking-wide transition-colors hover:text-[#0A0F1E]"
        style={{ color: active ? APROVA.ink : APROVA.inkMuted }}
        onClick={() => handleSort(col)}
      >
        <div className="flex items-center gap-1">
          {label}
          {active
            ? (sortAsc ? <CaretUp size={10} weight="bold" /> : <CaretDown size={10} weight="bold" />)
            : <SortAscending size={10} color="#D0D5E4" />}
        </div>
      </th>
    )
  }

  return (
    <div className="mx-auto max-w-[1600px] px-4 pt-4 pb-10 lg:px-8 lg:pt-7">

      {/* Header */}
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <PageHeader
          kicker="Gestão pedagógica"
          title="Análise de Professores"
          subtitle="Coerência de correção, efetividade e retenção por docente"
        />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Filtrar por nome ou disciplina…"
          className="w-full rounded-2xl border px-4 py-2.5 text-[13px] outline-none focus:border-blue-400 sm:w-72"
          style={{ borderColor: "#DDE1EC", background: "#fff", color: APROVA.ink }}
        />
      </div>

      {/* KPI row */}
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Professores ativos",    value: TEACHERS.length,  icon: Users,          color: APROVA.blue   },
          { label: "Redações corrigidas/mês", value: totalEssays,    icon: PencilLine,     color: "#6C4BD9"     },
          { label: "Engajamento médio",     value: `${avgEngagement}%`, icon: ChartLineUp, color: APROVA.success},
          { label: "Alertas de coerência",  value: alerts,           icon: Warning,        color: alerts > 0 ? "#B45309" : APROVA.success },
        ].map(k => (
          <div
            key={k.label}
            className="flex items-center gap-3 rounded-2xl bg-white p-4"
            style={{ border: "1px solid #EEF1F7", boxShadow: "0 1px 4px rgba(10,15,30,0.04)" }}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: k.color + "14" }}>
              <k.icon size={18} weight="fill" color={k.color} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: APROVA.inkMuted }}>{k.label}</p>
              <p className="font-display text-[26px] font-bold tabular leading-none" style={{ color: APROVA.ink }}>{k.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl bg-white" style={{ border: "1px solid #EEF1F7", boxShadow: "0 1px 6px rgba(10,15,30,0.05)" }}>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr style={{ borderBottom: "1px solid #EEF1F7", background: "#FAFBFE" }}>
                <SortTh label="Professor" col="name" />
                <SortTh label="Redações / mês" col="essays" />
                <SortTh label="Nota média atribuída" col="grade" />
                <SortTh label="Aulas inseridas" col="lessons" />
                <SortTh label="Engajamento dos alunos" col="engagement" />
                <th className="px-4 py-2.5 text-left text-[10.5px] font-bold uppercase tracking-wide" style={{ color: APROVA.inkMuted }}>Perfil</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {rows.map((t, i) => (
                <tr
                  key={t.id}
                  className="cursor-pointer transition-colors hover:bg-[#F6F7FB]"
                  style={{ borderTop: i > 0 ? "1px solid #F1F3F8" : undefined }}
                  onClick={() => setSelected(t)}
                >
                  {/* Professor */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar initial={t.initial} color={t.color} size={34} />
                      <div>
                        <p className="font-bold" style={{ color: APROVA.ink }}>{t.name}</p>
                        <p className="text-[11px]" style={{ color: APROVA.inkMuted }}>{t.discipline} · {t.studentsCount} alunos</p>
                      </div>
                    </div>
                  </td>

                  {/* Redações */}
                  <td className="px-4 py-3">
                    {t.essaysCorrectedMonth > 0
                      ? <span className="font-bold tabular" style={{ color: APROVA.ink }}>{t.essaysCorrectedMonth}</span>
                      : <span style={{ color: APROVA.inkMuted }}>—</span>
                    }
                  </td>

                  {/* Nota média */}
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <span className="font-bold tabular" style={{ color: APROVA.ink }}>{t.avgGrade}</span>
                      <DeviationChip dev={t.gradeDevPct} />
                    </div>
                  </td>

                  {/* Aulas */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <VideoCamera size={13} color={APROVA.inkMuted} />
                      <span className="tabular font-semibold" style={{ color: APROVA.ink }}>{t.lessonsInserted}</span>
                    </div>
                  </td>

                  {/* Engajamento */}
                  <td className="px-4 py-3"><EngBar pct={t.avgEngagement} /></td>

                  {/* Perfil */}
                  <td className="px-4 py-3"><ProfileBadge profile={t.profile} small /></td>

                  {/* Action */}
                  <td className="px-4 py-3">
                    <button
                      className="flex items-center gap-1 rounded-xl px-3 py-1.5 text-[11.5px] font-bold transition-colors hover:bg-[#EEF1F7]"
                      style={{ color: APROVA.blue }}
                      onClick={e => { e.stopPropagation(); setSelected(t) }}
                    >
                      Ver análise <ArrowUpRight size={12} weight="bold" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div
          className="flex flex-wrap items-center gap-4 px-5 py-3"
          style={{ borderTop: "1px solid #EEF1F7", background: "#FAFBFE" }}
        >
          <p className="text-[10.5px] font-bold uppercase tracking-[0.12em]" style={{ color: APROVA.inkMuted }}>Legenda de notas:</p>
          {[
            { label: "Leniente (>+10%)",    bg: "#FFF3DA", color: "#B45309" },
            { label: "Rigoroso (<-10%)",    bg: "#FDECEC", color: APROVA.error },
            { label: "Consistente (±10%)",  bg: "#E6F8F0", color: APROVA.successDeep },
            { label: "Dentro da média",     bg: "#F0F2F7", color: APROVA.inkMuted },
          ].map(l => (
            <span key={l.label} className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: l.color }} />
              <span className="text-[10.5px]" style={{ color: APROVA.inkMuted }}>{l.label}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Detail panel */}
      {selected && <DetailPanel teacher={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
