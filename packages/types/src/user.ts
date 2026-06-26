export type UserRole = "student" | "teacher" | "admin";

export interface UserProfile {
  id: string;
  clerk_id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
}
