import { redirect } from "next/navigation"

export default async function RevisaoSimuladoRedirectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  redirect(`/student/simulados/${id}/revisao`)
}
