"use client"

import Link from "next/link"
import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, ChevronLeft, ChevronRight, Clock, Play, Send } from "lucide-react"
import { QuestionDisplay, type DisplayQuestion } from "@/components/questions/QuestionDisplay"
import { ReportDialog } from "@/components/questions/ReportDialog"

type ExamAnswer = { id: string; question_id: string; order_index: number; selected_option: string | null; is_annulled: boolean; question: DisplayQuestion }
type ResultBucket = { correct: number; total: number; percentage: number }
type ExamResult = {
  score: number
  total_questions: number
  percentage: number
  tri_score: number | null
  annulled_questions_count: number
  results_by_subject: Record<string, ResultBucket>
}

const FORMAT_LABELS: Record<string, string> = {
  linguagens: "Linguagens",
  humanas: "Humanas",
  natureza: "Natureza",
  matematica: "Matemática",
  dia1: "ENEM Dia 1",
  dia2: "ENEM Dia 2",
  completo: "Completo",
  custom: "Custom",
}

export default function SimuladosPage() {
  const router = useRouter()
  const [bank, setBank] = useState("ENEM")
  const [format, setFormat] = useState("custom")
  const [subject, setSubject] = useState("")
  const [difficulty, setDifficulty] = useState("misto")
  const [qty, setQty] = useState(10)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [questions, setQuestions] = useState<DisplayQuestion[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [idx, setIdx] = useState(0)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ExamResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [reportQuestionId, setReportQuestionId] = useState<string | null>(null)
  const startRef = useRef<number>(0)

  const current = questions[idx]
  const answeredCount = Object.keys(answers).length
  const formats = useMemo(() => bank === "ENEM" ? ["custom", "linguagens", "humanas", "natureza", "matematica", "dia1", "dia2", "completo"] : ["custom", "linguagens", "humanas", "natureza", "matematica", "completo"], [bank])

  useEffect(() => {
    fetch("/api/proxy/exam-sessions/me?status=in_progress&limit=1")
      .then((res) => {
        if (res.status === 401) {
          router.push("/sign-in")
          return null
        }
        return res.json()
      })
      .then(async (data: { exam_sessions?: Array<{ id: string }> }) => {
        if (!data) return
        const existing = data.exam_sessions?.[0]
        if (!existing) return
        const detailRes = await fetch(`/api/proxy/exam-sessions/${existing.id}`)
        const detail = await detailRes.json() as { answers?: ExamAnswer[] }
        if (!detailRes.ok) return
        setSessionId(existing.id)
        const resumedAnswers = detail.answers ?? []
        setQuestions(resumedAnswers.map((answer) => answer.question))
        setAnswers(Object.fromEntries(resumedAnswers.filter((answer) => answer.selected_option).map((answer) => [answer.question_id, answer.selected_option as string])))
        startRef.current = Date.now()
      })
      .catch(() => undefined)
  }, [router])

  async function start() {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch("/api/proxy/exam-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config: { bank, format, subject: subject || null, difficulty, qty: format === "custom" ? qty : undefined } }),
      })
      const data = await res.json() as { error?: string; code?: string; exam_session: { id: string }; questions: DisplayQuestion[]; answers: ExamAnswer[] }
      if (res.status === 401) {
        router.push("/sign-in")
        return
      }
      if (!res.ok) throw new Error(data.code === "NO_QUESTIONS_FOUND" ? "Nenhuma questão encontrada para estes filtros." : data.error || "Erro ao iniciar simulado")
      setSessionId(data.exam_session.id)
      setQuestions(data.questions)
      setAnswers({})
      setIdx(0)
      startRef.current = Date.now()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao iniciar simulado")
    } finally {
      setLoading(false)
    }
  }

  async function select(questionId: string, letter: string) {
    if (!sessionId) return
    setAnswers((prev) => ({ ...prev, [questionId]: letter }))
    await fetch(`/api/proxy/exam-sessions/${sessionId}/answers/${questionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ selected_option: letter }),
    })
  }

  async function complete() {
    if (!sessionId) return
    setLoading(true)
    setError(null)
    const time_taken_secs = Math.floor((Date.now() - startRef.current) / 1000)
    const res = await fetch(`/api/proxy/exam-sessions/${sessionId}/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ time_taken_secs }),
    })
    const data = await res.json() as { error?: string; code?: string; minimum_required?: number; total_questions?: number; answered_count?: number; exam_session?: ExamResult }
    setLoading(false)
    if (res.status === 401) {
      router.push("/sign-in")
      return
    }
    if (!res.ok) {
      setError(data.code === "MIN_ANSWERS_NOT_REACHED" ? `Responda pelo menos ${data.minimum_required} de ${data.total_questions} questões para finalizar. Você respondeu ${data.answered_count}.` : data.error || "Erro ao finalizar.")
      return
    }
    if (data.exam_session) setResult(data.exam_session)
  }

  if (result) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-6">
        <div className="rounded-lg border bg-white p-6">
          <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">Resultado</p>
          <h1 className="mt-1 text-3xl font-black text-slate-950">{result.score}/{result.total_questions} acertos</h1>
          <p className="mt-1 text-slate-600">{result.percentage}% de aproveitamento{result.tri_score ? ` · TRI ${result.tri_score}` : ""}</p>
          {result.annulled_questions_count > 0 && <p className="mt-2 text-sm font-semibold text-amber-700">{result.annulled_questions_count} questão(ões) anulada(s) por report.</p>}
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {Object.entries(result.results_by_subject ?? {}).map(([name, bucket]) => (
              <div key={name} className="rounded-md border p-3">
                <p className="font-bold text-slate-900">{name}</p>
                <p className="text-sm text-slate-600">{bucket.correct}/{bucket.total} · {bucket.percentage}%</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link href={`/student/simulados/${sessionId}/revisao`} className="rounded-md bg-slate-900 px-4 py-2 text-sm font-bold text-white">Revisar questões</Link>
            <Link href="/student/simulados/historico" className="rounded-md border px-4 py-2 text-sm font-bold">Histórico</Link>
            <button onClick={() => { setResult(null); setSessionId(null); setQuestions([]); setAnswers({}) }} className="rounded-md border px-4 py-2 text-sm font-bold">Novo simulado</button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-amber-700">Simulados</p>
          <h1 className="text-2xl font-black text-slate-950">Prova cronometrada</h1>
        </div>
        <Link href="/student/simulados/historico" className="rounded-md border bg-white px-4 py-2 text-sm font-bold">Ver histórico</Link>
      </div>

      {!sessionId ? (
        <section className="rounded-lg border bg-white p-5">
          <div className="grid gap-4 md:grid-cols-5">
            <select value={bank} onChange={(e) => setBank(e.target.value)} className="h-10 rounded-md border px-3 text-sm">
              {["ENEM", "UFU", "UEG", "UFG"].map((item) => <option key={item}>{item}</option>)}
            </select>
            <select value={format} onChange={(e) => setFormat(e.target.value)} className="h-10 rounded-md border px-3 text-sm">
              {formats.map((item) => <option key={item} value={item}>{FORMAT_LABELS[item]}</option>)}
            </select>
            <input value={subject} disabled={format !== "custom"} onChange={(e) => setSubject(e.target.value)} placeholder="Matéria custom" className="h-10 rounded-md border px-3 text-sm disabled:bg-slate-100" />
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="h-10 rounded-md border px-3 text-sm">
              <option value="misto">Misto</option><option value="easy">Fácil</option><option value="medium">Médio</option><option value="hard">Difícil</option>
            </select>
            <input value={qty} disabled={format !== "custom"} onChange={(e) => setQty(Number(e.target.value))} type="number" min={1} max={180} className="h-10 rounded-md border px-3 text-sm disabled:bg-slate-100" />
          </div>
          {error && <p className="mt-3 text-sm font-semibold text-red-700">{error}</p>}
          <button disabled={loading} onClick={start} className="mt-5 inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"><Play size={16} /> Iniciar simulado</button>
        </section>
      ) : current ? (
        <section className="grid gap-4 lg:grid-cols-[1fr_260px]">
          <div className="grid gap-3">
            <div className="flex items-center justify-between rounded-lg border bg-white p-3 text-sm font-bold text-slate-600">
              <span>Questão {idx + 1} de {questions.length}</span>
              <span className="inline-flex items-center gap-1"><Clock size={14} /> {answeredCount} respondidas</span>
            </div>
            <QuestionDisplay question={current} selected={answers[current.id] ?? null} disabled={false} onSelect={(letter) => select(current.id, letter)} onReport={() => setReportQuestionId(current.id)} />
            {error && <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
            <div className="flex items-center justify-between">
              <button disabled={idx === 0} onClick={() => setIdx((value) => Math.max(0, value - 1))} className="inline-flex items-center gap-2 rounded-md border bg-white px-4 py-2 text-sm font-bold disabled:opacity-40"><ChevronLeft size={16} /> Anterior</button>
              {idx < questions.length - 1 ? (
                <button onClick={() => setIdx((value) => value + 1)} className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-bold text-white">Próxima <ChevronRight size={16} /></button>
              ) : (
                <button disabled={loading} onClick={complete} className="inline-flex items-center gap-2 rounded-md bg-emerald-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"><Send size={16} /> Finalizar</button>
              )}
            </div>
          </div>
          <aside className="rounded-lg border bg-white p-4">
            <p className="mb-3 text-sm font-extrabold text-slate-900">Grade de respostas</p>
            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, index) => (
                <button key={q.id} onClick={() => setIdx(index)} className={`h-9 rounded-md text-xs font-black ${idx === index ? "bg-slate-900 text-white" : answers[q.id] ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"}`}>
                  {index + 1}
                </button>
              ))}
            </div>
            <button disabled={loading} onClick={complete} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-emerald-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"><CheckCircle2 size={16} /> Entregar prova</button>
          </aside>
        </section>
      ) : null}

      <ReportDialog open={Boolean(reportQuestionId)} questionId={reportQuestionId} onOpenChange={(open) => !open && setReportQuestionId(null)} />
    </main>
  )
}
