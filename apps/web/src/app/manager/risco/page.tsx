"use client"

import { useState, useMemo } from "react"
import {
  AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts"
import {
  CaretUp, CaretDown, Warning, Users, Clock, Fire,
} from "@phosphor-icons/react"
import {
  APROVA, PageHeader, SectionTitle, Avatar, Chip, ChipRow, Segmented,
} from "@/components/manager/ManagerSurface"
import {
  RISK_STUDENTS, RISK_TREND_HISTORICAL, RISK_REASON_LABELS,
  ESSAY_TEACHERS_WITH_COLOR, STUDENT_ANALYSIS_TURMAS, ANALYSIS_STUDENTS,
  type RiskStudentRow, type RiskReason,
} from "@/lib/mock-manager-data"

// ─── Colour tokens ────────────────────────────────────────────────────────────

const C_ALTO    = APROVA.error          // #E23030
const C_ALTO_BG = "#FDECEC"
const C_ATN     = "#D97706"             // amber text
const C_ATN_BG  = "#FFF3DA"

const TURMA_COLORS: Record<string, string> = {
  "Turma A": "#1B4DE4",
  "Turma B": "#6C4BD9",
  "Turma C": "#0FA968",
  "Turma D": "#D97706",
  "Turma E": "#E23030",
}

// ─── Chart tooltip ───────────────────────────────────────────────────────────

function ChartTip({
  active, payload, label,
}: {
  active?: boolean
  payload?: { color: string; name: string; value: number }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  const total = payload.reduce((s, p) => s + p.value, 0)
  return (
    <div className="rounded-xl px-3 py-2.5 shadow-xl" style={{ background: APROVA.ink }}>
      <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.1em]" style={{ color: "rgba(255,255,255,0.45)" }}>
        {label} · Total: {total}
      </p>
      {[...payload].reverse().map((p, i) => (
        <p key={i} className="text-[12px] font-bold" style={{ color: "white" }}>
          <span style={{ color: p.color }}>{p.name}:</span> {p.value}
        </p>
      ))}
    </div>
  )
}

// ─── Level badge ──────────────────────────────────────────────────────────────

function LevelBadge({ level }: { level: "risco_alto" | "atencao" }) {
  const isAlto = level === "risco_alto"
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold"
      style={{ background: isAlto ? C_ALTO_BG : C_ATN_BG, color: isAlto ? C_ALTO : C_ATN }}
    >
      {isAlto && <Warning size={9} weight="fill" />}
      {isAlto ? "Risco Alto" : "Em Atenção"}
    </span>
  )
}

// ─── Reason badge ─────────────────────────────────────────────────────────────

const REASON_ICON: Record<RiskReason, string> = {
  inatividade:       "🕐",
  queda_nota:        "📉",
  baixo_engajamento: "📊",
  ausencia_simulado: "📝",
  sem_acesso:        "🔕",
}

function ReasonBadge({ reason }: { reason: RiskReason }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
      style={{ background: "#F0F2F7", color: APROVA.inkMuted }}
    >
      {RISK_REASON_LABELS[reason]}
    </span>
  )
}

// ─── Contact days cell ────────────────────────────────────────────────────────

function ContactDays({ days }: { days: number }) {
  const bg    = days > 21 ? C_ALTO_BG : days > 7 ? C_ATN_BG : "#F0F2F7"
  const color = days > 21 ? C_ALTO    : days > 7 ? C_ATN    : APROVA.inkMuted
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-bold tabular"
      style={{ background: bg, color }}
    >
      <Clock size={10} />
      {days}d
    </span>
  )
}

// ─── Risk-trend chart ─────────────────────────────────────────────────────────

function RiskTrendChart({
  altoNow, atencaoNow,
}: {
  altoNow: number
  atencaoNow: number
}) {
  const data = [
    ...RISK_TREND_HISTORICAL.map((d) => ({ ...d, total: d.alto + d.atencao })),
    { month: "Jul", alto: altoNow, atencao: atencaoNow, total: altoNow + atencaoNow },
  ]
  return (
    <div className="rounded-2xl bg-white p-5" style={{ border: "1px solid #EEF1F7" }}>
      <SectionTitle title="Evolução de alunos em risco" kicker="Jan – Jul 2026 · acumulado mensal" />
      <div className="mt-4">
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="fillAtn" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={C_ATN}  stopOpacity={0.18} />
                <stop offset="95%" stopColor={C_ATN}  stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="fillAlto" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={C_ALTO} stopOpacity={0.22} />
                <stop offset="95%" stopColor={C_ALTO} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#EEF1F7" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: APROVA.inkMuted, fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: APROVA.inkMuted, fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTip />} />
            <Legend iconType="plainline" iconSize={16} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
            <Area
              type="monotone"
              dataKey="atencao"
              name="Em Atenção"
              stackId="risk"
              stroke={C_ATN}
              strokeWidth={2}
              fill="url(#fillAtn)"
            />
            <Area
              type="monotone"
              dataKey="alto"
              name="Risco Alto"
              stackId="risk"
              stroke={C_ALTO}
              strokeWidth={2}
              fill="url(#fillAlto)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// ─── Risk by turma panel ──────────────────────────────────────────────────────

function RiskByTurmaPanel() {
  const rows = useMemo(() =>
    [...STUDENT_ANALYSIS_TURMAS]
      .map((turma) => {
        const total     = ANALYSIS_STUDENTS.filter((s) => s.turma === turma).length
        const atRisk    = RISK_STUDENTS.filter((s) => s.turma === turma)
        const alto      = atRisk.filter((s) => s.riskLevel === "risco_alto").length
        const atencao   = atRisk.filter((s) => s.riskLevel === "atencao").length
        const riskCount = atRisk.length
        const pct       = Math.round((riskCount / total) * 100)
        return { turma, total, alto, atencao, riskCount, pct }
      })
      .sort((a, b) => b.riskCount - a.riskCount),
  [])

  return (
    <div className="flex flex-col rounded-2xl bg-white p-5" style={{ border: "1px solid #EEF1F7" }}>
      <SectionTitle title="Risco por turma" kicker="Distribuição atual" />
      <div className="mt-3 flex flex-col gap-4">
        {rows.map(({ turma, total, alto, atencao, riskCount, pct }) => {
          const color     = TURMA_COLORS[turma]
          const altoPct   = (alto   / total) * 100
          const atencaoPct = (atencao / total) * 100
          const isHigh    = pct >= 30
          return (
            <div key={turma} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ background: color }} />
                  <span className="text-[12.5px] font-bold" style={{ color: APROVA.ink }}>{turma}</span>
                </div>
                <span
                  className="text-[11px] font-bold tabular"
                  style={{ color: isHigh ? C_ALTO : pct >= 20 ? C_ATN : APROVA.inkMuted }}
                >
                  {riskCount}/{total} · {pct}%
                </span>
              </div>
              {/* stacked bar */}
              <div className="flex h-2 w-full overflow-hidden rounded-full" style={{ background: "#EEF1F7" }}>
                <div style={{ width: `${atencaoPct}%`, background: C_ATN }} className="h-full" />
                <div style={{ width: `${altoPct}%`,    background: C_ALTO }} className="h-full" />
              </div>
              <div className="flex gap-3">
                <span className="text-[10px] font-semibold" style={{ color: C_ATN }}>Atenção: {atencao}</span>
                <span className="text-[10px] font-semibold" style={{ color: C_ALTO }}>Alto: {alto}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Student table ────────────────────────────────────────────────────────────

const PAGE_SIZE = 15

function StudentTable({ rows }: { rows: RiskStudentRow[] }) {
  const [page, setPage] = useState(0)
  const totalPages      = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const paged           = rows.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE)

  return (
    <div className="overflow-hidden rounded-2xl bg-white" style={{ border: "1px solid #EEF1F7", boxShadow: "0 1px 6px rgba(10,15,30,0.05)" }}>
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ borderBottom: "1px solid #EEF1F7", background: "#FAFBFE" }}
      >
        <p className="text-[11px] font-bold" style={{ color: APROVA.inkMuted }}>
          {rows.length} aluno{rows.length !== 1 ? "s" : ""} em risco
        </p>
        {totalPages > 1 && (
          <p className="text-[11px]" style={{ color: APROVA.inkMuted }}>
            Pág. {page + 1}/{totalPages}
          </p>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr style={{ borderBottom: "1px solid #EEF1F7" }}>
              {["Aluno", "Turma", "Prof. Responsável", "Motivo principal", "Nível", "Último contato"].map((h) => (
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
                <td colSpan={6} className="py-14 text-center">
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
                      <div>
                        <p className="font-bold" style={{ color: APROVA.ink }}>{s.name}</p>
                        <p className="text-[10px]" style={{ color: APROVA.inkMuted }}>
                          Nota: {s.gradeNow}/960 · Eng: {s.engagementPct}%
                        </p>
                      </div>
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
                      <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: s.teacherEssayColor }} />
                      <span style={{ color: APROVA.inkMuted }}>{s.teacherEssay}</span>
                    </div>
                  </td>

                  {/* Motivo */}
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <ReasonBadge reason={s.primaryReason} />
                      {s.allReasons.length > 1 && (
                        <p className="text-[10px]" style={{ color: APROVA.inkMuted }}>
                          +{s.allReasons.length - 1} motivo{s.allReasons.length > 2 ? "s" : ""}
                        </p>
                      )}
                    </div>
                  </td>

                  {/* Nível */}
                  <td className="px-4 py-3">
                    <LevelBadge level={s.riskLevel} />
                  </td>

                  {/* Último contato */}
                  <td className="px-4 py-3">
                    <ContactDays days={s.lastContactDays} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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

// ─── Por Turma view ───────────────────────────────────────────────────────────

function TurmaCard({
  turma, riskCount, altoCount, atencaoCount, total,
  topReason, avgContact,
}: {
  turma: string
  riskCount: number
  altoCount: number
  atencaoCount: number
  total: number
  topReason: RiskReason
  avgContact: number
}) {
  const color    = TURMA_COLORS[turma]
  const pct      = Math.round((riskCount / total) * 100)
  const isHigh   = pct >= 30
  const altoPct  = (altoCount   / total) * 100
  const atnPct   = (atencaoCount / total) * 100

  return (
    <div
      className="flex flex-col gap-4 rounded-2xl bg-white p-5"
      style={{
        border: isHigh ? `1.5px solid ${C_ALTO}40` : "1px solid #EEF1F7",
        boxShadow: isHigh ? `0 2px 12px ${C_ALTO}14` : "0 1px 4px rgba(10,15,30,0.04)",
      }}
    >
      {/* header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full" style={{ background: color }} />
          <p className="text-[15px] font-bold" style={{ color: APROVA.ink }}>{turma}</p>
        </div>
        <div className="text-right">
          <p
            className="font-display text-[28px] font-bold tabular leading-none"
            style={{ color: isHigh ? C_ALTO : APROVA.ink }}
          >
            {riskCount}
          </p>
          <p className="text-[10px]" style={{ color: APROVA.inkMuted }}>de {total} alunos</p>
        </div>
      </div>

      {/* % badge */}
      <div
        className="flex items-center gap-2 rounded-xl px-3 py-2"
        style={{ background: isHigh ? C_ALTO_BG : pct >= 20 ? C_ATN_BG : "#F0F2F7" }}
      >
        {isHigh
          ? <Warning size={13} weight="fill" color={C_ALTO} />
          : <Fire size={13} weight="fill" color={pct >= 20 ? C_ATN : APROVA.inkMuted} />}
        <span
          className="text-[12px] font-bold"
          style={{ color: isHigh ? C_ALTO : pct >= 20 ? C_ATN : APROVA.inkMuted }}
        >
          {pct}% da turma em risco
        </span>
      </div>

      {/* stacked severity bar */}
      <div>
        <div className="mb-1.5 flex items-center justify-between text-[10px] font-semibold">
          <span style={{ color: C_ATN }}>Atenção: {atencaoCount}</span>
          <span style={{ color: C_ALTO }}>Alto: {altoCount}</span>
        </div>
        <div className="flex h-2.5 w-full overflow-hidden rounded-full" style={{ background: "#EEF1F7" }}>
          <div style={{ width: `${atnPct}%`,  background: C_ATN  }} className="h-full" />
          <div style={{ width: `${altoPct}%`, background: C_ALTO }} className="h-full" />
        </div>
      </div>

      {/* footer info */}
      <div className="flex items-center justify-between border-t pt-3" style={{ borderColor: "#F0F2F7" }}>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.1em]" style={{ color: APROVA.inkMuted }}>Motivo freq.</p>
          <p className="text-[11.5px] font-semibold" style={{ color: APROVA.ink }}>{RISK_REASON_LABELS[topReason]}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold uppercase tracking-[0.1em]" style={{ color: APROVA.inkMuted }}>Contato médio</p>
          <p className="text-[11.5px] font-bold tabular" style={{ color: avgContact > 14 ? C_ALTO : APROVA.ink }}>
            {avgContact}d
          </p>
        </div>
      </div>
    </div>
  )
}

function TurmaView({ students }: { students: RiskStudentRow[] }) {
  const cards = useMemo(() => {
    return STUDENT_ANALYSIS_TURMAS
      .map((turma) => {
        const turmaStudents = students.filter((s) => s.turma === turma)
        const total         = ANALYSIS_STUDENTS.filter((s) => s.turma === turma).length
        const altoCount     = turmaStudents.filter((s) => s.riskLevel === "risco_alto").length
        const atencaoCount  = turmaStudents.filter((s) => s.riskLevel === "atencao").length

        const reasonCounts = {} as Record<RiskReason, number>
        turmaStudents.forEach((s) => {
          reasonCounts[s.primaryReason] = (reasonCounts[s.primaryReason] ?? 0) + 1
        })
        const topReason: RiskReason = turmaStudents.length === 0
          ? "baixo_engajamento"
          : (Object.entries(reasonCounts) as [RiskReason, number][])
              .sort((a, b) => b[1] - a[1])[0][0]

        const avgContact = turmaStudents.length === 0
          ? 0
          : Math.round(turmaStudents.reduce((s, r) => s + r.lastContactDays, 0) / turmaStudents.length)

        return {
          turma, total, altoCount, atencaoCount,
          riskCount: turmaStudents.length, topReason, avgContact,
        }
      })
      .sort((a, b) => b.riskCount - a.riskCount)
  }, [students])

  if (cards.every((c) => c.riskCount === 0)) {
    return (
      <div className="rounded-2xl py-14 text-center" style={{ background: "#F6F7FB" }}>
        <p className="text-[13px] font-semibold" style={{ color: APROVA.inkMuted }}>
          Nenhum aluno em risco para os filtros selecionados.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {cards.filter((c) => c.riskCount > 0).map((c) => (
        <TurmaCard key={c.turma} {...c} />
      ))}
    </div>
  )
}

// ─── Por Professor view ───────────────────────────────────────────────────────

function ProfessorView({ students }: { students: RiskStudentRow[] }) {
  const cards = useMemo(() => {
    return ESSAY_TEACHERS_WITH_COLOR
      .map((teacher) => {
        const ts         = students.filter((s) => s.teacherEssay === teacher.name)
        const total      = ANALYSIS_STUDENTS.filter((s) => s.teacherEssay === teacher.name).length
        const altoCount  = ts.filter((s) => s.riskLevel === "risco_alto").length
        const atnCount   = ts.filter((s) => s.riskLevel === "atencao").length

        const reasonCounts = {} as Record<RiskReason, number>
        ts.forEach((s) => { reasonCounts[s.primaryReason] = (reasonCounts[s.primaryReason] ?? 0) + 1 })
        const topReason: RiskReason = ts.length === 0
          ? "baixo_engajamento"
          : (Object.entries(reasonCounts) as [RiskReason, number][])
              .sort((a, b) => b[1] - a[1])[0][0]

        const avgContact = ts.length === 0
          ? 0
          : Math.round(ts.reduce((sum, r) => sum + r.lastContactDays, 0) / ts.length)

        return {
          name: teacher.name,
          color: teacher.color,
          initial: teacher.name[0],
          riskCount: ts.length,
          altoCount,
          atnCount,
          total,
          pct: total > 0 ? Math.round((ts.length / total) * 100) : 0,
          topReason,
          avgContact,
        }
      })
      .sort((a, b) => b.riskCount - a.riskCount)
  }, [students])

  if (cards.every((c) => c.riskCount === 0)) {
    return (
      <div className="rounded-2xl py-14 text-center" style={{ background: "#F6F7FB" }}>
        <p className="text-[13px] font-semibold" style={{ color: APROVA.inkMuted }}>
          Nenhum aluno em risco para os filtros selecionados.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.filter((c) => c.riskCount > 0).map((c) => {
        const isHigh  = c.pct >= 30
        const altoPct = (c.altoCount / c.total) * 100
        const atnPct  = (c.atnCount  / c.total) * 100
        return (
          <div
            key={c.name}
            className="flex flex-col gap-4 rounded-2xl bg-white p-5"
            style={{
              border: isHigh ? `1.5px solid ${C_ALTO}40` : "1px solid #EEF1F7",
              boxShadow: isHigh ? `0 2px 12px ${C_ALTO}14` : "0 1px 4px rgba(10,15,30,0.04)",
            }}
          >
            {/* header */}
            <div className="flex items-center gap-3">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[14px] font-black text-white"
                style={{ background: c.color }}
              >
                {c.initial}
              </div>
              <div className="min-w-0">
                <p className="truncate text-[13px] font-bold" style={{ color: APROVA.ink }}>{c.name}</p>
                <p className="text-[10.5px]" style={{ color: APROVA.inkMuted }}>Redação · {c.total} alunos</p>
              </div>
            </div>

            {/* risk count */}
            <div className="flex items-end gap-1">
              <span
                className="font-display text-[30px] font-bold tabular leading-none"
                style={{ color: isHigh ? C_ALTO : APROVA.ink }}
              >
                {c.riskCount}
              </span>
              <span className="mb-1 text-[12px] font-semibold" style={{ color: APROVA.inkMuted }}>
                em risco ({c.pct}%)
              </span>
            </div>

            {/* severity breakdown */}
            <div>
              <div className="flex h-2.5 w-full overflow-hidden rounded-full" style={{ background: "#EEF1F7" }}>
                <div style={{ width: `${atnPct}%`,  background: C_ATN  }} className="h-full" />
                <div style={{ width: `${altoPct}%`, background: C_ALTO }} className="h-full" />
              </div>
              <div className="mt-1.5 flex gap-3">
                <span className="text-[10px] font-semibold" style={{ color: C_ATN }}>Atenção: {c.atnCount}</span>
                <span className="text-[10px] font-semibold" style={{ color: C_ALTO }}>Alto: {c.altoCount}</span>
              </div>
            </div>

            {/* footer */}
            <div className="flex items-center justify-between border-t pt-3" style={{ borderColor: "#F0F2F7" }}>
              <div>
                <p className="text-[9.5px] font-bold uppercase tracking-[0.1em]" style={{ color: APROVA.inkMuted }}>Motivo freq.</p>
                <p className="text-[11px] font-semibold" style={{ color: APROVA.ink }}>{RISK_REASON_LABELS[c.topReason]}</p>
              </div>
              <div className="text-right">
                <p className="text-[9.5px] font-bold uppercase tracking-[0.1em]" style={{ color: APROVA.inkMuted }}>Contato médio</p>
                <p className="text-[11.5px] font-bold" style={{ color: c.avgContact > 14 ? C_ALTO : APROVA.ink }}>
                  {c.avgContact}d
                </p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

type ViewMode   = "alunos" | "turma" | "professor"
type LevelFilter = "all" | "risco_alto" | "atencao"

const VIEW_OPTIONS: { value: ViewMode; label: string }[] = [
  { value: "alunos",    label: "Por Aluno"     },
  { value: "turma",     label: "Por Turma"     },
  { value: "professor", label: "Por Professor" },
]

const REASON_OPTIONS: { value: RiskReason | "all"; label: string }[] = [
  { value: "all",               label: "Todos os motivos"    },
  { value: "inatividade",       label: "Inatividade"         },
  { value: "queda_nota",        label: "Queda na nota"       },
  { value: "baixo_engajamento", label: "Baixo engajamento"   },
  { value: "ausencia_simulado", label: "Ausência simulado"   },
  { value: "sem_acesso",        label: "Sem acesso"          },
]

export default function ManagerRiscoPage() {
  const [viewMode,       setViewMode]       = useState<ViewMode>("alunos")
  const [filterTurma,    setFilterTurma]    = useState<string>("all")
  const [filterTeacher,  setFilterTeacher]  = useState<string>("all")
  const [filterLevel,    setFilterLevel]    = useState<LevelFilter>("all")
  const [filterReason,   setFilterReason]   = useState<RiskReason | "all">("all")
  const [search,         setSearch]         = useState("")

  // ── KPIs (global, no filters) ──────────────────────────────────────────────
  const totalBase  = ANALYSIS_STUDENTS.length
  const riskAlto   = RISK_STUDENTS.filter((s) => s.riskLevel === "risco_alto").length
  const riskAtn    = RISK_STUDENTS.filter((s) => s.riskLevel === "atencao").length
  const totalRisk  = RISK_STUDENTS.length
  const riskPct    = Math.round((totalRisk / totalBase) * 100)

  const prevMonth  = RISK_TREND_HISTORICAL[RISK_TREND_HISTORICAL.length - 1]
  const prevTotal  = prevMonth.alto + prevMonth.atencao
  const monthDelta = totalRisk - prevTotal

  // ── Filtered dataset (for table + grouped views) ──────────────────────────
  const filtered = useMemo(() =>
    RISK_STUDENTS.filter((s) => {
      if (filterTurma   !== "all" && s.turma         !== filterTurma)   return false
      if (filterTeacher !== "all" && s.teacherEssay  !== filterTeacher) return false
      if (filterLevel   !== "all" && s.riskLevel     !== filterLevel)   return false
      if (filterReason  !== "all" && s.primaryReason !== filterReason)  return false
      if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false
      return true
    }),
  [filterTurma, filterTeacher, filterLevel, filterReason, search])

  const hasFilter =
    filterTurma !== "all" || filterTeacher !== "all" ||
    filterLevel !== "all" || filterReason  !== "all" || search !== ""

  function clearFilters() {
    setFilterTurma("all"); setFilterTeacher("all")
    setFilterLevel("all"); setFilterReason("all"); setSearch("")
  }

  return (
    <div className="mx-auto max-w-[1600px] px-4 pt-4 pb-10 lg:px-8 lg:pt-7">

      {/* ── Header ── */}
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <PageHeader
          kicker="Monitoramento"
          title="Alunos em Risco"
          subtitle="Panorama agregado de risco — turmas, professores e motivos"
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

        {/* Total em risco */}
        <div
          className="flex items-center gap-3 rounded-2xl bg-white p-4"
          style={{ border: `1.5px solid ${C_ALTO}30`, boxShadow: `0 2px 10px ${C_ALTO}0A` }}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: C_ALTO_BG }}>
            <Warning size={18} weight="fill" color={C_ALTO} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: APROVA.inkMuted }}>Total em risco</p>
            <div className="flex items-baseline gap-1.5">
              <p className="font-display text-[26px] font-bold tabular leading-none" style={{ color: C_ALTO }}>{totalRisk}</p>
              <p className="text-[12px] font-bold" style={{ color: APROVA.inkMuted }}>{riskPct}% da base</p>
            </div>
          </div>
        </div>

        {/* Risco Alto */}
        <div
          className="flex items-center gap-3 rounded-2xl bg-white p-4"
          style={{ border: "1px solid #EEF1F7", boxShadow: "0 1px 4px rgba(10,15,30,0.04)" }}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: C_ALTO_BG }}>
            <Fire size={18} weight="fill" color={C_ALTO} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: APROVA.inkMuted }}>Risco Alto</p>
            <p className="font-display text-[26px] font-bold tabular leading-none" style={{ color: C_ALTO }}>{riskAlto}</p>
          </div>
        </div>

        {/* Em Atenção */}
        <div
          className="flex items-center gap-3 rounded-2xl bg-white p-4"
          style={{ border: "1px solid #EEF1F7", boxShadow: "0 1px 4px rgba(10,15,30,0.04)" }}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: C_ATN_BG }}>
            <Users size={18} weight="fill" color={C_ATN} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: APROVA.inkMuted }}>Em Atenção</p>
            <p className="font-display text-[26px] font-bold tabular leading-none" style={{ color: C_ATN }}>{riskAtn}</p>
          </div>
        </div>

        {/* Variação vs mês anterior */}
        <div
          className="flex items-center gap-3 rounded-2xl bg-white p-4"
          style={{ border: "1px solid #EEF1F7", boxShadow: "0 1px 4px rgba(10,15,30,0.04)" }}
        >
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
            style={{ background: monthDelta > 0 ? C_ALTO_BG : "#E6F8F0" }}
          >
            {monthDelta > 0
              ? <CaretUp size={18} weight="fill" color={C_ALTO} />
              : <CaretDown size={18} weight="fill" color={APROVA.success} />}
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: APROVA.inkMuted }}>Vs. mês anterior</p>
            <div className="flex items-baseline gap-1">
              <p
                className="font-display text-[26px] font-bold tabular leading-none"
                style={{ color: monthDelta > 0 ? C_ALTO : APROVA.success }}
              >
                {monthDelta > 0 ? "+" : ""}{monthDelta}
              </p>
              <p className="text-[11px]" style={{ color: APROVA.inkMuted }}>vs. jun ({prevTotal})</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Chart + Risk by turma ── */}
      <div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_280px]">
        <RiskTrendChart altoNow={riskAlto} atencaoNow={riskAtn} />
        <RiskByTurmaPanel />
      </div>

      {/* ── View toggle + Filters ── */}
      <div className="mb-3 flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Segmented options={VIEW_OPTIONS} value={viewMode} onChange={setViewMode} />
          {hasFilter && (
            <button
              onClick={clearFilters}
              className="text-[11.5px] font-bold transition-opacity hover:opacity-70"
              style={{ color: APROVA.blue }}
            >
              Limpar filtros
            </button>
          )}
        </div>

        {/* Turma */}
        <ChipRow>
          <Chip active={filterTurma === "all"} onClick={() => setFilterTurma("all")}>Todas as turmas</Chip>
          {STUDENT_ANALYSIS_TURMAS.map((t) => (
            <Chip key={t} active={filterTurma === t} onClick={() => setFilterTurma(t)}>{t}</Chip>
          ))}
        </ChipRow>

        {/* Professor + nível */}
        <ChipRow>
          <Chip active={filterTeacher === "all"} onClick={() => setFilterTeacher("all")}>Todos os professores</Chip>
          {ESSAY_TEACHERS_WITH_COLOR.map((t) => (
            <Chip key={t.name} active={filterTeacher === t.name} onClick={() => setFilterTeacher(t.name)}>
              {t.name}
            </Chip>
          ))}
          <Chip
            active={filterLevel === "risco_alto"}
            onClick={() => setFilterLevel(filterLevel === "risco_alto" ? "all" : "risco_alto")}
            color={C_ALTO}
          >
            Risco Alto
          </Chip>
          <Chip
            active={filterLevel === "atencao"}
            onClick={() => setFilterLevel(filterLevel === "atencao" ? "all" : "atencao")}
            color={C_ATN}
          >
            Em Atenção
          </Chip>
        </ChipRow>

        {/* Motivo */}
        <ChipRow>
          {REASON_OPTIONS.map((o) => (
            <Chip
              key={o.value}
              active={filterReason === o.value}
              onClick={() => setFilterReason(o.value)}
            >
              {o.label}
            </Chip>
          ))}
        </ChipRow>
      </div>

      {/* ── Content area ── */}
      {viewMode === "alunos" && (
        <StudentTable
          key={`${filterTurma}|${filterTeacher}|${filterLevel}|${filterReason}|${search}`}
          rows={filtered}
        />
      )}
      {viewMode === "turma" && <TurmaView students={filtered} />}
      {viewMode === "professor" && <ProfessorView students={filtered} />}

    </div>
  )
}
