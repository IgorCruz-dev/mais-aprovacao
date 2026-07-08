import type { UserRole } from "@mais-aprovacao/types";

export function hasRole(role: UserRole, allowedRoles: readonly UserRole[]): boolean {
  return allowedRoles.includes(role);
}

export const ROLE_TO_DASHBOARD: Record<UserRole, string> = {
  student: "/student/dashboard",
  teacher: "/teacher/dashboard",
  manager: "/manager/dashboard",
  parent: "/parent/dashboard",
  admin: "/admin",
};

export const ROLE_LABELS: Record<UserRole, string> = {
  student: "Aluno",
  teacher: "Professor",
  manager: "Gestor",
  parent: "Responsável",
  admin: "Admin",
};

export function isUserRole(value: unknown): value is UserRole {
  return (
    typeof value === "string" &&
    Object.prototype.hasOwnProperty.call(ROLE_TO_DASHBOARD, value)
  );
}

export function sanitizeRedirectUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  // Apenas caminhos relativos: bloqueia URLs absolutas e protocol-relative (//host)
  if (!url.startsWith("/") || url.startsWith("//")) return null;
  return url;
}
