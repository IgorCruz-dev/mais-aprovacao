import type { UserRole } from "./user";

export type AuthRole = UserRole;

export interface AuthSessionUser {
  id: string;
  clerk_id: string;
  role: AuthRole;
}
