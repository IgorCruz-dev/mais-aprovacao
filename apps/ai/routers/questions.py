import json

from fastapi import APIRouter, Depends, HTTPException

from models.question import QuestionExplanationResponse
from services.auth import verify_ai_secret
from services.gemini import get_client
from services.supabase import supabase

router = APIRouter()


def _as_dict(value):
    if isinstance(value, dict):
        return value
    if isinstance(value, str) and value.strip():
        try:
            parsed = json.loads(value)
            return parsed if isinstance(parsed, dict) else {}
        except Exception:
            return {}
    return {}


def _as_list(value):
    if isinstance(value, list):
        return value
    if isinstance(value, str) and value.strip():
        try:
            parsed = json.loads(value)
            return parsed if isinstance(parsed, list) else []
        except Exception:
            return []
    return []


@router.post("/{question_id}/explanation", response_model=QuestionExplanationResponse)
async def generate_question_explanation(
    question_id: str,
    _: None = Depends(verify_ai_secret),
):
    try:
        res = (
            supabase.table("questions")
            .select("id, context, alternatives_intro, alternatives, correct_alternative, ai_reasoning, metadata")
            .eq("id", question_id)
            .eq("is_verified", True)
            .single()
            .execute()
        )
    except Exception as exc:
        raise HTTPException(status_code=404, detail="Question not found") from exc

    question = res.data
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    ai_reasoning = _as_dict(question.get("ai_reasoning"))
    metadata = _as_dict(question.get("metadata"))
    existing = ai_reasoning.get("thought") or metadata.get("explanation")
    if existing:
        return QuestionExplanationResponse(question_id=question_id, explanation=str(existing))

    alternatives = _as_list(question.get("alternatives"))
    alternatives_text = "\n".join(
        f"{alt.get('letter') or alt.get('label') or '?'}) {alt.get('text') or ''}"
        for alt in alternatives
        if isinstance(alt, dict)
    )

    prompt = (
        "Você é um professor especialista em vestibulares brasileiros, incluindo ENEM, UFU, UEG e UFG. "
        "Analise a questão abaixo e explique de forma clara e didática:\n"
        "1. Por que a alternativa correta é a resposta certa.\n"
        "2. Por que cada uma das outras alternativas está incorreta.\n\n"
        f"Contexto:\n{question.get('context') or ''}\n\n"
        f"Enunciado:\n{question.get('alternatives_intro') or ''}\n\n"
        f"Alternativas:\n{alternatives_text}\n\n"
        f"Gabarito: {str(question.get('correct_alternative') or '').upper()}\n\n"
        "Responda em português do Brasil, de forma objetiva, em no máximo 5 parágrafos."
    )

    try:
        client = get_client()
        result = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )
        explanation = (getattr(result, "text", None) or "").strip()
        if not explanation:
            raise RuntimeError("Empty Gemini response")
        return QuestionExplanationResponse(question_id=question_id, explanation=explanation)
    except Exception as exc:
        raise HTTPException(status_code=502, detail="AI_UNAVAILABLE") from exc
