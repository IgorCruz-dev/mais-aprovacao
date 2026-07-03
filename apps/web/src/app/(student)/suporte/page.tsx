"use client"

import { useState, useMemo } from "react"
import { HelpCircle, Search, ChevronDown, ChevronUp, MessageCircle } from "lucide-react"
import { BRAND } from "@/components/navigation/StudentChrome"
import { PageTitle, DarkHeroCard } from "@/components/student/StudentSurface"
import { FAQS } from "@/lib/mock-data"

const CATEGORIES = ["Todas", "Redações", "Ranking", "Questões", "Conta", "Planos"]

function FaqItem({ faq, open, onToggle }: { faq: typeof FAQS[0]; open: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-[#F0F0F0] last:border-b-0">
      <button
        className="w-full flex items-center justify-between py-4 text-left gap-3"
        onClick={onToggle}
      >
        <span className="text-[13px] font-[700] text-[#111] flex-1 leading-snug">{faq.question}</span>
        {open ? <ChevronUp size={16} className="flex-shrink-0 text-[#888]" /> : <ChevronDown size={16} className="flex-shrink-0 text-[#888]" />}
      </button>
      {open && (
        <div
          className="pb-4 text-[13px] leading-[1.7] text-[#555]"
          style={{ animation: "slideUp 0.25s ease" }}
        >
          {faq.answer}
        </div>
      )}
    </div>
  )
}

export default function SuportePage() {
  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState("Todas")
  const [openFaq, setOpenFaq] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return FAQS.filter((f) => {
      const matchCategory = activeCategory === "Todas" || f.category === activeCategory
      const matchSearch =
        !search ||
        f.question.toLowerCase().includes(search.toLowerCase()) ||
        f.answer.toLowerCase().includes(search.toLowerCase())
      return matchCategory && matchSearch
    })
  }, [search, activeCategory])

  return (
    <div className="max-w-[760px] mx-auto px-4 pt-5 pb-8">
      <PageTitle title="Suporte" subtitle="Tire suas dúvidas e encontre respostas." />

      {/* Contact card */}
      <div className="mt-5 mb-5">
        <DarkHeroCard>
          <div className="flex items-center gap-3 mb-3">
            <div
              className="flex items-center justify-center rounded-[12px]"
              style={{ width: 40, height: 40, background: "rgba(255,255,255,0.1)" }}
            >
              <MessageCircle size={20} className="text-white" />
            </div>
            <div>
              <p className="text-[16px] font-[800] text-white">Precisa de ajuda direta?</p>
              <p className="text-[12px]" style={{ color: "rgba(255,255,255,0.5)" }}>Nossa equipe responde em até 24h.</p>
            </div>
          </div>
          <a
            href="#"
            className="flex items-center justify-center gap-2 w-full rounded-full py-3 text-[14px] font-black text-white transition-opacity hover:opacity-90"
            style={{ background: BRAND }}
          >
            Falar com o suporte →
          </a>
        </DarkHeroCard>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#AAAAAA]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar nas perguntas frequentes"
          className="w-full rounded-full border border-[#EBEBEB] bg-white pl-10 pr-4 py-2.5 text-[13px] text-[#111] outline-none transition-colors focus:border-[#2563EB]"
          style={{ borderWidth: 1.5 }}
        />
      </div>

      {/* Category chips */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none mb-5 pb-0.5">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className="flex-shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-[700] transition-colors"
            style={{
              background: activeCategory === cat ? BRAND : "#F5F5F5",
              color: activeCategory === cat ? "white" : "#888",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* FAQ accordion */}
      <div className="rounded-[18px] border border-[#EBEBEB] bg-white px-4">
        {filtered.length === 0 ? (
          <div className="py-8 text-center text-[13px] text-[#888]">
            Nenhuma pergunta encontrada para "{search}".
          </div>
        ) : (
          filtered.map((faq) => (
            <FaqItem
              key={faq.id}
              faq={faq}
              open={openFaq === faq.id}
              onToggle={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}
