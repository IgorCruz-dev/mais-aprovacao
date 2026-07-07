"use client"

import { useState } from "react"
import {
  ChartLineUp, Exam, PencilLine, Clock, VideoCamera, Users,
  Books, Certificate, GraduationCap, Medal,
} from "@phosphor-icons/react"
import {
  APROVA, BentoCard, PageHeader, SectionTitle, ProgressBar, Avatar,
  Segmented, KpiCard, DataTable, type DataTableColumn,
} from "@/components/manager/ManagerSurface"
import {
  PEDAGOGICO_SUMMARY, MODULE_COMPLETION_BY_COURSE, TEACHERS, type TeacherRow,
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

function EssaysCorrectionSummary() {
  return (
    <BentoCard>
      <SectionTitle title="Redações: corrigidas vs. pendentes" kicker="Pedagógico" />
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="font-display text-[32px] font-bold tabular" style={{ color: APROVA.success }}>{PEDAGOGICO_SUMMARY.essaysCorrected30d}</p>
          <p className="text-[11px] font-semibold" style={{ color: APROVA.inkMuted }}>corrigidas (30d)</p>
        </div>
        <div>
          <p className="font-display text-[32px] font-bold tabular" style={{ color: APROVA.error }}>{PEDAGOGICO_SUMMARY.essaysPending}</p>
          <p className="text-[11px] font-semibold" style={{ color: APROVA.inkMuted }}>pendentes agora</p>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: "#F6F7FB" }}>
        <Clock size={15} color={APROVA.inkMuted} />
        <span className="text-[12px] font-semibold" style={{ color: APROVA.inkMuted }}>
          SLA médio de correção: <span className="font-bold" style={{ color: APROVA.ink }}>{PEDAGOGICO_SUMMARY.essaysAvgSlaHours}h</span>
        </span>
      </div>
    </BentoCard>
  )
}

function PedagogicoView() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard label="Conclusão de módulos" value={PEDAGOGICO_SUMMARY.moduleCompletionPct} unit="%" icon={ChartLineUp} color={APROVA.success} />
        <KpiCard label="Nota média simulados" value={PEDAGOGICO_SUMMARY.avgExamScore.toFixed(1)} unit="%" icon={Exam} color={APROVA.blue} />
        <KpiCard label="SLA médio redação" value={PEDAGOGICO_SUMMARY.essaysAvgSlaHours} unit="h" icon={PencilLine} color={APROVA.gold} />
        <KpiCard label="Simulados concluídos (30d)" value={PEDAGOGICO_SUMMARY.examSessionsCompleted30d} icon={GraduationCap} color={APROVA.blueBright} />
        <KpiCard label="Questões respondidas (30d)" value={PEDAGOGICO_SUMMARY.questionsAnswered30d.toLocaleString("pt-BR")} icon={Books} color={APROVA.streak} />
        <KpiCard label="Certificados emitidos (30d)" value={PEDAGOGICO_SUMMARY.certificatesIssued30d} icon={Certificate} color={APROVA.success} />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ModuleCompletionByCourse />
        <EssaysCorrectionSummary />
      </div>
    </div>
  )
}

function ProfessoresView() {
  const columns: DataTableColumn<TeacherRow>[] = [
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
      key: "liveClasses",
      header: "Aulões (30d)",
      render: (row) => (
        <span className="inline-flex items-center gap-1 tabular" style={{ color: APROVA.ink }}>
          <VideoCamera size={13} weight="fill" color={APROVA.blue} /> {row.liveClassesGiven30d}
        </span>
      ),
    },
    {
      key: "attendance",
      header: "Presença média",
      render: (row) => (
        <div className="flex w-24 items-center gap-2">
          <ProgressBar pct={row.avgAttendance} height={6} color={APROVA.blue} />
          <span className="w-8 text-right text-[11px] font-bold tabular" style={{ color: APROVA.inkMuted }}>{row.avgAttendance}%</span>
        </div>
      ),
    },
    {
      key: "essays",
      header: "Redações corrigidas (30d)",
      render: (row) => <span className="tabular font-bold" style={{ color: row.essaysCorrected30d > 0 ? APROVA.ink : APROVA.inkMuted }}>{row.essaysCorrected30d || "—"}</span>,
    },
  ]

  const totalEssays = TEACHERS.reduce((a, t) => a + t.essaysCorrected30d, 0)
  const totalCourses = TEACHERS.reduce((a, t) => a + t.coursesActive, 0)
  const topTeacher = [...TEACHERS].sort((a, b) => b.liveClassesGiven30d - a.liveClassesGiven30d)[0]

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard label="Professores ativos" value={TEACHERS.length} icon={Users} color={APROVA.blue} />
        <KpiCard label="Cursos ativos (total)" value={totalCourses} icon={Books} color={APROVA.blueBright} />
        <KpiCard label="Aulões (30d)" value={TEACHERS.reduce((a, t) => a + t.liveClassesGiven30d, 0)} icon={VideoCamera} color={APROVA.gold} />
        <KpiCard label="Presença média" value={Math.round(TEACHERS.reduce((a, t) => a + t.avgAttendance, 0) / TEACHERS.length)} unit="%" icon={ChartLineUp} color={APROVA.success} />
        <KpiCard label="Redações corrigidas (30d)" value={totalEssays} icon={PencilLine} color={APROVA.streak} />
        <KpiCard label="Mais engajado" value={topTeacher.name.split(" ")[0]} icon={Medal} color={APROVA.gold} />
      </div>
      <BentoCard>
        <DataTable columns={columns} rows={TEACHERS} emptyMessage="Nenhum professor cadastrado." />
      </BentoCard>
    </div>
  )
}

export default function ManagerPedagogicoPage() {
  const [view, setView] = useState<"pedagogico" | "professores">("pedagogico")

  return (
    <div className="mx-auto max-w-[1680px] px-4 pt-4 lg:px-8 lg:pt-7">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <PageHeader kicker="Gestão" title="Pedagógico" subtitle="Desempenho acadêmico e atuação dos professores" />
        <Segmented
          options={[{ value: "pedagogico", label: "Pedagógico" }, { value: "professores", label: "Professores" }]}
          value={view}
          onChange={setView}
        />
      </div>

      {view === "pedagogico" ? <PedagogicoView /> : <ProfessoresView />}
    </div>
  )
}
