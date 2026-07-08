"use client"

import { useState } from "react"
import { X } from "lucide-react"

const CATEGORIES = [
  { value: "conteudo", label: "Erro no enunciado" },
  { value: "resposta", label: "Resposta incorreta" },
  { value: "estrutural", label: "Problema de formatação" },
  { value: "outro", label: "Outro" },
] as const

type Category = (typeof CATEGORIES)[number]["value"]

export function ReportDialog({
  open,
  questionId,
  onOpenChange,
  onSuccess,
}: {
  open: boolean
  questionId: string | null
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}) {
  const [category, setCategory] = useState<Category>("conteudo")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState<string | null>(null)
  if (!open) return null

  async function submit() {
    if (!questionId) return
    setStatus("Enviando...")
    const res = await fetch("/api/proxy/question-reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question_id: questionId, error_category: category, description: description.trim() || undefined }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      setStatus(data.code === "QUESTION_REPORT_ALREADY_OPEN" ? "Você já tem um report aberto para esta questão." : "Não foi possível enviar o report.")
      return
    }
    setStatus("Report enviado.")
    onSuccess?.()
    setTimeout(() => onOpenChange(false), 700)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-slate-900">Reportar erro</h2>
          <button className="rounded-md p-2 hover:bg-slate-100" onClick={() => onOpenChange(false)}><X size={16} /></button>
        </div>
        <label className="mb-1 block text-xs font-bold uppercase text-slate-500">Categoria</label>
        <select value={category} onChange={(e) => setCategory(e.target.value as Category)} className="mb-3 h-10 w-full rounded-md border px-3 text-sm">
          {CATEGORIES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
        </select>
        <label className="mb-1 block text-xs font-bold uppercase text-slate-500">Descrição opcional</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} maxLength={2000} className="min-h-28 w-full rounded-md border p-3 text-sm" />
        {status && <p className="mt-2 text-sm font-semibold text-slate-700">{status}</p>}
        <button onClick={submit} className="mt-4 h-10 w-full rounded-md bg-slate-900 px-4 text-sm font-bold text-white hover:bg-slate-800">Enviar report</button>
      </div>
    </div>
  )
}
