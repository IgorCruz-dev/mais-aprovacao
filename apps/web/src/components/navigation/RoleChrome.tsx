"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { SignOutButton } from "@clerk/nextjs"
import { List, SignOut, X } from "@phosphor-icons/react"
import type { UserRole } from "@mais-aprovacao/types"
import { ROLE_LABELS } from "@mais-aprovacao/utils"
import { APROVA } from "@/components/student/StudentSurface"
import { useSessionUser } from "@/components/auth/RoleProvider"
import { NAV_BY_ROLE, type RoleNavItem } from "@/lib/role-nav"

const NAVY = APROVA.navy
const NAVY_HOVER = "rgba(255,255,255,0.06)"

function resolveActiveKey(pathname: string, items: RoleNavItem[]): string | null {
  // Prefixo mais longo vence (ex.: /admin/vinculos ativa "vinculos", não "usuarios").
  let best: RoleNavItem | null = null
  for (const item of items) {
    if (pathname === item.href || pathname.startsWith(`${item.href}/`)) {
      if (!best || item.href.length > best.href.length) best = item
    }
  }
  return best?.key ?? null
}

function RoleBadge({ role }: { role: UserRole }) {
  return (
    <span
      className="rounded-full px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wide"
      style={{ background: "rgba(255,197,41,0.16)", color: APROVA.gold }}
    >
      {ROLE_LABELS[role]}
    </span>
  )
}

function NavList({ items, activeKey, onNavigate }: { items: RoleNavItem[]; activeKey: string | null; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto py-3">
      {items.map(({ key, label, Icon, href }) => {
        const active = key === activeKey
        return (
          <Link
            key={key}
            href={href}
            onClick={onNavigate}
            className="relative mx-2.5 flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-150"
            style={{ background: active ? "rgba(27,77,228,0.22)" : undefined }}
            onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = NAVY_HOVER }}
            onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent" }}
          >
            {active && <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full" style={{ background: APROVA.gold }} />}
            <Icon size={21} weight={active ? "fill" : "regular"} color={active ? "#fff" : "rgba(255,255,255,0.55)"} className="shrink-0" />
            <span className="text-[13.5px]" style={{ color: active ? "#fff" : "rgba(255,255,255,0.6)", fontWeight: active ? 800 : 600 }}>
              {label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}

function UserFooter() {
  const user = useSessionUser()
  const initial = (user.name?.[0] ?? "?").toUpperCase()
  return (
    <div className="mt-auto flex shrink-0 items-center gap-2.5 px-4 pb-3 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[14px] font-black text-white"
        style={{ background: APROVA.blue, border: `2px solid ${APROVA.gold}` }}
      >
        {initial}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-bold leading-tight text-white">{user.name}</p>
        <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.45)" }}>{ROLE_LABELS[user.role]}</p>
      </div>
      <SignOutButton redirectUrl="/sign-in">
        <button title="Sair" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/50 hover:text-white">
          <SignOut size={17} />
        </button>
      </SignOutButton>
    </div>
  )
}

function SidebarHeader({ role }: { role: UserRole }) {
  return (
    <div className="flex shrink-0 flex-col gap-2 px-4 pb-3 pt-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
      <div className="flex items-center justify-center self-start overflow-hidden rounded-xl bg-white px-2 py-1">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-mais-aprovacao.jpg" alt="+Aprovação" style={{ height: 30, width: "auto", display: "block" }} />
      </div>
      <RoleBadge role={role} />
    </div>
  )
}

export function RoleChrome({ role, children }: { role: Exclude<UserRole, "student">; children: React.ReactNode }) {
  const pathname = usePathname()
  const user = useSessionUser()
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Admin navegando em outra área continua vendo a própria navegação de admin.
  const navRole = user.role === "admin" ? "admin" : role
  const items = NAV_BY_ROLE[navRole]
  const activeKey = resolveActiveKey(pathname, items)

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: APROVA.surface }}>
      <aside className="sticky top-0 z-20 hidden h-screen w-56 shrink-0 flex-col lg:flex" style={{ background: NAVY }}>
        <SidebarHeader role={navRole} />
        <NavList items={items} activeKey={activeKey} />
        <UserFooter />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between px-4 lg:hidden" style={{ background: NAVY }}>
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center rounded-lg bg-white px-2 py-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-mais-aprovacao.jpg" alt="+Aprovação" style={{ height: 26, width: "auto" }} />
            </div>
            <RoleBadge role={navRole} />
          </div>
          <button onClick={() => setDrawerOpen(true)} className="flex h-9 w-9 items-center justify-center rounded-lg text-white/70">
            <List size={20} />
          </button>
        </header>
        <main key={pathname} className="flex-1 overflow-y-auto pb-8">
          {children}
        </main>
      </div>

      <div
        className="fixed inset-0 z-40 bg-black/50 transition-opacity duration-250 lg:hidden"
        style={{ opacity: drawerOpen ? 1 : 0, pointerEvents: drawerOpen ? "auto" : "none" }}
        onClick={() => setDrawerOpen(false)}
      />
      <div
        className="fixed bottom-0 left-0 top-0 z-50 flex w-64 flex-col shadow-2xl transition-transform duration-250 lg:hidden"
        style={{ background: NAVY, transform: drawerOpen ? "translateX(0)" : "translateX(-100%)" }}
      >
        <div className="flex h-14 shrink-0 items-center justify-between px-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <RoleBadge role={navRole} />
          <button onClick={() => setDrawerOpen(false)} className="flex h-9 w-9 items-center justify-center rounded-lg text-white/70">
            <X size={18} />
          </button>
        </div>
        <NavList items={items} activeKey={activeKey} onNavigate={() => setDrawerOpen(false)} />
        <UserFooter />
      </div>
    </div>
  )
}

export default RoleChrome
