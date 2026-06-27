export interface GamificationPointSummary {
  id: string;
  points: number;
  origin_type: string;
  origin_id: string | null;
  multiplier: number;
  earned_at: string;
}
