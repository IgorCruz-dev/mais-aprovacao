"use client"

import { ChalkboardTeacher, Exam, PencilLine, UsersThree, VideoCamera } from "@phosphor-icons/react"
import type { Icon as PhosphorIcon } from "@phosphor-icons/react"
import { APROVA, BentoCard, NavyCard, PageHeader, SectionTitle } from "@/components/student/StudentSurface"
import { useSessionUser } from "@/components/auth/RoleProvider"

// Números ilustrativos — os domínios de turmas/aulas/redações ainda estão em desenvolvimento.
const DEMO_METRICS: Array<{ label: string; value: string; hint: string; Icon: PhosphorIcon; color: string }> = [
  { label: "Minhas turmas", value: "3", hint: "Extensivo, Intensivo e UFU", Icon: UsersThree, color: APROVA.blue },
  { label: "Aulas publicadas", value: "42", hint: "6 aguardando encoding", Icon: VideoCamera, color: "#0E8A5F" },
  { label: "Redações a corrigir", value: "17", hint: "5 chegaram hoje", Icon: PencilLine, color: "#6C4BD9" },
  { label: "Simulados agendados", value: "2", hint: "Próximo: sábado 09h", Icon: Exam, color: "#D97706" },
]

export default function TeacherDashboardPage() {
  const user = useSessionUser()
  const firstName = user.name.split(" ")[0]

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <PageHeader
        kicker="Painel do professor"
        title={`Olá, ${firstName}!`}
        subtitle="Acompanhe suas turmas, aulas e correções em um só lugar."
      />

      <NavyCard className="mb-6" halftone="gold" watermark={<ChalkboardTeacher size={150} />}>
        <p className="text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color: APROVA.gold }}>Em desenvolvimento</p>
        <h2 className="mt-1 font-display text-[22px] font-bold text-white">Área do professor</h2>
        <p className="mt-2 max-w-xl text-[13.5px]" style={{ color: "rgba(255,255,255,0.65)" }}>
          Gestão de cursos, correção de redações e aulões ao vivo chegam nas próximas iterações.
          Os números abaixo são ilustrativos.
        </p>
      </NavyCard>

      <SectionTitle title="Resumo" kicker="Visão rápida" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {DEMO_METRICS.map(({ label, value, hint, Icon, color }) => (
          <BentoCard key={label}>
            <div className="flex items-center justify-between">
              <p className="text-[12px] font-bold uppercase tracking-wide" style={{ color: APROVA.inkMuted }}>{label}</p>
              <Icon size={20} weight="fill" color={color} />
            </div>
            <p className="mt-3 font-display text-[34px] font-bold" style={{ color: APROVA.ink }}>{value}</p>
            <p className="text-[12px]" style={{ color: APROVA.inkMuted }}>{hint}</p>
          </BentoCard>
        ))}
      </div>
    </div>
  )
}
