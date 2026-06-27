export type ExamSessionStatus = "in_progress" | "completed" | "abandoned";

export interface ExamSessionSummary {
  id: string;
  course_id: string | null;
  status: ExamSessionStatus | string;
  total_questions: number;
  correct_count: number;
  score: number | null;
  is_printed: boolean;
  started_at: string;
  finished_at: string | null;
}
