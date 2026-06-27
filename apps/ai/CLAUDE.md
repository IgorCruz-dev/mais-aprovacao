# apps/ai — FastAPI Python

Leia também o `CLAUDE.md` da raiz. Este arquivo define os padrões locais do AI Service.

## Stack local

- FastAPI com Pydantic.
- Routers em `routers/`, modelos em `models/`, integrações em `services/`.
- Gemini via pacote `google-genai` (`from google import genai`), conforme `services/gemini.py`.
- Supabase via `supabase-py`, conforme `services/supabase.py`.
- Sempre ativar o venv antes de rodar comandos Python:

```bash
cd apps/ai
source venv/bin/activate
```

## Endpoints

- Crie endpoints em `routers/dominio.py`.
- Registre o router em `main.py`.
- Todo endpoint deve usar modelos Pydantic para entrada e saída.

```python
# models/question.py
from pydantic import BaseModel


class QuestionGenerateRequest(BaseModel):
    subject: str
    difficulty: str


class QuestionGenerateResponse(BaseModel):
    question: str
```

```python
# routers/questions.py
from fastapi import APIRouter, Depends
from models.question import QuestionGenerateRequest, QuestionGenerateResponse
from services.auth import verify_ai_secret

router = APIRouter()


@router.post("/generate", response_model=QuestionGenerateResponse)
async def generate_question(
    body: QuestionGenerateRequest,
    _: None = Depends(verify_ai_secret),
):
    return QuestionGenerateResponse(question="...")
```

```python
# main.py
from routers import questions

app.include_router(questions.router, prefix="/ai/questions")
```

## Gemini

- Use `services/gemini.py` e `GOOGLE_API_KEY`.
- O pacote real instalado é `google-genai`; nao use `google.generativeai`.
- Nunca coloque `GOOGLE_API_KEY` no frontend ou em `apps/api`.
- Em falha do Gemini, retorne HTTP 502 com erro explícito; nunca fallback silencioso.
- Depois de cada chamada ao modelo, registre uso com `log_ai_usage()`.

```python
from services.gemini import get_client
from services.ai_usage import log_ai_usage

client = get_client()
result = client.models.generate_content(
    model="gemini-2.5-pro",
    contents=prompt,
)
log_ai_usage(model="gemini-2.5-pro", feature="essay_grading")
```

## Supabase e pgvector

- Use `services/supabase.py`; ele cria client com `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`.
- `SUPABASE_SERVICE_ROLE_KEY` existe apenas no backend/AI. Nunca expor ao browser.
- Para repertório com pgvector, chame RPC `match_repertoire`:

```python
from services.supabase import supabase

matches = supabase.rpc("match_repertoire", {
    "query_embedding": embedding,
    "match_count": 5,
}).execute()
```

## Segurança e resposta

- Endpoints chamados por `apps/api` devem exigir header `X-AI-Secret`.
- Respostas devem sempre declarar `response_model`.
- Logs de prompt/uso devem ser estruturados e sem segredos.
- Erros de IA usam formato:

```json
{ "error": "AI_UNAVAILABLE", "detail": "..." }
```

