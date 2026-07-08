import { redirect } from "next/navigation"

export default async function ResponsavelAlunoRedirectPage({ params }: { params: Promise<{ studentId: string }> }) {
  const { studentId } = await params
  redirect(`/parent/alunos/${studentId}`)
}
