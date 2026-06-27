# apps/web — Next.js

Leia também o `CLAUDE.md` da raiz. Este arquivo define apenas os padrões locais do app web.

## Stack local

- Next.js 16 com App Router, React 19, TypeScript e Tailwind v4.
- Auth via Clerk: `ClerkProvider` em `src/app/layout.tsx` e `clerkMiddleware()` em `src/middleware.ts`.
- UI local em `src/components/ui` e componentes compartilhados em `@mais-aprovacao/ui`.
- Packages internos sempre usam o namespace `@mais-aprovacao/*`.

## Páginas e rotas

- Crie páginas em `src/app/.../page.tsx`.
- Use route groups conforme o contrato global: `(public)`, `(auth)`, `(student)`, `(teacher)`, `(manager)`, `(parent)`, `(admin)`.
- Exemplo de nova página autenticada:

```tsx
// src/app/(student)/novo-dominio/page.tsx
export default async function NovoDominioPage() {
  return <main>Novo dominio</main>;
}
```

- Toda página que faz fetch assíncrono deve ter `loading.tsx` no mesmo segmento.
- Toda rota relevante deve ter `error.tsx` no segmento para error boundary.
- Prefira Server Components. Use `"use client"` apenas para estado/interação, `useAuth()`, Ably, players ou APIs do browser.

## Componentes

- Crie componentes de domínio em `src/components/NomeComponente.tsx`.
- Use `PascalCase.tsx` e `export default`.

```tsx
type NomeComponenteProps = {
  title: string;
};

export default function NomeComponente({ title }: NomeComponenteProps) {
  return <section>{title}</section>;
}
```

- Componentes base gerados pelo Shadcn ficam em `src/components/ui`.
- Para adicionar Shadcn:

```bash
pnpm dlx shadcn@latest add [componente]
```

## Fetch e autenticação

- Server Components e Route Handlers devem usar Clerk server-side:

```ts
import { auth } from "@clerk/nextjs/server";

const { getToken } = await auth();
const token = await getToken();

const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses`, {
  headers: { Authorization: `Bearer ${token}` },
});
```

- Client Components que precisam do token usam `useAuth()` de `@clerk/nextjs`.
- Client Components nao devem chamar `apps/api` diretamente para dados sensíveis. Crie um Route Handler em `src/app/api/.../route.ts` como proxy autenticado.
- Use `NEXT_PUBLIC_API_URL` para chamar o Fastify.
- `src/lib/api.ts` existe para chamadas simples, mas adicione `Authorization` quando a rota exigir auth.

## Prisma no web

- Pode usar `prisma` de `@mais-aprovacao/db` somente em Server Components, Server Actions ou Route Handlers.
- Nunca importe Prisma em Client Components.
- Para dados sensíveis, prefira chamar `apps/api` e manter regra de autorização centralizada no backend.

```ts
import { prisma } from "@mais-aprovacao/db";

const courses = await prisma.course.findMany({
  where: { is_active: true },
});
```

## Loading, erros e realtime

- Use `loading.tsx` com skeletons de `@mais-aprovacao/ui` ou `src/components/ui`.
- Use Suspense quando uma parte específica da página carregar de forma independente.
- Use `error.tsx` por segmento para mensagens recuperáveis e botão de retry.
- Para Ably no cliente, use Client Component e importe de `ably/react`.

```tsx
"use client";

import { useChannel } from "ably/react";
```

