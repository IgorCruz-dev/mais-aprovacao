"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  UsersThree, CurrencyDollarSimple, Fire, PencilLine, VideoCamera, CalendarBlank,
  Copy, ChalkboardTeacher, UserCircle,
} from "@phosphor-icons/react"
import {
  APROVA, BentoCard, NavyCard, SectionTitle, ProgressBar, GradientAreaChart,
  useCountUp, KpiCard, AlertBanner, ManagerStatusBadge, Segmented,
  RevealGroup, RevealItem, AnimatedNumber,
} from "@/components/manager/ManagerSurface"
import {
  MANAGER, OVERVIEW_KPIS, ESSAYS_QUEUE_BY_TEACHER, getUpcomingEvents,
  getOverviewKpisForPeriod, getRevenueTrendForPeriod, PERIOD_OPTIONS, type PeriodKey,
} from "@/lib/mock-manager-data"

function formatEventDate(iso: string) {
  const date = new Date(iso)
  const today = new Date()
  const isToday = date.toDateString() === today.toDateString()
  const time = date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
  if (isToday) return `Hoje, ${time}`
  return `${date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}, ${time}`
}

function formatCents(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })
}

function getGreeting() {
  const h = new Date().getHours()
  return h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite"
}

function GreetingHero() {
  const revenueToday = useCountUp(OVERVIEW_KPIS.revenueToday_cents / 100)
  return (
    <NavyCard halftone="white" className="p-4 lg:p-7">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-5">
        <div className="min-w-0">
          <p className="text-[12px] font-semibold uppercase tracking-[0.16em]" style={{ color: "rgba(255,255,255,0.5)" }}>{getGreeting()},</p>
          <h1 className="font-display text-[36px] font-bold text-white lg:text-[46px]">{MANAGER.name.split(" ")[0]}</h1>
          <p className="mt-1 text-[13px]" style={{ color: "rgba(255,255,255,0.6)" }}>Aqui está o resumo de hoje.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex min-h-[38px] items-center gap-1.5 rounded-full px-3 py-1.5" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <CurrencyDollarSimple size={16} weight="fill" color={APROVA.gold} />
            <span className="text-[14px] font-bold tabular text-white">R$ {revenueToday}</span>
            <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.5)" }}>hoje</span>
          </div>
          <div className="inline-flex min-h-[38px] items-center gap-1.5 rounded-full px-3 py-1.5" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <UsersThree size={16} weight="fill" color={APROVA.blueBright} />
            <span className="text-[14px] font-bold tabular text-white">{OVERVIEW_KPIS.newEnrollmentsToday}</span>
            <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.5)" }}>matrículas hoje</span>
          </div>
        </div>
      </div>
    </NavyCard>
  )
}

const INVITE_ROLES = [
  { label: "Aluno", role: "student", Icon: UsersThree },
  { label: "Responsável", role: "parent", Icon: UserCircle },
  { label: "Professor", role: "teacher", Icon: ChalkboardTeacher },
] as const

function SignupInviteLinks() {
  const [copiedRole, setCopiedRole] = useState<string | null>(null)
  const origin = typeof window === "undefined" ? "" : window.location.origin

  async function copyLink(role: string) {
    const url = `${origin}/sign-up?role=${role}`
    await navigator.clipboard.writeText(url)
    setCopiedRole(role)
    window.setTimeout(() => setCopiedRole(null), 1800)
  }

  return (
    <BentoCard>
      <SectionTitle title="Links de cadastro" kicker="Convites" />
      <div className="grid gap-2">
        {INVITE_ROLES.map(({ label, role, Icon }) => {
          const url = `${origin}/sign-up?role=${role}`
          return (
            <div key={role} className="flex flex-col gap-2 rounded-xl border border-[#EEF1F7] p-3 sm:flex-row sm:items-center">
              <div className="flex min-w-0 flex-1 items-center gap-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: APROVA.blueSoft }}>
                  <Icon size={18} weight="fill" color={APROVA.blue} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[12.5px] font-extrabold" style={{ color: APROVA.ink }}>{label}</p>
                  <p className="truncate text-[11.5px]" style={{ color: APROVA.inkMuted }}>{url}</p>
                </div>
              </div>
              <button
                onClick={() => void copyLink(role)}
                className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg px-3 text-[12px] font-extrabold text-white"
                style={{ background: APROVA.blue }}
              >
                <Copy size={15} weight="bold" /> {copiedRole === role ? "Copiado" : "Copiar"}
              </button>
            </div>
          )
        })}
      </div>
    </BentoCard>
  )
}

function AlertsSection() {
  const alerts: { tone: "warning" | "error"; text: string; actionLabel: string; href: string }[] = []

  if (OVERVIEW_KPIS.essaysOverdueSla > 0) {
    alerts.push({
      tone: "warning",
      text: `${OVERVIEW_KPIS.essaysOverdueSla} redações passaram do prazo de correção (SLA).`,
      actionLabel: "Ver redações",
      href: "/manager/pedagogico",
    })
  }
  if (OVERVIEW_KPIS.paymentAlerts.failedLast7d > 0) {
    alerts.push({
      tone: "error",
      text: `${OVERVIEW_KPIS.paymentAlerts.failedLast7d} pagamentos falharam nos últimos 7 dias.`,
      actionLabel: "Ver financeiro",
      href: "/manager/financeiro",
    })
  }
  if (OVERVIEW_KPIS.paymentAlerts.expiringEnrollments7d > 0) {
    alerts.push({
      tone: "warning",
      text: `${OVERVIEW_KPIS.paymentAlerts.expiringEnrollments7d} matrículas expiram nos próximos 7 dias.`,
      actionLabel: "Ver alunos",
      href: "/manager/alunos",
    })
  }
  if (OVERVIEW_KPIS.studentsAtRisk > 0) {
    alerts.push({
      tone: "warning",
      text: `${OVERVIEW_KPIS.studentsAtRisk} alunos em risco de evasão (sem atividade recente).`,
      actionLabel: "Ver alunos",
      href: "/manager/alunos",
    })
  }

  if (alerts.length === 0) return null

  return (
    <div className="flex flex-col gap-2">
      {alerts.map((a, i) => (
        <AlertBanner key={i} tone={a.tone} text={a.text} actionLabel={a.actionLabel} href={a.href} />
      ))}
    </div>
  )
}

function KpiGrid({ period }: { period: PeriodKey }) {
  const kpis = getOverviewKpisForPeriod(period)
  const periodLabel = PERIOD_OPTIONS.find((o) => o.value === period)?.label.toLowerCase() ?? ""
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
      <KpiCard
        label={`Matrículas (${periodLabel})`}
        value={<AnimatedNumber value={kpis.newEnrollments} />}
        delta={kpis.newEnrollmentsDelta}
        deltaGoodDirection="up"
        icon={UsersThree}
        color={APROVA.blue}
      />
      <KpiCard
        label="Alunos ativos"
        value={<AnimatedNumber value={kpis.activeStudents} />}
        delta={kpis.activeStudentsDelta}
        deltaGoodDirection="up"
        icon={UsersThree}
        color={APROVA.success}
      />
      <KpiCard
        label="Ofensiva média"
        value={<AnimatedNumber value={kpis.engagementStreakAvg} format={(v) => v.toFixed(1)} />}
        unit="dias"
        delta={kpis.engagementStreakAvgDelta}
        deltaGoodDirection="up"
        icon={Fire}
        color={APROVA.streak}
      />
      <KpiCard
        label="Redações pendentes"
        value={<AnimatedNumber value={kpis.essaysPending} />}
        icon={PencilLine}
        color={APROVA.error}
      />
    </div>
  )
}

function RevenueGoalCard({ period }: { period: PeriodKey }) {
  const kpis = getOverviewKpisForPeriod(period)
  const periodLabel = PERIOD_OPTIONS.find((o) => o.value === period)?.label.toLowerCase() ?? ""
  const pct = Math.min(100, (kpis.revenue_cents / kpis.revenueGoal_cents) * 100)
  return (
    <BentoCard>
      <SectionTitle title="Receita do período vs. meta" kicker="Financeiro" />
      <div className="mb-2 flex items-baseline gap-1.5">
        <span className="font-display text-[26px] font-bold tabular" style={{ color: APROVA.ink }}><AnimatedNumber value={kpis.revenue_cents} format={formatCents} /></span>
        <span className="text-[12px] font-bold" style={{ color: APROVA.inkMuted }}>/ <AnimatedNumber value={kpis.revenueGoal_cents} format={formatCents} /></span>
      </div>
      <ProgressBar pct={pct} color={APROVA.success} height={9} />
      <p className="mt-2 text-[11.5px]" style={{ color: APROVA.inkMuted }}><AnimatedNumber value={pct} format={(v) => v.toFixed(0)} />% da meta de {periodLabel} atingida</p>
    </BentoCard>
  )
}

function UpcomingEvents() {
  const router = useRouter()
  const events = getUpcomingEvents(3)
  return (
    <BentoCard>
      <SectionTitle title="Próximos eventos" kicker="Agenda" actionLabel="Ver todos" onAction={() => router.push("/manager/eventos")} />
      {events.length === 0 ? (
        <p className="py-4 text-[12.5px]" style={{ color: APROVA.inkMuted }}>Nenhum evento agendado no momento.</p>
      ) : (
        <div className="flex flex-col">
          {events.map((ev, i) => (
            <div key={ev.id} className="flex items-center gap-3 py-2.5" style={{ borderTop: i > 0 ? "1px solid #F1F3F8" : undefined }}>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: APROVA.blueSoft }}>
                <VideoCamera size={17} weight="duotone" color={APROVA.blue} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12.5px] font-bold" style={{ color: APROVA.ink }}>{ev.title}</p>
                <p className="text-[10.5px]" style={{ color: APROVA.inkMuted }}>{ev.teacherName ? `${ev.teacherName} · ` : ""}{ev.audience} · {formatEventDate(ev.scheduledAt)}</p>
              </div>
              <ManagerStatusBadge domain="event" status={ev.status} />
            </div>
          ))}
        </div>
      )}
    </BentoCard>
  )
}

function EssaysQueueSummary() {
  return (
    <BentoCard>
      <SectionTitle title="Redações pendentes por professor" kicker="Pedagógico" actionLabel="Ver tudo" />
      <div className="flex flex-col gap-2">
        {ESSAYS_QUEUE_BY_TEACHER.map((row) => (
          <div key={row.id} className="flex items-center gap-3 rounded-xl px-2.5 py-2" style={{ background: "#F6F7FB" }}>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12.5px] font-bold" style={{ color: APROVA.ink }}>{row.teacherName}</p>
              <p className="text-[10.5px]" style={{ color: APROVA.inkMuted }}>Mais antiga: há {row.oldestSubmittedHoursAgo}h</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-[15px] font-bold tabular" style={{ color: row.oldestSubmittedHoursAgo > 48 ? APROVA.error : APROVA.ink }}>{row.pendingCount}</p>
              <p className="text-[10px]" style={{ color: APROVA.inkMuted }}>pendentes</p>
            </div>
          </div>
        ))}
      </div>
    </BentoCard>
  )
}

function RevenueChartCard({ period }: { period: PeriodKey }) {
  const data = getRevenueTrendForPeriod(period)
  const periodLabel = PERIOD_OPTIONS.find((o) => o.value === period)?.label ?? ""
  return (
    <NavyCard halftone="gold">
      <div className="mb-1 flex items-center gap-2">
        <CurrencyDollarSimple size={16} weight="fill" color={APROVA.gold} />
        <p className="text-[11px] font-extrabold uppercase tracking-[0.14em]" style={{ color: APROVA.gold }}>Receita — {periodLabel}</p>
      </div>
      <GradientAreaChart
        data={data}
        color={APROVA.gold}
        height={140}
        valueFormat={(v) => formatCents(v * 100)}
      />
      <p className="mt-1 text-[12px]" style={{ color: "rgba(255,255,255,0.6)" }}>
        Total do período: <span className="font-extrabold text-white"><AnimatedNumber value={data.reduce((a, b) => a + b, 0)} format={formatCents} /></span>
      </p>
    </NavyCard>
  )
}

export default function ManagerDashboardPage() {
  const [period, setPeriod] = useState<PeriodKey>("month")

  return (
    <RevealGroup className="mx-auto max-w-[1680px] px-4 pt-4 lg:px-8 lg:pt-7">
      <RevealItem className="mb-3 lg:mb-5"><GreetingHero /></RevealItem>

      <RevealItem className="mb-5 flex items-center gap-2">
        <CalendarBlank size={15} color={APROVA.inkMuted} />
        <span className="text-[12px] font-semibold" style={{ color: APROVA.inkMuted }}>Período:</span>
        <Segmented options={PERIOD_OPTIONS} value={period} onChange={setPeriod} />
      </RevealItem>

      <div className="flex flex-col gap-3 lg:grid lg:grid-cols-[1fr_380px] lg:items-start lg:gap-5">
        <div className="contents lg:flex lg:flex-col lg:gap-5">
          <RevealItem className="order-1 lg:order-none"><KpiGrid period={period} /></RevealItem>
          <RevealItem className="order-2 lg:order-none"><UpcomingEvents /></RevealItem>
          <RevealItem className="order-5 lg:order-none"><EssaysQueueSummary /></RevealItem>
        </div>

        <div className="contents lg:flex lg:flex-col lg:gap-5">
          <RevealItem className="order-3 lg:order-none"><RevenueGoalCard period={period} /></RevealItem>
          <RevealItem className="order-4 lg:order-none"><SignupInviteLinks /></RevealItem>
          <RevealItem className="order-4 lg:order-none"><RevenueChartCard period={period} /></RevealItem>
          <RevealItem className="order-6 lg:order-none"><AlertsSection /></RevealItem>
        </div>
      </div>
    </RevealGroup>
  )
}
