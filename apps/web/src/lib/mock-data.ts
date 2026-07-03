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
  { rank: 2, name: "Anny", pts: 424, initial: "A", color: "#534AB7" },
  { rank: 3, name: "Gabriela", pts: 300, initial: "G", color: "#0F6E56" },
]

export const RANKING_HISTORY = [
  { month: "Julho/2026", rank: 67, pts: 340, identity: "Forjador do Próximo Passo", tier: "Explorador" },
  { month: "Maio/2026", rank: 15, pts: 54, identity: "Curador do Conhecimento", tier: "Explorador" },
  { month: "Abril/2026", rank: 3, pts: 112, identity: "Rota da Conquista", tier: "Explorador" },
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
  { name: "Rafaella", initial: "R", color: "#534AB7", action: "resolveu Química", time: "2h atrás" },
  { name: "Pedro", initial: "P", color: "#185FA5", action: "completou simulado de Física", time: "3h atrás" },
  { name: "Ana", initial: "A", color: "#0F6E56", action: "enviou uma redação ENEM", time: "4h atrás" },
]

export const LEVELS = [
  { name: "Explorador", min: 0, max: 199, color: "#2563EB" },
  { name: "Estrategista", min: 200, max: 449, color: "#534AB7" },
  { name: "Veterano", min: 450, max: 799, color: "#0F6E56" },
  { name: "Elite", min: 800, max: 9999, color: "#D97706" },
]

export const PREVIOUS_MONTHS = [
  { month: "Maio/2026", label: "MAIO 2026", identity: "Curador do Conhecimento", pts: 54, rank: 15, tier: "Explorador", tierColor: "#2563EB", delta: -58 },
  { month: "Abril/2026", label: "ABRIL 2026", identity: "Rota da Conquista", pts: 112, rank: 3, tier: "Explorador", tierColor: "#2563EB", delta: null },
]
