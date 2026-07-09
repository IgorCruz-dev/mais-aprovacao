"use client"

import Link from "next/link"
import {
  ChalkboardTeacher, ChartLineUp, Exam, PencilLine, Student, UsersThree, VideoCamera,
} from "@phosphor-icons/react"
import {
  APROVA, BentoCard, NavyCard, SectionTitle, ProgressBar, KpiCard, AlertBanner,
  Avatar, RevealGroup, RevealItem, AnimatedNumber,
} from "@/components/teacher/TeacherSurface"
import {
  TeacherClassBadge, TeacherLessonBadge, TeacherEssayBadge, EssaySlaIndicator, TeacherInsightCard,
} from "@/components/teacher/TeacherSurface"
import {
  TURMAS, AULAS, REDACOES, TEACHER_INSIGHTS,
  getDashboardAlerts, getUpcomingAgenda,
} from "@/lib/mock-teacher-data"
import { useSessionUser } from "@/components/auth/RoleProvider"

function getGreeting() {
  const h = new Date().getHours()
  return h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite"
}

function HeroPill({ icon: Icon, value, label, color }: { icon: typeof UsersThree; value: React.ReactNode; label: string; color: string }) {
  return (
    <div className="inline-flex min-h-[38px] items-center gap-1.5 rounded-full px-3 py-1.5" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}>
      <Icon size={16} weight="fill" color={color} />
      <span className="text-[14px] font-bold tabular text-white">{value}</span>
      <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.5)" }}>{label}</span>
    </div>
  )
}

function GreetingHero() {
  const user = useSessionUser()
  const firstName = user.name.split(" ")[0]
  const pendingEssays = REDACOES.filter((r) => r.status === "pendente" || r.status === "em_correcao").length
  const totalAlunos = TURMAS.reduce((a, t) => a + t.totalAlunos, 0)
  const nextAula = AULAS.find((a) => a.status === "planejada" || a.status === "ao_vivo")

  return (
    <NavyCard halftone="blue" watermark={<ChalkboardTeacher size={150} />} className="p-4 lg:p-7">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-5">
        <div className="min-w-0">
          <p className="text-[12px] font-semibold uppercase tracking-[0.16em]" style={{ color: "rgba(255,255,255,0.5)" }}>{getGreeting()},</p>
          <h1 className="font-display text-[36px] font-bold text-white lg:text-[46px]">{firstName}!</h1>
          <p className="mt-1 text-[13px]" style={{ color: "rgba(255,255,255,0.6)" }}>Painel do professor — {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <HeroPill icon={UsersThree} color={APROVA.blueBright} value={TURMAS.length} label="turmas" />
          <HeroPill icon={Student} color={APROVA.gold} value={totalAlunos} label="alunos" />
          <HeroPill icon={PencilLine} color={pendingEssays > 0 ? APROVA.error : APROVA.success} value={pendingEssays} label="correções" />
          {nextAula && (
            <HeroPill icon={VideoCamera} color={nextAula.status === "ao_vivo" ? APROVA.error : APROVA.success} value={nextAula.status === "ao_vivo" ? "Ao vivo" : "Próxima"} label="aula" />
          )}
        </div>
      </div>
    </NavyCard>
  )
}

function AlertsSection() {
  const alerts = getDashboardAlerts()
  if (alerts.length === 0) return null
  return (
    <div className="flex flex-col gap-2">
      {alerts.map((a, i) => (
        <AlertBanner key={i} tone={a.tone} text={a.text} actionLabel={a.actionLabel} href={a.href} />
      ))}
    </div>
  )
}

function KpiGrid() {
  const totalAlunos = TURMAS.reduce((a, t) => a + t.totalAlunos, 0)
  const pendingEssays = REDACOES.filter((r) => r.status === "pendente").length
  const overSlaCount = REDACOES.filter((r) => r.overSla).length
  const aulasWeek = AULAS.filter((a) => a.status === "planejada" || a.status === "ao_vivo").length
  const avgScore = Math.round(TURMAS.reduce((a, t) => a + t.mediaGeral, 0) / TURMAS.length)

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
      <KpiCard label="Alunos acompanhados" value={<AnimatedNumber value={totalAlunos} />} icon={Student} color={APROVA.blue} />
      <KpiCard
        label="Redações pendentes"
        value={<AnimatedNumber value={pendingEssays} />}
        icon={PencilLine}
        color={overSlaCount > 0 ? APROVA.error : APROVA.goldDeep}
        delta={overSlaCount > 0 ? undefined : undefined}
      />
      <KpiCard label="Aulas programadas" value={<AnimatedNumber value={aulasWeek} />} icon={VideoCamera} color={APROVA.success} unit="esta semana" />
      <KpiCard label="Média geral das turmas" value={<AnimatedNumber value={avgScore} />} icon={ChartLineUp} color={APROVA.gold} unit="%" />
    </div>
  )
}

function TurmasOverview() {
  return (
    <BentoCard>
      <SectionTitle title="Turmas" kicker="Visão geral" actionLabel="Ver turmas" onAction={() => { window.location.href = "/teacher/turmas" }} />
      <div className="flex flex-col gap-3">
        {TURMAS.map((turma) => (
          <Link key={turma.id} href={`/teacher/turmas/${turma.id}`} className="block rounded-2xl p-3.5 transition-colors hover:bg-[#F6F7FB]" style={{ border: "1px solid #EEF1F7" }}>
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-[13.5px] font-bold" style={{ color: APROVA.ink }}>{turma.nome}</p>
              <TeacherClassBadge status={turma.status} />
            </div>
            <div className="mb-2 flex gap-4 text-[11.5px]" style={{ color: APROVA.inkMuted }}>
              <span>{turma.totalAlunos} alunos</span>
              <span>{turma.mediaGeral}% média</span>
              <span>{turma.frequenciaMedia}% freq.</span>
            </div>
            <ProgressBar pct={turma.progressoCurso} height={6} />
            <p className="mt-1 text-[11px]" style={{ color: APROVA.inkMuted }}>{turma.progressoCurso}% do conteúdo concluído</p>
          </Link>
        ))}
      </div>
    </BentoCard>
  )
}

function UpcomingLessons() {
  const upcoming = AULAS
    .filter((a) => a.status === "planejada" || a.status === "ao_vivo")
    .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))
    .slice(0, 4)

  return (
    <BentoCard>
      <SectionTitle title="Próximas aulas" kicker="Agenda" actionLabel="Ver agenda" onAction={() => { window.location.href = "/teacher/agenda" }} />
      <div className="flex flex-col">
        {upcoming.map((aula, i) => {
          const d = new Date(aula.scheduledAt)
          const dateLabel = d.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" })
          const timeLabel = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
          return (
            <div key={aula.id} className="flex items-center gap-3 py-2.5" style={{ borderTop: i > 0 ? "1px solid #F1F3F8" : undefined }}>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: aula.status === "ao_vivo" ? APROVA.error + "14" : APROVA.blueSoft }}>
                <VideoCamera size={18} weight="fill" color={aula.status === "ao_vivo" ? APROVA.error : APROVA.blue} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12.5px] font-bold" style={{ color: APROVA.ink }}>{aula.title}</p>
                <p className="text-[10.5px]" style={{ color: APROVA.inkMuted }}>{aula.turmaNome} · {dateLabel}, {timeLabel}</p>
              </div>
              <TeacherLessonBadge status={aula.status} />
            </div>
          )
        })}
      </div>
    </BentoCard>
  )
}

function UrgentEssays() {
  const urgent = REDACOES
    .filter((r) => r.status === "pendente" || r.status === "em_correcao")
    .sort((a, b) => b.elapsedHours - a.elapsedHours)
    .slice(0, 5)

  return (
    <BentoCard>
      <SectionTitle title="Correções pendentes" kicker="Redações" actionLabel="Ver todas" onAction={() => { window.location.href = "/teacher/correcoes" }} />
      {urgent.length === 0 ? (
        <p className="py-3 text-[12.5px]" style={{ color: APROVA.inkMuted }}>Nenhuma redação pendente.</p>
      ) : (
        <div className="flex flex-col">
          {urgent.map((r, i) => (
            <div key={r.id} className="flex items-center gap-3 py-2.5" style={{ borderTop: i > 0 ? "1px solid #F1F3F8" : undefined }}>
              <Avatar initial={r.studentInitial} size={32} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12.5px] font-bold" style={{ color: APROVA.ink }}>{r.studentName}</p>
                <p className="max-w-[180px] truncate text-[10.5px]" style={{ color: APROVA.inkMuted }}>{r.theme}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <TeacherEssayBadge status={r.status} />
                <EssaySlaIndicator elapsedHours={r.elapsedHours} slaHours={r.slaHours} />
              </div>
            </div>
          ))}
        </div>
      )}
    </BentoCard>
  )
}

function TodayAgenda() {
  const items = getUpcomingAgenda(5)
  const TYPE_COLORS: Record<string, string> = {
    aula: APROVA.blue, correcao: "#6C4BD9", simulado: "#D97706", reuniao: APROVA.gold, plantao: APROVA.success,
  }
  const TYPE_ICONS: Record<string, typeof VideoCamera> = {
    aula: VideoCamera, correcao: PencilLine, simulado: Exam, reuniao: UsersThree, plantao: Student,
  }
  return (
    <BentoCard>
      <SectionTitle title="Agenda próxima" kicker="Compromissos" actionLabel="Ver agenda" onAction={() => { window.location.href = "/teacher/agenda" }} />
      <div className="flex flex-col">
        {items.map((item, i) => {
          const color = TYPE_COLORS[item.type] ?? APROVA.blue
          const Icon = TYPE_ICONS[item.type] ?? VideoCamera
          const d = new Date(`${item.date}T${item.time}`)
          const dateLabel = d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
          return (
            <div key={item.id} className="flex items-center gap-3 py-2.5" style={{ borderTop: i > 0 ? "1px solid #F1F3F8" : undefined }}>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: color + "14" }}>
                <Icon size={16} weight="fill" color={color} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12.5px] font-bold" style={{ color: APROVA.ink }}>{item.title}</p>
                <p className="text-[10.5px]" style={{ color: APROVA.inkMuted }}>{dateLabel} às {item.time} · {item.durationMin}min</p>
              </div>
            </div>
          )
        })}
      </div>
    </BentoCard>
  )
}

function PedagogicalInsights() {
  return (
    <BentoCard>
      <SectionTitle title="Insights pedagógicos" kicker="Automático" />
      <TeacherInsightCard insights={TEACHER_INSIGHTS} />
    </BentoCard>
  )
}

export default function TeacherDashboardPage() {
  return (
    <RevealGroup className="mx-auto max-w-[1240px] px-4 pt-4 lg:px-8 lg:pt-7">
      <RevealItem className="mb-4 lg:mb-5"><GreetingHero /></RevealItem>
      <RevealItem className="mb-4"><AlertsSection /></RevealItem>
      <RevealItem className="mb-5"><KpiGrid /></RevealItem>

      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[1fr_360px] lg:items-start lg:gap-5">
        <div className="contents lg:flex lg:flex-col lg:gap-5">
          <RevealItem className="order-1 lg:order-none"><TurmasOverview /></RevealItem>
          <RevealItem className="order-3 lg:order-none"><UpcomingLessons /></RevealItem>
          <RevealItem className="order-5 lg:order-none"><UrgentEssays /></RevealItem>
        </div>
        <div className="contents lg:flex lg:flex-col lg:gap-5">
          <RevealItem className="order-2 lg:order-none"><TodayAgenda /></RevealItem>
          <RevealItem className="order-4 lg:order-none"><PedagogicalInsights /></RevealItem>
        </div>
      </div>
    </RevealGroup>
  )
}
