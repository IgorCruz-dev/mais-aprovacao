"use client"

export default function ErrorBoundary({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center" style={{ background: "#F4F6FB" }}>
      <h1 className="text-xl font-black" style={{ color: "#0A0F1E" }}>Algo deu errado</h1>
      <p className="max-w-sm text-sm" style={{ color: "#5D6678" }}>
        Ocorreu um erro inesperado ao carregar esta página.
      </p>
      <button onClick={reset} className="rounded-xl px-5 py-2.5 text-sm font-bold text-white" style={{ background: "#1B4DE4" }}>
        Tentar novamente
      </button>
    </main>
  )
}
