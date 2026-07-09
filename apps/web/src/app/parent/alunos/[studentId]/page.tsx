"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import {
  ArrowLeft,
  BookOpen,
  CheckCircle,
  Exam,
  Fire,
  Lightbulb,
  PencilLine,
  Trophy,
  WarningCircle,
} from "@phosphor-icons/react"
import { MOCK_ACTIVITIES, MOCK_STUDENTS } from "@/lib/mock-parent-data"
import {
  APROVA,
  BentoCard,
  GradientAreaChart,
  NavyCard,
  ProgressBar,
  RevealGroup,
  RevealItem,
  SectionTitle,
  useCountUp,
} from "@/components/student/StudentSurface"
import { KpiCard } from "@/components/manager/ManagerSurface"
import {
  ActivityTimelineItem,
  FinanceStatusBadge,
  InsightCard,
  StudentStatusBadge,
  WeekdayDots,
} from "@/components/parent/ParentSurface"

export default function ParentStudentDetailPage() {
  const { studentId } = useParams<{ studentId: string }>()
  const student = MOCK_STUDENTS.find((s) => s.id === studentId)

  // hooks must be called unconditionally
  const points = useCountUp(student?.points ?? 0)
  const activities = MOCK_ACTIVITIES.filter((a) => a.studentId === studentId)

  if (!student) {
    return (
      <div className="mx-auto max-w-4xl px-4 pt-8">
        <Link href="/parent/alunos" className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-bold" style={{ color: APROVA.blue }}>
          <ArrowLeft size={15} weight="bold" /> Alunos
        </Link>
        <BentoCard>
          <p className="text-[15px] font-extrabold" style={{ color: APROVA.ink }}>Aluno não encontrado</p>
          <p className="mt-1 text-[13px]" style={{ color: APROVA.inkMuted }}>
            Verifique se o vínculo está ativo e tente novamente.
          </p>
        </BentoCard>
      </div>
    )
  }

  return (
    <RevealGroup className="mx-auto max-w-[1240px] px-4 pt-4 pb-10 lg:px-8 lg:pt-7">
      <RevealItem>
        <Link href="/parent/alunos" className="mb-5 inline-flex items-center gap-1.5 text-[13px] font-bold" style={{ color: APROVA.blue }}>
          <ArrowLeft size={15} weight="bold" /> Alunos
        </Link>
      </RevealItem>

      {/* Student header */}
      <RevealItem>
        <NavyCard halftone="white" className="p-5 lg:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-4">
              <div
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl font-display text-[28px] font-extrabold text-white"
                style={{ background: student.color }}
              >
                {student.initial}
              </div>
              <div>
                <h1 className="font-display text-[26px] font-bold leading-tight text-white lg:text-[32px]">
                  {student.name}
                </h1>
                <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.6)" }}>
                  {student.turma} · {student.curso}
                </p>
                <p className="mt-1 text-[11.5px]" style={{ color: "rgba(255,255,255,0.45)" }}>
                  Última atividade: {student.lastActivity}
                </p>
              </div>
            </div>
            <StudentStatusBadge status={student.status} />
          </div>
        </NavyCard>
      </RevealItem>

      {/* KPIs */}
      <RevealItem className="mt-3 grid grid-cols-2 gap-3 lg:mt-4 lg:grid-cols-4 lg:gap-4">
        <KpiCard label="Pontos acumulados" value={points} icon={Trophy} color={APROVA.gold} />
        <KpiCard label="Streak atual" value={student.streak} unit="dias" icon={Fire} color={APROVA.streak} />
        <KpiCard label="Questões resolvidas" value={student.questoesRespondidas} icon={BookOpen} color={APROVA.blue} />
        <KpiCard label="Simulados feitos" value={student.simuladosFeitos} icon={Exam} color="#D97706" />
      </RevealItem>

      {/* 2-col layout */}
      <div className="mt-3 flex flex-col gap-3 lg:mt-4 lg:grid lg:grid-cols-[1fr_320px] lg:items-start lg:gap-5">
        {/* Main column */}
        <div className="flex flex-col gap-3 lg:gap-4">
          {/* Desempenho por matéria */}
          <RevealItem>
            <BentoCard>
              <SectionTitle title="Desempenho por matéria" kicker="Acadêmico" />
              <div className="flex flex-col gap-3.5">
                {student.subjectPerformance.map((s) => (
                  <div key={s.subject}>
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="text-[13px] font-semibold" style={{ color: APROVA.ink }}>{s.subject}</span>
                      <div className="flex items-center gap-1.5">
                        {s.forte && (
                          <span className="rounded-full px-2 py-0.5 text-[9px] font-bold" style={{ background: "#E6F8F0", color: APROVA.successDeep }}>Forte</span>
                        )}
                        <span className="text-[13px] font-extrabold" style={{ color: s.forte ? APROVA.successDeep : APROVA.inkMuted }}>{s.pct}%</span>
                      </div>
                    </div>
                    <ProgressBar
                      pct={s.pct}
                      color={s.pct >= 70 ? APROVA.success : s.pct >= 50 ? APROVA.gold : APROVA.error}
                      height={7}
                    />
                  </div>
                ))}
              </div>
            </BentoCard>
          </RevealItem>

          {/* Evolução semanal */}
          <RevealItem>
            <BentoCard>
              <SectionTitle title="Evolução nas últimas 7 semanas" kicker="Progresso" />
              <GradientAreaChart
                data={student.weeklyProgress}
                color={APROVA.blue}
                height={130}
                labels={["S1", "S2", "S3", "S4", "S5", "S6", "S7"]}
                valueFormat={(v) => `${Math.round(v)}%`}
              />
            </BentoCard>
          </RevealItem>

          {/* Atividades recentes */}
          <RevealItem>
            <BentoCard>
              <SectionTitle title="Atividades recentes" kicker="Histórico" />
              {activities.length === 0 ? (
                <p className="text-[13px]" style={{ color: APROVA.inkMuted }}>Nenhuma atividade registrada.</p>
              ) : (
                activities.map((act, i) => (
                  <ActivityTimelineItem
                    key={act.id}
                    type={act.type}
                    desc={act.desc}
                    date={act.date}
                    status={act.status}
                    detail={act.detail}
                    isFirst={i === 0}
                  />
                ))
              )}
            </BentoCard>
          </RevealItem>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-3 lg:gap-4">
          {/* Ofensiva */}
          <RevealItem>
            <BentoCard>
              <SectionTitle title="Ofensiva semanal" kicker="Consistência" />
              <div className="mb-3 flex items-center gap-2">
                <Fire size={22} weight="fill" color={APROVA.streak} />
                <span className="font-display text-[28px] font-bold" style={{ color: APROVA.ink }}>{student.streak}</span>
                <span className="text-[13px] font-bold" style={{ color: APROVA.inkMuted }}>dias seguidos</span>
              </div>
              <WeekdayDots days={student.activityDays} />
            </BentoCard>
          </RevealItem>

          {/* Redações e simulados */}
          <RevealItem>
            <BentoCard>
              <SectionTitle title="Entregas" kicker="Este mês" />
              <div className="flex flex-col gap-2">
                {[
                  { Icon: PencilLine, color: "#6C4BD9", label: "Redações entregues", value: student.redacoesEntregues },
                  { Icon: Exam, color: "#D97706", label: "Simulados feitos", value: student.simuladosFeitos },
                  { Icon: CheckCircle, color: APROVA.success, label: "Frequência", value: `${student.frequencia}%` },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between rounded-xl px-3 py-2.5" style={{ background: APROVA.surface }}>
                    <div className="flex items-center gap-2">
                      <row.Icon size={15} weight="fill" color={row.color} />
                      <span className="text-[12.5px]" style={{ color: APROVA.inkMuted }}>{row.label}</span>
                    </div>
                    <span className="text-[14px] font-extrabold" style={{ color: APROVA.ink }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </BentoCard>
          </RevealItem>

          {/* Financeiro */}
          <RevealItem>
            <BentoCard>
              <SectionTitle title="Financeiro" kicker="Mensalidade" />
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-[13px] font-extrabold" style={{ color: APROVA.ink }}>{student.financeiro.plano}</p>
                  <p className="text-[12px]" style={{ color: APROVA.inkMuted }}>{student.financeiro.metodoPagamento}</p>
                </div>
                <FinanceStatusBadge status={student.financeiro.status} />
              </div>
              <div className="rounded-xl px-3 py-3" style={{ background: APROVA.surface }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: APROVA.inkMuted }}>Valor</span>
                  <span className="text-[15px] font-extrabold" style={{ color: APROVA.ink }}>{student.financeiro.valor}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: APROVA.inkMuted }}>Vencimento</span>
                  <span className="text-[12.5px] font-bold" style={{ color: APROVA.ink }}>{student.financeiro.vencimento}</span>
                </div>
              </div>
            </BentoCard>
          </RevealItem>

          {/* Recomendações */}
          <RevealItem>
            <BentoCard>
              <SectionTitle title="Recomendações" kicker="Para você" />
              <div className="flex flex-col gap-2">
                {student.insights.map((text, i) => (
                  <InsightCard
                    key={i}
                    text={text}
                    icon={i === 0 ? Fire : i === 1 ? Lightbulb : WarningCircle}
                    color={i === 0 ? APROVA.streak : i === 1 ? APROVA.blue : APROVA.gold}
                  />
                ))}
              </div>
            </BentoCard>
          </RevealItem>
        </div>
      </div>
    </RevealGroup>
  )
}
