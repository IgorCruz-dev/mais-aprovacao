type Course = {
  id: string
  tag: string
  name: string
  description: string
  price_from: string
  access: string
  features: string[]
  highlighted: boolean
}

type CoursesSectionProps = {
  courses: Course[]
}

export function CoursesSection({ courses }: CoursesSectionProps) {
  return (
    <section id="cursos" className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-6">
        <span className="font-mono text-xs tracking-[0.2em] text-[#F5C518] uppercase">
          Nossos Cursos
        </span>
        <h2
          className="mt-3 text-3xl md:text-4xl font-bold text-[#0A0F1E]"
          style={{ fontFamily: "var(--font-syne), sans-serif" }}
        >
          Escolha o plano ideal para você
        </h2>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className={`relative rounded-2xl p-6 transition-all duration-200 ${
                course.highlighted
                  ? "border-2 border-[#F5C518] hover:shadow-md"
                  : "border border-[#E5E8EF] hover:border-[#F5C518] hover:shadow-md"
              }`}
            >
              {/* Badge */}
              {course.tag && (
                <span className="absolute -top-3 left-6 bg-[#F5C518] text-[#03050D] text-xs font-bold px-3 py-1 rounded-full">
                  {course.tag}
                </span>
              )}

              <h3
                className="text-xl font-bold text-[#0A0F1E]"
                style={{ fontFamily: "var(--font-syne), sans-serif" }}
              >
                {course.name}
              </h3>
              <p className="mt-2 text-sm text-[#6B7A8D] leading-relaxed">
                {course.description}
              </p>

              <div className="mt-4">
                <p className="text-2xl font-bold text-[#0A0F1E]" style={{ fontFamily: "var(--font-syne), sans-serif" }}>
                  {course.price_from}
                </p>
                <p className="text-xs text-[#6B7A8D] mt-0.5">{course.access}</p>
              </div>

              <ul className="mt-5 space-y-2">
                {course.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2 text-sm text-[#0A0F1E]">
                    <span className="font-bold text-[#F5C518] mt-0.5">✓</span>
                    {feat}
                  </li>
                ))}
              </ul>

              <a
                href="#"
                className="mt-6 flex w-full items-center justify-center rounded-xl bg-[#03050D] py-3 text-sm font-semibold text-white hover:bg-[#F5C518] hover:text-[#03050D] transition-colors"
              >
                Começar agora
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
