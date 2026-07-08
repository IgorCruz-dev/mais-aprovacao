"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, Fire, Trophy } from "@phosphor-icons/react"
import type { ParentStudentProgressResponse } from "@mais-aprovacao/types"
import { APROVA, BentoCard, PageHeader, ProgressBar, SectionTitle } from "@/components/student/StudentSurface"

type ViewState =
  | { status: "loading" }
  | { status: "not_verified" }
  | { status: "error"; message: string }
  | { status: "ready"; data: ParentStudentProgressResponse }

export default function ParentStudentProgressPage() {
  const { studentId } = useParams<{ studentId: string }>()
  const [state, setState] = useState<ViewState>({ status: "loading" })

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch(`/api/proxy/parent/students/${studentId}/progress`, { cache: "no-store" })
        const data = await res.json()
        if (cancelled) return
        if (res.status === 403 && data.code === "PARENT_LINK_NOT_VERIFIED") {
          setState({ status: "not_verified" })
        } else if (!res.ok) {
          setState({ status: "error", message: data.error ?? "Erro ao carregar o progresso." })
        } else {
          setState({ status: "ready", data })
        }
      } catch {
        if (!cancelled) setState({ status: "error", message: "Erro de conexão. Tente novamente." })
      }
    }
    void load()
    return () => { cancelled = true }
  }, [studentId])

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Link href="/parent/dashboard" className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-bold" style={{ color: APROVA.blue }}>
        <ArrowLeft size={15} weight="bold" /> Meus alunos
      </Link>

      {state.status === "loading" && (
        <BentoCard><p className="text-[13.5px]" style={{ color: APROVA.inkMuted }}>Carregando progresso…</p></BentoCard>
      )}

      {state.status === "not_verified" && (
        <BentoCard>
          <p className="text-[15px] font-extrabold" style={{ color: APROVA.ink }}>Vínculo aguardando verificação</p>
          <p className="mt-1 text-[13.5px]" style={{ color: APROVA.inkMuted }}>
            O acompanhamento é liberado assim que a equipe verificar seu vínculo com este aluno.
          </p>
        </BentoCard>
      )}

      {state.status === "error" && (
        <BentoCard><p className="text-[13.5px]" style={{ color: APROVA.error }}>{state.message}</p></BentoCard>
      )}

      {state.status === "ready" && (
        <>
          <PageHeader
            kicker="Acompanhamento"
            title={state.data.student.name}
            subtitle="Progresso nos cursos e engajamento na plataforma."
          />

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <BentoCard>
              <div className="flex items-center justify-between">
                <p className="text-[12px] font-bold uppercase tracking-wide" style={{ color: APROVA.inkMuted }}>Pontos acumulados</p>
                <Trophy size={20} weight="fill" color={APROVA.gold} />
              </div>
              <p className="mt-3 font-display text-[34px] font-bold" style={{ color: APROVA.ink }}>
                {state.data.gamification.total_points.toLocaleString("pt-BR")}
              </p>
            </BentoCard>
            <BentoCard>
              <div className="flex items-center justify-between">
                <p className="text-[12px] font-bold uppercase tracking-wide" style={{ color: APROVA.inkMuted }}>Streak atual</p>
                <Fire size={20} weight="fill" color={APROVA.streak} />
              </div>
              <p className="mt-3 font-display text-[34px] font-bold" style={{ color: APROVA.ink }}>
                {state.data.gamification.current_streak} {state.data.gamification.current_streak === 1 ? "dia" : "dias"}
              </p>
            </BentoCard>
          </div>

          <SectionTitle title="Progresso por curso" kicker="Cursos" />
          {state.data.courses.length === 0 ? (
            <BentoCard>
              <p className="text-[13.5px]" style={{ color: APROVA.inkMuted }}>
                Este aluno ainda não está matriculado em nenhum curso.
              </p>
            </BentoCard>
          ) : (
            <div className="flex flex-col gap-3">
              {state.data.courses.map((course) => (
                <BentoCard key={course.course_id}>
                  <div className="mb-2 flex items-baseline justify-between gap-3">
                    <p className="truncate text-[15px] font-extrabold" style={{ color: APROVA.ink }}>{course.course_title}</p>
                    <p className="shrink-0 text-[12.5px] font-bold" style={{ color: APROVA.inkMuted }}>
                      {course.completed_lessons}/{course.total_lessons} aulas
                    </p>
                  </div>
                  <ProgressBar pct={course.watched_pct_avg} />
                  <p className="mt-1.5 text-[12px]" style={{ color: APROVA.inkMuted }}>{course.watched_pct_avg}% assistido em média</p>
                </BentoCard>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
