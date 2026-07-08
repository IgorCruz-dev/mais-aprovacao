"use client"

import { createContext, useContext } from "react"
import type { UserProfile, UserRole } from "@mais-aprovacao/types"

const RoleContext = createContext<{ user: UserProfile } | null>(null)

export function RoleProvider({ user, children }: { user: UserProfile; children: React.ReactNode }) {
  return <RoleContext.Provider value={{ user }}>{children}</RoleContext.Provider>
}

export function useSessionUser(): UserProfile {
  const ctx = useContext(RoleContext)
  if (!ctx) {
    throw new Error("useSessionUser deve ser usado dentro de um RoleProvider (layout de área)")
  }
  return ctx.user
}

export function useRole(): UserRole {
  return useSessionUser().role
}
