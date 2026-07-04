"use client"

import { useState } from "react"

type FaqItem = {
  q: string
  a: string
}

type FaqSectionProps = {
  items: FaqItem[]
}

export function FaqSection({ items }: FaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i)

  return (
    <section id="faq" className="bg-[#F7F8FA] py-20">
      <div className="mx-auto max-w-2xl px-6">
        <span className="font-mono text-xs tracking-[0.2em] text-[#F5C518] uppercase">
          Dúvidas frequentes
        </span>
        <h2
          className="mt-3 text-3xl md:text-4xl font-bold text-[#0A0F1E]"
          style={{ fontFamily: "var(--font-syne), sans-serif" }}
        >
          Perguntas frequentes
        </h2>

        <div className="mt-10 divide-y divide-[#E5E8EF]">
          {items.map((item, i) => {
            const isOpen = openIndex === i
            return (
              <div key={i} className={isOpen ? "border-l-2 border-l-[#F5C518] pl-4 -ml-4" : ""}>
                <button
                  onClick={() => toggle(i)}
                  className={`w-full flex items-center justify-between py-4 text-left transition-colors ${
                    isOpen
                      ? "text-[#03050D] font-semibold"
                      : "text-[#0A0F1E] hover:text-[#F5C518]"
                  }`}
                >
                  <span className="text-sm pr-4">{item.q}</span>
                  <span className="text-xl font-light flex-shrink-0 text-[#F5C518]">
                    {isOpen ? "−" : "+"}
                  </span>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    isOpen ? "max-h-96 pb-4" : "max-h-0"
                  }`}
                >
                  <p className="text-sm text-[#6B7A8D] leading-relaxed">{item.a}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
