"use client"

import { useState, useEffect, useRef, useSyncExternalStore } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { SignOutButton } from "@clerk/nextjs"
import {
  House, Books, Exam, VideoCamera, PencilLine,
  Trophy, Medal, ChartLineUp, Question, User,
  CaretLeft, Bell, List, X, Fire, SignOut,
} from "@phosphor-icons/react"
import type { Icon as PhosphorIcon } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { STUDENT } from "@/lib/mock-data"
import { APROVA } from "@/components/student/StudentSurface"

// Backward-compatible exports
export const BRAND = APROVA.blue
export const BRAND_RGB = "27, 77, 228"
export const MODULE_COLORS = { questions: "#1B4DE4", exams: "#D97706", essays: "#6C4BD9" }

type NavItem = { key: string; label: string; Icon: PhosphorIcon; href: string }

const NAV_ITEMS: NavItem[] = [
  { key: "dashboard",  label: "Início",            Icon: House,        href: "/student/dashboard" },
  { key: "questoes",   label: "Questões",           Icon: Books,        href: "/student/questoes" },
  { key: "simulados",  label: "Simulados",          Icon: Exam,         href: "/student/simulados" },
  { key: "aulas",      label: "Aulas",              Icon: VideoCamera,  href: "/student/aulas" },
  { key: "redacoes",   label: "Redações",           Icon: PencilLine,   href: "/student/redacoes" },
  { key: "ranking",    label: "Ranking",            Icon: Trophy,       href: "/student/ranking" },
  { key: "titulos",    label: "Títulos e Evolução", Icon: Medal,        href: "/student/titulos" },
  { key: "desempenho", label: "Meu Desempenho",     Icon: ChartLineUp,  href: "/student/desempenho" },
  { key: "suporte",    label: "Suporte",            Icon: Question,     href: "/student/suporte" },
  { key: "perfil",     label: "Perfil",             Icon: User,         href: "/student/perfil" },
]

const MOBILE_BOTTOM: NavItem[] = [
  { key: "dashboard", label: "Início",    Icon: House,      href: "/student/dashboard" },
  { key: "questoes",  label: "Questões",  Icon: Books,      href: "/student/questoes" },
  { key: "simulados", label: "Simulados", Icon: Exam,       href: "/student/simulados" },
  { key: "redacoes",  label: "Redações",  Icon: PencilLine, href: "/student/redacoes" },
]

const SIDEBAR_COLLAPSED_KEY = "sidebar_collapsed"
const SIDEBAR_COLLAPSED_EVENT = "sidebar-collapsed-change"

const NAVY = APROVA.navy
const NAVY_HOVER = "rgba(255,255,255,0.06)"

function subscribeMounted() { return () => {} }
function getMountedSnapshot() { return true }
function getServerMountedSnapshot() { return false }

function getSidebarCollapsedSnapshot() {
  if (typeof window === "undefined") return false
  return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "true"
}

function subscribeSidebarCollapsed(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {}
  const onStorage = (e: StorageEvent) => { if (e.key === SIDEBAR_COLLAPSED_KEY) onStoreChange() }
  window.addEventListener("storage", onStorage)
  window.addEventListener(SIDEBAR_COLLAPSED_EVENT, onStoreChange)
  return () => {
    window.removeEventListener("storage", onStorage)
    window.removeEventListener(SIDEBAR_COLLAPSED_EVENT, onStoreChange)
  }
}

function resolveActiveKey(pathname: string): string {
  const seg = pathname.split("/").filter(Boolean)[1] ?? "dashboard"
  const known = NAV_ITEMS.map((i) => i.key)
  return known.includes(seg) ? seg : "dashboard"
}

function LogoBox({ expanded }: { expanded: boolean }) {
  return (
    <Link href="/student/dashboard" className="flex min-w-0 shrink-0 items-center">
      <div
        className="flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white transition-all duration-250"
        style={{ width: expanded ? 148 : 40, height: 40 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-mais-aprovacao.jpg" alt="+Aprovação" style={{ height: 34, width: "auto", display: "block" }} />
      </div>
    </Link>
  )
}

function SidebarNavItem({ item, active, expanded }: { item: NavItem; active: boolean; expanded: boolean }) {
  const { Icon, label, href } = item
  return (
    <Link
      href={href}
      title={!expanded ? label : undefined}
      className={cn(
        "relative flex items-center gap-3 rounded-xl transition-all duration-150",
        !expanded ? "mx-2 justify-center px-0 py-2.5" : "mx-2.5 px-3 py-2.5"
      )}
      style={{ background: active ? "rgba(27,77,228,0.22)" : undefined }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = NAVY_HOVER }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent" }}
    >
      {active && <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full" style={{ background: APROVA.gold }} />}
      <Icon size={21} weight={active ? "fill" : "regular"} color={active ? "#fff" : "rgba(255,255,255,0.55)"} className="shrink-0" />
      <span
        className="overflow-hidden whitespace-nowrap text-[13.5px] transition-all duration-250"
        style={{ opacity: expanded ? 1 : 0, maxWidth: expanded ? 150 : 0, color: active ? "#fff" : "rgba(255,255,255,0.6)", fontWeight: active ? 800 : 600 }}
      >
        {label}
      </span>
    </Link>
  )
}

function UserFooter({ expanded }: { expanded: boolean }) {
  return (
    <div
      className={cn("mt-auto flex shrink-0 items-center gap-2.5 pb-3 pt-3", !expanded ? "flex-col justify-center px-1" : "px-4")}
      style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
    >
      <Link
        href="/student/perfil"
        title={!expanded ? "Perfil" : undefined}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-display text-[14px] font-black text-white"
        style={{ background: APROVA.blue, border: `2px solid ${APROVA.gold}` }}
      >
        {STUDENT.initial}
      </Link>
      <Link href="/student/perfil" className="min-w-0 flex-1 overflow-hidden whitespace-nowrap transition-all duration-250" style={{ opacity: expanded ? 1 : 0, maxWidth: expanded ? 130 : 0 }}>
        <p className="truncate text-[13px] font-bold leading-tight text-white">{STUDENT.name}</p>
        <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.45)" }}>Aluno</p>
      </Link>
      <SignOutButton redirectUrl="/sign-in">
        <button title="Sair" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/50 transition-colors hover:bg-white/5 hover:text-white">
          <SignOut size={17} />
        </button>
      </SignOutButton>
    </div>
  )
}

function DesktopSidebar({ collapsed, onToggle, activeKey }: { collapsed: boolean; onToggle: () => void; activeKey: string }) {
  const [hovered, setHovered] = useState(false)
  const expanded = !collapsed || hovered
  return (
    <aside
      className="sticky top-0 z-20 hidden h-screen shrink-0 flex-col overflow-hidden transition-all duration-250 ease lg:flex"
      style={{ width: expanded ? 224 : 60, background: NAVY }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex shrink-0 items-center justify-between gap-1 px-3 pb-3 pt-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="min-w-0 flex-1 overflow-hidden"><LogoBox expanded={expanded} /></div>
        <button
          onClick={onToggle}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors"
          style={{ color: "rgba(255,255,255,0.5)", opacity: expanded ? 1 : 0, pointerEvents: expanded ? "auto" : "none" }}
          title={collapsed ? "Fixar aberta" : "Recolher"}
        >
          <CaretLeft size={16} style={{ transform: collapsed ? "rotate(180deg)" : "none", transition: "transform 0.3s ease" }} />
        </button>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto overflow-x-hidden py-3 scrollbar-none">
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
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between px-4 lg:hidden" style={{ background: NAVY }}>
      <Link href="/student/dashboard" className="flex items-center">
        <div className="flex items-center justify-center rounded-lg bg-white px-2 py-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-mais-aprovacao.jpg" alt="+Aprovação" style={{ height: 26, width: "auto" }} />
        </div>
      </Link>
      <div className="flex items-center gap-1">
        <span className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-extrabold text-white" style={{ background: "rgba(242,96,12,0.18)" }}>
          <Fire size={14} weight="fill" color={APROVA.streak} /> {STUDENT.streak}
        </span>
        <button className="flex h-9 w-9 items-center justify-center rounded-lg text-white/70"><Bell size={18} /></button>
        <button onClick={onMenuOpen} className="flex h-9 w-9 items-center justify-center rounded-lg text-white/70"><List size={20} /></button>
      </div>
    </header>
  )
}

function MobileBottomNav({ activeKey }: { activeKey: string }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 flex h-16 items-center justify-around px-1 lg:hidden" style={{ background: "#fff", borderTop: "1px solid #EAECF3", boxShadow: "0 -4px 20px -8px rgba(10,15,30,0.12)" }}>
      {MOBILE_BOTTOM.map(({ key, label, Icon, href }) => {
        const active = activeKey === key
        return (
          <Link key={key} href={href} className="flex flex-1 flex-col items-center gap-0.5 py-1">
            <div className="flex items-center justify-center rounded-full px-3 py-1 transition-all duration-150" style={{ background: active ? APROVA.blueSoft : "transparent" }}>
              <Icon size={21} weight={active ? "fill" : "regular"} color={active ? APROVA.blue : "#B4BAC7"} />
            </div>
            <span className="text-[10px]" style={{ color: active ? APROVA.blue : "#B4BAC7", fontWeight: active ? 800 : 500 }}>{label}</span>
          </Link>
        )
      })}
      <Link href="/student/perfil" className="flex flex-1 flex-col items-center gap-0.5 py-1">
        <div className="flex items-center justify-center rounded-full px-3 py-1" style={{ background: activeKey === "perfil" ? APROVA.blueSoft : "transparent" }}>
          <div className="flex items-center justify-center rounded-full font-black text-[11px] text-white" style={{ width: 24, height: 24, background: APROVA.blue }}>{STUDENT.initial}</div>
        </div>
        <span className="text-[10px]" style={{ color: activeKey === "perfil" ? APROVA.blue : "#B4BAC7", fontWeight: activeKey === "perfil" ? 800 : 500 }}>Perfil</span>
      </Link>
    </nav>
  )
}

function MobileDrawer({ open, onClose, activeKey }: { open: boolean; onClose: () => void; activeKey: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", handleKey)
    return () => document.removeEventListener("keydown", handleKey)
  }, [open, onClose])
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50 transition-opacity duration-250 lg:hidden" style={{ opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none" }} onClick={onClose} />
      <div
        ref={ref}
        className="fixed bottom-0 left-0 top-0 z-50 flex flex-col shadow-2xl transition-transform duration-250 ease lg:hidden"
        style={{ width: 256, background: NAVY, transform: open ? "translateX(0)" : "translateX(-100%)" }}
      >
        <div className="flex h-14 shrink-0 items-center justify-between px-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="flex items-center justify-center rounded-lg bg-white px-2 py-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-mais-aprovacao.jpg" alt="+Aprovação" style={{ height: 26, width: "auto" }} />
          </div>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-lg text-white/70"><X size={18} /></button>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto py-3 scrollbar-none">
          {NAV_ITEMS.map((item) => (
            <div key={item.key} onClick={onClose}>
              <SidebarNavItem item={item} active={activeKey === item.key} expanded />
            </div>
          ))}
        </nav>
        <UserFooter expanded />
      </div>
    </>
  )
}

export function StudentChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const activeKey = resolveActiveKey(pathname)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const mounted = useSyncExternalStore(subscribeMounted, getMountedSnapshot, getServerMountedSnapshot)
  const collapsed = useSyncExternalStore(subscribeSidebarCollapsed, getSidebarCollapsedSnapshot, getServerMountedSnapshot)

  const toggleCollapse = () => {
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(!collapsed))
    window.dispatchEvent(new Event(SIDEBAR_COLLAPSED_EVENT))
  }

  if (!mounted) {
    return (
      <div className="flex h-screen" style={{ background: APROVA.surface }}>
        <div className="hidden shrink-0 lg:block" style={{ width: 224, background: NAVY }} />
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: APROVA.surface }}>
      <DesktopSidebar collapsed={collapsed} onToggle={toggleCollapse} activeKey={activeKey} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <MobileTopBar onMenuOpen={() => setDrawerOpen(true)} />
        <main key={pathname} className="flex-1 overflow-y-auto pb-20 lg:pb-8" style={{ animation: "pageIn 0.24s ease" }}>
          {children}
        </main>
      </div>
      <MobileBottomNav activeKey={activeKey} />
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} activeKey={activeKey} />
    </div>
  )
}

export default StudentChrome
