"use client"

import { useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

type Teacher = {
  name: string
  subject: string
  bio: string
  initials: string
  color: string
}

type TeachersSectionProps = {
  teachers: Teacher[]
}

export function TeachersSection({ teachers }: TeachersSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return
    scrollRef.current.scrollBy({ left: dir === "left" ? -280 : 280, behavior: "smooth" })
  }

  return (
    <section id="professores" className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex items-end justify-between">
          <div>
            <span className="font-mono text-xs tracking-[0.2em] text-[#F5C518] uppercase">
              Time Docente
            </span>
            <h2
              className="mt-3 text-3xl md:text-4xl font-bold text-[#0A0F1E]"
              style={{ fontFamily: "var(--font-syne), sans-serif" }}
            >
              Professores que mandam muito
            </h2>
          </div>
          <div className="hidden md:flex gap-2">
            <button
              onClick={() => scroll("left")}
              className="border border-[#E5E8EF] rounded-full p-2 hover:border-[#F5C518] hover:text-[#F5C518] transition-colors"
              aria-label="Anterior"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => scroll("right")}
              className="border border-[#E5E8EF] rounded-full p-2 hover:border-[#F5C518] hover:text-[#F5C518] transition-colors"
              aria-label="Próximo"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="mt-8 flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 scrollbar-none"
          style={{ scrollbarWidth: "none" }}
        >
          {teachers.map((teacher) => (
            <div
              key={teacher.name}
              className="snap-start min-w-[240px] border border-[#E5E8EF] rounded-2xl p-6 hover:border-[#F5C518] hover:shadow-md transition-all flex-shrink-0"
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg"
                style={{ backgroundColor: teacher.color }}
              >
                {teacher.initials}
              </div>
              <p
                className="mt-3 text-xs font-mono uppercase tracking-wider text-[#F5C518]"
              >
                {teacher.subject}
              </p>
              <p
                className="mt-1 font-bold text-[#0A0F1E]"
                style={{ fontFamily: "var(--font-syne), sans-serif" }}
              >
                {teacher.name}
              </p>
              <p className="mt-1 text-xs text-[#6B7A8D] leading-relaxed">
                {teacher.bio}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
