-- ============================================================================
-- MIGRACIÓN CONSOLIDADA E IDEMPOTENTE — GARZA CASAS IA
-- Incluye:
--   1. Soporte Pasarela PayPal API v2 (payments + profiles)
--   2. Módulo Dinámico de Paquetes y Planes (subscriptions_config + RLS)
--   3. Blindaje de Funciones RPC (SECURITY DEFINER + search_path + anti-IDOR)
--   4. Expiración Automática de Suscripciones (Lazy Expiration + Batch Cron)
--   5. Cierre de exposición en vista admin_payments_summary
-- Fecha: 2026-11-06
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. ESQUEMA DE PAGOS Y PERFILES PARA PAYPAL API v2
-- ============================================================================

ALTER TABLE public.payments
ADD COLUMN IF NOT EXISTS gateway TEXT DEFAULT 'paypal',
ADD COLUMN IF NOT EXISTS paypal_order_id TEXT,
ADD COLUMN IF NOT EXISTS paypal_capture_id TEXT,
ADD COLUMN IF NOT EXISTS paypal_payer_id TEXT;

CREATE INDEX IF NOT EXISTS idx_payments_paypal_order_id ON public.payments(paypal_order_id);
CREATE INDEX IF NOT EXISTS idx_payments_paypal_capture_id ON public.payments(paypal_capture_id);
CREATE INDEX IF NOT EXISTS idx_payments_gateway ON public.payments(gateway);

DO $$
BEGIN
    ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_status_check;
    ALTER TABLE public.payments ADD CONSTRAINT payments_status_check
        CHECK (status IN ('pending', 'approved', 'completed', 'rejected', 'refunded', 'cancelled', 'in_process'));
EXCEPTION
    WHEN OTHERS THEN
        NULL;
END $$;

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'Gratis',
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS paypal_payer_id TEXT,
ADD COLUMN IF NOT EXISTS paypal_subscription_id TEXT;

CREATE INDEX IF NOT EXISTS idx_profiles_subscription_expires_at
    ON public.profiles(subscription_expires_at)
    WHERE subscription_expires_at IS NOT NULL;

COMMENT ON COLUMN public.payments.gateway IS 'Pasarela de pago utilizada: paypal';
COMMENT ON COLUMN public.payments.paypal_order_id IS 'ID de orden retornado por la API v2 de PayPal';
COMMENT ON COLUMN public.payments.paypal_capture_id IS 'ID de captura final retornado por PayPal al completar la transacción';

-- ============================================================================
-- 2. MÓDULO DE PAQUETES Y PLANES DINÁMICOS (subscriptions_config + RLS)
-- ============================================================================

ALTER TABLE public.subscriptions_config
ADD COLUMN IF NOT EXISTS properties_limit INT DEFAULT 5,
ADD COLUMN IF NOT EXISTS images_per_property INT DEFAULT 3,
ADD COLUMN IF NOT EXISTS is_popular BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS has_ai_analysis BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS has_priority_support BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS cta_type TEXT DEFAULT 'checkout',
ADD COLUMN IF NOT EXISTS cta_label TEXT DEFAULT 'Empezar ahora',
ADD COLUMN IF NOT EXISTS cta_url TEXT DEFAULT NULL;

ALTER TABLE public.subscriptions_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Subscription Plans" ON public.subscriptions_config;
CREATE POLICY "Public Read Subscription Plans"
ON public.subscriptions_config FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Admin Manage Subscription Plans" ON public.subscriptions_config;
CREATE POLICY "Admin Manage Subscription Plans"
ON public.subscriptions_config FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- Sincronización inicial de límites base (respeta valores ya configurados con COALESCE si existen, o inicializa defaults)
UPDATE public.subscriptions_config SET
    properties_limit = 5,
    images_per_property = 3,
    is_popular = FALSE,
    has_ai_analysis = FALSE,
    has_priority_support = FALSE,
    cta_type = 'register',
    cta_label = 'Empezar gratis',
    features = COALESCE(features, '["Hasta 5 propiedades", "3 imágenes por propiedad", "Dashboard básico", "Soporte vía email"]'::jsonb)
WHERE name = 'Gratis';

UPDATE public.subscriptions_config SET
    properties_limit = 50,
    images_per_property = 15,
    is_popular = TRUE,
    has_ai_analysis = TRUE,
    has_priority_support = TRUE,
    cta_type = 'checkout',
    cta_label = 'Empezar ahora',
    features = COALESCE(features, '["Hasta 50 propiedades", "15 imágenes por propiedad", "Análisis de mercado IA", "Soporte VIP 24/7"]'::jsonb)
WHERE name = 'Pro';

UPDATE public.subscriptions_config SET
    properties_limit = 999999,
    images_per_property = 999999,
    is_popular = FALSE,
    has_ai_analysis = TRUE,
    has_priority_support = TRUE,
    cta_type = 'contact',
    cta_label = 'Contactar',
    features = COALESCE(features, '["Propiedades ilimitadas", "Galerías 4K", "API de integración", "Account Manager dedicado"]'::jsonb)
WHERE name IN ('Enterprise', 'Platino');

-- ============================================================================
-- 3. ACTIVACIÓN Y EXPIRACIÓN AUTOMÁTICA DE SUSCRIPCIONES
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_user_subscription_after_payment(
    p_user_id UUID,
    p_plan_name TEXT,
    p_billing_period TEXT DEFAULT 'monthly'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_expires_at TIMESTAMPTZ;
BEGIN
    IF p_billing_period = 'yearly' THEN
        v_expires_at := NOW() + INTERVAL '1 year';
    ELSE
        v_expires_at := NOW() + INTERVAL '1 month';
    END IF;

    UPDATE public.profiles
    SET
        subscription_plan = p_plan_name,
        subscription_status = 'active',
        subscription_expires_at = v_expires_at,
        updated_at = NOW()
    WHERE id = p_user_id;
END;
$$;

-- Función batch para Cron Diario: degrada a 'Gratis' cualquier suscripción vencida
CREATE OR REPLACE FUNCTION public.expire_overdue_subscriptions()
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_expired_count INT;
BEGIN
    WITH updated AS (
        UPDATE public.profiles
        SET
            subscription_plan = 'Gratis',
            subscription_status = 'expired',
            updated_at = NOW()
        WHERE role IS DISTINCT FROM 'admin'
          AND COALESCE(is_unlimited, FALSE) = FALSE
          AND COALESCE(subscription_plan, 'Gratis') <> 'Gratis'
          AND subscription_expires_at IS NOT NULL
          AND subscription_expires_at < NOW()
        RETURNING id
    )
    SELECT COUNT(*)::INT INTO v_expired_count FROM updated;

    RETURN v_expired_count;
END;
$$;

-- ============================================================================
-- 4. LÍMITES DINÁMICOS CON AUTO-EXPIRACIÓN EN TIEMPO REAL (LAZY EXPIRATION)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_agent_plan_limits(p_agent_id UUID)
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
SET search_path = public
AS $$
DECLARE
    v_caller_id UUID := auth.uid();
    v_is_caller_admin BOOLEAN := FALSE;
    v_profile public.profiles%ROWTYPE;
    v_plan_name TEXT;
    v_cfg public.subscriptions_config%ROWTYPE;
BEGIN
    -- Candado anti-IDOR: un usuario autenticado solo puede consultar su propio perfil salvo que sea admin
    IF v_caller_id IS NOT NULL AND v_caller_id <> p_agent_id THEN
        SELECT EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = v_caller_id AND role = 'admin'
        ) INTO v_is_caller_admin;

        IF NOT v_is_caller_admin THEN
            RAISE EXCEPTION 'Acceso no autorizado a límites de otro agente';
        END IF;
    END IF;

    SELECT * INTO v_profile FROM public.profiles WHERE id = p_agent_id;

    -- Caso A: Admin o cuentas marcadas como ilimitadas
    IF v_profile.role = 'admin' OR COALESCE(v_profile.is_unlimited, FALSE) = TRUE THEN
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

    v_plan_name := COALESCE(v_profile.subscription_plan, 'Gratis');

    -- Lazy Expiration: si la fecha de vigencia ya venció, degradar en tiempo real a Gratis
    IF v_plan_name <> 'Gratis'
       AND v_profile.subscription_expires_at IS NOT NULL
       AND v_profile.subscription_expires_at < NOW() THEN
        UPDATE public.profiles
        SET
            subscription_plan = 'Gratis',
            subscription_status = 'expired',
            updated_at = NOW()
        WHERE id = p_agent_id;

        v_plan_name := 'Gratis';
    END IF;

    -- Consultar configuración dinámica en subscriptions_config
    SELECT * INTO v_cfg FROM public.subscriptions_config WHERE name = v_plan_name LIMIT 1;

    IF FOUND THEN
        RETURN QUERY SELECT
            v_cfg.name::TEXT,
            COALESCE(v_cfg.properties_limit, 5)::INT,
            COALESCE(v_cfg.images_per_property, 3)::INT,
            COALESCE(v_cfg.priority, 1)::INT,
            COALESCE(v_cfg.has_ai_analysis, FALSE)::BOOLEAN,
            COALESCE(v_cfg.has_ai_analysis, FALSE)::BOOLEAN,
            COALESCE(v_cfg.has_priority_support, FALSE)::BOOLEAN,
            COALESCE(v_cfg.is_popular, FALSE)::BOOLEAN,
            (COALESCE(v_cfg.properties_limit, 5) >= 999999)::BOOLEAN;
        RETURN;
    END IF;

    -- Fallbacks seguros si la fila aún no existe en subscriptions_config
    IF v_plan_name = 'Pro' THEN
        RETURN QUERY SELECT 'Pro'::TEXT, 50::INT, 15::INT, 2::INT, TRUE, TRUE, TRUE, TRUE, FALSE;
        RETURN;
    ELSIF v_plan_name IN ('Platino', 'Enterprise') THEN
        RETURN QUERY SELECT v_plan_name::TEXT, 999999::INT, 999999::INT, 3::INT, TRUE, TRUE, TRUE, TRUE, TRUE;
        RETURN;
    END IF;

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
END;
$$;

CREATE OR REPLACE FUNCTION public.check_property_limit(p_agent_id UUID)
RETURNS TABLE (
    can_create BOOLEAN,
    current_count INT,
    max_limit INT,
    message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_current_count INT;
    v_limits RECORD;
BEGIN
    -- get_agent_plan_limits ya valida autorización anti-IDOR y expiración en tiempo real
    SELECT * INTO v_limits FROM public.get_agent_plan_limits(p_agent_id) LIMIT 1;

    SELECT COUNT(*)::INT INTO v_current_count
    FROM public.properties
    WHERE agent_id = p_agent_id
    AND status IN ('active', 'draft');

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

-- ============================================================================
-- 5. BLINDAJE DE PERMISOS Y CIERRE DE EXPOSICIÓN EN VISTAS
-- ============================================================================

REVOKE ALL ON FUNCTION public.update_user_subscription_after_payment(UUID, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_user_subscription_after_payment(UUID, TEXT, TEXT) TO service_role;

REVOKE ALL ON FUNCTION public.expire_overdue_subscriptions() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.expire_overdue_subscriptions() TO service_role;

REVOKE ALL ON FUNCTION public.get_agent_plan_limits(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_agent_plan_limits(UUID) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.check_property_limit(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.check_property_limit(UUID) TO authenticated, service_role;

-- Revocar acceso directo de clientes a admin_payments_summary (exponía auth.users.email saltando RLS)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_views
        WHERE schemaname = 'public' AND viewname = 'admin_payments_summary'
    ) THEN
        REVOKE ALL ON public.admin_payments_summary FROM PUBLIC, anon, authenticated;
        GRANT SELECT ON public.admin_payments_summary TO service_role;
    END IF;
END $$;

COMMIT;
