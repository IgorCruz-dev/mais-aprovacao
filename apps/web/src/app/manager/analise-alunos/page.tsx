"use client"

import { useState, useMemo } from "react"
import {
  LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts"
import {
  CaretUp, CaretDown, ArrowUpRight, Crown,
  Users, PencilLine, ChartLineUp, Star,
} from "@phosphor-icons/react"
import {
  APROVA, BentoCard, PageHeader, SectionTitle, Avatar, Chip, ChipRow,
} from "@/components/manager/ManagerSurface"
import {
  ANALYSIS_STUDENTS, ESSAY_GRADE_HISTORY, ESSAY_TEACHERS_WITH_COLOR,
  STUDENT_ANALYSIS_TURMAS,
  type StudentAnalysisRow,
} from "@/lib/mock-manager-data"

// ─── Types ────────────────────────────────────────────────────────────────────

type GradeRange = "all" | "0-399" | "400-599" | "600-799" | "800-960"
type RiskFilter = "all" | "risco_alto" | "atencao"

// ─── Turma colors ─────────────────────────────────────────────────────────────

const TURMA_COLORS: Record<string, string> = {
  "Turma A": "#1B4DE4",
  "Turma B": "#6C4BD9",
  "Turma C": "#0FA968",
  "Turma D": "#D97706",
  "Turma E": "#E23030",
}

const TURMA_TO_DATAKEY: Record<string, string> = {
  "Turma A": "turmaA",
  "Turma B": "turmaB",
  "Turma C": "turmaC",
  "Turma D": "turmaD",
  "Turma E": "turmaE",
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function matchesGradeRange(grade: number, range: GradeRange): boolean {
  if (range === "all")     return true
  if (range === "0-399")   return grade < 400
  if (range === "400-599") return grade >= 400 && grade < 600
  if (range === "600-799") return grade >= 600 && grade < 800
  if (range === "800-960") return grade >= 800
  return true
}

// ─── Small components ─────────────────────────────────────────────────────────

function EngBar({ pct }: { pct: number }) {
  const color = pct >= 80 ? APROVA.success : pct >= 62 ? APROVA.gold : APROVA.error
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full" style={{ background: "#EEF1F7" }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="w-7 text-right text-[11px] font-bold tabular" style={{ color: APROVA.ink }}>{pct}%</span>
    </div>
  )
}

function DeltaChip({ delta }: { delta: number }) {
  const positive = delta >= 0
  const abs = Math.abs(delta)
  const bg    = delta > 40 ? "#E6F8F0" : delta >= 0 ? "#F0F9F0" : delta > -30 ? "#FFF3DA" : "#FDECEC"
  const color = delta > 40 ? APROVA.successDeep : delta >= 0 ? APROVA.success : delta > -30 ? APROVA.goldDeep : APROVA.error
  const Icon  = positive ? CaretUp : CaretDown
  return (
    <span
      className="inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10.5px] font-bold tabular"
      style={{ background: bg, color }}
    >
      <Icon size={9} weight="bold" />
      {positive ? "+" : "-"}{abs}
    </span>
  )
}

const RISK_META = {
  ok:         { label: "Ok",         bg: "#E6F8F0", color: "#0A7A46" },
  atencao:    { label: "Atenção",    bg: "#FFF3DA", color: "#B45309" },
  risco_alto: { label: "Risco Alto", bg: "#FDECEC", color: "#E23030" },
} as const

function RiskBadge({ status }: { status: keyof typeof RISK_META }) {
  const m = RISK_META[status]
  return (
    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: m.bg, color: m.color }}>
      {m.label}
    </span>
  )
}

function ChartTooltipContent({
  active, payload, label,
}: {
  active?: boolean
  payload?: { color: string; name: string; value: number }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl px-3 py-2.5 shadow-xl" style={{ background: APROVA.ink }}>
      <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.1em]" style={{ color: "rgba(255,255,255,0.45)" }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-[12px] font-bold" style={{ color: "white" }}>
          <span style={{ color: p.color }}>{p.name}:</span> {p.value}
        </p>
      ))}
    </div>
  )
}

// ─── Top 5 Saltos ─────────────────────────────────────────────────────────────

function TopSaltosPanel() {
  const top5 = useMemo(
    () => [...ANALYSIS_STUDENTS].sort((a, b) => b.delta - a.delta).slice(0, 5),
    [],
  )

  return (
    <div className="flex flex-col rounded-2xl bg-white p-5" style={{ border: "1px solid #EEF1F7" }}>
      <SectionTitle title="Top 5 saltos do mês" kicker="Alunos com maior evolução em redação" />
      <div className="mt-3 flex flex-col gap-2.5">
        {top5.map((s, idx) => (
          <div
            key={s.id}
            className="flex items-center gap-2.5 rounded-xl p-3"
            style={{
              background: idx === 0
                ? "linear-gradient(135deg, #FFF9E6, #FFFBF2)"
                : "#F6F7FB",
              border: idx === 0
                ? "1.5px solid rgba(255,197,41,0.55)"
                : "1px solid #EEF1F7",
            }}
          >
            {/* rank */}
            <div
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-black"
              style={{
                background: idx === 0 ? APROVA.gold : "#E8EBF4",
                color: idx === 0 ? APROVA.navy : APROVA.inkMuted,
              }}
            >
              {idx === 0 ? <Crown size={11} weight="fill" /> : idx + 1}
            </div>

            <Avatar initial={s.initial} size={28} />

            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-bold" style={{ color: APROVA.ink }}>{s.name}</p>
              <p className="truncate text-[10px]" style={{ color: APROVA.inkMuted }}>
                {s.turma} · {s.teacherEssay}
              </p>
            </div>

            <div className="flex shrink-0 flex-col items-end gap-0.5">
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-semibold tabular" style={{ color: APROVA.inkMuted }}>{s.gradeStart}</span>
                <ArrowUpRight size={11} weight="bold" color={APROVA.success} />
                <span className="text-[13px] font-bold tabular" style={{ color: APROVA.successDeep }}>{s.gradeNow}</span>
              </div>
              <span className="text-[10.5px] font-black" style={{ color: APROVA.success }}>+{s.delta} pts</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Grade Evolution Chart ────────────────────────────────────────────────────

function GradeEvolutionChart() {
  return (
    <div className="rounded-2xl bg-white p-5" style={{ border: "1px solid #EEF1F7" }}>
      <SectionTitle title="Evolução da nota média de redação" kicker="Por turma · Jan – Jul 2026" />
      <div className="mt-4">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={ESSAY_GRADE_HISTORY} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#EEF1F7" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: APROVA.inkMuted, fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis domain={[560, 820]} tick={{ fill: APROVA.inkMuted, fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltipContent />} />
            <Legend iconType="plainline" iconSize={16} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
            <Line
              type="monotone"
              dataKey="avg"
              name="Média geral"
              stroke={APROVA.ink}
              strokeWidth={2.5}
              strokeDasharray="6 3"
              dot={false}
            />
            {STUDENT_ANALYSIS_TURMAS.map((t) => (
              <Line
                key={t}
                type="monotone"
                dataKey={TURMA_TO_DATAKEY[t]}
                name={t}
                stroke={TURMA_COLORS[t]}
                strokeWidth={1.5}
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// ─── Student Table ────────────────────────────────────────────────────────────

const PAGE_SIZE = 15

function StudentTable({ rows }: { rows: StudentAnalysisRow[] }) {
  const [page, setPage] = useState(0)
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const paged = rows.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE)

  return (
    <div className="overflow-hidden rounded-2xl bg-white" style={{ border: "1px solid #EEF1F7", boxShadow: "0 1px 6px rgba(10,15,30,0.05)" }}>
      {/* table header bar */}
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ borderBottom: "1px solid #EEF1F7", background: "#FAFBFE" }}
      >
        <p className="text-[11px] font-bold" style={{ color: APROVA.inkMuted }}>
          {rows.length} aluno{rows.length !== 1 ? "s" : ""} encontrado{rows.length !== 1 ? "s" : ""}
        </p>
        {totalPages > 1 && (
          <p className="text-[11px]" style={{ color: APROVA.inkMuted }}>
            Página {page + 1} de {totalPages}
          </p>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr style={{ borderBottom: "1px solid #EEF1F7" }}>
              {["Aluno", "Turma", "Prof. Redação", "Nota atual", "Variação", "Engajamento", "Risco"].map((h) => (
                <th
                  key={h}
                  className="whitespace-nowrap px-4 py-2.5 text-left text-[10.5px] font-bold uppercase tracking-wide"
                  style={{ color: APROVA.inkMuted }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-14 text-center">
                  <p className="text-[13px] font-semibold" style={{ color: APROVA.inkMuted }}>
                    Nenhum aluno encontrado para esses filtros.
                  </p>
                </td>
              </tr>
            ) : (
              paged.map((s, i) => (
                <tr
                  key={s.id}
                  className="transition-colors hover:bg-[#F6F7FB]"
                  style={{ borderTop: i > 0 ? "1px solid #F1F3F8" : undefined }}
                >
                  {/* Aluno */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar initial={s.initial} size={30} />
                      <p className="font-bold" style={{ color: APROVA.ink }}>{s.name}</p>
                    </div>
                  </td>

                  {/* Turma */}
                  <td className="px-4 py-3">
                    <span
                      className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold"
                      style={{ background: TURMA_COLORS[s.turma] + "18", color: TURMA_COLORS[s.turma] }}
                    >
                      {s.turma}
                    </span>
                  </td>

                  {/* Professor */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ background: s.teacherEssayColor }}
                      />
                      <span style={{ color: APROVA.inkMuted }}>{s.teacherEssay}</span>
                    </div>
                  </td>

                  {/* Nota atual */}
                  <td className="px-4 py-3">
                    <span className="font-bold tabular" style={{ color: APROVA.ink }}>{s.gradeNow}</span>
                    <span className="ml-1 text-[10px]" style={{ color: APROVA.inkMuted }}>/960</span>
                  </td>

                  {/* Variação */}
                  <td className="px-4 py-3">
                    <DeltaChip delta={s.delta} />
                  </td>

                  {/* Engajamento */}
                  <td className="px-4 py-3">
                    <EngBar pct={s.engagementPct} />
                  </td>

                  {/* Risco */}
                  <td className="px-4 py-3">
                    <RiskBadge status={s.riskStatus} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination footer */}
      {totalPages > 1 && (
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{ borderTop: "1px solid #EEF1F7", background: "#FAFBFE" }}
        >
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="rounded-full px-3 py-1.5 text-[12px] font-bold disabled:opacity-30"
            style={{ background: "#F0F2F7", color: APROVA.ink }}
          >
            Anterior
          </button>
          <span className="text-[11px]" style={{ color: APROVA.inkMuted }}>
            {page * PAGE_SIZE + 1}–{Math.min(rows.length, (page + 1) * PAGE_SIZE)} de {rows.length}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="rounded-full px-3 py-1.5 text-[12px] font-bold disabled:opacity-30"
            style={{ background: "#F0F2F7", color: APROVA.ink }}
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Filter chip for grade range ──────────────────────────────────────────────

const GRADE_RANGES: { value: GradeRange; label: string }[] = [
  { value: "all",     label: "Todas as notas" },
  { value: "0-399",   label: "0–399"          },
  { value: "400-599", label: "400–599"        },
  { value: "600-799", label: "600–799"        },
  { value: "800-960", label: "800–960"        },
]

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ManagerAnaliseAlunosPage() {
  const [filterTurma,   setFilterTurma]   = useState<string>("all")
  const [filterTeacher, setFilterTeacher] = useState<string>("all")
  const [filterGrade,   setFilterGrade]   = useState<GradeRange>("all")
  const [filterRisk,    setFilterRisk]    = useState<RiskFilter>("all")
  const [search,        setSearch]        = useState("")

  // KPIs (whole base)
  const totalAtivos   = ANALYSIS_STUDENTS.length
  const avgGrade      = Math.round(ANALYSIS_STUDENTS.reduce((s, r) => s + r.gradeNow, 0) / totalAtivos)
  const avgEngagement = Math.round(ANALYSIS_STUDENTS.reduce((s, r) => s + r.engagementPct, 0) / totalAtivos)
  const retencaoGeral = 81

  // Derived counts for KPI footnotes
  const emRisco = ANALYSIS_STUDENTS.filter((s) => s.riskStatus === "risco_alto").length

  // Filtered rows
  const filtered = useMemo(() => {
    return ANALYSIS_STUDENTS.filter((s) => {
      if (filterTurma   !== "all" && s.turma        !== filterTurma)   return false
      if (filterTeacher !== "all" && s.teacherEssay !== filterTeacher) return false
      if (!matchesGradeRange(s.gradeNow, filterGrade))                  return false
      if (filterRisk === "risco_alto" && s.riskStatus !== "risco_alto") return false
      if (filterRisk === "atencao"    && s.riskStatus === "ok")          return false
      if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [filterTurma, filterTeacher, filterGrade, filterRisk, search])

  const hasActiveFilter =
    filterTurma !== "all" || filterTeacher !== "all" ||
    filterGrade !== "all" || filterRisk !== "all" || search !== ""

  function clearFilters() {
    setFilterTurma("all")
    setFilterTeacher("all")
    setFilterGrade("all")
    setFilterRisk("all")
    setSearch("")
  }

  return (
    <div className="mx-auto max-w-[1600px] px-4 pt-4 pb-10 lg:px-8 lg:pt-7">

      {/* ── Header ── */}
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <PageHeader
          kicker="Gestão pedagógica"
          title="Análise de Alunos"
          subtitle="Desempenho, engajamento e evolução cruzados com professor responsável"
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar aluno…"
          className="w-full rounded-2xl border px-4 py-2.5 text-[13px] outline-none focus:border-blue-400 sm:w-64"
          style={{ borderColor: "#DDE1EC", background: "#fff", color: APROVA.ink }}
        />
      </div>

      {/* ── KPI row ── */}
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          {
            label: "Alunos ativos",
            value: totalAtivos,
            sub: `${emRisco} em risco alto`,
            icon: Users,
            color: APROVA.blue,
          },
          {
            label: "Nota média — Redação",
            value: avgGrade,
            sub: "escala 0–960",
            icon: PencilLine,
            color: "#6C4BD9",
          },
          {
            label: "Engajamento médio",
            value: `${avgEngagement}%`,
            sub: "taxa de atividade semanal",
            icon: ChartLineUp,
            color: APROVA.success,
          },
          {
            label: "Retenção geral",
            value: `${retencaoGeral}%`,
            sub: "renovações no período",
            icon: Star,
            color: "#D97706",
          },
        ].map((k) => (
          <div
            key={k.label}
            className="flex items-center gap-3 rounded-2xl bg-white p-4"
            style={{ border: "1px solid #EEF1F7", boxShadow: "0 1px 4px rgba(10,15,30,0.04)" }}
          >
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
              style={{ background: k.color + "14" }}
            >
              <k.icon size={18} weight="fill" color={k.color} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: APROVA.inkMuted }}>
                {k.label}
              </p>
              <p className="font-display text-[26px] font-bold tabular leading-none" style={{ color: APROVA.ink }}>
                {k.value}
              </p>
              <p className="mt-0.5 text-[10px]" style={{ color: APROVA.inkMuted }}>{k.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Chart + Top Saltos ── */}
      <div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_340px]">
        <GradeEvolutionChart />
        <TopSaltosPanel />
      </div>

      {/* ── Filters ── */}
      <div className="mb-3 flex flex-col gap-2">
        {/* Row 1: Turmas */}
        <ChipRow>
          <Chip active={filterTurma === "all"} onClick={() => setFilterTurma("all")}>
            Todas as turmas
          </Chip>
          {STUDENT_ANALYSIS_TURMAS.map((t) => (
            <Chip key={t} active={filterTurma === t} onClick={() => setFilterTurma(t)}>
              {t}
            </Chip>
          ))}
        </ChipRow>

        {/* Row 2: Professores */}
        <ChipRow>
          <Chip active={filterTeacher === "all"} onClick={() => setFilterTeacher("all")}>
            Todos os professores
          </Chip>
          {ESSAY_TEACHERS_WITH_COLOR.map((t) => (
            <Chip
              key={t.name}
              active={filterTeacher === t.name}
              onClick={() => setFilterTeacher(t.name)}
            >
              {t.name}
            </Chip>
          ))}
        </ChipRow>

        {/* Row 3: Faixa de nota + risco */}
        <ChipRow>
          {GRADE_RANGES.map((o) => (
            <Chip key={o.value} active={filterGrade === o.value} onClick={() => setFilterGrade(o.value)}>
              {o.label}
            </Chip>
          ))}
          <Chip
            active={filterRisk === "risco_alto"}
            onClick={() => setFilterRisk(filterRisk === "risco_alto" ? "all" : "risco_alto")}
            color={APROVA.error}
          >
            Risco Alto
          </Chip>
          <Chip
            active={filterRisk === "atencao"}
            onClick={() => setFilterRisk(filterRisk === "atencao" ? "all" : "atencao")}
            color="#B45309"
          >
            Em Atenção
          </Chip>
          {hasActiveFilter && (
            <button
              onClick={clearFilters}
              className="ml-1 text-[11.5px] font-bold transition-opacity hover:opacity-70"
              style={{ color: APROVA.blue }}
            >
              Limpar filtros
            </button>
          )}
        </ChipRow>
      </div>

      {/* ── Table ── */}
      <StudentTable
        key={`${filterTurma}|${filterTeacher}|${filterGrade}|${filterRisk}|${search}`}
        rows={filtered}
      />

    </div>
  )
}
