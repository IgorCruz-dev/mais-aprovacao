type Step = {
  step: string
  title: string
  description: string
}

type HowItWorksSectionProps = {
  steps: Step[]
}

export function HowItWorksSection({ steps }: HowItWorksSectionProps) {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-6">
        <span className="font-mono text-xs tracking-[0.2em] text-[#F5C518] uppercase">
          Como funciona
        </span>
        <h2
          className="mt-3 text-3xl md:text-4xl font-bold text-[#0A0F1E]"
          style={{ fontFamily: "var(--font-syne), sans-serif" }}
        >
          Do zero à aprovação em 4 passos
        </h2>

        <div className="mt-12 flex flex-col md:flex-row gap-0">
          {steps.map((step, i) => (
            <div key={step.step} className="flex-1 relative">
              {/* Divider between steps (desktop) */}
              {i > 0 && (
                <div className="hidden md:block absolute left-0 top-8 h-px w-full border-t border-dashed border-[#E5E8EF] -translate-x-1/2" />
              )}

              <div className="relative z-10 md:pr-8 pb-8 md:pb-0">
                <p
                  className="text-6xl font-black text-[#F5C518] leading-none"
                  style={{ fontFamily: "var(--font-syne), sans-serif" }}
                >
                  {step.step}
                </p>
                <h3
                  className="mt-2 text-lg font-bold text-[#0A0F1E]"
                  style={{ fontFamily: "var(--font-syne), sans-serif" }}
                >
                  {step.title}
                </h3>
                <p className="mt-1 text-sm text-[#6B7A8D] leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Vertical connector (mobile) */}
              {i < steps.length - 1 && (
                <div className="md:hidden ml-6 h-8 border-l border-dashed border-[#E5E8EF]" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
