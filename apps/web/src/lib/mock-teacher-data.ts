// Mock data for the teacher panel — all data is static/demo

// ─── Types ────────────────────────────────────────────────────────────────────

export type ClassStatus = "ativa" | "atencao" | "encerrando"
export type StudentRisk = "otimo" | "atencao" | "risco"
export type AulaStatus = "planejada" | "ao_vivo" | "concluida" | "cancelada"
export type EssayStatus = "pendente" | "em_correcao" | "concluida"
export type SimuladoStatus = "agendado" | "em_andamento" | "concluido"
export type AgendaItemType = "aula" | "simulado" | "reuniao" | "correcao" | "plantao"
export type ComunicadoCategory = "pedagogico" | "administrativo" | "evento" | "urgente"
export type InsightTone = "info" | "warning" | "success"

// ─── IDs constantes ───────────────────────────────────────────────────────────

export const TURMA_ID_ENEM = "turma-enem"
export const TURMA_ID_UFU  = "turma-ufu"
export const TURMA_ID_UEG  = "turma-ueg"

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface Turma {
  id: string
  nome: string
  status: ClassStatus
  course: string
  periodoLabel: string
  totalAlunos: number
  alunosOtimo: number
  alunosAtencao: number
  alunosRisco: number
  mediaGeral: number
  frequenciaMedia: number
  progressoCurso: number
  redacoesPendentes: number
  proximaAula: string | null
}

export interface SubjectPerformance {
  subject: string
  pct: number
  forte: boolean
  trend: "up" | "down" | "stable"
}

export interface TeacherStudent {
  id: string
  name: string
  initial: string
  color: string
  turmaId: string
  turmaNome: string
  riskLevel: StudentRisk
  mediaGeral: number
  frequencia: number
  streak: number
  redacoesEntregues: number
  redacoesPendentes: number
  simuladosFeitos: number
  questoesRespondidas: number
  lastActivityAt: string
  weeklyProgress: number[]
  activityDays: boolean[]
  subjectPerformance: SubjectPerformance[]
  insights: string[]
}

export interface Aula {
  id: string
  title: string
  subject: string
  turmaId: string
  turmaNome: string
  status: AulaStatus
  scheduledAt: string
  durationMin: number
  attendeesExpected: number
  attendeesCount: number | null
  attendancePct: number | null
  description: string
}

export interface EssayCompetency {
  label: string
  name: string
  score: number
}

export interface Redacao {
  id: string
  studentId: string
  studentName: string
  studentInitial: string
  turmaId: string
  turmaNome: string
  status: EssayStatus
  theme: string
  submittedAt: string
  correctedAt: string | null
  slaHours: number
  elapsedHours: number
  overSla: boolean
  score: number | null
  competencies: EssayCompetency[] | null
  feedback: string | null
  priority: "alta" | "normal"
}

export interface Simulado {
  id: string
  title: string
  turmaIds: string[]
  status: SimuladoStatus
  scheduledAt: string
  totalAlunos: number
  participantes: number | null
  participacaoPct: number | null
  mediaGeral: number | null
  mediaBySubject: Array<{ subject: string; avg: number }> | null
  topScore: number | null
  naoPraticiparam: string[]
}

export interface Comunicado {
  id: string
  category: ComunicadoCategory
  title: string
  body: string
  sentAt: string
  turmasIds: string[] | "all"
  read: boolean
  authorName: string
  fromCoordination: boolean
}

export interface AgendaItem {
  id: string
  type: AgendaItemType
  title: string
  date: string
  time: string
  durationMin: number
  turmaNome: string | null
  notes: string | null
  status: "pendente" | "concluido" | "cancelado"
}

export interface TeacherInsight {
  id: string
  tone: InsightTone
  text: string
  href: string | null
  actionLabel: string | null
}

// ─── TEACHER ──────────────────────────────────────────────────────────────────

export const TEACHER = {
  name: "Marina Alves",
  initial: "M",
  email: "marina.alves@mais-aprovacao.com.br",
  role: "teacher" as const,
  subjects: ["Redação", "Língua Portuguesa"],
  totalTurmas: 3,
  totalAlunos: 38,
}

// ─── TURMAS ───────────────────────────────────────────────────────────────────

export const TURMAS: Turma[] = [
  {
    id: TURMA_ID_ENEM,
    nome: "ENEM Extensivo",
    status: "ativa",
    course: "ENEM Extensivo 2026",
    periodoLabel: "Fev – Nov 2026",
    totalAlunos: 28,
    alunosOtimo: 14,
    alunosAtencao: 9,
    alunosRisco: 5,
    mediaGeral: 72,
    frequenciaMedia: 84,
    progressoCurso: 58,
    redacoesPendentes: 8,
    proximaAula: "Qui, 10 Jul, 19h",
  },
  {
    id: TURMA_ID_UFU,
    nome: "UFU Intensivo",
    status: "atencao",
    course: "UFU Intensivo 2026",
    periodoLabel: "Mai – Nov 2026",
    totalAlunos: 21,
    alunosOtimo: 7,
    alunosAtencao: 8,
    alunosRisco: 6,
    mediaGeral: 61,
    frequenciaMedia: 71,
    progressoCurso: 42,
    redacoesPendentes: 5,
    proximaAula: "Sex, 11 Jul, 14h",
  },
  {
    id: TURMA_ID_UEG,
    nome: "UEG Semi-Extensivo",
    status: "encerrando",
    course: "UEG Semi-Extensivo 2026",
    periodoLabel: "Mar – Ago 2026",
    totalAlunos: 14,
    alunosOtimo: 9,
    alunosAtencao: 3,
    alunosRisco: 2,
    mediaGeral: 78,
    frequenciaMedia: 88,
    progressoCurso: 85,
    redacoesPendentes: 2,
    proximaAula: "Sáb, 12 Jul, 09h",
  },
]

// ─── STUDENTS ─────────────────────────────────────────────────────────────────

export const TEACHER_STUDENTS: TeacherStudent[] = [
  // ── ENEM Extensivo ──
  {
    id: "stu-01", name: "Lucas Oliveira", initial: "L", color: "#1B4DE4",
    turmaId: TURMA_ID_ENEM, turmaNome: "ENEM Extensivo",
    riskLevel: "otimo", mediaGeral: 81, frequencia: 94, streak: 12,
    redacoesEntregues: 6, redacoesPendentes: 0, simuladosFeitos: 4, questoesRespondidas: 320,
    lastActivityAt: "Hoje, 14h22", weeklyProgress: [60, 70, 75, 80, 78, 82, 81],
    activityDays: [true, true, true, false, true, true, true],
    subjectPerformance: [
      { subject: "Redação", pct: 88, forte: true, trend: "up" },
      { subject: "Literatura", pct: 76, forte: true, trend: "stable" },
      { subject: "Matemática", pct: 65, forte: false, trend: "up" },
      { subject: "Biologia", pct: 72, forte: false, trend: "stable" },
    ],
    insights: ["Excelente progresso nas últimas 2 semanas.", "Destaque na competência 3 de redação."],
  },
  {
    id: "stu-02", name: "Beatriz Santos", initial: "B", color: "#6C4BD9",
    turmaId: TURMA_ID_ENEM, turmaNome: "ENEM Extensivo",
    riskLevel: "atencao", mediaGeral: 59, frequencia: 73, streak: 3,
    redacoesEntregues: 3, redacoesPendentes: 2, simuladosFeitos: 3, questoesRespondidas: 140,
    lastActivityAt: "Ontem, 20h15", weeklyProgress: [55, 52, 58, 60, 57, 62, 59],
    activityDays: [true, false, true, true, false, true, false],
    subjectPerformance: [
      { subject: "Redação", pct: 62, forte: false, trend: "stable" },
      { subject: "Literatura", pct: 70, forte: true, trend: "up" },
      { subject: "Matemática", pct: 48, forte: false, trend: "down" },
      { subject: "Biologia", pct: 58, forte: false, trend: "stable" },
    ],
    insights: ["Frequência abaixo de 75% — verificar motivação.", "Matemática com queda nas últimas semanas."],
  },
  {
    id: "stu-03", name: "Gabriel Pereira", initial: "G", color: "#0FA968",
    turmaId: TURMA_ID_ENEM, turmaNome: "ENEM Extensivo",
    riskLevel: "risco", mediaGeral: 38, frequencia: 52, streak: 0,
    redacoesEntregues: 1, redacoesPendentes: 3, simuladosFeitos: 1, questoesRespondidas: 45,
    lastActivityAt: "Há 6 dias", weeklyProgress: [42, 40, 38, 35, 37, 38, 38],
    activityDays: [false, false, true, false, false, false, false],
    subjectPerformance: [
      { subject: "Redação", pct: 35, forte: false, trend: "down" },
      { subject: "Literatura", pct: 45, forte: false, trend: "down" },
      { subject: "Matemática", pct: 40, forte: false, trend: "stable" },
      { subject: "Biologia", pct: 32, forte: false, trend: "down" },
    ],
    insights: ["Aluno sem atividade há 6 dias — contato urgente.", "Desempenho geral abaixo de 40%."],
  },
  {
    id: "stu-04", name: "Larissa Costa", initial: "L", color: "#D97706",
    turmaId: TURMA_ID_ENEM, turmaNome: "ENEM Extensivo",
    riskLevel: "otimo", mediaGeral: 85, frequencia: 97, streak: 21,
    redacoesEntregues: 7, redacoesPendentes: 0, simuladosFeitos: 4, questoesRespondidas: 410,
    lastActivityAt: "Hoje, 11h08", weeklyProgress: [80, 82, 84, 83, 85, 86, 85],
    activityDays: [true, true, true, true, true, true, true],
    subjectPerformance: [
      { subject: "Redação", pct: 92, forte: true, trend: "up" },
      { subject: "Literatura", pct: 84, forte: true, trend: "stable" },
      { subject: "Matemática", pct: 78, forte: true, trend: "up" },
      { subject: "Biologia", pct: 82, forte: true, trend: "stable" },
    ],
    insights: ["Melhor desempenho da turma. Streak de 21 dias.", "Candidata ao top 3 do ranking mensal."],
  },
  {
    id: "stu-05", name: "Matheus Rocha", initial: "M", color: "#F2600C",
    turmaId: TURMA_ID_ENEM, turmaNome: "ENEM Extensivo",
    riskLevel: "atencao", mediaGeral: 63, frequencia: 78, streak: 5,
    redacoesEntregues: 4, redacoesPendentes: 1, simuladosFeitos: 3, questoesRespondidas: 195,
    lastActivityAt: "Ontem, 18h40", weeklyProgress: [58, 60, 65, 63, 62, 64, 63],
    activityDays: [true, true, false, true, false, true, true],
    subjectPerformance: [
      { subject: "Redação", pct: 68, forte: false, trend: "up" },
      { subject: "Literatura", pct: 72, forte: true, trend: "stable" },
      { subject: "Matemática", pct: 52, forte: false, trend: "stable" },
      { subject: "Biologia", pct: 60, forte: false, trend: "up" },
    ],
    insights: ["Evolução positiva em Redação.", "Matemática precisa de reforço."],
  },
  // ── UFU Intensivo ──
  {
    id: "stu-06", name: "Camila Almeida", initial: "C", color: "#1B4DE4",
    turmaId: TURMA_ID_UFU, turmaNome: "UFU Intensivo",
    riskLevel: "otimo", mediaGeral: 74, frequencia: 88, streak: 9,
    redacoesEntregues: 5, redacoesPendentes: 0, simuladosFeitos: 3, questoesRespondidas: 260,
    lastActivityAt: "Hoje, 09h55", weeklyProgress: [68, 70, 72, 73, 74, 73, 74],
    activityDays: [true, true, true, true, true, false, true],
    subjectPerformance: [
      { subject: "Redação", pct: 78, forte: true, trend: "up" },
      { subject: "Biologia", pct: 72, forte: true, trend: "stable" },
      { subject: "Química", pct: 65, forte: false, trend: "up" },
      { subject: "Matemática", pct: 70, forte: true, trend: "stable" },
    ],
    insights: ["Consistente nas avaliações.", "Forte em ciências da natureza."],
  },
  {
    id: "stu-07", name: "Rafael Lima", initial: "R", color: "#6C4BD9",
    turmaId: TURMA_ID_UFU, turmaNome: "UFU Intensivo",
    riskLevel: "risco", mediaGeral: 42, frequencia: 58, streak: 1,
    redacoesEntregues: 2, redacoesPendentes: 2, simuladosFeitos: 1, questoesRespondidas: 80,
    lastActivityAt: "Há 4 dias", weeklyProgress: [48, 45, 43, 40, 42, 42, 42],
    activityDays: [false, false, false, false, true, false, false],
    subjectPerformance: [
      { subject: "Redação", pct: 40, forte: false, trend: "down" },
      { subject: "Biologia", pct: 45, forte: false, trend: "down" },
      { subject: "Química", pct: 38, forte: false, trend: "stable" },
      { subject: "Matemática", pct: 44, forte: false, trend: "stable" },
    ],
    insights: ["Frequência crítica — 58%. Aulas perdidas frequentemente.", "Desempenho abaixo da média da turma."],
  },
  {
    id: "stu-08", name: "Juliana Ferreira", initial: "J", color: "#0FA968",
    turmaId: TURMA_ID_UFU, turmaNome: "UFU Intensivo",
    riskLevel: "atencao", mediaGeral: 58, frequencia: 74, streak: 4,
    redacoesEntregues: 3, redacoesPendentes: 2, simuladosFeitos: 2, questoesRespondidas: 150,
    lastActivityAt: "Ontem, 21h30", weeklyProgress: [54, 56, 58, 57, 59, 60, 58],
    activityDays: [true, false, true, true, true, false, false],
    subjectPerformance: [
      { subject: "Redação", pct: 60, forte: false, trend: "up" },
      { subject: "Biologia", pct: 62, forte: false, trend: "stable" },
      { subject: "Química", pct: 50, forte: false, trend: "down" },
      { subject: "Matemática", pct: 58, forte: false, trend: "stable" },
    ],
    insights: ["Evolução lenta mas constante.", "Redações enviadas com atraso recorrente."],
  },
  {
    id: "stu-09", name: "Pedro Gomes", initial: "P", color: "#D97706",
    turmaId: TURMA_ID_UFU, turmaNome: "UFU Intensivo",
    riskLevel: "otimo", mediaGeral: 79, frequencia: 91, streak: 14,
    redacoesEntregues: 5, redacoesPendentes: 0, simuladosFeitos: 3, questoesRespondidas: 290,
    lastActivityAt: "Hoje, 07h45", weeklyProgress: [72, 75, 77, 78, 79, 80, 79],
    activityDays: [true, true, true, true, true, false, true],
    subjectPerformance: [
      { subject: "Redação", pct: 82, forte: true, trend: "up" },
      { subject: "Biologia", pct: 80, forte: true, trend: "stable" },
      { subject: "Química", pct: 74, forte: true, trend: "up" },
      { subject: "Matemática", pct: 76, forte: true, trend: "stable" },
    ],
    insights: ["Top 3 da turma UFU.", "Evolução excelente nas últimas 4 semanas."],
  },
  // ── UEG Semi-Extensivo ──
  {
    id: "stu-10", name: "Amanda Ribeiro", initial: "A", color: "#1B4DE4",
    turmaId: TURMA_ID_UEG, turmaNome: "UEG Semi-Extensivo",
    riskLevel: "otimo", mediaGeral: 82, frequencia: 96, streak: 18,
    redacoesEntregues: 8, redacoesPendentes: 0, simuladosFeitos: 5, questoesRespondidas: 380,
    lastActivityAt: "Hoje, 10h33", weeklyProgress: [76, 78, 80, 81, 82, 83, 82],
    activityDays: [true, true, true, true, true, true, false],
    subjectPerformance: [
      { subject: "Redação", pct: 90, forte: true, trend: "up" },
      { subject: "Literatura", pct: 85, forte: true, trend: "stable" },
      { subject: "Sociologia", pct: 78, forte: true, trend: "up" },
      { subject: "Filosofia", pct: 75, forte: true, trend: "stable" },
    ],
    insights: ["Melhor desempenho geral da UEG.", "Redação com nota máxima no último simulado."],
  },
  {
    id: "stu-11", name: "Vitor Carvalho", initial: "V", color: "#F2600C",
    turmaId: TURMA_ID_UEG, turmaNome: "UEG Semi-Extensivo",
    riskLevel: "atencao", mediaGeral: 65, frequencia: 80, streak: 6,
    redacoesEntregues: 5, redacoesPendentes: 1, simuladosFeitos: 4, questoesRespondidas: 220,
    lastActivityAt: "Ontem, 22h10", weeklyProgress: [60, 62, 64, 63, 65, 67, 65],
    activityDays: [true, true, false, true, true, false, true],
    subjectPerformance: [
      { subject: "Redação", pct: 70, forte: true, trend: "up" },
      { subject: "Literatura", pct: 72, forte: true, trend: "stable" },
      { subject: "Sociologia", pct: 55, forte: false, trend: "stable" },
      { subject: "Filosofia", pct: 60, forte: false, trend: "up" },
    ],
    insights: ["Boa evolução, mas Sociologia abaixo da média.", "Redação com progresso consistente."],
  },
  {
    id: "stu-12", name: "Isabela Souza", initial: "I", color: "#6C4BD9",
    turmaId: TURMA_ID_UEG, turmaNome: "UEG Semi-Extensivo",
    riskLevel: "risco", mediaGeral: 45, frequencia: 61, streak: 0,
    redacoesEntregues: 2, redacoesPendentes: 2, simuladosFeitos: 2, questoesRespondidas: 95,
    lastActivityAt: "Há 5 dias", weeklyProgress: [50, 48, 46, 44, 45, 45, 45],
    activityDays: [false, false, false, true, false, false, false],
    subjectPerformance: [
      { subject: "Redação", pct: 42, forte: false, trend: "down" },
      { subject: "Literatura", pct: 50, forte: false, trend: "stable" },
      { subject: "Sociologia", pct: 45, forte: false, trend: "down" },
      { subject: "Filosofia", pct: 42, forte: false, trend: "stable" },
    ],
    insights: ["Frequência crítica — 61%.", "Desempenho em queda nas últimas 3 semanas."],
  },
  {
    id: "stu-13", name: "Thiago Martins", initial: "T", color: "#0FA968",
    turmaId: TURMA_ID_UEG, turmaNome: "UEG Semi-Extensivo",
    riskLevel: "otimo", mediaGeral: 76, frequencia: 90, streak: 11,
    redacoesEntregues: 7, redacoesPendentes: 0, simuladosFeitos: 5, questoesRespondidas: 295,
    lastActivityAt: "Hoje, 13h22", weeklyProgress: [68, 70, 72, 74, 75, 76, 76],
    activityDays: [true, true, true, true, false, true, true],
    subjectPerformance: [
      { subject: "Redação", pct: 80, forte: true, trend: "up" },
      { subject: "Literatura", pct: 78, forte: true, trend: "stable" },
      { subject: "Sociologia", pct: 72, forte: true, trend: "up" },
      { subject: "Filosofia", pct: 68, forte: false, trend: "up" },
    ],
    insights: ["Evolução consistente em todas as matérias.", "Forte candidato ao top 3 da UEG."],
  },
]

// ─── AULAS ────────────────────────────────────────────────────────────────────

export const AULAS: Aula[] = [
  {
    id: "aula-01", title: "Coesão e coerência textual", subject: "Redação",
    turmaId: TURMA_ID_ENEM, turmaNome: "ENEM Extensivo",
    status: "concluida", scheduledAt: "2026-07-05T19:00:00", durationMin: 90,
    attendeesExpected: 28, attendeesCount: 24, attendancePct: 86,
    description: "Análise de textos argumentativos com foco em conectivos.",
  },
  {
    id: "aula-02", title: "Tipos de argumentos", subject: "Redação",
    turmaId: TURMA_ID_UFU, turmaNome: "UFU Intensivo",
    status: "concluida", scheduledAt: "2026-07-06T14:00:00", durationMin: 90,
    attendeesExpected: 21, attendeesCount: 17, attendancePct: 81,
    description: "Como estruturar argumentos de autoridade, dados e exemplos.",
  },
  {
    id: "aula-03", title: "Dissertação ENEM — Competência 3", subject: "Redação",
    turmaId: TURMA_ID_ENEM, turmaNome: "ENEM Extensivo",
    status: "ao_vivo", scheduledAt: "2026-07-08T19:00:00", durationMin: 90,
    attendeesExpected: 28, attendeesCount: null, attendancePct: null,
    description: "Ao vivo agora: desenvolvimento e repertório sociocultural.",
  },
  {
    id: "aula-04", title: "Figuras de linguagem no vestibular", subject: "Literatura",
    turmaId: TURMA_ID_UEG, turmaNome: "UEG Semi-Extensivo",
    status: "concluida", scheduledAt: "2026-07-07T09:00:00", durationMin: 60,
    attendeesExpected: 14, attendeesCount: 12, attendancePct: 86,
    description: "Metáfora, metonímia, ironia e hipérbole em questões UEG.",
  },
  {
    id: "aula-05", title: "Proposta de intervenção", subject: "Redação",
    turmaId: TURMA_ID_ENEM, turmaNome: "ENEM Extensivo",
    status: "planejada", scheduledAt: "2026-07-10T19:00:00", durationMin: 90,
    attendeesExpected: 28, attendeesCount: null, attendancePct: null,
    description: "Construção da proposta de intervenção respeitando os 4 agentes.",
  },
  {
    id: "aula-06", title: "Gêneros textuais — UFU", subject: "Língua Portuguesa",
    turmaId: TURMA_ID_UFU, turmaNome: "UFU Intensivo",
    status: "planejada", scheduledAt: "2026-07-11T14:00:00", durationMin: 90,
    attendeesExpected: 21, attendeesCount: null, attendancePct: null,
    description: "Carta, editorial, artigo de opinião: distinções e características.",
  },
  {
    id: "aula-07", title: "Revisão final — UEG", subject: "Redação",
    turmaId: TURMA_ID_UEG, turmaNome: "UEG Semi-Extensivo",
    status: "planejada", scheduledAt: "2026-07-12T09:00:00", durationMin: 60,
    attendeesExpected: 14, attendeesCount: null, attendancePct: null,
    description: "Revisão geral com simulado comentado.",
  },
  {
    id: "aula-08", title: "Plantão de dúvidas ENEM", subject: "Redação",
    turmaId: TURMA_ID_ENEM, turmaNome: "ENEM Extensivo",
    status: "cancelada", scheduledAt: "2026-07-03T19:00:00", durationMin: 60,
    attendeesExpected: 28, attendeesCount: null, attendancePct: null,
    description: "Plantão cancelado — reagendado para próxima semana.",
  },
  {
    id: "aula-09", title: "Conectivos e progressão textual", subject: "Redação",
    turmaId: TURMA_ID_UFU, turmaNome: "UFU Intensivo",
    status: "concluida", scheduledAt: "2026-07-02T14:00:00", durationMin: 90,
    attendeesExpected: 21, attendeesCount: 19, attendancePct: 90,
    description: "Articuladores textuais para coesão na UFU.",
  },
  {
    id: "aula-10", title: "Literatura contemporânea — UEG", subject: "Literatura",
    turmaId: TURMA_ID_UEG, turmaNome: "UEG Semi-Extensivo",
    status: "planejada", scheduledAt: "2026-07-15T09:00:00", durationMin: 60,
    attendeesExpected: 14, attendeesCount: null, attendancePct: null,
    description: "Autores e obras do século XXI presentes no vestibular UEG.",
  },
]

// ─── REDACOES ─────────────────────────────────────────────────────────────────

export const REDACOES: Redacao[] = [
  {
    id: "red-01", studentId: "stu-03", studentName: "Gabriel Pereira", studentInitial: "G",
    turmaId: TURMA_ID_ENEM, turmaNome: "ENEM Extensivo",
    status: "pendente", theme: "A violência nos centros urbanos brasileiros",
    submittedAt: "2026-07-02T10:00:00", correctedAt: null,
    slaHours: 48, elapsedHours: 152, overSla: true,
    score: null, competencies: null, feedback: null, priority: "alta",
  },
  {
    id: "red-02", studentId: "stu-07", studentName: "Rafael Lima", studentInitial: "R",
    turmaId: TURMA_ID_UFU, turmaNome: "UFU Intensivo",
    status: "pendente", theme: "Desigualdade de gênero no mercado de trabalho",
    submittedAt: "2026-07-03T14:30:00", correctedAt: null,
    slaHours: 48, elapsedHours: 128, overSla: true,
    score: null, competencies: null, feedback: null, priority: "alta",
  },
  {
    id: "red-03", studentId: "stu-02", studentName: "Beatriz Santos", studentInitial: "B",
    turmaId: TURMA_ID_ENEM, turmaNome: "ENEM Extensivo",
    status: "pendente", theme: "O papel das redes sociais na polarização política",
    submittedAt: "2026-07-06T09:00:00", correctedAt: null,
    slaHours: 48, elapsedHours: 55, overSla: false,
    score: null, competencies: null, feedback: null, priority: "normal",
  },
  {
    id: "red-04", studentId: "stu-05", studentName: "Matheus Rocha", studentInitial: "M",
    turmaId: TURMA_ID_ENEM, turmaNome: "ENEM Extensivo",
    status: "em_correcao", theme: "Acesso à saúde mental no Brasil",
    submittedAt: "2026-07-05T20:00:00", correctedAt: null,
    slaHours: 48, elapsedHours: 22, overSla: false,
    score: null, competencies: null, feedback: null, priority: "normal",
  },
  {
    id: "red-05", studentId: "stu-08", studentName: "Juliana Ferreira", studentInitial: "J",
    turmaId: TURMA_ID_UFU, turmaNome: "UFU Intensivo",
    status: "pendente", theme: "Segurança alimentar e fome no Brasil",
    submittedAt: "2026-07-07T11:00:00", correctedAt: null,
    slaHours: 48, elapsedHours: 28, overSla: false,
    score: null, competencies: null, feedback: null, priority: "normal",
  },
  {
    id: "red-06", studentId: "stu-12", studentName: "Isabela Souza", studentInitial: "I",
    turmaId: TURMA_ID_UEG, turmaNome: "UEG Semi-Extensivo",
    status: "pendente", theme: "A importância da educação financeira",
    submittedAt: "2026-07-07T16:30:00", correctedAt: null,
    slaHours: 48, elapsedHours: 22, overSla: false,
    score: null, competencies: null, feedback: null, priority: "normal",
  },
  {
    id: "red-07", studentId: "stu-11", studentName: "Vitor Carvalho", studentInitial: "V",
    turmaId: TURMA_ID_UEG, turmaNome: "UEG Semi-Extensivo",
    status: "pendente", theme: "Mobilidade urbana e transporte público",
    submittedAt: "2026-07-08T08:00:00", correctedAt: null,
    slaHours: 48, elapsedHours: 8, overSla: false,
    score: null, competencies: null, feedback: null, priority: "normal",
  },
  // Corrigidas
  {
    id: "red-08", studentId: "stu-01", studentName: "Lucas Oliveira", studentInitial: "L",
    turmaId: TURMA_ID_ENEM, turmaNome: "ENEM Extensivo",
    status: "concluida", theme: "A violência no cenário escolar brasileiro",
    submittedAt: "2026-06-25T15:00:00", correctedAt: "2026-06-27T10:00:00",
    slaHours: 48, elapsedHours: 43, overSla: false,
    score: 880, feedback: "Excelente argumentação. Proposta de intervenção bem fundamentada.",
    competencies: [
      { label: "C1", name: "Norma culta", score: 180 },
      { label: "C2", name: "Compreensão do tema", score: 200 },
      { label: "C3", name: "Argumentação", score: 180 },
      { label: "C4", name: "Coesão", score: 160 },
      { label: "C5", name: "Proposta de intervenção", score: 160 },
    ],
    priority: "normal",
  },
  {
    id: "red-09", studentId: "stu-04", studentName: "Larissa Costa", studentInitial: "L",
    turmaId: TURMA_ID_ENEM, turmaNome: "ENEM Extensivo",
    status: "concluida", theme: "A violência no cenário escolar brasileiro",
    submittedAt: "2026-06-25T16:00:00", correctedAt: "2026-06-27T11:00:00",
    slaHours: 48, elapsedHours: 43, overSla: false,
    score: 940, feedback: "Nota altíssima! Repertório cultural excelente e proposta muito bem elaborada.",
    competencies: [
      { label: "C1", name: "Norma culta", score: 200 },
      { label: "C2", name: "Compreensão do tema", score: 200 },
      { label: "C3", name: "Argumentação", score: 180 },
      { label: "C4", name: "Coesão", score: 180 },
      { label: "C5", name: "Proposta de intervenção", score: 180 },
    ],
    priority: "normal",
  },
  {
    id: "red-10", studentId: "stu-06", studentName: "Camila Almeida", studentInitial: "C",
    turmaId: TURMA_ID_UFU, turmaNome: "UFU Intensivo",
    status: "concluida", theme: "Desinformação e democracia na era digital",
    submittedAt: "2026-06-28T10:00:00", correctedAt: "2026-06-30T09:00:00",
    slaHours: 48, elapsedHours: 47, overSla: false,
    score: 780, feedback: "Bom desenvolvimento. Melhorar a proposta de intervenção com agente mais específico.",
    competencies: [
      { label: "C1", name: "Norma culta", score: 160 },
      { label: "C2", name: "Compreensão do tema", score: 180 },
      { label: "C3", name: "Argumentação", score: 160 },
      { label: "C4", name: "Coesão", score: 140 },
      { label: "C5", name: "Proposta de intervenção", score: 140 },
    ],
    priority: "normal",
  },
  {
    id: "red-11", studentId: "stu-09", studentName: "Pedro Gomes", studentInitial: "P",
    turmaId: TURMA_ID_UFU, turmaNome: "UFU Intensivo",
    status: "concluida", theme: "Desinformação e democracia na era digital",
    submittedAt: "2026-06-28T14:00:00", correctedAt: "2026-06-30T10:00:00",
    slaHours: 48, elapsedHours: 44, overSla: false,
    score: 820, feedback: "Ótima argumentação. Coesão textual muito bem trabalhada.",
    competencies: [
      { label: "C1", name: "Norma culta", score: 180 },
      { label: "C2", name: "Compreensão do tema", score: 180 },
      { label: "C3", name: "Argumentação", score: 160 },
      { label: "C4", name: "Coesão", score: 160 },
      { label: "C5", name: "Proposta de intervenção", score: 140 },
    ],
    priority: "normal",
  },
  {
    id: "red-12", studentId: "stu-10", studentName: "Amanda Ribeiro", studentInitial: "A",
    turmaId: TURMA_ID_UEG, turmaNome: "UEG Semi-Extensivo",
    status: "concluida", theme: "A crise hídrica e o futuro das metrópoles",
    submittedAt: "2026-07-01T09:00:00", correctedAt: "2026-07-03T08:00:00",
    slaHours: 48, elapsedHours: 47, overSla: false,
    score: 920, feedback: "Excelente texto! Repertório científico muito bem aproveitado.",
    competencies: [
      { label: "C1", name: "Norma culta", score: 200 },
      { label: "C2", name: "Compreensão do tema", score: 200 },
      { label: "C3", name: "Argumentação", score: 180 },
      { label: "C4", name: "Coesão", score: 180 },
      { label: "C5", name: "Proposta de intervenção", score: 160 },
    ],
    priority: "normal",
  },
  {
    id: "red-13", studentId: "stu-13", studentName: "Thiago Martins", studentInitial: "T",
    turmaId: TURMA_ID_UEG, turmaNome: "UEG Semi-Extensivo",
    status: "concluida", theme: "A crise hídrica e o futuro das metrópoles",
    submittedAt: "2026-07-01T11:00:00", correctedAt: "2026-07-03T09:00:00",
    slaHours: 48, elapsedHours: 46, overSla: false,
    score: 800, feedback: "Boa proposta de intervenção. Trabalhar mais a coesão.",
    competencies: [
      { label: "C1", name: "Norma culta", score: 160 },
      { label: "C2", name: "Compreensão do tema", score: 180 },
      { label: "C3", name: "Argumentação", score: 160 },
      { label: "C4", name: "Coesão", score: 140 },
      { label: "C5", name: "Proposta de intervenção", score: 160 },
    ],
    priority: "normal",
  },
  {
    id: "red-14", studentId: "stu-02", studentName: "Beatriz Santos", studentInitial: "B",
    turmaId: TURMA_ID_ENEM, turmaNome: "ENEM Extensivo",
    status: "concluida", theme: "A violência no cenário escolar brasileiro",
    submittedAt: "2026-06-26T18:00:00", correctedAt: "2026-06-28T10:00:00",
    slaHours: 48, elapsedHours: 40, overSla: false,
    score: 620, feedback: "Argumentação precisa ser reforçada. Trabalhar mais os repertórios.",
    competencies: [
      { label: "C1", name: "Norma culta", score: 120 },
      { label: "C2", name: "Compreensão do tema", score: 140 },
      { label: "C3", name: "Argumentação", score: 120 },
      { label: "C4", name: "Coesão", score: 120 },
      { label: "C5", name: "Proposta de intervenção", score: 120 },
    ],
    priority: "normal",
  },
  {
    id: "red-15", studentId: "stu-05", studentName: "Matheus Rocha", studentInitial: "M",
    turmaId: TURMA_ID_ENEM, turmaNome: "ENEM Extensivo",
    status: "concluida", theme: "Saúde mental e redes sociais",
    submittedAt: "2026-06-20T10:00:00", correctedAt: "2026-06-22T09:00:00",
    slaHours: 48, elapsedHours: 47, overSla: false,
    score: 680, feedback: "Melhora notável em relação à última redação!",
    competencies: [
      { label: "C1", name: "Norma culta", score: 140 },
      { label: "C2", name: "Compreensão do tema", score: 140 },
      { label: "C3", name: "Argumentação", score: 140 },
      { label: "C4", name: "Coesão", score: 120 },
      { label: "C5", name: "Proposta de intervenção", score: 140 },
    ],
    priority: "normal",
  },
]

// ─── SIMULADOS ────────────────────────────────────────────────────────────────

export const SIMULADOS: Simulado[] = [
  {
    id: "sim-01", title: "Simulado ENEM — Linguagens e Humanas",
    turmaIds: [TURMA_ID_ENEM],
    status: "concluido", scheduledAt: "2026-06-28T08:00:00",
    totalAlunos: 28, participantes: 24, participacaoPct: 86,
    mediaGeral: 68,
    mediaBySubject: [
      { subject: "Linguagens", avg: 72 },
      { subject: "Humanas", avg: 65 },
      { subject: "Redação", avg: 740 },
    ],
    topScore: 88,
    naoPraticiparam: ["Gabriel Pereira", "Carlos Melo", "Ana Lima", "Pedro Ramos"],
  },
  {
    id: "sim-02", title: "Simulado UFU — Prova Completa",
    turmaIds: [TURMA_ID_UFU],
    status: "concluido", scheduledAt: "2026-07-01T08:00:00",
    totalAlunos: 21, participantes: 18, participacaoPct: 86,
    mediaGeral: 61,
    mediaBySubject: [
      { subject: "Ciências da Natureza", avg: 64 },
      { subject: "Matemática", avg: 57 },
      { subject: "Linguagens", avg: 63 },
    ],
    topScore: 79,
    naoPraticiparam: ["Rafael Lima", "Mariana Freitas", "João Victor"],
  },
  {
    id: "sim-03", title: "Simulado UEG — Semi-Geral",
    turmaIds: [TURMA_ID_UEG],
    status: "concluido", scheduledAt: "2026-07-05T08:00:00",
    totalAlunos: 14, participantes: 13, participacaoPct: 93,
    mediaGeral: 76,
    mediaBySubject: [
      { subject: "Linguagens", avg: 78 },
      { subject: "Ciências Humanas", avg: 74 },
    ],
    topScore: 86,
    naoPraticiparam: ["Isabela Souza"],
  },
  {
    id: "sim-04", title: "Simulado ENEM — Natureza e Matemática",
    turmaIds: [TURMA_ID_ENEM, TURMA_ID_UFU],
    status: "agendado", scheduledAt: "2026-07-19T08:00:00",
    totalAlunos: 49, participantes: null, participacaoPct: null,
    mediaGeral: null, mediaBySubject: null, topScore: null,
    naoPraticiparam: [],
  },
]

// ─── COMUNICADOS ──────────────────────────────────────────────────────────────

export const COMUNICADOS: Comunicado[] = [
  {
    id: "com-01", category: "pedagogico",
    title: "Nova metodologia para correção de redações",
    body: "A partir desta semana, adotaremos a grade de correção atualizada do MEC. Todos os professores devem revisar o material enviado pela coordenação pedagógica antes de iniciar novas correções.",
    sentAt: "2026-07-07T09:00:00", turmasIds: "all", read: false,
    authorName: "Coordenação Pedagógica", fromCoordination: true,
  },
  {
    id: "com-02", category: "administrativo",
    title: "Atualização no calendário de simulados — Julho",
    body: "O simulado ENEM do dia 15/07 foi reagendado para 19/07 devido a um feriado municipal. Confirmar disponibilidade dos professores responsáveis.",
    sentAt: "2026-07-06T14:30:00", turmasIds: "all", read: true,
    authorName: "Secretaria Acadêmica", fromCoordination: true,
  },
  {
    id: "com-03", category: "urgente",
    title: "Revisão de SLA — Redações pendentes há mais de 48h",
    body: "Foram identificadas 2 redações com SLA vencido. Por favor, priorizar a correção de Gabriel Pereira (ENEM) e Rafael Lima (UFU) antes de sexta-feira.",
    sentAt: "2026-07-08T08:00:00", turmasIds: "all", read: false,
    authorName: "Coordenação Pedagógica", fromCoordination: true,
  },
  {
    id: "com-04", category: "evento",
    title: "Semana de estudos intensivos — 21 a 25 de julho",
    body: "Haverá uma semana especial com aulas de revisão para os alunos mais próximos do vestibular UEG. Confirmar participação e enviar planejamento das aulas extras.",
    sentAt: "2026-07-04T11:00:00", turmasIds: [TURMA_ID_UEG], read: true,
    authorName: "Coordenação Pedagógica", fromCoordination: true,
  },
  {
    id: "com-05", category: "pedagogico",
    title: "Aviso enviado: Tema da próxima redação — ENEM Extensivo",
    body: "Informei aos alunos da turma ENEM Extensivo que o tema da próxima redação será sobre inteligência artificial e mercado de trabalho. Prazo de entrega: 14/07.",
    sentAt: "2026-07-05T19:30:00", turmasIds: [TURMA_ID_ENEM], read: true,
    authorName: "Prof. Marina Alves", fromCoordination: false,
  },
  {
    id: "com-06", category: "administrativo",
    title: "Aviso enviado: Aula cancelada — 03/07",
    body: "Comuniquei aos alunos do ENEM Extensivo que o plantão de dúvidas do dia 03/07 foi cancelado e reagendado para 10/07.",
    sentAt: "2026-07-03T16:00:00", turmasIds: [TURMA_ID_ENEM], read: true,
    authorName: "Prof. Marina Alves", fromCoordination: false,
  },
  {
    id: "com-07", category: "pedagogico",
    title: "Reunião pedagógica — 15/07 às 18h",
    body: "Haverá reunião geral de professores para alinhamento de metodologias e revisão dos planos de aula do segundo semestre. Presença obrigatória.",
    sentAt: "2026-07-02T10:00:00", turmasIds: "all", read: false,
    authorName: "Direção Pedagógica", fromCoordination: true,
  },
]

// ─── AGENDA ───────────────────────────────────────────────────────────────────

export const AGENDA_ITEMS: AgendaItem[] = [
  { id: "ag-01", type: "aula", title: "Dissertação ENEM — Competência 3", date: "2026-07-08", time: "19:00", durationMin: 90, turmaNome: "ENEM Extensivo", notes: "Ao vivo agora", status: "pendente" },
  { id: "ag-02", type: "correcao", title: "Corrigir 2 redações com SLA vencido", date: "2026-07-08", time: "10:00", durationMin: 60, turmaNome: null, notes: "Gabriel (ENEM) e Rafael (UFU)", status: "pendente" },
  { id: "ag-03", type: "aula", title: "Proposta de intervenção", date: "2026-07-10", time: "19:00", durationMin: 90, turmaNome: "ENEM Extensivo", notes: null, status: "pendente" },
  { id: "ag-04", type: "aula", title: "Gêneros textuais — UFU", date: "2026-07-11", time: "14:00", durationMin: 90, turmaNome: "UFU Intensivo", notes: null, status: "pendente" },
  { id: "ag-05", type: "aula", title: "Revisão final — UEG", date: "2026-07-12", time: "09:00", durationMin: 60, turmaNome: "UEG Semi-Extensivo", notes: "Último módulo antes da reta final", status: "pendente" },
  { id: "ag-06", type: "reuniao", title: "Reunião pedagógica geral", date: "2026-07-15", time: "18:00", durationMin: 90, turmaNome: null, notes: "Presença obrigatória — todos os professores", status: "pendente" },
  { id: "ag-07", type: "simulado", title: "Simulado ENEM — Natureza e Matemática", date: "2026-07-19", time: "08:00", durationMin: 180, turmaNome: "ENEM Extensivo / UFU Intensivo", notes: null, status: "pendente" },
  { id: "ag-08", type: "plantao", title: "Plantão de dúvidas ENEM", date: "2026-07-10", time: "17:00", durationMin: 60, turmaNome: "ENEM Extensivo", notes: "Reagendado do dia 03/07", status: "pendente" },
  { id: "ag-09", type: "correcao", title: "Corrigir redações — lote julho", date: "2026-07-09", time: "09:00", durationMin: 120, turmaNome: null, notes: "5 redações pendentes, 2 urgentes", status: "pendente" },
  { id: "ag-10", type: "aula", title: "Literatura contemporânea — UEG", date: "2026-07-15", time: "09:00", durationMin: 60, turmaNome: "UEG Semi-Extensivo", notes: null, status: "pendente" },
  { id: "ag-11", type: "aula", title: "Coesão — revisão prática", date: "2026-07-05", time: "19:00", durationMin: 90, turmaNome: "ENEM Extensivo", notes: null, status: "concluido" },
  { id: "ag-12", type: "simulado", title: "Simulado UEG — Semi-Geral", date: "2026-07-05", time: "08:00", durationMin: 180, turmaNome: "UEG Semi-Extensivo", notes: "93% de participação", status: "concluido" },
]

// ─── INSIGHTS ─────────────────────────────────────────────────────────────────

export const TEACHER_INSIGHTS: TeacherInsight[] = [
  {
    id: "ins-01", tone: "warning",
    text: "8 alunos sem atividade há 5+ dias — risco de evasão em alta.",
    href: "/teacher/alunos", actionLabel: "Ver alunos",
  },
  {
    id: "ins-02", tone: "warning",
    text: "2 redações com SLA vencido há mais de 100h. Prioridade máxima.",
    href: "/teacher/correcoes", actionLabel: "Corrigir agora",
  },
  {
    id: "ins-03", tone: "success",
    text: "Turma UFU Intensivo subiu 12% em Biologia nas últimas 2 semanas.",
    href: "/teacher/desempenho", actionLabel: "Ver desempenho",
  },
  {
    id: "ins-04", tone: "info",
    text: "Redações com queda na Competência 3 (argumentação) — considerar aula temática.",
    href: "/teacher/correcoes", actionLabel: "Analisar",
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getAlunosByTurma(turmaId: string): TeacherStudent[] {
  return TEACHER_STUDENTS.filter((s) => s.turmaId === turmaId)
}

export function getRedacoesByStatus(status: EssayStatus | "all"): Redacao[] {
  if (status === "all") return REDACOES
  return REDACOES.filter((r) => r.status === status)
}

export function getAulasByStatus(status: AulaStatus | "all"): Aula[] {
  if (status === "all") return AULAS
  return AULAS.filter((a) => a.status === status)
}

export function getSimuladosByTurma(turmaId: string | "all"): Simulado[] {
  if (turmaId === "all") return SIMULADOS
  return SIMULADOS.filter((s) => s.turmaIds.includes(turmaId))
}

export function getUpcomingAgenda(n: number): AgendaItem[] {
  return AGENDA_ITEMS
    .filter((a) => a.status === "pendente")
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
    .slice(0, n)
}

// ─── Aulões ───────────────────────────────────────────────────────────────────

export type AulaoStatus = "ao_vivo" | "agendado" | "encerrado"

export interface Aulao {
  id: string
  title: string
  subject: string
  turmas: string[]
  teacherName: string
  teacherInitial: string
  teacherColor: string
  status: AulaoStatus
  scheduledAt: string
  durationMin: number
  enrolledCount: number
  viewersNow: number | null
  attendanceCount: number | null
  attendancePct: number | null
  recordingUrl: string | null
}

export const AULOES: Aulao[] = [
  {
    id: "ao-vivo",
    title: "Redação — Estrutura dissertativo-argumentativa",
    subject: "Redação",
    turmas: ["ENEM Extensivo", "UFU Intensivo"],
    teacherName: "Prof. Ricardo Alves",
    teacherInitial: "R",
    teacherColor: "#1B4DE4",
    status: "ao_vivo",
    scheduledAt: "2026-07-08T19:00:00",
    durationMin: 90,
    enrolledCount: 85,
    viewersNow: 72,
    attendanceCount: null,
    attendancePct: null,
    recordingUrl: null,
  },
  {
    id: "aulao-jul-09",
    title: "Atualidades — Temas de Redação ENEM 2026",
    subject: "Redação",
    turmas: ["ENEM Extensivo"],
    teacherName: "Prof. Ricardo Alves",
    teacherInitial: "R",
    teacherColor: "#1B4DE4",
    status: "agendado",
    scheduledAt: "2026-07-09T19:00:00",
    durationMin: 90,
    enrolledCount: 62,
    viewersNow: null,
    attendanceCount: null,
    attendancePct: null,
    recordingUrl: null,
  },
  {
    id: "aulao-jul-12",
    title: "Matemática — Geometria Analítica e Funções",
    subject: "Matemática",
    turmas: ["UFU Intensivo", "UEG Modular"],
    teacherName: "Prof.ª Carla Mendes",
    teacherInitial: "C",
    teacherColor: "#0FA968",
    status: "agendado",
    scheduledAt: "2026-07-12T10:00:00",
    durationMin: 120,
    enrolledCount: 74,
    viewersNow: null,
    attendanceCount: null,
    attendancePct: null,
    recordingUrl: null,
  },
  {
    id: "aulao-jul-15",
    title: "Biologia — Genética e Hereditariedade",
    subject: "Biologia",
    turmas: ["ENEM Extensivo", "UFU Intensivo"],
    teacherName: "Prof. Marcos Santana",
    teacherInitial: "M",
    teacherColor: "#6C4BD9",
    status: "agendado",
    scheduledAt: "2026-07-15T19:00:00",
    durationMin: 90,
    enrolledCount: 85,
    viewersNow: null,
    attendanceCount: null,
    attendancePct: null,
    recordingUrl: null,
  },
  {
    id: "aulao-jul-03",
    title: "Interpretação de Texto — Tipos e Gêneros Textuais",
    subject: "Português",
    turmas: ["ENEM Extensivo"],
    teacherName: "Prof. Ricardo Alves",
    teacherInitial: "R",
    teacherColor: "#1B4DE4",
    status: "encerrado",
    scheduledAt: "2026-07-03T19:00:00",
    durationMin: 90,
    enrolledCount: 85,
    viewersNow: null,
    attendanceCount: 78,
    attendancePct: 92,
    recordingUrl: "#",
  },
  {
    id: "aulao-jun-26",
    title: "Português — Concordância Verbal e Nominal",
    subject: "Português",
    turmas: ["ENEM Extensivo", "UEG Modular"],
    teacherName: "Prof. Ricardo Alves",
    teacherInitial: "R",
    teacherColor: "#1B4DE4",
    status: "encerrado",
    scheduledAt: "2026-06-26T19:00:00",
    durationMin: 90,
    enrolledCount: 85,
    viewersNow: null,
    attendanceCount: 65,
    attendancePct: 76,
    recordingUrl: "#",
  },
  {
    id: "aulao-jun-19",
    title: "Matemática — Funções do 1.º e 2.º Grau",
    subject: "Matemática",
    turmas: ["UFU Intensivo", "UEG Modular"],
    teacherName: "Prof.ª Carla Mendes",
    teacherInitial: "C",
    teacherColor: "#0FA968",
    status: "encerrado",
    scheduledAt: "2026-06-19T14:00:00",
    durationMin: 120,
    enrolledCount: 90,
    viewersNow: null,
    attendanceCount: 82,
    attendancePct: 91,
    recordingUrl: "#",
  },
  {
    id: "aulao-jun-12",
    title: "Química — Estequiometria e Cálculos Químicos",
    subject: "Química",
    turmas: ["UFU Intensivo"],
    teacherName: "Prof. Marcos Santana",
    teacherInitial: "M",
    teacherColor: "#6C4BD9",
    status: "encerrado",
    scheduledAt: "2026-06-12T19:00:00",
    durationMin: 90,
    enrolledCount: 48,
    viewersNow: null,
    attendanceCount: 41,
    attendancePct: 85,
    recordingUrl: "#",
  },
  {
    id: "aulao-jun-05",
    title: "Física — Cinemática e Dinâmica",
    subject: "Física",
    turmas: ["UFU Intensivo", "UEG Modular"],
    teacherName: "Prof. Marcos Santana",
    teacherInitial: "M",
    teacherColor: "#6C4BD9",
    status: "encerrado",
    scheduledAt: "2026-06-05T19:00:00",
    durationMin: 90,
    enrolledCount: 82,
    viewersNow: null,
    attendanceCount: 76,
    attendancePct: 93,
    recordingUrl: "#",
  },
]

export function getDashboardAlerts(): Array<{ tone: "warning" | "error" | "info"; text: string; href: string; actionLabel: string }> {
  const alerts: Array<{ tone: "warning" | "error" | "info"; text: string; href: string; actionLabel: string }> = []
  const liveAulao = AULOES.find((a) => a.status === "ao_vivo")
  if (liveAulao) {
    alerts.push({
      tone: "error",
      text: `Aulão ao vivo agora: "${liveAulao.title}" — ${liveAulao.viewersNow} participantes conectados.`,
      href: `/teacher/auloes/${liveAulao.id}`,
      actionLabel: "Entrar na sala",
    })
  }
  const overSlaCount = REDACOES.filter((r) => r.overSla).length
  if (overSlaCount > 0) {
    alerts.push({
      tone: "error",
      text: `${overSlaCount} redaç${overSlaCount > 1 ? "ões" : "ão"} com SLA vencido — correção urgente necessária.`,
      href: "/teacher/correcoes",
      actionLabel: "Corrigir",
    })
  }
  const riscoCount = TEACHER_STUDENTS.filter((s) => s.riskLevel === "risco").length
  if (riscoCount > 0) {
    alerts.push({
      tone: "warning",
      text: `${riscoCount} alunos em risco pedagógico — sem atividade recente.`,
      href: "/teacher/alunos",
      actionLabel: "Ver alunos",
    })
  }
  return alerts
}
