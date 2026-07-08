import json
import random
from datetime import datetime, timezone
# ALTERAÇÃO CRÍTICA: Importando o Admin Client para bypassar RLS no backend
from app.utils.supabase_client import get_supabase_admin
from app.utils.ai_monitor import log_ai_usage
from app.services.core.student_progress_service import StudentProgressService

class QuestionService:
    @staticmethod
    def _normalize_bank_value(value):
        normalized = str(value or "").strip().upper()
        if normalized in {"UFU", "UFU_VEST"}:
            return "UFU"
        if normalized in {"UEG", "UEG_VEST"}:
            return "UEG"
        if normalized in {"UFG", "UFG_VEST"}:
            return "UFG"
        if normalized in {"ENEM", "INEP_ENEM", "ENEM_OFICIAL"}:
            return "ENEM"
        return normalized or None

    @staticmethod
    def _infer_bank_from_question(q):
        direct_bank = QuestionService._normalize_bank_value(q.get("bank"))
        if direct_bank:
            return direct_bank

        metadata = q.get("metadata")
        if isinstance(metadata, str):
            try:
                metadata = json.loads(metadata) if metadata.strip() else {}
            except Exception:
                metadata = {}
        if not isinstance(metadata, dict):
            metadata = {}

        metadata_bank = QuestionService._normalize_bank_value(
            metadata.get("bank") or metadata.get("source")
        )
        if metadata_bank:
            return metadata_bank

        external_id = str(q.get("external_id") or "").upper()
        if external_id.startswith("UFU_VEST_"):
            return "UFU"
        if external_id.startswith("UEG_VEST_"):
            return "UEG"
        if external_id.startswith("UFG_VEST_"):
            return "UFG"
        if external_id.startswith("UNESP_"):
            return "UNESP"
        return "ENEM"

    @staticmethod
    def _get_answered_question_ids(user_id: str) -> list[str]:
        client = get_supabase_admin()
        res = (
            client.table("user_answers")
            .select("question_id")
            .eq("user_id", user_id)
            .execute()
        )
        if not res.data:
            return []
        return list({row["question_id"] for row in res.data if row.get("question_id")})


    @staticmethod
    @staticmethod
    def check_user_quota(user_id, action_type="question"):
        """
        No backend focado em partners, apenas perfis B2B ativos
        (ou admin) podem acessar banco de questões e simulados.
        """
        client = get_supabase_admin()

        res = (
            client.table("profiles")
            .select("organization_id, plan_tier, role")
            .eq("id", user_id)
            .single()
            .execute()
        )
        if not res.data:
            return False, "USER_NOT_FOUND", {}

        profile = res.data
        role = str(profile.get("role") or "").lower().strip()
        plan = str(profile.get("plan_tier") or "").lower().strip()

        if role == "admin" or profile.get("organization_id") or plan.startswith("b2b_"):
            return True, "PREMIUM", {}

        return False, "SUBSCRIPTION_INACTIVE", {}

    @staticmethod
    def increment_quota(user_id, action_type="question"):
        client = get_supabase_admin()
        today_str = datetime.now(timezone.utc).strftime('%Y-%m-%d')

        if action_type == "question":
            daily_res = client.table("daily_usage")\
                .select("questions_count")\
                .eq("user_id", user_id)\
                .eq("usage_date", today_str)\
                .maybe_single()\
                .execute()
            if daily_res and daily_res.data:
                new_val = (daily_res.data.get("questions_count") or 0) + 1
                client.table("daily_usage").update({
                    "questions_count": new_val
                }).eq("user_id", user_id).eq("usage_date", today_str).execute()
                return new_val
            client.table("daily_usage").insert({
                "user_id": user_id,
                "usage_date": today_str,
                "questions_count": 1
            }).execute()
            return 1

        daily_res = client.table("daily_usage")\
            .select("simulations_count")\
            .eq("user_id", user_id)\
            .eq("usage_date", today_str)\
            .maybe_single()\
            .execute()
        if daily_res and daily_res.data:
            new_val = (daily_res.data.get("simulations_count") or 0) + 1
            client.table("daily_usage").update({
                "simulations_count": new_val
            }).eq("user_id", user_id).eq("usage_date", today_str).execute()
            return new_val
        client.table("daily_usage").insert({
            "user_id": user_id,
            "usage_date": today_str,
            "simulations_count": 1
        }).execute()
        return 1

    @staticmethod
    def _serialize_question(q):
        alternatives = q.get("alternatives")
        if isinstance(alternatives, str):
            try: alternatives = json.loads(alternatives)
            except: alternatives = []
        if not alternatives: alternatives = []

        serialized_alts = []
        normalized_correct = str(q.get("correct_alternative") or "").upper()
        for alt in alternatives:
            letter = (alt.get("letter") or alt.get("label") or "").upper()
            serialized_alts.append({
                "letter": alt.get("letter") or alt.get("label"), 
                "text": alt.get("text", ""),
                "image": alt.get("file") or alt.get("image") or None, 
                "isCorrect": letter == normalized_correct if normalized_correct else alt.get("isCorrect", False)
            })

        ai_reasoning = q.get("ai_reasoning")
        if isinstance(ai_reasoning, str):
            try:
                ai_reasoning = json.loads(ai_reasoning) if ai_reasoning.strip() else {}
            except Exception:
                ai_reasoning = {}
        if not isinstance(ai_reasoning, dict):
            ai_reasoning = {}
        metadata = q.get("metadata")
        if isinstance(metadata, str):
            try:
                metadata = json.loads(metadata) if metadata.strip() else {}
            except Exception:
                metadata = {}
        if not isinstance(metadata, dict):
            metadata = {}
        explanation = ai_reasoning.get("thought") or metadata.get("explanation", "Sem explicação detalhada.")
        
        context = q.get("context", "")
        statement = q.get("alternatives_intro") or ""

        return {
            "id": q.get("id"),
            "external_id": q.get("external_id"),
            "exam_year": q.get("exam_year"),
            "bank": QuestionService._infer_bank_from_question(q),
            "subject": q.get("subject"),
            "discipline": q.get("discipline"), 
            "difficulty": q.get("difficulty"),
            "context": context, 
            "statement": statement,
            "alternatives": serialized_alts, 
            "correct_option": q.get("correct_alternative"),
            "explanation": explanation,
            "images": q.get("images", []),
            "metadata": metadata,
            "testlet_group_id": q.get("testlet_group_id"),
        }

    @staticmethod
    def list_questions(page=1, limit=20, filters=None, user_id=None):
        supabase = get_supabase_admin()
        start = (page - 1) * limit
        end = start + limit - 1

        user_status = {"locked": False, "reason": None}
        if user_id:
            allowed, reason, details = QuestionService.check_user_quota(user_id, "question")
            if not allowed:
                user_status = {"locked": True, "reason": reason, "details": details}

        query = supabase.table("questions").select("*", count="exact").eq("is_verified", True)

        if filters:
            if filters.get("subject") and filters["subject"] != "Todas":
                query = query.ilike("subject", f"%{filters['subject']}%")
            if filters.get("topic") and filters["topic"] != "Todos":
                topic = filters["topic"]
                query = query.or_(f'discipline.ilike."%{topic}%",metadata->>ai_topic.ilike."%{topic}%"')
            if filters.get("year") and filters["year"] != "Todos":
                query = query.eq("exam_year", filters["year"])
            if filters.get("difficulty") and filters["difficulty"] != "Todas":
                query = query.eq("difficulty", filters["difficulty"])
            if filters.get("bank") and filters["bank"] != "Todas":
                requested_bank = QuestionService._normalize_bank_value(filters["bank"])
                if requested_bank == "UNESP":
                    query = query.like("external_id", "UNESP_%")
                elif requested_bank:
                    query = query.eq("bank", requested_bank)

        answered_ids = set()
        tab = None
        if filters and filters.get("tab") and user_id:
            answered_ids = set(QuestionService._get_answered_question_ids(user_id))
            tab = filters.get("tab")

        needs_tab_filter = tab in {"done", "todo"}

        if not needs_tab_filter:
            response = (
                query
                .order("exam_year", desc=True)
                .order("created_at", desc=False)
                .range(start, end)
                .execute()
            )
            raw_data = response.data or []
            total_count = response.count or 0
            serialized_data = [QuestionService._serialize_question(q) for q in raw_data]
        else:
            candidate_rows = []
            batch_size = 1000
            offset = 0

            while True:
                batch_response = (
                    query
                    .order("exam_year", desc=True)
                    .order("created_at", desc=False)
                    .range(offset, offset + batch_size - 1)
                    .execute()
                )
                batch = batch_response.data or []
                if not batch:
                    break
                candidate_rows.extend(batch)
                if len(batch) < batch_size:
                    break
                offset += batch_size

            if tab == "done":
                candidate_rows = [q for q in candidate_rows if q.get("id") in answered_ids]
            elif tab == "todo":
                candidate_rows = [q for q in candidate_rows if q.get("id") not in answered_ids]

            total_count = len(candidate_rows)
            paged_rows = candidate_rows[start:end + 1]
            serialized_data = [QuestionService._serialize_question(q) for q in paged_rows]

        return {
            "data": serialized_data,
            "total": total_count,
            "page": page,
            "pages": ((total_count + limit - 1) // limit) if total_count else 0,
            "user_status": user_status
        }

    
    @staticmethod
    def get_total_verified_questions():
        client = get_supabase_admin()
        try:
            # Usamos limit(1) junto com count="exact" para otimizar. 
            # O Supabase retorna a contagem total, mas trafega apenas 1 linha pela rede.
            res = client.table("questions").select("id", count="exact").eq("is_verified", True).limit(1).execute()
            return res.count or 2700
        except Exception as e:
            print(f"Erro ao contar questões totais: {e}")
            return 2700 # Fallback de segurança

    @staticmethod
    def get_topics_by_subject(subject="", bank=""):
        supabase = get_supabase_admin()
        try:
            # Monta a query base (apenas questões verificadas)
            query = supabase.table("questions").select("discipline, metadata, external_id, bank").eq("is_verified", True).limit(2000)
            
            # Aplica o filtro de matéria APENAS se uma matéria específica foi selecionada
            if subject and subject != "Todas":
                query = query.ilike("subject", f"%{subject}%")
                
            res = query.execute()
            topics_counter = {}
            requested_bank = QuestionService._normalize_bank_value(bank) if bank and bank != "Todas" else None
            for row in res.data:
                if requested_bank and QuestionService._infer_bank_from_question(row) != requested_bank:
                    continue
                t = None
                if row.get("discipline"): t = row["discipline"].strip()
                elif row.get("metadata") and row["metadata"].get("ai_topic"): t = row["metadata"]["ai_topic"].strip()
                
                if t and len(t) > 2:
                    topics_counter[t] = topics_counter.get(t, 0) + 1
            
            sorted_topics = sorted(topics_counter.items(), key=lambda item: item[1], reverse=True)
            return [{"name": k, "count": v} for k, v in sorted_topics]
        except Exception as e:
            print(f"Erro topics: {e}")
            return []

    @staticmethod
    def submit_answer(user_id, question_id, selected_option):
        client = get_supabase_admin()

        # 1. VERIFICAÇÃO INICIAL
        allowed, reason, details = QuestionService.check_user_quota(user_id, "question")
        
        if not allowed:
            return {
                "error": "Quota exceeded", 
                "code": reason, 
                "details": details,
                "is_correct": False
            }

        q_res = client.table("questions").select("*").eq("id", question_id).single().execute()
        if not q_res.data:
            return {"error": "Question not found", "is_correct": False}

        question = q_res.data
        correct_letter = question.get("correct_alternative")
        
        if not correct_letter:
            alts = question.get("alternatives", [])
            if isinstance(alts, list):
                for alt in alts:
                    if alt.get("isCorrect") or alt.get("correct"):
                        correct_letter = alt.get("letter") or alt.get("label")
                        break
        
        is_correct = str(selected_option).upper() == str(correct_letter).upper()
        prior_correct_res = (
            client.table("user_answers")
            .select("id")
            .eq("user_id", user_id)
            .eq("question_id", question_id)
            .eq("is_correct", True)
            .limit(1)
            .execute()
        )
        already_answered_correctly = bool(prior_correct_res.data)
        is_first_correct = is_correct and not already_answered_correctly

        if already_answered_correctly:
            return {
                "is_correct": is_correct,
                "is_first_correct": False,
                "already_answered_correctly": True,
                "correct_option": correct_letter,
                "explanation": question.get("ai_reasoning", {}).get("thought") or "Gabarito oficial.",
                "quota_status": "already_answered",
            }

        try:
            client.table("user_answers").insert({
                "user_id": user_id,
                "question_id": question_id,
                "selected_option": selected_option.upper(),
                "is_correct": is_correct,
                "subject": question.get("subject")
            }).execute()

            # Isso é o que alimenta a tabela daily_usage e profiles (Streak/XP)
            progress_result = StudentProgressService.register_answer_activity(user_id, is_correct)
            new_count = QuestionService.increment_quota(user_id, "question")
            
            quota_status = "ok"

        except Exception as e:
            print(f"Erro ao salvar resposta: {e}")
            quota_status = "error"

        ai_reasoning = question.get("ai_reasoning") or {}
        explanation = ai_reasoning.get("thought") or "Gabarito oficial."

        result_payload = {
            "is_correct": is_correct,
            "is_first_correct": is_first_correct,
            "already_answered_correctly": already_answered_correctly,
            "correct_option": correct_letter,
            "explanation": explanation,
            "quota_status": quota_status 
        }
        if progress_result:
            result_payload["new_streak"] = progress_result.get("new_streak")
            result_payload["streak_updated"] = progress_result.get("streak_updated", False)

        return result_payload

    @staticmethod
    def generate_simulado(user_id, qty, subject="Todas"):
        client = get_supabase_admin()
        
        allowed, reason, details = QuestionService.check_user_quota(user_id, "simulado")
        if not allowed:
            return {"error": "Quota exceeded", "code": reason, "details": details}

        try:
            query = client.table("questions").select("*").eq("is_verified", True)
            if subject != "Todas":
                query = query.ilike("subject", f"%{subject}%")
            
            candidates_res = query.limit(100).execute()
            all_questions = candidates_res.data
            
            if not all_questions:
                return {"error": "Sem questões suficientes para esta matéria."}

            selected = random.sample(all_questions, min(qty, len(all_questions)))
            
            QuestionService.increment_quota(user_id, "simulado")
            
            return [QuestionService._serialize_question(q) for q in selected]

        except Exception as e:
            print(f"Erro simulado: {e}")
            return {"error": str(e)}
