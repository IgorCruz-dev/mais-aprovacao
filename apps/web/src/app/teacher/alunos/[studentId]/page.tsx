"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, CaretUp, CaretDown, Minus, Fire, PencilLine, Exam, BookOpen } from "@phosphor-icons/react"
import {
  APROVA, BentoCard, NavyCard, SectionTitle, ProgressBar,
  RevealGroup, RevealItem, KpiCard, AnimatedNumber,
} from "@/components/teacher/TeacherSurface"
import { StudentAcademicBadge, TeacherEssayBadge, WeekdayDots, TeacherInsightCard } from "@/components/teacher/TeacherSurface"
import { TEACHER_STUDENTS, TURMAS, REDACOES } from "@/lib/mock-teacher-data"

export default function StudentDetailPage() {
  const { studentId } = useParams<{ studentId: string }>()

  const student = TEACHER_STUDENTS.find((s) => s.id === studentId)
  if (!student) {
    return (
      <div className="mx-auto max-w-[1240px] px-4 pt-8">
        <BentoCard>
          <p className="text-[14px] font-bold" style={{ color: APROVA.inkMuted }}>Aluno não encontrado.</p>
          <Link href="/teacher/alunos" className="mt-3 inline-block text-[13px] font-bold" style={{ color: APROVA.blue }}>← Voltar para alunos</Link>
        </BentoCard>
      </div>
    )
  }

  const turma = TURMAS.find((t) => t.id === student.turmaId)
  const redacoes = REDACOES.filter((r) => r.studentId === studentId)
  const pendentes = redacoes.filter((r) => r.status !== "concluida")

  const insights = student.insights.map((text, i) => ({
    id: `i-${i}`,
    tone: (student.riskLevel === "risco" ? "warning" : student.riskLevel === "atencao" ? "info" : "success") as "warning" | "info" | "success",
    text,
    href: null,
    actionLabel: null,
  }))

  const TrendIcon = ({ trend }: { trend: "up" | "down" | "stable" }) => {
    if (trend === "up") return <CaretUp size={12} weight="bold" color={APROVA.success} />
    if (trend === "down") return <CaretDown size={12} weight="bold" color={APROVA.error} />
    return <Minus size={12} weight="bold" color={APROVA.inkMuted} />
  }

  return (
    <RevealGroup className="mx-auto max-w-[1240px] px-4 pt-4 lg:px-8 lg:pt-7">
      <RevealItem>
        <Link href="/teacher/alunos" className="mb-4 inline-flex items-center gap-1.5 text-[12.5px] font-bold" style={{ color: APROVA.inkMuted }}>
          <ArrowLeft size={14} /> Alunos
        </Link>
      </RevealItem>

      <RevealItem className="mb-4">
        <NavyCard halftone="blue" className="p-4 lg:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-[26px] font-bold text-white" style={{ background: student.color }}>
              {student.initial}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-[24px] font-bold text-white lg:text-[28px]">{student.name}</h1>
                <StudentAcademicBadge status={student.riskLevel} />
              </div>
              <p className="mt-0.5 text-[13px]" style={{ color: "rgba(255,255,255,0.6)" }}>
                {student.turmaNome} · {turma?.course ?? ""} · Última atividade: {student.lastActivityAt}
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            {[
              { label: "Média", value: `${student.mediaGeral}%` },
              { label: "Frequência", value: `${student.frequencia}%` },
              { label: "Ofensiva", value: `${student.streak}d` },
              { label: "Questões", value: student.questoesRespondidas },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl px-3 py-2" style={{ background: "rgba(255,255,255,0.08)" }}>
                <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "rgba(255,255,255,0.5)" }}>{label}</p>
                <p className="font-display text-[18px] font-bold text-white">{value}</p>
              </div>
            ))}
          </div>
        </NavyCard>
      </RevealItem>

      <RevealItem className="mb-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          <KpiCard label="Média geral" value={<AnimatedNumber value={student.mediaGeral} />} unit="%" icon={BookOpen} color={student.mediaGeral >= 70 ? APROVA.success : APROVA.gold} />
          <KpiCard label="Frequência" value={<AnimatedNumber value={student.frequencia} />} unit="%" icon={Fire} color={student.frequencia >= 80 ? APROVA.success : APROVA.error} />
          <KpiCard
            label="Redações pendentes"
            value={<AnimatedNumber value={pendentes.length} />}
            icon={PencilLine}
            color={pendentes.length > 0 ? APROVA.error : APROVA.success}
          />
          <KpiCard label="Simulados feitos" value={<AnimatedNumber value={student.simuladosFeitos} />} icon={Exam} color="#D97706" />
        </div>
      </RevealItem>

      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[1fr_310px] lg:items-start lg:gap-5">
        <div className="flex flex-col gap-4">
          {/* Desempenho por matéria */}
          <RevealItem>
            <BentoCard>
              <SectionTitle title="Desempenho por matéria" kicker="Análise" />
              <div className="flex flex-col gap-3">
                {student.subjectPerformance.map((sp) => (
                  <div key={sp.subject}>
                    <div className="mb-1 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[12.5px] font-semibold" style={{ color: APROVA.ink }}>{sp.subject}</span>
                        {sp.forte && (
                          <span className="rounded-full px-1.5 py-0.5 text-[9px] font-bold" style={{ background: "#E6F8F0", color: APROVA.successDeep }}>Forte</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendIcon trend={sp.trend} />
                        <span className="text-[12.5px] font-bold tabular" style={{ color: sp.pct >= 70 ? APROVA.success : sp.pct >= 50 ? "#B45309" : APROVA.error }}>{sp.pct}%</span>
                      </div>
                    </div>
                    <ProgressBar
                      pct={sp.pct}
                      height={7}
                      color={sp.pct >= 70 ? APROVA.success : sp.pct >= 50 ? "#F59E0B" : APROVA.error}
                    />
                  </div>
                ))}
              </div>
            </BentoCard>
          </RevealItem>

          {/* Redações */}
          <RevealItem>
            <BentoCard>
              <SectionTitle title="Redações" kicker={`${redacoes.length} no total`} actionLabel="Ver todas" onAction={() => { window.location.href = "/teacher/correcoes" }} />
              <div className="flex flex-col">
                {redacoes.slice(0, 5).map((r, i) => (
                  <div key={r.id} className="flex items-start gap-3 py-2.5" style={{ borderTop: i > 0 ? "1px solid #F1F3F8" : undefined }}>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12.5px] font-bold" style={{ color: APROVA.ink }}>{r.theme}</p>
                      <p className="text-[10.5px]" style={{ color: APROVA.inkMuted }}>
                        Enviada em {new Date(r.submittedAt).toLocaleDateString("pt-BR")}
                        {r.score !== null && ` · Nota: ${r.score}/1000`}
                      </p>
                    </div>
                    <TeacherEssayBadge status={r.status} />
                  </div>
                ))}
                {redacoes.length === 0 && (
                  <p className="py-2 text-[12.5px]" style={{ color: APROVA.inkMuted }}>Nenhuma redação enviada.</p>
                )}
              </div>
            </BentoCard>
          </RevealItem>
        </div>

        <div className="flex flex-col gap-4">
          {/* Ofensiva e atividade */}
          <RevealItem>
            <BentoCard>
              <SectionTitle title="Atividade semanal" kicker="Engajamento" />
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: student.streak > 0 ? APROVA.streak + "14" : "#EEF1F7" }}>
                  <Fire size={22} weight="fill" color={student.streak > 0 ? APROVA.streak : APROVA.inkMuted} />
                </div>
                <div>
                  <p className="font-display text-[28px] font-bold" style={{ color: APROVA.ink }}>{student.streak}</p>
                  <p className="text-[11px]" style={{ color: APROVA.inkMuted }}>dias de ofensiva</p>
                </div>
              </div>
              <WeekdayDots days={student.activityDays} />
            </BentoCard>
          </RevealItem>

          {/* Participação */}
          <RevealItem>
            <BentoCard>
              <SectionTitle title="Participação" kicker="Histórico" />
              <div className="flex flex-col gap-2">
                {[
                  { Icon: PencilLine, label: "Redações entregues", value: student.redacoesEntregues, color: "#6C4BD9" },
                  { Icon: Exam, label: "Simulados feitos", value: student.simuladosFeitos, color: "#D97706" },
                  { Icon: BookOpen, label: "Questões respondidas", value: student.questoesRespondidas, color: APROVA.blue },
                ].map(({ Icon, label, value, color }) => (
                  <div key={label} className="flex items-center gap-3 rounded-xl px-3 py-2.5" style={{ background: "#F6F7FB" }}>
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl" style={{ background: color + "14" }}>
                      <Icon size={16} weight="fill" color={color} />
                    </div>
                    <span className="flex-1 text-[12.5px] font-semibold" style={{ color: APROVA.ink }}>{label}</span>
                    <span className="text-[16px] font-bold tabular" style={{ color: APROVA.ink }}>{value}</span>
                  </div>
                ))}
              </div>
            </BentoCard>
          </RevealItem>

          {/* Insights */}
          <RevealItem>
            <BentoCard>
              <SectionTitle title="Insights pedagógicos" kicker="Análise" />
              <TeacherInsightCard insights={insights} />
            </BentoCard>
          </RevealItem>

          {/* Observações */}
          <RevealItem>
            <BentoCard>
              <SectionTitle title="Observações do professor" kicker="Notas" />
              <div className="flex flex-col gap-2">
                <div className="rounded-xl p-3" style={{ background: "#F6F7FB" }}>
                  <p className="text-[12px]" style={{ color: APROVA.inkMuted }}>10 Jun 2026</p>
                  <p className="mt-1 text-[13px]" style={{ color: APROVA.ink }}>Aluno demonstrou dificuldade com proposta de intervenção. Recomendado estudo adicional de modelos.</p>
                </div>
              </div>
              <button
                onClick={() => alert("Em desenvolvimento")}
                className="mt-3 w-full rounded-2xl py-2.5 text-[13px] font-extrabold"
                style={{ background: APROVA.blueSoft, color: APROVA.blue }}
              >
                + Adicionar observação
              </button>
            </BentoCard>
          </RevealItem>
        </div>
      </div>
    </RevealGroup>
  )
}
