export type ExamSessionStatus = "in_progress" | "completed" | "abandoned";

export type ExamFormat =
  | "linguagens"
  | "humanas"
  | "natureza"
  | "matematica"
  | "dia1"
  | "dia2"
  | "completo"
  | "custom";

export interface ExamSessionConfig {
  format?: ExamFormat | string;
  bank?: string | null;
  year?: number | null;
  subject?: string | null;
  difficulty?: "easy" | "medium" | "hard" | "facil" | "medio" | "dificil" | "misto" | string | null;
  qty?: number | null;
  time_limit_secs?: number | null;
  [key: string]: unknown;
}

export interface ExamBucketResult {
  correct: number;
  total: number;
  percentage: number;
}

export interface ExamSessionSummary {
  id: string;
  course_id: string | null;
  status: ExamSessionStatus | string;
  total_questions: number | null;
  correct_count: number | null;
  score: number | null;
  is_printed: boolean;
  started_at: string;
  finished_at: string | null;
  tri_score?: number | null;
  config?: ExamSessionConfig;
}

export interface ExamSessionAnswerPublic {
  id: string;
  session_id: string;
  question_id: string;
  order_index: number;
  selected_option: string | null;
  is_correct: boolean | null;
  is_annulled: boolean;
  answered_at: string | null;
}

export interface ExamCompletionResult {
  id: string;
  status: "completed";
  total_questions: number;
  correct_count: number;
  score: number;
  percentage: number;
  tri_score: number | null;
  results_by_subject: Record<string, ExamBucketResult>;
  results_by_bank: Record<string, ExamBucketResult>;
  annulled_question_ids: string[];
  annulled_questions_count: number;
  time_taken_secs: number | null;
  finished_at: string;
  points_awarded: number;
}

export interface ExamReviewItem {
  question_id: string;
  explanation: string;
  correct_answer: string | null;
  user_answer: string | null;
  is_correct: boolean;
  is_annulled: boolean;
  subject: string | null;
}
