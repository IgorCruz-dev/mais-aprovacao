import Link from "next/link"

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center" style={{ background: "#F4F6FB" }}>
      <h1 className="text-2xl font-black" style={{ color: "#0A0F1E" }}>Acesso não autorizado</h1>
      <p className="max-w-sm text-sm" style={{ color: "#5D6678" }}>
        Você não tem permissão para acessar esta área. Se acha que isso é um engano, fale com o suporte.
      </p>
      <Link href="/" className="rounded-xl px-5 py-2.5 text-sm font-bold text-white" style={{ background: "#1B4DE4" }}>
        Voltar ao início
      </Link>
    </main>
  )
}
