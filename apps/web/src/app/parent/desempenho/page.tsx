"use client"

import { useState } from "react"
import { BookOpen, ChartLine, Exam, Lightbulb, PencilLine } from "@phosphor-icons/react"
import { MOCK_STUDENTS } from "@/lib/mock-parent-data"
import {
  APROVA,
  BentoCard,
  Chip,
  ChipRow,
  GradientAreaChart,
  PageHeader,
  ProgressBar,
  RevealGroup,
  RevealItem,
  SectionTitle,
} from "@/components/student/StudentSurface"
import { KpiCard } from "@/components/manager/ManagerSurface"

type Filter = "ambos" | "student-ana" | "student-pedro"

const INSIGHTS: Record<Filter, string[]> = {
  ambos: [
    "Ana Luíza mantém crescimento consistente — 12% de melhora em Matemática no último mês.",
    "Pedro Henrique precisa retomar Ciências da Natureza — desempenho abaixo de 40%.",
    "Nenhuma redação foi enviada por Pedro este mês. Incentive o envio para melhorar a nota.",
    "Ana está entre os 10% melhores da turma em Matemática.",
  ],
  "student-ana": [
    "Ana cresceu 12% em Matemática nas últimas 4 semanas.",
    "Ciências Humanas ainda precisa de atenção — foco recomendado em História Geral.",
    "Redação: 3 enviadas, 1 corrigida. Ótimo ritmo para o ENEM.",
  ],
  "student-pedro": [
    "Pedro precisa retomar Matemática e Ciências da Natureza com urgência.",
    "Nenhuma redação enviada este mês — é fundamental para a nota do ENEM.",
    "Frequência baixa (61%) pode impactar diretamente o desempenho nos simulados.",
  ],
}

export default function ParentDesempenhoPage() {
  const [filter, setFilter] = useState<Filter>("ambos")

  const students =
    filter === "ambos" ? MOCK_STUDENTS : MOCK_STUDENTS.filter((s) => s.id === filter)

  const mediaGeral = Math.round(students.reduce((acc, s) => acc + s.mediaGeral, 0) / students.length)
  const totalSimulados = students.reduce((acc, s) => acc + s.simuladosFeitos, 0)
  const totalRedacoes = students.reduce((acc, s) => acc + s.redacoesEntregues, 0)
  const totalQuestoes = students.reduce((acc, s) => acc + s.questoesRespondidas, 0)

  const weeklyData =
    filter === "ambos"
      ? MOCK_STUDENTS[0].weeklyProgress.map((v, i) => Math.round((v + MOCK_STUDENTS[1].weeklyProgress[i]) / 2))
      : students[0].weeklyProgress

  return (
    <RevealGroup className="mx-auto max-w-[1240px] px-4 pt-4 pb-10 lg:px-8 lg:pt-7">
      <RevealItem>
        <PageHeader
          kicker="Área do responsável"
          title="Desempenho"
          subtitle="Evolução acadêmica e análise por matéria."
        />
        <ChipRow>
          <Chip active={filter === "ambos"} onClick={() => setFilter("ambos")}>Todos os alunos</Chip>
          {MOCK_STUDENTS.map((s) => (
            <Chip key={s.id} active={filter === s.id} onClick={() => setFilter(s.id as Filter)}>
              {s.name.split(" ")[0]}
            </Chip>
          ))}
        </ChipRow>
      </RevealItem>

      {/* KPIs */}
      <RevealItem className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <KpiCard label="Média geral" value={`${mediaGeral}%`} icon={ChartLine} color={APROVA.blue} delta={+4.2} />
        <KpiCard label="Simulados feitos" value={totalSimulados} icon={Exam} color="#D97706" />
        <KpiCard label="Redações enviadas" value={totalRedacoes} icon={PencilLine} color="#6C4BD9" />
        <KpiCard label="Questões resolvidas" value={totalQuestoes} icon={BookOpen} color={APROVA.success} />
      </RevealItem>

      {/* Evolução + matérias */}
      <div className="mt-3 flex flex-col gap-3 lg:mt-4 lg:grid lg:grid-cols-[1fr_340px] lg:items-start lg:gap-5">
        {/* Evolução */}
        <RevealItem>
          <BentoCard>
            <SectionTitle title="Evolução das últimas 7 semanas" kicker="Progresso" />
            <GradientAreaChart
              data={weeklyData}
              color={APROVA.blue}
              height={140}
              labels={["S1", "S2", "S3", "S4", "S5", "S6", "S7"]}
              valueFormat={(v) => `${Math.round(v)}%`}
            />
            <p className="mt-2 text-[12px]" style={{ color: APROVA.inkMuted }}>
              {filter === "ambos" ? "Média entre todos os alunos" : `Desempenho geral de ${students[0].name.split(" ")[0]}`}
            </p>
          </BentoCard>
        </RevealItem>

        {/* Insights */}
        <RevealItem>
          <BentoCard>
            <SectionTitle title="Insights" kicker="Análise automática" />
            <div className="flex flex-col gap-2.5">
              {INSIGHTS[filter].map((text, i) => (
                <div key={i} className="flex items-start gap-3 rounded-2xl p-3.5" style={{ background: APROVA.surface }}>
                  <Lightbulb size={16} weight="fill" color={i % 2 === 0 ? APROVA.blue : APROVA.gold} className="mt-0.5 shrink-0" />
                  <p className="text-[12.5px] leading-relaxed" style={{ color: APROVA.ink }}>{text}</p>
                </div>
              ))}
            </div>
          </BentoCard>
        </RevealItem>
      </div>

      {/* Por aluno — matérias */}
      <RevealItem className="mt-3 lg:mt-4">
        <SectionTitle title="Desempenho por matéria" kicker="Detalhado" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {students.map((student) => (
            <BentoCard key={student.id}>
              <div className="mb-4 flex items-center gap-2">
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-bold text-white"
                  style={{ background: student.color, fontSize: 13 }}
                >
                  {student.initial}
                </div>
                <p className="text-[15px] font-extrabold" style={{ color: APROVA.ink }}>{student.name.split(" ")[0]}</p>
              </div>
              <div className="flex flex-col gap-3">
                {student.subjectPerformance.map((s) => (
                  <div key={s.subject}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-[12.5px] font-semibold" style={{ color: APROVA.ink }}>{s.subject}</span>
                      <div className="flex items-center gap-1.5">
                        {s.forte && (
                          <span className="rounded-full px-1.5 py-0.5 text-[9px] font-bold" style={{ background: "#E6F8F0", color: APROVA.successDeep }}>Forte</span>
                        )}
                        <span className="text-[12px] font-extrabold" style={{ color: s.pct >= 60 ? APROVA.successDeep : s.pct >= 45 ? "#B45309" : APROVA.error }}>
                          {s.pct}%
                        </span>
                      </div>
                    </div>
                    <ProgressBar
                      pct={s.pct}
                      color={s.pct >= 60 ? APROVA.success : s.pct >= 45 ? APROVA.gold : APROVA.error}
                      height={6}
                    />
                  </div>
                ))}
              </div>
            </BentoCard>
          ))}
        </div>
      </RevealItem>
    </RevealGroup>
  )
}
