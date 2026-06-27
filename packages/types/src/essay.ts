export type EssayType = "enem" | "ufu" | "ueg" | "fuvest" | "vunesp";
export type EssayStatus = "pending" | "transcribing" | "correcting" | "corrected" | "seen" | "error";

export interface EssaySummary {
  id: string;
  course_id: string | null;
  prompt_id: string | null;
  theme: string | null;
  essay_type: EssayType | string;
  status: EssayStatus | string;
  total_score: number | null;
  submitted_at: string;
  corrected_at: string | null;
  seen_at: string | null;
}
