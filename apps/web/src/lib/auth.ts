import { auth } from "@clerk/nextjs/server";
import type { UserProfile } from "@mais-aprovacao/types";

export type ApiUserResult =
  | { status: "ok"; user: UserProfile }
  | { status: "unauthenticated" }
  // Sessão Clerk válida mas o webhook ainda não criou a row em `users` (ou foi perdido).
  | { status: "not_provisioned" }
  | { status: "error" };

/**
 * Resolve o usuário real consultando GET /me na API (role vem do banco,
 * nunca dos claims do token). Uso exclusivo em Server Components.
 */
export async function getApiUser(): Promise<ApiUserResult> {
  const { getToken } = await auth();
  const token = await getToken();
  if (!token) return { status: "unauthenticated" };

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"}/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (res.status === 401) return { status: "unauthenticated" };
    if (res.status === 404) return { status: "not_provisioned" };
    if (!res.ok) return { status: "error" };
    const data = (await res.json()) as { user: UserProfile };
    return { status: "ok", user: data.user };
  } catch {
    return { status: "error" };
  }
}
