"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"

const NAV_LINKS = [
  { label: "Cursos", href: "#cursos" },
  { label: "Professores", href: "#professores" },
  { label: "Depoimentos", href: "#depoimentos" },
  { label: "FAQ", href: "#faq" },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 bg-white transition-all duration-200 ${
        scrolled ? "shadow-md border-b border-[#E5E8EF]" : "border-b border-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <a href="#" className="flex items-center gap-0.5 text-xl font-bold select-none" style={{ fontFamily: "var(--font-syne), sans-serif" }}>
          <span className="text-[#F5C518]">+</span>
          <span className="text-[#03050D]">Aprovação</span>
        </a>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-sm text-[#6B7A8D] hover:text-[#0A0F1E] transition-colors"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/sign-in"
            className="border border-[#0A0F1E] rounded-full px-4 py-1.5 text-sm text-[#0A0F1E] hover:bg-[#0A0F1E] hover:text-white transition-colors"
          >
            Entrar
          </Link>
          <a
            href="#cursos"
            className="bg-[#F5C518] text-[#03050D] rounded-full px-4 py-1.5 text-sm font-semibold hover:bg-yellow-400 transition-colors"
          >
            Quero minha vaga
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-[#0A0F1E]"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#E5E8EF] bg-white px-6 pb-6 pt-4 flex flex-col gap-4">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="text-sm text-[#6B7A8D] hover:text-[#0A0F1E] transition-colors"
            >
              {link.label}
            </a>
          ))}
          <div className="flex flex-col gap-2 pt-2 border-t border-[#E5E8EF]">
            <Link
              href="/sign-in"
              className="border border-[#0A0F1E] rounded-full px-4 py-2 text-sm text-[#0A0F1E] text-center hover:bg-[#0A0F1E] hover:text-white transition-colors"
            >
              Entrar
            </Link>
            <a
              href="#cursos"
              onClick={() => setMobileOpen(false)}
              className="bg-[#F5C518] text-[#03050D] rounded-full px-4 py-2 text-sm font-semibold text-center hover:bg-yellow-400 transition-colors"
            >
              Quero minha vaga
            </a>
          </div>
        </div>
      )}
    </header>
  )
}
