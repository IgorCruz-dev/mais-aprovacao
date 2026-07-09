"use client"

import { useState } from "react"
import { Plus, X } from "@phosphor-icons/react"
import { MOCK_STUDENTS } from "@/lib/mock-parent-data"
import {
  APROVA,
  BentoCard,
  PageHeader,
  RevealGroup,
  RevealItem,
} from "@/components/student/StudentSurface"
import { StudentSummaryCard } from "@/components/parent/ParentSurface"

export default function ParentAlunosPage() {
  const [showForm, setShowForm] = useState(false)
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    setEmail("")
    setTimeout(() => {
      setSubmitted(false)
      setShowForm(false)
    }, 3000)
  }

  return (
    <RevealGroup className="mx-auto max-w-[1240px] px-4 pt-4 pb-10 lg:px-8 lg:pt-7">
      <RevealItem>
        <PageHeader
          kicker="Área do responsável"
          title="Alunos"
          subtitle={`Você acompanha ${MOCK_STUDENTS.length} aluno${MOCK_STUDENTS.length > 1 ? "s" : ""} na plataforma.`}
          action={
            <button
              onClick={() => setShowForm((v) => !v)}
              className="flex items-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-extrabold text-white transition-transform hover:scale-[1.02]"
              style={{ background: showForm ? APROVA.inkMuted : APROVA.blue }}
            >
              {showForm ? <X size={15} weight="bold" /> : <Plus size={15} weight="bold" />}
              {showForm ? "Cancelar" : "Adicionar aluno"}
            </button>
          }
        />
      </RevealItem>

      {showForm && (
        <RevealItem>
          <BentoCard className="mb-6">
            <p className="mb-3 text-[13px] font-bold" style={{ color: APROVA.ink }}>
              Informe o email do aluno cadastrado na plataforma para solicitar o vínculo.
            </p>
            {submitted ? (
              <div className="rounded-xl px-4 py-3 text-[13px] font-semibold" style={{ background: "#E6F8F0", color: APROVA.successDeep }}>
                Solicitação enviada! A equipe verificará o vínculo em breve.
              </div>
            ) : (
              <form onSubmit={handleAdd} className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email do aluno"
                  className="flex-1 rounded-xl border px-4 py-2.5 text-[14px] outline-none focus:border-[#1B4DE4]"
                  style={{ borderColor: "#E2E6F0", color: APROVA.ink }}
                />
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-[14px] font-extrabold text-white"
                  style={{ background: APROVA.blue }}
                >
                  <Plus size={16} weight="bold" /> Solicitar vínculo
                </button>
              </form>
            )}
            <p className="mt-3 text-[12px]" style={{ color: APROVA.inkMuted }}>
              Por segurança, todo vínculo passa por verificação antes de liberar o acompanhamento.
            </p>
          </BentoCard>
        </RevealItem>
      )}

      <RevealItem>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {MOCK_STUDENTS.map((student) => (
            <StudentSummaryCard key={student.id} student={student} />
          ))}
        </div>
      </RevealItem>
    </RevealGroup>
  )
}
