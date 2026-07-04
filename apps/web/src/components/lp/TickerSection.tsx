type TickerSectionProps = {
  texts: string[]
}

export function TickerSection({ texts }: TickerSectionProps) {
  const doubled = [...texts, ...texts]

  return (
    <section className="bg-[#F5C518] py-4 overflow-hidden">
      <div className="animate-ticker">
        {doubled.map((text, i) => (
          <span
            key={i}
            className="flex items-center text-[#03050D] font-extrabold uppercase text-sm tracking-wide whitespace-nowrap"
            style={{ fontFamily: "var(--font-syne), sans-serif" }}
          >
            {text}
            <span className="mx-8 text-[#03050D]/40">★</span>
          </span>
        ))}
      </div>
    </section>
  )
}
