const FOOTER_LINKS = {
  Plataforma: ["Cursos", "Professores", "Simulados", "Redação", "Aulões"],
  Empresa: ["Sobre nós", "Blog", "Trabalhe conosco", "Contato"],
}

export function Footer() {
  return (
    <footer className="bg-[#03050D] py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Logo + tagline */}
          <div className="md:col-span-1">
            <a
              href="#"
              className="flex items-center gap-0.5 text-xl font-bold select-none"
              style={{ fontFamily: "var(--font-syne), sans-serif" }}
            >
              <span className="text-[#F5C518]">+</span>
              <span className="text-white">Aprovação</span>
            </a>
            <p className="mt-2 text-sm text-[#6B7A8D] leading-relaxed">
              Pré-vestibular online para quem quer passar de verdade.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <p className="text-white text-xs font-semibold uppercase tracking-wider mb-3">
                {title}
              </p>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-[#6B7A8D] hover:text-white transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* CTA column */}
          <div>
            <p className="text-white text-xs font-semibold uppercase tracking-wider mb-3">
              Comece hoje
            </p>
            <p className="text-sm text-[#6B7A8D] leading-relaxed mb-4">
              Turma de Julho 2026 com vagas abertas.
            </p>
            <a
              href="#planos"
              className="inline-block bg-[#F5C518] text-[#03050D] rounded-full px-5 py-2 font-bold text-sm hover:bg-yellow-400 transition-colors"
            >
              Comece agora →
            </a>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[#6B7A8D] text-center">
            © {new Date().getFullYear()} +Aprovação. Todos os direitos reservados.
          </p>
          <div className="flex gap-4">
            {["Privacidade", "Termos de uso"].map((item) => (
              <a key={item} href="#" className="text-xs text-[#6B7A8D] hover:text-white transition-colors">
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
