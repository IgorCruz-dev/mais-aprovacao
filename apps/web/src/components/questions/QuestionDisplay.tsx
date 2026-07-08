"use client"

import { Flag } from "lucide-react"
import { QuestionRichText } from "./QuestionRichText"
import { extractImageUrls, stripMarkdownImages } from "./rendering"

export type QuestionAlternative = { letter: string; text: string; image?: string | null; isCorrect?: boolean }

export type DisplayQuestion = {
  id: string
  external_id?: string
  exam_year?: number
  bank?: string | null
  subject?: string | null
  topic?: string | null
  difficulty?: string | null
  context?: string | null
  statement?: string | null
  alternatives_intro?: string | null
  alternatives?: QuestionAlternative[]
  images?: string[] | null
  testlet_group_id?: string | null
}

export function QuestionDisplay({
  question,
  selected,
  correct,
  disabled,
  onSelect,
  onReport,
}: {
  question: DisplayQuestion
  selected?: string | null
  correct?: string | null
  disabled?: boolean
  onSelect?: (letter: string) => void
  onReport?: () => void
}) {
  const supportImages = extractImageUrls(question.images)
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-600">
        {question.subject && <span className="rounded-md bg-blue-50 px-2 py-1 text-blue-700">{question.subject}</span>}
        {question.bank && <span className="rounded-md bg-slate-100 px-2 py-1">{question.bank}</span>}
        {question.exam_year && <span>{question.exam_year}</span>}
        {question.difficulty && <span>{question.difficulty}</span>}
        {question.topic && <span className="text-slate-400">{question.topic}</span>}
        {onReport && (
          <button type="button" onClick={onReport} className="ml-auto inline-flex items-center gap-1 rounded-md px-2 py-1 text-slate-500 hover:bg-red-50 hover:text-red-700">
            <Flag size={14} /> Reportar
          </button>
        )}
      </div>

      {question.context && <QuestionRichText text={stripMarkdownImages(question.context)} className="text-sm leading-relaxed text-slate-800" />}
      {supportImages.length > 0 && (
        <div className="my-4 grid gap-3">
          {supportImages.map((src) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={src} src={src} alt="Imagem da questão" className="max-h-[28rem] w-auto max-w-full rounded-lg border object-contain" />
          ))}
        </div>
      )}
      {(question.statement || question.alternatives_intro) && (
        <QuestionRichText text={question.statement ?? question.alternatives_intro} className="mt-4 text-sm font-semibold text-slate-900" />
      )}

      <div className="mt-5 grid gap-2">
        {(question.alternatives ?? []).map((alt) => {
          const isSelected = selected === alt.letter
          const isCorrect = correct === alt.letter
          const revealed = Boolean(correct)
          const tone = revealed && isCorrect ? "border-emerald-500 bg-emerald-50" : revealed && isSelected ? "border-red-500 bg-red-50" : isSelected ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white hover:bg-slate-50"
          return (
            <button
              key={alt.letter}
              type="button"
              disabled={disabled}
              onClick={() => onSelect?.(alt.letter)}
              className={`flex min-h-12 w-full items-start gap-3 rounded-lg border p-3 text-left transition ${tone}`}
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-900 text-xs font-black text-white">{alt.letter}</span>
              <span className="min-w-0 flex-1 text-sm text-slate-800">
                <QuestionRichText text={alt.text} />
                {alt.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={alt.image} alt={`Alternativa ${alt.letter}`} className="mt-2 max-h-60 max-w-full rounded-md border object-contain" />
                )}
              </span>
            </button>
          )
        })}
      </div>
    </article>
  )
}
