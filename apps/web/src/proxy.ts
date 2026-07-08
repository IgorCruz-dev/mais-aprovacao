import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { UserRole } from "@mais-aprovacao/types";
import { ROLE_TO_DASHBOARD, isUserRole } from "@mais-aprovacao/utils";

const isPublicRoute = createRouteMatcher([
  "/",
  "/cursos(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/unauthorized",
  "/api/webhooks(.*)",
]);

// Matriz de áreas: cada matcher aceita a própria role + admin.
const AREA_MATCHERS: Array<{ role: UserRole; matcher: ReturnType<typeof createRouteMatcher> }> = [
  {
    role: "student",
    matcher: createRouteMatcher(["/student(.*)"]),
  },
  { role: "teacher", matcher: createRouteMatcher(["/teacher(.*)"]) },
  { role: "manager", matcher: createRouteMatcher(["/manager(.*)"]) },
  { role: "parent", matcher: createRouteMatcher(["/parent(.*)"]) },
  { role: "admin", matcher: createRouteMatcher(["/admin(.*)"]) },
];

const isAuthPage = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);
const isLanding = createRouteMatcher(["/"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    if (isPublicRoute(req)) return;
    // Chamadas de API recebem 401 JSON; navegação de página recebe redirect.
    if (req.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
    }
    // redirect_url é sempre relativa por construção (pathname + search do próprio request).
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("redirect_url", req.nextUrl.pathname + req.nextUrl.search);
    return NextResponse.redirect(signInUrl);
  }

  // Role do claim é cache — pode estar ausente se o session token não foi customizado.
  const metadata = sessionClaims?.publicMetadata as Record<string, unknown> | undefined;
  const claimRole = metadata?.role;
  const role: UserRole | null = isUserRole(claimRole) ? claimRole : null;

  // Autenticado em landing/sign-in/sign-up → manda pro dashboard da role.
  if (isLanding(req) || isAuthPage(req)) {
    return NextResponse.redirect(new URL(role ? ROLE_TO_DASHBOARD[role] : "/student/dashboard", req.url));
  }

  // Sem claim de role, deixa passar: a camada 2 (layout AreaGate) resolve pela API
  // e redireciona se preciso — evita lockout quando o token não tem publicMetadata.
  if (!role) return;
  if (role === "admin") return;

  for (const area of AREA_MATCHERS) {
    if (area.matcher(req) && area.role !== role) {
      // Navegação de página nunca recebe 403 — redireciona pro dashboard da PRÓPRIA role.
      return NextResponse.redirect(new URL(ROLE_TO_DASHBOARD[role], req.url));
    }
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
