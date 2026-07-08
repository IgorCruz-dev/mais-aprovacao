from flask import Blueprint, request, jsonify, g
from app.utils.tenants import require_organization_access, require_role
from app.services.core.classroom_service import create_classroom, get_classroom_students, get_teacher_classrooms
from app.utils.supabase_client import get_supabase
# IMPORT FUNDAMENTAL PARA O BOTÃO FUNCIONAR
from app.services.core.task_service import assign_task_to_classroom

teacher_bp = Blueprint("teacher", __name__, url_prefix="/api/enterprise/teacher")

@teacher_bp.route("/classrooms", methods=["POST"])
@require_organization_access
@require_role(["network_owner", "school_admin", "teacher"])
def create_new_classroom():
    """
    Cria uma turma e retorna o Invite Code.
    Payload: { "school_id": "...", "name": "3ão A", "grade": "3EM", "shift": "morning", "code": "OPTIONAL" }
    """
    data = request.get_json() or {}
    
    # Validações básicas
    school_id = data.get("school_id")
    name = data.get("name")
    
    if not school_id or not name:
        return jsonify({"error": "Campos school_id e name são obrigatórios."}), 400

    # Pega o ID do professor logado (via g.profile)
    teacher_id = g.profile.get("id")

    classroom, error = create_classroom(
        organization_id=g.profile.get("organization_id"),
        school_id=school_id,
        name=name,
        grade=data.get("grade", "N/A"),
        shift=data.get("shift", "morning"),
        custom_code=data.get("code"),
        teacher_id=teacher_id # Passa o ID para vincular como dono
    )

    if error:
        return jsonify({"error": error}), 400

    return jsonify({
        "success": True,
        "message": "Turma criada com sucesso!",
        "classroom": classroom,
        "invite_code": classroom.get("invite_code")
    }), 201


@teacher_bp.route("/classrooms", methods=["GET"])
@require_organization_access
@require_role(["network_owner", "school_admin", "teacher"])
def list_my_classrooms():
    """
    Lista turmas visíveis para este usuário.
    Se for Professor -> Retorna apenas as turmas atribuídas a ele.
    """
    user_role = g.profile.get("role")
    user_id = g.profile.get("id")
    org_id = g.profile.get("organization_id")

    # CENÁRIO 1: PROFESSOR (Visão Restrita e Detalhada)
    if user_role == "teacher":
        classrooms = get_teacher_classrooms(user_id)
        return jsonify({"classrooms": classrooms, "mode": "teacher_assigned"}), 200

    # CENÁRIO 2: GESTOR (Visão Geral da Rede)
    supabase = get_supabase()
    
    # Filtro opcional por escola
    school_id_filter = request.args.get("school_id")

    query = supabase.table("classrooms").select("*").eq("organization_id", org_id)
    
    if school_id_filter:
        query = query.eq("school_id", school_id_filter)
        
    res = query.execute()
    
    return jsonify({"classrooms": res.data or [], "mode": "admin_all"}), 200


@teacher_bp.route("/classrooms/<classroom_id>/students", methods=["GET"])
@require_organization_access
@require_role(["network_owner", "school_admin", "teacher"])
def list_students(classroom_id):
    """
    Retorna a lista de alunos da turma para o diário de classe.
    """
    students = get_classroom_students(classroom_id, g.profile.get("organization_id"))
    
    return jsonify({
        "classroom_id": classroom_id,
        "count": len(students),
        "students": students
    }), 200

# ==============================================================================
# NOVA ROTA DA COZINHA PESADA (DISPARO DE ATIVIDADES)
# ==============================================================================

@teacher_bp.route("/tasks/broadcast", methods=["POST"])
@require_organization_access
@require_role(["teacher", "school_admin", "network_owner"])
def broadcast_new_activity():
    """
    Cria uma atividade para a turma toda e notifica via E-mail (Thread).
    Payload esperado:
    {
        "classroom_id": "uuid",
        "title": "Lista de Exercícios 1",
        "description": "Capítulo 4 e 5",
        "due_date": "2024-12-31" (Opcional)
    }
    """
    data = request.get_json() or {}
    
    classroom_id = data.get("classroom_id")
    title = data.get("title")
    description = data.get("description", "")
    due_date = data.get("due_date") # YYYY-MM-DD
    
    # Validação básica
    if not classroom_id or not title:
        return jsonify({"error": "Classroom ID e Título são obrigatórios"}), 400
        
    # Chama o Service (que agora dispara o E-mail em background e usa Bulk Insert)
    result = assign_task_to_classroom(
        classroom_id=classroom_id,
        title=title,
        description=description,
        creator_id=g.profile.get("id"),
        due_date=due_date
    )
    
    if not result["success"]:
        return jsonify({"error": result["message"]}), 400
        
    return jsonify(result), 201