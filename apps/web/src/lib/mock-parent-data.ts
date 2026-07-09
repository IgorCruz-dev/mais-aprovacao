// Mock data for the parent (responsável) panel — all data is static/demo

export type StudentStatus = "otimo" | "atencao" | "risco"
export type FinanceStatus = "em_dia" | "vence_em_breve" | "pendente"
export type ActivityType = "aula" | "questao" | "simulado" | "redacao" | "checkin"
export type ActivityStatus = "concluido" | "pendente" | "atrasado"
export type AnnouncementCategory = "pedagogico" | "financeiro" | "evento" | "suporte"
export type MeetingStatus = "agendada" | "realizada" | "cancelada"
export type AlertTone = "warning" | "error" | "info"

export interface SubjectPerformance {
  subject: string
  pct: number
  forte: boolean
}

export interface Finance {
  status: FinanceStatus
  plano: string
  valor: string
  vencimento: string
  metodoPagamento: string
  historico: PaymentRecord[]
}

export interface PaymentRecord {
  id: string
  date: string
  valor: string
  status: FinanceStatus
  metodo: string
}

export interface MockStudent {
  id: string
  name: string
  initial: string
  color: string
  turma: string
  curso: string
  status: StudentStatus
  streak: number
  points: number
  questoesRespondidas: number
  simuladosFeitos: number
  redacoesEntregues: number
  mediaGeral: number
  frequencia: number
  activityDays: boolean[]
  weeklyProgress: number[]
  subjectPerformance: SubjectPerformance[]
  financeiro: Finance
  lastActivity: string
  nextEvent: string
  insights: string[]
}

export interface Activity {
  id: string
  studentId: string
  studentName: string
  type: ActivityType
  desc: string
  date: string
  status: ActivityStatus
  detail?: string
}

export interface Announcement {
  id: string
  category: AnnouncementCategory
  title: string
  body: string
  date: string
  read: boolean
}

export interface Meeting {
  id: string
  studentId: string
  studentName: string
  date: string
  time: string
  advisor: string
  type: string
  status: MeetingStatus
  notes?: string
}

export interface Alert {
  id: string
  tone: AlertTone
  text: string
  actionLabel?: string
  href?: string
}

// ─── Alunos ──────────────────────────────────────────────────────────────────

export const MOCK_STUDENTS: MockStudent[] = [
  {
    id: "student-ana",
    name: "Ana Luíza Ferreira",
    initial: "A",
    color: "#1B4DE4",
    turma: "3º Ano — Turma A",
    curso: "Extensivo ENEM 2025",
    status: "otimo",
    streak: 18,
    points: 4_280,
    questoesRespondidas: 312,
    simuladosFeitos: 4,
    redacoesEntregues: 3,
    mediaGeral: 74,
    frequencia: 92,
    activityDays: [true, true, false, true, true, true, true],
    weeklyProgress: [58, 62, 65, 68, 70, 72, 74],
    subjectPerformance: [
      { subject: "Matemática", pct: 82, forte: true },
      { subject: "Redação", pct: 78, forte: true },
      { subject: "Ciências da Natureza", pct: 71, forte: false },
      { subject: "Linguagens", pct: 69, forte: false },
      { subject: "Ciências Humanas", pct: 64, forte: false },
    ],
    financeiro: {
      status: "em_dia",
      plano: "Extensivo Anual",
      valor: "R$ 249,90",
      vencimento: "15/08/2025",
      metodoPagamento: "Cartão de crédito ••••4821",
      historico: [
        { id: "p1", date: "15/07/2025", valor: "R$ 249,90", status: "em_dia", metodo: "Cartão" },
        { id: "p2", date: "15/06/2025", valor: "R$ 249,90", status: "em_dia", metodo: "Cartão" },
        { id: "p3", date: "15/05/2025", valor: "R$ 249,90", status: "em_dia", metodo: "Cartão" },
        { id: "p4", date: "15/04/2025", valor: "R$ 249,90", status: "em_dia", metodo: "Cartão" },
      ],
    },
    lastActivity: "Hoje às 14h32",
    nextEvent: "Simulado UFU — Qui, 17 jul às 08h",
    insights: [
      "Ana mantém uma das maiores ofensivas da turma — 18 dias consecutivos de estudo.",
      "Desempenho em Matemática cresceu 12% no último mês. Continue incentivando!",
      "Ainda há espaço para avançar em Ciências Humanas — atenção às aulas de História.",
    ],
  },
  {
    id: "student-pedro",
    name: "Pedro Henrique Souza",
    initial: "P",
    color: "#D97706",
    turma: "3º Ano — Turma B",
    curso: "Semi-Extensivo ENEM 2025",
    status: "atencao",
    streak: 3,
    points: 1_150,
    questoesRespondidas: 87,
    simuladosFeitos: 1,
    redacoesEntregues: 0,
    mediaGeral: 48,
    frequencia: 61,
    activityDays: [false, true, false, false, true, false, true],
    weeklyProgress: [45, 47, 44, 46, 48, 47, 48],
    subjectPerformance: [
      { subject: "Linguagens", pct: 62, forte: true },
      { subject: "Ciências Humanas", pct: 55, forte: false },
      { subject: "Matemática", pct: 41, forte: false },
      { subject: "Ciências da Natureza", pct: 38, forte: false },
      { subject: "Redação", pct: 35, forte: false },
    ],
    financeiro: {
      status: "vence_em_breve",
      plano: "Semi-Extensivo Semestral",
      valor: "R$ 189,90",
      vencimento: "10/08/2025",
      metodoPagamento: "PIX",
      historico: [
        { id: "p5", date: "10/07/2025", valor: "R$ 189,90", status: "em_dia", metodo: "PIX" },
        { id: "p6", date: "10/06/2025", valor: "R$ 189,90", status: "em_dia", metodo: "PIX" },
        { id: "p7", date: "10/05/2025", valor: "R$ 189,90", status: "pendente", metodo: "PIX" },
        { id: "p8", date: "10/04/2025", valor: "R$ 189,90", status: "em_dia", metodo: "PIX" },
      ],
    },
    lastActivity: "Há 2 dias",
    nextEvent: "Redação — prazo: Sex, 18 jul",
    insights: [
      "Pedro está com frequência abaixo do esperado. Uma conversa pode ajudar.",
      "Matemática e Ciências da Natureza precisam de atenção urgente — média abaixo de 45%.",
      "Nenhuma redação enviada este mês. Incentive Pedro a usar o módulo de redações.",
    ],
  },
]

// ─── Atividades ──────────────────────────────────────────────────────────────

export const MOCK_ACTIVITIES: Activity[] = [
  {
    id: "a1",
    studentId: "student-ana",
    studentName: "Ana Luíza",
    type: "questao",
    desc: "Resolveu 20 questões de Matemática",
    date: "Hoje, 14h32",
    status: "concluido",
    detail: "Acertos: 17/20 (85%)",
  },
  {
    id: "a2",
    studentId: "student-pedro",
    studentName: "Pedro Henrique",
    type: "aula",
    desc: "Assistiu aula: Funções do 2º Grau",
    date: "Hoje, 11h15",
    status: "concluido",
    detail: "Duração: 48 min",
  },
  {
    id: "a3",
    studentId: "student-ana",
    studentName: "Ana Luíza",
    type: "aula",
    desc: "Assistiu aula: Revolução Industrial",
    date: "Ontem, 19h40",
    status: "concluido",
    detail: "Duração: 55 min",
  },
  {
    id: "a4",
    studentId: "student-ana",
    studentName: "Ana Luíza",
    type: "simulado",
    desc: "Simulado Geral ENEM — 1ª Aplicação",
    date: "Ontem, 08h00",
    status: "concluido",
    detail: "Nota: 712 pontos",
  },
  {
    id: "a5",
    studentId: "student-pedro",
    studentName: "Pedro Henrique",
    type: "questao",
    desc: "Resolveu 10 questões de Linguagens",
    date: "Há 2 dias, 16h20",
    status: "concluido",
    detail: "Acertos: 7/10 (70%)",
  },
  {
    id: "a6",
    studentId: "student-ana",
    studentName: "Ana Luíza",
    type: "redacao",
    desc: "Enviou redação: Tema de Julho",
    date: "Há 3 dias, 20h05",
    status: "pendente",
    detail: "Aguardando correção",
  },
  {
    id: "a7",
    studentId: "student-pedro",
    studentName: "Pedro Henrique",
    type: "checkin",
    desc: "Check-in diário realizado",
    date: "Há 4 dias, 07h30",
    status: "concluido",
  },
  {
    id: "a8",
    studentId: "student-ana",
    studentName: "Ana Luíza",
    type: "questao",
    desc: "Resolveu 15 questões de Química",
    date: "Há 4 dias, 15h10",
    status: "concluido",
    detail: "Acertos: 10/15 (67%)",
  },
  {
    id: "a9",
    studentId: "student-pedro",
    studentName: "Pedro Henrique",
    type: "redacao",
    desc: "Redação — prazo Julho",
    date: "Há 5 dias, 23h59",
    status: "atrasado",
    detail: "Prazo expirado sem envio",
  },
  {
    id: "a10",
    studentId: "student-ana",
    studentName: "Ana Luíza",
    type: "aula",
    desc: "Assistiu aula: Genética",
    date: "Há 5 dias, 18h00",
    status: "concluido",
    detail: "Duração: 62 min",
  },
  {
    id: "a11",
    studentId: "student-pedro",
    studentName: "Pedro Henrique",
    type: "simulado",
    desc: "Mini-simulado Matemática",
    date: "Há 6 dias, 14h45",
    status: "concluido",
    detail: "Nota: 520 pontos",
  },
  {
    id: "a12",
    studentId: "student-ana",
    studentName: "Ana Luíza",
    type: "questao",
    desc: "Resolveu 25 questões de História",
    date: "Há 7 dias, 09h30",
    status: "concluido",
    detail: "Acertos: 16/25 (64%)",
  },
]

// ─── Comunicados ─────────────────────────────────────────────────────────────

export const MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: "ann1",
    category: "evento",
    title: "Simulado ENEM — 2ª Aplicação: inscrições abertas",
    body: "As inscrições para o simulado geral de agosto já estão abertas. O evento acontecerá no dia 09/08 (sábado) às 08h. Garanta a vaga do seu filho agora na área do aluno.",
    date: "Hoje",
    read: false,
  },
  {
    id: "ann2",
    category: "pedagogico",
    title: "Reunião pedagógica — Julho 2025",
    body: "Convidamos todos os responsáveis para a reunião pedagógica do mês de julho. A reunião acontecerá de forma online no dia 22/07 às 19h pelo Google Meet. O link será enviado por email.",
    date: "Ontem",
    read: false,
  },
  {
    id: "ann3",
    category: "financeiro",
    title: "Lembrete de vencimento — mensalidade agosto",
    body: "A mensalidade de agosto vence em 10/08/2025. Caso já tenha realizado o pagamento, ignore este comunicado. Em caso de dúvidas, entre em contato pelo suporte.",
    date: "Há 2 dias",
    read: false,
  },
  {
    id: "ann4",
    category: "pedagogico",
    title: "Novo módulo: Redação comentada disponível",
    body: "Todos os alunos agora têm acesso ao módulo de redações comentadas com exemplos nota 1000 do ENEM. Incentive seu filho a acessar a área de Redações na plataforma.",
    date: "Há 3 dias",
    read: true,
  },
  {
    id: "ann5",
    category: "evento",
    title: "Aulão ao vivo: Matemática ENEM — vagas limitadas",
    body: "Na próxima sexta-feira (18/07) às 20h teremos um aulão ao vivo de Matemática focado nos tópicos mais cobrados no ENEM. Acesse a área de Aulões para confirmar presença.",
    date: "Há 4 dias",
    read: true,
  },
  {
    id: "ann6",
    category: "suporte",
    title: "Manutenção programada — domingo, 13/07 das 02h às 06h",
    body: "Informamos que a plataforma ficará indisponível no domingo (13/07) entre 02h e 06h para manutenção. Pedimos desculpas pelo inconveniente.",
    date: "Há 5 dias",
    read: true,
  },
  {
    id: "ann7",
    category: "pedagogico",
    title: "Resultado do simulado de junho já disponível",
    body: "Os resultados do simulado realizado em junho já estão disponíveis na plataforma. Os alunos podem acessar o gabarito comentado e a análise de desempenho por disciplina.",
    date: "Há 7 dias",
    read: true,
  },
  {
    id: "ann8",
    category: "financeiro",
    title: "Desconto para indicação — traga um amigo",
    body: "Indique um amigo e ganhe R$50 de desconto na próxima mensalidade. Peça ao seu filho para acessar o perfil e copiar o código de indicação personalizado.",
    date: "Há 10 dias",
    read: true,
  },
]

// ─── Reuniões ────────────────────────────────────────────────────────────────

export const MOCK_MEETINGS: Meeting[] = [
  {
    id: "m1",
    studentId: "student-pedro",
    studentName: "Pedro Henrique",
    date: "22/07/2025",
    time: "19h00",
    advisor: "Profa. Mariana Costa",
    type: "Acompanhamento pedagógico",
    status: "agendada",
    notes: "Foco em Matemática e Ciências da Natureza.",
  },
  {
    id: "m2",
    studentId: "student-ana",
    studentName: "Ana Luíza",
    date: "29/07/2025",
    time: "18h30",
    advisor: "Prof. Rodrigo Alves",
    type: "Orientação para o ENEM",
    status: "agendada",
    notes: "Revisão do plano de estudos para agosto.",
  },
  {
    id: "m3",
    studentId: "student-pedro",
    studentName: "Pedro Henrique",
    date: "10/06/2025",
    time: "19h00",
    advisor: "Profa. Mariana Costa",
    type: "Acompanhamento pedagógico",
    status: "realizada",
    notes: "Identificado déficit em Matemática. Plano de reforço criado.",
  },
  {
    id: "m4",
    studentId: "student-ana",
    studentName: "Ana Luíza",
    date: "20/05/2025",
    time: "18h00",
    advisor: "Prof. Rodrigo Alves",
    type: "Feedback de desempenho",
    status: "realizada",
    notes: "Aluno com bom progresso. Sugerido foco em Ciências Humanas.",
  },
  {
    id: "m5",
    studentId: "student-pedro",
    studentName: "Pedro Henrique",
    date: "15/04/2025",
    time: "19h30",
    advisor: "Profa. Mariana Costa",
    type: "Reunião inicial",
    status: "realizada",
    notes: "Primeiro contato. Metas estabelecidas para o semestre.",
  },
]

// ─── Alertas ─────────────────────────────────────────────────────────────────

export const MOCK_ALERTS: Alert[] = [
  {
    id: "alert1",
    tone: "warning",
    text: "Pedro Henrique está com frequência baixa (61%) e nenhuma redação enviada este mês.",
    actionLabel: "Ver acompanhamento",
    href: "/parent/alunos/student-pedro",
  },
  {
    id: "alert2",
    tone: "warning",
    text: "Mensalidade de Pedro vence em 3 dias (10/08). Verifique o pagamento.",
    actionLabel: "Ver financeiro",
    href: "/parent/financeiro",
  },
]

// ─── Responsável ─────────────────────────────────────────────────────────────

export const MOCK_PARENT = {
  name: "Carlos Ferreira",
  firstName: "Carlos",
}
