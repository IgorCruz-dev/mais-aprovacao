import type { UserRole } from "@mais-aprovacao/types";

export function hasRole(role: UserRole, allowedRoles: readonly UserRole[]): boolean {
  return allowedRoles.includes(role);
}
