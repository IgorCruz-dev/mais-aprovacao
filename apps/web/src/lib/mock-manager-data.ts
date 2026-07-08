export const MANAGER = {
  name: "Luciana",
  initial: "A",
  email: "Luciana@mais-aprovacao.com.br",
  role: "manager" as const,
}

// ── Visão geral ──────────────────────────────────────────────────────────────

export const OVERVIEW_KPIS = {
  newEnrollmentsToday: 4,
  newEnrollmentsWeek: 27,
  newEnrollmentsWeekDelta: 12.4,
  revenueToday_cents: 358000,
  revenueMonth_cents: 5210000,
  revenueGoalMonth_cents: 6000000,
  revenueMonthDelta: 8.1,
  activeStudents: 812,
  activeStudentsDelta: 3.6,
  studentsAtRisk: 23,
  essaysPending: 18,
  essaysOverdueSla: 5,
  engagementStreakAvg: 4.2,
  engagementStreakAvgDelta: -2.3,
  paymentAlerts: {
    failedLast7d: 6,
    expiringEnrollments7d: 14,
  },
}

export const REVENUE_TREND_30D: number[] = [
  118000, 122000, 96000, 145000, 132000, 108000, 156000,
  142000, 138000, 165000, 121000, 149000, 172000, 158000,
  133000, 161000, 178000, 146000, 190000, 168000, 184000,
  201000, 175000, 193000, 210000, 188000, 225000, 199000,
  238000, 358000,
]

export interface EssayQueueRow {
  id: string
  teacherName: string
  pendingCount: number
  oldestSubmittedHoursAgo: number
}

export const ESSAYS_QUEUE_BY_TEACHER: EssayQueueRow[] = [
  { id: "eq01", teacherName: "Prof. Marina Alves", pendingCount: 8, oldestSubmittedHoursAgo: 52 },
  { id: "eq02", teacherName: "Prof. Bruno Lima", pendingCount: 6, oldestSubmittedHoursAgo: 30 },
  { id: "eq03", teacherName: "Prof. Fernanda Rocha", pendingCount: 4, oldestSubmittedHoursAgo: 18 },
]

// ── Alunos ───────────────────────────────────────────────────────────────────

export interface ManagerStudentRow {
  id: string
  name: string
  initial: string
  course: string
  cohort: string
  enrollmentStatus: "active" | "expired" | "cancelled" | "pending"
  progressPct: number
  streak: number
  lastActivityAt: string
  riskLevel: "baixo" | "medio" | "alto"
}

const FIRST_NAMES = ["Lucas", "Beatriz", "Gabriel", "Larissa", "Matheus", "Camila", "Rafael", "Juliana", "Pedro", "Amanda", "Vitor", "Isabela", "Thiago", "Carolina", "Bruno", "Fernanda", "André", "Mariana", "Felipe", "Letícia"]
const LAST_NAMES = ["Silva", "Souza", "Oliveira", "Santos", "Pereira", "Costa", "Almeida", "Ribeiro", "Carvalho", "Gomes"]
const COURSES = ["ENEM Extensivo", "UFU Intensivo", "UEG Semi-Extensivo", "ENEM Por Matéria"]
const COHORTS = ["Turma A — Manhã", "Turma B — Noite", "Turma C — Tarde"]

function seedRandom(seed: number) {
  let value = seed
  return () => {
    value = (value * 9301 + 49297) % 233280
    return value / 233280
  }
}

const rand = seedRandom(42)

export const MANAGER_STUDENTS: ManagerStudentRow[] = Array.from({ length: 42 }, (_, i) => {
  const name = `${FIRST_NAMES[i % FIRST_NAMES.length]} ${LAST_NAMES[(i * 3) % LAST_NAMES.length]}`
  const progressPct = Math.round(rand() * 100)
  const streak = Math.round(rand() * 30)
  const daysAgo = Math.round(rand() * 20)
  const statusRoll = rand()
  const enrollmentStatus: ManagerStudentRow["enrollmentStatus"] =
    statusRoll > 0.85 ? "expired" : statusRoll > 0.78 ? "cancelled" : statusRoll > 0.72 ? "pending" : "active"
  const riskLevel: ManagerStudentRow["riskLevel"] = daysAgo > 10 ? "alto" : daysAgo > 4 ? "medio" : "baixo"
  return {
    id: `stu-${String(i + 1).padStart(3, "0")}`,
    name,
    initial: name[0],
    course: COURSES[i % COURSES.length],
    cohort: COHORTS[i % COHORTS.length],
    enrollmentStatus,
    progressPct,
    streak,
    lastActivityAt: daysAgo === 0 ? "Hoje" : daysAgo === 1 ? "Ontem" : `Há ${daysAgo} dias`,
    riskLevel,
  }
})

// ── Financeiro ───────────────────────────────────────────────────────────────

export const FINANCE_SUMMARY = {
  mrr_cents: 4210000,
  totalRevenue_cents: 51200000,
  ticketMedio_cents: 51900,
  defaultRatePct: 4.8,
  byMethod: { pix: 61, credit_card: 35, boleto: 4 },
}

export const REVENUE_TREND_12M: number[] = [
  2980000, 3120000, 3050000, 3340000, 3410000, 3580000,
  3620000, 3790000, 3910000, 4020000, 4110000, 4210000,
]

export interface RevenueByCourseRow {
  id: string
  course: string
  revenue_cents: number
  enrollments: number
}

export const REVENUE_BY_COURSE: RevenueByCourseRow[] = [
  { id: "rbc01", course: "ENEM Extensivo", revenue_cents: 21400000, enrollments: 412 },
  { id: "rbc02", course: "UFU Intensivo", revenue_cents: 12800000, enrollments: 186 },
  { id: "rbc03", course: "UEG Semi-Extensivo", revenue_cents: 9600000, enrollments: 154 },
  { id: "rbc04", course: "ENEM Por Matéria", revenue_cents: 7400000, enrollments: 208 },
]

export const ENROLLMENTS_BY_STATUS = {
  active: 812,
  expired: 140,
  cancelled: 38,
  pending: 22,
}

export interface PaymentRow {
  id: string
  studentName: string
  course: string
  amount_cents: number
  method: "pix" | "credit_card" | "boleto"
  status: "pending" | "paid" | "failed" | "refunded"
  paidAt: string | null
}

export const RECENT_PAYMENTS: PaymentRow[] = [
  { id: "pay01", studentName: "Lucas Silva", course: "ENEM Extensivo", amount_cents: 49900, method: "pix", status: "paid", paidAt: "Hoje, 09:12" },
  { id: "pay02", studentName: "Beatriz Souza", course: "UFU Intensivo", amount_cents: 69900, method: "credit_card", status: "paid", paidAt: "Hoje, 08:47" },
  { id: "pay03", studentName: "Gabriel Oliveira", course: "UEG Semi-Extensivo", amount_cents: 59900, method: "boleto", status: "pending", paidAt: null },
  { id: "pay04", studentName: "Larissa Santos", course: "ENEM Extensivo", amount_cents: 49900, method: "credit_card", status: "failed", paidAt: null },
  { id: "pay05", studentName: "Matheus Pereira", course: "ENEM Por Matéria", amount_cents: 29900, method: "pix", status: "paid", paidAt: "Ontem, 21:05" },
  { id: "pay06", studentName: "Camila Costa", course: "UFU Intensivo", amount_cents: 69900, method: "pix", status: "refunded", paidAt: "Ontem, 14:30" },
]

// ── Eventos ──────────────────────────────────────────────────────────────────
// Eventos esporádicos de hora marcada, abertos a todas as turmas (ou a um curso
// específico) — não são uma atividade recorrente por professor/período. Os
// aulões são um dos tipos de evento; outros tipos (simulado presencial, reunião
// de pais, palestra) usam a mesma estrutura.

export type EventType = "aulao" | "simulado_presencial" | "reuniao_pais" | "evento_institucional"

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  aulao: "Aulão",
  simulado_presencial: "Simulado presencial",
  reuniao_pais: "Reunião de pais",
  evento_institucional: "Evento institucional",
}

export interface ManagerEvent {
  id: string
  title: string
  type: EventType
  teacherName: string | null
  scheduledAt: string // ISO datetime
  audience: string
  status: "scheduled" | "live" | "ended" | "cancelled"
  attendeesExpected: number
  attendeesCount: number | null
}

export const MANAGER_EVENTS: ManagerEvent[] = [
  { id: "ev01", title: "Aulão de Redação — Repertório ENEM", type: "aulao", teacherName: "Marina Alves", scheduledAt: "2026-07-07T14:00:00", audience: "Todas as turmas", status: "live", attendeesExpected: 640, attendeesCount: 512 },
  { id: "ev02", title: "Revisão de Química Orgânica", type: "aulao", teacherName: "Carlos Dias", scheduledAt: "2026-07-07T16:30:00", audience: "ENEM Extensivo", status: "scheduled", attendeesExpected: 320, attendeesCount: null },
  { id: "ev03", title: "Plantão de Dúvidas — Matemática", type: "aulao", teacherName: "Renata Souza", scheduledAt: "2026-07-07T19:00:00", audience: "Todas as turmas", status: "scheduled", attendeesExpected: 580, attendeesCount: null },
  { id: "ev04", title: "Simulado Presencial — 1ª Aplicação ENEM", type: "simulado_presencial", teacherName: null, scheduledAt: "2026-07-19T09:00:00", audience: "Todas as turmas", status: "scheduled", attendeesExpected: 720, attendeesCount: null },
  { id: "ev05", title: "Revisão Final — Redação Nota 1000", type: "aulao", teacherName: "Marina Alves", scheduledAt: "2026-08-02T15:00:00", audience: "Todas as turmas", status: "scheduled", attendeesExpected: 690, attendeesCount: null },
  { id: "ev06", title: "Reunião de Pais e Responsáveis", type: "reuniao_pais", teacherName: null, scheduledAt: "2026-08-08T19:00:00", audience: "Todas as turmas", status: "scheduled", attendeesExpected: 300, attendeesCount: null },
  { id: "ev07", title: "Aulão de Química — Estequiometria", type: "aulao", teacherName: "Carlos Dias", scheduledAt: "2026-06-21T14:00:00", audience: "UFU Intensivo", status: "ended", attendeesExpected: 240, attendeesCount: 198 },
  { id: "ev08", title: "Correção Coletiva de Redação", type: "aulao", teacherName: "Bruno Lima", scheduledAt: "2026-06-14T18:00:00", audience: "Todas as turmas", status: "ended", attendeesExpected: 610, attendeesCount: 487 },
  { id: "ev09", title: "Palestra de Orientação Vocacional", type: "evento_institucional", teacherName: null, scheduledAt: "2026-06-10T18:30:00", audience: "Todas as turmas", status: "ended", attendeesExpected: 400, attendeesCount: 355 },
  { id: "ev10", title: "Aulão de Matemática — Geometria", type: "aulao", teacherName: "Renata Souza", scheduledAt: "2026-05-30T14:00:00", audience: "UEG Semi-Extensivo", status: "cancelled", attendeesExpected: 180, attendeesCount: null },
]

/** Próximos eventos a exibir em destaque: ao vivo agora + agendados futuros, em ordem cronológica. */
export function getUpcomingEvents(limit: number, now: Date = new Date()): ManagerEvent[] {
  const relevant = MANAGER_EVENTS.filter(
    (e) => e.status === "live" || (e.status === "scheduled" && new Date(e.scheduledAt).getTime() >= now.getTime())
  )
  return [...relevant]
    .sort((a, b) => {
      if (a.status === "live" && b.status !== "live") return -1
      if (b.status === "live" && a.status !== "live") return 1
      return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
    })
    .slice(0, limit)
}

// ── Pedagógico + Professores ──────────────────────────────────────────────────

export type PeriodKey = "week" | "month" | "quarter" | "year"

export const PERIOD_OPTIONS: { value: PeriodKey; label: string }[] = [
  { value: "week", label: "Semana atual" },
  { value: "month", label: "Mês atual" },
  { value: "quarter", label: "Trimestre atual" },
  { value: "year", label: "Ano atual" },
]

/** Início do período (segunda-feira, dia 1, início do trimestre/ano) e dias já decorridos até hoje. */
function getPeriodRange(period: PeriodKey, now: Date = new Date()) {
  const start = new Date(now)
  if (period === "week") {
    const dayOfWeek = now.getDay() // 0 = domingo
    const diffToMonday = (dayOfWeek + 6) % 7
    start.setDate(now.getDate() - diffToMonday)
  } else if (period === "month") {
    start.setDate(1)
  } else if (period === "quarter") {
    start.setMonth(Math.floor(now.getMonth() / 3) * 3, 1)
  } else {
    start.setMonth(0, 1)
  }
  start.setHours(0, 0, 0, 0)
  const elapsedDays = Math.max(1, Math.round((now.getTime() - start.getTime()) / 86400000) + 1)
  return { start, elapsedDays }
}

/** Métricas de fluxo (contagens acumuladas no período) escalam com os dias já decorridos do período, a partir de uma taxa diária de referência (padrão: base = janela de 30 dias). */
function scaleFlowMetric(baseValue: number, period: PeriodKey, jitterSeed: number, baseDays: number = 30): number {
  const { elapsedDays } = getPeriodRange(period)
  const dailyRate = baseValue / baseDays
  const jitter = 0.92 + seedRandom(jitterSeed)() * 0.16 // 0.92–1.08, determinístico por período
  return Math.max(0, Math.round(dailyRate * elapsedDays * jitter))
}

/** Métricas de estado (médias, percentuais acumulados) não escalam com o período — variam só levemente. */
function jitterStableMetric(base: number, jitterSeed: number, spreadPct = 0.04): number {
  const jitter = 1 + (seedRandom(jitterSeed)() - 0.5) * 2 * spreadPct
  return base * jitter
}

/** Quantidade de "baldes" (pontos) do gráfico de receita para cada período: diário em semana/mês, semanal no trimestre, mensal no ano. */
function getPeriodChartBuckets(period: PeriodKey): number {
  const { elapsedDays } = getPeriodRange(period)
  if (period === "week" || period === "month") return Math.max(2, elapsedDays)
  if (period === "quarter") return Math.max(2, Math.min(13, Math.ceil(elapsedDays / 7)))
  return Math.max(2, Math.min(12, new Date().getMonth() + 1))
}

export function getOverviewKpisForPeriod(period: PeriodKey) {
  return {
    newEnrollments: scaleFlowMetric(OVERVIEW_KPIS.newEnrollmentsWeek, period, 501, 7),
    newEnrollmentsDelta: OVERVIEW_KPIS.newEnrollmentsWeekDelta,
    activeStudents: Math.round(jitterStableMetric(OVERVIEW_KPIS.activeStudents, 502, 0.02)),
    activeStudentsDelta: OVERVIEW_KPIS.activeStudentsDelta,
    engagementStreakAvg: Number(jitterStableMetric(OVERVIEW_KPIS.engagementStreakAvg, 503, 0.06).toFixed(1)),
    engagementStreakAvgDelta: OVERVIEW_KPIS.engagementStreakAvgDelta,
    essaysPending: OVERVIEW_KPIS.essaysPending,
    revenue_cents: scaleFlowMetric(OVERVIEW_KPIS.revenueMonth_cents, period, 504),
    revenueGoal_cents: Math.round(OVERVIEW_KPIS.revenueGoalMonth_cents * ({ week: 7 / 30, month: 1, quarter: 3, year: 12 }[period])),
  }
}

export function getRevenueTrendForPeriod(period: PeriodKey): number[] {
  const buckets = getPeriodChartBuckets(period)
  const total = scaleFlowMetric(OVERVIEW_KPIS.revenueMonth_cents, period, 505)
  const jitter = seedRandom(910 + buckets)
  const weights = Array.from({ length: buckets }, (_, i) => 0.7 + (i / buckets) * 0.6 + jitter() * 0.5)
  const weightSum = weights.reduce((a, b) => a + b, 0)
  return weights.map((w) => Math.max(1, Math.round((w / weightSum) * total)))
}

export const PEDAGOGICO_SUMMARY = {
  moduleCompletionPct: 63,
  avgExamScore: 68.4,
  essaysCorrected30d: 210,
  essaysPending: 18,
  essaysAvgSlaHours: 31,
  examSessionsCompleted30d: 486,
  questionsAnswered30d: 12840,
  certificatesIssued30d: 27,
  activeCourses: 4,
  avgLessonWatchedPct: 71,
}

export function getPedagogicoSummaryForPeriod(period: PeriodKey) {
  return {
    moduleCompletionPct: Math.round(jitterStableMetric(PEDAGOGICO_SUMMARY.moduleCompletionPct, 101)),
    avgExamScore: Number(jitterStableMetric(PEDAGOGICO_SUMMARY.avgExamScore, 102).toFixed(1)),
    essaysCorrected: scaleFlowMetric(PEDAGOGICO_SUMMARY.essaysCorrected30d, period, 103),
    essaysPending: PEDAGOGICO_SUMMARY.essaysPending,
    essaysAvgSlaHours: Math.round(jitterStableMetric(PEDAGOGICO_SUMMARY.essaysAvgSlaHours, 104)),
    examSessionsCompleted: scaleFlowMetric(PEDAGOGICO_SUMMARY.examSessionsCompleted30d, period, 105),
    questionsAnswered: scaleFlowMetric(PEDAGOGICO_SUMMARY.questionsAnswered30d, period, 106),
    certificatesIssued: scaleFlowMetric(PEDAGOGICO_SUMMARY.certificatesIssued30d, period, 107),
    activeCourses: PEDAGOGICO_SUMMARY.activeCourses,
    avgLessonWatchedPct: Math.round(jitterStableMetric(PEDAGOGICO_SUMMARY.avgLessonWatchedPct, 108)),
  }
}

export interface ModuleCompletionRow {
  id: string
  course: string
  pct: number
}

export const MODULE_COMPLETION_BY_COURSE: ModuleCompletionRow[] = [
  { id: "mcc01", course: "ENEM Extensivo", pct: 71 },
  { id: "mcc02", course: "UFU Intensivo", pct: 58 },
  { id: "mcc03", course: "UEG Semi-Extensivo", pct: 64 },
  { id: "mcc04", course: "ENEM Por Matéria", pct: 49 },
]

export interface TeacherRow {
  id: string
  name: string
  initial: string
  coursesActive: number
  avgAttendance: number
  essaysCorrected30d: number
}

export const TEACHERS: TeacherRow[] = [
  { id: "tch01", name: "Marina Alves", initial: "M", coursesActive: 3, avgAttendance: 87, essaysCorrected30d: 64 },
  { id: "tch02", name: "Carlos Dias", initial: "C", coursesActive: 2, avgAttendance: 79, essaysCorrected30d: 0 },
  { id: "tch03", name: "Renata Souza", initial: "R", coursesActive: 4, avgAttendance: 91, essaysCorrected30d: 0 },
  { id: "tch04", name: "Bruno Lima", initial: "B", coursesActive: 2, avgAttendance: 74, essaysCorrected30d: 48 },
  { id: "tch05", name: "Fernanda Rocha", initial: "F", coursesActive: 3, avgAttendance: 83, essaysCorrected30d: 41 },
]

export interface TeacherRowForPeriod {
  id: string
  name: string
  initial: string
  coursesActive: number
  avgAttendance: number
  essaysCorrected: number
}

export function getTeachersForPeriod(period: PeriodKey): TeacherRowForPeriod[] {
  return TEACHERS.map((t, i) => ({
    id: t.id,
    name: t.name,
    initial: t.initial,
    coursesActive: t.coursesActive,
    avgAttendance: Math.round(jitterStableMetric(t.avgAttendance, 300 + i, 0.03)),
    essaysCorrected: t.essaysCorrected30d === 0 ? 0 : scaleFlowMetric(t.essaysCorrected30d, period, 400 + i),
  }))
}
