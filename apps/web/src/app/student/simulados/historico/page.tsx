"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

type SessionSummary = {
  id: string
  score: number | null
  total_questions: number | null
  tri_score?: number | null
  started_at: string
  finished_at: string | null
  config?: { bank?: string; format?: string }
}

export default function HistoricoSimuladosPage() {
  const router = useRouter()
  const [sessions, setSessions] = useState<SessionSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/proxy/exam-sessions/me?status=completed&limit=30")
      .then((res) => {
        if (res.status === 401) {
          router.push("/sign-in")
          return null
        }
        return res.json()
      })
      .then((data) => {
        if (data) setSessions(data.exam_sessions ?? [])
      })
      .finally(() => setLoading(false))
  }, [router])

  return (
    <main className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-amber-700">Histórico</p>
          <h1 className="text-2xl font-black text-slate-950">Simulados finalizados</h1>
        </div>
        <Link href="/student/simulados" className="rounded-md border bg-white px-4 py-2 text-sm font-bold">Novo simulado</Link>
      </div>
      {loading ? (
        <div className="rounded-lg border bg-white p-8 text-center text-sm font-semibold text-slate-500">Carregando...</div>
      ) : sessions.length === 0 ? (
        <div className="rounded-lg border bg-white p-8 text-center text-sm font-semibold text-slate-500">Nenhum simulado finalizado ainda.</div>
      ) : (
        <div className="grid gap-3">
          {sessions.map((session) => {
            const percentage = session.total_questions ? Math.round((Number(session.score ?? 0) / Number(session.total_questions)) * 1000) / 10 : 0
            return (
              <Link key={session.id} href={`/student/simulados/${session.id}/revisao`} className="rounded-lg border bg-white p-4 shadow-sm transition hover:border-blue-300">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-extrabold text-slate-950">{session.config?.bank ?? "Simulado"} · {session.config?.format ?? "custom"}</p>
                    <p className="text-sm text-slate-500">{new Date(session.finished_at ?? session.started_at).toLocaleString("pt-BR")}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-slate-950">{session.score}/{session.total_questions}</p>
                    <p className="text-sm font-semibold text-slate-500">{percentage}%{session.tri_score ? ` · TRI ${session.tri_score}` : ""}</p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </main>
  )
}
