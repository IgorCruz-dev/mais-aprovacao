"use client"

import {
  CalendarBlank,
  CheckCircle,
  Fire,
  Users,
  WarningCircle,
} from "@phosphor-icons/react"
import {
  MOCK_ACTIVITIES,
  MOCK_ALERTS,
  MOCK_MEETINGS,
  MOCK_PARENT,
  MOCK_STUDENTS,
} from "@/lib/mock-parent-data"
import {
  APROVA,
  BentoCard,
  NavyCard,
  RevealGroup,
  RevealItem,
  SectionTitle,
  StatPill,
} from "@/components/student/StudentSurface"
import { AlertBanner } from "@/components/manager/ManagerSurface"
import {
  ActivityTimelineItem,
  FinanceStatusBadge,
  StudentSummaryCard,
} from "@/components/parent/ParentSurface"

const otimos = MOCK_STUDENTS.filter((s) => s.status === "otimo").length
const atencao = MOCK_STUDENTS.filter((s) => s.status !== "otimo").length
const recentActivities = MOCK_ACTIVITIES.slice(0, 6)
const nextMeeting = MOCK_MEETINGS.find((m) => m.status === "agendada")

export default function ParentDashboardPage() {
  return (
    <RevealGroup className="mx-auto max-w-[1240px] px-4 pt-4 pb-10 lg:px-8 lg:pt-7">
      {/* Hero */}
      <RevealItem>
        <NavyCard halftone="white" className="p-5 lg:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: "rgba(255,255,255,0.45)" }}>
                Área do responsável
              </p>
              <h1 className="font-display text-[36px] font-bold leading-tight text-white lg:text-[44px]">
                Olá, {MOCK_PARENT.firstName}!
              </h1>
              <p className="mt-1 text-[14px]" style={{ color: "rgba(255,255,255,0.65)" }}>
                Você está acompanhando <span className="font-extrabold text-white">{MOCK_STUDENTS.length} alunos</span> na plataforma.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatPill icon={CheckCircle} value={otimos} label={otimos === 1 ? "em ótimo desempenho" : "em ótimo desempenho"} iconColor={APROVA.success} dark />
              <StatPill icon={WarningCircle} value={atencao} label={atencao === 1 ? "requer atenção" : "requerem atenção"} iconColor={APROVA.gold} dark />
              <StatPill icon={Fire} value={`${Math.max(...MOCK_STUDENTS.map((s) => s.streak))}d`} label="maior ofensiva" iconColor={APROVA.streak} dark />
            </div>
          </div>
        </NavyCard>
      </RevealItem>

      {/* Alertas */}
      {MOCK_ALERTS.length > 0 && (
        <RevealItem className="mt-3 flex flex-col gap-2 lg:mt-4">
          {MOCK_ALERTS.slice(0, 2).map((alert) => (
            <AlertBanner key={alert.id} tone={alert.tone} text={alert.text} actionLabel={alert.actionLabel} href={alert.href ?? "#"} />
          ))}
        </RevealItem>
      )}

      {/* Student cards */}
      <RevealItem className="mt-3 lg:mt-4">
        <SectionTitle title="Alunos vinculados" kicker="Acompanhamento" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {MOCK_STUDENTS.map((student) => (
            <StudentSummaryCard key={student.id} student={student} />
          ))}
        </div>
      </RevealItem>

      {/* Bottom 2-col */}
      <div className="mt-3 flex flex-col gap-3 lg:mt-4 lg:grid lg:grid-cols-[1fr_340px] lg:items-start lg:gap-5">
        {/* Activities */}
        <RevealItem>
          <BentoCard>
            <SectionTitle title="Atividades recentes" kicker="Últimos 7 dias" actionLabel="Ver todas" onAction={() => { window.location.href = "/parent/atividades" }} />
            {recentActivities.map((act, i) => (
              <ActivityTimelineItem
                key={act.id}
                type={act.type}
                desc={act.desc}
                date={act.date}
                status={act.status}
                detail={act.detail}
                studentName={act.studentName}
                showStudent
                isFirst={i === 0}
              />
            ))}
          </BentoCard>
        </RevealItem>

        {/* Sidebar */}
        <div className="flex flex-col gap-3 lg:gap-4">
          {/* Financial summary */}
          <RevealItem>
            <BentoCard>
              <SectionTitle title="Financeiro" kicker="Mensalidades" />
              <div className="flex flex-col gap-3">
                {MOCK_STUDENTS.map((student) => (
                  <div key={student.id} className="flex items-center justify-between rounded-2xl px-4 py-3" style={{ background: APROVA.surface }}>
                    <div className="min-w-0">
                      <p className="text-[13px] font-extrabold" style={{ color: APROVA.ink }}>{student.name.split(" ")[0]}</p>
                      <p className="text-[11.5px]" style={{ color: APROVA.inkMuted }}>
                        {student.financeiro.valor} · vence {student.financeiro.vencimento}
                      </p>
                    </div>
                    <FinanceStatusBadge status={student.financeiro.status} />
                  </div>
                ))}
              </div>
            </BentoCard>
          </RevealItem>

          {/* Next meeting */}
          {nextMeeting && (
            <RevealItem>
              <BentoCard>
                <SectionTitle title="Próxima reunião" kicker="Pedagógico" />
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: APROVA.blueSoft }}>
                    <CalendarBlank size={20} weight="fill" color={APROVA.blue} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-extrabold" style={{ color: APROVA.ink }}>{nextMeeting.type}</p>
                    <p className="text-[12px]" style={{ color: APROVA.inkMuted }}>
                      {nextMeeting.date} às {nextMeeting.time}
                    </p>
                    <p className="text-[12px]" style={{ color: APROVA.inkMuted }}>{nextMeeting.advisor}</p>
                    <p className="mt-1 text-[11.5px] font-semibold" style={{ color: APROVA.blue }}>
                      Aluno: {nextMeeting.studentName}
                    </p>
                  </div>
                </div>
              </BentoCard>
            </RevealItem>
          )}

          {/* Quick stats */}
          <RevealItem>
            <BentoCard>
              <SectionTitle title="Esta semana" kicker="Resumo" />
              <div className="flex flex-col gap-2">
                {[
                  { icon: Users, label: "Atividades realizadas", value: `${recentActivities.filter((a) => a.status === "concluido").length}` },
                  { icon: Fire, label: "Dias de ofensiva (Ana)", value: `${MOCK_STUDENTS[0].streak} dias` },
                  { icon: WarningCircle, label: "Pendências", value: `${recentActivities.filter((a) => a.status !== "concluido").length}` },
                ].map((row) => {
                  const Icon = row.icon
                  return (
                    <div key={row.label} className="flex items-center justify-between py-1.5" style={{ borderBottom: "1px solid #F1F3F8" }}>
                      <div className="flex items-center gap-2">
                        <Icon size={14} weight="fill" color={APROVA.inkMuted} />
                        <span className="text-[12.5px]" style={{ color: APROVA.inkMuted }}>{row.label}</span>
                      </div>
                      <span className="text-[13px] font-extrabold" style={{ color: APROVA.ink }}>{row.value}</span>
                    </div>
                  )
                })}
              </div>
            </BentoCard>
          </RevealItem>
        </div>
      </div>
    </RevealGroup>
  )
}
