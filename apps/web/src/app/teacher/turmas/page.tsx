"use client"

import { useRouter } from "next/navigation"
import { Plus, CalendarBlank } from "@phosphor-icons/react"
import {
  APROVA, BentoCard, PageHeader, SectionTitle, ProgressBar, AlertBanner,
  RevealGroup, RevealItem, DataTable, type DataTableColumn,
} from "@/components/teacher/TeacherSurface"
import { TeacherClassBadge } from "@/components/teacher/TeacherSurface"
import { TURMAS, type Turma } from "@/lib/mock-teacher-data"

function ClassCard({ turma }: { turma: Turma }) {
  const router = useRouter()

  return (
    <BentoCard hover onClick={() => router.push(`/teacher/turmas/${turma.id}`)} className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: APROVA.inkMuted }}>{turma.course}</p>
          <h3 className="font-display text-[19px] font-bold" style={{ color: APROVA.ink }}>{turma.nome}</h3>
          <p className="text-[12px]" style={{ color: APROVA.inkMuted }}>{turma.periodoLabel}</p>
        </div>
        <TeacherClassBadge status={turma.status} />
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Alunos", value: turma.totalAlunos, color: APROVA.blue },
          { label: "Média", value: `${turma.mediaGeral}%`, color: turma.mediaGeral >= 70 ? APROVA.success : turma.mediaGeral >= 50 ? "#B45309" : APROVA.error },
          { label: "Frequência", value: `${turma.frequenciaMedia}%`, color: turma.frequenciaMedia >= 80 ? APROVA.success : APROVA.gold },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl p-2.5 text-center" style={{ background: "#F6F7FB" }}>
            <p className="font-display text-[18px] font-bold" style={{ color }}>{value}</p>
            <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: APROVA.inkMuted }}>{label}</p>
          </div>
        ))}
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between">
          <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: APROVA.inkMuted }}>Progresso do curso</p>
          <p className="text-[11px] font-bold" style={{ color: APROVA.ink }}>{turma.progressoCurso}%</p>
        </div>
        <ProgressBar pct={turma.progressoCurso} height={7} />
      </div>

      <div className="flex flex-wrap items-center gap-3 text-[11.5px]" style={{ color: APROVA.inkMuted }}>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full" style={{ background: APROVA.success }} />
          {turma.alunosOtimo} ótimo
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full" style={{ background: "#F59E0B" }} />
          {turma.alunosAtencao} atenção
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full" style={{ background: APROVA.error }} />
          {turma.alunosRisco} risco
        </span>
      </div>

      {turma.proximaAula && (
        <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: APROVA.blueSoft }}>
          <CalendarBlank size={13} color={APROVA.blue} />
          <p className="text-[11.5px] font-semibold" style={{ color: APROVA.blue }}>Próxima: {turma.proximaAula}</p>
        </div>
      )}
    </BentoCard>
  )
}

export default function TurmasPage() {
  const atencaoTurmas = TURMAS.filter((t) => t.status === "atencao")
  const totalAlunos = TURMAS.reduce((a, t) => a + t.totalAlunos, 0)

  const consolidadoRows = TURMAS.map((t) => ({ ...t }))
  const columns: DataTableColumn<typeof consolidadoRows[0]>[] = [
    { key: "nome", header: "Turma", render: (r) => <span className="font-bold" style={{ color: APROVA.ink }}>{r.nome}</span> },
    { key: "alunos", header: "Alunos", render: (r) => <span className="tabular">{r.totalAlunos}</span> },
    {
      key: "media", header: "Média", render: (r) => (
        <span className="font-bold tabular" style={{ color: r.mediaGeral >= 70 ? APROVA.success : r.mediaGeral >= 50 ? "#B45309" : APROVA.error }}>
          {r.mediaGeral}%
        </span>
      ),
    },
    {
      key: "freq", header: "Frequência", render: (r) => (
        <span className="font-bold tabular" style={{ color: r.frequenciaMedia >= 80 ? APROVA.success : "#B45309" }}>
          {r.frequenciaMedia}%
        </span>
      ),
    },
    {
      key: "risco", header: "Em risco", render: (r) => (
        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: r.alunosRisco > 0 ? "#FDECEC" : "#E6F8F0", color: r.alunosRisco > 0 ? APROVA.error : APROVA.successDeep }}>
          {r.alunosRisco}
        </span>
      ),
    },
    {
      key: "pendentes", header: "Redações pend.", render: (r) => (
        <span className="tabular" style={{ color: r.redacoesPendentes > 0 ? APROVA.error : APROVA.inkMuted }}>
          {r.redacoesPendentes}
        </span>
      ),
    },
    { key: "status", header: "Status", render: (r) => <TeacherClassBadge status={r.status} /> },
  ]

  return (
    <RevealGroup className="mx-auto max-w-[1240px] px-4 pt-4 lg:px-8 lg:pt-7">
      <RevealItem>
        <PageHeader
          kicker="Gestão"
          title="Turmas"
          subtitle={`${TURMAS.length} turmas · ${totalAlunos} alunos`}
          action={
            <button
              onClick={() => alert("Em desenvolvimento")}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-extrabold text-white"
              style={{ background: APROVA.blue }}
            >
              <Plus size={14} weight="bold" /> Nova turma
            </button>
          }
        />
      </RevealItem>

      {atencaoTurmas.length > 0 && (
        <RevealItem className="mb-4">
          <AlertBanner
            tone="warning"
            text={`${atencaoTurmas.map((t) => t.nome).join(", ")} — ${atencaoTurmas.length === 1 ? "turma com" : "turmas com"} indicadores de atenção.`}
            actionLabel="Ver detalhe"
            href={`/teacher/turmas/${atencaoTurmas[0].id}`}
          />
        </RevealItem>
      )}

      <RevealItem className="mb-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TURMAS.map((turma) => (
            <ClassCard key={turma.id} turma={turma} />
          ))}
        </div>
      </RevealItem>

      <RevealItem>
        <BentoCard>
          <SectionTitle title="Visão consolidada" kicker="Comparativo" />
          <DataTable columns={columns} rows={consolidadoRows} pageSize={10} />
        </BentoCard>
      </RevealItem>
    </RevealGroup>
  )
}
