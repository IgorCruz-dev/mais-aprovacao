"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useClerk, useSignIn } from "@clerk/nextjs"
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
  const { signOut } = useClerk()
  const { signIn } = useSignIn()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [code, setCode] = useState("")
  const [step, setStep] = useState<"password" | "code">("password")
  const [error, setError] = useState<string | null>(null)
  const [alreadySignedIn, setAlreadySignedIn] = useState(false)
  const [loading, setLoading] = useState(false)

  const redirectUrl = sanitizeRedirectUrl(searchParams.get("redirect_url")) ?? "/"
  const postLoginUrl = redirectUrl === "/" ? "/dashboard" : redirectUrl

  async function finishSignIn() {
    if (!signIn) return
    const finalized = await signIn.finalize({
      navigate: async ({ decorateUrl }) => {
        const decorated = decorateUrl(postLoginUrl)
        // decorateUrl pode retornar URL absoluta para Safari ITP — usar window.location nesses casos.
        if (decorated.startsWith("http") && !decorated.startsWith(window.location.origin)) {
          window.location.href = decorated
        } else {
          router.push(decorated)
        }
      },
    })
    if (finalized.error) {
      setError(clerkErrorMessage(finalized.error))
    }
    // Não chamar router.push novamente: o navigate callback acima já cuidou disso.
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!signIn || loading) return

    setError(null)
    setAlreadySignedIn(false)
    setLoading(true)
    try {
      const created = await signIn.create({
        identifier: email,
        password,
      })
      if (created.error) {
        setError(clerkErrorMessage(created.error))
        return
      }

      if (signIn.status === "needs_client_trust" || signIn.status === "needs_second_factor") {
        const sent = await signIn.emailCode.sendCode()
        if (sent.error) {
          setError(clerkErrorMessage(sent.error))
          return
        }
        setStep("code")
        return
      }

      if (signIn.status !== "complete") {
        setError(`Login por senha não completou. Status Clerk: ${signIn.status}.`)
        return
      }

      await finishSignIn()
    } catch (err) {
      const clerkErr = err as { errors?: Array<{ longMessage?: string; message: string }> }
      const first = clerkErr.errors?.[0]
      const message = first ? clerkErrorMessage(first) : err instanceof Error ? err.message : "Erro inesperado. Tente novamente."
      if (message.toLowerCase().includes("already signed in")) {
        setAlreadySignedIn(true)
        setError("Você já está logado neste navegador. Saia da conta atual para entrar com outra.")
        return
      }
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault()
    if (!signIn || loading) return

    setError(null)
    setLoading(true)
    try {
      const verified = await signIn.emailCode.verifyCode({ code: code.trim() })
      if (verified.error) {
        setError(clerkErrorMessage(verified.error))
        return
      }
      await finishSignIn()
    } catch (err) {
      const clerkErr = err as { errors?: Array<{ longMessage?: string; message: string }> }
      const first = clerkErr.errors?.[0]
      setError(first ? clerkErrorMessage(first) : err instanceof Error ? err.message : "Erro inesperado. Tente novamente.")
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
          <h1 className="text-xl font-black" style={{ color: APROVA.ink }}>{step === "password" ? "Entrar" : "Confirmar código"}</h1>
        </div>

        {step === "password" ? (
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

          {alreadySignedIn && (
            <button
              type="button"
              onClick={() => signOut({ redirectUrl: "/sign-in" })}
              className="rounded-xl border py-3 text-[14px] font-extrabold"
              style={{ borderColor: "#E2E6F0", color: APROVA.ink }}
            >
              Sair e entrar com outra conta
            </button>
          )}

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
        ) : (
          <form onSubmit={handleVerifyCode} className="flex flex-col gap-4">
            <p className="text-[13.5px]" style={{ color: APROVA.inkMuted }}>
              Enviamos um código de segurança para <strong style={{ color: APROVA.ink }}>{email}</strong>.
            </p>
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-bold" style={{ color: APROVA.inkMuted }}>Código</span>
              <input
                required
                inputMode="numeric"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className={`${inputClass} text-center text-[18px] tracking-[0.4em]`}
                style={inputStyle}
                autoComplete="one-time-code"
              />
            </label>

            {error && <p className="text-[13px] font-semibold" style={{ color: APROVA.error }}>{error}</p>}

            <button
              type="submit"
              disabled={!signIn || loading}
              className="rounded-xl py-3 text-[14px] font-extrabold text-white transition-opacity disabled:opacity-60"
              style={{ background: APROVA.blue }}
            >
              {loading ? "Verificando..." : "Confirmar e entrar"}
            </button>

            <button
              type="button"
              onClick={() => setStep("password")}
              className="rounded-xl border py-3 text-[14px] font-extrabold"
              style={{ borderColor: "#E2E6F0", color: APROVA.ink }}
            >
              Voltar
            </button>
          </form>
        )}
      </div>
    </main>
  )
}
