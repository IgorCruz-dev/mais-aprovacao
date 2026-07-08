# Referência: Auth/RBAC da StudyTrack (branch backup)

Arquivos originais da StudyTrack (Supabase Auth + Flask + Next.js) que implementam RBAC
multi-nível em produção. **Referência de arquitetura e lógica — NÃO compilar.**
A estrutura de pastas original foi achatada; os nomes abaixo indicam o papel de cada arquivo.

Mapeamento de roles StudyTrack → Mais Aprovação:
`student→student` · `teacher→teacher` · `manager→manager` · `founder→parent` · `admin→admin`
(ignorar `secretariat`, `associate`, `dev`)

## Núcleo do RBAC

| Arquivo | O que é |
|---|---|
| `rbac-decorators-tenants.py` | Decorators do backend Flask: `load_user_context`, `require_auth`, `require_role`, `require_organization_access`, `require_founder_of_org` (valida role E posse do recurso). Portar o conceito como plugin/preHandlers do Fastify. |
| `middleware-rbac.ts` | Middleware do Next.js: valida sessão via cookies, resolve role (metadata → banco em áreas sensíveis) e aplica a matriz de redirects por role. A peça central do frontend. |
| `roles.ts` | Enum de roles + mapa `ROLE_PERMISSIONS` por role. |
| `schema-auth-tables.sql` | DDL das tabelas de auth/tenancy: `profiles` (role no banco com CHECK), `organizations`/`schools`/`classrooms` (hierarquia com invite_codes), `teacher_classrooms`, `classroom_members`, `access_requests` (fila de aprovação), `security_logs` (auditoria). |

## Fluxo de sessão e redirects

| Arquivo | O que é |
|---|---|
| `portal-role-router-page.tsx` | "Roteador" pós-login: lê a role no banco e redireciona cada perfil pro seu dashboard. |
| `portal-layout.tsx` | Layout server component: busca perfil, resolve role e injeta no provider/nav. |
| `PortalRoleContext.tsx` | Propagação da role para client components (`usePortalRole()`). |
| `auth-callback-route.ts` | Callback de confirmação: mapa `ROLE_TO_DASHBOARD` + resolução role (banco > metadata > cookie). |

## Cadastro e onboarding por perfil

| Arquivo | O que é |
|---|---|
| `register-page.tsx` | Cadastro com seletor de perfil (Aluno vs Escola→professor/secretaria); grava role no metadata + cookie de onboarding. |
| `onboarding-teacher-school-page.tsx` | Onboarding do professor: vínculo imediato via `invite_code` da escola OU pedido de aprovação (`access_requests` → pending). |

## Exemplos por role (telas e endpoints)

| Arquivo | O que é |
|---|---|
| `manager-blueprint.py` | Endpoints do manager com `require_role` + revalidação de posse (escola pertence à org). |
| `teacher-blueprint.py` | Endpoints do teacher: criar/listar turmas, alunos da turma. |
| `manager-dashboard-page.tsx` | Dashboard do manager (seletor de escola + KPIs + gráficos). |
| `teacher-dashboard-page.tsx` | Home do teacher (cards de turmas). |
| `parent-student-detail-page.tsx` | **Referência do PARENT**: visão do founder ("Acesso do Responsável") sobre um aluno vinculado — desempenho individual detalhado. |
