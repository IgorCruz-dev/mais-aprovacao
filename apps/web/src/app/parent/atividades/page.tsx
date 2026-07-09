"use client"

import { useState } from "react"
import { MOCK_ACTIVITIES, MOCK_STUDENTS } from "@/lib/mock-parent-data"
import type { ActivityType } from "@/lib/mock-parent-data"
import {
  APROVA,
  BentoCard,
  Chip,
  ChipRow,
  PageHeader,
  RevealGroup,
  RevealItem,
  SectionTitle,
} from "@/components/student/StudentSurface"
import { ActivityTimelineItem } from "@/components/parent/ParentSurface"

type StudentFilter = "todos" | string
type TypeFilter = "todos" | ActivityType

const TYPE_LABELS: Record<ActivityType, string> = {
  aula: "Aulas",
  questao: "Questões",
  simulado: "Simulados",
  redacao: "Redações",
  checkin: "Check-ins",
}

export default function ParentAtividadesPage() {
  const [studentFilter, setStudentFilter] = useState<StudentFilter>("todos")
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("todos")

  const filtered = MOCK_ACTIVITIES.filter((a) => {
    const byStudent = studentFilter === "todos" || a.studentId === studentFilter
    const byType = typeFilter === "todos" || a.type === typeFilter
    return byStudent && byType
  })

  const concluded = filtered.filter((a) => a.status === "concluido").length
  const pending = filtered.filter((a) => a.status === "pendente").length
  const overdue = filtered.filter((a) => a.status === "atrasado").length

  return (
    <RevealGroup className="mx-auto max-w-[1240px] px-4 pt-4 pb-10 lg:px-8 lg:pt-7">
      <RevealItem>
        <PageHeader
          kicker="Área do responsável"
          title="Atividades"
          subtitle="Acompanhe o que seus alunos fizeram na plataforma."
        />
      </RevealItem>

      {/* Filters */}
      <RevealItem className="mb-4 flex flex-col gap-2">
        <ChipRow>
          <Chip active={studentFilter === "todos"} onClick={() => setStudentFilter("todos")}>
            Todos os alunos
          </Chip>
          {MOCK_STUDENTS.map((s) => (
            <Chip key={s.id} active={studentFilter === s.id} onClick={() => setStudentFilter(s.id)}>
              {s.name.split(" ")[0]}
            </Chip>
          ))}
        </ChipRow>
        <ChipRow>
          <Chip active={typeFilter === "todos"} onClick={() => setTypeFilter("todos")}>
            Todos os tipos
          </Chip>
          {(Object.keys(TYPE_LABELS) as ActivityType[]).map((t) => (
            <Chip key={t} active={typeFilter === t} onClick={() => setTypeFilter(t)}>
              {TYPE_LABELS[t]}
            </Chip>
          ))}
        </ChipRow>
      </RevealItem>

      {/* Summary */}
      <RevealItem>
        <div className="mb-4 grid grid-cols-3 gap-3">
          {[
            { label: "Concluídas", value: concluded, color: APROVA.successDeep, bg: "#E6F8F0" },
            { label: "Pendentes",  value: pending,   color: "#B45309",           bg: "#FFF3DA" },
            { label: "Atrasadas",  value: overdue,   color: APROVA.error,        bg: "#FDECEC" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl px-3 py-3 text-center" style={{ background: s.bg }}>
              <p className="font-display text-[24px] font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: s.color }}>{s.label}</p>
            </div>
          ))}
        </div>
      </RevealItem>

      {/* Timeline */}
      <RevealItem>
        <BentoCard>
          <SectionTitle
            title={`${filtered.length} atividade${filtered.length !== 1 ? "s" : ""}`}
            kicker="Linha do tempo"
          />
          {filtered.length === 0 ? (
            <p className="py-4 text-center text-[13px]" style={{ color: APROVA.inkMuted }}>
              Nenhuma atividade encontrada com os filtros selecionados.
            </p>
          ) : (
            filtered.map((act, i) => (
              <ActivityTimelineItem
                key={act.id}
                type={act.type}
                desc={act.desc}
                date={act.date}
                status={act.status}
                detail={act.detail}
                studentName={act.studentName}
                showStudent={studentFilter === "todos"}
                isFirst={i === 0}
              />
            ))
          )}
        </BentoCard>
      </RevealItem>
    </RevealGroup>
  )
}
