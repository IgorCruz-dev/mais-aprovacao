type HeroData = {
  tag: string
  headline: string
  subheadline: string
  cta_primary: string
  cta_secondary: string
  stats: { value: string; label: string }[]
}

type HeroSectionProps = {
  data: HeroData
}

export function HeroSection({ data }: HeroSectionProps) {
  const [line1, line2] = data.headline.split("\n")

  return (
    <section className="bg-[#03050D] py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section tag */}
        <span className="font-mono text-xs tracking-[0.2em] text-[#F5C518] uppercase">
          {data.tag}
        </span>

        {/* Headline */}
        <h1
          className="mt-4 text-4xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight"
          style={{ fontFamily: "var(--font-syne), sans-serif" }}
        >
          {line1}
          <br />
          <span className="underline decoration-[#F5C518] decoration-4 underline-offset-4">
            {line2}
          </span>
        </h1>

        {/* Subheadline */}
        <p className="mt-6 max-w-xl text-lg text-[#6B7A8D] leading-relaxed">
          {data.subheadline}
        </p>

        {/* CTAs */}
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="#cursos"
            className="bg-[#F5C518] text-[#03050D] font-bold rounded-full px-6 py-3 text-sm hover:scale-105 transition-transform"
          >
            {data.cta_primary}
          </a>
          <a
            href="#planos"
            className="border border-white/30 text-white rounded-full px-6 py-3 text-sm hover:border-white transition-colors"
          >
            {data.cta_secondary}
          </a>
        </div>

        {/* Stats */}
        <div className="mt-16 border-t border-white/10 pt-8 flex flex-wrap gap-8 md:gap-16">
          {data.stats.map((stat) => (
            <div key={stat.label}>
              <p
                className="text-3xl font-bold text-[#F5C518]"
                style={{ fontFamily: "var(--font-syne), sans-serif" }}
              >
                {stat.value}
              </p>
              <p className="text-sm text-[#6B7A8D] mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
