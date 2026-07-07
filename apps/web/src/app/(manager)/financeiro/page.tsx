"use client"

import { useState } from "react"
import { CurrencyDollarSimple, Percent, Wallet, TrendDown } from "@phosphor-icons/react"
import {
  APROVA, BentoCard, PageHeader, SectionTitle, ProgressBar, GradientAreaChart,
  Segmented, KpiCard, DataTable, ManagerStatusBadge, type DataTableColumn,
} from "@/components/manager/ManagerSurface"
import {
  FINANCE_SUMMARY, REVENUE_TREND_30D, REVENUE_TREND_12M, REVENUE_BY_COURSE,
  ENROLLMENTS_BY_STATUS, RECENT_PAYMENTS, type PaymentRow,
} from "@/lib/mock-manager-data"

function formatCents(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })
}

const METHOD_LABEL: Record<string, string> = { pix: "Pix", credit_card: "Cartão", boleto: "Boleto" }

function EnrollmentsByStatusBar() {
  const total = Object.values(ENROLLMENTS_BY_STATUS).reduce((a, b) => a + b, 0)
  const segments: { key: keyof typeof ENROLLMENTS_BY_STATUS; color: string }[] = [
    { key: "active", color: APROVA.success },
    { key: "pending", color: APROVA.gold },
    { key: "expired", color: "#B4BAC7" },
    { key: "cancelled", color: APROVA.error },
  ]
  return (
    <BentoCard>
      <SectionTitle title="Matrículas por status" kicker="Financeiro" />
      <div className="mb-3 flex h-3 w-full overflow-hidden rounded-full">
        {segments.map((seg) => (
          <div key={seg.key} style={{ width: `${(ENROLLMENTS_BY_STATUS[seg.key] / total) * 100}%`, background: seg.color }} />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-5 gap-y-2">
        {segments.map((seg) => (
          <div key={seg.key} className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: seg.color }} />
            <span className="text-[11.5px] font-semibold capitalize" style={{ color: APROVA.inkMuted }}>
              {seg.key === "active" ? "Ativas" : seg.key === "pending" ? "Pendentes" : seg.key === "expired" ? "Expiradas" : "Canceladas"}
            </span>
            <span className="text-[11.5px] font-bold tabular" style={{ color: APROVA.ink }}>{ENROLLMENTS_BY_STATUS[seg.key]}</span>
          </div>
        ))}
      </div>
    </BentoCard>
  )
}

function PaymentMethodBreakdown() {
  const methods: { key: keyof typeof FINANCE_SUMMARY.byMethod; label: string; color: string }[] = [
    { key: "pix", label: "Pix", color: APROVA.blue },
    { key: "credit_card", label: "Cartão", color: APROVA.gold },
    { key: "boleto", label: "Boleto", color: "#B4BAC7" },
  ]
  return (
    <BentoCard>
      <SectionTitle title="Pagamentos por método" kicker="Financeiro" />
      <div className="flex flex-col gap-3">
        {methods.map((m) => (
          <div key={m.key}>
            <div className="mb-1 flex items-center justify-between text-[12px] font-semibold" style={{ color: APROVA.ink }}>
              <span>{m.label}</span>
              <span className="tabular font-bold">{FINANCE_SUMMARY.byMethod[m.key]}%</span>
            </div>
            <ProgressBar pct={FINANCE_SUMMARY.byMethod[m.key]} color={m.color} height={7} />
          </div>
        ))}
      </div>
    </BentoCard>
  )
}

function RevenueByCourseTable() {
  return (
    <BentoCard>
      <SectionTitle title="Receita por curso" kicker="Financeiro" />
      <div className="flex flex-col">
        {REVENUE_BY_COURSE.map((row, i) => (
          <div key={row.id} className="flex items-center gap-3 py-2.5" style={{ borderTop: i > 0 ? "1px solid #F1F3F8" : undefined }}>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12.5px] font-bold" style={{ color: APROVA.ink }}>{row.course}</p>
              <p className="text-[10.5px]" style={{ color: APROVA.inkMuted }}>{row.enrollments} matrículas</p>
            </div>
            <span className="shrink-0 text-[13.5px] font-bold tabular" style={{ color: APROVA.ink }}>{formatCents(row.revenue_cents)}</span>
          </div>
        ))}
      </div>
    </BentoCard>
  )
}

export default function ManagerFinanceiroPage() {
  const [period, setPeriod] = useState<"30d" | "12m">("30d")
  const data = period === "30d" ? REVENUE_TREND_30D : REVENUE_TREND_12M

  const columns: DataTableColumn<PaymentRow>[] = [
    { key: "student", header: "Aluno", render: (row) => <span className="font-bold" style={{ color: APROVA.ink }}>{row.studentName}</span> },
    { key: "course", header: "Curso", render: (row) => <span style={{ color: APROVA.inkMuted }}>{row.course}</span> },
    { key: "amount", header: "Valor", render: (row) => <span className="font-bold tabular" style={{ color: APROVA.ink }}>{formatCents(row.amount_cents)}</span> },
    { key: "method", header: "Método", render: (row) => <span style={{ color: APROVA.inkMuted }}>{METHOD_LABEL[row.method]}</span> },
    { key: "status", header: "Status", render: (row) => <ManagerStatusBadge domain="payment" status={row.status} /> },
    { key: "paidAt", header: "Data", render: (row) => <span style={{ color: APROVA.inkMuted }}>{row.paidAt ?? "—"}</span> },
  ]

  return (
    <div className="mx-auto max-w-[1680px] px-4 pt-4 lg:px-8 lg:pt-7">
      <PageHeader kicker="Gestão" title="Financeiro" subtitle="Receita, matrículas e status de pagamento" />

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <KpiCard label="MRR" value={formatCents(FINANCE_SUMMARY.mrr_cents)} icon={CurrencyDollarSimple} color={APROVA.blue} />
        <KpiCard label="Receita total" value={formatCents(FINANCE_SUMMARY.totalRevenue_cents)} icon={Wallet} color={APROVA.success} />
        <KpiCard label="Ticket médio" value={formatCents(FINANCE_SUMMARY.ticketMedio_cents)} icon={Percent} color={APROVA.gold} />
        <KpiCard label="Inadimplência" value={FINANCE_SUMMARY.defaultRatePct} unit="%" icon={TrendDown} color={APROVA.error} />
      </div>

      <div className="mb-5">
        <div className="mb-3 flex items-center justify-between">
          <SectionTitle title="Receita ao longo do tempo" kicker="Financeiro" />
          <Segmented
            options={[{ value: "30d", label: "30 dias" }, { value: "12m", label: "12 meses" }]}
            value={period}
            onChange={setPeriod}
          />
        </div>
        <BentoCard>
          <GradientAreaChart data={data} color={APROVA.blue} height={160} valueFormat={(v) => formatCents(v * 100)} />
        </BentoCard>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <EnrollmentsByStatusBar />
        <PaymentMethodBreakdown />
        <RevenueByCourseTable />
      </div>

      <div>
        <SectionTitle title="Pagamentos recentes" kicker="Financeiro" />
        <BentoCard>
          <DataTable columns={columns} rows={RECENT_PAYMENTS} emptyMessage="Nenhum pagamento recente." />
        </BentoCard>
      </div>
    </div>
  )
}
