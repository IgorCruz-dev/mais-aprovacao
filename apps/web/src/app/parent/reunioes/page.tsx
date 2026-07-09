"use client"

import { CalendarBlank, CalendarCheck, CalendarX, Plus, User } from "@phosphor-icons/react"
import { MOCK_MEETINGS, MOCK_STUDENTS } from "@/lib/mock-parent-data"
import type { MeetingStatus } from "@/lib/mock-parent-data"
import {
  APROVA,
  BentoCard,
  PageHeader,
  PrimaryButton,
  RevealGroup,
  RevealItem,
  SectionTitle,
  showToast,
} from "@/components/student/StudentSurface"
import { AlertBanner } from "@/components/manager/ManagerSurface"

const STATUS_CONFIG: Record<MeetingStatus, { label: string; color: string; bg: string }> = {
  agendada:  { label: "Agendada",  color: APROVA.blue,        bg: APROVA.blueSoft },
  realizada: { label: "Realizada", color: APROVA.successDeep, bg: "#E6F8F0" },
  cancelada: { label: "Cancelada", color: APROVA.error,       bg: "#FDECEC" },
}

const upcoming = MOCK_MEETINGS.filter((m) => m.status === "agendada")
const past = MOCK_MEETINGS.filter((m) => m.status !== "agendada")

const riskStudents = MOCK_STUDENTS.filter((s) => s.status === "atencao" || s.status === "risco")

export default function ParentReunioesPage() {
  return (
    <RevealGroup className="mx-auto max-w-[1240px] px-4 pt-4 pb-10 lg:px-8 lg:pt-7">
      <RevealItem>
        <PageHeader
          kicker="Área do responsável"
          title="Reuniões"
          subtitle="Reuniões pedagógicas agendadas e histórico de atendimentos."
          action={
            <PrimaryButton onClick={() => showToast("Solicitação enviada! Entraremos em contato em breve.")}>
              <Plus size={15} weight="bold" /> Solicitar reunião
            </PrimaryButton>
          }
        />
      </RevealItem>

      {riskStudents.length > 0 && (
        <RevealItem className="mb-4">
          <AlertBanner
            tone="warning"
            text={`${riskStudents.map((s) => s.name.split(" ")[0]).join(" e ")} está${riskStudents.length > 1 ? "ão" : ""} com desempenho abaixo do esperado. Considere agendar uma reunião pedagógica.`}
            actionLabel="Solicitar reunião"
            href="#"
          />
        </RevealItem>
      )}

      {/* Próximas */}
      <RevealItem>
        <SectionTitle title="Próximas reuniões" kicker="Agendadas" />
        {upcoming.length === 0 ? (
          <BentoCard>
            <p className="text-[13px]" style={{ color: APROVA.inkMuted }}>Nenhuma reunião agendada no momento.</p>
          </BentoCard>
        ) : (
          <div className="flex flex-col gap-3">
            {upcoming.map((meeting) => {
              const s = STATUS_CONFIG[meeting.status]
              return (
                <BentoCard key={meeting.id}>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl" style={{ background: APROVA.blueSoft }}>
                        <CalendarBlank size={24} weight="fill" color={APROVA.blue} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[14px] font-extrabold" style={{ color: APROVA.ink }}>{meeting.type}</p>
                        <p className="text-[12.5px] font-semibold" style={{ color: APROVA.blue }}>
                          {meeting.date} às {meeting.time}
                        </p>
                        <div className="mt-1 flex items-center gap-1.5">
                          <User size={12} color={APROVA.inkMuted} />
                          <span className="text-[12px]" style={{ color: APROVA.inkMuted }}>{meeting.advisor}</span>
                        </div>
                        {meeting.notes && (
                          <p className="mt-1.5 text-[12px]" style={{ color: APROVA.inkMuted }}>
                            {meeting.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <span
                        className="rounded-full px-2.5 py-1 text-[11px] font-bold"
                        style={{ background: s.bg, color: s.color }}
                      >
                        {s.label}
                      </span>
                      <span className="text-[12px] font-semibold" style={{ color: APROVA.inkMuted }}>
                        Aluno: {meeting.studentName}
                      </span>
                    </div>
                  </div>
                </BentoCard>
              )
            })}
          </div>
        )}
      </RevealItem>

      {/* Histórico */}
      <RevealItem className="mt-4">
        <SectionTitle title="Histórico de reuniões" kicker="Realizadas" />
        <BentoCard className="p-0 overflow-hidden">
          {past.map((meeting, i) => {
            const s = STATUS_CONFIG[meeting.status]
            const StatusIcon = meeting.status === "realizada" ? CalendarCheck : CalendarX
            return (
              <div
                key={meeting.id}
                className="flex items-center gap-3 px-5 py-4"
                style={{ borderTop: i > 0 ? "1px solid #F1F3F8" : undefined }}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: s.bg }}>
                  <StatusIcon size={16} weight="fill" color={s.color} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold" style={{ color: APROVA.ink }}>
                    {meeting.type} — {meeting.studentName}
                  </p>
                  <p className="text-[11.5px]" style={{ color: APROVA.inkMuted }}>
                    {meeting.date} às {meeting.time} · {meeting.advisor}
                  </p>
                  {meeting.notes && (
                    <p className="mt-0.5 text-[11px]" style={{ color: APROVA.inkMuted }}>{meeting.notes}</p>
                  )}
                </div>
                <span
                  className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold"
                  style={{ background: s.bg, color: s.color }}
                >
                  {s.label}
                </span>
              </div>
            )
          })}
        </BentoCard>
      </RevealItem>

      {/* CTA */}
      <RevealItem className="mt-6">
        <BentoCard className="text-center">
          <CalendarBlank size={32} weight="fill" color={APROVA.blue} className="mx-auto mb-3" />
          <p className="text-[15px] font-extrabold" style={{ color: APROVA.ink }}>Precisa de uma reunião?</p>
          <p className="mx-auto mt-1 max-w-sm text-[12.5px]" style={{ color: APROVA.inkMuted }}>
            Nossa equipe pedagógica está disponível para atendê-lo(a). Solicitações são respondidas em até 24h úteis.
          </p>
          <div className="mt-4 flex justify-center">
            <PrimaryButton onClick={() => showToast("Solicitação enviada! Entraremos em contato em breve.")}>
              <Plus size={15} weight="bold" /> Solicitar reunião
            </PrimaryButton>
          </div>
        </BentoCard>
      </RevealItem>
    </RevealGroup>
  )
}
