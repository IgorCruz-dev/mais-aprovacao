import type { UserProfile } from "./user";

export interface AdminUsersResponse {
  users: UserProfile[];
  next_cursor: string | null;
}
