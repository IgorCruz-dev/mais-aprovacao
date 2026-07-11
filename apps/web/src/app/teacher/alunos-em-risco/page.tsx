"use client"

import { useMemo, useState } from "react"
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  FileText,
  MessageCircle,
  TrendingDown,
  UserRoundCheck,
  WifiOff,
} from "lucide-react"
import { Button } from "@mais-aprovacao/ui"
import {
  APROVA,
  Avatar,
  BentoCard,
  PageHeader,
  RevealGroup,
  RevealItem,
  SectionTitle,
} from "@/components/teacher/TeacherSurface"

type RiskLevel = "medio" | "alto"
type RiskCategory = "frequencia" | "nota" | "acesso" | "redacao"

type RiskStudent = {
  id: string
  name: string
  initial: string
  color: string
  turma: string
  riskLevel: RiskLevel
  category: RiskCategory
  reason: string
  summary: string
  lastActivity: string
  missedEssays: number
  attendancePct: number
  avgScore: number
  engagement: number[]
  grades: { label: string; score: number }[]
  suggestedAction: string
}

const RISK_STUDENTS: RiskStudent[] = [
  {
    id: "stu-risk-01",
    name: "Gabriel Pereira",
    initial: "G",
    color: "#0FA968",
    turma: "ENEM Extensivo",
    riskLevel: "alto",
    category: "acesso",
    reason: "6 dias sem acessar",
    summary: "Parou de entrar na plataforma após queda no último simulado.",
    lastActivity: "Há 6 dias - abriu revisão de redação por 4 min",
    missedEssays: 3,
    attendancePct: 52,
    avgScore: 38,
    engagement: [58, 52, 47, 39, 31, 24],
    grades: [{ label: "S1", score: 560 }, { label: "R1", score: 520 }, { label: "S2", score: 470 }, { label: "R2", score: 420 }],
    suggestedAction: "Enviar mensagem curta e oferecer plantão individual.",
  },
  {
    id: "stu-risk-02",
    name: "Beatriz Santos",
    initial: "B",
    color: "#6C4BD9",
    turma: "ENEM Extensivo",
    riskLevel: "medio",
    category: "redacao",
    reason: "2 redações não entregues",
    summary: "Mantém acesso regular, mas atrasou as duas últimas propostas de redação.",
    lastActivity: "Ontem, 20h15 - respondeu 18 questões",
    missedEssays: 2,
    attendancePct: 73,
    avgScore: 59,
    engagement: [66, 68, 62, 59, 55, 51],
    grades: [{ label: "R1", score: 640 }, { label: "S1", score: 610 }, { label: "R2", score: 580 }, { label: "S2", score: 590 }],
    suggestedAction: "Combinar uma entrega parcial até amanhã.",
  },
  {
    id: "stu-risk-03",
    name: "Larissa Almeida",
    initial: "L",
    color: "#D97706",
    turma: "UFU Intensivo",
    riskLevel: "alto",
    category: "frequencia",
    reason: "Frequência caiu para 48%",
    summary: "Faltou a 4 das últimas 6 aulas e não assistiu às gravações completas.",
    lastActivity: "Há 3 dias - assistiu 12 min de aula gravada",
    missedEssays: 1,
    attendancePct: 48,
    avgScore: 61,
    engagement: [74, 69, 61, 52, 45, 38],
    grades: [{ label: "S1", score: 680 }, { label: "R1", score: 620 }, { label: "S2", score: 600 }, { label: "R2", score: 560 }],
    suggestedAction: "Verificar barreira de horário antes de cobrar reposição.",
  },
  {
    id: "stu-risk-04",
    name: "Rafael Costa",
    initial: "R",
    color: "#1B4DE4",
    turma: "UFU Intensivo",
    riskLevel: "medio",
    category: "nota",
    reason: "Nota média caiu 14 pontos",
    summary: "Engajamento ainda estável, mas desempenho caiu em redação e matemática.",
    lastActivity: "Hoje, 08h30 - abriu lista de revisão",
    missedEssays: 0,
    attendancePct: 81,
    avgScore: 62,
    engagement: [72, 74, 71, 69, 66, 65],
    grades: [{ label: "S1", score: 720 }, { label: "R1", score: 690 }, { label: "S2", score: 650 }, { label: "R2", score: 610 }],
    suggestedAction: "Enviar comentário sobre a queda e sugerir revisão guiada.",
  },
  {
    id: "stu-risk-05",
    name: "Camila Rocha",
    initial: "C",
    color: "#BE185D",
    turma: "UEG Semi-Extensivo",
    riskLevel: "alto",
    category: "redacao",
    reason: "3 redações pendentes",
    summary: "A aluna participa das aulas, mas evita entregas avaliativas.",
    lastActivity: "Hoje, 11h02 - viu comunicado da turma",
    missedEssays: 3,
    attendancePct: 86,
    avgScore: 55,
    engagement: [70, 67, 64, 57, 50, 44],
    grades: [{ label: "R1", score: 600 }, { label: "S1", score: 620 }, { label: "R2", score: 520 }, { label: "S2", score: 540 }],
    suggestedAction: "Propor envio de rascunho sem nota para reduzir bloqueio.",
  },
  {
    id: "stu-risk-06",
    name: "Pedro Henrique",
    initial: "P",
    color: "#0891B2",
    turma: "ENEM Extensivo",
    riskLevel: "medio",
    category: "acesso",
    reason: "4 dias sem acessar",
    summary: "Reduziu frequência de estudo após duas semanas de bom ritmo.",
    lastActivity: "Há 4 dias - iniciou simulado e não concluiu",
    missedEssays: 1,
    attendancePct: 77,
    avgScore: 66,
    engagement: [81, 78, 76, 63, 54, 49],
    grades: [{ label: "S1", score: 700 }, { label: "R1", score: 680 }, { label: "S2", score: 650 }, { label: "R2", score: 640 }],
    suggestedAction: "Perguntar se houve problema com rotina ou acesso.",
  },
  {
    id: "stu-risk-07",
    name: "Mariana Lopes",
    initial: "M",
    color: "#F2600C",
    turma: "UEG Semi-Extensivo",
    riskLevel: "medio",
    category: "frequencia",
    reason: "Frequência abaixo da turma",
    summary: "A frequência caiu, mas as entregas ainda estão em dia.",
    lastActivity: "Ontem, 17h48 - enviou redação",
    missedEssays: 0,
    attendancePct: 64,
    avgScore: 72,
    engagement: [76, 72, 70, 68, 61, 58],
    grades: [{ label: "R1", score: 720 }, { label: "S1", score: 740 }, { label: "R2", score: 700 }, { label: "S2", score: 690 }],
    suggestedAction: "Reforçar presença nas aulas finais da turma.",
  },
  {
    id: "stu-risk-08",
    name: "Thiago Nunes",
    initial: "T",
    color: "#7C3AED",
    turma: "UFU Intensivo",
    riskLevel: "alto",
    category: "nota",
    reason: "Duas notas abaixo de 500",
    summary: "Queda concentrada em interpretação e repertório de redação.",
    lastActivity: "Há 2 dias - concluiu 6 questões",
    missedEssays: 1,
    attendancePct: 68,
    avgScore: 49,
    engagement: [69, 64, 58, 51, 45, 39],
    grades: [{ label: "S1", score: 610 }, { label: "R1", score: 540 }, { label: "S2", score: 480 }, { label: "R2", score: 460 }],
    suggestedAction: "Indicar uma correção comentada e acompanhar próxima entrega.",
  },
]

const CATEGORY_META: Record<RiskCategory, { label: string; Icon: typeof TrendingDown }> = {
  frequencia: { label: "Frequência", Icon: Clock3 },
  nota: { label: "Desempenho", Icon: TrendingDown },
  acesso: { label: "Acesso", Icon: WifiOff },
  redacao: { label: "Redações", Icon: FileText },
}

const RISK_META: Record<RiskLevel, { label: string; color: string; bg: string; border: string }> = {
  medio: { label: "Risco médio", color: "#B45309", bg: "#FFF7E6", border: "#F8D391" },
  alto: { label: "Risco alto", color: APROVA.error, bg: "#FEF0F0", border: "#F7B8B8" },
}

function EngagementChart({ data, color }: { data: number[]; color: string }) {
  const points = data.map((value, index) => ({
    x: 14 + index * (172 / Math.max(1, data.length - 1)),
    y: 86 - (value / 100) * 66,
    value,
  }))
  const path = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ")

  return (
    <div className="rounded-lg bg-white p-3 ring-1 ring-[#EEF1F7]">
      <svg viewBox="0 0 200 104" className="h-28 w-full" role="img" aria-label="Queda de engajamento nas últimas semanas">
        <path d="M14 86 H186" stroke="#E8ECF4" strokeWidth="1" />
        <path d="M14 53 H186" stroke="#E8ECF4" strokeWidth="1" />
        <path d="M14 20 H186" stroke="#E8ECF4" strokeWidth="1" />
        <path d={path} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((point, index) => (
          <g key={index}>
            <circle cx={point.x} cy={point.y} r="4" fill="#fff" stroke={color} strokeWidth="2" />
            <text x={point.x} y="100" textAnchor="middle" className="fill-slate-500 text-[9px] font-bold">S{index + 1}</text>
          </g>
        ))}
      </svg>
    </div>
  )
}

function GradesStrip({ grades }: { grades: RiskStudent["grades"] }) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {grades.map((grade) => (
        <div key={grade.label} className="rounded-lg bg-[#F6F7FB] px-2 py-2 text-center">
          <p className="text-[10px] font-bold" style={{ color: APROVA.inkMuted }}>{grade.label}</p>
          <p className="mt-0.5 text-[15px] font-extrabold tabular" style={{ color: grade.score < 500 ? APROVA.error : grade.score < 620 ? "#B45309" : APROVA.ink }}>
            {grade.score}
          </p>
        </div>
      ))}
    </div>
  )
}

function RiskStudentCard({
  student,
  expanded,
  contacted,
  onToggle,
  onContacted,
}: {
  student: RiskStudent
  expanded: boolean
  contacted: boolean
  onToggle: () => void
  onContacted: () => void
}) {
  const category = CATEGORY_META[student.category]
  const risk = RISK_META[student.riskLevel]
  const Icon = category.Icon

  return (
    <article className="overflow-hidden rounded-xl bg-white ring-1 ring-[#EEF1F7]">
      <button onClick={onToggle} className="w-full px-4 py-4 text-left transition-colors hover:bg-[#FAFBFE]">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <Avatar initial={student.initial} color={student.color} size={40} />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-[14px] font-extrabold" style={{ color: APROVA.ink }}>{student.name}</h2>
                <span className="text-[11px] font-semibold" style={{ color: APROVA.inkMuted }}>{student.turma}</span>
              </div>
              <p className="mt-1 text-[12.5px] leading-5" style={{ color: APROVA.inkMuted }}>{student.summary}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <span className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-extrabold" style={{ background: "#F6F7FB", color: APROVA.ink }}>
              <Icon size={14} /> {category.label}: {student.reason}
            </span>
            <span className="inline-flex rounded-lg px-2.5 py-1 text-[11px] font-extrabold" style={{ background: risk.bg, color: risk.color, border: `1px solid ${risk.border}` }}>
              {risk.label}
            </span>
            {contacted && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-extrabold text-emerald-700">
                <CheckCircle2 size={13} /> contatado
              </span>
            )}
          </div>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-[#EEF1F7] px-4 py-4">
          <div className="grid gap-4 xl:grid-cols-[1fr_1fr_280px]">
            <div>
              <p className="mb-2 text-[12px] font-extrabold" style={{ color: APROVA.ink }}>Engajamento nas últimas 6 semanas</p>
              <EngagementChart data={student.engagement} color={risk.color} />
            </div>

            <div>
              <p className="mb-2 text-[12px] font-extrabold" style={{ color: APROVA.ink }}>Histórico recente de notas</p>
              <GradesStrip grades={student.grades} />
              <div className="mt-3 grid grid-cols-3 gap-2">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.1em]" style={{ color: APROVA.inkMuted }}>Média</p>
                  <p className="text-[18px] font-extrabold tabular" style={{ color: student.avgScore < 55 ? APROVA.error : APROVA.ink }}>{student.avgScore}%</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.1em]" style={{ color: APROVA.inkMuted }}>Freq.</p>
                  <p className="text-[18px] font-extrabold tabular" style={{ color: student.attendancePct < 60 ? APROVA.error : "#B45309" }}>{student.attendancePct}%</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.1em]" style={{ color: APROVA.inkMuted }}>Redações</p>
                  <p className="text-[18px] font-extrabold tabular" style={{ color: student.missedEssays > 1 ? APROVA.error : APROVA.ink }}>{student.missedEssays} pend.</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-[#FAFBFE] p-3">
              <p className="mb-2 flex items-center gap-2 text-[12px] font-extrabold" style={{ color: APROVA.ink }}>
                <UserRoundCheck size={15} /> Próxima ação
              </p>
              <p className="text-[12px] leading-5" style={{ color: APROVA.inkMuted }}>{student.suggestedAction}</p>
              <div className="mt-3 rounded-lg bg-white p-2 ring-1 ring-[#EEF1F7]">
                <p className="text-[10px] font-bold uppercase tracking-[0.1em]" style={{ color: APROVA.inkMuted }}>Última atividade</p>
                <p className="mt-1 text-[12px] font-bold leading-5" style={{ color: APROVA.ink }}>{student.lastActivity}</p>
              </div>
              <div className="mt-3 flex flex-col gap-2">
                <Button className="h-9 gap-2 rounded-lg bg-[#0A0F1E] text-white hover:bg-[#111827]">
                  <MessageCircle size={15} /> Enviar mensagem
                </Button>
                <Button
                  variant="secondary"
                  onClick={(event) => {
                    event.stopPropagation()
                    onContacted()
                  }}
                  className="h-9 gap-2 rounded-lg border border-[#E2E6EE] bg-white text-slate-900 hover:bg-slate-50"
                >
                  <CheckCircle2 size={15} /> Marcar como contatado
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </article>
  )
}

export default function TeacherRiskStudentsPage() {
  const [expandedId, setExpandedId] = useState(RISK_STUDENTS[0]?.id ?? "")
  const [contactedIds, setContactedIds] = useState<string[]>([])

  const totals = useMemo(() => {
    const high = RISK_STUDENTS.filter((student) => student.riskLevel === "alto").length
    const medium = RISK_STUDENTS.filter((student) => student.riskLevel === "medio").length
    const pendingEssays = RISK_STUDENTS.reduce((sum, student) => sum + student.missedEssays, 0)
    return { high, medium, pendingEssays }
  }, [])

  return (
    <RevealGroup className="mx-auto max-w-[1240px] px-4 pt-4 pb-10 lg:px-8 lg:pt-7">
      <RevealItem>
        <PageHeader
          kicker="Acompanhamento"
          title="Alunos em risco"
          subtitle="Lista acionável dos alunos das suas turmas que pedem uma intervenção próxima."
        />
      </RevealItem>

      <RevealItem className="mb-5">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <BentoCard className="p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: APROVA.inkMuted }}>Alunos sinalizados</p>
            <p className="mt-1 font-display text-[30px] font-bold tabular" style={{ color: APROVA.ink }}>{RISK_STUDENTS.length}</p>
          </BentoCard>
          <BentoCard className="p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: APROVA.inkMuted }}>Risco alto</p>
            <p className="mt-1 font-display text-[30px] font-bold tabular" style={{ color: APROVA.error }}>{totals.high}</p>
          </BentoCard>
          <BentoCard className="p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: APROVA.inkMuted }}>Risco médio</p>
            <p className="mt-1 font-display text-[30px] font-bold tabular" style={{ color: "#B45309" }}>{totals.medium}</p>
          </BentoCard>
          <BentoCard className="p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: APROVA.inkMuted }}>Redações pendentes</p>
            <p className="mt-1 font-display text-[30px] font-bold tabular" style={{ color: APROVA.ink }}>{totals.pendingEssays}</p>
          </BentoCard>
        </div>
      </RevealItem>

      <RevealItem>
        <BentoCard className="p-4 lg:p-5">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <SectionTitle title="Fila de cuidado" kicker="Prioridade de contato" />
            <div className="inline-flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-[12px] font-bold text-amber-800">
              <AlertTriangle size={15} />
              Priorize conversa individual antes de medidas formais
            </div>
          </div>
          <div className="space-y-3">
            {RISK_STUDENTS.map((student) => (
              <RiskStudentCard
                key={student.id}
                student={student}
                expanded={expandedId === student.id}
                contacted={contactedIds.includes(student.id)}
                onToggle={() => setExpandedId((current) => current === student.id ? "" : student.id)}
                onContacted={() => setContactedIds((current) => current.includes(student.id) ? current : [...current, student.id])}
              />
            ))}
          </div>
        </BentoCard>
      </RevealItem>
    </RevealGroup>
  )
}
