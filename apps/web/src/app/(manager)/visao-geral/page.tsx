"use client"

import {
  UsersThree, CurrencyDollarSimple, Fire, PencilLine, VideoCamera,
} from "@phosphor-icons/react"
import {
  APROVA, BentoCard, NavyCard, SectionTitle, ProgressBar, GradientAreaChart,
  useCountUp, KpiCard, AlertBanner, ManagerStatusBadge,
} from "@/components/manager/ManagerSurface"
import {
  MANAGER, OVERVIEW_KPIS, REVENUE_TREND_30D, LIVE_CLASSES_TODAY, ESSAYS_QUEUE_BY_TEACHER,
} from "@/lib/mock-manager-data"

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
          <p className="mt-1 text-[13px]" style={{ color: "rgba(255,255,255,0.6)" }}>Aqui está o resumo de hoje do cursinho.</p>
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

function AlertsSection() {
  const alerts: { tone: "warning" | "error"; text: string; actionLabel: string; href: string }[] = []

  if (OVERVIEW_KPIS.essaysOverdueSla > 0) {
    alerts.push({
      tone: "warning",
      text: `${OVERVIEW_KPIS.essaysOverdueSla} redações passaram do prazo de correção (SLA).`,
      actionLabel: "Ver redações",
      href: "/pedagogico",
    })
  }
  if (OVERVIEW_KPIS.paymentAlerts.failedLast7d > 0) {
    alerts.push({
      tone: "error",
      text: `${OVERVIEW_KPIS.paymentAlerts.failedLast7d} pagamentos falharam nos últimos 7 dias.`,
      actionLabel: "Ver financeiro",
      href: "/financeiro",
    })
  }
  if (OVERVIEW_KPIS.paymentAlerts.expiringEnrollments7d > 0) {
    alerts.push({
      tone: "warning",
      text: `${OVERVIEW_KPIS.paymentAlerts.expiringEnrollments7d} matrículas expiram nos próximos 7 dias.`,
      actionLabel: "Ver alunos",
      href: "/alunos",
    })
  }
  if (OVERVIEW_KPIS.studentsAtRisk > 0) {
    alerts.push({
      tone: "warning",
      text: `${OVERVIEW_KPIS.studentsAtRisk} alunos em risco de evasão (sem atividade recente).`,
      actionLabel: "Ver alunos",
      href: "/alunos",
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

function KpiGrid() {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
      <KpiCard
        label="Matrículas (semana)"
        value={OVERVIEW_KPIS.newEnrollmentsWeek}
        delta={OVERVIEW_KPIS.newEnrollmentsWeekDelta}
        deltaGoodDirection="up"
        icon={UsersThree}
        color={APROVA.blue}
      />
      <KpiCard
        label="Alunos ativos"
        value={OVERVIEW_KPIS.activeStudents}
        delta={OVERVIEW_KPIS.activeStudentsDelta}
        deltaGoodDirection="up"
        icon={UsersThree}
        color={APROVA.success}
      />
      <KpiCard
        label="Ofensiva média"
        value={OVERVIEW_KPIS.engagementStreakAvg.toFixed(1)}
        unit="dias"
        delta={OVERVIEW_KPIS.engagementStreakAvgDelta}
        deltaGoodDirection="up"
        icon={Fire}
        color={APROVA.streak}
      />
      <KpiCard
        label="Redações pendentes"
        value={OVERVIEW_KPIS.essaysPending}
        icon={PencilLine}
        color={APROVA.error}
      />
    </div>
  )
}

function RevenueGoalCard() {
  const pct = Math.min(100, (OVERVIEW_KPIS.revenueMonth_cents / OVERVIEW_KPIS.revenueGoalMonth_cents) * 100)
  return (
    <BentoCard>
      <SectionTitle title="Receita do mês vs. meta" kicker="Financeiro" />
      <div className="mb-2 flex items-baseline gap-1.5">
        <span className="font-display text-[26px] font-bold tabular" style={{ color: APROVA.ink }}>{formatCents(OVERVIEW_KPIS.revenueMonth_cents)}</span>
        <span className="text-[12px] font-bold" style={{ color: APROVA.inkMuted }}>/ {formatCents(OVERVIEW_KPIS.revenueGoalMonth_cents)}</span>
      </div>
      <ProgressBar pct={pct} color={APROVA.success} height={9} />
      <p className="mt-2 text-[11.5px]" style={{ color: APROVA.inkMuted }}>{pct.toFixed(0)}% da meta mensal atingida</p>
    </BentoCard>
  )
}

function LiveClassesToday() {
  return (
    <BentoCard>
      <SectionTitle title="Aulões de hoje" kicker="Ao vivo" actionLabel="Ver todos" />
      <div className="flex flex-col">
        {LIVE_CLASSES_TODAY.map((lc, i) => (
          <div key={lc.id} className="flex items-center gap-3 py-2.5" style={{ borderTop: i > 0 ? "1px solid #F1F3F8" : undefined }}>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: APROVA.blueSoft }}>
              <VideoCamera size={17} weight="duotone" color={APROVA.blue} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12.5px] font-bold" style={{ color: APROVA.ink }}>{lc.title}</p>
              <p className="text-[10.5px]" style={{ color: APROVA.inkMuted }}>{lc.teacherName} · {lc.scheduledAt}</p>
            </div>
            <ManagerStatusBadge domain="liveClass" status={lc.status} />
          </div>
        ))}
      </div>
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

function RevenueChartCard() {
  return (
    <NavyCard halftone="gold">
      <div className="mb-1 flex items-center gap-2">
        <CurrencyDollarSimple size={16} weight="fill" color={APROVA.gold} />
        <p className="text-[11px] font-extrabold uppercase tracking-[0.14em]" style={{ color: APROVA.gold }}>Receita — 30 dias</p>
      </div>
      <GradientAreaChart
        data={REVENUE_TREND_30D}
        color={APROVA.gold}
        height={140}
        valueFormat={(v) => formatCents(v * 100)}
      />
      <p className="mt-1 text-[12px]" style={{ color: "rgba(255,255,255,0.6)" }}>
        Total do período: <span className="font-extrabold text-white">{formatCents(REVENUE_TREND_30D.reduce((a, b) => a + b, 0))}</span>
      </p>
    </NavyCard>
  )
}

export default function ManagerDashboardPage() {
  return (
    <div className="mx-auto max-w-[1680px] px-4 pt-4 lg:px-8 lg:pt-7">
      <div className="mb-3 lg:mb-5"><GreetingHero /></div>

      <div className="flex flex-col gap-3 lg:grid lg:grid-cols-[1fr_380px] lg:items-start lg:gap-5">
        <div className="contents lg:flex lg:flex-col lg:gap-5">
          <div className="order-1 lg:order-none"><KpiGrid /></div>
          <div className="order-2 lg:order-none"><LiveClassesToday /></div>
          <div className="order-5 lg:order-none"><EssaysQueueSummary /></div>
        </div>

        <div className="contents lg:flex lg:flex-col lg:gap-5">
          <div className="order-3 lg:order-none"><RevenueGoalCard /></div>
          <div className="order-4 lg:order-none"><RevenueChartCard /></div>
          <div className="order-6 lg:order-none"><AlertsSection /></div>
        </div>
      </div>
    </div>
  )
}
