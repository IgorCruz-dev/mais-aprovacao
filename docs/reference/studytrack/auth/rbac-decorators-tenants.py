from functools import wraps
import logging
import re
from flask import request, jsonify, g
from app.utils.supabase_client import get_supabase, get_supabase_admin

logger = logging.getLogger(__name__)

SLUG_PATTERN = re.compile(r"^[a-z0-9][a-z0-9-]{1,62}[a-z0-9]$")

def get_token_from_header():
    auth_header = request.headers.get("Authorization")
    if not auth_header or "Bearer " not in auth_header:
        return None
    return auth_header.split(" ")[1]

def load_user_context():
    """
    Carrega o User e o Profile do Supabase, injetando no contexto 'g'.
    Usa ADMIN CLIENT para buscar o perfil e evitar bloqueios de RLS.
    """
    if hasattr(g, "user") and g.user is not None:
        return

    token = get_token_from_header()
    if not token:
        g.user = None
        g.profile = None
        return

    # Usamos o cliente padrão para validar o token (Segurança do Supabase Auth)
    supabase = get_supabase()
    # Usamos o admin para buscar os dados complementares do banco (Bypass RLS)
    supabase_admin = get_supabase_admin()

    try:
        # 1. Auth User (Valida se o token é real)
        user_res = supabase.auth.get_user(token)
        if not user_res or not user_res.user:
            g.user = None
            g.profile = None
            return
        
        g.user = user_res.user
        
        # 2. Profile Data (Com Admin para garantir que retorna dados)
        # [CORREÇÃO] Removemos .single() para evitar erro PGRST116 se não achar
        profile_res = (
            supabase_admin.table("profiles")
            .select("id, full_name, role, organization_id, school_id, classroom_id, plan_tier")
            .eq("id", g.user.id)
            .execute()
        )
        
        # Pega o primeiro item da lista se existir
        if profile_res.data and len(profile_res.data) > 0:
            g.profile = profile_res.data[0]
        else:
            g.profile = None
            
    except Exception as e:
        # Não loga a exceção raw aqui — capture_error já envia para monitoramento
        from app.services.core.error_logger import capture_error
        capture_error(e, context={"flow": "require_auth_token_validation"})
        # Se falhar, garantimos que não fica lixo na memória
        g.user = None
        g.profile = None

def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        load_user_context()
        if not g.user:
            return jsonify({"error": "Unauthorized"}), 401
        return f(*args, **kwargs)
    return decorated

def require_tenant_context(f):
    """
    Garante que o usuário já fez onboarding e tem um perfil válido.
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        load_user_context()
        if not g.profile:
            return jsonify({"error": "Perfil incompleto. Faça onboarding."}), 403
        return f(*args, **kwargs)
    return decorated

def require_organization_access(f):
    """
    Bloqueia usuários que não são B2B (sem organization_id).
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        load_user_context()
        if not g.profile:
            return jsonify({"error": "Unauthorized"}), 401
        role = g.profile.get("role")
        if role in ("admin", "super_admin"):
            return f(*args, **kwargs)
        if not g.profile.get("organization_id"):
            return jsonify({"error": "Acesso restrito a contas corporativas/escolares."}), 403
        return f(*args, **kwargs)
    return decorated

def require_role(allowed_roles: list):
    """
    Valida o papel do usuário (ex: network_owner, school_admin).
    """
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            load_user_context()
            if not g.profile:
                return jsonify({"error": "Unauthorized"}), 401

            user_role = g.profile.get("role", "student")
            if user_role not in allowed_roles:
                return jsonify({"error": "Permissão insuficiente."}), 403

            return f(*args, **kwargs)
        return wrapper
    return decorator


def require_founder_of_org(slug_param="slug"):
    """
    Valida que o usuário autenticado é founder (ou admin) E pertence à organização
    identificada pelo slug na URL.

    Injeta `g.org` com os dados da organização para uso no endpoint.
    Uso:
        @require_founder_of_org()          # lê slug de kwargs['slug']
        @require_founder_of_org('org_slug')  # lê de kwargs['org_slug']
    """
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            load_user_context()

            if not g.profile:
                return jsonify({"error": "Unauthorized"}), 401

            role = g.profile.get("role")
            if role not in ("founder", "admin"):
                return jsonify({"error": "Acesso restrito a founders."}), 403

            slug = kwargs.get(slug_param) or request.view_args.get(slug_param)
            if not slug:
                return jsonify({"error": "Slug da organização não informado."}), 400
            if not isinstance(slug, str) or not SLUG_PATTERN.fullmatch(slug):
                return jsonify({"error": "Slug da organização inválido."}), 400

            supabase = get_supabase_admin()
            org_res = (
                supabase.table("organizations")
                .select("id, name, slug, logo_url, brand_primary, brand_secondary, brand_accent, plan_tier, max_students, invite_code, permissions")
                .eq("slug", slug)
                .execute()
            )

            if not org_res.data:
                return jsonify({"error": "Organização não encontrada."}), 404

            org = org_res.data[0]

            # Admin pode acessar qualquer org; founder apenas a sua
            if role == "founder" and g.profile.get("organization_id") != org["id"]:
                return jsonify({"error": "Sem permissão para esta organização."}), 403

            g.org = org
            return f(*args, **kwargs)
        return wrapper
    return decorator
