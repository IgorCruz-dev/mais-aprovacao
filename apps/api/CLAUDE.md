# apps/api — Fastify

Leia também o `CLAUDE.md` da raiz. Este arquivo define os padrões locais do backend Fastify.

## Stack local

- Fastify 5 com TypeScript e ESM.
- Auth via `@clerk/fastify`, registrado em `src/server.ts`.
- Prisma via `@mais-aprovacao/db`, exposto localmente por `src/lib/prisma.ts`.
- Redis em `src/lib/redis.ts` e QStash em `src/lib/qstash.ts`.
- Packages internos sempre usam `@mais-aprovacao/*`.

## Rotas

- Para domínio simples, crie `src/routes/dominio.ts` exportando uma função de registro.
- Para domínio maior, use pasta `src/routes/dominio/` com `index.ts`, `schema.ts`, `handler.ts` e `service.ts`.
- Registre a rota em `src/server.ts` com `app.register(...)`.
- Rotas públicas, como health e webhooks, devem ser registradas antes do plugin do Clerk ou explicitamente sem preHandler de auth.

```ts
// src/routes/courses.ts
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { requireAuth } from "../plugins/clerk.js";
import { prisma } from "../lib/prisma.js";

const createCourseBody = z.object({
  title: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9-]+$/),
});

type CreateCourseBody = z.infer<typeof createCourseBody>;

async function createCourse(
  req: FastifyRequest<{ Body: CreateCourseBody }>,
  reply: FastifyReply
) {
  const parsed = createCourseBody.safeParse(req.body);
  if (!parsed.success) {
    return reply.status(400).send({ error: "Invalid body", code: "VALIDATION_ERROR" });
  }

  const course = await prisma.course.create({ data: parsed.data });
  return reply.status(201).send({ course });
}

export async function courseRoutes(app: FastifyInstance) {
  app.post("/courses", { preHandler: [requireAuth] }, createCourse);
}
```

## Auth Clerk

- Use `@clerk/fastify` no servidor.
- Para rotas protegidas, use `preHandler: [requireAuth]` ou helper equivalente.
- Dentro do handler, use `getAuth(req)` quando precisar do Clerk user id.
- Webhooks nunca dependem de Clerk; validam assinatura própria.

## Prisma, Redis, QStash e AI

- Use Prisma pelo singleton local:

```ts
import { prisma } from "../lib/prisma.js";
```

- Nao crie `new PrismaClient()` em rotas ou services.
- Use Redis:

```ts
import { redis } from "../lib/redis.js";
```

- Publique jobs no QStash:

```ts
import { qstash } from "../lib/qstash.js";
```

- Chame o AI Service com `AI_SERVICE_URL` e autentique com `X-AI-Secret`:

```ts
await fetch(`${process.env.AI_SERVICE_URL}/ai/essays/grade`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-AI-Secret": process.env.AI_SERVICE_SECRET ?? "",
  },
  body: JSON.stringify(payload),
});
```

## Erros e webhooks

- Resposta de erro padrão:

```ts
return reply.status(400).send({
  error: "Mensagem legível",
  code: "ERROR_CODE",
});
```

- Stripe webhook deve ser rota sem auth Clerk.
- Sempre verificar assinatura com o secret do Stripe antes de processar.
- Sempre aplicar idempotência usando `webhook_events`.
- Nunca criar enrollment antes de `checkout.session.completed`.

