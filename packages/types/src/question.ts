export type QuestionBank = string;
export type QuestionDifficulty = "easy" | "medium" | "hard" | string;

export interface QuestionAlternativePublic {
  letter: string;
  text: string;
  image?: string | null;
}

export interface QuestionPublic {
  id: string;
  external_id: string;
  exam_year: number;
  subject: string | null;
  discipline: string | null;
  topic?: string | null;
  bank: QuestionBank | null;
  difficulty: QuestionDifficulty | null;
  title: string | null;
  context: string | null;
  statement?: string | null;
  alternatives_intro: string | null;
  alternatives: QuestionAlternativePublic[] | object | null;
  images: string[] | null;
  testlet_group_id?: string | null;
}

export interface QuestionTopicSummary {
  name: string;
  count: number;
}

export interface QuestionAttemptResult {
  id: string;
  question_id: string;
  selected_option: string;
  is_correct: boolean;
  is_first_correct: boolean;
  already_answered_correctly: boolean;
  correct_alternative: string | null;
  explanation: string;
  time_spent_ms: number | null;
  attempted_at: string;
  points_awarded: number;
}

export type QuestionReportErrorCategory = "estrutural" | "conteudo" | "resposta" | "outro";
export type QuestionReportStatus = "pending" | "reviewing" | "resolved";

export interface QuestionReportPublic {
  id: string;
  question_id: string;
  error_category: QuestionReportErrorCategory;
  description: string | null;
  status: QuestionReportStatus;
  created_at: string;
  resolved_at: string | null;
}
