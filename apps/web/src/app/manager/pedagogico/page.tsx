"use client"

import { useState } from "react"
import {
  ChartLineUp, Exam, PencilLine, Clock, Users,
  Books, Certificate, GraduationCap, Medal, CalendarBlank,
} from "@phosphor-icons/react"
import {
  APROVA, BentoCard, PageHeader, SectionTitle, ProgressBar, Avatar,
  Segmented, KpiCard, DataTable, type DataTableColumn, AnimatedNumber,
} from "@/components/manager/ManagerSurface"
import {
  MODULE_COMPLETION_BY_COURSE, getPedagogicoSummaryForPeriod, getTeachersForPeriod,
  PERIOD_OPTIONS, type PeriodKey, type TeacherRowForPeriod,
} from "@/lib/mock-manager-data"

function ModuleCompletionByCourse() {
  return (
    <BentoCard>
      <SectionTitle title="Conclusão de módulos por curso" kicker="Pedagógico" />
      <div className="flex flex-col gap-3">
        {MODULE_COMPLETION_BY_COURSE.map((row) => (
          <div key={row.id}>
            <div className="mb-1 flex items-center justify-between text-[12px] font-semibold" style={{ color: APROVA.ink }}>
              <span>{row.course}</span>
              <span className="tabular font-bold">{row.pct}%</span>
            </div>
            <ProgressBar pct={row.pct} color={APROVA.success} height={7} />
          </div>
        ))}
      </div>
    </BentoCard>
  )
}

function EssaysCorrectionSummary({ essaysCorrected, essaysPending, essaysAvgSlaHours }: { essaysCorrected: number; essaysPending: number; essaysAvgSlaHours: number }) {
  return (
    <BentoCard>
      <SectionTitle title="Redações: corrigidas vs. pendentes" kicker="Pedagógico" />
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="font-display text-[32px] font-bold tabular" style={{ color: APROVA.success }}><AnimatedNumber value={essaysCorrected} /></p>
          <p className="text-[11px] font-semibold" style={{ color: APROVA.inkMuted }}>corrigidas no período</p>
        </div>
        <div>
          <p className="font-display text-[32px] font-bold tabular" style={{ color: APROVA.error }}><AnimatedNumber value={essaysPending} /></p>
          <p className="text-[11px] font-semibold" style={{ color: APROVA.inkMuted }}>pendentes agora</p>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: "#F6F7FB" }}>
        <Clock size={15} color={APROVA.inkMuted} />
        <span className="text-[12px] font-semibold" style={{ color: APROVA.inkMuted }}>
          SLA médio de correção: <span className="font-bold" style={{ color: APROVA.ink }}><AnimatedNumber value={essaysAvgSlaHours} />h</span>
        </span>
      </div>
    </BentoCard>
  )
}

function PedagogicoView({ period }: { period: PeriodKey }) {
  const summary = getPedagogicoSummaryForPeriod(period)
  const periodLabel = PERIOD_OPTIONS.find((o) => o.value === period)?.label.toLowerCase() ?? ""

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard label="Conclusão de módulos" value={<AnimatedNumber value={summary.moduleCompletionPct} />} unit="%" icon={ChartLineUp} color={APROVA.success} />
        <KpiCard label="Nota média simulados" value={<AnimatedNumber value={summary.avgExamScore} format={(v) => v.toFixed(1)} />} unit="%" icon={Exam} color={APROVA.blue} />
        <KpiCard label="Tempo médio p/ correção de redação" value={<AnimatedNumber value={summary.essaysAvgSlaHours} />} unit="h" icon={PencilLine} color={APROVA.gold} />
        <KpiCard label={`Simulados concluídos (${periodLabel})`} value={<AnimatedNumber value={summary.examSessionsCompleted} />} icon={GraduationCap} color={APROVA.blueBright} />
        <KpiCard label={`Questões respondidas (${periodLabel})`} value={<AnimatedNumber value={summary.questionsAnswered} />} icon={Books} color={APROVA.streak} />
        <KpiCard label={`Certificados emitidos (${periodLabel})`} value={<AnimatedNumber value={summary.certificatesIssued} />} icon={Certificate} color={APROVA.success} />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ModuleCompletionByCourse />
        <EssaysCorrectionSummary essaysCorrected={summary.essaysCorrected} essaysPending={summary.essaysPending} essaysAvgSlaHours={summary.essaysAvgSlaHours} />
      </div>
    </div>
  )
}

function ProfessoresView({ period }: { period: PeriodKey }) {
  const teachers = getTeachersForPeriod(period)
  const periodLabel = PERIOD_OPTIONS.find((o) => o.value === period)?.label.toLowerCase() ?? ""

  const columns: DataTableColumn<TeacherRowForPeriod>[] = [
    {
      key: "name",
      header: "Professor",
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <Avatar initial={row.initial} size={30} color={APROVA.blueBright} />
          <span className="font-bold" style={{ color: APROVA.ink }}>{row.name}</span>
        </div>
      ),
    },
    { key: "courses", header: "Cursos ativos", render: (row) => <span className="tabular" style={{ color: APROVA.inkMuted }}>{row.coursesActive}</span> },
    {
      key: "attendance",
      header: "Presença média",
      render: (row) => (
        <div className="flex w-24 items-center gap-2">
          <ProgressBar pct={row.avgAttendance} height={6} color={APROVA.blue} />
          <span className="w-8 text-right text-[11px] font-bold tabular" style={{ color: APROVA.inkMuted }}><AnimatedNumber value={row.avgAttendance} />%</span>
        </div>
      ),
    },
    {
      key: "essays",
      header: `Redações corrigidas (${periodLabel})`,
      render: (row) => <span className="tabular font-bold" style={{ color: row.essaysCorrected > 0 ? APROVA.ink : APROVA.inkMuted }}>{row.essaysCorrected > 0 ? <AnimatedNumber value={row.essaysCorrected} /> : "—"}</span>,
    },
  ]

  const totalEssays = teachers.reduce((a, t) => a + t.essaysCorrected, 0)
  const totalCourses = teachers.reduce((a, t) => a + t.coursesActive, 0)
  const topTeacher = [...teachers].sort((a, b) => b.avgAttendance - a.avgAttendance)[0]

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-5">
        <KpiCard label="Professores ativos" value={<AnimatedNumber value={teachers.length} />} icon={Users} color={APROVA.blue} />
        <KpiCard label="Cursos ativos (total)" value={<AnimatedNumber value={totalCourses} />} icon={Books} color={APROVA.blueBright} />
        <KpiCard label="Presença média" value={<AnimatedNumber value={teachers.reduce((a, t) => a + t.avgAttendance, 0) / teachers.length} />} unit="%" icon={ChartLineUp} color={APROVA.success} />
        <KpiCard label={`Redações corrigidas (${periodLabel})`} value={<AnimatedNumber value={totalEssays} />} icon={PencilLine} color={APROVA.streak} />
        <KpiCard label="Mais engajado" value={topTeacher.name.split(" ")[0]} icon={Medal} color={APROVA.gold} />
      </div>
      <BentoCard>
        <DataTable columns={columns} rows={teachers} emptyMessage="Nenhum professor cadastrado." />
      </BentoCard>
    </div>
  )
}

export default function ManagerPedagogicoPage() {
  const [view, setView] = useState<"pedagogico" | "professores">("pedagogico")
  const [period, setPeriod] = useState<PeriodKey>("month")

  return (
    <div className="mx-auto max-w-[1680px] px-4 pt-4 lg:px-8 lg:pt-7">
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <PageHeader kicker="Gestão" title="Pedagógico" subtitle="Desempenho acadêmico e atuação dos professores" />
        <Segmented
          options={[{ value: "pedagogico", label: "Pedagógico" }, { value: "professores", label: "Professores" }]}
          value={view}
          onChange={setView}
        />
      </div>

      <div className="mb-5 flex items-center gap-2">
        <CalendarBlank size={15} color={APROVA.inkMuted} />
        <span className="text-[12px] font-semibold" style={{ color: APROVA.inkMuted }}>Período:</span>
        <Segmented options={PERIOD_OPTIONS} value={period} onChange={setPeriod} />
      </div>

      {view === "pedagogico" ? <PedagogicoView period={period} /> : <ProfessoresView period={period} />}
    </div>
  )
}
