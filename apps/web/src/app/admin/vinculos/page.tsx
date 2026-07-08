"use client"

import { useEffect, useState } from "react"
import { HourglassMedium, SealCheck } from "@phosphor-icons/react"
import type { AdminParentLinkItem } from "@mais-aprovacao/types"
import { APROVA, BentoCard, PageHeader, SectionTitle } from "@/components/student/StudentSurface"

export default function AdminParentLinksPage() {
  const [links, setLinks] = useState<AdminParentLinkItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [verifyingId, setVerifyingId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const res = await fetch("/api/proxy/admin/parent-links?verified=false", { cache: "no-store" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Erro ao listar vínculos")
      return data.links as AdminParentLinkItem[]
    }
    load()
      .then((links) => {
        if (cancelled) return
        setLinks(links)
        setLoading(false)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : "Erro ao listar vínculos")
        setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  async function handleVerify(link: AdminParentLinkItem) {
    setVerifyingId(link.id)
    try {
      const res = await fetch(`/api/proxy/admin/parent-links/${link.id}/verify`, { method: "PATCH" })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Erro ao verificar vínculo")
        return
      }
      setLinks((prev) => prev.filter((l) => l.id !== link.id))
    } catch {
      setError("Erro de conexão ao verificar vínculo.")
    } finally {
      setVerifyingId(null)
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <PageHeader
        kicker="Administração"
        title="Vínculos de responsáveis"
        subtitle="Verifique as solicitações de vínculo responsável ↔ aluno antes de liberar o acompanhamento."
      />

      <SectionTitle title="Aguardando verificação" kicker="Pendentes" />

      {error && <p className="mb-3 text-[13px] font-semibold" style={{ color: APROVA.error }}>{error}</p>}
      {loading && (
        <BentoCard><p className="text-[13.5px]" style={{ color: APROVA.inkMuted }}>Carregando…</p></BentoCard>
      )}
      {!loading && links.length === 0 && (
        <BentoCard>
          <p className="text-[13.5px]" style={{ color: APROVA.inkMuted }}>Nenhum vínculo pendente. 🎉</p>
        </BentoCard>
      )}

      <div className="flex flex-col gap-3">
        {links.map((link) => (
          <BentoCard key={link.id} className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-extrabold" style={{ color: APROVA.ink }}>
                {link.parent.name} <span className="font-semibold" style={{ color: APROVA.inkMuted }}>quer acompanhar</span> {link.student.name}
              </p>
              <p className="mt-0.5 truncate text-[12.5px]" style={{ color: APROVA.inkMuted }}>
                {link.parent.email} → {link.student.email}
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-[12px]" style={{ color: "#D97706" }}>
                <HourglassMedium size={13} weight="fill" /> Solicitado em {new Date(link.created_at).toLocaleDateString("pt-BR")}
              </p>
            </div>
            <button
              onClick={() => void handleVerify(link)}
              disabled={verifyingId === link.id}
              className="flex shrink-0 items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-[13.5px] font-extrabold text-white disabled:opacity-60"
              style={{ background: APROVA.success }}
            >
              <SealCheck size={16} weight="fill" /> {verifyingId === link.id ? "Verificando…" : "Verificar"}
            </button>
          </BentoCard>
        ))}
      </div>
    </div>
  )
}
