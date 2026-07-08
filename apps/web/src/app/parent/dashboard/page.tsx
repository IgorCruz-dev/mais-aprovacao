"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { CaretRight, HourglassMedium, Plus, SealCheck } from "@phosphor-icons/react"
import type { ParentStudentLinkWithStudent } from "@mais-aprovacao/types"
import { APROVA, Avatar, BentoCard, PageHeader, SectionTitle } from "@/components/student/StudentSurface"

type LoadState = "loading" | "ready" | "error"

export default function ParentHomePage() {
  const [links, setLinks] = useState<ParentStudentLinkWithStudent[]>([])
  const [state, setState] = useState<LoadState>("loading")
  const [email, setEmail] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState<string | null>(null)

  async function fetchLinks(): Promise<ParentStudentLinkWithStudent[]> {
    const res = await fetch("/api/proxy/parent/student-links", { cache: "no-store" })
    if (!res.ok) throw new Error()
    const data = (await res.json()) as { links: ParentStudentLinkWithStudent[] }
    return data.links
  }

  useEffect(() => {
    let cancelled = false
    fetchLinks()
      .then((links) => {
        if (cancelled) return
        setLinks(links)
        setState("ready")
      })
      .catch(() => {
        if (!cancelled) setState("error")
      })
    return () => { cancelled = true }
  }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (submitting) return
    setFormError(null)
    setFormSuccess(null)
    setSubmitting(true)
    try {
      const res = await fetch("/api/proxy/parent/student-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_email: email.trim() }),
      })
      const data = await res.json()
      if (res.status === 404) {
        setFormError("Nenhum aluno encontrado com este email.")
      } else if (res.status === 409) {
        setFormError("Você já tem um vínculo com este aluno.")
      } else if (!res.ok) {
        setFormError(data.error ?? "Erro ao criar vínculo.")
      } else {
        setEmail("")
        setFormSuccess("Vínculo solicitado! Aguardando verificação pela equipe.")
        setLinks(await fetchLinks())
      }
    } catch {
      setFormError("Erro de conexão. Tente novamente.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <PageHeader
        kicker="Área do responsável"
        title="Meus alunos"
        subtitle="Acompanhe o progresso dos alunos vinculados a você."
      />

      <SectionTitle title="Adicionar aluno" kicker="Vínculo" />
      <BentoCard className="mb-6">
        <form onSubmit={handleAdd} className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email do aluno (o mesmo usado no cadastro)"
            className="flex-1 rounded-xl border px-4 py-2.5 text-[14px] outline-none focus:border-[#1B4DE4]"
            style={{ borderColor: "#E2E6F0", color: APROVA.ink }}
          />
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-[14px] font-extrabold text-white disabled:opacity-60"
            style={{ background: APROVA.blue }}
          >
            <Plus size={16} weight="bold" /> {submitting ? "Enviando…" : "Solicitar vínculo"}
          </button>
        </form>
        {formError && <p className="mt-2 text-[13px] font-semibold" style={{ color: APROVA.error }}>{formError}</p>}
        {formSuccess && <p className="mt-2 text-[13px] font-semibold" style={{ color: APROVA.success }}>{formSuccess}</p>}
        <p className="mt-3 text-[12px]" style={{ color: APROVA.inkMuted }}>
          Por segurança, todo vínculo passa por verificação da equipe antes de liberar o acompanhamento.
        </p>
      </BentoCard>

      <SectionTitle title="Alunos vinculados" kicker="Acompanhamento" />
      {state === "loading" && (
        <BentoCard><p className="text-[13.5px]" style={{ color: APROVA.inkMuted }}>Carregando vínculos…</p></BentoCard>
      )}
      {state === "error" && (
        <BentoCard><p className="text-[13.5px]" style={{ color: APROVA.error }}>Não foi possível carregar seus vínculos. Recarregue a página.</p></BentoCard>
      )}
      {state === "ready" && links.length === 0 && (
        <BentoCard>
          <p className="text-[13.5px]" style={{ color: APROVA.inkMuted }}>
            Você ainda não tem alunos vinculados. Adicione pelo email acima.
          </p>
        </BentoCard>
      )}
      <div className="flex flex-col gap-3">
        {links.map((link) => {
          const card = (
            <BentoCard hover={link.verified} className="flex items-center gap-4">
              <Avatar initial={(link.student.name[0] ?? "?").toUpperCase()} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-extrabold" style={{ color: APROVA.ink }}>{link.student.name}</p>
                <p className="truncate text-[12.5px]" style={{ color: APROVA.inkMuted }}>{link.student.email}</p>
              </div>
              {link.verified ? (
                <span className="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-extrabold" style={{ background: "rgba(15,169,104,0.12)", color: APROVA.success }}>
                  <SealCheck size={14} weight="fill" /> Verificado
                </span>
              ) : (
                <span className="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-extrabold" style={{ background: "rgba(217,119,6,0.12)", color: "#D97706" }}>
                  <HourglassMedium size={14} weight="fill" /> Aguardando verificação
                </span>
              )}
              {link.verified && <CaretRight size={16} color={APROVA.inkMuted} className="shrink-0" />}
            </BentoCard>
          )
          return link.verified ? (
            <Link key={link.id} href={`/parent/alunos/${link.student_user_id}`}>{card}</Link>
          ) : (
            <div key={link.id}>{card}</div>
          )
        })}
      </div>
    </div>
  )
}
