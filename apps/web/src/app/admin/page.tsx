"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { MagnifyingGlass, UserPlus } from "@phosphor-icons/react"
import type { UserProfile, UserRole } from "@mais-aprovacao/types"
import { ROLE_LABELS } from "@mais-aprovacao/utils"
import { APROVA, Avatar, BentoCard, PageHeader } from "@/components/student/StudentSurface"
import { useSessionUser } from "@/components/auth/RoleProvider"

const ROLES: UserRole[] = ["student", "teacher", "manager", "parent", "admin"]

const ROLE_BADGE_COLORS: Record<UserRole, { bg: string; fg: string }> = {
  student: { bg: "rgba(27,77,228,0.10)", fg: APROVA.blue },
  teacher: { bg: "rgba(14,138,95,0.12)", fg: "#0E8A5F" },
  manager: { bg: "rgba(217,119,6,0.12)", fg: "#D97706" },
  parent: { bg: "rgba(108,75,217,0.12)", fg: "#6C4BD9" },
  admin: { bg: "rgba(226,48,48,0.10)", fg: "#E23030" },
}

export default function AdminUsersPage() {
  const me = useSessionUser()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [roleFilter, setRoleFilter] = useState<UserRole | "">("")
  const [search, setSearch] = useState("")
  const [savingId, setSavingId] = useState<string | null>(null)
  const [creatingManager, setCreatingManager] = useState(false)
  const [managerName, setManagerName] = useState("")
  const [managerEmail, setManagerEmail] = useState("")
  const [managerPassword, setManagerPassword] = useState("")
  const [notice, setNotice] = useState<string | null>(null)
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchUsers = useCallback(async (opts: { role: UserRole | ""; q: string; cursor?: string; append?: boolean }) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (opts.role) params.set("role", opts.role)
      if (opts.q) params.set("q", opts.q)
      if (opts.cursor) params.set("cursor", opts.cursor)
      const res = await fetch(`/api/proxy/admin/users?${params}`, { cache: "no-store" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Erro ao listar usuários")
      setUsers((prev) => (opts.append ? [...prev, ...data.users] : data.users))
      setNextCursor(data.next_cursor)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao listar usuários")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    fetch("/api/proxy/admin/users", { cache: "no-store" })
      .then(async (res) => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? "Erro ao listar usuários")
        return data
      })
      .then((data) => {
        if (cancelled) return
        setUsers(data.users)
        setNextCursor(data.next_cursor)
        setLoading(false)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : "Erro ao listar usuários")
        setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  function handleSearchChange(value: string) {
    setSearch(value)
    if (debounce.current) clearTimeout(debounce.current)
    debounce.current = setTimeout(() => void fetchUsers({ role: roleFilter, q: value }), 350)
  }

  function handleRoleFilterChange(value: UserRole | "") {
    setRoleFilter(value)
    void fetchUsers({ role: value, q: search })
  }

  async function handleChangeRole(user: UserProfile, role: UserRole) {
    if (role === user.role) return
    const label = `${ROLE_LABELS[user.role]} → ${ROLE_LABELS[role]}`
    if (!window.confirm(`Alterar a role de ${user.name} (${label})?`)) return

    setSavingId(user.id)
    setNotice(null)
    try {
      const res = await fetch(`/api/proxy/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      })
      const data = await res.json()
      if (!res.ok) {
        setNotice(data.code === "CLERK_SYNC_FAILED"
          ? "Falha ao sincronizar com o Clerk — a alteração foi revertida."
          : data.error ?? "Erro ao alterar role.")
        return
      }
      setUsers((prev) => prev.map((u) => (u.id === user.id ? data.user : u)))
      setNotice(`Role de ${user.name} alterada para ${ROLE_LABELS[role]}. Vale no próximo request.`)
    } catch {
      setNotice("Erro de conexão ao alterar role.")
    } finally {
      setSavingId(null)
    }
  }

  async function handleCreateManager(e: React.FormEvent) {
    e.preventDefault()
    if (creatingManager) return
    setCreatingManager(true)
    setNotice(null)
    try {
      const res = await fetch("/api/proxy/admin/users/managers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: managerName,
          email: managerEmail,
          password: managerPassword,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setNotice(data.error ?? "Erro ao criar gestor.")
        return
      }
      setUsers((prev) => [data.user, ...prev])
      setManagerName("")
      setManagerEmail("")
      setManagerPassword("")
      setNotice(`Gestor ${data.user.name} criado com acesso ao painel de gestão.`)
    } catch {
      setNotice("Erro de conexão ao criar gestor.")
    } finally {
      setCreatingManager(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <PageHeader
        kicker="Administração"
        title="Usuários"
        subtitle="Gerencie os perfis da plataforma. A troca de role sincroniza banco e Clerk."
      />

      <BentoCard className="mb-5">
        <form onSubmit={handleCreateManager} className="grid gap-3 lg:grid-cols-[1fr_1fr_180px_auto] lg:items-end">
          <label className="flex flex-col gap-1.5">
            <span className="text-[12px] font-bold" style={{ color: APROVA.inkMuted }}>Nome do gestor</span>
            <input
              required
              value={managerName}
              onChange={(e) => setManagerName(e.target.value)}
              className="rounded-xl border px-3 py-2.5 text-[13px] outline-none focus:border-[#1B4DE4]"
              style={{ borderColor: "#E2E6F0", background: "#fff", color: APROVA.ink }}
              autoComplete="off"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[12px] font-bold" style={{ color: APROVA.inkMuted }}>Email</span>
            <input
              required
              type="email"
              value={managerEmail}
              onChange={(e) => setManagerEmail(e.target.value)}
              className="rounded-xl border px-3 py-2.5 text-[13px] outline-none focus:border-[#1B4DE4]"
              style={{ borderColor: "#E2E6F0", background: "#fff", color: APROVA.ink }}
              autoComplete="off"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[12px] font-bold" style={{ color: APROVA.inkMuted }}>Senha inicial</span>
            <input
              required
              type="password"
              minLength={8}
              value={managerPassword}
              onChange={(e) => setManagerPassword(e.target.value)}
              className="rounded-xl border px-3 py-2.5 text-[13px] outline-none focus:border-[#1B4DE4]"
              style={{ borderColor: "#E2E6F0", background: "#fff", color: APROVA.ink }}
              autoComplete="new-password"
            />
          </label>
          <button
            type="submit"
            disabled={creatingManager}
            className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl px-4 text-[13px] font-extrabold text-white disabled:opacity-60"
            style={{ background: APROVA.blue }}
          >
            <UserPlus size={16} weight="bold" /> {creatingManager ? "Criando..." : "Criar gestor"}
          </button>
        </form>
      </BentoCard>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <MagnifyingGlass size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" color={APROVA.inkMuted} />
          <input
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Buscar por nome ou email…"
            className="w-full rounded-xl border py-2.5 pl-10 pr-4 text-[14px] outline-none focus:border-[#1B4DE4]"
            style={{ borderColor: "#E2E6F0", background: "#fff", color: APROVA.ink }}
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => handleRoleFilterChange(e.target.value as UserRole | "")}
          className="rounded-xl border px-4 py-2.5 text-[14px] font-semibold outline-none"
          style={{ borderColor: "#E2E6F0", background: "#fff", color: APROVA.ink }}
        >
          <option value="">Todas as roles</option>
          {ROLES.map((role) => (
            <option key={role} value={role}>{ROLE_LABELS[role]}</option>
          ))}
        </select>
      </div>

      {notice && (
        <p className="mb-3 rounded-xl px-4 py-2.5 text-[13px] font-semibold" style={{ background: APROVA.blueSoft, color: APROVA.blue }}>
          {notice}
        </p>
      )}
      {error && <p className="mb-3 text-[13px] font-semibold" style={{ color: APROVA.error }}>{error}</p>}

      <BentoCard className="overflow-x-auto p-0">
        <table className="w-full min-w-[640px] text-left">
          <thead>
            <tr style={{ borderBottom: "1px solid #EEF1F7" }}>
              <th className="px-5 py-3.5 text-[11px] font-black uppercase tracking-wide" style={{ color: APROVA.inkMuted }}>Usuário</th>
              <th className="px-5 py-3.5 text-[11px] font-black uppercase tracking-wide" style={{ color: APROVA.inkMuted }}>Role</th>
              <th className="px-5 py-3.5 text-[11px] font-black uppercase tracking-wide" style={{ color: APROVA.inkMuted }}>Criado em</th>
              <th className="px-5 py-3.5 text-[11px] font-black uppercase tracking-wide" style={{ color: APROVA.inkMuted }}>Alterar role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const badge = ROLE_BADGE_COLORS[user.role]
              return (
                <tr key={user.id} style={{ borderBottom: "1px solid #F4F6FB" }}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar initial={(user.name[0] ?? "?").toUpperCase()} size={32} />
                      <div className="min-w-0">
                        <p className="truncate text-[13.5px] font-bold" style={{ color: APROVA.ink }}>
                          {user.name}{user.id === me.id && <span className="ml-1.5 text-[11px] font-semibold" style={{ color: APROVA.inkMuted }}>(você)</span>}
                        </p>
                        <p className="truncate text-[12px]" style={{ color: APROVA.inkMuted }}>{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="rounded-full px-2.5 py-1 text-[11.5px] font-extrabold" style={{ background: badge.bg, color: badge.fg }}>
                      {ROLE_LABELS[user.role]}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-[12.5px]" style={{ color: APROVA.inkMuted }}>
                    {new Date(user.created_at).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-5 py-3">
                    <select
                      value={user.role}
                      disabled={savingId === user.id || user.id === me.id}
                      onChange={(e) => void handleChangeRole(user, e.target.value as UserRole)}
                      className="rounded-lg border px-2.5 py-1.5 text-[12.5px] font-semibold outline-none disabled:opacity-50"
                      style={{ borderColor: "#E2E6F0", background: "#fff", color: APROVA.ink }}
                      title={user.id === me.id ? "Você não pode alterar a própria role" : undefined}
                    >
                      {ROLES.map((role) => (
                        <option key={role} value={role}>{ROLE_LABELS[role]}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              )
            })}
            {!loading && users.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-[13.5px]" style={{ color: APROVA.inkMuted }}>
                  Nenhum usuário encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {loading && <p className="px-5 py-4 text-[13px]" style={{ color: APROVA.inkMuted }}>Carregando…</p>}
      </BentoCard>

      {nextCursor && !loading && (
        <button
          onClick={() => void fetchUsers({ role: roleFilter, q: search, cursor: nextCursor, append: true })}
          className="mx-auto mt-4 block rounded-xl border px-5 py-2.5 text-[13px] font-bold"
          style={{ borderColor: "#E2E6F0", background: "#fff", color: APROVA.blue }}
        >
          Carregar mais
        </button>
      )}
    </div>
  )
}
