type Differential = {
  icon: string
  title: string
  description: string
}

type DifferentialsSectionProps = {
  items: Differential[]
}

export function DifferentialsSection({ items }: DifferentialsSectionProps) {
  return (
    <section className="bg-[#F7F8FA] py-20">
      <div className="mx-auto max-w-7xl px-6">
        <span className="font-mono text-xs tracking-[0.2em] text-[#F5C518] uppercase">
          Por que escolher
        </span>
        <h2
          className="mt-3 text-3xl md:text-4xl font-bold text-[#0A0F1E]"
          style={{ fontFamily: "var(--font-syne), sans-serif" }}
        >
          O que nos torna diferentes
        </h2>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((item) => (
            <div
              key={item.title}
              className="bg-white rounded-2xl p-6 shadow-sm border border-[#E5E8EF] border-l-4 border-l-[#F5C518]"
            >
              <span className="text-3xl">{item.icon}</span>
              <h3
                className="mt-3 text-lg font-bold text-[#0A0F1E]"
                style={{ fontFamily: "var(--font-syne), sans-serif" }}
              >
                {item.title}
              </h3>
              <p className="mt-1 text-sm text-[#6B7A8D] leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
