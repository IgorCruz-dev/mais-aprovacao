export type QuestionBank = string;
export type QuestionDifficulty = string;

export interface QuestionPublic {
  id: string;
  external_id: string;
  exam_year: number;
  subject: string | null;
  discipline: string | null;
  bank: QuestionBank | null;
  difficulty: QuestionDifficulty | null;
  title: string | null;
  context: string | null;
  alternatives_intro: string | null;
  alternatives: object | null;
  images: string[] | null;
}
