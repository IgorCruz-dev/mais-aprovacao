import type { UserProfile } from "./user";

export interface AdminUsersResponse {
  users: UserProfile[];
  next_cursor: string | null;
}

export interface AdminParentLinkItem {
  id: string;
  verified: boolean;
  created_at: string;
  parent: {
    id: string;
    name: string;
    email: string;
  };
  student: {
    id: string;
    name: string;
    email: string;
  };
}

export interface AdminParentLinksResponse {
  links: AdminParentLinkItem[];
  next_cursor: string | null;
}
