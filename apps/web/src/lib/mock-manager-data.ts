export const MANAGER = {
  name: "Ana Ribeiro",
  initial: "A",
  email: "ana@mais-aprovacao.com.br",
  role: "manager" as const,
}

// ── Visão geral ──────────────────────────────────────────────────────────────

export const OVERVIEW_KPIS = {
  newEnrollmentsToday: 4,
  newEnrollmentsWeek: 27,
  newEnrollmentsWeekDelta: 12.4,
  revenueToday_cents: 358000,
  revenueMonth_cents: 4210000,
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

export interface OverviewLiveClass {
  id: string
  title: string
  teacherName: string
  scheduledAt: string
  status: "scheduled" | "live" | "ended" | "cancelled"
}

export const LIVE_CLASSES_TODAY: OverviewLiveClass[] = [
  { id: "lc01", title: "Aulão de Redação — Repertório ENEM", teacherName: "Prof. Marina Alves", scheduledAt: "14:00", status: "live" },
  { id: "lc02", title: "Revisão de Química Orgânica", teacherName: "Prof. Carlos Dias", scheduledAt: "16:30", status: "scheduled" },
  { id: "lc03", title: "Plantão de Dúvidas — Matemática", teacherName: "Prof. Renata Souza", scheduledAt: "19:00", status: "scheduled" },
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

// ── Pedagógico + Professores ──────────────────────────────────────────────────

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
  liveClassesGiven30d: number
  avgAttendance: number
  essaysCorrected30d: number
}

export const TEACHERS: TeacherRow[] = [
  { id: "tch01", name: "Marina Alves", initial: "M", coursesActive: 3, liveClassesGiven30d: 12, avgAttendance: 87, essaysCorrected30d: 64 },
  { id: "tch02", name: "Carlos Dias", initial: "C", coursesActive: 2, liveClassesGiven30d: 9, avgAttendance: 79, essaysCorrected30d: 0 },
  { id: "tch03", name: "Renata Souza", initial: "R", coursesActive: 4, liveClassesGiven30d: 15, avgAttendance: 91, essaysCorrected30d: 0 },
  { id: "tch04", name: "Bruno Lima", initial: "B", coursesActive: 2, liveClassesGiven30d: 6, avgAttendance: 74, essaysCorrected30d: 48 },
  { id: "tch05", name: "Fernanda Rocha", initial: "F", coursesActive: 3, liveClassesGiven30d: 10, avgAttendance: 83, essaysCorrected30d: 41 },
]
