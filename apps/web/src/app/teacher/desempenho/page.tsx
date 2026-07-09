"use client"

import { useState } from "react"
import { ChartLineUp, Fire, PencilLine, Exam } from "@phosphor-icons/react"
import {
  APROVA, BentoCard, PageHeader, Chip, ChipRow, ProgressBar, SectionTitle, Segmented,
  RevealGroup, RevealItem, KpiCard, AnimatedNumber, DataTable, type DataTableColumn, Avatar,
} from "@/components/teacher/TeacherSurface"
import { TeacherInsightCard, StudentAcademicBadge } from "@/components/teacher/TeacherSurface"
import { TURMAS, TEACHER_STUDENTS, TEACHER_INSIGHTS, REDACOES, SIMULADOS } from "@/lib/mock-teacher-data"

const PERIOD_OPTIONS = [
  { value: "week", label: "Semana" },
  { value: "month", label: "Mês" },
  { value: "quarter", label: "Trimestre" },
]

export default function DesempenhoPage() {
  const [turmaFilter, setTurmaFilter] = useState<string>("all")
  const [period, setPeriod] = useState("month")

  const students = turmaFilter === "all" ? TEACHER_STUDENTS : TEACHER_STUDENTS.filter((s) => s.turmaId === turmaFilter)

  const avgScore = students.length > 0
    ? Math.round(students.reduce((a, s) => a + s.mediaGeral, 0) / students.length)
    : 0
  const avgFreq = students.length > 0
    ? Math.round(students.reduce((a, s) => a + s.frequencia, 0) / students.length)
    : 0

  // Subject performance average
  const subjectMap: Record<string, number[]> = {}
  students.forEach((s) => {
    s.subjectPerformance.forEach((sp) => {
      if (!subjectMap[sp.subject]) subjectMap[sp.subject] = []
      subjectMap[sp.subject].push(sp.pct)
    })
  })
  const subjectAvg = Object.entries(subjectMap)
    .map(([subject, values]) => ({
      subject,
      avg: Math.round(values.reduce((a, b) => a + b, 0) / values.length),
    }))
    .sort((a, b) => a.avg - b.avg)

  const riskStudents = students.filter((s) => s.riskLevel !== "otimo")

  type RiskRow = typeof riskStudents[0]
  const riskColumns: DataTableColumn<RiskRow>[] = [
    {
      key: "name", header: "Aluno",
      render: (r) => (
        <div className="flex items-center gap-2.5">
          <Avatar initial={r.initial} color={r.color} size={30} />
          <div className="min-w-0">
            <p className="truncate text-[12.5px] font-bold" style={{ color: APROVA.ink }}>{r.name}</p>
            <p className="text-[10.5px]" style={{ color: APROVA.inkMuted }}>{r.turmaNome}</p>
          </div>
        </div>
      ),
    },
    { key: "status", header: "Status", render: (r) => <StudentAcademicBadge status={r.riskLevel} /> },
    {
      key: "media", header: "Média",
      render: (r) => <span className="font-bold tabular" style={{ color: r.mediaGeral >= 60 ? APROVA.gold : APROVA.error }}>{r.mediaGeral}%</span>,
    },
    {
      key: "freq", header: "Frequência",
      render: (r) => <span className="tabular" style={{ color: r.frequencia >= 70 ? APROVA.gold : APROVA.error }}>{r.frequencia}%</span>,
    },
    { key: "last", header: "Última atividade", render: (r) => <span style={{ color: APROVA.inkMuted }}>{r.lastActivityAt}</span> },
  ]

  const concluidos = REDACOES.filter((r) => r.status === "concluida")
  const simuladosConcluidos = SIMULADOS.filter((s) => s.status === "concluido")

  return (
    <RevealGroup className="mx-auto max-w-[1240px] px-4 pt-4 lg:px-8 lg:pt-7">
      <RevealItem>
        <PageHeader
          kicker="Analytics"
          title="Desempenho"
          subtitle="Análise pedagógica consolidada"
        />
      </RevealItem>

      <RevealItem className="mb-4 flex flex-wrap items-center gap-3">
        <Segmented options={PERIOD_OPTIONS} value={period} onChange={setPeriod} />
        <ChipRow>
          <Chip active={turmaFilter === "all"} onClick={() => setTurmaFilter("all")}>Todas</Chip>
          {TURMAS.map((t) => (
            <Chip key={t.id} active={turmaFilter === t.id} onClick={() => setTurmaFilter(t.id)} color={APROVA.blue}>
              {t.nome}
            </Chip>
          ))}
        </ChipRow>
      </RevealItem>

      <RevealItem className="mb-5">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          <KpiCard label="Média geral" value={<AnimatedNumber value={avgScore} />} unit="%" icon={ChartLineUp} color={avgScore >= 70 ? APROVA.success : APROVA.gold} />
          <KpiCard label="Frequência média" value={<AnimatedNumber value={avgFreq} />} unit="%" icon={Fire} color={avgFreq >= 80 ? APROVA.success : APROVA.gold} />
          <KpiCard label="Redações corrigidas" value={<AnimatedNumber value={concluidos.length} />} icon={PencilLine} color="#6C4BD9" />
          <KpiCard label="Simulados aplicados" value={<AnimatedNumber value={simuladosConcluidos.length} />} icon={Exam} color="#D97706" />
        </div>
      </RevealItem>

      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[1fr_360px] lg:items-start lg:gap-5">
        <div className="flex flex-col gap-4">
          {/* Desempenho por matéria */}
          <RevealItem>
            <BentoCard>
              <SectionTitle title="Desempenho por matéria" kicker="Média consolidada" />
              <div className="flex flex-col gap-3">
                {subjectAvg.length === 0 ? (
                  <p className="py-2 text-[12.5px]" style={{ color: APROVA.inkMuted }}>Sem dados para o filtro selecionado.</p>
                ) : subjectAvg.map(({ subject, avg }) => (
                  <div key={subject}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-[12.5px] font-semibold" style={{ color: APROVA.ink }}>{subject}</span>
                      <span className="text-[12.5px] font-bold tabular" style={{ color: avg >= 70 ? APROVA.success : avg >= 50 ? "#B45309" : APROVA.error }}>{avg}%</span>
                    </div>
                    <ProgressBar pct={avg} height={8} color={avg >= 70 ? APROVA.success : avg >= 50 ? "#F59E0B" : APROVA.error} />
                  </div>
                ))}
              </div>
            </BentoCard>
          </RevealItem>

          {/* Alunos em atenção */}
          {riskStudents.length > 0 && (
            <RevealItem>
              <BentoCard>
                <SectionTitle title="Alunos que precisam de atenção" kicker="Risco" />
                <DataTable columns={riskColumns} rows={riskStudents} pageSize={8} />
              </BentoCard>
            </RevealItem>
          )}
        </div>

        <div className="flex flex-col gap-4">
          {/* Distribuição risco */}
          <RevealItem>
            <BentoCard>
              <SectionTitle title="Distribuição por status" kicker="Alunos" />
              <div className="flex flex-col gap-3">
                {[
                  { label: "Ótimo", count: students.filter((s) => s.riskLevel === "otimo").length, color: APROVA.success },
                  { label: "Atenção", count: students.filter((s) => s.riskLevel === "atencao").length, color: "#F59E0B" },
                  { label: "Risco", count: students.filter((s) => s.riskLevel === "risco").length, color: APROVA.error },
                ].map(({ label, count, color }) => (
                  <div key={label} className="flex items-center gap-3">
                    <span className="w-14 text-[12.5px] font-bold" style={{ color }}>{label}</span>
                    <div className="flex-1">
                      <ProgressBar
                        pct={students.length > 0 ? Math.round((count / students.length) * 100) : 0}
                        height={8}
                        color={color}
                      />
                    </div>
                    <span className="w-6 text-right text-[13px] font-bold tabular" style={{ color: APROVA.ink }}>{count}</span>
                  </div>
                ))}
              </div>
            </BentoCard>
          </RevealItem>

          {/* Turmas comparativo */}
          <RevealItem>
            <BentoCard>
              <SectionTitle title="Comparativo por turma" kicker="Desempenho" />
              <div className="flex flex-col gap-3">
                {TURMAS.map((t) => (
                  <div key={t.id}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-[12.5px] font-semibold" style={{ color: APROVA.ink }}>{t.nome}</span>
                      <span className="text-[12.5px] font-bold tabular" style={{ color: t.mediaGeral >= 70 ? APROVA.success : t.mediaGeral >= 50 ? "#B45309" : APROVA.error }}>{t.mediaGeral}%</span>
                    </div>
                    <ProgressBar pct={t.mediaGeral} height={7} color={t.mediaGeral >= 70 ? APROVA.success : t.mediaGeral >= 50 ? "#F59E0B" : APROVA.error} />
                  </div>
                ))}
              </div>
            </BentoCard>
          </RevealItem>

          {/* Insights */}
          <RevealItem>
            <BentoCard>
              <SectionTitle title="Insights automáticos" kicker="IA Pedagógica" />
              <TeacherInsightCard insights={TEACHER_INSIGHTS} />
            </BentoCard>
          </RevealItem>
        </div>
      </div>
    </RevealGroup>
  )
}
