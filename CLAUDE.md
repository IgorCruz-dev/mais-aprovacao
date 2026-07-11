# Mais Aprovacao — Contexto Global do Projeto

> Este arquivo deve ser lido **inteiro** antes de qualquer tarefa. Ele define o contrato de desenvolvimento entre todos os agentes e devs. É auto-suficiente: um agente ou dev novo deve conseguir trabalhar com base apenas neste documento.

---

## 1. Descrição do Projeto

**Nome:** mais-aprovacao 
**O que é:** Plataforma de cursos pré-vestibular online (ENEM, UFU, UEG e outros vestibulares), B2C, atendimento nacional
**Cliente:** Cursinho presencial expandindo para atendimento digital
**Prazo:** Lançamento MVP novembro/2026, go-live completo janeiro/2027
**Devs:** Kauã + Igor

---

## 2. Stack Completa

| Camada | Tecnologia | Localização |
|--------|-----------|-------------|
| Monorepo | Turborepo + pnpm workspaces | raiz |
| Frontend | Next.js 16 + TypeScript + Tailwind v4 + Shadcn/UI | `apps/web` |
| Backend | Fastify 5 + TypeScript | `apps/api` |
| AI Service | FastAPI + Python | `apps/ai` |
| Auth | Clerk | web + api |
| Banco | Supabase (PostgreSQL + pgvector) | - |
| ORM | Prisma 7 + adapter-pg | `packages/db` |
| Vídeo VOD | Bunny.net Stream | - |
| Live | Amazon IVS | - |
| Realtime | Ably (chat, enquetes, presença no aulão) | - |
| Storage | Cloudflare R2 | - |
| Cache | Upstash Redis | - |
| Filas | Upstash QStash | - |
| Pagamento | Stripe (PIX + cartão) | - |
| Deploy FE | Localhost por enquanto | Vercel depois da validação comercial |
| Deploy BE | Localhost por enquanto | Fly.io/Railway depois da validação comercial |
| Email | Resend | - |

---

## 3. Estrutura do Monorepo

```
apps/
  web/          → Next.js 16 (porta 3000)
  api/          → Fastify 5 (porta 3001)
  ai/           → FastAPI Python (porta 8000)
packages/
  db/           → Prisma schema + client tipado
  types/        → TypeScript types compartilhados (@mais-aprovacao/types)
  utils/        → funções utilitárias (@mais-aprovacao/utils)
  ui/           → componentes base (@mais-aprovacao/ui)
docs/
  api-contract.md
```

---

## 4. Convenções de Nomenclatura

- **Arquivos TypeScript:** `camelCase.ts` para utils, `PascalCase.tsx` para componentes React
- **Rotas Next.js:** `kebab-case` nas pastas (ex: `app/student/banco-de-questoes/page.tsx`). Áreas autenticadas usam sempre o papel como primeiro segmento real da URL: `/student`, `/teacher`, `/manager`, `/parent`, `/admin`. Não use route groups `(student)`, `(teacher)`, `(manager)`, `(parent)` ou `(admin)` para esconder o papel da URL.
- **Tabelas banco:** `snake_case` plural (ex: `course_lessons`, `lesson_progress`)
- **Campos Prisma:** `snake_case` direto no modelo — segue convenção do schema atual
- **Variáveis TypeScript:** `camelCase`
- **Constantes:** `UPPER_SNAKE_CASE`
- **Funções Fastify:** prefixo pelo domínio (`getCourse`, `createEnrollment`, `listLessons`)
- **Packages internos:** prefixo `@mais-aprovacao/` (não `@aprovacao/`)
- **Rotas Fastify:** sempre `kebab-case` (ex: `/live-classes/:id/read-answer-sheet`)

---

## 5. Variáveis de Ambiente

Todas ficam no `.env` da raiz. Apps individuais têm seus próprios `.env.local` / `.env` que referenciam as mesmas chaves. **Nunca commitar `.env`.**

```
# Banco
DATABASE_URL                  → Prisma runtime (pooler porta 6543)
DIRECT_URL                    → Prisma migrations (session mode porta 5432)

# Supabase
SUPABASE_URL                  → https://[ref].supabase.co
SUPABASE_ANON_KEY             → chave pública (frontend apenas)
SUPABASE_SERVICE_ROLE_KEY     → chave admin (backend/ai — NUNCA expor no frontend)

# Auth (Clerk)
CLERK_SECRET_KEY              → backend (apps/api)
CLERK_PUBLISHABLE_KEY         → backend Fastify plugin
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY → frontend Next.js
CLERK_WEBHOOK_SECRET          → validação de assinatura do webhook Clerk

# Stripe
STRIPE_SECRET_KEY             → backend
STRIPE_WEBHOOK_SECRET         → validação de assinatura do webhook Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY → frontend

# Vídeo (Bunny.net)
BUNNY_API_KEY                 → backend (upload, gestão)
BUNNY_READ_ONLY_API_KEY       → leitura de metadados
BUNNY_LIBRARY_ID              → ID da biblioteca de vídeos
BUNNY_CDN_HOSTNAME            → hostname CDN para signed URLs
BUNNY_SIGNING_KEY             → chave para gerar signed URLs (TTL 1h)
BUNNY_WEBHOOK_SECRET          → validação do webhook de encoding

# Amazon IVS
IVS_CHANNEL_ARN               → ARN do canal IVS para aulões
IVS_STREAM_KEY                → chave de transmissão (professor usa no OBS)
IVS_PLAYBACK_URL              → URL de reprodução (player no frontend)
AWS_ACCESS_KEY_ID             → backend (usuário IAM mais-aprovacao-ivs)
AWS_SECRET_ACCESS_KEY         → backend
AWS_REGION                    → us-east-1

# Realtime (Ably)
NEXT_PUBLIC_ABLY_KEY          → frontend (subscribe only — chave Subscribe Only do Ably)
ABLY_API_KEY                  → backend (publish — chave Root do Ably)

# Upstash Redis
UPSTASH_REDIS_URL             → backend
UPSTASH_REDIS_TOKEN           → backend (leitura e escrita)
UPSTASH_REDIS_READONLY_TOKEN  → leitura (opcional, para operações read-only)

# Upstash QStash
QSTASH_URL                    → endpoint para publicar mensagens
QSTASH_TOKEN                  → autenticação principal
QSTASH_CURRENT_SIGNING_KEY    → valida que o webhook veio do QStash
QSTASH_NEXT_SIGNING_KEY       → rotação de chave (segurança)

# AI Service
GOOGLE_API_KEY                → apps/ai apenas (Gemini) — NUNCA em apps/api
AI_SERVICE_URL                → URL interna do apps/ai (http://localhost:8000 em dev)
AI_SERVICE_SECRET             → token de autenticação entre apps/api e apps/ai

# Cloudflare R2
CLOUDFLARE_ACCOUNT_ID         → backend
R2_ACCESS_KEY_ID              → backend
R2_SECRET_ACCESS_KEY          → backend
R2_BUCKET_NAME                → nome do bucket (mais-aprovacao-storage)
R2_PUBLIC_URL                 → URL pública do bucket (CDN)
R2_ENDPOINT                   → https://{CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com

# Email
RESEND_API_KEY                → backend

# URLs
NEXT_PUBLIC_API_URL           → http://localhost:3001 (dev) / URL futura de deploy
WEB_URL                       → http://localhost:3000 (dev) / URL futura de deploy

# Conexão direta Postgres (psql, TablePlus, ferramentas de banco — não usado em runtime)
DB-PASSWORD / HOST / PORT / DATABASE / USER → credenciais brutas do Supabase (apps/api/.env)

# StudyTrack (banco de origem para sincronização de questões)
STUDYTRACK_SUPABASE_URL       → Supabase do StudyTrack — só usado por scripts/import_from_studytrack.py
STUDYTRACK_SERVICE_ROLE_KEY   → service role do StudyTrack — NUNCA expor no frontend ou apps/api
```

---

## 6. Como Rodar Localmente

```bash
# Instalar tudo
pnpm install

# Subir todos os apps
pnpm dev

# Subir individualmente
pnpm --filter @mais-aprovacao/web dev    # Next.js :3000
pnpm --filter @mais-aprovacao/api dev    # Fastify :3001

# AI Service (Python — terminal separado)
cd apps/ai
source venv/bin/activate
uvicorn main:app --reload               # FastAPI :8000

# Seed do banco
cd packages/db
npx prisma db seed

# Prisma Studio
cd packages/db
npx prisma studio
```

---

## 7. Decisões de Arquitetura

### Prisma 7 — Mudanças Obrigatórias

O Prisma 7 **não suporta** `url` e `directUrl` no `schema.prisma`. A configuração fica em `packages/db/prisma.config.ts`.

O `PrismaClient` **exige** um adapter explícito:

```typescript
import { PrismaPg } from "@prisma/adapter-pg"
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })
```

### Supabase — Portas e Modos

- **Porta 6543** (Transaction Pooler) → usar em runtime (Prisma, Fastify). NÃO suporta migrations.
- **Porta 5432 no pooler** (Session Mode) → usar para migrations e operações DDL.
- **Porta 5432 direto** (`db.[ref].supabase.co`) → pode ser bloqueada por firewall. Evitar.

### Migrations

Tabelas iniciais foram criadas via SQL Editor do Supabase e **baselineadas** (não aplicadas, só registradas). Novas migrations **sempre** via `npx prisma migrate dev` a partir de agora. Nunca criar tabelas manualmente no Supabase após o baseline.

### RLS no Supabase

Todas as tabelas têm RLS habilitado. O backend Fastify usa `SUPABASE_SERVICE_ROLE_KEY` que bypassa RLS. O frontend usa `SUPABASE_ANON_KEY` e precisa das policies. Definir policies mesmo que o backend as bypasse — elas são a segunda linha de defesa.

### Clerk — Dois contextos

- **`apps/web`**: usa `@clerk/nextjs` com `ClerkProvider` no layout raiz e `clerkMiddleware()` no `middleware.ts`
- **`apps/api`**: usa `@clerk/fastify` com `clerkPlugin`. Rotas `/health` e `/webhooks/*` são públicas (registradas ANTES do plugin)

### Roles (Clerk publicMetadata)

Roles gerenciados via `publicMetadata.role` do Clerk. Valores possíveis:

```
student  → aluno com acesso a pelo menos um curso
teacher  → professor que cria cursos, corrige redações, faz aulões
manager  → gestor que vê relatórios, alunos e financeiro
parent   → responsável que acompanha progresso de aluno vinculado
admin    → acesso total à plataforma (interno)
```

Novo usuário criado via Clerk → webhook `user.created` → `apps/api` cria registro em `users` com `role: 'student'` por padrão. Role alterado pelo admin via API interna ou Clerk Dashboard.

### Stripe

- `payment_method_types: ['pix', 'card']` na Checkout Session (conta BR configurada)
- Webhook `checkout.session.completed` → cria `payments` + `enrollments`
- `metadata` da Checkout Session deve incluir `{ course_id, student_id }` para o webhook processar
- Sempre verificar assinatura com `stripe.webhooks.constructEvent(body, sig, STRIPE_WEBHOOK_SECRET)`

### Bunny.net

- Upload: professor obtém URL TUS via `POST /lessons/:id/bunny-upload-url` → faz upload direto para Bunny
- Signed URLs: geradas no backend com `BUNNY_SIGNING_KEY`, TTL 1h. Nunca gerar no frontend.
- Webhook `VideoEncoded` → atualiza `course_lessons.status = 'ready'`

### Amazon IVS

- Canal único criado no console AWS (us-east-1), credenciais em `IVS_CHANNEL_ARN`, `IVS_STREAM_KEY`, `IVS_PLAYBACK_URL`
- Acesso via usuário IAM `mais-aprovacao-ivs` com policy `AmazonIVSFullAccess`
- Para iniciar stream: professor usa `IVS_STREAM_KEY` no OBS Studio
- Alunos recebem `ivs_playback_url` via endpoint após `live_classes.status = 'live'`
- Latência ~3-5s (Low-latency mode) — aceitável para aulões

### QStash (Upstash)

- Jobs agendados: `POST /api/v2/schedules` com cron expression e URL de callback no Fastify
- Callbacks chegam em `POST /internal/jobs/:jobName` (autenticados via `QSTASH_CURRENT_SIGNING_KEY`)
- Jobs obrigatórios:
  - `daily-streak-check`: `0 2 * * *` UTC (23h BRT) — verifica alunos sem atividade e quebra streak
  - `monthly-ranking-reset`: `0 3 1 * *` UTC (00h BRT dia 1) — snapshot em `gamification_monthly_ranking`

### Packages Compartilhados

Todos os packages internos exportam direto de `.ts` (sem build). O TypeScript de cada app resolve via `paths` ou `workspace:*`. **Não fazer build dos packages** — os apps compilam tudo junto.

### Banco de Questões — Decisões de design

- **`bank` e `difficulty` são texto livre** (`String?` no schema) — sem enum fixo para suportar qualquer vestibular (ENEM, UFU, UEG, UFG, UNESP, etc.) sem precisar alterar o schema. `difficulty` usa valores em português (`'Fácil'`, `'Médio'`, `'Difícil'`).
- **`is_ai_generated`** (não `ai_generated`) — campo renomeado para manter paridade com o StudyTrack.
- **`images` é nullable no banco** (migration fez `DROP NOT NULL`), mas o Prisma não suporta arrays nullable — o schema declara `String[] @default([])`. Ao ler questões importadas via Prisma, tratar `images` como possivelmente `null` em runtime.
- **Campos `verified_by`, `ai_reasoning`, `author_id`, `testlet_group_id`** foram adicionados para paridade com StudyTrack. `testlet_group_id` agrupa questões que compartilham o mesmo texto-base.

### Sincronização de questões do StudyTrack

Script standalone: `scripts/import_from_studytrack.py`

```bash
# rodar do diretório raiz
python scripts/import_from_studytrack.py          # import real
python scripts/import_from_studytrack.py --dry-run # só lê, não escreve
```

- Importa questões com `is_verified = true` e `status = 'active'` e todo o repertório com embeddings.
- Idempotente: usa `upsert on_conflict=external_id` para questões e `on_conflict=id` para repertório.
- Usa `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` como destino e `STUDYTRACK_*` como origem.
- Rodar periodicamente conforme o StudyTrack receber novas questões verificadas.

---

## 8. Padrões Obrigatórios — Fastify

### Estrutura de arquivos por domínio

```
apps/api/src/routes/{domain}/
  index.ts     → registra rotas com fastify.register()
  schema.ts    → schemas Zod de input/output
  handler.ts   → lógica de negócio + chamadas ao service
  service.ts   → queries Prisma + chamadas externas
```

### Template de rota

```typescript
// schema.ts
import { z } from 'zod'

export const createCourseBody = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  price_cents: z.number().int().positive(),
  type: z.enum(['extensivo', 'semi_extensivo', 'intensivo', 'por_materia', 'avulso']),
})

export type CreateCourseBody = z.infer<typeof createCourseBody>
```

```typescript
// handler.ts
import { FastifyRequest, FastifyReply } from 'fastify'
import { CreateCourseBody } from './schema'
import { createCourse } from './service'

export async function handleCreateCourse(
  req: FastifyRequest<{ Body: CreateCourseBody }>,
  reply: FastifyReply
) {
  const userId = req.auth.userId  // injetado pelo @clerk/fastify
  const course = await createCourse(userId, req.body)
  return reply.status(201).send({ course })
}
```

```typescript
// index.ts
import { FastifyInstance } from 'fastify'
import { createCourseBody } from './schema'
import { handleCreateCourse } from './handler'

export async function courseRoutes(fastify: FastifyInstance) {
  // GET público — sem auth
  fastify.get('/courses', handleListCourses)

  // POST protegido — requer role
  fastify.post('/courses', {
    preHandler: [fastify.requireRole('teacher', 'admin')],
    schema: { body: createCourseBody },
  }, handleCreateCourse)
}
```

### Regras de rota

1. **Toda rota protegida** deve ter `preHandler: [fastify.authenticate]` ou `fastify.requireRole(...)`
2. **Toda rota com body** deve ter `schema: { body: zodSchema }` para validação automática
3. **Sempre retornar erros tipados** — nunca `reply.send({ error: 'something went wrong' })`
4. **Paginação obrigatória** em todos os endpoints de listagem — usar cursor ou offset explícito
5. **Webhooks** são sempre registrados ANTES do plugin de auth do Clerk e validam assinatura própria

### Erros padronizados

```typescript
// apps/api/src/errors.ts
export class AppError extends Error {
  constructor(
    public readonly code: string,
    public readonly message: string,
    public readonly statusCode: number = 400
  ) { super(message) }
}

// Uso no handler:
throw new AppError('ENROLLMENT_EXISTS', 'Aluno já matriculado neste curso', 409)
throw new AppError('COURSE_NOT_FOUND', 'Curso não encontrado', 404)
```

### Validação de env vars no startup

```typescript
// apps/api/src/env.ts
import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  CLERK_SECRET_KEY: z.string().min(1),
  CLERK_WEBHOOK_SECRET: z.string().min(1),
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_'),
  BUNNY_API_KEY: z.string().min(1),
  BUNNY_SIGNING_KEY: z.string().min(1),
  BUNNY_WEBHOOK_SECRET: z.string().min(1),
  ABLY_API_KEY: z.string().min(1),
  AI_SERVICE_URL: z.string().url(),
  AI_SERVICE_SECRET: z.string().min(1),
  RESEND_API_KEY: z.string().startsWith('re_'),
  QSTASH_TOKEN: z.string().min(1),
  QSTASH_CURRENT_SIGNING_KEY: z.string().min(1),
  QSTASH_NEXT_SIGNING_KEY: z.string().min(1),
  AWS_ACCESS_KEY_ID: z.string().min(1),
  AWS_SECRET_ACCESS_KEY: z.string().min(1),
  AWS_REGION: z.string().min(1),
  IVS_CHANNEL_ARN: z.string().min(1),
  CLOUDFLARE_ACCOUNT_ID: z.string().min(1),
  R2_ACCESS_KEY_ID: z.string().min(1),
  R2_SECRET_ACCESS_KEY: z.string().min(1),
})

export const env = envSchema.parse(process.env)
// Lança erro no startup se qualquer variável estiver faltando
```

---

## 9. Padrões Obrigatórios — Next.js

### Server vs Client Components

```typescript
// PADRÃO: Server Component (sem 'use client')
// app/student/cursos/page.tsx
export default async function CoursesPage() {
  const enrollments = await getEnrollments()  // Server Action ou fetch direto
  return <CourseList enrollments={enrollments} />
}

// EXCEÇÃO: Client Component (com 'use client') — apenas quando necessário:
// - interatividade (onClick, onChange, hooks de estado)
// - Ably realtime (chat, enquetes, presença)
// - player de vídeo (IVS, Bunny)
// - animações de gamificação
'use client'
export function LiveSessionRoom({ sessionId }: { sessionId: string }) {
  // ...
}
```

### Regras de fetch

1. **Server Components** fazem fetch direto para `apps/api` usando `fetch()` com `Authorization: Bearer {token}` do Clerk
2. **Client Components** NUNCA chamam `apps/api` diretamente — usam **Route Handlers** em `app/api/`
3. **Route Handlers** em `app/api/` atuam como proxy autenticado entre o browser e `apps/api`

```typescript
// app/api/courses/[id]/route.ts (Route Handler)
import { auth } from '@clerk/nextjs/server'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { getToken } = await auth()
  const token = await getToken()

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/${params.id}`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  const data = await res.json()
  return Response.json(data)
}
```

### Loading states

Toda `page.tsx` que faz fetch assíncrono **obrigatoriamente** tem um `loading.tsx` no mesmo diretório:

```
app/student/cursos/
  page.tsx      → busca dados, renderiza
  loading.tsx   → Suspense boundary com skeleton
  error.tsx     → error boundary
```

### Estrutura de rotas (App Router)

**Importante:** `(public)` e `(auth)` são *route groups* do Next.js (parênteses) — o nome da pasta **não entra na URL**, porque essas áreas querem URL limpa (`/`, `/cursos`, `/sign-in`). Já `student`, `teacher`, `manager`, `parent` e `admin` são pastas **normais** (sem parênteses) — o nome vira prefixo real da URL (`/student/dashboard`, `/manager/financeiro`). Isso é obrigatório: como cada role tem sua própria página `dashboard`, `alunos` etc., um route group faria essas páginas colidirem todas em `/dashboard` (route groups não aparecem na URL, então dois `dashboard/page.tsx` em grupos diferentes viram o mesmo path e o Next.js recusa o build). O prefixo real também é o que permite o middleware abaixo casar por path.

```
app/
  (public)/
    page.tsx                    → landing page
    cursos/[slug]/page.tsx      → página pública de vendas do curso
  (auth)/
    sign-in/[[...sign-in]]/page.tsx
    sign-up/[[...sign-up]]/page.tsx
    unauthorized/page.tsx       → rota para usuários sem permissão
  student/
    layout.tsx                  → layout com nav do aluno
    dashboard/page.tsx          → /student/dashboard
    cursos/page.tsx
    cursos/[slug]/
      page.tsx
      aulas/[lessonId]/page.tsx
    simulados/page.tsx
    redacoes/page.tsx
    auloes/page.tsx
    auloes/[id]/page.tsx        → sala do aulão ao vivo
    ranking/page.tsx
  teacher/
    layout.tsx
    dashboard/page.tsx          → /teacher/dashboard
    cursos/page.tsx
    cursos/[slug]/aulas/page.tsx
    redacoes/page.tsx
    auloes/page.tsx
  manager/
    layout.tsx
    dashboard/page.tsx          → /manager/dashboard
    alunos/page.tsx
    relatorios/page.tsx
    financeiro/page.tsx
  parent/
    layout.tsx
    dashboard/page.tsx          → /parent/dashboard
    alunos/[studentId]/page.tsx → /parent/alunos/[studentId]
  admin/
    layout.tsx
    page.tsx                    → /admin
    vinculos/page.tsx           → /admin/vinculos
  api/                           → Route Handlers (proxy para apps/api)
    courses/[...]/route.ts
    lessons/[...]/route.ts
    webhooks/                    → NÃO são proxy — processam diretamente
```

Aliases antigos ou transicionais como `/gestao`, `/professor`, `/responsavel` e `/simulados` podem existir apenas como redirects temporários para as rotas canônicas. Links internos, `ROLE_TO_DASHBOARD`, navegação e middleware devem apontar sempre para `/{role}/...`.

### Middleware RBAC

```typescript
// apps/web/src/proxy.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isStudentRoute = createRouteMatcher(['/student(.*)'])
const isTeacherRoute = createRouteMatcher(['/teacher(.*)'])
const isManagerRoute = createRouteMatcher(['/manager(.*)'])
const isParentRoute  = createRouteMatcher(['/parent(.*)'])
const isAdminRoute   = createRouteMatcher(['/admin(.*)'])

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth()
  const role = sessionClaims?.publicMetadata?.role as string | undefined

  // Usuário não autenticado tentando acessar rota protegida
  if (!userId && (
    isStudentRoute(req) || isTeacherRoute(req) ||
    isManagerRoute(req) || isParentRoute(req) || isAdminRoute(req)
  )) {
    return Response.redirect(new URL('/sign-in', req.url))
  }

  // Admin tem acesso a tudo — verificar primeiro
  if (role === 'admin') return

  // Verificação de role por rota — redireciona para /unauthorized (não /sign-in)
  if (isStudentRoute(req) && role !== 'student') {
    return Response.redirect(new URL('/unauthorized', req.url))
  }
  if (isTeacherRoute(req) && role !== 'teacher') {
    return Response.redirect(new URL('/unauthorized', req.url))
  }
  if (isManagerRoute(req) && role !== 'manager') {
    return Response.redirect(new URL('/unauthorized', req.url))
  }
  if (isParentRoute(req) && role !== 'parent') {
    return Response.redirect(new URL('/unauthorized', req.url))
  }
  if (isAdminRoute(req)) {
    // role !== 'admin' já foi tratado acima (admin retornou cedo)
    return Response.redirect(new URL('/unauthorized', req.url))
  }
})

export const config = {
  matcher: ['/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)'],
}
```

---

## 10. Regras de Gamificação

### Estrutura de pontos

| Ação | Pontos Base | Multiplicador |
|------|------------|---------------|
| Questão correta (fácil) | 10 | ×1.0 → 10 pts |
| Questão correta (médio) | 10 | ×1.5 → 15 pts |
| Questão correta (difícil) | 10 | ×2.5 → 25 pts |
| Simulado concluído | 50 | ×1.0 |
| Redação enviada | 30 | ×1.0 |
| Check-in diário | 5 | ×1.0 |
| Streak bonus (7 dias) | 20 | ×1.0 |
| Streak bonus (30 dias) | 100 | ×1.0 |

### Regras de streak

- **Definição:** aluno realizou pelo menos 1 atividade (questão, check-in, redação) no dia calendário (horário BRT)
- **Quebra:** nenhuma atividade até 23:59 BRT → QStash `daily-streak-check` verifica e quebra
- **Proteção por escudo:** se `shield_count > 0` na quebra → decrementa shield atomicamente, não quebra streak
- **Escudos:** ganhos por marcos (streak de 7 dias dá 1 escudo)
- **Operação atômica:** `UPDATE gamification_streaks SET shield_count = shield_count - 1 WHERE ...`

### Regras de ranking mensal

- Ranking calculado via `SUM(points * multiplier)` da tabela `gamification_points` para o mês corrente
- Job QStash `monthly-ranking-reset` no primeiro dia do mês:
  1. Calcula top 3 do mês anterior
  2. Salva snapshot em `gamification_monthly_ranking`
  3. Envia email via Resend para os top 3 (aviso sobre prêmio físico)
  4. **NÃO** zera `gamification_points` — pontos históricos são permanentes

### Ledger append-only

```typescript
// CORRETO: sempre insert
await prisma.gamificationPoint.create({
  data: {
    student_id: userId,
    points: pointsBase,
    origin_type: 'QUESTION',
    origin_id: questionId,
    multiplier: 1.5,
  }
})

// ERRADO: nunca fazer isso
await prisma.user.update({
  data: { total_points: { increment: pointsEarned } }  // ← NÃO
})
```

### Títulos disponíveis

| Título | Condição |
|--------|---------|
| Iniciante | 1ª questão respondida |
| Persistente | Streak de 7 dias |
| Dedicado | 100 questões respondidas |
| Guerreiro | 500 questões respondidas |
| Mestre | 1000 questões respondidas |
| Campeão de Redação | 10 redações corrigidas |
| Simuladeiro | 5 simulados concluídos |
| Mês de Ouro | Top 3 no ranking mensal |

---

## 11. Regras de Acesso a Conteúdo

1. **Conteúdo pago** só acessível com `enrollment.status = 'active'` e `enrollment.expires_at > now()` (ou null para vitalício)
2. **Enrollment criado APENAS** após webhook Stripe `checkout.session.completed` — nunca antes do pagamento
3. **Webhook idempotente:** sempre verificar `webhook_events` antes de processar. Se evento já existe → retornar 200 sem processar
4. **Aulas preview** (`is_preview = true`) são acessíveis sem enrollment — verificar flag antes de validar matrícula
5. **Signed URL** do vídeo Bunny gerada no backend com TTL 1h — nunca exposta via variável de ambiente no frontend
6. **Questões geradas por IA** com `status = 'pending_review'` ou `is_verified = false` não aparecem para alunos — filtrar sempre por `status = 'active' AND is_verified = true`

---

## 12. Regras de `apps/ai` (FastAPI Python)

### Estrutura de arquivos

```
apps/ai/
  main.py              → FastAPI app, registra routers
  config.py            → validação de env vars com Pydantic Settings
  routers/
    essays.py          → OCR + correção de redação
    questions.py       → geração de questões por IA
    answer_sheets.py   → OCR de folha de resposta (simulado impresso)
  services/
    gemini.py          → wrapper do Gemini com retry e timeout
    essay_grader.py    → lógica de correção C1-C5
    question_generator.py → lógica de geração de questões
    ocr_service.py     → interpretação de imagens
  models/
    essay.py           → Pydantic models de entrada/saída
    question.py
    answer_sheet.py
  requirements.txt
  venv/                → NUNCA commitar. Criar com: python -m venv venv
```

### Modelos Gemini por tarefa

```python
# Tarefas críticas — máxima qualidade
GEMINI_GRADING_MODEL   = "gemini-2.5-pro"   # correção de redação C1-C5
GEMINI_OCR_MODEL       = "gemini-2.5-pro"   # OCR de gabarito e transcrição de redação
GEMINI_OCR_CONFIG      = {"maxOutputTokens": 65536, "temperature": 0.1}

# Tarefas de geração — velocidade aceitável
GEMINI_GENERATION_MODEL = "gemini-2.0-flash"  # geração de questões por IA
```

### Regras obrigatórias

1. **Nunca retornar fallback zerado em erro de IA.** Retornar HTTP 502 com `{ "error": "AI_UNAVAILABLE", "detail": "..." }`
2. **Validar todo payload de entrada com Pydantic** antes de chamar o Gemini
3. **Timeout de 30s** em todas as chamadas ao Gemini (usar `asyncio.wait_for`)
4. **Autenticação entre apps/api e apps/ai:** header `X-AI-Secret: {AI_SERVICE_SECRET}` — rejeitar requests sem esse header
5. **Log de todos os prompts** em formato estruturado (JSON) para auditoria
6. **Sempre ativar `venv`** antes de qualquer comando Python: `source venv/bin/activate`

### Template de endpoint

```python
# routers/essays.py
from fastapi import APIRouter, HTTPException, Depends
from models.essay import EssayGradeRequest, EssayGradeResponse
from services.gemini import call_gemini_with_timeout
from auth import verify_ai_secret  # valida X-AI-Secret header

router = APIRouter(prefix="/essays", tags=["essays"])

@router.post("/grade", response_model=EssayGradeResponse)
async def grade_essay(
    body: EssayGradeRequest,
    _: None = Depends(verify_ai_secret)
):
    try:
        result = await call_gemini_with_timeout(
            prompt=build_grading_prompt(body),
            model="gemini-2.5-pro",
            timeout=30.0
        )
        return parse_grading_result(result)
    except TimeoutError:
        raise HTTPException(502, {"error": "AI_UNAVAILABLE", "detail": "Gemini timeout"})
    except Exception as e:
        log_error("essay_grade_failed", str(e), body.dict())
        raise HTTPException(502, {"error": "AI_UNAVAILABLE", "detail": str(e)})
```

### Validação de config no startup

```python
# config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    google_api_key: str
    ai_service_secret: str
    gemini_grading_model: str = "gemini-2.5-pro"
    gemini_generation_model: str = "gemini-2.0-flash"
    gemini_timeout_seconds: int = 30

    class Config:
        env_file = ".env"

settings = Settings()  # Lança ValidationError no startup se faltar variável
```

---

## 13. Referências

- **Schema do banco:** `packages/db/prisma/schema.prisma`
- **Arquitetura detalhada:** `ARQUITETURA_MAIS_APROVACAO.md`
- **Contrato de API:** `docs/api-contract.md`
- **Seed de desenvolvimento:** `packages/db/prisma/seed.ts`

---

## 14. Regras para Agentes e Devs

1. **Nunca criar tabela nova** sem atualizar `packages/db/prisma/schema.prisma` e criar migration via `npx prisma migrate dev`
   - **Nomenclatura de migration:** sempre prefixo sequencial `0001_`, `0002_`, `0003_`... com nome curto e semântico. Nunca usar timestamp no nome.
   - Se `prisma migrate dev` não alcançar o banco (ex: ambiente remoto), aplicar o DDL via Supabase MCP e registrar manualmente em `_prisma_migrations` (a tabela é acessível via REST com service role).
2. **Nunca criar endpoint** sem documentar em `docs/api-contract.md`
3. **Nunca fazer merge** sem o outro dev ter revisado
4. **Sempre rodar** `pnpm typecheck` antes de abrir PR
5. **Nunca commitar** `.env` ou qualquer arquivo com credenciais reais
6. **Packages internos** sempre referenciados como `@mais-aprovacao/[nome]`
7. **Python:** sempre ativar `venv` antes de rodar qualquer comando em `apps/ai`
8. **Webhooks:** sempre verificar idempotência na tabela `webhook_events` antes de processar
9. **Paginação:** todo endpoint de listagem deve aceitar `limit` e `cursor` (ou `page`)
10. **Erros de IA:** `apps/ai` nunca retorna fallback silencioso — sempre HTTP 502 em falha do Gemini
11. **Client Components** no Next.js nunca chamam `apps/api` diretamente — usar Route Handlers como proxy
12. **`GOOGLE_API_KEY`** existe apenas em `apps/ai` — nunca colocar em `apps/api` ou no frontend
13. **Ao final de cada sessão:** atualizar este arquivo e o `ARQUITETURA_MAIS_APROVACAO.md` se algo mudou, e fazer push
