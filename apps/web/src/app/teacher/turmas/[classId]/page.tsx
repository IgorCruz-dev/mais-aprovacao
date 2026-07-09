"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, VideoCamera } from "@phosphor-icons/react"
import {
  APROVA, BentoCard, NavyCard, SectionTitle, ProgressBar, DataTable, type DataTableColumn,
  Avatar, RevealGroup, RevealItem, AlertBanner,
} from "@/components/teacher/TeacherSurface"
import {
  TeacherClassBadge, TeacherLessonBadge, TeacherEssayBadge, StudentAcademicBadge,
} from "@/components/teacher/TeacherSurface"
import {
  TURMAS, AULAS, REDACOES, SIMULADOS,
  getAlunosByTurma, type TeacherStudent,
} from "@/lib/mock-teacher-data"

type Tab = "resumo" | "alunos" | "atividades" | "desempenho"

export default function TurmaDetailPage() {
  const { classId } = useParams<{ classId: string }>()
  const [tab, setTab] = useState<Tab>("resumo")

  const turma = TURMAS.find((t) => t.id === classId)
  if (!turma) {
    return (
      <div className="mx-auto max-w-[1240px] px-4 pt-8">
        <BentoCard>
          <p className="text-[14px] font-bold" style={{ color: APROVA.inkMuted }}>Turma não encontrada.</p>
          <Link href="/teacher/turmas" className="mt-3 inline-block text-[13px] font-bold" style={{ color: APROVA.blue }}>← Voltar para turmas</Link>
        </BentoCard>
      </div>
    )
  }

  const alunos = getAlunosByTurma(classId)
  const aulas = AULAS.filter((a) => a.turmaId === classId)
  const redacoes = REDACOES.filter((r) => r.turmaId === classId)
  const simulados = SIMULADOS.filter((s) => s.turmaIds.includes(classId))
  const emRisco = alunos.filter((a) => a.riskLevel !== "otimo")

  const TABS: { key: Tab; label: string }[] = [
    { key: "resumo", label: "Resumo" },
    { key: "alunos", label: `Alunos (${alunos.length})` },
    { key: "atividades", label: "Atividades" },
    { key: "desempenho", label: "Desempenho" },
  ]

  const alunoColumns: DataTableColumn<TeacherStudent>[] = [
    {
      key: "name", header: "Aluno",
      render: (r) => (
        <Link href={`/teacher/alunos/${r.id}`} className="flex items-center gap-2.5 hover:underline">
          <Avatar initial={r.initial} color={r.color} size={30} />
          <span className="font-bold" style={{ color: APROVA.ink }}>{r.name}</span>
        </Link>
      ),
    },
    { key: "status", header: "Status", render: (r) => <StudentAcademicBadge status={r.riskLevel} /> },
    { key: "media", header: "Média", render: (r) => <span className="tabular font-bold" style={{ color: APROVA.ink }}>{r.mediaGeral}%</span> },
    { key: "freq", header: "Freq.", render: (r) => <span className="tabular" style={{ color: r.frequencia >= 80 ? APROVA.success : "#B45309" }}>{r.frequencia}%</span> },
    { key: "questoes", header: "Questões", render: (r) => <span className="tabular">{r.questoesRespondidas}</span> },
    { key: "last", header: "Última atividade", render: (r) => <span style={{ color: APROVA.inkMuted }}>{r.lastActivityAt}</span> },
  ]

  // Subject performance average across alunos
  const subjectMap: Record<string, number[]> = {}
  alunos.forEach((a) => {
    a.subjectPerformance.forEach((sp) => {
      if (!subjectMap[sp.subject]) subjectMap[sp.subject] = []
      subjectMap[sp.subject].push(sp.pct)
    })
  })
  const subjectAvg = Object.entries(subjectMap).map(([subject, values]) => ({
    subject,
    avg: Math.round(values.reduce((a, b) => a + b, 0) / values.length),
  })).sort((a, b) => a.avg - b.avg)

  return (
    <RevealGroup className="mx-auto max-w-[1240px] px-4 pt-4 lg:px-8 lg:pt-7">
      <RevealItem>
        <Link href="/teacher/turmas" className="mb-4 inline-flex items-center gap-1.5 text-[12.5px] font-bold" style={{ color: APROVA.inkMuted }}>
          <ArrowLeft size={14} /> Turmas
        </Link>
      </RevealItem>

      <RevealItem className="mb-4">
        <NavyCard halftone="white" className="p-4 lg:p-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: "rgba(255,255,255,0.5)" }}>{turma.course} · {turma.periodoLabel}</p>
              <h1 className="font-display text-[28px] font-bold text-white lg:text-[34px]">{turma.nome}</h1>
            </div>
            <div className="flex flex-wrap gap-2">
              <TeacherClassBadge status={turma.status} />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-4">
            {[
              { label: "Alunos", value: turma.totalAlunos },
              { label: "Média", value: `${turma.mediaGeral}%` },
              { label: "Frequência", value: `${turma.frequenciaMedia}%` },
              { label: "Progresso", value: `${turma.progressoCurso}%` },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl px-3 py-2" style={{ background: "rgba(255,255,255,0.08)" }}>
                <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "rgba(255,255,255,0.5)" }}>{label}</p>
                <p className="font-display text-[18px] font-bold text-white">{value}</p>
              </div>
            ))}
          </div>
        </NavyCard>
      </RevealItem>

      {emRisco.length > 0 && (
        <RevealItem className="mb-4">
          <AlertBanner
            tone="warning"
            text={`${emRisco.length} ${emRisco.length === 1 ? "aluno" : "alunos"} precisam de atenção nesta turma.`}
            actionLabel="Ver alunos"
            href="#alunos"
          />
        </RevealItem>
      )}

      {/* Tabs */}
      <RevealItem className="mb-4">
        <div className="flex gap-1 rounded-2xl p-1" style={{ background: "#EEF1F7" }}>
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="flex-1 rounded-xl px-3 py-2 text-[12.5px] font-bold transition-colors"
              style={{
                background: tab === t.key ? "#fff" : "transparent",
                color: tab === t.key ? APROVA.ink : APROVA.inkMuted,
                boxShadow: tab === t.key ? "0 1px 4px rgba(0,0,0,0.08)" : undefined,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </RevealItem>

      {tab === "resumo" && (
        <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[1fr_320px] lg:items-start lg:gap-5">
          <div className="flex flex-col gap-4">
            {/* Alunos em atenção */}
            <BentoCard>
              <SectionTitle title="Alunos que precisam de atenção" kicker="Risco" />
              {emRisco.length === 0 ? (
                <p className="py-2 text-[12.5px]" style={{ color: APROVA.inkMuted }}>Todos os alunos estão bem.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {emRisco.map((a) => (
                    <Link key={a.id} href={`/teacher/alunos/${a.id}`} className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-[#F6F7FB]" style={{ border: "1px solid #EEF1F7" }}>
                      <Avatar initial={a.initial} color={a.color} size={32} />
                      <div className="min-w-0 flex-1">
                        <p className="text-[12.5px] font-bold" style={{ color: APROVA.ink }}>{a.name}</p>
                        <p className="text-[10.5px]" style={{ color: APROVA.inkMuted }}>{a.lastActivityAt}</p>
                      </div>
                      <StudentAcademicBadge status={a.riskLevel} />
                    </Link>
                  ))}
                </div>
              )}
            </BentoCard>

            {/* Últimas aulas */}
            <BentoCard>
              <SectionTitle title="Aulas" kicker="Gestão" actionLabel="Ver aulas" onAction={() => { window.location.href = "/teacher/aulas" }} />
              <div className="flex flex-col">
                {aulas.slice(0, 4).map((a, i) => {
                  const d = new Date(a.scheduledAt)
                  return (
                    <div key={a.id} className="flex items-center gap-3 py-2.5" style={{ borderTop: i > 0 ? "1px solid #F1F3F8" : undefined }}>
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: APROVA.blueSoft }}>
                        <VideoCamera size={16} weight="fill" color={APROVA.blue} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[12.5px] font-bold" style={{ color: APROVA.ink }}>{a.title}</p>
                        <p className="text-[10.5px]" style={{ color: APROVA.inkMuted }}>
                          {d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })} · {a.durationMin}min
                          {a.attendancePct !== null && ` · ${a.attendancePct}% presença`}
                        </p>
                      </div>
                      <TeacherLessonBadge status={a.status} />
                    </div>
                  )
                })}
              </div>
            </BentoCard>
          </div>

          <div className="flex flex-col gap-4">
            {/* Redações pendentes */}
            <BentoCard>
              <SectionTitle title="Redações" kicker="Correções" actionLabel="Corrigir" onAction={() => { window.location.href = "/teacher/correcoes" }} />
              <div className="flex flex-col">
                {redacoes.filter((r) => r.status !== "concluida").slice(0, 4).map((r, i) => (
                  <div key={r.id} className="flex items-center gap-3 py-2" style={{ borderTop: i > 0 ? "1px solid #F1F3F8" : undefined }}>
                    <Avatar initial={r.studentInitial} size={28} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12px] font-bold" style={{ color: APROVA.ink }}>{r.studentName}</p>
                      <p className="text-[10px]" style={{ color: APROVA.inkMuted }}>há {r.elapsedHours}h</p>
                    </div>
                    <TeacherEssayBadge status={r.status} />
                  </div>
                ))}
                {redacoes.filter((r) => r.status !== "concluida").length === 0 && (
                  <p className="py-2 text-[12px]" style={{ color: APROVA.inkMuted }}>Nenhuma pendente.</p>
                )}
              </div>
            </BentoCard>

            {/* Progresso */}
            <BentoCard>
              <SectionTitle title="Progresso do curso" kicker="Conteúdo" />
              <div className="my-1 flex items-baseline gap-1">
                <span className="font-display text-[42px] font-bold" style={{ color: APROVA.ink }}>{turma.progressoCurso}%</span>
                <span className="text-[13px]" style={{ color: APROVA.inkMuted }}>concluído</span>
              </div>
              <ProgressBar pct={turma.progressoCurso} height={10} glow />
            </BentoCard>
          </div>
        </div>
      )}

      {tab === "alunos" && (
        <BentoCard>
          <SectionTitle title="Alunos da turma" kicker={`${alunos.length} alunos`} />
          <DataTable columns={alunoColumns} rows={alunos} pageSize={15} />
        </BentoCard>
      )}

      {tab === "atividades" && (
        <div className="flex flex-col gap-4">
          <BentoCard>
            <SectionTitle title="Aulas" kicker="Histórico" />
            <div className="flex flex-col">
              {aulas.map((a, i) => {
                const d = new Date(a.scheduledAt)
                return (
                  <div key={a.id} className="flex items-center gap-3 py-3" style={{ borderTop: i > 0 ? "1px solid #F1F3F8" : undefined }}>
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: APROVA.blueSoft }}>
                      <VideoCamera size={18} weight="fill" color={APROVA.blue} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-bold" style={{ color: APROVA.ink }}>{a.title}</p>
                      <p className="text-[11px]" style={{ color: APROVA.inkMuted }}>
                        {d.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" })} · {a.durationMin}min
                        {a.attendeesCount !== null && ` · ${a.attendeesCount}/${a.attendeesExpected} presentes`}
                      </p>
                    </div>
                    <TeacherLessonBadge status={a.status} />
                  </div>
                )
              })}
            </div>
          </BentoCard>

          <BentoCard>
            <SectionTitle title="Simulados" kicker="Avaliações" />
            <div className="flex flex-col gap-3">
              {simulados.length === 0 ? (
                <p className="py-2 text-[12.5px]" style={{ color: APROVA.inkMuted }}>Nenhum simulado para esta turma.</p>
              ) : simulados.map((s) => (
                <div key={s.id} className="rounded-xl p-3" style={{ background: "#F6F7FB" }}>
                  <p className="text-[13px] font-bold" style={{ color: APROVA.ink }}>{s.title}</p>
                  {s.participacaoPct !== null && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-[11.5px]">
                        <span style={{ color: APROVA.inkMuted }}>Participação</span>
                        <span className="font-bold" style={{ color: APROVA.ink }}>{s.participantes}/{s.totalAlunos} ({s.participacaoPct}%)</span>
                      </div>
                      <ProgressBar pct={s.participacaoPct} height={6} color="#D97706" />
                    </div>
                  )}
                  {s.mediaGeral !== null && (
                    <p className="mt-1 text-[11.5px]" style={{ color: APROVA.inkMuted }}>Média: <span className="font-bold" style={{ color: APROVA.ink }}>{s.mediaGeral}%</span></p>
                  )}
                </div>
              ))}
            </div>
          </BentoCard>
        </div>
      )}

      {tab === "desempenho" && (
        <div className="flex flex-col gap-4 lg:grid lg:grid-cols-2 lg:gap-5">
          <BentoCard>
            <SectionTitle title="Desempenho por matéria" kicker="Média da turma" />
            <div className="flex flex-col gap-3">
              {subjectAvg.map(({ subject, avg }) => (
                <div key={subject}>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-[12.5px] font-semibold" style={{ color: APROVA.ink }}>{subject}</span>
                    <span className="text-[12.5px] font-bold tabular" style={{ color: avg >= 70 ? APROVA.success : avg >= 50 ? "#B45309" : APROVA.error }}>{avg}%</span>
                  </div>
                  <ProgressBar pct={avg} height={7} color={avg >= 70 ? APROVA.success : avg >= 50 ? "#F59E0B" : APROVA.error} />
                </div>
              ))}
            </div>
          </BentoCard>

          <BentoCard>
            <SectionTitle title="Distribuição por status" kicker="Alunos" />
            <div className="flex flex-col gap-3">
              {[
                { label: "Ótimo", count: turma.alunosOtimo, color: APROVA.success },
                { label: "Atenção", count: turma.alunosAtencao, color: "#F59E0B" },
                { label: "Risco", count: turma.alunosRisco, color: APROVA.error },
              ].map(({ label, count, color }) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="w-16 text-[12.5px] font-bold" style={{ color }}>{label}</span>
                  <div className="flex-1">
                    <ProgressBar pct={turma.totalAlunos > 0 ? Math.round((count / turma.totalAlunos) * 100) : 0} height={8} color={color} />
                  </div>
                  <span className="w-8 text-right text-[13px] font-bold tabular" style={{ color: APROVA.ink }}>{count}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-2xl p-3" style={{ background: "#F6F7FB" }}>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div>
                  <p className="font-display text-[24px] font-bold" style={{ color: APROVA.ink }}>{turma.mediaGeral}%</p>
                  <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: APROVA.inkMuted }}>Média geral</p>
                </div>
                <div>
                  <p className="font-display text-[24px] font-bold" style={{ color: APROVA.ink }}>{turma.frequenciaMedia}%</p>
                  <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: APROVA.inkMuted }}>Frequência</p>
                </div>
              </div>
            </div>
          </BentoCard>
        </div>
      )}
    </RevealGroup>
  )
}
