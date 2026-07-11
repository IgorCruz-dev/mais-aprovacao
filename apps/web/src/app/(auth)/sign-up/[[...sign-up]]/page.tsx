"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useSignUp } from "@clerk/nextjs"
import { GraduationCap, ChalkboardTeacher, UsersThree } from "@phosphor-icons/react"
import type { Icon as PhosphorIcon } from "@phosphor-icons/react"
import { sanitizeRedirectUrl } from "@mais-aprovacao/utils"
import { APROVA } from "@/components/student/StudentSurface"

type SignupRole = "student" | "teacher" | "parent"

const ROLE_OPTIONS: Array<{ role: SignupRole; label: string; description: string; Icon: PhosphorIcon }> = [
  { role: "student", label: "Aluno", description: "Quero estudar para o vestibular", Icon: GraduationCap },
  { role: "teacher", label: "Professor", description: "Vou criar cursos e corrigir redações", Icon: ChalkboardTeacher },
  { role: "parent", label: "Responsável", description: "Quero acompanhar o progresso de um aluno", Icon: UsersThree },
]

function clerkErrorMessage(err: { longMessage?: string; message: string } | null): string {
  return err?.longMessage ?? err?.message ?? "Erro inesperado. Tente novamente."
}

const inputClass =
  "w-full rounded-xl border px-4 py-2.5 text-[14px] outline-none transition-colors focus:border-[#1B4DE4]"
const inputStyle = { borderColor: "#E2E6F0", background: "#fff", color: APROVA.ink }

export default function SignUpPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signUp } = useSignUp()
  const requestedRole = searchParams.get("role")
  const initialRole: SignupRole =
    requestedRole === "teacher" || requestedRole === "parent" || requestedRole === "student"
      ? requestedRole
      : "student"
  const roleLocked = requestedRole === "teacher" || requestedRole === "parent" || requestedRole === "student"

  const redirectUrl = sanitizeRedirectUrl(searchParams.get("redirect_url")) ?? "/"
  const postSignUpUrl = redirectUrl === "/" ? "/dashboard" : redirectUrl

  const [step, setStep] = useState<"form" | "verify">("form")
  const [role, setRole] = useState<SignupRole>(initialRole)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [code, setCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!signUp || loading) return
    setError(null)
    setLoading(true)
    try {
      const [firstName, ...rest] = name.trim().split(/\s+/)
      const created = await signUp.password({
        emailAddress: email,
        password,
        firstName,
        lastName: rest.join(" ") || undefined,
        // Consolidada em publicMetadata.role pelo backend (webhook user.created).
        unsafeMetadata: { requested_role: role },
      })
      if (created.error) {
        setError(clerkErrorMessage(created.error))
        return
      }
      const sent = await signUp.verifications.sendEmailCode()
      if (sent.error) {
        setError(clerkErrorMessage(sent.error))
        return
      }
      setStep("verify")
    } catch (err) {
      const clerkErr = err as { errors?: Array<{ longMessage?: string; message: string }> }
      const first = clerkErr.errors?.[0]
      setError(
        first
          ? clerkErrorMessage(first)
          : err instanceof Error
            ? err.message
            : "Erro inesperado. Tente novamente."
      )
    } finally {
      setLoading(false)
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    if (!signUp || loading) return
    setError(null)
    setLoading(true)
    try {
      const verified = await signUp.verifications.verifyEmailCode({ code: code.trim() })
      if (verified.error) {
        setError(clerkErrorMessage(verified.error))
        return
      }
      const finalized = await signUp.finalize()
      if (finalized.error) {
        setError(clerkErrorMessage(finalized.error))
        return
      }
      // O middleware roteia "/dashboard" para o dashboard da role após o webhook processar.
      router.push(postSignUpUrl)
    } catch (err) {
      const clerkErr = err as { errors?: Array<{ longMessage?: string; message: string }> }
      const first = clerkErr.errors?.[0]
      setError(
        first
          ? clerkErrorMessage(first)
          : err instanceof Error
            ? err.message
            : "Erro inesperado. Tente novamente."
      )
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
          <h1 className="text-xl font-black" style={{ color: APROVA.ink }}>
            {step === "form" ? "Criar conta" : "Confirme seu email"}
          </h1>
        </div>

        {step === "form" ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <fieldset>
              <legend className="mb-2 text-[13px] font-bold" style={{ color: APROVA.inkMuted }}>
                Tipo de acesso
              </legend>
              <div className="flex flex-col gap-2">
                {ROLE_OPTIONS.map(({ role: option, label, description, Icon }) => {
                  if (roleLocked && option !== role) return null
                  const selected = role === option
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => !roleLocked && setRole(option)}
                      disabled={roleLocked}
                      className="flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all"
                      style={{
                        borderColor: selected ? APROVA.blue : "#E2E6F0",
                        background: selected ? APROVA.blueSoft : "#fff",
                        cursor: roleLocked ? "default" : "pointer",
                      }}
                    >
                      <Icon size={24} weight={selected ? "fill" : "regular"} color={selected ? APROVA.blue : APROVA.inkMuted} />
                      <span>
                        <span className="block text-[14px] font-extrabold" style={{ color: selected ? APROVA.blue : APROVA.ink }}>
                          {label}
                        </span>
                        <span className="block text-[12px]" style={{ color: APROVA.inkMuted }}>{description}</span>
                      </span>
                    </button>
                  )
                })}
              </div>
            </fieldset>

            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-bold" style={{ color: APROVA.inkMuted }}>Nome completo</span>
              <input required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} style={inputStyle} autoComplete="name" />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-bold" style={{ color: APROVA.inkMuted }}>Email</span>
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} style={inputStyle} autoComplete="email" />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-bold" style={{ color: APROVA.inkMuted }}>Senha</span>
              <input required type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} style={inputStyle} autoComplete="new-password" />
            </label>

            {/* Clerk Smart CAPTCHA é montado aqui quando habilitado no dashboard */}
            <div id="clerk-captcha" />

            {error && <p className="text-[13px] font-semibold" style={{ color: APROVA.error }}>{error}</p>}

            <button
              type="submit"
              disabled={!signUp || loading}
              className="rounded-xl py-3 text-[14px] font-extrabold text-white transition-opacity disabled:opacity-60"
              style={{ background: APROVA.blue }}
            >
              {loading ? "Criando conta…" : "Criar conta"}
            </button>

            <p className="text-center text-[13px]" style={{ color: APROVA.inkMuted }}>
              Já tem conta?{" "}
              <Link href="/sign-in" className="font-bold" style={{ color: APROVA.blue }}>Entrar</Link>
            </p>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="flex flex-col gap-4">
            <p className="text-[13.5px]" style={{ color: APROVA.inkMuted }}>
              Enviamos um código de verificação para <strong style={{ color: APROVA.ink }}>{email}</strong>.
            </p>
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-bold" style={{ color: APROVA.inkMuted }}>Código de verificação</span>
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
              disabled={!signUp || loading}
              className="rounded-xl py-3 text-[14px] font-extrabold text-white transition-opacity disabled:opacity-60"
              style={{ background: APROVA.blue }}
            >
              {loading ? "Verificando…" : "Confirmar"}
            </button>
          </form>
        )}
      </div>
    </main>
  )
}
