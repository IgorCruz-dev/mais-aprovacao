"use client"

import { useState } from "react"
import { QuestionDisplay, type DisplayQuestion } from "./QuestionDisplay"
import { QuestionRichText } from "./QuestionRichText"

type AttemptResult = {
  is_correct: boolean
  correct_alternative: string | null
  already_answered_correctly: boolean
  points_awarded: number
  explanation: string
}

export function QuestionCard({
  question,
  onAnswered,
  onReport,
}: {
  question: DisplayQuestion
  onAnswered?: (result: AttemptResult) => void
  onReport?: () => void
}) {
  const [selected, setSelected] = useState<string | null>(null)
  const [result, setResult] = useState<AttemptResult | null>(null)
  const [loading, setLoading] = useState(false)

  async function submit(letter: string) {
    if (loading || result) return
    setSelected(letter)
    setLoading(true)
    try {
      const res = await fetch("/api/proxy/question-attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question_id: question.id, selected_option: letter }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Erro ao responder")
      setResult(data.attempt)
      onAnswered?.(data.attempt)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-3">
      <QuestionDisplay
        question={question}
        selected={selected}
        correct={result?.correct_alternative ?? null}
        disabled={loading || Boolean(result)}
        onSelect={submit}
        onReport={onReport}
      />
      {result && (
        <div className={`rounded-lg border p-4 ${result.is_correct ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"}`}>
          <p className={`text-sm font-bold ${result.is_correct ? "text-emerald-800" : "text-red-800"}`}>
            {result.is_correct ? "Resposta correta" : `Resposta incorreta. Gabarito: ${result.correct_alternative}`}
          </p>
          {result.already_answered_correctly && (
            <p className="mt-1 text-xs font-semibold text-amber-700">Você já acertou esta questão antes, então ela não pontuou novamente.</p>
          )}
          <p className="mt-1 text-xs font-semibold text-slate-600">Pontos: {result.points_awarded}</p>
          <QuestionRichText text={result.explanation} className="mt-3 text-sm text-slate-700" />
        </div>
      )}
    </div>
  )
}
