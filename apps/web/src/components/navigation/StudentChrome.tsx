"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home, BookOpen, FileText, Video, PenLine,
  Trophy, Award, TrendingUp, HelpCircle, User,
  ChevronLeft, Bell, Menu, X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { STUDENT } from "@/lib/mock-data"

export const BRAND = "#2563EB"
export const BRAND_RGB = "37, 99, 235"
export const MODULE_COLORS = {
  questions: "#185FA5",
  exams: "#D97706",
  essays: "#534AB7",
}

const NAV_ITEMS = [
  { key: "dashboard",  label: "Início",            Icon: Home,       href: "/dashboard" },
  { key: "questoes",   label: "Questões",           Icon: BookOpen,   href: "/questoes" },
  { key: "simulados",  label: "Simulados",          Icon: FileText,   href: "/simulados" },
  { key: "aulas",      label: "Aulas",              Icon: Video,      href: "/aulas" },
  { key: "redacoes",   label: "Redações",           Icon: PenLine,    href: "/redacoes" },
  { key: "ranking",    label: "Ranking",            Icon: Trophy,     href: "/ranking" },
  { key: "titulos",    label: "Títulos e Evolução", Icon: Award,      href: "/titulos" },
  { key: "desempenho", label: "Meu Desempenho",     Icon: TrendingUp, href: "/desempenho" },
  { key: "suporte",    label: "Suporte",            Icon: HelpCircle, href: "/suporte" },
  { key: "perfil",     label: "Perfil",             Icon: User,       href: "/perfil" },
] as const

const MOBILE_BOTTOM = [
  { key: "dashboard", label: "Início",   Icon: Home,    href: "/dashboard" },
  { key: "questoes",  label: "Questões", Icon: BookOpen, href: "/questoes" },
  { key: "ranking",   label: "Ranking",  Icon: Trophy,  href: "/ranking" },
  { key: "redacoes",  label: "Redações", Icon: PenLine,  href: "/redacoes" },
] as const

function resolveActiveKey(pathname: string): string {
  const seg = pathname.split("/").filter(Boolean)[0] ?? "dashboard"
  const known = NAV_ITEMS.map((i) => i.key) as string[]
  return known.includes(seg) ? seg : "dashboard"
}

function LogoBox({ expanded }: { expanded: boolean }) {
  return (
    <Link href="/dashboard" className="flex-shrink-0 flex items-center min-w-0">
      <div
        className="overflow-hidden transition-all duration-250 flex-shrink-0"
        style={{ width: expanded ? 160 : 44, height: 44 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-mais-aprovacao.jpg"
          alt="+Aprovação"
          style={{ height: 44, width: "auto", display: "block" }}
        />
      </div>
    </Link>
  )
}

function SidebarNavItem({
  item,
  active,
  expanded,
}: {
  item: (typeof NAV_ITEMS)[number]
  active: boolean
  expanded: boolean
}) {
  const { Icon, label, href } = item
  return (
    <Link
      href={href}
      title={!expanded ? label : undefined}
      className={cn(
        "flex items-center gap-3 rounded-[10px] transition-all duration-150",
        !expanded ? "justify-center py-2.5 mx-1 px-0" : "px-3.5 py-2.5 mx-2",
        !active && "hover:bg-[#F5F5F5]"
      )}
      style={{ background: active ? "rgba(37,99,235,0.1)" : undefined }}
    >
      <Icon size={20} className="flex-shrink-0" style={{ color: active ? BRAND : "#888888" }} />
      <span
        className="overflow-hidden whitespace-nowrap text-[14px] transition-all duration-250"
        style={{
          opacity: expanded ? 1 : 0,
          maxWidth: expanded ? 160 : 0,
          color: active ? BRAND : "#888888",
          fontWeight: active ? 800 : 600,
        }}
      >
        {label}
      </span>
    </Link>
  )
}

function UserFooter({ expanded }: { expanded: boolean }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2.5 border-t border-[#EBEBEB] pt-3 pb-3 mt-auto flex-shrink-0",
        !expanded ? "justify-center px-1" : "px-4"
      )}
    >
      <div
        className="flex-shrink-0 flex items-center justify-center rounded-full font-black text-[14px]"
        style={{ width: 34, height: 34, background: "#111111", color: BRAND }}
      >
        {STUDENT.initial}
      </div>
      <div
        className="overflow-hidden whitespace-nowrap transition-all duration-250 min-w-0"
        style={{ opacity: expanded ? 1 : 0, maxWidth: expanded ? 130 : 0 }}
      >
        <p className="text-[13px] font-[700] text-[#111] leading-tight truncate">{STUDENT.name}</p>
        <p className="text-[11px] text-[#888]">Aluno</p>
      </div>
    </div>
  )
}

function DesktopSidebar({
  collapsed,
  onToggle,
  activeKey,
}: {
  collapsed: boolean
  onToggle: () => void
  activeKey: string
}) {
  const [hovered, setHovered] = useState(false)
  const expanded = !collapsed || hovered

  return (
    <aside
      className="hidden lg:flex flex-col h-screen sticky top-0 flex-shrink-0 bg-white border-r border-[#EBEBEB] overflow-hidden transition-all duration-250 ease z-20"
      style={{ width: expanded ? 220 : 52 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Header */}
      <div className="flex items-center justify-between pt-4 pb-3 border-b border-[#EBEBEB] px-2 gap-1 flex-shrink-0">
        <div className="flex-1 min-w-0 overflow-hidden">
          <LogoBox expanded={expanded} />
        </div>
        <button
          onClick={onToggle}
          className="flex-shrink-0 flex items-center justify-center rounded-lg text-[#888] hover:bg-[#F5F5F5] transition-all duration-150"
          style={{ width: 28, height: 28, opacity: expanded ? 1 : 0, pointerEvents: expanded ? "auto" : "none" }}
          title={collapsed ? "Fixar aberta" : "Recolher"}
        >
          <ChevronLeft
            size={16}
            style={{
              transform: collapsed ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.3s ease",
            }}
          />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-0.5 py-3 flex-1 overflow-y-auto overflow-x-hidden">
        {NAV_ITEMS.map((item) => (
          <SidebarNavItem key={item.key} item={item} active={activeKey === item.key} expanded={expanded} />
        ))}
      </nav>

      <UserFooter expanded={expanded} />
    </aside>
  )
}

function MobileTopBar({ onMenuOpen }: { onMenuOpen: () => void }) {
  return (
    <header className="lg:hidden sticky top-0 z-20 bg-white border-b border-[#EBEBEB] flex items-center justify-between px-4 h-14 flex-shrink-0">
      <Link href="/dashboard" className="flex items-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-mais-aprovacao.jpg" alt="+Aprovação" style={{ height: 36, width: "auto" }} />
      </Link>
      <div className="flex items-center gap-1">
        <button className="w-9 h-9 flex items-center justify-center rounded-lg text-[#888] hover:bg-[#F5F5F5]">
          <Bell size={18} />
        </button>
        <button
          onClick={onMenuOpen}
          className="w-9 h-9 flex items-center justify-center rounded-lg text-[#888] hover:bg-[#F5F5F5]"
        >
          <Menu size={18} />
        </button>
      </div>
    </header>
  )
}

function MobileBottomNav({ activeKey }: { activeKey: string }) {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-[#EBEBEB] flex items-center justify-around px-1 h-16">
      {MOBILE_BOTTOM.map(({ key, label, Icon, href }) => {
        const active = activeKey === key
        return (
          <Link key={key} href={href} className="flex flex-col items-center gap-0.5 flex-1 py-1">
            <div
              className="flex items-center justify-center rounded-full px-3 py-1 transition-all duration-150"
              style={{ background: active ? "rgba(37,99,235,0.1)" : "transparent" }}
            >
              <Icon size={20} style={{ color: active ? BRAND : "#CCCCCC" }} />
            </div>
            <span className="text-[10px]" style={{ color: active ? BRAND : "#CCCCCC", fontWeight: active ? 800 : 500 }}>
              {label}
            </span>
          </Link>
        )
      })}
      {/* Perfil com avatar */}
      {(() => {
        const active = activeKey === "perfil"
        return (
          <Link href="/perfil" className="flex flex-col items-center gap-0.5 flex-1 py-1">
            <div className="flex items-center justify-center rounded-full px-3 py-1" style={{ background: active ? "rgba(37,99,235,0.1)" : "transparent" }}>
              <div
                className="flex items-center justify-center rounded-full font-black text-[11px]"
                style={{ width: 24, height: 24, background: "#111", color: BRAND }}
              >
                {STUDENT.initial}
              </div>
            </div>
            <span className="text-[10px]" style={{ color: active ? BRAND : "#CCCCCC", fontWeight: active ? 800 : 500 }}>
              Perfil
            </span>
          </Link>
        )
      })()}
    </nav>
  )
}

function MobileDrawer({ open, onClose, activeKey }: { open: boolean; onClose: () => void; activeKey: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handleKey)
    return () => document.removeEventListener("keydown", handleKey)
  }, [open, onClose])

  return (
    <>
      <div
        className="lg:hidden fixed inset-0 z-40 bg-black/40 transition-opacity duration-250"
        style={{ opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none" }}
        onClick={onClose}
      />
      <div
        ref={ref}
        className="lg:hidden fixed top-0 left-0 bottom-0 z-50 bg-white flex flex-col shadow-2xl transition-transform duration-250 ease"
        style={{ width: 250, transform: open ? "translateX(0)" : "translateX(-100%)" }}
      >
        <div className="flex items-center justify-between px-4 h-14 border-b border-[#EBEBEB] flex-shrink-0">
          <Link href="/dashboard" onClick={onClose} className="flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-mais-aprovacao.jpg" alt="+Aprovação" style={{ height: 36, width: "auto" }} />
          </Link>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-[#888] hover:bg-[#F5F5F5]"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex flex-col gap-0.5 py-3 flex-1 overflow-y-auto">
          {NAV_ITEMS.map(({ key, label, Icon, href }) => {
            const active = activeKey === key
            return (
              <Link
                key={key}
                href={href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-[10px] px-3.5 py-2.5 mx-2 transition-all duration-150 text-[14px]",
                  !active && "hover:bg-[#F5F5F5]"
                )}
                style={{
                  background: active ? "rgba(37,99,235,0.1)" : undefined,
                  color: active ? BRAND : "#888",
                  fontWeight: active ? 800 : 600,
                }}
              >
                <Icon size={20} style={{ color: active ? BRAND : "#888" }} />
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-2.5 border-t border-[#EBEBEB] px-4 py-3 flex-shrink-0">
          <div
            className="flex items-center justify-center rounded-full font-black text-[14px] flex-shrink-0"
            style={{ width: 34, height: 34, background: "#111111", color: BRAND }}
          >
            {STUDENT.initial}
          </div>
          <div>
            <p className="text-[13px] font-[700] text-[#111]">{STUDENT.name}</p>
            <p className="text-[11px] text-[#888]">Aluno</p>
          </div>
        </div>
      </div>
    </>
  )
}

export function StudentChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const activeKey = resolveActiveKey(pathname)

  const [collapsed, setCollapsed] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem("sidebar_collapsed")
    if (stored !== null) setCollapsed(stored === "true")
  }, [])

  const toggleCollapse = () => {
    setCollapsed((prev) => {
      const next = !prev
      localStorage.setItem("sidebar_collapsed", String(next))
      return next
    })
  }

  if (!mounted) {
    return (
      <div className="flex h-screen bg-[#F8F8F4]">
        <div className="hidden lg:block flex-shrink-0 bg-white border-r border-[#EBEBEB]" style={{ width: 220 }} />
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-[#F8F8F4] overflow-hidden">
      <DesktopSidebar collapsed={collapsed} onToggle={toggleCollapse} activeKey={activeKey} />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <MobileTopBar onMenuOpen={() => setDrawerOpen(true)} />
        <main
          key={pathname}
          className="flex-1 overflow-y-auto pb-20 lg:pb-6"
          style={{ animation: "pageIn 0.22s ease" }}
        >
          {children}
        </main>
      </div>

      <MobileBottomNav activeKey={activeKey} />
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} activeKey={activeKey} />
    </div>
  )
}

export default StudentChrome
