# mais-aprovacao

Plataforma Mais Aprovação.

## Execução local

Por enquanto, a apresentação para os gestores será feita em localhost.

```bash
pnpm install
pnpm --filter @mais-aprovacao/web dev
pnpm --filter @mais-aprovacao/api dev
```

AI Service em terminal separado:

```bash
cd apps/ai
source venv/bin/activate
uvicorn main:app --reload
```
