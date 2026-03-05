-- =====================================================
-- FUNCIONES SQL SERVER-SIDE PARA SUSCRIPCIONES
-- Ejecutar en Supabase SQL Editor
-- Fecha: 2026-03-04
-- =====================================================

-- -------------------------------------------------------
-- 1. get_agent_plan_limits(agent_id UUID)
--    Retorna los límites del plan activo de un agente
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION get_agent_plan_limits(p_agent_id UUID)
RETURNS TABLE (
    plan_name TEXT,
    properties_limit INT,
    images_per_property INT,
    priority_tier INT,
    has_ai_analysis BOOLEAN,
    has_advanced_stats BOOLEAN,
    has_priority_support BOOLEAN,
    has_featured_badge BOOLEAN,
    is_unlimited BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_profile profiles%ROWTYPE;
    v_config subscriptions_config%ROWTYPE;
BEGIN
    -- Get user profile
    SELECT * INTO v_profile FROM profiles WHERE id = p_agent_id;

    -- Admin or is_unlimited => unlimited access
    IF v_profile.role = 'admin' OR v_profile.is_unlimited = TRUE THEN
        RETURN QUERY SELECT
            'Ilimitado'::TEXT,
            999999::INT,
            999999::INT,
            3::INT,
            TRUE::BOOLEAN,
            TRUE::BOOLEAN,
            TRUE::BOOLEAN,
            TRUE::BOOLEAN,
            TRUE::BOOLEAN;
        RETURN;
    END IF;

    -- Get plan config from subscriptions_config
    SELECT * INTO v_config
    FROM subscriptions_config
    WHERE name = COALESCE(v_profile.subscription_plan, 'Gratis')
    LIMIT 1;

    -- Fallback if plan not found
    IF NOT FOUND THEN
        RETURN QUERY SELECT
            'Gratis'::TEXT,
            5::INT,
            3::INT,
            1::INT,
            FALSE::BOOLEAN,
            FALSE::BOOLEAN,
            FALSE::BOOLEAN,
            FALSE::BOOLEAN,
            FALSE::BOOLEAN;
        RETURN;
    END IF;

    RETURN QUERY SELECT
        v_config.name::TEXT,
        COALESCE((v_config.features->>'properties_limit')::INT, 5),
        COALESCE((v_config.features->>'images_per_property')::INT, 3),
        COALESCE((v_config.features->>'priority_tier')::INT, 1),
        COALESCE((v_config.features->>'has_ai_analysis')::BOOLEAN, FALSE),
        COALESCE((v_config.features->>'has_advanced_stats')::BOOLEAN, FALSE),
        COALESCE((v_config.features->>'has_priority_support')::BOOLEAN, FALSE),
        COALESCE((v_config.features->>'has_featured_badge')::BOOLEAN, FALSE),
        FALSE::BOOLEAN;
END;
$$;

-- -------------------------------------------------------
-- 2. check_property_limit(agent_id UUID)
--    Verifica si el agente puede crear más propiedades
--    Retorna: can_create BOOL, current_count INT, max_limit INT, message TEXT
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION check_property_limit(p_agent_id UUID)
RETURNS TABLE (
    can_create BOOLEAN,
    current_count INT,
    max_limit INT,
    message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_current_count INT;
    v_limits RECORD;
BEGIN
    -- Get limits for this agent
    SELECT * INTO v_limits FROM get_agent_plan_limits(p_agent_id) LIMIT 1;

    -- Count active + draft properties (not sold/archived)
    SELECT COUNT(*)::INT INTO v_current_count
    FROM properties
    WHERE agent_id = p_agent_id
    AND status IN ('active', 'draft');

    -- Unlimited always can create
    IF v_limits.is_unlimited THEN
        RETURN QUERY SELECT
            TRUE::BOOLEAN,
            v_current_count,
            999999::INT,
            'Sin límite de propiedades'::TEXT;
        RETURN;
    END IF;

    IF v_current_count < v_limits.properties_limit THEN
        RETURN QUERY SELECT
            TRUE::BOOLEAN,
            v_current_count,
            v_limits.properties_limit,
            format('Puedes crear %s propiedades más', v_limits.properties_limit - v_current_count)::TEXT;
    ELSE
        RETURN QUERY SELECT
            FALSE::BOOLEAN,
            v_current_count,
            v_limits.properties_limit,
            format('Has alcanzado el límite de %s propiedades del plan %s. Actualiza tu plan para continuar.', v_limits.properties_limit, v_limits.plan_name)::TEXT;
    END IF;
END;
$$;

-- -------------------------------------------------------
-- 3. Permisos: Solo el propio usuario puede consultar sus límites
--    Los admins pueden consultar cualquier agente
-- -------------------------------------------------------
REVOKE ALL ON FUNCTION get_agent_plan_limits(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION check_property_limit(UUID) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION get_agent_plan_limits(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION check_property_limit(UUID) TO authenticated;

-- -------------------------------------------------------
-- TEST (opcional, comentar antes de ejecutar en producción)
-- -------------------------------------------------------
-- SELECT * FROM get_agent_plan_limits(auth.uid());
-- SELECT * FROM check_property_limit(auth.uid());
