# Workflow de desenvolvimento

Este documento define como Kauã, Igor e seus agentes colaboram no mesmo repositorio sem gerar conflito, codigo duplicado ou regressao. Ele vale para trabalho humano e para output gerado por agentes.

O principio central e simples: agentes podem acelerar implementacao, mas decisao, revisao, merge e resolucao de conflito continuam sendo responsabilidade humana.

## Branches

| Branch | Uso | Regra |
|---|---|---|
| `main` | Producao | Protegida. Ninguem faz push direto. Recebe merges estaveis a partir de `develop`. |
| `develop` | Integracao | Base para todos os PRs de dominio. Deve permanecer buildavel. |
| `kaua/dominio` | Trabalho do Kauã | Branches de task ou dominio, por exemplo `kaua/catalogo` ou `kaua/player`. |
| `igor/dominio` | Trabalho do Igor | Branches de task ou dominio, por exemplo `igor/auth` ou `igor/stripe`. |

Use nomes curtos e descritivos. Quando a branch for de task especifica, prefira `kaua/nome-da-task` ou `igor/nome-da-task`.

## Excecao de setup inicial

Enquanto o projeto ainda estiver na fase de setup do proprio workflow, ajustes estruturais podem ser commitados direto em `main` por decisao dos devs. Depois que `develop`, CI e branch protection estiverem ativos, essa excecao deixa de valer: `main` passa a ser protegida e todo trabalho deve entrar via PR.

## Ciclo de uma task

1. Pegar a task no Jira e mover para **Em progresso**.
2. Atualizar a base local e confirmar que `develop` esta sincronizada com o remoto:

```bash
git checkout develop
git pull
```

3. Se `develop` estiver atrasada em relacao a `main`, sincronizar antes de comecar codigo de dominio. Essa sincronizacao deve ser feita por PR de `main` para `develop` ou por merge/rebase local revisado, nunca por agente isolado.
4. Criar a branch a partir de `develop`:

```bash
git checkout -b kaua/nome-da-task
```

Para tasks do Igor, use `igor/nome-da-task`.

5. Definir a task para o agente. Se for interface, Kauã e Igor devem alinhar por 15 minutos antes de gerar codigo.
6. Antes de codar, identificar o dominio afetado e o dono em `docs/domain-ownership.md`.
7. Agente gera o codigo.
8. Dev revisa o output. Nao fazer merge sem ler o diff.
9. Rodar validacoes:

```bash
pnpm typecheck
pnpm lint
pnpm build
```

10. Abrir PR para `develop` com descricao do que foi feito.
11. O outro dev revisa. Revisao humana e obrigatoria; agente nao aprova PR.
12. Aprovacao humana + validacoes verdes -> merge.
13. Mover a task no Jira para **Concluido**.

## Regras de PR

- PR pequeno: maximo recomendado de 400 linhas de diff.
- PR deve informar dominio afetado, dono, o que foi feito, como testar e riscos relevantes.
- PR de UI deve incluir screenshots ou video curto.
- Nenhum PR e mergeado sem ao menos 1 aprovacao humana.
- PR com conflito deve ser resolvido localmente pelo dev responsavel, nunca por agente isolado.
- PR que quebra CI, `pnpm typecheck`, `pnpm lint` ou `pnpm build` nao mergeia, mesmo com aprovacao.
- PR que altera contrato de API deve atualizar `docs/api-contract.md`.
- PR que altera banco deve atualizar `packages/db/prisma/schema.prisma` e incluir migration Prisma.
- PR que altera ownership, fluxo de trabalho ou regra global deve ser revisado por Kauã e Igor.
- PR que altera arquivo compartilhado deve listar explicitamente esses arquivos na descricao.

## Revisao cruzada

- Kauã revisa PRs do Igor.
- Igor revisa PRs do Kauã.
- Tempo maximo de revisao: 4 horas uteis.
- Se for critico, comunicar no WhatsApp para revisao imediata.
- Revisor deve ler o diff, conferir o contrato afetado e validar se o escopo bate com a task.
- Revisor deve conferir se o dominio e o dono informados no PR batem com `docs/domain-ownership.md`.
- Aprovacao nao e formalidade: se houver risco de regressao, duplicacao, quebra de contrato ou conflito de dominio, pedir ajuste.

## Frequencia de sincronizacao

- Daily rapido de 15 minutos: o que cada um fez, o que vai fazer e bloqueios.
- Sync semanal de 1 hora: revisar progresso contra roadmap, ajustar prioridades e revisar riscos tecnicos.
- Rebase ou merge de `develop` para `main`: toda sexta-feira, apenas se `develop` estiver estavel.
- Se `develop` estiver instavel na sexta, corrigir antes de promover para `main`.
- Antes de iniciar codigo de dominio, confirmar se `develop` recebeu as mudancas mais recentes de `main` quando houver divergencia entre as duas.

## Limpeza de branches

- Branches de task ou feature devem ser apagadas depois que o PR for mergeado.
- Apagar a branch remota pelo botao **Delete branch** do GitHub apos o merge.
- Apagar a branch local depois de atualizar `develop`:

```bash
git checkout develop
git pull
git branch -d igor/nome-da-task
git fetch --prune
```

- `main` e `develop` nunca sao apagadas.
- Branch experimental deve ter nome claro, por exemplo `igor/experiment-ai-ocr`, e tambem deve ser apagada quando a decisao for nao seguir.
- Nao manter branches antigas acumuladas: elas geram ruido, confundem PRs futuros e aumentam chance de conflito.

## Regras especificas para agentes

- Agente nunca faz merge.
- Agente nunca resolve conflito de merge em arquivo compartilhado sozinho.
- Agente nunca sobrescreve arquivo existente sem investigar o contexto.
- Se o agente criar arquivo que ja existe, parar e investigar antes de continuar.
- Sempre rodar `pnpm typecheck` antes de aprovar output do agente.
- Commits feitos a partir de output de agente devem usar Conventional Commits: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:` ou equivalente.
- Dev responsavel deve revisar o diff inteiro antes de abrir PR.
- Agente deve ler `docs/domain-ownership.md` antes de alterar dominio, `docs/api-contract.md` antes de alterar endpoint e `packages/db/prisma/schema.prisma` antes de alterar banco.
- Alteracoes em dominio do outro dev exigem comunicacao antes de comecar.
- Alteracoes em arquivos compartilhados exigem revisao conjunta quando afetarem contrato, schema, tipos, design system ou regras globais.

## Arquivos compartilhados sensiveis

Os arquivos abaixo exigem cuidado adicional porque impactam varios dominios ou agentes:

- `CLAUDE.md`
- `docs/api-contract.md`
- `docs/domain-ownership.md`
- `docs/workflow.md`
- `packages/db/prisma/schema.prisma`
- `packages/db/prisma/migrations/*`
- `packages/types`
- `packages/utils`
- `packages/ui`
- `.github/pull_request_template.md`

Conflitos nesses arquivos devem ser resolvidos por Kauã e Igor, nao por agente isolado.

## Protecao de branches no GitHub

`main` e `develop` devem ser protegidas no GitHub.

Configuracao minima para `main`:

- Bloquear push direto.
- Exigir PR antes de merge.
- Exigir pelo menos 1 aprovacao humana.
- Exigir checks verdes antes de merge, incluindo o workflow `CI`.
- Exigir branch atualizada antes de merge, quando o GitHub Actions estiver configurado.
- Bloquear force push.
- Bloquear delete da branch.

Configuracao minima para `develop`:

- Bloquear push direto.
- Exigir PR antes de merge.
- Exigir pelo menos 1 aprovacao humana.
- Exigir checks verdes antes de merge, incluindo o workflow `CI`.
- Bloquear force push.
- Bloquear delete da branch.

O GitHub Actions deve rodar o workflow `CI` em PRs para `develop` e `main`. Mesmo com CI, as validacoes locais obrigatorias antes de abrir PR sao:

```bash
pnpm typecheck
pnpm lint
pnpm build
```

## Checklist antes de abrir PR

- A branch nasceu de `develop`.
- A task esta em **Em progresso** no Jira.
- O dominio afetado e o dono foram identificados em `docs/domain-ownership.md`.
- Li `docs/api-contract.md` se endpoints ou payloads foram afetados.
- Li `packages/db/prisma/schema.prisma` se banco, relacoes ou queries foram afetados.
- Li o `CLAUDE.md` raiz e o `CLAUDE.md` local do app/package afetado.
- O diff foi revisado pelo dev responsavel.
- Nao ha arquivo duplicado criado por acidente.
- Nao ha alteracao fora do dominio sem comunicacao previa.
- Arquivos compartilhados alterados foram listados no PR.
- `pnpm typecheck` passou.
- `pnpm lint` passou.
- `pnpm build` passou.
- Contratos e docs afetados foram atualizados.
- Migrations foram geradas quando houve mudanca de banco.
- Screenshots foram anexados quando houve mudanca de UI.

## Checklist antes de mergear

- PR aponta para `develop`.
- Ha pelo menos 1 aprovacao humana do outro dev.
- O revisor leu o diff.
- CI, build e validacoes locais estao verdes.
- Nao ha conflitos.
- Nao ha pendencia de contrato, migration ou documentacao.
- Task foi movida para **Concluido** no Jira apos o merge.
