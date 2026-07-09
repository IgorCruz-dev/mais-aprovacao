"use client"

import { CreditCard, Download, Receipt } from "@phosphor-icons/react"
import { MOCK_STUDENTS } from "@/lib/mock-parent-data"
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
import { AlertBanner, DataTable } from "@/components/manager/ManagerSurface"
import type { DataTableColumn } from "@/components/manager/ManagerSurface"
import { FinanceStatusBadge } from "@/components/parent/ParentSurface"

const allPayments = MOCK_STUDENTS.flatMap((s) =>
  s.financeiro.historico.map((p) => ({
    ...p,
    studentName: s.name.split(" ")[0],
    studentId: s.id,
  }))
).sort((a, b) => b.date.localeCompare(a.date))

const columns: DataTableColumn<(typeof allPayments)[0]>[] = [
  { key: "date", header: "Data", render: (r) => r.date },
  { key: "student", header: "Aluno", render: (r) => <span className="font-semibold">{r.studentName}</span> },
  { key: "valor", header: "Valor", render: (r) => <span className="font-bold">{r.valor}</span> },
  { key: "status", header: "Status", render: (r) => <FinanceStatusBadge status={r.status} /> },
  { key: "metodo", header: "Método", render: (r) => r.metodo },
  {
    key: "acao",
    header: "",
    render: () => (
      <button
        onClick={() => showToast("Segunda via enviada para seu email.")}
        className="text-[11.5px] font-bold transition-opacity hover:opacity-70"
        style={{ color: APROVA.blue }}
      >
        2ª via
      </button>
    ),
  },
]

const hasAlert = MOCK_STUDENTS.some((s) => s.financeiro.status !== "em_dia")

export default function ParentFinanceiroPage() {
  return (
    <RevealGroup className="mx-auto max-w-[1240px] px-4 pt-4 pb-10 lg:px-8 lg:pt-7">
      <RevealItem>
        <PageHeader
          kicker="Área do responsável"
          title="Financeiro"
          subtitle="Mensalidades, histórico de pagamentos e planos contratados."
        />
      </RevealItem>

      {hasAlert && (
        <RevealItem className="mb-4">
          <AlertBanner
            tone="warning"
            text="A mensalidade de Pedro Henrique vence em 3 dias (10/08). Realize o pagamento via PIX para evitar interrupção."
            actionLabel="Ver detalhes"
            href="#pedro"
          />
        </RevealItem>
      )}

      {/* Cards por aluno */}
      <RevealItem>
        <SectionTitle title="Mensalidades por aluno" kicker="Situação atual" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {MOCK_STUDENTS.map((student) => (
            <BentoCard key={student.id}>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl font-bold text-white"
                    style={{ background: student.color, fontSize: 16 }}
                  >
                    {student.initial}
                  </div>
                  <div>
                    <p className="text-[14px] font-extrabold" style={{ color: APROVA.ink }}>{student.name}</p>
                    <p className="text-[11.5px]" style={{ color: APROVA.inkMuted }}>{student.financeiro.plano}</p>
                  </div>
                </div>
                <FinanceStatusBadge status={student.financeiro.status} />
              </div>

              <div className="mb-4 grid grid-cols-2 gap-3">
                {[
                  { label: "Valor mensal", value: student.financeiro.valor },
                  { label: "Próx. vencimento", value: student.financeiro.vencimento },
                ].map((row) => (
                  <div key={row.label} className="rounded-xl p-3" style={{ background: APROVA.surface }}>
                    <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: APROVA.inkMuted }}>{row.label}</p>
                    <p className="text-[14px] font-extrabold" style={{ color: APROVA.ink }}>{row.value}</p>
                  </div>
                ))}
              </div>

              <div className="mb-4 flex items-center gap-2 rounded-xl px-3 py-2.5" style={{ background: APROVA.surface }}>
                <CreditCard size={16} weight="fill" color={APROVA.inkMuted} />
                <span className="text-[12.5px]" style={{ color: APROVA.inkMuted }}>{student.financeiro.metodoPagamento}</span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => showToast("Segunda via enviada para seu email.")}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-full py-2.5 text-[13px] font-bold transition-opacity hover:opacity-80"
                  style={{ background: APROVA.surface, color: APROVA.inkMuted }}
                >
                  <Receipt size={14} weight="fill" /> Segunda via
                </button>
                <PrimaryButton onClick={() => showToast("Detalhes do plano enviados para seu email.")} className="flex-1 text-[13px]">
                  <Download size={14} weight="fill" /> Detalhes
                </PrimaryButton>
              </div>
            </BentoCard>
          ))}

        </div>
      </RevealItem>

      {/* Histórico */}
      <RevealItem className="mt-4">
        <BentoCard>
          <SectionTitle title="Histórico de pagamentos" kicker="Todos os alunos" />
          <DataTable columns={columns} rows={allPayments} pageSize={8} />
        </BentoCard>
      </RevealItem>
    </RevealGroup>
  )
}
