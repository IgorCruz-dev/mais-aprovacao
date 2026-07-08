"""
Blueprint /api/simulado — Módulo de Simulados ENEM e UFU.

POST   /api/simulado/start              Cria sessão e retorna questões
POST   /api/simulado/<id>/finish        Finaliza, calcula score e TRI
GET    /api/simulado/history            Histórico paginado do usuário
GET    /api/simulado/<id>               Detalhe de uma sessão
GET    /api/simulado/<id>/review        Revisão comentada (Pro only)
GET    /api/simulado/ranking            Ranking global
"""

import logging
from datetime import datetime, timezone
from flask import Blueprint, jsonify, request
from postgrest.exceptions import APIError as PostgRESTAPIError
from app.services.core.simulado_service import SimuladoService
from app.services.core.auth_service import token_required
from app import limiter

logger = logging.getLogger(__name__)

simulado_bp = Blueprint("simulado", __name__, url_prefix="/api/simulado")


def _is_missing_fixed_col_error(exc: Exception) -> bool:
    msg = str(exc)
    return "fixed_question_ids" in msg and "PGRST204" in msg


# ---------------------------------------------------------------------------
# POST /api/simulado/start
# ---------------------------------------------------------------------------
@simulado_bp.route("/start", methods=["POST"])
@limiter.limit("20 per hour")
@token_required
def start_simulado(current_user):
    """
    Cria uma nova sessão de simulado.

    Body JSON:
    {
      "format":     "linguagens" | "humanas" | "natureza" | "matematica"
                    | "dia1" | "dia2" | "completo" | "custom",
      "bank":       "ENEM" | "UFU" | "Todas", // opcional
      "year":       2019,          // opcional — null = qualquer ano
      "subject":    "Física",      // opcional — só para format=custom
      "difficulty": "facil" | "medio" | "dificil" | "misto",
      "qty":        10             // opcional para custom; ignorado para blocos por banca
    }
    """
    user_id = current_user.get("id")
    if not user_id:
        return jsonify({"error": "Identidade do usuário indisponível."}), 403

    data = request.get_json(silent=True) or {}

    scheduled_simulado_id = data.get("scheduled_simulado_id") or None
    user_org_id = current_user.get("organization_id")

    config = {
        "format":     (data.get("format") or "custom").lower(),
        "bank":       data.get("bank") or None,
        "year":       int(data["year"]) if data.get("year") else None,
        "subject":    data.get("subject") or None,
        "difficulty": (data.get("difficulty") or "misto").lower(),
        "qty":        int(data["qty"]) if data.get("qty") else None,
    }

    bypass_quota = False
    fixed_question_ids = None
    prioritize_unseen_for_user = True
    global_unseen_user_ids = None
    if scheduled_simulado_id:
        from app.utils.supabase_client import get_supabase_admin as _admin
        try:
            sched_res = (
                _admin().table("scheduled_simulados")
                .select("config, org_id, starts_at, ends_at, fixed_question_ids, modality")
                .eq("id", scheduled_simulado_id)
                .single()
                .execute()
            )
            supports_fixed_col = True
        except PostgRESTAPIError as e:
            if getattr(e, "code", None) == "PGRST116" or "0 rows" in str(e):
                return jsonify({"error": "Simulado agendado não encontrado.", "code": "SCHEDULED_SIMULADO_NOT_FOUND"}), 404
            raise
        except Exception as e:
            if not _is_missing_fixed_col_error(e):
                raise
            supports_fixed_col = False
            try:
                sched_res = (
                    _admin().table("scheduled_simulados")
                    .select("config, org_id, starts_at, ends_at")
                    .eq("id", scheduled_simulado_id)
                    .single()
                    .execute()
                )
            except PostgRESTAPIError as e2:
                if getattr(e2, "code", None) == "PGRST116" or "0 rows" in str(e2):
                    return jsonify({"error": "Simulado agendado não encontrado.", "code": "SCHEDULED_SIMULADO_NOT_FOUND"}), 404
                raise
        if not sched_res.data:
            return jsonify({"error": "Simulado agendado não encontrado.", "code": "SCHEDULED_SIMULADO_NOT_FOUND"}), 404

        scheduled = sched_res.data
        scheduled_org_id = scheduled.get("org_id")
        if not user_org_id or scheduled_org_id != user_org_id:
            return jsonify({"error": "Este simulado não pertence à sua organização.", "code": "SCHEDULED_SIMULADO_FORBIDDEN"}), 403

        starts_at = scheduled.get("starts_at")
        ends_at = scheduled.get("ends_at")

        def _parse_iso(value):
            if not value:
                return None
            try:
                return datetime.fromisoformat(str(value).replace("Z", "+00:00"))
            except Exception:
                return None

        now = datetime.now(timezone.utc)
        now_minute = now.replace(second=0, microsecond=0)
        starts_at_dt = _parse_iso(starts_at)
        ends_at_dt = _parse_iso(ends_at)
        starts_at_minute = starts_at_dt.replace(second=0, microsecond=0) if starts_at_dt else None
        ends_at_minute = ends_at_dt.replace(second=0, microsecond=0) if ends_at_dt else None

        # UX: liberação por minuto (ignora segundos/milisegundos)
        if starts_at_minute and now_minute < starts_at_minute:
            return jsonify({"error": "Este simulado ainda não começou.", "code": "SCHEDULED_SIMULADO_NOT_STARTED"}), 403
        if ends_at_minute and now_minute > ends_at_minute:
            return jsonify({"error": "Este simulado já foi encerrado.", "code": "SCHEDULED_SIMULADO_ENDED"}), 403

        sched_config = scheduled.get("config") or {}
        sched_modality = str(scheduled.get("modality") or "online").lower()

        # Hybrid: bloqueia sessão online se já existe correção presencial
        if sched_modality == "hybrid":
            try:
                pe_res = (
                    _admin().table("printed_exams")
                    .select("id")
                    .eq("scheduled_simulado_id", scheduled_simulado_id)
                    .execute()
                )
                pe_ids = [r["id"] for r in (pe_res.data or [])]
                if pe_ids:
                    sub_res = (
                        _admin().table("printed_exam_submissions")
                        .select("id", count="exact")
                        .in_("printed_exam_id", pe_ids)
                        .eq("student_id", user_id)
                        .execute()
                    )
                    if (sub_res.count or 0) > 0:
                        return jsonify({
                            "error": (
                                "Você já realizou este simulado presencialmente. "
                                "O resultado presencial prevalece e não é possível "
                                "iniciar a versão online."
                            ),
                            "code": "HYBRID_PRINTED_SUBMISSION_EXISTS",
                        }), 409
            except Exception:
                logger.exception("Erro ao verificar printed_submission para simulado hybrid")

        allow_retry = bool(sched_config.get("allow_retry", True))
        if not allow_retry:
            already_done = (
                _admin().table("simulado_sessions")
                .select("id", count="exact")
                .eq("scheduled_simulado_id", scheduled_simulado_id)
                .eq("user_id", user_id)
                .eq("status", "completed")
                .execute()
            )
            if (already_done.count or 0) > 0:
                return jsonify({
                    "error": "Este simulado não permite refazer.",
                    "code": "SCHEDULED_SIMULADO_RETRY_DISABLED",
                }), 403

        config = {
            "format":          sched_config.get("format") or config.get("format") or "custom",
            "bank":            sched_config.get("bank") or config.get("bank"),
            "year":            sched_config.get("year") or config.get("year"),
            "subject":         sched_config.get("subject") or config.get("subject"),
            "difficulty":      sched_config.get("difficulty") or config.get("difficulty") or "misto",
            "qty":             sched_config.get("qty") or config.get("qty"),
            "time_limit_secs": sched_config.get("time_limit_secs"),
            "weights":         sched_config.get("weights") or {},
            "allow_retry":     allow_retry,
            "ueg_weight_group": sched_config.get("ueg_weight_group"),
        }
        bypass_quota = True  # acesso gerenciado pela org; ignora quota individual
        same_for_all = bool(
            sched_config.get("same_for_all_students", sched_config.get("same_for_all", False))
        )
        if same_for_all:
            # IDs já gerados na criação do simulado — lê direto do banco.
            fixed_in_db = scheduled.get("fixed_question_ids") if supports_fixed_col else None
            if isinstance(fixed_in_db, list) and fixed_in_db:
                fixed_question_ids = [str(qid) for qid in fixed_in_db if qid]
            prioritize_unseen_for_user = False

        # Fallback para printed/hybrid sem fixed_question_ids:
        # usa a ordem do printed_exam vinculado para garantir que a sessão
        # online espelhe exatamente o impresso distribuído aos alunos.
        if not fixed_question_ids and sched_modality in ("printed", "hybrid"):
            try:
                pe_fallback_res = (
                    _admin().table("printed_exams")
                    .select("question_ids")
                    .eq("scheduled_simulado_id", scheduled_simulado_id)
                    .order("created_at", desc=False)
                    .limit(1)
                    .execute()
                )
                pe_fallback = (pe_fallback_res.data or [None])[0]
                if pe_fallback and isinstance(pe_fallback.get("question_ids"), list) and pe_fallback["question_ids"]:
                    fixed_question_ids = [str(qid) for qid in pe_fallback["question_ids"] if qid]
                    prioritize_unseen_for_user = False
                    logger.warning(
                        "Simulado %s/%s sem fixed_question_ids — usando questões do printed_exam como fallback",
                        sched_modality, scheduled_simulado_id,
                    )
            except Exception:
                logger.exception(
                    "Erro ao buscar printed_exam fallback para simulado %s/%s",
                    sched_modality, scheduled_simulado_id,
                )

    payload, error = SimuladoService.start_simulado(
        user_id,
        config,
        scheduled_simulado_id=scheduled_simulado_id,
        bypass_quota=bypass_quota,
        fixed_question_ids=fixed_question_ids,
        prioritize_unseen_for_user=prioritize_unseen_for_user,
        global_unseen_user_ids=global_unseen_user_ids,
    )

    if error == "SUBSCRIPTION_INACTIVE":
        return jsonify({"error": "Assinatura inativa.", "code": "SUBSCRIPTION_INACTIVE"}), 403
    if error == "NO_QUESTIONS_FOUND":
        return jsonify({"error": "Não encontramos questões para os filtros selecionados."}), 404
    if error == "INVALID_FORMAT":
        return jsonify({"error": "Formato de simulado inválido para a banca selecionada."}), 400
    if error == "SESSION_CREATE_FAILED":
        return jsonify({"error": "Erro ao criar sessão. Tente novamente."}), 500
    if error:
        return jsonify({"error": error}), 400

    return jsonify(payload), 201


# ---------------------------------------------------------------------------
# POST /api/simulado/<session_id>/progress
# ---------------------------------------------------------------------------
@simulado_bp.route("/<session_id>/progress", methods=["POST"])
@limiter.limit("240 per hour")
@token_required
def save_simulado_progress(current_user, session_id):
    """Salva respostas parciais de uma sessão de simulado em andamento."""
    user_id = current_user.get("id")
    if not user_id:
        return jsonify({"error": "Identidade do usuário indisponível."}), 403

    data = request.get_json(silent=True) or {}
    answers = data.get("answers") or {}

    payload, error = SimuladoService.save_progress(user_id, session_id, answers)

    if error == "SESSION_NOT_FOUND":
        return jsonify({"error": "Sessão não encontrada."}), 404
    if error == "ALREADY_COMPLETED":
        return jsonify({"error": "Este simulado já foi finalizado."}), 409
    if error:
        return jsonify({"error": error}), 500

    return jsonify(payload), 200


# ---------------------------------------------------------------------------
# POST /api/simulado/<session_id>/finish
# ---------------------------------------------------------------------------
@simulado_bp.route("/<session_id>/finish", methods=["POST"])
@limiter.limit("30 per hour")
@token_required
def finish_simulado(current_user, session_id):
    """
    Finaliza o simulado e retorna os resultados.

    Body JSON:
    {
      "answers": {"<question_uuid>": "A", ...},
      "time_taken_secs": 1800
    }
    """
    user_id = current_user.get("id")
    if not user_id:
        return jsonify({"error": "Identidade do usuário indisponível."}), 403

    data = request.get_json(silent=True) or {}
    answers = data.get("answers") or {}
    time_taken = data.get("time_taken_secs")

    plan_tier = current_user.get("plan_tier") or ""

    payload, error = SimuladoService.finish_simulado(
        user_id, session_id, answers, time_taken, plan_tier
    )

    if error == "SESSION_NOT_FOUND":
        return jsonify({"error": "Sessão não encontrada."}), 404
    if error == "ALREADY_COMPLETED":
        return jsonify({"error": "Este simulado já foi finalizado."}), 409
    if error == "EMPTY_SESSION":
        return jsonify({"error": "Sessão sem questões."}), 400
    if error == "MIN_ANSWERS_NOT_REACHED":
        details = payload if isinstance(payload, dict) else {}
        return jsonify({
            "error": "É necessário responder pelo menos 50% das questões para finalizar.",
            "code": "MIN_ANSWERS_NOT_REACHED",
            "answered_count": details.get("answered_count", 0),
            "minimum_required": details.get("minimum_required"),
            "total_questions": details.get("total_questions"),
        }), 400
    if error:
        return jsonify({"error": error}), 500

    # Crédito de pontos para alunos B2B (Edificar e parceiros)
    if current_user.get("organization_id"):
        from app.services.core.gamification_service import EdificarGamificationService
        session_config = payload.get("config") or {}
        points_result = EdificarGamificationService.process_simulado_completion(
            user_id=user_id,
            organization_id=current_user["organization_id"],
            score=payload.get("score", 0),
            total=payload.get("total", 0),
            total_questions=payload.get("total", 0),
            difficulty=session_config.get("difficulty", "misto"),
        )
        payload["gamification"] = points_result

    return jsonify(payload), 200


# ---------------------------------------------------------------------------
# GET /api/simulado/history
# ---------------------------------------------------------------------------
@simulado_bp.route("/history", methods=["GET"])
@limiter.limit("60 per hour")
@token_required
def get_history(current_user):
    """
    Lista simulados completados do usuário, paginado.
    Query: page (default 1), limit (default 10, max 20)
    """
    user_id = current_user.get("id")
    if not user_id:
        return jsonify({"error": "Identidade do usuário indisponível."}), 403

    page = max(1, int(request.args.get("page", 1)))
    limit = min(int(request.args.get("limit", 10)), 20)

    result = SimuladoService.get_history(user_id, page, limit)
    return jsonify(result), 200


# ---------------------------------------------------------------------------
# GET /api/simulado/<session_id>
# ---------------------------------------------------------------------------
@simulado_bp.route("/<session_id>", methods=["GET"])
@limiter.limit("60 per hour")
@token_required
def get_session(current_user, session_id):
    """Retorna detalhe completo de uma sessão (re-hidrata questões do banco)."""
    user_id = current_user.get("id")
    if not user_id:
        return jsonify({"error": "Identidade do usuário indisponível."}), 403

    payload, error = SimuladoService.get_session_detail(user_id, session_id)

    if error == "SESSION_NOT_FOUND":
        return jsonify({"error": "Sessão não encontrada."}), 404
    if error:
        return jsonify({"error": error}), 500

    return jsonify(payload), 200


# ---------------------------------------------------------------------------
# GET /api/simulado/<session_id>/review
# ---------------------------------------------------------------------------
@simulado_bp.route("/<session_id>/review", methods=["GET"])
@limiter.limit("10 per hour")
@token_required
def get_review(current_user, session_id):
    """
    Revisão comentada — exclusiva para perfis B2B ativos.
    Busca ou gera explicação para cada questão via Gemini (com cache).
    """
    user_id = current_user.get("id")
    if not user_id:
        return jsonify({"error": "Identidade do usuário indisponível."}), 403

    plan_tier = current_user.get("plan_tier") or ""

    payload, error = SimuladoService.get_review(user_id, session_id, plan_tier)

    if error == "PLAN_REQUIRED":
        return jsonify({"error": "Recurso disponível apenas para perfis B2B ativos.", "code": "PLAN_REQUIRED"}), 403
    if error == "SESSION_NOT_FOUND":
        return jsonify({"error": "Sessão não encontrada."}), 404
    if error == "EMPTY_SESSION":
        return jsonify({"error": "Sessão sem questões."}), 400
    if error:
        return jsonify({"error": error}), 500

    return jsonify(payload), 200


# ---------------------------------------------------------------------------
# GET /api/simulado/ranking
# ---------------------------------------------------------------------------
@simulado_bp.route("/ranking", methods=["GET"])
@limiter.limit("30 per hour")
@token_required
def get_ranking(current_user):
    """
    Ranking global: melhores sessões por usuário (por percentual de acertos).
    Retorna top-20 + posição do usuário autenticado.
    """
    user_id = current_user.get("id")
    if not user_id:
        return jsonify({"error": "Identidade do usuário indisponível."}), 403

    bank = request.args.get("bank")
    result = SimuladoService.get_ranking(user_id, limit=20, bank=bank)
    return jsonify(result), 200
