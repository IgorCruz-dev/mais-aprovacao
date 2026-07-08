"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, Filter } from "lucide-react"
import { QuestionCard } from "@/components/questions/QuestionCard"
import { ReportDialog } from "@/components/questions/ReportDialog"
import type { DisplayQuestion } from "@/components/questions/QuestionDisplay"

type Tab = "todo" | "done"
type Topic = { name: string; count: number }

const BANKS = ["", "ENEM", "UFU", "UEG", "UFG", "UNESP"]
const DIFFICULTIES = [
  { value: "", label: "Todas" },
  { value: "easy", label: "Fácil" },
  { value: "medium", label: "Médio" },
  { value: "hard", label: "Difícil" },
]

export default function QuestoesPage() {
  const router = useRouter()
  const [questions, setQuestions] = useState<DisplayQuestion[]>([])
  const [topics, setTopics] = useState<Topic[]>([])
  const [idx, setIdx] = useState(0)
  const [tab, setTab] = useState<Tab>("todo")
  const [subject, setSubject] = useState("")
  const [topic, setTopic] = useState("")
  const [bank, setBank] = useState("")
  const [difficulty, setDifficulty] = useState("")
  const [year, setYear] = useState("")
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reportQuestionId, setReportQuestionId] = useState<string | null>(null)

  const current = questions[idx]

  const params = useMemo(() => {
    const p = new URLSearchParams({ tab, limit: "20" })
    if (subject) p.set("subject", subject)
    if (topic) p.set("topic", topic)
    if (bank) p.set("bank", bank)
    if (difficulty) p.set("difficulty", difficulty)
    if (year) p.set("exam_year", year)
    return p
  }, [tab, subject, topic, bank, difficulty, year])

  async function load(cursor?: string | null, append = false) {
    setLoading(true)
    const p = new URLSearchParams(params)
    if (cursor) p.set("cursor", cursor)
    try {
      const res = await fetch(`/api/proxy/questions?${p.toString()}`)
      const data = await res.json()
      if (res.status === 401) {
        router.push("/sign-in")
        return
      }
      if (!res.ok) throw new Error(data.error || "Erro ao carregar questões")
      setQuestions((prev) => append ? [...prev, ...data.questions] : data.questions)
      setNextCursor(data.next_cursor)
      if (!append) setIdx(0)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar questões")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load()
    // `params` is the stable fetch key for this page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params])

  useEffect(() => {
    const p = new URLSearchParams()
    if (subject) p.set("subject", subject)
    if (bank) p.set("bank", bank)
    fetch(`/api/proxy/questions/topics?${p.toString()}`)
      .then((res) => res.json())
      .then((data) => setTopics(data.topics ?? []))
      .catch(() => setTopics([]))
  }, [subject, bank])

  function next() {
    if (idx < questions.length - 1) {
      setIdx(idx + 1)
      return
    }
    if (nextCursor) void load(nextCursor, true).then(() => setIdx((value) => value + 1))
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-blue-700">Banco de questões</p>
          <h1 className="text-2xl font-black text-slate-950">Questões reais de vestibulares</h1>
        </div>
        <div className="inline-flex rounded-lg border bg-white p-1">
          <button onClick={() => setTab("todo")} className={`rounded-md px-3 py-2 text-sm font-bold ${tab === "todo" ? "bg-slate-900 text-white" : "text-slate-600"}`}>A fazer</button>
          <button onClick={() => setTab("done")} className={`rounded-md px-3 py-2 text-sm font-bold ${tab === "done" ? "bg-slate-900 text-white" : "text-slate-600"}`}>Feitas</button>
        </div>
      </div>

      <section className="mb-5 rounded-lg border bg-white p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-extrabold text-slate-800"><Filter size={16} /> Filtros</div>
        <div className="grid gap-3 md:grid-cols-5">
          <input value={subject} onChange={(e) => { setSubject(e.target.value); setTopic("") }} placeholder="Matéria" className="h-10 rounded-md border px-3 text-sm" />
          <select value={topic} onChange={(e) => setTopic(e.target.value)} className="h-10 rounded-md border px-3 text-sm">
            <option value="">Todos os tópicos</option>
            {topics.map((item) => <option key={item.name} value={item.name}>{item.name} ({item.count})</option>)}
          </select>
          <select value={bank} onChange={(e) => setBank(e.target.value)} className="h-10 rounded-md border px-3 text-sm">
            {BANKS.map((item) => <option key={item || "all"} value={item}>{item || "Todas as bancas"}</option>)}
          </select>
          <input value={year} onChange={(e) => setYear(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="Ano" className="h-10 rounded-md border px-3 text-sm" />
          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="h-10 rounded-md border px-3 text-sm">
            {DIFFICULTIES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </div>
      </section>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>
      ) : loading && questions.length === 0 ? (
        <div className="rounded-lg border bg-white p-8 text-center text-sm font-semibold text-slate-500">Carregando questões...</div>
      ) : current ? (
        <div className="grid gap-4">
          <div className="flex items-center justify-between text-sm font-bold text-slate-500">
            <span>Questão {idx + 1} de {questions.length}{nextCursor ? "+" : ""}</span>
            <span>{current.testlet_group_id ? "Grupo de texto compartilhado" : current.external_id}</span>
          </div>
          <QuestionCard question={current} onReport={() => setReportQuestionId(current.id)} />
          <div className="flex items-center justify-between">
            <button disabled={idx === 0} onClick={() => setIdx((value) => Math.max(0, value - 1))} className="inline-flex items-center gap-2 rounded-md border bg-white px-4 py-2 text-sm font-bold disabled:opacity-40"><ChevronLeft size={16} /> Anterior</button>
            <button disabled={idx >= questions.length - 1 && !nextCursor} onClick={next} className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-bold text-white disabled:opacity-40">Próxima <ChevronRight size={16} /></button>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border bg-white p-8 text-center text-sm font-semibold text-slate-500">Nenhuma questão encontrada.</div>
      )}

      <ReportDialog open={Boolean(reportQuestionId)} questionId={reportQuestionId} onOpenChange={(open) => !open && setReportQuestionId(null)} />
    </main>
  )
}
