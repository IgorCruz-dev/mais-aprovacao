# packages/db — Prisma

Leia também o `CLAUDE.md` da raiz. Este arquivo define os padrões locais do package de banco.

## Stack local

- Prisma 7 com `@prisma/adapter-pg`.
- Configuração em `prisma.config.ts`; o `schema.prisma` nao deve declarar `url`.
- Client singleton exportado em `src/index.ts`.
- Migrations em `prisma/migrations`.

## Client Prisma

- Use sempre o client exportado:

```ts
import { prisma } from "@mais-aprovacao/db";
```

- Nao crie outro `PrismaClient` em apps, services ou scripts.
- `src/index.ts` também reexporta tipos de `@prisma/client`.

## Schema e nomes

- Models usam PascalCase: `Course`, `CourseLesson`, `GamificationPoint`.
- Campos seguem snake_case para refletir o banco atual: `student_id`, `created_at`, `course_id`.
- Tabelas são snake_case plural via `@@map` quando necessário.
- IDs usam UUID com `gen_random_uuid()` conforme padrão atual.

## Nova tabela ou coluna

1. Edite `prisma/schema.prisma`.
2. Gere migration:

```bash
pnpm --filter @mais-aprovacao/db exec prisma migrate dev --name descricao_curta
```

3. Revise o SQL gerado em `prisma/migrations`.
4. Rode generate se necessário:

```bash
pnpm --filter @mais-aprovacao/db exec prisma generate
```

- Para deploy em banco remoto, use:

```bash
pnpm --filter @mais-aprovacao/db exec prisma migrate deploy
```

- Nao rode SQL manual no Supabase para mudanças versionadas. Se isso acontecer excepcionalmente, registre a migration em `_prisma_migrations`.

## Seed

- Seeds ficam em `prisma/seed.ts`.
- Rode:

```bash
pnpm --filter @mais-aprovacao/db exec prisma db seed
```

- Seeds devem ser idempotentes quando possível, usando `upsert` ou checks por campos únicos.

## Queries

- Use `include` para relações necessárias:

```ts
const course = await prisma.course.findUnique({
  where: { id },
  include: {
    modules: {
      include: { lessons: true },
    },
  },
});
```

- Evite carregar relações grandes sem paginação.
- Listagens devem aceitar `limit` e `cursor` ou `page`, conforme contrato global.

