"use client"

import { useState, useMemo } from "react"
import {
  MagnifyingGlass, CaretDown, WhatsappLogo, EnvelopeSimple, ArrowRight, Clock,
} from "@phosphor-icons/react"
import { APROVA, BentoCard, NavyCard, Chip, ChipRow } from "@/components/student/StudentSurface"
import { FAQS } from "@/lib/mock-data"

const CATEGORIES = ["Todas", "Redações", "Ranking", "Questões", "Conta"]

export default function SuportePage() {
  const [search, setSearch] = useState("")
  const [cat, setCat] = useState("Todas")
  const [openFaq, setOpenFaq] = useState<string | null>(null)

  const filtered = useMemo(
    () =>
      FAQS.filter((f) => {
        const mc = cat === "Todas" || f.category === cat
        const ms = !search || f.question.toLowerCase().includes(search.toLowerCase()) || f.answer.toLowerCase().includes(search.toLowerCase())
        return mc && ms
      }),
    [search, cat]
  )

  return (
    <div className="mx-auto max-w-[900px] px-4 pt-5 lg:px-6 lg:pt-7">
      {/* hero */}
      <NavyCard halftone="blue" className="text-center lg:p-8">
        <h1 className="font-display text-[28px] font-bold text-white lg:text-[34px]">Ajuda e Suporte</h1>
        <p className="mx-auto mt-2 max-w-[420px] text-[13px]" style={{ color: "rgba(255,255,255,0.6)" }}>Busque uma resposta rápida ou fale direto com nossa equipe.</p>
        <div className="relative mx-auto mt-5 max-w-lg">
          <MagnifyingGlass size={18} weight="bold" className="absolute left-4 top-1/2 -translate-y-1/2" color="#9AA1B0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Como enviar minha redação?"
            className="w-full rounded-full border-2 border-transparent bg-white py-3.5 pl-11 pr-4 text-[14px] outline-none focus:border-[#FFC529]"
          />
        </div>
      </NavyCard>

      {/* contato */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <BentoCard hover as="button" className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl" style={{ background: "#E7F8EE" }}>
            <WhatsappLogo size={26} weight="fill" color="#1FA855" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-display text-[15px] font-extrabold" style={{ color: APROVA.ink }}>Suporte via WhatsApp</p>
            <p className="text-[12px]" style={{ color: APROVA.inkMuted }}>Fale diretamente com nossa equipe</p>
            <p className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold" style={{ color: "#1FA855" }}><Clock size={11} weight="fill" /> Responde em ~15 min</p>
          </div>
          <ArrowRight size={16} color="#C4CAD6" />
        </BentoCard>

        <BentoCard hover as="button" className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl" style={{ background: APROVA.blueSoft }}>
            <EnvelopeSimple size={26} weight="fill" color={APROVA.blue} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-display text-[15px] font-extrabold" style={{ color: APROVA.ink }}>E-mail de Suporte</p>
            <p className="text-[12px]" style={{ color: APROVA.inkMuted }}>Abra um ticket detalhado</p>
            <p className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold" style={{ color: APROVA.blue }}><Clock size={11} weight="fill" /> Retorno em até 24h</p>
          </div>
          <ArrowRight size={16} color="#C4CAD6" />
        </BentoCard>
      </div>

      {/* FAQ */}
      <div className="mt-6">
        <h2 className="mb-3 font-display text-[18px] font-extrabold" style={{ color: APROVA.ink }}>Dúvidas frequentes</h2>
        <div className="mb-4"><ChipRow>{CATEGORIES.map((c) => <Chip key={c} active={cat === c} onClick={() => setCat(c)}>{c}</Chip>)}</ChipRow></div>
        <BentoCard className="p-2">
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-[13px]" style={{ color: APROVA.inkMuted }}>Nenhuma pergunta encontrada para &quot;{search}&quot;.</p>
          ) : (
            filtered.map((f, i) => {
              const open = openFaq === f.id
              return (
                <div key={f.id} style={{ borderTop: i > 0 ? "1px solid #F1F3F8" : undefined }}>
                  <button onClick={() => setOpenFaq(open ? null : f.id)} className="flex w-full items-center gap-3 px-3 py-4 text-left">
                    <span className="min-w-0 flex-1 text-[13.5px] font-bold" style={{ color: APROVA.ink }}>{f.question}</span>
                    <CaretDown size={16} color={APROVA.inkMuted} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
                  </button>
                  {open && <p className="px-3 pb-4 text-[13px] leading-[1.7]" style={{ color: "#4A5162", animation: "slideUp 0.2s ease" }}>{f.answer}</p>}
                </div>
              )
            })
          )}
        </BentoCard>
      </div>
    </div>
  )
}
