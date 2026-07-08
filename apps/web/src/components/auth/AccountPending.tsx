"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { APROVA } from "@/components/student/StudentSurface"

const POLL_INTERVAL_MS = 2000
const MAX_ATTEMPTS = 6

/**
 * Estado transitório logo após o cadastro: a sessão Clerk existe mas o webhook
 * ainda não criou o usuário no banco. Faz poll no /me até a conta aparecer.
 */
export default function AccountPending({ variant = "provisioning" }: { variant?: "provisioning" | "error" }) {
  const router = useRouter()
  const [timedOut, setTimedOut] = useState(variant === "error")
  const attempts = useRef(0)

  useEffect(() => {
    if (variant === "error") return
    const timer = setInterval(async () => {
      attempts.current += 1
      try {
        const res = await fetch("/api/proxy/me", { cache: "no-store" })
        if (res.ok) {
          clearInterval(timer)
          router.refresh()
          return
        }
      } catch {
        // segue tentando até o limite
      }
      if (attempts.current >= MAX_ATTEMPTS) {
        clearInterval(timer)
        setTimedOut(true)
      }
    }, POLL_INTERVAL_MS)
    return () => clearInterval(timer)
  }, [router, variant])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center" style={{ background: APROVA.surface }}>
      {!timedOut ? (
        <>
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-t-transparent" style={{ borderColor: `${APROVA.blue} transparent ${APROVA.blue} ${APROVA.blue}` }} />
          <h1 className="text-xl font-black" style={{ color: APROVA.ink }}>Preparando sua conta…</h1>
          <p className="max-w-sm text-sm" style={{ color: APROVA.inkMuted }}>
            Isso leva só alguns segundos. Você será redirecionado automaticamente.
          </p>
        </>
      ) : (
        <>
          <h1 className="text-xl font-black" style={{ color: APROVA.ink }}>
            {variant === "error" ? "Não foi possível carregar seu perfil" : "Sua conta ainda está sendo preparada"}
          </h1>
          <p className="max-w-sm text-sm" style={{ color: APROVA.inkMuted }}>
            Tente novamente em instantes. Se o problema persistir, fale com o suporte.
          </p>
          <button
            onClick={() => { attempts.current = 0; setTimedOut(false); router.refresh() }}
            className="rounded-xl px-5 py-2.5 text-sm font-bold text-white"
            style={{ background: APROVA.blue }}
          >
            Tentar novamente
          </button>
        </>
      )}
    </main>
  )
}
