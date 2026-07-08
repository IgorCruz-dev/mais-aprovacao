from flask import Blueprint, jsonify, request
from app.services.core.question_service import QuestionService
from app.services.core.report_service import create_report as report_service_create, list_my_reports as report_service_list_my
from app.services.core.auth_service import token_required
from app.utils.supabase_client import get_supabase_admin
from app import cache

bp = Blueprint('questions_api', __name__, url_prefix='/api/questions')


@bp.route("/", methods=["GET"])
@token_required
def list_questions(current_user):
    """
    Lista questões com filtros. Autenticação obrigatória.
    user_id é extraído exclusivamente do JWT (current_user["id"]) — sem user_id na URL (IDOR-safe).
    """
    try:
        page = int(request.args.get("page", 1))
        limit = int(request.args.get("limit", 10))
        user_id = current_user.get("id")
        if not user_id:
            return jsonify({"error": "Identidade do usuário indisponível."}), 403

        filters = {
            "subject": request.args.get("subject"),
            "bank": request.args.get("bank") or request.args.get("banca"),
            "year": request.args.get("year"),
            "topic": request.args.get("topic"),
            "difficulty": request.args.get("difficulty"),
            "tab": request.args.get("tab", "todo"),
        }

        result = QuestionService.list_questions(page, limit, filters, user_id)
        return jsonify(result), 200

    except Exception as e:
        from flask import current_app
        if current_app.config.get('DEBUG'):
            import traceback
            traceback.print_exc()
        print(f"Erro ao listar questões: {e}")
        return jsonify({"error": str(e)}), 500

@bp.route("/topics", methods=["GET"])
def list_topics():
    try:
        # Pega a matéria. Se não vier, assume string vazia
        subject = request.args.get("subject", "")
        bank = request.args.get("bank") or request.args.get("banca") or ""
        topics = QuestionService.get_topics_by_subject(subject, bank)
        return jsonify(topics), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.route("/answer", methods=["POST"])
@token_required
def answer_question(current_user):
    """
    Rota principal de resposta. 
    Integra a verificação de resposta + cálculo de gamificação (XP/Streak).
    """
    try:
        data = request.get_json()
        user_id = current_user.get("id")
        question_id = data.get("question_id")
        option = data.get("option")

        if not all([user_id, question_id, option]):
             return jsonify({"error": "Missing data"}), 400

        # 1. Processa a resposta (Salva no banco e verifica acerto)
        result = QuestionService.submit_answer(user_id, question_id, option)
        
        # --- TRATAMENTO DE ERROS DE NEGÓCIO ---
        if "error" in result:
            error_code = result.get("code")
            if error_code == "SUBSCRIPTION_INACTIVE":
                return jsonify(result), 403
            return jsonify(result), 404
            
        # 2. --- INTEGRAÇÃO DA GAMIFICAÇÃO (CORE) ---
        # Se chegou aqui, a resposta foi processada com sucesso.
        # Vamos calcular XP e Streak baseados no resultado.
        
        # Crédito de pontos para alunos B2B (Edificar e parceiros)
        is_correct = result.get("is_correct", False)
        is_first_correct = result.get("is_first_correct", False)
        try:
            supabase = get_supabase_admin()
            profile_res = (
                supabase.table("profiles")
                .select("organization_id")
                .eq("id", user_id)
                .limit(1)
                .execute()
            )
            org_id = (profile_res.data[0] if profile_res.data else {}).get("organization_id")
            if org_id:
                from app.services.core.gamification_service import EdificarGamificationService
                q_points = EdificarGamificationService.process_question_answer(
                    user_id=user_id,
                    organization_id=org_id,
                    is_correct=is_first_correct,
                )
                result["gamification"] = q_points
            else:
                result["gamification"] = {"points_awarded": 0}
        except Exception:
            pass  # não-crítico: não interrompe a resposta principal

        return jsonify(result), 200

    except Exception as e:
        print(f"Erro ao responder: {e}")
        return jsonify({"error": str(e)}), 500

@bp.route("/simulado", methods=["GET"])
def simulado():
    try:
        qty = int(request.args.get("qty", 10))
        subject = request.args.get("subject", "Todas")
        user_id = request.args.get("user_id") # Obrigatório agora

        if not user_id:
            return jsonify({"error": "User ID required"}), 400
        
        questions = QuestionService.generate_simulado(user_id, qty, subject)
        
        if isinstance(questions, dict) and "error" in questions:
             if questions.get("code") == "SUBSCRIPTION_INACTIVE":
                 return jsonify(questions), 403
             return jsonify(questions), 500
             
        return jsonify(questions), 200
        
    except Exception as e:
        print(f"Erro simulado: {e}")
        return jsonify({"error": str(e)}), 500
        
@bp.route("/reports", methods=["GET"])
@token_required
def list_my_reports(current_user):
    """
    Lista os reports do próprio usuário (histórico).
    Query: page, limit (opcional).
    """
    try:
        user_id = current_user.get("id")
        if not user_id:
            return jsonify({"error": "Identidade do usuário indisponível."}), 403
        page = int(request.args.get("page", 1))
        limit = min(int(request.args.get("limit", 30)), 50)
        result = report_service_list_my(user_id, page=page, limit=limit)
        return jsonify(result), 200
    except Exception as e:
        print(f"Erro ao listar meus reports: {e}")
        return jsonify({"error": "Erro ao carregar histórico."}), 500


@bp.route("/report", methods=["POST"])
@token_required
def report_question(current_user):
    """
    Registra um report de erro em uma questão.
    Payload: { question_id, error_category, description? }
    user_id vem do JWT (IDOR-safe).
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Payload JSON ausente."}), 400

        user_id = current_user.get("id")
        if not user_id:
            return jsonify({"error": "Identidade do usuário indisponível."}), 403

        question_id = data.get("question_id")
        error_category = data.get("error_category")
        description = data.get("description")
        technical_context = data.get("technical_context")

        is_admin = current_user.get("role") == "admin"
        result = report_service_create(
            user_id,
            question_id,
            error_category,
            description,
            technical_context=technical_context,
            skip_rate_limit=is_admin,
        )

        if "error" in result:
            code = result.get("code", "ERROR")
            if code == "RATE_LIMIT":
                return jsonify(result), 429
            if code == "DUPLICATE_REPORT":
                return jsonify(result), 409
            if code in ("VALIDATION_ERROR", "QUESTION_NOT_FOUND"):
                return jsonify(result), 400
            return jsonify(result), 500

        return jsonify(result), 201
    except Exception as e:
        print(f"Erro ao criar report: {e}")
        return jsonify({"error": "Erro interno ao registrar report."}), 500


@bp.route("/total", methods=["GET"])
@cache.cached(timeout=3600) # [PERFORMANCE] Cache de 1 hora. Evita travar o PostgreSQL com consultas COUNT simultâneas
def get_total_questions():
    try:
        total = QuestionService.get_total_verified_questions()
        return jsonify({"total": total}), 200
    except Exception as e:
        print(f"Erro na rota /total: {e}")
        return jsonify({"error": str(e)}), 500
