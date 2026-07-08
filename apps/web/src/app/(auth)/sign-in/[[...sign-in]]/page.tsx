"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useSignIn } from "@clerk/nextjs"
import { sanitizeRedirectUrl } from "@mais-aprovacao/utils"
import { APROVA } from "@/components/student/StudentSurface"

function clerkErrorMessage(err: { longMessage?: string; message: string } | null): string {
  return err?.longMessage ?? err?.message ?? "Erro inesperado. Tente novamente."
}

const inputClass =
  "w-full rounded-xl border px-4 py-2.5 text-[14px] outline-none transition-colors focus:border-[#1B4DE4]"
const inputStyle = { borderColor: "#E2E6F0", background: "#fff", color: APROVA.ink }

export default function SignInPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signIn } = useSignIn()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const redirectUrl = sanitizeRedirectUrl(searchParams.get("redirect_url")) ?? "/"

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!signIn || loading) return

    setError(null)
    setLoading(true)
    try {
      const created = await signIn.create({
        identifier: email,
      })
      if (created.error) {
        setError(clerkErrorMessage(created.error))
        return
      }

      const verified = await signIn.password({ password })
      if (verified.error) {
        setError(clerkErrorMessage(verified.error))
        return
      }

      if (signIn.status === "complete") {
        const finalized = await signIn.finalize()
        if (finalized.error) {
          setError(clerkErrorMessage(finalized.error))
          return
        }
        router.push(redirectUrl)
        return
      }

      setError("Não foi possível concluir o login por senha. Verifique as configurações da conta.")
    } catch (err) {
      const clerkErr = err as { errors?: Array<{ longMessage?: string; message: string }> }
      setError(clerkErrorMessage(clerkErr.errors?.[0] ?? null))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10" style={{ background: APROVA.surface }}>
      <div className="w-full max-w-md rounded-2xl bg-white p-7 shadow-xl" style={{ border: "1px solid #E9EEFD" }}>
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-mais-aprovacao.jpg" alt="+Aprovação" style={{ height: 40, width: "auto" }} />
          <h1 className="text-xl font-black" style={{ color: APROVA.ink }}>Entrar</h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-bold" style={{ color: APROVA.inkMuted }}>Email</span>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              style={inputStyle}
              autoComplete="email"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-bold" style={{ color: APROVA.inkMuted }}>Senha</span>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              style={inputStyle}
              autoComplete="current-password"
            />
          </label>

          {error && <p className="text-[13px] font-semibold" style={{ color: APROVA.error }}>{error}</p>}

          <button
            type="submit"
            disabled={!signIn || loading}
            className="rounded-xl py-3 text-[14px] font-extrabold text-white transition-opacity disabled:opacity-60"
            style={{ background: APROVA.blue }}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>

          <p className="text-center text-[13px]" style={{ color: APROVA.inkMuted }}>
            Ainda não tem conta?{" "}
            <Link href="/sign-up" className="font-bold" style={{ color: APROVA.blue }}>Criar conta</Link>
          </p>
        </form>
      </div>
    </main>
  )
}
