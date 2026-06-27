# Ownership por dominio

Este documento formaliza a divisao de ownership entre Kauã e Igor no Mais Aprovacao. O objetivo e permitir que dois devs ou agentes trabalhem em paralelo sem sobrescrever decisoes de produto, contrato, banco, frontend, backend ou integracoes do outro.

As fontes de verdade para esta divisao sao o estado atual de `packages/db/prisma/schema.prisma`, `docs/api-contract.md` e `CLAUDE.md`. A task original que originou este documento estava desatualizada; portanto, este arquivo usa `users` como espelho do Clerk, inclui os dominios ja existentes no schema/contrato e nao usa `profiles`.

## Convencao central

Ownership e vertical por dominio, nao por camada.

O dono de um dominio responde pelo fluxo completo daquele dominio: telas Next.js, rotas Fastify, chamadas ao AI Service quando existirem, schema Prisma, migrations, testes, documentacao e integracoes externas. Arquivos compartilhados continuam sendo fonte de verdade conjunta, mesmo quando a alteracao vem de um dominio com dono definido.

## Regras gerais

- O dono do dominio responde por frontend, API, schema, migrations, testes e documentacao daquele dominio.
- Todo endpoint novo ou alterado exige atualizacao de `docs/api-contract.md`.
- Toda mudanca de banco exige atualizacao de `packages/db/prisma/schema.prisma` e uma migration Prisma revisada.
- Alteracao em dominio do outro dev exige comunicacao antes de comecar.
- Alteracao em arquivo compartilhado exige revisao conjunta.
- Conflitos de merge em arquivos compartilhados devem ser resolvidos por Kauã e Igor, nao por agente isolado.
- Rotas admin seguem o dono do recurso administrado. Exemplo: `/admin/questions` e de Kauã; `/admin/users` e de Igor.
- Webhooks seguem o dono da integracao ou do recurso afetado. Exemplo: Stripe e Clerk ficam com Igor; Bunny Stream fica com Kauã.
- `docs/api-contract.md` e `packages/db/prisma/schema.prisma` sao artefatos compartilhados e devem ser tratados como fonte de verdade conjunta.

## Tabela de ownership por dominio

| Dominio | Dono | Frontend Next.js | Fastify/API | AI Service, se aplicavel | Banco/Prisma | Arquivos compartilhados afetados | Observacoes/limites de ownership |
|---|---|---|---|---|---|---|---|
| Catalogo publico e conteudo gravado | Kauã | Listagem de cursos, pagina publica de curso, modulos, aulas, materiais e player VOD Bunny | `GET /courses`, `GET /courses/:slug`, `GET /courses/:slug/cohorts`, `GET /lessons/:id`, `POST /lessons/:id/bunny-upload-url`, `/admin/courses`, `/admin/courses/:id`, `/admin/courses/:id/modules`, `/admin/modules/:moduleId/lessons`, `POST /webhooks/bunny` | Nao aplicavel | `courses`, `course_cohorts`, `course_modules`, `course_lessons`, `course_materials` | `docs/api-contract.md`, `packages/db/prisma/schema.prisma`, migrations, `packages/types`, `packages/ui` quando expuser tipos/componentes de curso | Nao inclui checkout, pagamento ou regra financeira da matricula. Pode ler `enrollments` apenas para bloquear conteudo pago. |
| Area do aluno e progresso | Kauã | Dashboard do aluno, trilha de aulas, progresso por aula, modulo e curso | `GET /enrollments/me`, `GET /enrollments/:courseId/access`, `PATCH /progress/lessons/:lessonId`, `POST /progress/modules/:moduleId/complete`, `GET /progress/courses/:courseId` | Nao aplicavel | `lesson_progress`, `module_completions`; leitura de `enrollments`, `courses`, `course_modules`, `course_lessons` | `docs/api-contract.md`, `packages/db/prisma/schema.prisma`, migrations, `packages/utils` para regras de acesso | Criacao e estado financeiro de `enrollments` pertencem ao Igor. Kauã consome a matricula como autorizacao de acesso. |
| Certificados | Kauã | Lista, emissao, verificacao publica e download de certificados | `POST /certificates/:courseId`, `GET /certificates/me`, `GET /certificates/verify/:credentialId` | Nao aplicavel | `certificates`; leitura de `lesson_progress`, `module_completions`, `courses`, `users` | `docs/api-contract.md`, `packages/db/prisma/schema.prisma`, migrations, `packages/types` | Depende das regras de conclusao do dominio de progresso. Mudancas em identidade exibida no certificado devem alinhar com Igor. |
| Questoes e simulados | Igor | Banco de questoes, tentativa avulsa, simulados, folha de resposta e admin de questoes | `/questions`, `/question-attempts`, `/exam-sessions`, `/admin/questions`, `/admin/questions/:id`, `/admin/questions/generate` | `/ai/questions/generate`, `/ai/answer-sheets/read` | `questions`, `question_attempts`, `exam_sessions`, `exam_session_answers` | `docs/api-contract.md`, `packages/db/prisma/schema.prisma`, migrations, `packages/types`, `packages/utils` quando pontuar tentativas | Pontos gerados por questoes devem respeitar o ledger de gamificacao. Integracoes de IA deste dominio sao de Igor, mas segredos e politicas globais do AI Service continuam compartilhados. |
| Gamificacao | Kauã | Ranking, streak, pontos, historico e titulos | `/gamification/ranking/monthly`, `/gamification/streak/me`, `/gamification/me`, `/gamification/points/me` | Nao aplicavel | `gamification_points`, `gamification_streaks`, `gamification_titles`, `gamification_monthly_ranking` | `docs/api-contract.md`, `packages/db/prisma/schema.prisma`, migrations, `packages/utils` | Ledger de pontos e append-only. Jobs globais que materializam ranking mensal usam QStash/Resend e exigem alinhamento com Igor quando mexerem em infra. |
| Auth, perfil e RBAC | Igor | Login, cadastro, perfil, middleware de roles, telas de usuario e admin de usuarios | `GET /me`, `PATCH /me`, `POST /webhooks/clerk`, `GET /admin/users`, `PATCH /admin/users/:id` | Nao aplicavel | `users`, leitura de relacoes de dominio quando necessario para autorizacao | `docs/api-contract.md`, `packages/db/prisma/schema.prisma`, migrations, `packages/types`, `packages/utils`, regras globais em `CLAUDE.md` | `users` e o espelho do Clerk. Mudancas de role/RBAC que afetem mais de um dominio exigem decisao conjunta. |
| Matriculas, checkout e Stripe | Igor | Checkout, confirmacao de compra, historico de pagamentos e estados de acesso financeiro | `POST /enrollments`, `GET /payments/me`, `POST /webhooks/stripe`, partes financeiras de `/admin/courses/:id/students` | Nao aplicavel | `enrollments`, `checkout_sessions`, `payments`, `webhook_events`; leitura de `courses`, `course_cohorts`, `users` | `docs/api-contract.md`, `packages/db/prisma/schema.prisma`, migrations, `packages/types`, `packages/utils` para acesso pago | Enrollment ativo desbloqueia conteudo dos dominios de Kauã. Nao criar `enrollments` antes do webhook Stripe `checkout.session.completed`. |
| Ao vivo, IVS e Ably | Igor | Sala de live, player IVS, presenca, chat, enquetes e telas de auloes | `GET /live-classes`, `GET /live-classes/:id`, `POST /live-classes/:id/attendance`, `POST /live-classes/:id/end`, `GET /live-classes/:id/polls`, `POST /live-classes/:id/polls`, `POST /polls/:pollId/votes`, `POST /admin/live-classes` | Nao aplicavel | `live_classes`, `live_attendance`, `polls`, `poll_options`, `poll_votes`; leitura de `courses`, `course_modules`, `users` | `docs/api-contract.md`, `packages/db/prisma/schema.prisma`, migrations, `packages/types`, `packages/ui` para sala de live | Conteudo live pode estar associado a curso/modulo de Kauã, mas operacao IVS/Ably, presenca e enquetes pertencem ao Igor. |
| Redacoes, repertorio e AI Service de redacao | Kauã | Temas, envio, listagem, detalhe, correcao e historico de redacoes | `/essay-prompts`, `/essays`, `/essays/me`, `/essays/:id`, `/essays/:id/correct`, `/essays/:id/correction`, `/admin/essays` | `/ai/essays/correct`, `/ai/essays/transcribe`, `/ai/repertoire/search` | `essay_prompts`, `essays`, `essay_competency_scores`, `repertoire`; leitura de `courses`, `users` | `docs/api-contract.md`, `packages/db/prisma/schema.prisma`, migrations, `packages/types` | `repertoire` usa pgvector fora do suporte direto do Prisma para embedding. Mudancas em infraestrutura geral do AI Service exigem decisao conjunta. |
| Comunicacao, responsaveis e jobs | Igor | Avisos, area de responsaveis, acompanhamento de aluno e notificacoes | `/announcements`, `/parent/student-links`, `/parent/students/:studentId/progress`, `POST /admin/announcements`, `POST /internal/jobs/:jobName` | Nao aplicavel | `announcements`, `parent_student_links`, `webhook_events`; leitura de `users`, `courses`, progresso e gamificacao | `docs/api-contract.md`, `packages/db/prisma/schema.prisma`, migrations, `packages/types`, `packages/utils` | Jobs QStash obrigatorios incluem `daily-streak-check` e `monthly-ranking-reset`. Quando job alterar gamificacao de Kauã, a regra de negocio deve ser revisada pelos dois. |
| Operacional e health check | Compartilhado | Estados globais de indisponibilidade, se existirem | `GET /health` no Fastify | `GET /health` no FastAPI | Nao aplicavel | `docs/api-contract.md`, configs dos apps | Mudancas em health checks, observabilidade ou disponibilidade global sao decisao conjunta. |

## Dominios compartilhados / decisao conjunta obrigatoria

Os itens abaixo nao devem ser apropriados por um unico dev ou agente isolado:

- `docs/api-contract.md`
- `docs/domain-ownership.md`
- `packages/db/prisma/schema.prisma`
- migrations Prisma
- `packages/types`
- `packages/utils`
- `packages/ui`
- design system e customizacoes Shadcn
- regras globais em `CLAUDE.md`
- auth/RBAC quando a mudanca afetar mais de um dominio
- mudancas breaking em API ou banco
- contratos entre `apps/api` e `apps/ai`
- configuracao global de secrets, deploy, observabilidade, filas e webhooks
- conflitos de merge em arquivos compartilhados

Admin tambem e transversal: cada endpoint `/admin/*` pertence ao dono do recurso que administra, mas mudancas de navegacao, permissoes globais, layout admin ou relatorios multi-dominio exigem decisao conjunta.

Webhooks seguem o dominio afetado, mas a tabela `webhook_events` e o padrao de idempotencia sao compartilhados. Stripe e Clerk ficam com Igor; Bunny Stream fica com Kauã; jobs QStash ficam com Igor quando forem infraestrutura/comunicacao e exigem alinhamento com Kauã quando alterarem gamificacao, progresso ou conteudo.

## Fluxo para mudancas fora do dominio

1. Identifique o dominio principal da mudanca antes de editar.
2. Se o dominio pertencer ao outro dev, comunique objetivo, arquivos provaveis e impacto esperado antes de comecar.
3. Se a mudanca tocar arquivo compartilhado, registre no PR ou handoff quais secoes foram alteradas e por que.
4. Se a mudanca for breaking em API ou banco, obtenha decisao conjunta antes da implementacao.
5. Se houver conflito de merge em arquivo compartilhado, pare e chame Kauã e Igor para resolverem juntos.
6. Se um agente estiver trabalhando sem confirmacao humana, ele deve limitar-se ao dominio solicitado e evitar alteracoes oportunistas em dominios vizinhos.

## Checklist para agentes antes de codar

- Li `CLAUDE.md` da raiz e o `CLAUDE.md` local do app/package afetado.
- Conferi `docs/api-contract.md` para endpoints existentes e obrigacoes de contrato.
- Conferi `packages/db/prisma/schema.prisma` para models, relacoes e nomes reais das tabelas.
- Identifiquei o dominio vertical e o dono.
- Verifiquei se a tarefa toca arquivo compartilhado.
- Se tocar dominio do outro dev, ha comunicacao previa registrada.
- Se criar ou alterar endpoint, vou atualizar `docs/api-contract.md`.
- Se criar ou alterar banco, vou atualizar `packages/db/prisma/schema.prisma` e gerar migration Prisma.
- Se tocar AI Service, confirmei se o endpoint pertence a redacoes/repertorio, questoes/simulados ou infraestrutura compartilhada.
- Se tocar webhooks, confirmei assinatura propria, idempotencia via `webhook_events` e dono da integracao.
- Se tocar admin, confirmei o dono do recurso administrado.
- Nao vou resolver conflito de merge em arquivo compartilhado sem Kauã e Igor.

## Cobertura explicita do schema e contrato

Esta divisao cobre os modelos atuais do Prisma: `users`, `courses`, `course_cohorts`, `course_modules`, `course_lessons`, `course_materials`, `enrollments`, `checkout_sessions`, `payments`, `lesson_progress`, `module_completions`, `certificates`, `live_classes`, `live_attendance`, `polls`, `poll_options`, `poll_votes`, `questions`, `question_attempts`, `exam_sessions`, `exam_session_answers`, `repertoire`, `essay_prompts`, `essays`, `essay_competency_scores`, `parent_student_links`, `announcements`, `webhook_events`, `gamification_points`, `gamification_streaks`, `gamification_titles` e `gamification_monthly_ranking`.

Tambem cobre as secoes atuais do contrato de API: operacional, catalogo publico, auth e perfil, matriculas e pagamentos, conteudo e aulas, progresso, ao vivo, certificados, questoes e simulados, redacoes, gamificacao, comunicacao e responsaveis, webhooks, admin e AI Service FastAPI.
