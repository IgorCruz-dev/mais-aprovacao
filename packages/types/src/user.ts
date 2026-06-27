export type UserRole = "student" | "teacher" | "manager" | "parent" | "admin";

export interface UserProfile {
  id: string;
  clerk_id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
}
