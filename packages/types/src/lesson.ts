export type LessonStatus = "pending" | "processing" | "ready" | "error";

export interface LessonMaterial {
  id: string;
  title: string;
  file_url: string;
  type: "pdf" | "slides" | "spreadsheet" | "other";
}
