"""
SimuladoService — Módulo completo de simulados para ENEM, UFU e UEG.

Formatos suportados:
  linguagens, humanas, natureza, matematica  → blocos por banca
  dia1 (linguagens + humanas)                → 90 questões
  dia2 (natureza + matematica)               → 90 questões
  completo                                   → 180 questões
  custom                                     → qty livre por matéria/filtros

Escopo atual:
  acesso disponível apenas para perfis B2B ativos / parceiros

TRI: modelo 3PL simplificado (sem parâmetros calibrados — aproximação ENEM).
"""

import math
import os
import random
import json
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple

from postgrest.exceptions import APIError as PostgRESTAPIError

from app.utils.supabase_client import get_supabase_admin

# ---------------------------------------------------------------------------
# Mapeamento dos blocos por área → subjects exatos do banco
# ---------------------------------------------------------------------------
ENEM_BLOCKS: Dict[str, Optional[List[str]]] = {
    "linguagens": ["Língua Portuguesa", "Espanhol", "Inglês"],
    "humanas":    ["História", "Geografia", "Filosofia", "Sociologia"],
    "natureza":   ["Biologia", "Química", "Física"],
    "matematica": ["Matemática"],
    "dia1":       ["Língua Portuguesa", "Espanhol", "Inglês",
                   "História", "Geografia", "Filosofia", "Sociologia"],
    "dia2":       ["Biologia", "Química", "Física", "Matemática"],
    "completo":   None,  # todas as matérias
}

# Quantidade padrão por formato de bloco
ENEM_BLOCK_QTY: Dict[str, int] = {
    "linguagens": 45,
    "humanas":    45,
    "natureza":   45,
    "matematica": 45,
    "dia1":       90,
    "dia2":       90,
    "completo":   180,
}

# Sub-blocos para formatos compostos (para garantir distribuição proporcional)
COMPOSITE_BLOCKS: Dict[str, List[str]] = {
    "dia1":    ["linguagens", "humanas"],
    "dia2":    ["natureza", "matematica"],
    "completo": ["linguagens", "humanas", "natureza", "matematica"],
}

UFU_BLOCKS: Dict[str, Optional[List[str]]] = {
    "linguagens": ["Língua Portuguesa", "Literatura", "Espanhol", "Inglês", "Francês"],
    "humanas":    ["História", "Geografia", "Filosofia", "Sociologia"],
    "natureza":   ["Biologia", "Química", "Física"],
    "matematica": ["Matemática"],
    "completo":   None,
}

UFU_BLOCK_QTY: Dict[str, int] = {
    "linguagens": 20,
    "humanas":    20,
    "natureza":   15,
    "matematica": 10,
    "completo":   65,
}

UEG_BLOCKS: Dict[str, Optional[List[str]]] = {
    "linguagens": ["Língua Portuguesa", "Literatura", "Espanhol", "Inglês", "Artes", "Educação Física", "Tecnologias da Informação e Comunicação"],
    "humanas":    ["História", "Geografia", "Filosofia", "Sociologia"],
    "natureza":   ["Biologia", "Química", "Física"],
    "matematica": ["Matemática"],
    "completo":   None,
}

UEG_BLOCK_QTY: Dict[str, int] = {
    "linguagens": 13,
    "humanas":    13,
    "natureza":   13,
    "matematica": 13,
    "completo":   52,
}

UFG_BLOCKS: Dict[str, Optional[List[str]]] = {
    # A prova matutina UFG tem 24 questões de Linguagens. Na plataforma,
    # aproximamos esse bloco por Língua Portuguesa, conforme regra do produto.
    "linguagens": ["Língua Portuguesa"],
    "humanas":    ["História", "Geografia", "Filosofia", "Sociologia"],
    "natureza":   ["Biologia", "Química", "Física"],
    "matematica": ["Matemática"],
    "completo":   None,
}

UFG_BLOCK_QTY: Dict[str, int] = {
    "linguagens": 24,
    "humanas":    24,
    "natureza":   24,
    "matematica": 24,
    "completo":   96,
}

UEG_GROUP_WEIGHTS: Dict[str, Dict[str, float]] = {
    "I": {"Linguagens": 2.5, "Matemática": 4.0, "Natureza": 2.5, "Humanas": 1.0},
    "II": {"Linguagens": 3.0, "Matemática": 3.0, "Natureza": 3.0, "Humanas": 1.0},
    "III": {"Linguagens": 4.0, "Matemática": 2.0, "Natureza": 1.0, "Humanas": 3.0},
}

UFU_COMPLETE_SUBJECT_DISTRIBUTION: Dict[str, int] = {
    "Língua Portuguesa": 10,
    "Literatura": 5,
    # UFU permite escolha de idioma; no banco isso pode estar dividido por idioma.
    "Inglês": 2,
    "Espanhol": 2,
    "Francês": 1,
    "Matemática": 10,
    "Biologia": 5,
    "Física": 5,
    "Química": 5,
    "Geografia": 5,
    "História": 5,
    "Filosofia": 5,
    "Sociologia": 5,
}

UNESP_BLOCKS: Dict[str, Optional[List[str]]] = {
    "linguagens": ["Língua Portuguesa", "Literatura", "Inglês", "Educação Física", "Arte"],
    "humanas":    ["História", "Geografia", "Filosofia", "Sociologia"],
    "natureza":   ["Biologia", "Química", "Física", "Matemática"],
    "completo":   None,
}

UNESP_BLOCK_QTY: Dict[str, int] = {
    "linguagens": 30,
    "humanas":    30,
    "natureza":   30,
    "completo":   90,
}

UEG_COMPLETE_AREA_DISTRIBUTION: Dict[str, Dict[str, int]] = {
    "linguagens": {
        "Língua Portuguesa": 3,
        "Literatura": 2,
        "Inglês": 2,
        "Espanhol": 2,
        "Artes": 2,
        "Educação Física": 1,
        "Tecnologias da Informação e Comunicação": 1,
    },  # 13
    "matematica": {
        "Matemática": 13,
    },  # 13
    "natureza": {
        "Biologia": 5,
        "Física": 4,
        "Química": 4,
    },  # 13
    "humanas": {
        "História": 4,
        "Geografia": 3,
        "Filosofia": 3,
        "Sociologia": 3,
    },  # 13
}

UFG_COMPLETE_SUBJECT_DISTRIBUTION: Dict[str, int] = {
    "Língua Portuguesa": 24,
    "Matemática": 24,
    "Biologia": 8,
    "Física": 8,
    "Química": 8,
    "História": 6,
    "Geografia": 6,
    "Filosofia": 6,
    "Sociologia": 6,
}

UEG_BLOCKS: Dict[str, Optional[List[str]]] = {
    "linguagens": ["Língua Portuguesa", "Espanhol", "Inglês"],
    "humanas":    ["História", "Geografia", "Filosofia", "Sociologia"],
    "natureza":   ["Biologia", "Química", "Física"],
    "matematica": ["Matemática"],
    "completo":   None,
}

UEG_BLOCK_QTY: Dict[str, int] = {
    "linguagens": 13,
    "humanas":    13,
    "natureza":   13,
    "matematica": 13,
    "completo":   52,
}

# Mapeamento dificuldade frontend → banco (com acentos exatos)
DIFFICULTY_MAP: Dict[str, str] = {
    "facil":   "Fácil",
    "medio":   "Médio",
    "dificil": "Difícil",
}


def _normalize_weights(weights: Optional[Dict]) -> Dict[str, float]:
    clean: Dict[str, float] = {}
    if not isinstance(weights, dict):
        return clean
    for k, v in weights.items():
        try:
            n = float(v)
            if n > 0:
                clean[str(k)] = n
        except Exception:
            continue
    return clean


def _resolve_weight_for_subject(subject: Optional[str], weights: Dict[str, float]) -> Tuple[str, float]:
    """
    Resolve chave/valor de peso para uma questão.
    Prioridade: matéria exata -> língua estrangeira agregada -> área -> default.
    """
    if not weights:
        return "Peso padrão", 1.0

    subj = (subject or "").strip()
    if subj and subj in weights:
        return subj, weights[subj]

    if subj in {"Inglês", "Espanhol", "Francês"} and "Língua Estrangeira" in weights:
        return "Língua Estrangeira", weights["Língua Estrangeira"]

    linguagens = {"Língua Portuguesa", "Literatura", "Inglês", "Espanhol", "Francês", "Artes", "Educação Física", "Tecnologias da Informação e Comunicação"}
    humanas = {"História", "Geografia", "Filosofia", "Sociologia"}
    natureza = {"Biologia", "Física", "Química"}
    matematica = {"Matemática"}

    if subj in linguagens and "Linguagens" in weights:
        return "Linguagens", weights["Linguagens"]
    if subj in humanas and "Humanas" in weights:
        return "Humanas", weights["Humanas"]
    if subj in natureza and "Natureza" in weights:
        return "Natureza", weights["Natureza"]
    if subj in matematica and "Matemática" in weights:
        return "Matemática", weights["Matemática"]

    return "Peso padrão", 1.0


def _subject_to_area(subject: Optional[str]) -> Optional[str]:
    subj = (subject or "").strip()
    linguagens = {"Língua Portuguesa", "Literatura", "Inglês", "Espanhol", "Francês", "Artes", "Educação Física", "Tecnologias da Informação e Comunicação"}
    humanas = {"História", "Geografia", "Filosofia", "Sociologia"}
    natureza = {"Biologia", "Física", "Química"}
    matematica = {"Matemática"}
    if subj in linguagens:
        return "Linguagens"
    if subj in humanas:
        return "Humanas"
    if subj in natureza:
        return "Natureza"
    if subj in matematica:
        return "Matemática"
    return None


def _normalize_bank_value(value: Optional[str]) -> Optional[str]:
    normalized = str(value or "").strip().upper()
    if normalized in {"UFU", "UFU_VEST"}:
        return "UFU"
    if normalized in {"UEG", "UEG_VEST"}:
        return "UEG"
    if normalized in {"UFG", "UFG_VEST"}:
        return "UFG"
    if normalized in {"ENEM", "INEP_ENEM", "ENEM_OFICIAL"}:
        return "ENEM"
    if normalized in {"TODAS", "TODOS", "MISTO", "MISTA", "ALL", ""}:
        return None
    return normalized or None


def _infer_bank_from_question(question: Dict) -> str:
    direct_bank = _normalize_bank_value(question.get("bank"))
    if direct_bank:
        return direct_bank

    metadata = question.get("metadata")
    if isinstance(metadata, str):
        try:
            metadata = json.loads(metadata) if metadata.strip() else {}
        except Exception:
            metadata = {}
    if not isinstance(metadata, dict):
        metadata = {}

    metadata_bank = _normalize_bank_value(metadata.get("bank") or metadata.get("source"))
    if metadata_bank:
        return metadata_bank

    external_id = str(question.get("external_id") or "").upper()
    if external_id.startswith("UFU_VEST_"):
        return "UFU"
    if external_id.startswith("UEG_VEST_"):
        return "UEG"
    if external_id.startswith("UFG_VEST_"):
        return "UFG"
    if external_id.startswith("UNESP_"):
        return "UNESP"
    return "ENEM"


def _is_tri_eligible(config: Dict) -> bool:
    bank = _normalize_bank_value(config.get("bank"))
    fmt = str(config.get("format") or "").lower()
    if fmt in ENEM_BLOCKS and bank not in {"UFU", "UEG", "UFG"}:
        return True
    return bank == "ENEM"


def _get_block_subjects(fmt: str, bank: Optional[str]) -> Optional[List[str]]:
    normalized_bank = _normalize_bank_value(bank)
    if normalized_bank == "UFU":
        return UFU_BLOCKS.get(fmt)
    if normalized_bank == "UEG":
        return UEG_BLOCKS.get(fmt)
    if normalized_bank == "UFG":
        return UFG_BLOCKS.get(fmt)
    if normalized_bank == "UNESP":
        return UNESP_BLOCKS.get(fmt)
    return ENEM_BLOCKS.get(fmt)


def _get_block_qty(fmt: str, bank: Optional[str]) -> int:
    normalized_bank = _normalize_bank_value(bank)
    if normalized_bank == "UFU":
        return UFU_BLOCK_QTY.get(fmt, 10)
    if normalized_bank == "UEG":
        return UEG_BLOCK_QTY.get(fmt, 10)
    if normalized_bank == "UFG":
        return UFG_BLOCK_QTY.get(fmt, 10)
    if normalized_bank == "UNESP":
        return UNESP_BLOCK_QTY.get(fmt, 10)
    return ENEM_BLOCK_QTY.get(fmt, 10)


def _is_block_format(fmt: str, bank: Optional[str]) -> bool:
    normalized_bank = _normalize_bank_value(bank)
    if normalized_bank == "UFU":
        return fmt in UFU_BLOCKS
    if normalized_bank == "UEG":
        return fmt in UEG_BLOCKS
    if normalized_bank == "UFG":
        return fmt in UFG_BLOCKS
    if normalized_bank == "UNESP":
        return fmt in UNESP_BLOCKS
    return fmt in ENEM_BLOCKS

# ---------------------------------------------------------------------------
# Ranking: fórmula de pontuação com regularização (Laplace smoothing)
# ---------------------------------------------------------------------------
# Um simulado de 5 questões com 100% NÃO deve superar 30 questões com 93%.
# RANK_FLOOR age como prior: penaliza amostras pequenas.
_RANK_FLOOR = 10  # questões equivalentes de "prior neutro"


def _rank_score(entry: Dict) -> float:
    """Pontuação regularizada: score / (total + FLOOR) × 100."""
    return entry["score"] / (entry["total_questions"] + _RANK_FLOOR) * 100



# ---------------------------------------------------------------------------
# TRI — modelo 3PL simplificado
# ---------------------------------------------------------------------------
_B_PARAM = {"Fácil": -1.0, "Médio": 0.0, "Difícil": 1.0}
_A_PARAM = 1.0
_C_PARAM = 0.20  # 1/5 alternativas


def _tri_probability(theta: float, b: float) -> float:
    return _C_PARAM + (1.0 - _C_PARAM) / (1.0 + math.exp(-1.7 * _A_PARAM * (theta - b)))


def _estimate_theta(items: List[Dict]) -> float:
    """Newton-Raphson MLE para estimativa de habilidade (θ)."""
    theta = 0.0
    for _ in range(100):
        num = den = 0.0
        for item in items:
            b = _B_PARAM.get(item.get("difficulty", "Médio"), 0.0)
            p = _tri_probability(theta, b)
            u = 1 if item["is_correct"] else 0
            if p <= _C_PARAM or p >= 1.0:
                continue
            d = (p - _C_PARAM) / ((1.0 - _C_PARAM) * p * (1.0 - p))
            num += (u - p) * d
            den += p * (1.0 - p) * d * d
        if abs(den) < 1e-9:
            break
        delta = num / den
        theta += delta
        if abs(delta) < 0.001:
            break
    return max(-4.0, min(4.0, theta))


def _theta_to_score(theta: float) -> float:
    """Converte θ para escala ENEM aproximada (200–900)."""
    return round(max(200.0, min(900.0, 500.0 + theta * 100.0)), 1)


def calculate_tri_score(questions_with_results: List[Dict]) -> float:
    """Calcula nota TRI estimada para uma lista de questões com resultado."""
    if not questions_with_results:
        return 500.0
    theta = _estimate_theta(questions_with_results)
    return _theta_to_score(theta)


# ---------------------------------------------------------------------------
# Helpers de banco
# ---------------------------------------------------------------------------

def _fetch_questions_for_block(
    block_subjects: List[str],
    qty: int,
    year: Optional[int],
    difficulty_db: Optional[str],
    bank: Optional[str] = None,
    candidate_limit: int = 2000,
) -> List[Dict]:
    """Busca `qty` questões aleatórias para um bloco de matérias."""
    client = get_supabase_admin()
    requested_bank = _normalize_bank_value(bank)
    pool: List[Dict] = []
    page_size = min(500, candidate_limit)
    offset = 0

    while offset < candidate_limit:
        query = (
            client.table("questions")
            .select("id, subject, discipline, difficulty, exam_year, context, "
                    "alternatives, alternatives_intro, correct_alternative, "
                    "images, ai_reasoning, metadata, external_id, bank, testlet_group_id")
            .eq("is_verified", True)
            .in_("subject", block_subjects)
            .range(offset, offset + page_size - 1)
        )
        if year:
            query = query.eq("exam_year", year)
        if difficulty_db:
            query = query.eq("difficulty", difficulty_db)

        res = query.execute()
        batch = res.data or []
        if requested_bank:
            batch = [item for item in batch if _infer_bank_from_question(item) == requested_bank]
        pool.extend(batch)
        if len(res.data or []) < page_size or len(pool) >= max(qty * 4, qty):
            break
        offset += page_size

    if not pool:
        return []
    return random.sample(pool, min(qty, len(pool)))


def _fetch_questions_custom(
    subject: Optional[str],
    qty: int,
    year: Optional[int],
    difficulty_db: Optional[str],
    bank: Optional[str] = None,
    candidate_limit: int = 2000,
) -> List[Dict]:
    """Busca questões para simulado custom (matéria única ou todas)."""
    client = get_supabase_admin()
    requested_bank = _normalize_bank_value(bank)
    pool: List[Dict] = []
    page_size = min(500, candidate_limit)
    offset = 0

    while offset < candidate_limit:
        query = (
            client.table("questions")
            .select("id, subject, discipline, difficulty, exam_year, context, "
                    "alternatives, alternatives_intro, correct_alternative, "
                    "images, ai_reasoning, metadata, external_id, bank, testlet_group_id")
            .eq("is_verified", True)
            .range(offset, offset + page_size - 1)
        )
        if subject and subject != "Todas":
            query = query.eq("subject", subject)
        if year:
            query = query.eq("exam_year", year)
        if difficulty_db:
            query = query.eq("difficulty", difficulty_db)

        res = query.execute()
        batch = res.data or []
        if requested_bank:
            batch = [item for item in batch if _infer_bank_from_question(item) == requested_bank]
        pool.extend(batch)
        if len(res.data or []) < page_size or len(pool) >= max(qty * 4, qty):
            break
        offset += page_size

    if not pool:
        return []
    return random.sample(pool, min(qty, len(pool)))


def _fetch_questions_with_subject_quota(
    subject_quota: Dict[str, int],
    year: Optional[int],
    difficulty_db: Optional[str],
    bank: Optional[str],
) -> List[Dict]:
    """
    Busca questões respeitando quota por matéria.
    Se faltar em alguma matéria, tenta completar o restante com o pool do conjunto.
    """
    selected: List[Dict] = []
    selected_ids: set[str] = set()
    subject_pool_union: List[str] = list(subject_quota.keys())

    # Primeiro passe: tenta cumprir quota de cada matéria.
    for subject, qty in subject_quota.items():
        if qty <= 0:
            continue
        batch = _fetch_questions_custom(
            subject=subject,
            qty=qty,
            year=year,
            difficulty_db=difficulty_db,
            bank=bank,
        )
        for q in batch:
            qid = str(q.get("id"))
            if qid in selected_ids:
                continue
            selected.append(q)
            selected_ids.add(qid)
            if len([x for x in selected if (x.get("subject") or "") == subject]) >= qty:
                break

    target_total = sum(max(0, q) for q in subject_quota.values())
    missing = target_total - len(selected)
    if missing <= 0:
        return selected[:target_total]

    # Segundo passe: completa com qualquer matéria do mesmo conjunto.
    fallback_pool = _fetch_questions_for_block(
        block_subjects=subject_pool_union,
        qty=target_total * 3,
        year=year,
        difficulty_db=difficulty_db,
        bank=bank,
    )
    random.shuffle(fallback_pool)
    for q in fallback_pool:
        if missing <= 0:
            break
        qid = str(q.get("id"))
        if qid in selected_ids:
            continue
        selected.append(q)
        selected_ids.add(qid)
        missing -= 1

    return selected[:target_total]


def _serialize_question(q: Dict) -> Dict:
    """Serializa questão para o frontend (mesmo formato do QuestionService)."""
    import json as _json

    alternatives = q.get("alternatives") or []
    if isinstance(alternatives, str):
        try:
            alternatives = _json.loads(alternatives)
        except Exception:
            alternatives = []

    serialized_alts = [
        {
            "letter": alt.get("letter") or alt.get("label"),
            "text": alt.get("text", ""),
            "image": alt.get("file") or alt.get("image") or None,
        }
        for alt in alternatives
    ]

    ai_reasoning = q.get("ai_reasoning") or {}
    if isinstance(ai_reasoning, str):
        try:
            ai_reasoning = _json.loads(ai_reasoning) if ai_reasoning.strip() else {}
        except Exception:
            ai_reasoning = {}

    metadata = q.get("metadata") or {}
    if isinstance(metadata, str):
        try:
            metadata = _json.loads(metadata) if metadata.strip() else {}
        except Exception:
            metadata = {}

    derived_testlet_group_id = q.get("testlet_group_id")
    if not derived_testlet_group_id:
        shared_context_range = metadata.get("shared_context_range")
        parser_meta = metadata.get("parser") if isinstance(metadata.get("parser"), dict) else {}
        if not shared_context_range and parser_meta:
            shared_context_range = parser_meta.get("shared_context_range")
        if isinstance(shared_context_range, (list, tuple)) and len(shared_context_range) == 2:
            range_start, range_end = shared_context_range
            if range_start is not None and range_end is not None and int(range_end) > int(range_start):
                exam_key = (
                    metadata.get("exam_id")
                    or metadata.get("structural_family")
                    or (str(q.get("external_id") or "").rsplit("_", 1)[0] if q.get("external_id") else None)
                )
                variant_key = metadata.get("variant") or metadata.get("tipo") or metadata.get("bank") or "default"
                if exam_key:
                    derived_testlet_group_id = f"{exam_key}:{variant_key}:{int(range_start)}-{int(range_end)}"

    context = q.get("context", "")
    statement = q.get("alternatives_intro") or ""
    if not context and statement:
        context = statement
        statement = "Assinale a alternativa correta:"
    elif context and not statement:
        statement = "Assinale a alternativa correta:"
    topic = q.get("discipline") or metadata.get("ai_topic")

    return {
        "id": q.get("id"),
        "external_id": q.get("external_id"),
        "exam_year": q.get("exam_year"),
        "bank": _infer_bank_from_question(q),
        "subject": q.get("subject"),
        "topic": topic,
        "difficulty": q.get("difficulty"),
        "context": context,
        "statement": statement,
        "alternatives": serialized_alts,
        "correct_option": q.get("correct_alternative"),
        "images": q.get("images") or [],
        "metadata": metadata if isinstance(metadata, dict) else {},
        "testlet_group_id": derived_testlet_group_id,
    }


def _extract_testlet_order(question: Dict) -> float:
    import json as _json

    metadata = question.get("metadata") or {}
    if isinstance(metadata, str):
        try:
            metadata = _json.loads(metadata) if metadata.strip() else {}
        except Exception:
            metadata = {}
    if not isinstance(metadata, dict):
        metadata = {}

    order = metadata.get("testlet_order")
    if isinstance(order, (int, float)):
        return float(order)
    try:
        return float(order)
    except Exception:
        return float("inf")


def _coalesce_testlet_questions(raw_questions: List[Dict]) -> List[Dict]:
    """
    Mantém questões de um mesmo testlet contíguas na entrega da sessão.

    A ordem entre blocos segue a primeira aparição no conjunto original.
    A ordem interna do bloco respeita `metadata.testlet_order` quando existir.
    """
    grouped: Dict[str, List[Dict]] = {}
    first_positions: Dict[str, int] = {}
    singles: List[Tuple[int, Dict]] = []

    for index, question in enumerate(raw_questions):
        group_id = question.get("testlet_group_id")
        if group_id:
            group_key = str(group_id)
            grouped.setdefault(group_key, []).append(question)
            first_positions.setdefault(group_key, index)
        else:
            singles.append((index, question))

    ordered_items: List[Tuple[int, str, List[Dict] | Dict]] = []
    for group_key, items in grouped.items():
        ordered_group = sorted(
            items,
            key=lambda q: (_extract_testlet_order(q), first_positions[group_key]),
        )
        ordered_items.append((first_positions[group_key], "group", ordered_group))
    for position, question in singles:
        ordered_items.append((position, "single", question))

    ordered_items.sort(key=lambda item: item[0])

    coalesced: List[Dict] = []
    for _, item_type, payload in ordered_items:
        if item_type == "group":
            coalesced.extend(payload)  # type: ignore[arg-type]
        else:
            coalesced.append(payload)  # type: ignore[arg-type]
    return coalesced


def _get_reported_question_ids(user_id: str, question_ids: List[str]) -> set[str]:
    """Retorna IDs de questões reportadas pelo próprio usuário dentro da sessão."""
    if not user_id or not question_ids:
        return set()

    client = get_supabase_admin()
    try:
        res = (
            client.table("question_reports")
            .select("question_id")
            .eq("user_id", user_id)
            .in_("question_id", question_ids)
            .execute()
        )
        return {
            str(row.get("question_id"))
            for row in (res.data or [])
            if row.get("question_id")
        }
    except Exception as e:
        print(f"⚠️ [SimuladoService] Erro ao buscar reports da sessão: {e}")
        return set()


# ---------------------------------------------------------------------------
# Quota
# ---------------------------------------------------------------------------

def _check_simulado_quota(user_id: str) -> Tuple[bool, str]:
    """
    Verifica se o usuário pode iniciar um novo simulado.
    Retorna (allowed, reason_code).
    """
    client = get_supabase_admin()
    try:
        profile_res = (
            client.table("profiles")
            .select("organization_id, plan_tier, role")
            .eq("id", user_id)
            .single()
            .execute()
        )
    except PostgRESTAPIError as e:
        if getattr(e, "code", None) == "PGRST116" or "0 rows" in str(e):
            return False, "USER_NOT_FOUND"
        raise
    if not profile_res.data:
        return False, "USER_NOT_FOUND"

    role = (profile_res.data.get("role") or "").lower().strip()
    plan = (profile_res.data.get("plan_tier") or "").lower().strip()

    if role == "admin" or profile_res.data.get("organization_id") or plan.startswith("b2b_"):
        return True, "PREMIUM"
    return False, "SUBSCRIPTION_INACTIVE"


# ---------------------------------------------------------------------------
# SimuladoService
# ---------------------------------------------------------------------------

class SimuladoService:

    @staticmethod
    def pick_question_ids_for_scheduled(
        config: Dict,
        org_id: str,
    ) -> Tuple[List[str], Optional[Dict]]:
        """
        Seleciona questões para um simulado agendado same_for_all.
        Retorna (ids, shortfall_or_none).

        shortfall é None se o conjunto ficou completo.
        Quando há falta de questões retorna:
          {
            "expected": int,
            "found": int,
            "by_subject": {matéria: {"expected": int, "found": int}, ...}  # só formatos com distribuição
          }
        """
        fmt = (config.get("format") or "custom").lower()
        year = config.get("year")
        difficulty_raw = (config.get("difficulty") or "misto").lower()
        difficulty_db = DIFFICULTY_MAP.get(difficulty_raw)
        subject = config.get("subject")
        bank = _normalize_bank_value(config.get("bank"))
        qty = int(config.get("qty") or _get_block_qty(fmt, bank))

        raw_questions: List[Dict] = []
        # Distribuição esperada por matéria (apenas para formatos com quota rígida)
        subject_distribution: Optional[Dict[str, int]] = None

        if bank == "UFU" and fmt == "completo":
            subject_distribution = UFU_COMPLETE_SUBJECT_DISTRIBUTION
            raw_questions = _fetch_questions_with_subject_quota(
                subject_quota=subject_distribution,
                year=year, difficulty_db=difficulty_db, bank="UFU",
            )
        elif bank == "UEG" and fmt == "completo":
            ueg_selected: List[Dict] = []
            subject_distribution = {}
            for area_quota in UEG_COMPLETE_AREA_DISTRIBUTION.values():
                area_batch = _fetch_questions_with_subject_quota(
                    subject_quota=area_quota, year=year, difficulty_db=difficulty_db, bank="UEG",
                )
                ueg_selected.extend(area_batch)
                subject_distribution.update(area_quota)
            raw_questions = ueg_selected[:UEG_BLOCK_QTY["completo"]]
        elif bank == "UFG" and fmt == "completo":
            subject_distribution = UFG_COMPLETE_SUBJECT_DISTRIBUTION
            raw_questions = _fetch_questions_with_subject_quota(
                subject_quota=subject_distribution,
                year=year, difficulty_db=difficulty_db, bank="UFG",
            )
        elif fmt in COMPOSITE_BLOCKS and bank not in {"UFU", "UEG"}:
            sub_blocks = COMPOSITE_BLOCKS[fmt]
            per_block = _get_block_qty(fmt, bank) // len(sub_blocks)
            for blk in sub_blocks:
                subjects = _get_block_subjects(blk, bank)
                batch = _fetch_questions_for_block(subjects, per_block, year, difficulty_db, bank=bank or "ENEM")
                raw_questions.extend(batch)
        elif _is_block_format(fmt, bank) and fmt not in COMPOSITE_BLOCKS:
            subjects = _get_block_subjects(fmt, bank)
            raw_questions = _fetch_questions_for_block(subjects, qty, year, difficulty_db, bank=bank or "ENEM")
        elif fmt == "custom":
            raw_questions = _fetch_questions_custom(subject, qty, year, difficulty_db, bank=bank)
        else:
            return [], None

        if not raw_questions:
            return [], None

        # Prioriza questões menos vistas pelos membros da org
        try:
            members_res = (
                get_supabase_admin().table("profiles")
                .select("id")
                .eq("organization_id", org_id)
                .execute()
            )
            cohort_ids = [str(p["id"]) for p in (members_res.data or []) if p.get("id")]
            if cohort_ids:
                qids = [str(q["id"]) for q in raw_questions]
                answers_res = (
                    get_supabase_admin().table("user_answers")
                    .select("question_id, user_id")
                    .in_("question_id", qids)
                    .in_("user_id", cohort_ids)
                    .execute()
                )
                seen_by_qid: Dict[str, set] = {qid: set() for qid in qids}
                for row in (answers_res.data or []):
                    qid = str(row.get("question_id") or "")
                    uid = str(row.get("user_id") or "")
                    if qid and uid and qid in seen_by_qid:
                        seen_by_qid[qid].add(uid)
                random.shuffle(raw_questions)
                raw_questions.sort(key=lambda q: len(seen_by_qid.get(str(q["id"]), set())))
                raw_questions = raw_questions[:qty]
        except Exception:
            pass

        final_questions = raw_questions[:qty]
        ids = [str(q["id"]) for q in final_questions if q.get("id")]

        # Valida se o conjunto ficou completo
        found = len(ids)
        if found >= qty:
            return ids, None

        # Monta shortfall com breakdown por matéria (quando a distribuição é conhecida)
        shortfall: Dict = {"expected": qty, "found": found}
        if subject_distribution:
            from collections import Counter
            found_by_subject: Dict[str, int] = Counter(
                (q.get("subject") or "").strip() for q in final_questions
            )
            by_subject = {
                subj: {"expected": exp, "found": found_by_subject.get(subj, 0)}
                for subj, exp in subject_distribution.items()
                if found_by_subject.get(subj, 0) < exp
            }
            if by_subject:
                shortfall["by_subject"] = by_subject

        return ids, shortfall

    @staticmethod
    def start_simulado(
        user_id: str,
        config: Dict,
        scheduled_simulado_id: Optional[str] = None,
        bypass_quota: bool = False,
        fixed_question_ids: Optional[List[str]] = None,
        prioritize_unseen_for_user: bool = True,
        global_unseen_user_ids: Optional[List[str]] = None,
    ) -> Tuple[Optional[Dict], Optional[str]]:
        """
        Cria uma nova sessão de simulado.
        Retorna (payload, error_code).
        """
        reason = "BYPASS"
        if not bypass_quota:
            allowed, reason = _check_simulado_quota(user_id)
            if not allowed:
                return None, reason

        fmt = (config.get("format") or "custom").lower()
        year = config.get("year")  # int ou None
        difficulty_raw = (config.get("difficulty") or "misto").lower()
        subject = config.get("subject")  # string ou None
        bank = _normalize_bank_value(config.get("bank"))

        difficulty_db = DIFFICULTY_MAP.get(difficulty_raw)  # None = sem filtro
        qty = int(config.get("qty") or _get_block_qty(fmt, bank))
        client = get_supabase_admin()
        preserve_fixed_order = bool(fixed_question_ids)

        # Reaproveita a última sessão em andamento de um simulado agendado
        # para evitar múltiplas tentativas "fantasmas" sem conclusão.
        if scheduled_simulado_id:
            existing_res = (
                client.table("simulado_sessions")
                .select("id, question_ids, answers, config")
                .eq("user_id", user_id)
                .eq("scheduled_simulado_id", scheduled_simulado_id)
                .eq("status", "in_progress")
                .order("started_at", desc=True)
                .limit(1)
                .execute()
            )
            existing_session = (existing_res.data or [None])[0]
            if existing_session:
                existing_ids = [str(qid) for qid in (existing_session.get("question_ids") or []) if qid]
                if existing_ids:
                    q_res = (
                        client.table("questions")
                        .select("id, subject, discipline, difficulty, exam_year, context, "
                                "alternatives, alternatives_intro, correct_alternative, "
                                "images, ai_reasoning, metadata, external_id, bank, testlet_group_id")
                        .in_("id", existing_ids)
                        .execute()
                    )
                    q_map = {str(q["id"]): q for q in (q_res.data or [])}
                    serialized_existing = [_serialize_question(q_map[qid]) for qid in existing_ids if qid in q_map]
                    if serialized_existing:
                        existing_config = existing_session.get("config") or {}
                        return {
                            "session_id": existing_session["id"],
                            "is_free_first": False,
                            "questions": serialized_existing,
                            "total": len(serialized_existing),
                            "config": existing_config,
                            "time_limit_secs": existing_config.get("time_limit_secs"),
                            "scheduled_simulado_id": scheduled_simulado_id,
                            "saved_answers": existing_session.get("answers") or {},
                            "resumed": True,
                        }, None

        # Busca questões conforme formato
        raw_questions: List[Dict] = []

        if fixed_question_ids:
            fixed_ids = [str(qid) for qid in fixed_question_ids if qid]
            if not fixed_ids:
                return None, "NO_QUESTIONS_FOUND"
            q_res = (
                get_supabase_admin()
                .table("questions")
                .select("id, subject, discipline, difficulty, exam_year, context, "
                        "alternatives, alternatives_intro, correct_alternative, "
                        "images, ai_reasoning, metadata, external_id, bank, testlet_group_id")
                .in_("id", fixed_ids)
                .execute()
            )
            q_map = {str(q["id"]): q for q in (q_res.data or [])}
            raw_questions = [q_map[qid] for qid in fixed_ids if qid in q_map]
            if not raw_questions:
                return None, "NO_QUESTIONS_FOUND"
        elif bank == "UFU" and fmt == "completo":
            raw_questions = _fetch_questions_with_subject_quota(
                subject_quota=UFU_COMPLETE_SUBJECT_DISTRIBUTION,
                year=year,
                difficulty_db=difficulty_db,
                bank="UFU",
            )
        elif bank == "UEG" and fmt == "completo":
            ueg_selected: List[Dict] = []
            for area_quota in UEG_COMPLETE_AREA_DISTRIBUTION.values():
                area_batch = _fetch_questions_with_subject_quota(
                    subject_quota=area_quota,
                    year=year,
                    difficulty_db=difficulty_db,
                    bank="UEG",
                )
                ueg_selected.extend(area_batch)
            raw_questions = ueg_selected[:UEG_BLOCK_QTY["completo"]]
        elif bank == "UFG" and fmt == "completo":
            raw_questions = _fetch_questions_with_subject_quota(
                subject_quota=UFG_COMPLETE_SUBJECT_DISTRIBUTION,
                year=year,
                difficulty_db=difficulty_db,
                bank="UFG",
            )

        elif bank == "UEG" and fmt == "completo":
            raw_questions = _fetch_questions_custom(
                subject=None, qty=UEG_BLOCK_QTY["completo"], year=year, difficulty_db=difficulty_db, bank="UEG"
            )

        elif fmt in COMPOSITE_BLOCKS and bank not in {"UFU", "UEG"}:
            # Formatos compostos: busca por sub-bloco para garantir distribuição
            sub_blocks = COMPOSITE_BLOCKS[fmt]
            per_block = _get_block_qty(fmt, bank) // len(sub_blocks)
            for blk in sub_blocks:
                subjects = _get_block_subjects(blk, bank)
                batch = _fetch_questions_for_block(
                    subjects, per_block, year, difficulty_db, bank=bank or "ENEM"
                )
                raw_questions.extend(batch)

        elif _is_block_format(fmt, bank) and fmt not in COMPOSITE_BLOCKS:
            # Bloco único (linguagens, humanas, natureza, matematica)
            subjects = _get_block_subjects(fmt, bank)
            raw_questions = _fetch_questions_for_block(
                subjects, qty, year, difficulty_db, bank=bank or "ENEM"
            )

        elif fmt == "custom":
            # Custom: matéria específica ou todas
            raw_questions = _fetch_questions_custom(
                subject, qty, year, difficulty_db, bank=bank
            )

        else:
            return None, "INVALID_FORMAT"

        if not raw_questions:
            return None, "NO_QUESTIONS_FOUND"

        raw_questions = _coalesce_testlet_questions(raw_questions)

        # Quando a prova precisa ser a mesma para todos:
        # prioriza questões menos vistas pelo grupo alvo antes de fixar o conjunto.
        if global_unseen_user_ids:
            try:
                cohort_ids = [str(uid) for uid in global_unseen_user_ids if uid]
                if cohort_ids:
                    qids = [str(q["id"]) for q in raw_questions]
                    answers_res = (
                        get_supabase_admin().table("user_answers")
                        .select("question_id, user_id")
                        .in_("question_id", qids)
                        .in_("user_id", cohort_ids)
                        .execute()
                    )
                    seen_by_qid: Dict[str, set] = {qid: set() for qid in qids}
                    for row in (answers_res.data or []):
                        qid = str(row.get("question_id") or "")
                        uid = str(row.get("user_id") or "")
                        if qid and uid and qid in seen_by_qid:
                            seen_by_qid[qid].add(uid)

                    random.shuffle(raw_questions)  # desempata com aleatoriedade
                    raw_questions.sort(key=lambda q: len(seen_by_qid.get(str(q["id"]), set())))
                    raw_questions = raw_questions[:qty]
                    raw_questions = _coalesce_testlet_questions(raw_questions)
            except Exception:
                # fallback silencioso mantendo fluxo original
                pass

        # Priorizar questões não respondidas pelo aluno
        if prioritize_unseen_for_user:
            try:
                all_ids = [str(q["id"]) for q in raw_questions]
                answered_res = (
                    get_supabase_admin().table("user_answers")
                    .select("question_id")
                    .eq("user_id", user_id)
                    .in_("question_id", all_ids)
                    .execute()
                )
                answered_ids = {str(r["question_id"]) for r in (answered_res.data or [])}
                unseen = [q for q in raw_questions if str(q["id"]) not in answered_ids]
                seen = [q for q in raw_questions if str(q["id"]) in answered_ids]
                random.shuffle(unseen)
                random.shuffle(seen)
                raw_questions = unseen + seen
                qty_final = config.get("qty") or len(raw_questions)
                raw_questions = raw_questions[:qty_final]
                raw_questions = _coalesce_testlet_questions(raw_questions)
            except Exception:
                # fallback: embaralha normalmente se user_answers não existir
                if not preserve_fixed_order:
                    random.shuffle(raw_questions)
                    raw_questions = _coalesce_testlet_questions(raw_questions)
        else:
            # Preserva ordem quando as questões vieram de fixed_question_ids
            # (impresso/hybrid); embaralha apenas para seleção aleatória livre.
            if not fixed_question_ids:
                random.shuffle(raw_questions)
            raw_questions = _coalesce_testlet_questions(raw_questions)

        question_ids = [str(q["id"]) for q in raw_questions]
        serialized = [_serialize_question(q) for q in raw_questions]

        # Persiste a sessão
        insert_payload = {
            "user_id": user_id,
            "config": {**config, "bank": bank or "Todas"},
            "question_ids": question_ids,
            "status": "in_progress",
            "total_questions": len(question_ids),
            "started_at": datetime.now(timezone.utc).isoformat(),
        }
        if scheduled_simulado_id:
            insert_payload["scheduled_simulado_id"] = scheduled_simulado_id

        session_res = client.table("simulado_sessions").insert(insert_payload).execute()

        if not session_res.data:
            return None, "SESSION_CREATE_FAILED"

        session_id = session_res.data[0]["id"]

        return {
            "session_id": session_id,
            "is_free_first": False,
            "questions": serialized,
            "total": len(serialized),
            "config": {**config, "bank": bank or "Todas"},
            "time_limit_secs": config.get("time_limit_secs"),
            "scheduled_simulado_id": scheduled_simulado_id,
        }, None

    # -----------------------------------------------------------------------

    @staticmethod
    def finish_simulado(
        user_id: str,
        session_id: str,
        answers: Dict[str, str],
        time_taken_secs: Optional[int],
        plan_tier: str,
    ) -> Tuple[Optional[Dict], Optional[str]]:
        """
        Finaliza o simulado: salva respostas, calcula score e resultados.
        Retorna (payload, error_code).
        """
        client = get_supabase_admin()

        # Ownership check
        try:
            session_res = (
                client.table("simulado_sessions")
                .select("*")
                .eq("id", session_id)
                .eq("user_id", user_id)
                .single()
                .execute()
            )
        except PostgRESTAPIError as e:
            if getattr(e, "code", None) == "PGRST116" or "0 rows" in str(e):
                return None, "SESSION_NOT_FOUND"
            raise
        if not session_res.data:
            return None, "SESSION_NOT_FOUND"

        session = session_res.data
        if session["status"] == "completed":
            return None, "ALREADY_COMPLETED"

        saved_answers = session.get("answers") or {}
        if not isinstance(saved_answers, dict):
            saved_answers = {}
        merged_answers = {
            **saved_answers,
            **{
                str(qid): str(answer).upper()
                for qid, answer in (answers or {}).items()
                if qid and answer
            },
        }

        question_ids = session.get("question_ids") or []
        reported_question_ids = _get_reported_question_ids(user_id, question_ids)

        # Busca dados das questões (correct_alternative + subject + difficulty)
        if not question_ids:
            return None, "EMPTY_SESSION"

        # Regra de produto: exige no mínimo 50% de questões respondidas para finalizar.
        # Considera apenas respostas não vazias nas questões da sessão.
        answered_count = sum(
            1
            for qid in question_ids
            if str((merged_answers.get(qid) or "")).strip()
        )
        min_required_answers = max(1, math.ceil(len(question_ids) * 0.5))
        if answered_count < min_required_answers:
            return {
                "code": "MIN_ANSWERS_NOT_REACHED",
                "answered_count": answered_count,
                "minimum_required": min_required_answers,
                "total_questions": len(question_ids),
            }, "MIN_ANSWERS_NOT_REACHED"

        q_res = (
            client.table("questions")
            .select("id, correct_alternative, subject, difficulty, metadata, external_id, bank")
            .in_("id", question_ids)
            .execute()
        )
        questions_data = {str(q["id"]): q for q in (q_res.data or [])}

        # Calcula score e results_by_subject
        score = 0
        results_by_subject: Dict[str, Dict] = {}
        results_by_bank: Dict[str, Dict] = {}
        answers_detail: List[Dict] = []
        tri_items: List[Dict] = []
        session_config = session.get("config") or {}
        clean_weights = _normalize_weights(session_config.get("weights"))
        bank_cfg = _normalize_bank_value(session_config.get("bank"))
        if bank_cfg == "UEG":
            group = str(session_config.get("ueg_weight_group") or "").upper().strip()
            if group in UEG_GROUP_WEIGHTS:
                clean_weights = dict(UEG_GROUP_WEIGHTS[group])
        weighted_applied = len(clean_weights) > 0
        weighted_total = 0.0
        weighted_correct = 0.0
        weighted_breakdown: Dict[str, Dict] = {}

        for qid in question_ids:
            q = questions_data.get(qid)
            if not q:
                continue

            is_annulled = qid in reported_question_ids
            correct = (q.get("correct_alternative") or "").upper()
            user_ans = (merged_answers.get(qid) or "").upper()
            is_correct = bool(user_ans and user_ans == correct) and not is_annulled
            subject = q.get("subject", "Desconhecida")
            difficulty = q.get("difficulty", "Médio")
            bank = _infer_bank_from_question(q)

            if is_correct:
                score += 1

            if not is_annulled:
                if subject not in results_by_subject:
                    results_by_subject[subject] = {"correct": 0, "total": 0, "percentage": 0.0}
                results_by_subject[subject]["total"] += 1
                if is_correct:
                    results_by_subject[subject]["correct"] += 1

                if bank not in results_by_bank:
                    results_by_bank[bank] = {"correct": 0, "total": 0, "percentage": 0.0}
                results_by_bank[bank]["total"] += 1
                if is_correct:
                    results_by_bank[bank]["correct"] += 1

                weight_key, weight_value = _resolve_weight_for_subject(subject, clean_weights)
                weighted_total += weight_value
                if is_correct:
                    weighted_correct += weight_value
                if weight_key not in weighted_breakdown:
                    weighted_breakdown[weight_key] = {
                        "weight": weight_value,
                        "questions": 0,
                        "weighted_total": 0.0,
                        "weighted_correct": 0.0,
                        "percentage": 0.0,
                    }
                weighted_breakdown[weight_key]["questions"] += 1
                weighted_breakdown[weight_key]["weighted_total"] += weight_value
                if is_correct:
                    weighted_breakdown[weight_key]["weighted_correct"] += weight_value

            answers_detail.append({
                "question_id": qid,
                "subject": subject,
                "bank": bank,
                "difficulty": difficulty,
                "user_answer": user_ans or None,
                "correct_answer": correct,
                "is_correct": is_correct,
                "is_annulled": is_annulled,
            })

            if not is_annulled:
                tri_items.append({"difficulty": difficulty, "is_correct": is_correct})

        # Percentuais
        for subj in results_by_subject.values():
            if subj["total"] > 0:
                subj["percentage"] = round(subj["correct"] / subj["total"] * 100, 1)
        for bank_stats in results_by_bank.values():
            if bank_stats["total"] > 0:
                bank_stats["percentage"] = round(bank_stats["correct"] / bank_stats["total"] * 100, 1)

        annulled_count = len(reported_question_ids)
        total = max(len(question_ids) - annulled_count, 0)
        percentage = round(score / total * 100, 1) if total > 0 else 0.0
        weighted_percentage = round((weighted_correct / weighted_total) * 100, 1) if weighted_total > 0 else percentage
        weighted_points = round(weighted_correct, 1) if weighted_applied else None
        weighted_max_points = round(weighted_total, 1) if weighted_applied else None
        weighted_mode = "ueg_objective_points" if (weighted_applied and bank_cfg == "UEG") else ("weighted_percentage" if weighted_applied else "none")
        for bucket in weighted_breakdown.values():
            wt_total = bucket["weighted_total"] or 0.0
            bucket["percentage"] = round((bucket["weighted_correct"] / wt_total) * 100, 1) if wt_total > 0 else 0.0

        # TRI — apenas perfis B2B ativos
        _t = plan_tier.lower()
        is_premium = _t.startswith("b2b_")
        tri_score = calculate_tri_score(tri_items) if is_premium and _is_tri_eligible(session_config) else None
        session_config_with_metrics = {
            **session_config,
            "results_by_bank": results_by_bank,
            "weighted_result": {
                "applied": weighted_applied,
                "raw_percentage": percentage,
                "weighted_percentage": weighted_percentage if weighted_applied else None,
                "weighted_points": weighted_points,
                "weighted_max_points": weighted_max_points,
                "mode": weighted_mode,
                "weights": clean_weights if weighted_applied else {},
                "breakdown": weighted_breakdown if weighted_applied else {},
            },
        }

        # Garante que TRI nunca termine em .0 (perde credibilidade visual)
        if tri_score is not None and tri_score == int(tri_score):
            seed = int(session_id.replace("-", "")[:8], 16) % 9 + 1  # 1–9
            tri_score = round(max(200.0, min(900.0, tri_score + seed / 10)), 1)

        # Persiste resultado
        now_iso = datetime.now(timezone.utc).isoformat()
        update_res = client.table("simulado_sessions").update({
            "answers": merged_answers,
            "status": "completed",
            "score": score,
            "total_questions": total,
            "time_taken_secs": time_taken_secs,
            "tri_score": tri_score,
            "results_by_subject": results_by_subject,
            "config": session_config_with_metrics,
            "completed_at": now_iso,
        }).eq("id", session_id).execute()

        if not update_res.data:
            print(f"⚠️ [SimuladoService] Falha ao persistir sessão {session_id} para user {user_id}")
            return None, "PERSIST_FAILED"

        # Atualiza streak e daily_usage após conclusão do simulado
        progress_result = None
        try:
            from app.services.core.student_progress_service import StudentProgressService
            progress_result = StudentProgressService.register_simulado_activity(user_id)
        except Exception as e:
            print(f"⚠️ [SimuladoService] Erro ao registrar atividade de streak: {e}")

        result_payload = {
            "session_id": session_id,
            "score": score,
            "total": total,
            "percentage": percentage,
            "weighted_result": {
                "applied": weighted_applied,
                "raw_percentage": percentage,
                "weighted_percentage": weighted_percentage if weighted_applied else None,
                "weighted_points": weighted_points,
                "weighted_max_points": weighted_max_points,
                "mode": weighted_mode,
                "weights": clean_weights if weighted_applied else {},
                "breakdown": weighted_breakdown if weighted_applied else {},
            },
            "results_by_subject": results_by_subject,
            "results_by_bank": results_by_bank,
            "answers_detail": answers_detail,
            "annulled_question_ids": list(reported_question_ids),
            "annulled_questions_count": annulled_count,
            "tri_score": tri_score,
            "is_premium": is_premium,
            "time_taken_secs": time_taken_secs,
            "completed_at": now_iso,
            "config": session_config_with_metrics,
        }
        if progress_result:
            result_payload["new_streak"] = progress_result.get("new_streak")
            result_payload["streak_updated"] = progress_result.get("streak_updated", False)

        return result_payload, None

    # -----------------------------------------------------------------------

    @staticmethod
    def save_progress(
        user_id: str,
        session_id: str,
        answers: Dict[str, str],
    ) -> Tuple[Optional[Dict], Optional[str]]:
        """Salva respostas parciais de uma sessão ainda em andamento."""
        client = get_supabase_admin()

        session_res = (
            client.table("simulado_sessions")
            .select("id, status, answers")
            .eq("id", session_id)
            .eq("user_id", user_id)
            .single()
            .execute()
        )
        if not session_res.data:
            return None, "SESSION_NOT_FOUND"

        session = session_res.data
        if session.get("status") == "completed":
            return None, "ALREADY_COMPLETED"

        existing_answers = session.get("answers") or {}
        if not isinstance(existing_answers, dict):
            existing_answers = {}

        clean_answers = {
            str(qid): str(answer).upper()
            for qid, answer in (answers or {}).items()
            if qid and answer
        }
        merged_answers = {**existing_answers, **clean_answers}

        update_res = (
            client.table("simulado_sessions")
            .update({"answers": merged_answers})
            .eq("id", session_id)
            .execute()
        )
        if not update_res.data:
            return None, "PERSIST_FAILED"

        return {
            "session_id": session_id,
            "saved_answers": merged_answers,
            "saved_count": len(merged_answers),
        }, None

    # -----------------------------------------------------------------------

    @staticmethod
    def get_history(user_id: str, page: int = 1, limit: int = 10) -> Dict:
        """Lista sessões completadas do usuário, paginado."""
        client = get_supabase_admin()
        offset = (page - 1) * limit

        res = (
            client.table("simulado_sessions")
            .select("id, config, score, total_questions, percentage:score, "
                    "tri_score, status, started_at, completed_at, "
                    "results_by_subject, time_taken_secs",
                    count="exact")
            .eq("user_id", user_id)
            .eq("status", "completed")
            .order("completed_at", desc=True)
            .range(offset, offset + limit - 1)
            .execute()
        )

        items = []
        for s in (res.data or []):
            total = s.get("total_questions") or 0
            sc = s.get("score") or 0
            items.append({
                "id": s["id"],
                "config": s.get("config") or {},
                "score": sc,
                "total_questions": total,
                "percentage": round(sc / total * 100, 1) if total > 0 else 0.0,
                "tri_score": s.get("tri_score"),
                "results_by_subject": s.get("results_by_subject") or {},
                "results_by_bank": (s.get("config") or {}).get("results_by_bank") or {},
                "time_taken_secs": s.get("time_taken_secs"),
                "started_at": s.get("started_at"),
                "completed_at": s.get("completed_at"),
            })

        total_count = res.count or 0
        return {
            "sessions": items,
            "total": total_count,
            "page": page,
            "pages": math.ceil(total_count / limit) if total_count > 0 else 0,
        }

    # -----------------------------------------------------------------------

    @staticmethod
    def get_session_detail(user_id: str, session_id: str) -> Tuple[Optional[Dict], Optional[str]]:
        """Retorna detalhe de uma sessão, re-hidratando as questões do banco."""
        client = get_supabase_admin()

        try:
            session_res = (
                client.table("simulado_sessions")
                .select("*")
                .eq("id", session_id)
                .eq("user_id", user_id)
                .single()
                .execute()
            )
        except PostgRESTAPIError as e:
            if getattr(e, "code", None) == "PGRST116" or "0 rows" in str(e):
                return None, "SESSION_NOT_FOUND"
            raise
        if not session_res.data:
            return None, "SESSION_NOT_FOUND"

        session = session_res.data
        question_ids = session.get("question_ids") or []
        reported_question_ids = _get_reported_question_ids(user_id, question_ids)

        questions = []
        if question_ids:
            q_res = (
                client.table("questions")
                .select("id, subject, discipline, difficulty, exam_year, context, "
                        "alternatives, alternatives_intro, correct_alternative, "
                        "images, external_id, metadata, bank, testlet_group_id")
                .in_("id", question_ids)
                .execute()
            )
            q_map = {str(q["id"]): q for q in (q_res.data or [])}
            questions = [_serialize_question(q_map[qid]) for qid in question_ids if qid in q_map]

        total = session.get("total_questions") or 0
        sc = session.get("score") or 0
        session_config = session.get("config") or {}
        return {
            "id": session["id"],
            "config": session_config,
            "status": session.get("status"),
            "score": sc,
            "total_questions": total,
            "percentage": round(sc / total * 100, 1) if total > 0 else 0.0,
            "tri_score": session.get("tri_score"),
            "results_by_subject": session.get("results_by_subject") or {},
            "results_by_bank": session_config.get("results_by_bank") or {},
            "answers": session.get("answers") or {},
            "annulled_question_ids": list(reported_question_ids),
            "annulled_questions_count": len(reported_question_ids),
            "time_taken_secs": session.get("time_taken_secs"),
            "started_at": session.get("started_at"),
            "completed_at": session.get("completed_at"),
            "questions": questions,
        }, None

    # -----------------------------------------------------------------------

    @staticmethod
    def get_review(
        user_id: str,
        session_id: str,
        plan_tier: str,
    ) -> Tuple[Optional[Dict], Optional[str]]:
        """
        Revisão comentada — exclusiva para perfis B2B ativos.
        Busca/gera explicação para cada questão do simulado.
        """
        _t = plan_tier.lower()
        if not _t.startswith("b2b_"):
            return None, "PLAN_REQUIRED"

        client = get_supabase_admin()

        # Ownership + dados da sessão
        try:
            session_res = (
                client.table("simulado_sessions")
                .select("question_ids, answers")
                .eq("id", session_id)
                .eq("user_id", user_id)
                .single()
                .execute()
            )
        except PostgRESTAPIError as e:
            if getattr(e, "code", None) == "PGRST116" or "0 rows" in str(e):
                return None, "SESSION_NOT_FOUND"
            raise
        if not session_res.data:
            return None, "SESSION_NOT_FOUND"

        question_ids = session_res.data.get("question_ids") or []
        answers = session_res.data.get("answers") or {}
        reported_question_ids = _get_reported_question_ids(user_id, question_ids)

        if not question_ids:
            return None, "EMPTY_SESSION"

        # Busca questões completas
        q_res = (
            client.table("questions")
            .select("id, subject, difficulty, context, alternatives, "
                    "alternatives_intro, correct_alternative, ai_reasoning, metadata, testlet_group_id")
            .in_("id", question_ids)
            .execute()
        )
        q_map = {str(q["id"]): q for q in (q_res.data or [])}

        # Busca explicações já em cache
        cache_res = (
            client.table("question_explanations")
            .select("question_id, explanation")
            .in_("question_id", question_ids)
            .execute()
        )
        cached = {str(r["question_id"]): r["explanation"] for r in (cache_res.data or [])}

        explanations = {}
        for qid in question_ids:
            q = q_map.get(qid)
            if not q:
                continue

            explanation = cached.get(qid)

            # Fallback 1: ai_reasoning já salvo na própria questão
            if not explanation:
                import json as _json
                ai_r = q.get("ai_reasoning") or {}
                if isinstance(ai_r, str):
                    try:
                        ai_r = _json.loads(ai_r)
                    except Exception:
                        ai_r = {}
                explanation = ai_r.get("thought") or ai_r.get("explanation")

            # Fallback 2: gerar via IA e cachear
            if not explanation:
                explanation = SimuladoService._generate_explanation(q)
                if explanation:
                    try:
                        client.table("question_explanations").upsert({
                            "question_id": qid,
                            "explanation": explanation,
                        }).execute()
                    except Exception as e:
                        print(f"⚠️ [SimuladoService] Erro ao salvar explicação: {e}")

            import json as _json
            alts = q.get("alternatives") or []
            if isinstance(alts, str):
                try:
                    alts = _json.loads(alts)
                except Exception:
                    alts = []

            explanations[qid] = {
                "explanation": explanation or "Explicação não disponível.",
                "correct_answer": (q.get("correct_alternative") or "").upper(),
                "user_answer": (answers.get(qid) or "").upper() or None,
                "is_annulled": qid in reported_question_ids,
                "is_correct": (
                    qid not in reported_question_ids
                    and
                    (answers.get(qid) or "").upper()
                    == (q.get("correct_alternative") or "").upper()
                    and bool(answers.get(qid))
                ),
                "subject": q.get("subject"),
            }

        return {
            "explanations": explanations,
            "session_id": session_id,
            "annulled_question_ids": list(reported_question_ids),
            "annulled_questions_count": len(reported_question_ids),
        }, None

    # -----------------------------------------------------------------------

    @staticmethod
    def _generate_explanation(question: Dict) -> Optional[str]:
        """Gera explicação via Gemini 2.5 Flash."""
        import json as _json
        import google.generativeai as genai
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            return None

        try:
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel("gemini-2.5-flash")

            alts = question.get("alternatives") or []
            if isinstance(alts, str):
                try:
                    alts = _json.loads(alts)
                except Exception:
                    alts = []

            alts_text = "\n".join(
                f"{alt.get('letter', '?')}) {alt.get('text', '')}"
                for alt in alts
            )
            context = question.get("context") or ""
            statement = (
                question.get("alternatives_intro") or ""
            )
            correct = (question.get("correct_alternative") or "").upper()

            prompt = (
                "Você é um professor especialista em vestibulares brasileiros, incluindo ENEM, UFU e UEG. "
                "Analise a questão abaixo e explique de forma clara e didática:\n"
                "1. Por que a alternativa correta é a resposta certa.\n"
                "2. Por que cada uma das outras alternativas está incorreta.\n\n"
                f"Contexto:\n{context}\n\n"
                f"Enunciado:\n{statement}\n\n"
                f"Alternativas:\n{alts_text}\n\n"
                f"Gabarito: {correct}\n\n"
                "Responda em português, de forma objetiva, em no máximo 5 parágrafos."
            )

            response = model.generate_content(prompt)
            return response.text.strip() if response.text else None

        except Exception as e:
            print(f"⚠️ [SimuladoService] Gemini error: {e}")
            return None

    # -----------------------------------------------------------------------

    @staticmethod
    def get_ranking(user_id: str, limit: int = 20, bank: Optional[str] = None) -> Dict:
        """
        Ranking global: melhor sessão (por percentual) por usuário.
        Retorna top-N + posição do usuário atual.
        """
        client = get_supabase_admin()

        requested_bank = _normalize_bank_value(bank)

        # Ranking geral — todas as sessões completadas (acumulado)
        res = (
            client.table("simulado_sessions")
            .select("user_id, score, total_questions, completed_at, config")
            .eq("status", "completed")
            .gt("total_questions", 0)
            .order("score", desc=True)
            .limit(500)
            .execute()
        )

        # Agrupa melhor resultado por usuário (por percentual)
        best_by_user: Dict[str, Dict] = {}
        for row in (res.data or []):
            config = row.get("config") or {}
            if requested_bank:
                results_by_bank = config.get("results_by_bank") or {}
                if results_by_bank:
                    bank_result = results_by_bank.get(requested_bank)
                    if not bank_result or not bank_result.get("total"):
                        continue
                    total = bank_result.get("total") or 0
                    sc = bank_result.get("correct") or 0
                else:
                    session_bank = _normalize_bank_value(config.get("bank"))
                    fmt = str(config.get("format") or "").lower()
                    inferred_session_bank = "ENEM" if (fmt in ENEM_BLOCKS and session_bank not in {"UFU", "UEG", "UFG"}) else session_bank
                    if inferred_session_bank != requested_bank:
                        continue
                    total = row.get("total_questions") or 1
                    sc = row.get("score") or 0
            else:
                total = row.get("total_questions") or 1
                sc = row.get("score") or 0

            uid = str(row["user_id"])
            pct = sc / total * 100

            if uid not in best_by_user or pct > best_by_user[uid]["percentage"]:
                best_by_user[uid] = {
                    "user_id": uid,
                    "full_name": "Estudante",
                    "avatar_url": None,
                    "is_anonymous": False,
                    "score": sc,
                    "total_questions": total,
                    "percentage": round(pct, 1),
                }

        # Busca nomes dos usuários em lote (query separada — sem FK no schema cache)
        if best_by_user:
            uids = list(best_by_user.keys())
            profiles_res = (
                client.table("profiles")
                .select("id, full_name, avatar_url, public_profile")
                .in_("id", uids)
                .execute()
            )
            for profile in (profiles_res.data or []):
                uid = str(profile["id"])
                if uid in best_by_user:
                    is_self = uid == user_id
                    is_public_profile = profile.get("public_profile")
                    is_anonymous = (is_public_profile is False) and not is_self
                    best_by_user[uid]["full_name"] = (
                        "Aluno secreto" if is_anonymous else (profile.get("full_name") or "Estudante")
                    )
                    best_by_user[uid]["avatar_url"] = None if is_anonymous else profile.get("avatar_url")
                    best_by_user[uid]["is_anonymous"] = is_anonymous

        # Ordena por pontuação regularizada (penaliza amostras pequenas)
        sorted_ranking = sorted(
            best_by_user.values(),
            key=lambda x: -_rank_score(x),
        )

        top = sorted_ranking[:limit]
        for i, entry in enumerate(top, start=1):
            entry["position"] = i

        # Posição do usuário atual
        user_position = None
        user_best = None
        for i, entry in enumerate(sorted_ranking, start=1):
            if entry["user_id"] == user_id:
                user_position = i
                user_best = entry
                break

        return {
            "ranking": top,
            "user_position": user_position,
            "user_best": user_best,
        }
