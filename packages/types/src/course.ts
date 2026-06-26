export type CourseType =
  | "extensivo"
  | "semi_extensivo"
  | "intensivo"
  | "por_materia"
  | "avulso";

export interface Course {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  trailer_url: string | null;
  price_cents: number;
  access_days: number | null;
  type: CourseType;
  is_active: boolean;
  is_featured: boolean;
  starts_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CourseModule {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  subject: string | null;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CourseLesson {
  id: string;
  module_id: string;
  course_id: string;
  title: string;
  description: string | null;
  bunny_video_id: string | null;
  duration_secs: number | null;
  order_index: number;
  is_preview: boolean;
  is_active: boolean;
  released_at: string | null;
  created_at: string;
  updated_at: string;
}
