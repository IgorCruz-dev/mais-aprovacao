# +Aprovação Web — Contexto Global do Projeto

Leia este arquivo inteiro antes de qualquer tarefa. Ele define o contrato de desenvolvimento entre todos os agentes e devs.

---

## 1. Descrição do Projeto

**Nome:** +Aprovação Web  
**O que é:** Plataforma de cursos pré-vestibular online (ENEM, UFU, UEG e outros vestibulares)  
**Cliente:** Cursinho presencial expandindo para atendimento nacional  
**Prazo:** Lançamento novembro 2026  
**Devs:** Kauã (frontend/fullstack) + Igor (backend/infra)

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
| Pagamento | Stripe (PIX nativo) | - |
| Deploy FE | Vercel | - |
| Deploy BE | Railway | - |
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
  domain-ownership.md
```

---

## 4. Convenções de Nomenclatura

- **Arquivos TypeScript:** `camelCase.ts` para utils, `PascalCase.tsx` para componentes React
- **Rotas Next.js:** `kebab-case` nas pastas (ex: `app/(auth)/sign-in/page.tsx`)
- **Tabelas banco:** `snake_case` plural (ex: `courses`, `lesson_progress`)
- **Variáveis TypeScript:** `camelCase`
- **Constantes:** `UPPER_SNAKE_CASE`
- **Funções Fastify:** prefixo pelo domínio (`getCourse`, `createEnrollment`, `listLessons`)
- **Packages internos:** prefixo `@mais-aprovacao/` (não `@aprovacao/`)

---

## 5. Variáveis de Ambiente

Todas ficam no `.env` da raiz. Apps individuais têm seus próprios `.env.local` / `.env` que referenciam as mesmas chaves.

```
# Banco
DATABASE_URL          → Prisma runtime (pooler porta 6543)
DIRECT_URL            → Prisma migrations (session mode porta 5432)

# Supabase
SUPABASE_URL          → https://[ref].supabase.co
SUPABASE_ANON_KEY     → chave pública (frontend)
SUPABASE_SERVICE_ROLE_KEY → chave admin (backend/ai — nunca expor no frontend)

# Auth
CLERK_SECRET_KEY            → backend (apps/api)
CLERK_PUBLISHABLE_KEY       → backend Fastify plugin
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY → frontend Next.js

# Stripe
STRIPE_SECRET_KEY           → backend
STRIPE_WEBHOOK_SECRET       → webhook handler
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY → frontend

# Vídeo
BUNNY_API_KEY               → backend
BUNNY_READ_ONLY_API_KEY     → leitura
BUNNY_LIBRARY_ID            → biblioteca de vídeos

# Realtime
NEXT_PUBLIC_ABLY_API_KEY    → frontend (subscribe)
ABLY_API_KEY                → backend (publish)

# Upstash
UPSTASH_REDIS_URL           → backend
UPSTASH_REDIS_TOKEN         → backend
QSTASH_TOKEN                → backend

# AI
GOOGLE_API_KEY              → apps/ai (Gemini)

# AWS
AWS_IVS_CHANNEL_ARN         → live classes
AWS_ACCESS_KEY_ID           → backend
AWS_SECRET_ACCESS_KEY       → backend
AWS_REGION                  → backend

# Email
RESEND_API_KEY              → backend

# URLs
NEXT_PUBLIC_API_URL         → http://localhost:3001 (dev) / URL do Railway (prod)
WEB_URL                     → http://localhost:3000 (dev) / URL da Vercel (prod)
```

---

## 6. Como Rodar Localmente

```bash
# Instalar tudo
pnpm install

# Subir todos os apps (Next.js + Fastify via Turborepo)
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

## 7. Decisões de Arquitetura Importantes

### Prisma 7 — Mudanças Obrigatórias
O Prisma 7 **não suporta** `url` e `directUrl` no `schema.prisma`. A configuração fica em `packages/db/prisma.config.ts`.

O `PrismaClient` **exige** um adapter explícito:
```typescript
import { PrismaPg } from "@prisma/adapter-pg"
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })
```

### Supabase — Portas e Modos
- **Porta 6543** (Transaction Pooler) → usar em runtime (Prisma, Fastify). **NÃO** suporta migrations.
- **Porta 5432 no pooler** (Session Mode) → usar para migrations e operações DDL.
- **Porta 5432 direto** (`db.[ref].supabase.co`) → pode ser bloqueada por firewall/IPv6. Evitar.

### Migrations — Workflow Atual
Como as tabelas foram criadas via SQL Editor do Supabase, a migration inicial foi **baselineada** (não aplicada, só registrada). Novas migrations devem ser criadas normalmente via `npx prisma migrate dev` a partir daqui.

### RLS no Supabase
Todas as tabelas têm RLS habilitado. O backend Fastify usa `SUPABASE_SERVICE_ROLE_KEY` que bypassa RLS automaticamente. O frontend usa `SUPABASE_ANON_KEY` e precisa das policies.

### Clerk — Dois contextos
- **`apps/web`**: usa `@clerk/nextjs` com `ClerkProvider` no layout e `clerkMiddleware()` no `middleware.ts`
- **`apps/api`**: usa `@clerk/fastify` com `clerkPlugin`. Rota `/health` é pública (registrada antes do plugin).

### Packages Compartilhados
Todos os packages internos exportam direto de `.ts` (sem build). O TypeScript de cada app resolve via `paths` ou `workspace:*`. **Não fazer build dos packages** — os apps compilam tudo junto.

---

## 8. Referências

- **Schema do banco:** `packages/db/prisma/schema.prisma`
- **Contrato de API:** `docs/api-contract.md` *(a criar)*
- **Domínios:** `docs/domain-ownership.md` *(a criar)*
- **Seed de desenvolvimento:** `packages/db/prisma/seed.ts`

---

## 9. Regras para Agentes e Devs

1. **Nunca criar tabela nova** sem atualizar `packages/db/prisma/schema.prisma` e criar migration
2. **Nunca criar endpoint** sem documentar em `docs/api-contract.md`
3. **Nunca fazer merge** sem o outro dev ter revisado
4. **Sempre rodar** `pnpm typecheck` antes de abrir PR
5. **Nunca commitar** `.env` ou qualquer arquivo com credenciais reais
6. **Packages internos** sempre referenciados como `@mais-aprovacao/[nome]` (não `@aprovacao/`)
7. **Python:** sempre ativar `venv` antes de rodar qualquer comando em `apps/ai`
8. **Ao final de cada sessão** de desenvolvimento: atualizar este arquivo se algo mudou e fazer push
