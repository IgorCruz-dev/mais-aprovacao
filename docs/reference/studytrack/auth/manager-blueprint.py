from flask import Blueprint, jsonify, g, request
from app.utils.supabase_client import get_supabase, get_supabase_admin
from app.utils.tenants import require_organization_access, require_role
from app.services.analytics.stats_engine import StatsEngine

manager_bp = Blueprint("manager", __name__) 

@manager_bp.route("/schools", methods=["GET"])
@require_organization_access
@require_role(["network_owner", "admin", "manager", "school_admin"])
def list_my_schools():
    """
    Lista escolas. Rota Final: /api/enterprise/manager/schools
    Usa ADMIN para garantir listagem.
    """
    # [CORREÇÃO] Usa Admin Client para evitar bloqueio RLS na leitura da tabela schools
    supabase = get_supabase_admin()
    org_id = g.profile.get("organization_id")

    try:
        response = (
            supabase.table("schools")
            .select("id, name, created_at") 
            .eq("organization_id", org_id)
            .execute()
        )
        
        schools = response.data or []
        return jsonify({"schools": schools, "count": len(schools)}), 200

    except Exception as e:
        print(f"Erro ao listar escolas da org {org_id}: {e}")
        return jsonify({"error": "Erro interno ao buscar escolas"}), 500


@manager_bp.route("/schools/<school_id>/classrooms", methods=["GET"])
@require_organization_access
@require_role(["network_owner", "admin", "manager", "school_admin"])
def list_school_classrooms(school_id):
    """
    Lista turmas. Rota Final: /api/enterprise/manager/schools/<id>/classrooms
    """
    supabase = get_supabase_admin()
    org_id = g.profile.get("organization_id")

    try:
        # Valida se a escola é da org do usuário
        school_check = (
            supabase.table("schools")
            .select("id")
            .eq("id", school_id)
            .eq("organization_id", org_id)
            .execute()
        )
        
        if not school_check.data:
            return jsonify({"error": "Escola não encontrada ou acesso negado."}), 404

        response = (
            supabase.table("classrooms")
            .select("id, name, grade, shift, invite_code")
            .eq("school_id", school_id)
            .execute()
        )
        
        classrooms = response.data or []
        return jsonify({"classrooms": classrooms, "school_id": school_id}), 200

    except Exception as e:
        print(f"Erro ao listar turmas da escola {school_id}: {e}")
        return jsonify({"error": str(e)}), 500

@manager_bp.route("/dashboard/<school_id>", methods=["GET"])
@require_organization_access
@require_role(["network_owner", "admin", "manager", "school_admin"])
def get_pedagogical_dashboard(school_id):
    """
    Dashboard. Rota Final: /api/enterprise/manager/dashboard/<school_id>
    """
    supabase = get_supabase_admin()
    org_id = g.profile.get("organization_id")

    try:
        school_check = (
            supabase.table("schools")
            .select("id")
            .eq("id", school_id)
            .eq("organization_id", org_id)
            .execute()
        )
        
        if not school_check.data:
            return jsonify({"error": "Acesso negado a esta escola."}), 403

        # O StatsEngine já deve estar configurado para usar queries otimizadas
        dashboard_data = StatsEngine.get_manager_dashboard_data(school_id)
        return jsonify(dashboard_data), 200

    except Exception as e:
        print(f"Erro Dashboard Manager: {e}")
        return jsonify({"error": "Erro ao processar dados pedagógicos"}), 500