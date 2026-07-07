export const BRAND = "#2563EB"

export const STUDENT = {
  name: "Igor Cruz",
  email: "igor@mais-aprovacao.com.br",
  initial: "I",
  memberSince: "Abril de 2026",
  role: "student" as const,
  streak: 5,
  shields: 2,
  points: 340,
  rank: 67,
  totalStudents: 200,
  tier: "Explorador",
  nextTier: "Estrategista",
  tierMin: 0,
  tierMax: 199,
  nextTierMin: 200,
  nextTierMax: 449,
  monthGoal: "superar 26.7% em ENEM, UFU, UEG e UNESP",
  period: "Julho 2026",
  checkinDone: true,
  monthlyIdentity: "Forjador do Próximo Passo",
  monthlyIdentitySubtitle: "Avança com clareza, sem romantizar o esforço.",
}

export const CURRENT_LESSON = {
  title: "Biologia — Genética Mendeliana",
  lesson: 3,
  totalLessons: 12,
  professor: "Prof. Carlos",
  progress: 45,
  lastWatched: "Hoje às 19:20",
  subject: "Biologia",
  color: "#0F6E56",
}

export const SESSION_STATE = {
  current: 3,
  total: 20,
  pts: 20,
  correct: 2,
}

export interface Question {
  id: string
  subject: string
  discipline: string
  bank: string
  year: number
  difficulty: "Fácil" | "Médio" | "Difícil"
  context: string
  alternatives: { id: string; text: string }[]
  correctId: string
  subjectColor: string
}

export const QUESTIONS: Question[] = [
  {
    id: "q01",
    subject: "Língua Portuguesa",
    discipline: "Interpretação de Texto",
    bank: "UNESP",
    year: 2026,
    difficulty: "Médio",
    subjectColor: "#185FA5",
    context:
      `Leia o trecho: "A linguagem não é apenas um instrumento de comunicação; ela modela a realidade e constrói identidades." Com base nessa afirmação, assinale a alternativa que melhor expressa a função da linguagem segundo o autor.`,
    alternatives: [
      { id: "A", text: "A linguagem serve exclusivamente para transmitir informações objetivas entre falantes." },
      { id: "B", text: "A linguagem é um sistema neutro que reflete a realidade sem interferências culturais." },
      { id: "C", text: "A linguagem constitui e transforma a percepção que o sujeito tem do mundo e de si mesmo." },
      { id: "D", text: "A linguagem é determinada pela biologia, sendo idêntica em todas as culturas humanas." },
    ],
    correctId: "C",
  },
  {
    id: "q02",
    subject: "Matemática",
    discipline: "Funções",
    bank: "ENEM",
    year: 2025,
    difficulty: "Difícil",
    subjectColor: "#D97706",
    context:
      "Uma função quadrática f(x) = ax² + bx + c tem vértice em (2, -3) e passa pelo ponto (0, 1). Determine o valor de a + b + c.",
    alternatives: [
      { id: "A", text: "a + b + c = 1" },
      { id: "B", text: "a + b + c = 2" },
      { id: "C", text: "a + b + c = 3" },
      { id: "D", text: "a + b + c = 4" },
    ],
    correctId: "A",
  },
  {
    id: "q03",
    subject: "Química",
    discipline: "Termoquímica",
    bank: "UFU",
    year: 2024,
    difficulty: "Médio",
    subjectColor: "#534AB7",
    context:
      "Em uma reação exotérmica, a variação de entalpia (ΔH) é negativa. Isso significa que, durante o processo, o sistema libera energia para a vizinhança. Qual das alternativas abaixo representa corretamente uma reação exotérmica?",
    alternatives: [
      { id: "A", text: "Fotossíntese: CO₂ + H₂O → glicose + O₂" },
      { id: "B", text: "Combustão: CH₄ + 2O₂ → CO₂ + 2H₂O" },
      { id: "C", text: "Eletrólise da água: H₂O → H₂ + O₂" },
      { id: "D", text: "Dissolução de NaCl em água a frio" },
    ],
    correctId: "B",
  },
  {
    id: "q04",
    subject: "Física",
    discipline: "Mecânica",
    bank: "UEG",
    year: 2025,
    difficulty: "Fácil",
    subjectColor: "#0F6E56",
    context:
      "Um objeto de massa 5 kg repousa sobre uma superfície horizontal sem atrito. Uma força horizontal de 20 N é aplicada ao objeto. Qual é a aceleração resultante segundo a 2ª Lei de Newton?",
    alternatives: [
      { id: "A", text: "1 m/s²" },
      { id: "B", text: "2 m/s²" },
      { id: "C", text: "4 m/s²" },
      { id: "D", text: "100 m/s²" },
    ],
    correctId: "C",
  },
  {
    id: "q05",
    subject: "Biologia",
    discipline: "Genética",
    bank: "ENEM",
    year: 2024,
    difficulty: "Difícil",
    subjectColor: "#0F6E56",
    context:
      "Em cruzamentos dihíbridos, quando os genes estão em cromossomos diferentes, a proporção fenotípica esperada na geração F2 é de 9:3:3:1. Qual princípio mendeliano está sendo demonstrado nessa situação?",
    alternatives: [
      { id: "A", text: "Lei da Dominância" },
      { id: "B", text: "Lei da Segregação" },
      { id: "C", text: "Lei da Segregação Independente" },
      { id: "D", text: "Lei da Herança Ligada ao Sexo" },
    ],
    correctId: "C",
  },
  {
    id: "q06",
    subject: "História",
    discipline: "História do Brasil",
    bank: "UFG",
    year: 2023,
    difficulty: "Médio",
    subjectColor: "#D14000",
    context:
      "O processo de abolição da escravidão no Brasil (1888) foi precedido por uma série de medidas graduais. Assinale a alternativa que apresenta a sequência cronológica correta dessas leis.",
    alternatives: [
      { id: "A", text: "Lei do Ventre Livre → Lei do Sexagenário → Lei Áurea" },
      { id: "B", text: "Lei Áurea → Lei do Ventre Livre → Lei do Sexagenário" },
      { id: "C", text: "Lei do Sexagenário → Lei Áurea → Lei do Ventre Livre" },
      { id: "D", text: "Lei do Ventre Livre → Lei Áurea → Lei do Sexagenário" },
    ],
    correctId: "A",
  },
  {
    id: "q07",
    subject: "Geografia",
    discipline: "Geopolítica",
    bank: "UNESP",
    year: 2022,
    difficulty: "Fácil",
    subjectColor: "#185FA5",
    context:
      "O fenômeno da urbanização acelerada em países em desenvolvimento gerou a formação de grandes metrópoles com sérios problemas socioambientais. Qual dos processos abaixo está diretamente associado a esse contexto?",
    alternatives: [
      { id: "A", text: "Êxodo rural e formação de periferias urbanas sem infraestrutura adequada." },
      { id: "B", text: "Redução das taxas de natalidade nas áreas rurais e aumento do envelhecimento." },
      { id: "C", text: "Diminuição da densidade demográfica nas capitais e crescimento das cidades médias." },
      { id: "D", text: "Distribuição homogênea da população pelo território nacional." },
    ],
    correctId: "A",
  },
  {
    id: "q08",
    subject: "Inglês",
    discipline: "Interpretação",
    bank: "ENEM",
    year: 2026,
    difficulty: "Fácil",
    subjectColor: "#534AB7",
    context:
      `Read the sentence: "Despite the heavy rain, they decided to go ahead with the outdoor event." The word 'despite' introduces a relationship of:`,
    alternatives: [
      { id: "A", text: "Cause and effect" },
      { id: "B", text: "Contrast or concession" },
      { id: "C", text: "Time sequence" },
      { id: "D", text: "Addition of information" },
    ],
    correctId: "B",
  },
  {
    id: "q09",
    subject: "Matemática",
    discipline: "Geometria",
    bank: "UFU",
    year: 2023,
    difficulty: "Médio",
    subjectColor: "#D97706",
    context:
      "Um triângulo retângulo tem catetos medindo 6 cm e 8 cm. Qual é o comprimento da hipotenusa e a área do triângulo, respectivamente?",
    alternatives: [
      { id: "A", text: "10 cm e 24 cm²" },
      { id: "B", text: "12 cm e 48 cm²" },
      { id: "C", text: "10 cm e 48 cm²" },
      { id: "D", text: "14 cm e 24 cm²" },
    ],
    correctId: "A",
  },
  {
    id: "q10",
    subject: "Química",
    discipline: "Química Orgânica",
    bank: "ENEM",
    year: 2022,
    difficulty: "Difícil",
    subjectColor: "#534AB7",
    context:
      "Os hidrocarbonetos aromáticos contêm anéis benzênicos com elétrons deslocalizados. O benzeno (C₆H₆) apresenta propriedades únicas devido à sua estrutura. Qual das seguintes afirmações sobre o benzeno é correta?",
    alternatives: [
      { id: "A", text: "O benzeno sofre facilmente reações de adição, pois possui duplas ligações." },
      { id: "B", text: "O benzeno é altamente reativo com oxidantes comuns como KMnO₄." },
      { id: "C", text: "O benzeno prefere reações de substituição eletrofílica para manter a aromaticidade." },
      { id: "D", text: "O benzeno possui ligações simples e duplas alternadas distintas, como no butadieno." },
    ],
    correctId: "C",
  },
  {
    id: "q11",
    subject: "Física",
    discipline: "Eletromagnetismo",
    bank: "UEG",
    year: 2024,
    difficulty: "Difícil",
    subjectColor: "#0F6E56",
    context:
      "A lei de Faraday estabelece que a força eletromotriz (fem) induzida em um circuito é proporcional à taxa de variação do fluxo magnético. Um solenóide com 200 espiras tem o fluxo magnético variando de 0,5 Wb a 1,5 Wb em 2 segundos. Qual é a fem induzida?",
    alternatives: [
      { id: "A", text: "50 V" },
      { id: "B", text: "100 V" },
      { id: "C", text: "200 V" },
      { id: "D", text: "400 V" },
    ],
    correctId: "B",
  },
  {
    id: "q12",
    subject: "Biologia",
    discipline: "Ecologia",
    bank: "UFG",
    year: 2025,
    difficulty: "Médio",
    subjectColor: "#0F6E56",
    context:
      "O bioma Cerrado brasileiro é considerado um hotspot de biodiversidade. Uma das principais ameaças a esse bioma é a expansão agrícola. Qual das alternativas abaixo descreve corretamente uma consequência dessa expansão?",
    alternatives: [
      { id: "A", text: "Aumento da biodiversidade local pela introdução de espécies exóticas cultivadas." },
      { id: "B", text: "Redução da erosão do solo pela cobertura vegetal das monoculturas." },
      { id: "C", text: "Fragmentação de habitats e perda de corredores ecológicos para a fauna nativa." },
      { id: "D", text: "Elevação do nível do lençol freático pela irrigação intensiva das lavouras." },
    ],
    correctId: "C",
  },
  {
    id: "q13",
    subject: "História",
    discipline: "História Mundial",
    bank: "ENEM",
    year: 2023,
    difficulty: "Médio",
    subjectColor: "#D14000",
    context:
      "A Segunda Guerra Mundial (1939–1945) foi um conflito global marcado por atrocidades como o Holocausto. A criação da ONU em 1945 visava principalmente a qual objetivo?",
    alternatives: [
      { id: "A", text: "Estabelecer uma moeda global única para facilitar o comércio internacional." },
      { id: "B", text: "Promover a cooperação internacional e prevenir novos conflitos armados em larga escala." },
      { id: "C", text: "Distribuir os territórios coloniais entre as potências vencedoras da guerra." },
      { id: "D", text: "Criar um exército supranacional permanente para substituir as forças nacionais." },
    ],
    correctId: "B",
  },
  {
    id: "q14",
    subject: "Língua Portuguesa",
    discipline: "Gramática",
    bank: "UFU",
    year: 2026,
    difficulty: "Fácil",
    subjectColor: "#185FA5",
    context:
      "Identifique a oração que apresenta uso correto da norma culta da língua portuguesa em relação à concordância verbal.",
    alternatives: [
      { id: "A", text: "Fazem dois anos que não vejo meus amigos." },
      { id: "B", text: "Havia muitos candidatos inscritos no processo seletivo." },
      { id: "C", text: "Existem uma série de problemas a ser resolvidos." },
      { id: "D", text: "Houveram muitos incidentes durante o evento." },
    ],
    correctId: "B",
  },
  {
    id: "q15",
    subject: "Matemática",
    discipline: "Probabilidade",
    bank: "UNESP",
    year: 2024,
    difficulty: "Médio",
    subjectColor: "#D97706",
    context:
      "Em uma urna com 5 bolas vermelhas e 3 bolas azuis, retira-se uma bola aleatoriamente sem reposição. Em seguida, retira-se outra bola. Qual é a probabilidade de ambas serem vermelhas?",
    alternatives: [
      { id: "A", text: "25/64" },
      { id: "B", text: "20/56" },
      { id: "C", text: "5/14" },
      { id: "D", text: "10/28" },
    ],
    correctId: "C",
  },
  {
    id: "q16",
    subject: "Física",
    discipline: "Óptica",
    bank: "ENEM",
    year: 2022,
    difficulty: "Fácil",
    subjectColor: "#0F6E56",
    context:
      "A velocidade da luz no vácuo é aproximadamente 3×10⁸ m/s. Quando a luz passa do vácuo para um meio com índice de refração n=1,5, qual é a nova velocidade da luz nesse meio?",
    alternatives: [
      { id: "A", text: "4,5×10⁸ m/s" },
      { id: "B", text: "3×10⁸ m/s" },
      { id: "C", text: "2×10⁸ m/s" },
      { id: "D", text: "1,5×10⁸ m/s" },
    ],
    correctId: "C",
  },
  {
    id: "q17",
    subject: "Geografia",
    discipline: "Climatologia",
    bank: "UEG",
    year: 2023,
    difficulty: "Médio",
    subjectColor: "#185FA5",
    context:
      "O fenômeno El Niño é caracterizado pelo aquecimento anormal das águas superficiais do Oceano Pacífico equatorial. Qual dos efeitos abaixo está associado ao El Niño no Brasil?",
    alternatives: [
      { id: "A", text: "Aumento das chuvas na região Nordeste e seca no Sul do país." },
      { id: "B", text: "Redução das temperaturas na Amazônia e geadas no Sudeste." },
      { id: "C", text: "Chuvas acima do normal na região Sul e seca mais intensa no Nordeste." },
      { id: "D", text: "Distribuição uniforme das chuvas em todo o território nacional." },
    ],
    correctId: "C",
  },
  {
    id: "q18",
    subject: "Inglês",
    discipline: "Gramática",
    bank: "UFG",
    year: 2024,
    difficulty: "Médio",
    subjectColor: "#534AB7",
    context:
      "Choose the sentence that correctly uses the present perfect tense to indicate an action that occurred at an unspecified time in the past with current relevance.",
    alternatives: [
      { id: "A", text: "She was living in Paris for five years." },
      { id: "B", text: "She has lived in Paris for five years." },
      { id: "C", text: "She lived in Paris since 2019." },
      { id: "D", text: "She is living in Paris since 2019." },
    ],
    correctId: "B",
  },
  {
    id: "q19",
    subject: "Química",
    discipline: "Equilíbrio Químico",
    bank: "UNESP",
    year: 2025,
    difficulty: "Difícil",
    subjectColor: "#534AB7",
    context:
      "No equilíbrio: N₂(g) + 3H₂(g) ⇌ 2NH₃(g), ΔH = -92 kJ. De acordo com o Princípio de Le Chatelier, qual das perturbações abaixo favorecerá a produção de amônia?",
    alternatives: [
      { id: "A", text: "Aumento da temperatura do sistema." },
      { id: "B", text: "Diminuição da pressão total do sistema." },
      { id: "C", text: "Adição de um catalisador inerte ao sistema." },
      { id: "D", text: "Aumento da pressão total e remoção contínua de NH₃." },
    ],
    correctId: "D",
  },
  {
    id: "q20",
    subject: "Biologia",
    discipline: "Fisiologia",
    bank: "ENEM",
    year: 2026,
    difficulty: "Fácil",
    subjectColor: "#0F6E56",
    context:
      "O sistema nervoso autônomo regula funções involuntárias do organismo. A divisão simpática prepara o corpo para situações de estresse. Qual das respostas abaixo é característica da ativação simpática?",
    alternatives: [
      { id: "A", text: "Diminuição da frequência cardíaca e aumento da motilidade intestinal." },
      { id: "B", text: "Constrição das pupilas e aumento da salivação." },
      { id: "C", text: "Aumento da frequência cardíaca, dilatação dos brônquios e inibição da digestão." },
      { id: "D", text: "Contração da bexiga e relaxamento dos esfíncteres." },
    ],
    correctId: "C",
  },
]

export interface Exam {
  id: string
  title: string
  bank: string
  subject: string
  date: string
  score: number
  totalQuestions: number
  duration: string
}

export const EXAMS: Exam[] = [
  { id: "e01", title: "Linguagens · UFG", bank: "UFG", subject: "Linguagens", date: "28/06/2026", score: 12.5, totalQuestions: 8, duration: "4min 12s" },
  { id: "e02", title: "Linguagens · UFG", bank: "UFG", subject: "Linguagens", date: "25/06/2026", score: 12.5, totalQuestions: 8, duration: "3min 45s" },
  { id: "e03", title: "Linguagens · UFG", bank: "UFG", subject: "Linguagens", date: "22/06/2026", score: 4.2, totalQuestions: 8, duration: "2min 10s" },
  { id: "e04", title: "Linguagens · UFG", bank: "UFG", subject: "Linguagens", date: "18/06/2026", score: 8.3, totalQuestions: 8, duration: "3min 02s" },
  { id: "e05", title: "Linguagens · UFG", bank: "UFG", subject: "Linguagens", date: "14/06/2026", score: 0, totalQuestions: 8, duration: "38s" },
  { id: "e06", title: "Linguagens · UFG", bank: "UFG", subject: "Linguagens", date: "10/06/2026", score: 16.7, totalQuestions: 8, duration: "3min 55s" },
  { id: "e07", title: "Linguagens · UFG", bank: "UFG", subject: "Linguagens", date: "07/06/2026", score: 9.1, totalQuestions: 8, duration: "2min 48s" },
  { id: "e08", title: "Linguagens · UFG", bank: "UFG", subject: "Linguagens", date: "04/06/2026", score: 12.5, totalQuestions: 8, duration: "4min 01s" },
  { id: "e09", title: "Linguagens · UFG", bank: "UFG", subject: "Linguagens", date: "01/06/2026", score: 6.3, totalQuestions: 8, duration: "2min 33s" },
]

export const RANKING_PODIUM = [
  { rank: 1, name: "Marcus", pts: 734, initial: "M", color: "#185FA5" },
  { rank: 2, name: "Anny", pts: 618, initial: "A", color: "#534AB7" },
  { rank: 3, name: "Gabriela", pts: 590, initial: "G", color: "#0F6E56" },
]

// Vizinhos diretos no ranking — 1 acima, você, 1 abaixo
export const RANKING_NEIGHBORS = [
  { rank: 66, name: "Túlio Andrade", initial: "T", pts: 352, color: "#0E8A5F", isMe: false },
  { rank: 67, name: "Igor Cruz", initial: "I", pts: 340, color: "#1B4DE4", isMe: true },
  { rank: 68, name: "Larissa Moreira", initial: "L", pts: 331, color: "#6C4BD9", isMe: false },
]

export const RANKING_HISTORY = [
  { month: "Julho/2026", rank: 67, pts: 340, identity: "Forjador do Próximo Passo", tier: "Explorador", delta: -52 },
  { month: "Maio/2026", rank: 15, pts: 54, identity: "Curador do Conhecimento", tier: "Explorador", delta: -12 },
  { month: "Abril/2026", rank: 3, pts: 112, identity: "Rota da Conquista", tier: "Explorador", delta: null },
]

export interface Essay {
  id: string
  type: "ENEM" | "UFU" | "UEG" | "FUVEST" | "VUNESP"
  theme: string
  status: "Corrigida" | "Aguardando" | "Enviada"
  score?: number
  maxScore: number
  date: string
  competencies?: { c: number; score: number; maxScore: number }[]
}

export const ESSAYS: Essay[] = [
  {
    id: "r01",
    type: "ENEM",
    theme: "Desafios da inclusão digital no Brasil",
    status: "Corrigida",
    score: 780,
    maxScore: 1000,
    date: "05/06/2026",
    competencies: [
      { c: 1, score: 160, maxScore: 200 },
      { c: 2, score: 140, maxScore: 200 },
      { c: 3, score: 160, maxScore: 200 },
      { c: 4, score: 160, maxScore: 200 },
      { c: 5, score: 160, maxScore: 200 },
    ],
  },
  {
    id: "r02",
    type: "ENEM",
    theme: "Crise hídrica e papel do Estado",
    status: "Corrigida",
    score: 720,
    maxScore: 1000,
    date: "28/05/2026",
    competencies: [
      { c: 1, score: 140, maxScore: 200 },
      { c: 2, score: 160, maxScore: 200 },
      { c: 3, score: 140, maxScore: 200 },
      { c: 4, score: 140, maxScore: 200 },
      { c: 5, score: 140, maxScore: 200 },
    ],
  },
  {
    id: "r03",
    type: "UFU",
    theme: "Violência urbana: causas e soluções",
    status: "Aguardando",
    maxScore: 100,
    date: "02/07/2026",
  },
]

export interface Lesson {
  id: string
  courseTitle: string
  professor: string
  subject: string
  color: string
  lessonNumber: number
  title: string
  duration: string
  status: "Não iniciada" | "Em andamento" | "Concluída"
  progress?: number
}

export const LESSONS: Lesson[] = [
  { id: "l01", courseTitle: "Biologia — Genética Mendeliana", professor: "Prof. Carlos", subject: "Biologia", color: "#0F6E56", lessonNumber: 1, title: "Introdução à Genética", duration: "45min", status: "Concluída" },
  { id: "l02", courseTitle: "Biologia — Genética Mendeliana", professor: "Prof. Carlos", subject: "Biologia", color: "#0F6E56", lessonNumber: 2, title: "Primeira Lei de Mendel", duration: "48min", status: "Concluída" },
  { id: "l03", courseTitle: "Biologia — Genética Mendeliana", professor: "Prof. Carlos", subject: "Biologia", color: "#0F6E56", lessonNumber: 3, title: "Herança Mendeliana", duration: "45min", status: "Em andamento", progress: 45 },
  { id: "l04", courseTitle: "Biologia — Genética Mendeliana", professor: "Prof. Carlos", subject: "Biologia", color: "#0F6E56", lessonNumber: 4, title: "Segunda Lei de Mendel", duration: "42min", status: "Não iniciada" },
  { id: "l05", courseTitle: "Matemática — Funções do 2° Grau", professor: "Prof. Ana", subject: "Matemática", color: "#D97706", lessonNumber: 1, title: "Introdução às Funções", duration: "50min", status: "Concluída" },
  { id: "l06", courseTitle: "Matemática — Funções do 2° Grau", professor: "Prof. Ana", subject: "Matemática", color: "#D97706", lessonNumber: 2, title: "Função Quadrática", duration: "52min", status: "Concluída" },
  { id: "l07", courseTitle: "Matemática — Funções do 2° Grau", professor: "Prof. Ana", subject: "Matemática", color: "#D97706", lessonNumber: 3, title: "Gráfico da Parábola", duration: "48min", status: "Não iniciada" },
  { id: "l08", courseTitle: "Língua Portuguesa — Análise Sintática", professor: "Prof. Marcos", subject: "Língua Portuguesa", color: "#185FA5", lessonNumber: 1, title: "Termos Essenciais da Oração", duration: "40min", status: "Concluída" },
  { id: "l09", courseTitle: "Língua Portuguesa — Análise Sintática", professor: "Prof. Marcos", subject: "Língua Portuguesa", color: "#185FA5", lessonNumber: 2, title: "Termos Integrantes", duration: "38min", status: "Concluída" },
  { id: "l10", courseTitle: "Língua Portuguesa — Análise Sintática", professor: "Prof. Marcos", subject: "Língua Portuguesa", color: "#185FA5", lessonNumber: 3, title: "Termos Acessórios", duration: "42min", status: "Não iniciada" },
  { id: "l11", courseTitle: "História — Segunda Guerra Mundial", professor: "Prof. Julia", subject: "História", color: "#D14000", lessonNumber: 1, title: "Contexto Pré-Guerra", duration: "55min", status: "Concluída" },
  { id: "l12", courseTitle: "História — Segunda Guerra Mundial", professor: "Prof. Julia", subject: "História", color: "#D14000", lessonNumber: 2, title: "O Conflito e o Holocausto", duration: "58min", status: "Não iniciada" },
]

export const SUBJECTS_PERFORMANCE = [
  { subject: "Língua Portuguesa", attempts: 198, correct: 25, color: "#185FA5" },
  { subject: "Inglês", attempts: 45, correct: 1, color: "#534AB7" },
  { subject: "História", attempts: 3, correct: 1, color: "#D14000" },
  { subject: "Biologia", attempts: 2, correct: 0, color: "#0F6E56" },
]

export const COMPETENCIES = [
  { label: "C1", name: "Domínio da norma culta", score: 160, max: 200 },
  { label: "C2", name: "Compreensão do tema", score: 140, max: 200 },
  { label: "C3", name: "Seleção e organização das informações", score: 160, max: 200 },
  { label: "C4", name: "Coerência e coesão", score: 160, max: 200 },
  { label: "C5", name: "Proposta de intervenção", score: 160, max: 200 },
]

export const FAQS = [
  {
    id: "f01",
    category: "Redações",
    question: "Como enviar minha redação?",
    answer:
      "Para enviar sua redação, acesse a tela 'Redações' e clique em '+ Nova Redação'. Você pode digitar o texto diretamente ou fazer o upload de uma foto da redação manuscrita. Após revisar, clique em 'Enviar para correção'. O prazo de retorno é de até 5 dias úteis.",
  },
  {
    id: "f02",
    category: "Ranking",
    question: "Como funciona o sistema de pontos e ranking?",
    answer:
      "Você acumula pontos ao resolver questões (10–25 pts por acerto dependendo da dificuldade), completar simulados (50 pts), enviar redações (30 pts) e fazer check-in diário (5 pts). O ranking mensal é calculado com base na soma de todos os pontos acumulados no mês corrente. No primeiro dia de cada mês, os top 3 recebem um reconhecimento especial.",
  },
  {
    id: "f03",
    category: "Questões",
    question: "O que é a ofensiva de streak?",
    answer:
      "A ofensiva (ou streak) é um contador de dias consecutivos em que você realizou pelo menos uma atividade na plataforma — seja resolver questões, fazer check-in ou enviar redação. Se um dia passar sem atividade, o streak é zerado. Você pode proteger seu streak usando Escudos, que são ganhos ao atingir marcos como 7 dias consecutivos.",
  },
  {
    id: "f04",
    category: "Redações",
    question: "Como interpretar as competências da minha redação?",
    answer:
      "As redações ENEM são avaliadas em 5 competências, cada uma valendo até 200 pontos: C1 (domínio da norma culta da língua portuguesa), C2 (compreensão da proposta e aplicação de conceitos das áreas de conhecimento), C3 (seleção e organização das informações), C4 (uso dos mecanismos linguísticos de coerência e coesão) e C5 (elaboração de proposta de intervenção). A nota final é a soma das 5 competências.",
  },
  {
    id: "f05",
    category: "Conta",
    question: "Esqueci minha senha. Como recuperar o acesso?",
    answer:
      "Na tela de login, clique em 'Esqueci minha senha'. Você receberá um link de redefinição no seu email cadastrado (igor@mais-aprovacao.com.br). O link é válido por 24 horas. Após redefinir a senha, faça login normalmente. Se não receber o email, verifique a caixa de spam ou entre em contato com o suporte.",
  },
]

export const CLASS_ACTIVITY = [
  { name: "Rafaella", initial: "R", color: "#534AB7", action: "resolveu 12 questões de Química", time: "2h atrás", icon: "questoes" },
  { name: "Pedro", initial: "P", color: "#185FA5", action: "completou um simulado de Física", time: "3h atrás", icon: "simulados" },
  { name: "Ana", initial: "A", color: "#0F6E56", action: "enviou uma redação ENEM", time: "4h atrás", icon: "redacoes" },
  { name: "Marcus", initial: "M", color: "#185FA5", action: "atingiu 700 pts no mês 🏆", time: "6h atrás", icon: "ranking" },
  { name: "Gabriela", initial: "G", color: "#0F6E56", action: "completou 30 dias de ofensiva 🔥", time: "8h atrás", icon: "streak" },
  { name: "Larissa", initial: "L", color: "#6C4BD9", action: "concluiu o módulo de Genética", time: "ontem", icon: "aulas" },
]

export const LEVELS = [
  { name: "Explorador", min: 0, max: 199, color: "#1B4DE4", motto: "Todo mapa começa no primeiro passo." },
  { name: "Estrategista", min: 200, max: 449, color: "#6C4BD9", motto: "Estudar com plano vale por dois." },
  { name: "Veterano", min: 450, max: 799, color: "#0E8A5F", motto: "Constância vira reputação." },
  { name: "Elite", min: 800, max: 1499, color: "#D97706", motto: "Entre os que puxam o ritmo da turma." },
  { name: "Lendário", min: 1500, max: 9999, color: "#B78600", motto: "O nome que a turma lembra no dia da prova." },
]

export const PREVIOUS_MONTHS = [
  { month: "Maio/2026", label: "MAIO 2026", identity: "Curador do Conhecimento", pts: 54, rank: 15, tier: "Explorador", tierColor: "#1B4DE4", delta: -58, questions: 61, essays: 2, exams: 1 },
  { month: "Abril/2026", label: "ABRIL 2026", identity: "Rota da Conquista", pts: 112, rank: 3, tier: "Explorador", tierColor: "#1B4DE4", delta: null, questions: 140, essays: 4, exams: 3 },
]

// ─── Corrida para aprovação (barra com marcos) ───────────────────────────────

export const RACE = {
  points: 340,
  target: 1000,
  milestones: [250, 500, 750, 1000],
  leaderPts: 734, // Marcus, 1º lugar
}

// ─── Metadados de questões (estatísticas + explicação + aula relacionada) ────

export interface QuestionMeta {
  pctCorrect: number
  dist: Record<string, number>
  explanation: string
  lessonId?: string
  lessonTitle?: string
}

export const QUESTION_META: Record<string, QuestionMeta> = {
  q01: {
    pctCorrect: 58,
    dist: { A: 14, B: 18, C: 58, D: 10 },
    explanation:
      "O autor nega a visão instrumental (\"não é apenas um instrumento\") e afirma que a linguagem \"modela a realidade e constrói identidades\" — ou seja, ela constitui a percepção do sujeito. As demais alternativas reduzem a linguagem a transmissão neutra ou biológica.",
    lessonId: "l08",
    lessonTitle: "Termos Essenciais da Oração",
  },
  q02: {
    pctCorrect: 31,
    dist: { A: 31, B: 27, C: 24, D: 18 },
    explanation:
      "Com vértice em (2, -3) e ponto (0, 1): c = 1; do vértice, -b/2a = 2 e f(2) = -3. Resolvendo, a = 1, b = -4, c = 1, logo a + b + c = -2 + 3 = 1... a soma é f(1) = 1 - 4 + 1 = -2 + 3 = 1. Alternativa A.",
    lessonId: "l06",
    lessonTitle: "Função Quadrática",
  },
  q03: {
    pctCorrect: 64,
    dist: { A: 12, B: 64, C: 15, D: 9 },
    explanation:
      "Combustão libera calor para a vizinhança (ΔH < 0), sendo o exemplo clássico de reação exotérmica. Fotossíntese e eletrólise absorvem energia (endotérmicas).",
  },
  q04: {
    pctCorrect: 78,
    dist: { A: 6, B: 9, C: 78, D: 7 },
    explanation: "Pela 2ª Lei de Newton, a = F/m = 20 N ÷ 5 kg = 4 m/s².",
  },
  q05: {
    pctCorrect: 42,
    dist: { A: 11, B: 33, C: 42, D: 14 },
    explanation:
      "A proporção 9:3:3:1 em F2 de cruzamento dihíbrido demonstra que os alelos de genes diferentes segregam de forma independente — a 3ª Lei (Segregação Independente).",
    lessonId: "l03",
    lessonTitle: "Herança Mendeliana",
  },
  q06: {
    pctCorrect: 55,
    dist: { A: 55, B: 17, C: 13, D: 15 },
    explanation:
      "Ventre Livre (1871) → Sexagenários (1885) → Lei Áurea (1888): a abolição foi gradual, culminando na Lei Áurea.",
  },
  q07: {
    pctCorrect: 71,
    dist: { A: 71, B: 12, C: 10, D: 7 },
    explanation:
      "A urbanização acelerada sem planejamento gera êxodo rural e periferias sem infraestrutura — processo típico de países em desenvolvimento.",
  },
  q08: {
    pctCorrect: 69,
    dist: { A: 13, B: 69, C: 9, D: 9 },
    explanation:
      "\"Despite\" introduz concessão/contraste: apesar da chuva, o evento foi mantido.",
  },
  q09: {
    pctCorrect: 66,
    dist: { A: 66, B: 11, C: 15, D: 8 },
    explanation:
      "Pitágoras: h² = 6² + 8² = 100 → h = 10 cm. Área = (6 × 8)/2 = 24 cm².",
    lessonId: "l06",
    lessonTitle: "Função Quadrática",
  },
  q10: {
    pctCorrect: 38,
    dist: { A: 22, B: 19, C: 38, D: 21 },
    explanation:
      "A aromaticidade estabiliza o anel; por isso o benzeno prefere substituição eletrofílica, que preserva o sistema de elétrons deslocalizados.",
  },
  q11: {
    pctCorrect: 35,
    dist: { A: 25, B: 35, C: 26, D: 14 },
    explanation:
      "fem = N·ΔΦ/Δt = 200 × (1,0 Wb ÷ 2 s) = 100 V.",
  },
  q12: {
    pctCorrect: 61,
    dist: { A: 10, B: 12, C: 61, D: 17 },
    explanation:
      "A expansão agrícola fragmenta habitats contínuos do Cerrado, rompendo corredores ecológicos usados pela fauna.",
  },
  q13: {
    pctCorrect: 73,
    dist: { A: 8, B: 73, C: 12, D: 7 },
    explanation:
      "A ONU nasceu em 1945 para promover cooperação internacional e evitar novos conflitos em escala mundial.",
    lessonId: "l12",
    lessonTitle: "O Conflito e o Holocausto",
  },
  q14: {
    pctCorrect: 52,
    dist: { A: 21, B: 52, C: 14, D: 13 },
    explanation:
      "\"Haver\" no sentido de existir é impessoal: \"Havia muitos candidatos\". \"Fazem dois anos\" e \"Houveram\" violam a norma culta.",
    lessonId: "l08",
    lessonTitle: "Termos Essenciais da Oração",
  },
  q15: {
    pctCorrect: 47,
    dist: { A: 20, B: 18, C: 47, D: 15 },
    explanation:
      "P = (5/8) × (4/7) = 20/56 = 5/14 — sem reposição, o segundo sorteio tem 4 vermelhas em 7 bolas.",
  },
  q16: {
    pctCorrect: 74,
    dist: { A: 7, B: 11, C: 74, D: 8 },
    explanation: "v = c/n = 3×10⁸ ÷ 1,5 = 2×10⁸ m/s.",
  },
  q17: {
    pctCorrect: 59,
    dist: { A: 16, B: 12, C: 59, D: 13 },
    explanation:
      "No Brasil, o El Niño intensifica chuvas no Sul e agrava a seca no Nordeste.",
  },
  q18: {
    pctCorrect: 63,
    dist: { A: 13, B: 63, C: 14, D: 10 },
    explanation:
      "Present perfect com \"for\" indica ação iniciada no passado que persiste: \"She has lived in Paris for five years\".",
  },
  q19: {
    pctCorrect: 29,
    dist: { A: 18, B: 24, C: 29, D: 29 },
    explanation:
      "Le Chatelier: aumentar a pressão desloca para o lado com menos mols de gás (produtos) e remover NH₃ puxa o equilíbrio para repor o produto retirado.",
  },
  q20: {
    pctCorrect: 76,
    dist: { A: 6, B: 8, C: 76, D: 10 },
    explanation:
      "A ativação simpática prepara para \"luta ou fuga\": taquicardia, broncodilatação e inibição da digestão.",
    lessonId: "l03",
    lessonTitle: "Herança Mendeliana",
  },
}

// ─── Estatísticas de simulados (percentil, média da turma, nota estimada) ────

export interface ExamStats {
  classAvg: number
  percentile: number
  estimatedScore: number // nota estimada na escala da prova (TRI p/ ENEM)
}

export const EXAM_STATS: Record<string, ExamStats> = {
  e01: { classAvg: 9.8, percentile: 62, estimatedScore: 468 },
  e02: { classAvg: 9.8, percentile: 62, estimatedScore: 468 },
  e03: { classAvg: 10.4, percentile: 22, estimatedScore: 402 },
  e04: { classAvg: 9.1, percentile: 45, estimatedScore: 436 },
  e05: { classAvg: 8.7, percentile: 4, estimatedScore: 350 },
  e06: { classAvg: 10.2, percentile: 71, estimatedScore: 501 },
  e07: { classAvg: 9.5, percentile: 48, estimatedScore: 442 },
  e08: { classAvg: 9.0, percentile: 60, estimatedScore: 468 },
  e09: { classAvg: 8.8, percentile: 33, estimatedScore: 418 },
}

export const EXAM_SUMMARY = {
  done: 9,
  avg: 7.1,
  best: 16.7,
  rank: 67,
  classAvg: 9.5,
  estimatedEnem: 442,
}

// ─── Correção de redação em profundidade (r01) ───────────────────────────────

export interface EssaySegment {
  text: string
  comp?: 1 | 2 | 3 | 4 | 5 // trecho grifado ligado a uma competência
}

export interface CompetencyReview {
  c: 1 | 2 | 3 | 4 | 5
  name: string
  score: number
  max: number
  comment: string
  before: string
  after: string
}

export const ESSAY_REVIEW: {
  essayId: string
  paragraphs: EssaySegment[][]
  competencies: CompetencyReview[]
} = {
  essayId: "r01",
  paragraphs: [
    [
      { text: "A Constituição Federal de 1988 assegura a todos os cidadãos o acesso à informação. Entretanto, " },
      { text: "no Brasil contemporâneo, milhões de pessoas permanece à margem do universo digital", comp: 1 },
      { text: ", seja pela ausência de infraestrutura, seja pelo custo dos equipamentos. Dessa forma, a inclusão digital configura-se como um desafio que exige ação coordenada entre Estado, escolas e sociedade civil." },
    ],
    [
      { text: "Em primeira análise, é importante destacar a dimensão territorial do problema. " },
      { text: "Segundo dados do IBGE, cerca de 30% dos domicílios rurais não possuem acesso à internet banda larga", comp: 2 },
      { text: ", o que aprofunda desigualdades históricas entre campo e cidade. " },
      { text: "Nesse contexto, o filósofo Pierre Lévy argumenta que a cibercultura amplia as possibilidades de construção coletiva do saber — benefício que, no entanto, só alcança quem está conectado.", comp: 3 },
    ],
    [
      { text: "Ademais, a exclusão digital compromete o exercício da cidadania. Serviços essenciais — do agendamento no SUS à emissão de documentos — migraram para plataformas online. " },
      { text: "Além disso, também é válido ressaltar ainda que a escola pública sofre com a falta de equipamentos", comp: 4 },
      { text: ", limitando o letramento digital justamente da população que mais depende dele para ascender socialmente." },
    ],
    [
      { text: "Portanto, o poder público deve agir para democratizar o acesso à rede. " },
      { text: "Cabe ao Ministério das Comunicações expandir o programa de banda larga nas escolas e subsidiar equipamentos para famílias de baixa renda", comp: 5 },
      { text: ", em parceria com ONGs de letramento digital, a fim de que a inclusão digital deixe de ser privilégio e se torne, de fato, um direito de todos." },
    ],
  ],
  competencies: [
    {
      c: 1,
      name: "Domínio da norma culta",
      score: 160,
      max: 200,
      comment:
        "Bom domínio geral, com desvio pontual de concordância verbal no 1º parágrafo.",
      before: "milhões de pessoas permanece à margem do universo digital",
      after: "milhões de pessoas permanecem à margem do universo digital",
    },
    {
      c: 2,
      name: "Compreensão do tema",
      score: 140,
      max: 200,
      comment:
        "O tema é compreendido, mas o dado do IBGE aparece solto — conecte-o explicitamente à tese da desigualdade de acesso.",
      before: "cerca de 30% dos domicílios rurais não possuem acesso à internet banda larga",
      after:
        "cerca de 30% dos domicílios rurais não possuem banda larga — evidência de que a exclusão digital é também uma questão territorial",
    },
    {
      c: 3,
      name: "Seleção e organização das informações",
      score: 160,
      max: 200,
      comment:
        "Bom repertório (Pierre Lévy), mas a citação encerra o parágrafo sem retorno ao argumento. Feche o raciocínio.",
      before:
        "benefício que, no entanto, só alcança quem está conectado.",
      after:
        "benefício que, no entanto, só alcança quem está conectado — e é justamente essa fronteira que o Estado precisa dissolver.",
    },
    {
      c: 4,
      name: "Coerência e coesão",
      score: 160,
      max: 200,
      comment:
        "Conectivos empilhados no 3º parágrafo (\"Além disso, também... ainda\") geram redundância.",
      before: "Além disso, também é válido ressaltar ainda que a escola pública sofre",
      after: "Além disso, a escola pública sofre",
    },
    {
      c: 5,
      name: "Proposta de intervenção",
      score: 160,
      max: 200,
      comment:
        "Proposta com agente, ação e parceria. Falta detalhar o meio de execução e o efeito esperado.",
      before:
        "Cabe ao Ministério das Comunicações expandir o programa de banda larga nas escolas e subsidiar equipamentos",
      after:
        "Cabe ao Ministério das Comunicações, por meio de editais do FUST, expandir a banda larga nas escolas e subsidiar equipamentos, reduzindo pela metade a exclusão digital escolar até 2030",
    },
  ],
}

// ─── Detalhe de aula (transcrição, anotações, materiais) ─────────────────────

export interface TranscriptLine {
  time: string
  seconds: number
  text: string
}

export const LESSON_TRANSCRIPT: TranscriptLine[] = [
  { time: "00:12", seconds: 12, text: "Bom, pessoal, na aula passada a gente viu a Primeira Lei de Mendel. Hoje vamos entender como essa herança se manifesta nos cruzamentos." },
  { time: "01:05", seconds: 65, text: "Mendel trabalhou com ervilhas porque elas têm características bem definidas: semente lisa ou rugosa, amarela ou verde." },
  { time: "02:40", seconds: 160, text: "Quando cruzamos dois heterozigotos Aa × Aa, a proporção genotípica é 1:2:1 — anotem isso, cai direto no ENEM." },
  { time: "04:18", seconds: 258, text: "A proporção fenotípica, por outro lado, é 3:1, porque o alelo dominante mascara o recessivo." },
  { time: "05:52", seconds: 352, text: "Repara no quadro de Punnett: cada gameta carrega apenas UM alelo do par. Essa é a essência da segregação." },
  { time: "07:30", seconds: 450, text: "Pulo do gato: dominante não é 'mais forte', é o alelo que se expressa em heterozigose. Não confundam." },
  { time: "09:10", seconds: 550, text: "Deixei uma lista da UNESP no material de apoio. Façam antes da próxima aula que a gente corrige junto." },
]

export const LESSON_NOTES = [
  { id: "n1", time: "02:40", seconds: 160, text: "Aa × Aa → genotípica 1:2:1. Cai direto no ENEM.", flashcard: false },
  { id: "n2", time: "07:30", seconds: 450, text: "Dominante = se expressa em heterozigose, não é 'mais forte'.", flashcard: true },
]

export const LESSON_MATERIALS = [
  { id: "m1", name: "Resumo — Leis de Mendel.pdf", size: "1,2 MB", kind: "PDF" },
  { id: "m2", name: "Lista UNESP — Genética.pdf", size: "820 KB", kind: "PDF" },
  { id: "m3", name: "Quadro de Punnett (modelo).png", size: "310 KB", kind: "IMG" },
]

export const LESSON_MODULES = [
  {
    title: "Biologia — Genética Mendeliana",
    professor: "Prof. Carlos",
    color: "#0E8A5F",
    lessons: [
      { id: "l01", title: "Introdução à Genética", duration: "45min", status: "Concluída" as const },
      { id: "l02", title: "Primeira Lei de Mendel", duration: "48min", status: "Concluída" as const },
      { id: "l03", title: "Herança Mendeliana", duration: "45min", status: "Em andamento" as const, progress: 45 },
      { id: "l04", title: "Segunda Lei de Mendel", duration: "42min", status: "Não iniciada" as const },
    ],
  },
  {
    title: "Matemática — Funções do 2° Grau",
    professor: "Prof. Ana",
    color: "#D97706",
    lessons: [
      { id: "l05", title: "Introdução às Funções", duration: "50min", status: "Concluída" as const },
      { id: "l06", title: "Função Quadrática", duration: "52min", status: "Concluída" as const },
      { id: "l07", title: "Gráfico da Parábola", duration: "48min", status: "Não iniciada" as const },
    ],
  },
  {
    title: "Língua Portuguesa — Análise Sintática",
    professor: "Prof. Marcos",
    color: "#185FA5",
    lessons: [
      { id: "l08", title: "Termos Essenciais da Oração", duration: "40min", status: "Concluída" as const },
      { id: "l09", title: "Termos Integrantes", duration: "38min", status: "Concluída" as const },
      { id: "l10", title: "Termos Acessórios", duration: "42min", status: "Não iniciada" as const },
    ],
  },
]

// ─── Títulos disponíveis (critério visível) ──────────────────────────────────

export const TITLES = [
  { name: "Iniciante", condition: "1ª questão respondida", earned: true, icon: "seedling" },
  { name: "Persistente", condition: "Streak de 7 dias", earned: false, progress: 5, target: 7, icon: "flame" },
  { name: "Dedicado", condition: "100 questões respondidas", earned: true, icon: "barbell" },
  { name: "Guerreiro", condition: "500 questões respondidas", earned: false, progress: 248, target: 500, icon: "sword" },
  { name: "Mestre", condition: "1000 questões respondidas", earned: false, progress: 248, target: 1000, icon: "crown" },
  { name: "Campeão de Redação", condition: "10 redações corrigidas", earned: false, progress: 2, target: 10, icon: "pen" },
  { name: "Simuladeiro", condition: "5 simulados concluídos", earned: true, icon: "exam" },
  { name: "Mês de Ouro", condition: "Top 3 no ranking mensal", earned: true, icon: "medal" },
]

// ─── Marcos da corrida (rótulos dos milestones da RACE) ──────────────────────

export const RACE_MILESTONES = [
  { at: 250, label: "Estrategista" },
  { at: 500, label: "Meta do mês" },
  { at: 750, label: "Veterano" },
  { at: 1000, label: "Topo da turma" },
]

// ─── Tendência de nota de redação (média histórica) ──────────────────────────

export const ESSAY_TREND = [620, 640, 680, 700, 720, 760, 780]

// ─── Perfil completo ─────────────────────────────────────────────────────────

export const PROFILE = {
  fullName: "Igor Silva Cruz",
  username: "igorcruz",
  birthDate: "14/03/2008",
  phone: "(34) 99123-4567",
  bio: "Foco em Medicina na UFU. Estudo melhor de manhã cedo e amo questões de Biologia.",
  accessibility: "Nenhuma",
  publicProfile: true,
  plan: {
    name: "Plano Anual +Aprovação",
    status: "Ativo",
    since: "Abril de 2026",
    nextCharge: "02/08/2026",
    price: "R$ 79,90/mês",
  },
  targetExams: ["ENEM", "UFU", "UNESP"],
  studyRoutine: { daysPerWeek: 5, preferredTime: "Manhã", weeklyGoalHours: 14 },
}

export const PROFILE_SECTIONS = [
  { key: "identidade", label: "Identidade", icon: "user" },
  { key: "plano", label: "Meu Plano", icon: "card" },
  { key: "jornada", label: "Jornada Acadêmica", icon: "target" },
  { key: "rotina", label: "Rotina de Estudos", icon: "clock" },
  { key: "seguranca", label: "Acesso e Segurança", icon: "lock" },
  { key: "preferencias", label: "Preferências", icon: "sliders" },
] as const
