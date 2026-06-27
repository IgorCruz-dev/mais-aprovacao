# Architecture Tree

Este documento descreve o esqueleto estrutural do monorepo Mais Aprovacao. Ele nao substitui `CLAUDE.md`, `docs/api-contract.md`, `docs/domain-ownership.md` ou `docs/workflow.md`.

## Macro areas

- `.github/`: workflows de CI e template de pull request.
- `docs/`: contratos, ownership, workflow e documentacao estrutural.
- `apps/web/`: frontend Next.js App Router.
- `apps/api/`: backend Fastify.
- `apps/ai/`: servico FastAPI para fluxos de IA.
- `packages/db/`: Prisma schema, client e migrations.
- `packages/types/`: tipos TypeScript compartilhados por dominio.
- `packages/utils/`: helpers compartilhados e genericos.
- `packages/ui/`: componentes React base compartilhados.

## Placeholders

Diretorios com `.gitkeep` existem apenas para reservar ownership e organizacao por dominio. Eles nao registram rotas, endpoints, routers, handlers, queries, chamadas externas ou regras de negocio.

Antes de implementar dentro de um placeholder:

1. Confirme o dominio em `docs/domain-ownership.md`.
2. Confirme o contrato em `docs/api-contract.md`.
3. Atualize contrato/schema/migrations apenas quando a task pedir mudanca real.
4. Registre rotas Next, Fastify ou FastAPI somente quando houver implementacao concreta.

## Apps

### Web

`apps/web/src/app` esta dividido por route groups:

- `(public)`: catalogo publico.
- `(auth)`: login, cadastro e estado nao autorizado.
- `(student)`: dashboard, cursos, aulas, simulados, questoes, redacoes, auloes, ranking e certificados.
- `(teacher)`: area docente.
- `(manager)`: gestao operacional.
- `(parent)`: acompanhamento de alunos vinculados.
- `(admin)`: administracao interna.
- `api`: espaco reservado para proxies autenticados do Next.js, sem route handlers neste esqueleto.

`apps/web/src/components` e `apps/web/src/features` seguem os dominios do contrato: catalogo, cursos, aulas, progresso, certificados, questoes, simulados, gamificacao, auth, checkout, live, redacoes, avisos, responsaveis e admin.

### API

`apps/api/src/routes` reserva diretorios por dominio Fastify. A rota `health.ts` existente continua sendo a unica registrada no servidor.

`apps/api/src/lib` preserva `prisma.ts`, `redis.ts` e `qstash.ts`, e reserva subpastas para Stripe, Bunny, Ably, IVS, R2, Resend e AI Service.

### AI

`apps/ai` preserva `routers/health.py`, `routers/essays.py`, `models/essay.py`, `services/gemini.py` e `services/supabase.py`.

Os diretorios `questions`, `answer_sheets`, `repertoire`, `auth`, `essay_grader`, `question_generator`, `ocr_service`, `repertoire_search` e `ai_usage` sao placeholders para implementacoes futuras.

## Packages

- `packages/types/src`: tipos minimos por dominio, alinhados aos nomes do contrato atual.
- `packages/utils/src`: helpers pequenos e genericos para datas, moeda, paginacao, erros, RBAC, gamificacao e video.
- `packages/ui/src`: componentes base pequenos e sem design final.

## Non-goals

Este esqueleto nao implementa endpoints, queries Prisma, migrations, integracoes externas, telas finais, regras de autorizacao ou regra de negocio.
