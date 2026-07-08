export interface ParentStudentLinkSummary {
  id: string;
  parent_user_id: string;
  student_user_id: string;
  verified: boolean;
  created_at: string;
}

export interface ParentStudentLinkWithStudent extends ParentStudentLinkSummary {
  student: {
    id: string;
    name: string;
    email: string;
    avatar_url: string | null;
  };
}

export interface ParentStudentCourseProgress {
  course_id: string;
  course_title: string;
  completed_lessons: number;
  total_lessons: number;
  watched_pct_avg: number;
}

export interface ParentStudentProgressResponse {
  student: {
    id: string;
    name: string;
  };
  courses: ParentStudentCourseProgress[];
  gamification: {
    total_points: number;
    current_streak: number;
  };
}
