export type QuestionBank = "ENEM" | "UFU" | "UEG";
export type QuestionDifficulty = "easy" | "medium" | "hard";

export interface QuestionPublic {
  id: string;
  external_id: string;
  exam_year: number;
  subject: string | null;
  discipline: string | null;
  bank: QuestionBank | null;
  difficulty: QuestionDifficulty | string | null;
  title: string | null;
  context: string | null;
  alternatives_intro: string | null;
  alternatives: object | null;
  images: string[];
}
