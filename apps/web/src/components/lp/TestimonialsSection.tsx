type Testimonial = {
  name: string
  result: string
  quote: string
  initials: string
}

type TestimonialsSectionProps = {
  testimonials: Testimonial[]
}

export function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
  return (
    <section id="depoimentos" className="bg-[#03050D] py-20">
      <div className="mx-auto max-w-7xl px-6">
        <span className="font-mono text-xs tracking-[0.2em] text-[#F5C518] uppercase">
          O que dizem nossos alunos
        </span>
        <h2
          className="mt-3 text-3xl md:text-4xl font-bold text-white"
          style={{ fontFamily: "var(--font-syne), sans-serif" }}
        >
          Resultados reais de alunos reais
        </h2>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-[#F5C518]/40 transition-colors"
            >
              <p className="text-5xl text-[#F5C518] font-bold leading-none mb-2 select-none">
                &ldquo;
              </p>
              <p className="text-white/80 text-sm leading-relaxed">{t.quote}</p>
              <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#F5C518] flex items-center justify-center text-[#03050D] text-xs font-bold flex-shrink-0">
                  {t.initials}
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{t.name}</p>
                  <p className="text-[#F5C518] text-xs">{t.result}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
