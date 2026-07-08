"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { QuestionDisplay } from "@/components/questions/QuestionDisplay"
import type { DisplayQuestion } from "@/components/questions/QuestionDisplay"
import { QuestionRichText } from "@/components/questions/QuestionRichText"

type ReviewAnswer = {
  id: string
  question_id: string
  selected_option: string | null
  question: DisplayQuestion
}

type ReviewItem = {
  explanation?: string
  correct_answer?: string | null
  user_answer?: string | null
  is_correct?: boolean
  is_annulled?: boolean
}

export default function RevisaoSimuladoPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const sessionId = params.id
  const [answers, setAnswers] = useState<ReviewAnswer[]>([])
  const [review, setReview] = useState<Record<string, ReviewItem>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const id = params.id
    Promise.all([
      fetch(`/api/proxy/exam-sessions/${id}`).then((res) => {
        if (res.status === 401) {
          router.push("/sign-in")
          return null
        }
        return res.json()
      }),
      fetch(`/api/proxy/exam-sessions/${id}/review`).then((res) => {
        if (res.status === 401) {
          router.push("/sign-in")
          return null
        }
        return res.json()
      }),
    ]).then(([detail, reviewData]) => {
      if (!detail || !reviewData) return
      setAnswers(detail.answers ?? [])
      setReview(reviewData.review?.explanations ?? {})
    }).finally(() => setLoading(false))
  }, [params.id, router])

  return (
    <main className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-blue-700">Revisão</p>
          <h1 className="text-2xl font-black text-slate-950">Revisão comentada</h1>
        </div>
        <Link href="/student/simulados/historico" className="rounded-md border bg-white px-4 py-2 text-sm font-bold">Histórico</Link>
      </div>
      {loading ? (
        <div className="rounded-lg border bg-white p-8 text-center text-sm font-semibold text-slate-500">Carregando revisão...</div>
      ) : (
        <div className="grid gap-5">
          {answers.map((answer, index) => {
            const item = review[answer.question_id] ?? {}
            return (
              <section key={answer.id} className="grid gap-3">
                <div className="flex items-center justify-between text-sm font-bold text-slate-500">
                  <span>Questão {index + 1}</span>
                  <span>{item.is_annulled ? "Anulada" : item.is_correct ? "Correta" : "Incorreta"}</span>
                </div>
                <QuestionDisplay question={answer.question} selected={answer.selected_option} correct={item.correct_answer} disabled />
                <div className="rounded-lg border bg-white p-4">
                  <p className="text-sm font-extrabold text-slate-950">Comentário</p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">Sua resposta: {item.user_answer ?? "em branco"} · Gabarito: {item.correct_answer ?? "-"}</p>
                  <QuestionRichText text={item.explanation ?? "Explicação indisponível."} className="mt-3 text-sm text-slate-700" />
                </div>
              </section>
            )
          })}
          {answers.length === 0 && <div className="rounded-lg border bg-white p-8 text-center text-sm font-semibold text-slate-500">Sessão não encontrada.</div>}
        </div>
      )}
      {!loading && sessionId && <p className="mt-6 text-xs text-slate-400">Sessão {sessionId}</p>}
    </main>
  )
}
