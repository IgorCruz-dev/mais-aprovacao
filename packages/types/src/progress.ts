export interface LessonProgressSummary {
  lesson_id: string;
  watched_pct: number;
  watched_seconds: number;
  completed: boolean;
  last_watched_at: string | null;
}
