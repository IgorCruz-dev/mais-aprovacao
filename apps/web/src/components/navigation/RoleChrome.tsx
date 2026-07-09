"use client"

import { useEffect, useRef, useState, useSyncExternalStore } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { SignOutButton } from "@clerk/nextjs"
import { CaretLeft, List, SignOut, X } from "@phosphor-icons/react"
import type { UserRole } from "@mais-aprovacao/types"
import { ROLE_LABELS } from "@mais-aprovacao/utils"
import { APROVA } from "@/components/student/StudentSurface"
import { useSessionUser } from "@/components/auth/RoleProvider"
import { cn } from "@/lib/utils"
import { MOBILE_NAV_BY_ROLE, NAV_BY_ROLE, type RoleNavItem } from "@/lib/role-nav"

const NAVY = APROVA.navy
const NAVY_HOVER = "rgba(255,255,255,0.06)"
const COLLAPSED_EVENT = "role-sidebar-collapsed-change"

function subscribeMounted() {
  return () => {}
}

function getMountedSnapshot() {
  return true
}

function getServerMountedSnapshot() {
  return false
}

function collapsedKey(role: UserRole) {
  return `role_sidebar_collapsed_${role}`
}

function getSidebarCollapsedSnapshot(role: UserRole) {
  if (typeof window === "undefined") return false
  return localStorage.getItem(collapsedKey(role)) === "true"
}

function subscribeSidebarCollapsed(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {}
  const onStorage = (event: StorageEvent) => {
    if (event.key?.startsWith("role_sidebar_collapsed_")) onStoreChange()
  }
  window.addEventListener("storage", onStorage)
  window.addEventListener(COLLAPSED_EVENT, onStoreChange)
  return () => {
    window.removeEventListener("storage", onStorage)
    window.removeEventListener(COLLAPSED_EVENT, onStoreChange)
  }
}

function resolveActiveKey(pathname: string, items: RoleNavItem[]) {
  let best: RoleNavItem | null = null
  for (const item of items) {
    if (pathname === item.href || pathname.startsWith(`${item.href}/`)) {
      if (!best || item.href.length > best.href.length) best = item
    }
  }
  return best?.key ?? items[0]?.key ?? null
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

function LogoBox({ href, expanded }: { href: string; expanded: boolean }) {
  return (
    <Link href={href} className="flex min-w-0 shrink-0 items-center">
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

function SidebarNavItem({
  item,
  active,
  expanded,
  onNavigate,
}: {
  item: RoleNavItem
  active: boolean
  expanded: boolean
  onNavigate?: () => void
}) {
  const { Icon, label, href } = item
  return (
    <Link
      href={href}
      title={!expanded ? label : undefined}
      onClick={onNavigate}
      className={cn(
        "relative flex items-center gap-3 rounded-xl transition-all duration-150",
        !expanded ? "mx-2 justify-center px-0 py-2.5" : "mx-2.5 px-3 py-2.5"
      )}
      style={{ background: active ? "rgba(27,77,228,0.22)" : undefined }}
      onMouseEnter={(event) => {
        if (!active) event.currentTarget.style.background = NAVY_HOVER
      }}
      onMouseLeave={(event) => {
        if (!active) event.currentTarget.style.background = "transparent"
      }}
    >
      {active && <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full" style={{ background: APROVA.gold }} />}
      <Icon size={21} weight={active ? "fill" : "regular"} color={active ? "#fff" : "rgba(255,255,255,0.55)"} className="shrink-0" />
      <span
        className="overflow-hidden whitespace-nowrap text-[13.5px] transition-all duration-250"
        style={{
          opacity: expanded ? 1 : 0,
          maxWidth: expanded ? 150 : 0,
          color: active ? "#fff" : "rgba(255,255,255,0.6)",
          fontWeight: active ? 800 : 600,
        }}
      >
        {label}
      </span>
    </Link>
  )
}

function UserFooter({ role, expanded, profileHref }: { role: UserRole; expanded: boolean; profileHref?: string }) {
  const user = useSessionUser()
  const initial = (user.name?.[0] ?? user.email?.[0] ?? "?").toUpperCase()

  return (
    <div
      className={cn("mt-auto flex shrink-0 items-center gap-2.5 pb-3 pt-3", !expanded ? "flex-col justify-center px-1" : "px-4")}
      style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
    >
      {profileHref ? (
        <Link
          href={profileHref}
          title={!expanded ? "Perfil" : undefined}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[14px] font-black text-white"
          style={{ background: APROVA.blue, border: `2px solid ${APROVA.gold}` }}
        >
          {initial}
        </Link>
      ) : (
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[14px] font-black text-white"
          style={{ background: APROVA.blue, border: `2px solid ${APROVA.gold}` }}
        >
          {initial}
        </div>
      )}
      {profileHref ? (
        <Link
          href={profileHref}
          className="min-w-0 flex-1 overflow-hidden whitespace-nowrap transition-all duration-250"
          style={{ opacity: expanded ? 1 : 0, maxWidth: expanded ? 130 : 0 }}
        >
          <p className="truncate text-[13px] font-bold leading-tight text-white">{user.name}</p>
          <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.45)" }}>{ROLE_LABELS[role]}</p>
        </Link>
      ) : (
        <div className="min-w-0 flex-1 overflow-hidden whitespace-nowrap transition-all duration-250" style={{ opacity: expanded ? 1 : 0, maxWidth: expanded ? 130 : 0 }}>
          <p className="truncate text-[13px] font-bold leading-tight text-white">{user.name}</p>
          <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.45)" }}>{ROLE_LABELS[role]}</p>
        </div>
      )}
      <SignOutButton redirectUrl="/sign-in">
        <button title="Sair" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/50 transition-colors hover:bg-white/5 hover:text-white">
          <SignOut size={17} />
        </button>
      </SignOutButton>
    </div>
  )
}

function DesktopSidebar({
  role,
  items,
  activeKey,
  collapsed,
  onToggle,
  homeHref,
  profileHref,
}: {
  role: UserRole
  items: RoleNavItem[]
  activeKey: string | null
  collapsed: boolean
  onToggle: () => void
  homeHref: string
  profileHref?: string
}) {
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
        <div className="min-w-0 flex-1 overflow-hidden"><LogoBox href={homeHref} expanded={expanded} /></div>
        <button
          onClick={onToggle}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors"
          style={{ color: "rgba(255,255,255,0.5)", opacity: expanded ? 1 : 0, pointerEvents: expanded ? "auto" : "none" }}
          title={collapsed ? "Fixar aberta" : "Recolher"}
        >
          <CaretLeft size={16} style={{ transform: collapsed ? "rotate(180deg)" : "none", transition: "transform 0.3s ease" }} />
        </button>
      </div>
      <div className="flex shrink-0 px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <RoleBadge role={role} />
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto overflow-x-hidden py-3 scrollbar-none">
        {items.map((item) => (
          <SidebarNavItem key={item.key} item={item} active={activeKey === item.key} expanded={expanded} />
        ))}
      </nav>
      <UserFooter role={role} expanded={expanded} profileHref={profileHref} />
    </aside>
  )
}

function MobileTopBar({ role, homeHref, onMenuOpen }: { role: UserRole; homeHref: string; onMenuOpen: () => void }) {
  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between px-4 lg:hidden" style={{ background: NAVY }}>
      <Link href={homeHref} className="flex items-center">
        <div className="flex items-center justify-center rounded-lg bg-white px-2 py-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-mais-aprovacao.jpg" alt="+Aprovação" style={{ height: 26, width: "auto" }} />
        </div>
      </Link>
      <div className="flex items-center gap-1">
        <RoleBadge role={role} />
        <button onClick={onMenuOpen} className="flex h-9 w-9 items-center justify-center rounded-lg text-white/70">
          <List size={20} />
        </button>
      </div>
    </header>
  )
}

function MobileBottomNav({ items, activeKey, profileHref, profileInitial }: { items: RoleNavItem[]; activeKey: string | null; profileHref?: string; profileInitial: string }) {
  if (items.length === 0) return null
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 flex h-16 items-center justify-around px-1 lg:hidden" style={{ background: "#fff", borderTop: "1px solid #EAECF3", boxShadow: "0 -4px 20px -8px rgba(10,15,30,0.12)" }}>
      {items.map(({ key, label, Icon, href }) => {
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
      {profileHref && (
        <Link href={profileHref} className="flex flex-1 flex-col items-center gap-0.5 py-1">
          <div className="flex items-center justify-center rounded-full px-3 py-1" style={{ background: activeKey === "perfil" ? APROVA.blueSoft : "transparent" }}>
            <div className="flex items-center justify-center rounded-full text-[11px] font-black text-white" style={{ width: 24, height: 24, background: APROVA.blue }}>{profileInitial}</div>
          </div>
          <span className="text-[10px]" style={{ color: activeKey === "perfil" ? APROVA.blue : "#B4BAC7", fontWeight: activeKey === "perfil" ? 800 : 500 }}>Perfil</span>
        </Link>
      )}
    </nav>
  )
}

function MobileDrawer({
  open,
  onClose,
  role,
  items,
  activeKey,
  homeHref,
  profileHref,
}: {
  open: boolean
  onClose: () => void
  role: UserRole
  items: RoleNavItem[]
  activeKey: string | null
  homeHref: string
  profileHref?: string
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }
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
          <LogoBox href={homeHref} expanded />
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-lg text-white/70">
            <X size={18} />
          </button>
        </div>
        <div className="flex shrink-0 px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <RoleBadge role={role} />
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto py-3 scrollbar-none">
          {items.map((item) => (
            <SidebarNavItem key={item.key} item={item} active={activeKey === item.key} expanded onNavigate={onClose} />
          ))}
        </nav>
        <UserFooter role={role} expanded profileHref={profileHref} />
      </div>
    </>
  )
}

export function RoleChrome({ role, children }: { role: UserRole; children: React.ReactNode }) {
  const pathname = usePathname()
  const user = useSessionUser()
  const mounted = useSyncExternalStore(subscribeMounted, getMountedSnapshot, getServerMountedSnapshot)
  const collapsed = useSyncExternalStore(
    subscribeSidebarCollapsed,
    () => getSidebarCollapsedSnapshot(role),
    getServerMountedSnapshot
  )
  const [drawerOpen, setDrawerOpen] = useState(false)

  const navRole = user.role === "admin" ? "admin" : role
  const items = NAV_BY_ROLE[navRole]
  const mobileItems = MOBILE_NAV_BY_ROLE[navRole] ?? items
  const activeKey = resolveActiveKey(pathname, items)
  const homeHref = items[0]?.href ?? "/dashboard"
  const profileHref = navRole === "student" ? "/student/perfil" : undefined
  const profileInitial = (user.name?.[0] ?? user.email?.[0] ?? "?").toUpperCase()

  const toggleCollapse = () => {
    localStorage.setItem(collapsedKey(role), String(!collapsed))
    window.dispatchEvent(new Event(COLLAPSED_EVENT))
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
      <DesktopSidebar
        role={navRole}
        items={items}
        activeKey={activeKey}
        collapsed={collapsed}
        onToggle={toggleCollapse}
        homeHref={homeHref}
        profileHref={profileHref}
      />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <MobileTopBar role={navRole} homeHref={homeHref} onMenuOpen={() => setDrawerOpen(true)} />
        <main key={pathname} className="flex-1 overflow-y-auto pb-20 lg:pb-8" style={{ animation: "pageIn 0.24s ease" }}>
          {children}
        </main>
      </div>
      <MobileBottomNav items={mobileItems} activeKey={activeKey} profileHref={profileHref} profileInitial={profileInitial} />
      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        role={navRole}
        items={items}
        activeKey={activeKey}
        homeHref={homeHref}
        profileHref={profileHref}
      />
    </div>
  )
}

export default RoleChrome
