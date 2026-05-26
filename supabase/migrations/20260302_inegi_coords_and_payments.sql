-- ============================================================
-- MIGRACIÓN: Coordenadas INEGI + Caché + Sistema de Pagos MP
-- Fecha: 2026-03-02
-- ============================================================

-- ============================================================
-- PARTE 1: Geolocalización de Propiedades (UPDATE_DATABASE.sql)
-- ============================================================

-- 1. Asegurar columnas de geolocalización en propiedades
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS municipio_clave TEXT;

COMMENT ON COLUMN properties.latitude IS 'Latitud en formato decimal (e.g. 25.682823)';
COMMENT ON COLUMN properties.longitude IS 'Longitud en formato decimal (e.g. -100.312948)';
COMMENT ON COLUMN properties.municipio_clave IS 'Clave oficial del INEGI (Estado+Municipio, e.g. 19039 para Monterrey)';

-- 2. Crear tabla de caché para mejorar performance de APIs INEGI
CREATE TABLE IF NOT EXISTS inegi_cache (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  cache_key TEXT UNIQUE NOT NULL,  -- e.g. "denue_19_032_25.6820_-100.3161_500"
  data JSONB NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para limpieza rápida de caché expirado
CREATE INDEX IF NOT EXISTS idx_inegi_cache_expires ON inegi_cache(expires_at);

-- RLS para inegi_cache (solo lectura pública, escritura solo desde server)
ALTER TABLE inegi_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "inegi_cache_public_read" ON inegi_cache
  FOR SELECT USING (true);

CREATE POLICY "inegi_cache_service_write" ON inegi_cache
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================================
-- PARTE 2: Sistema de Pagos con Mercado Pago
-- ============================================================

-- 3. Añadir campos de pago a perfiles de usuarios
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'Gratis',
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active'
    CHECK (subscription_status IN ('active', 'pending', 'cancelled', 'expired')),
ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS mp_customer_id TEXT,        -- ID del customer en Mercado Pago
ADD COLUMN IF NOT EXISTS mp_subscription_id TEXT;    -- ID de suscripción en MP

-- 4. Tabla de órdenes / pagos
CREATE TABLE IF NOT EXISTS payments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id uuid REFERENCES subscriptions_config(id),
  plan_name TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'MXN',
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected', 'refunded', 'cancelled', 'in_process')),
  payment_method TEXT,                  -- e.g. 'credit_card', 'pix', 'oxxo'
  mp_payment_id TEXT,                   -- ID del pago en Mercado Pago
  mp_preference_id TEXT,                -- ID de preferencia MP (checkout)
  mp_external_reference TEXT UNIQUE,   -- Referencia interna para webhook
  billing_period TEXT DEFAULT 'monthly' CHECK (billing_period IN ('monthly', 'yearly')),
  metadata JSONB DEFAULT '{}',          -- Datos adicionales del webhook
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para pagos
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_mp_payment_id ON payments(mp_payment_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_external_ref ON payments(mp_external_reference);

-- 5. RLS para pagos
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- El agente solo ve sus propios pagos
CREATE POLICY "payments_own_read" ON payments
  FOR SELECT USING (auth.uid() = user_id);

-- Solo el servidor puede insertar/actualizar pagos (via webhooks y API)
CREATE POLICY "payments_service_all" ON payments
  FOR ALL USING (auth.role() = 'service_role');

-- Admin puede ver todos los pagos
CREATE POLICY "payments_admin_read" ON payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- 6. Añadir campo mercado_pago_id en subscriptions_config para asociar planes con MP
ALTER TABLE subscriptions_config
ADD COLUMN IF NOT EXISTS mp_plan_id TEXT;   -- ID del plan en MP (para suscripciones recurrentes)

-- ============================================================
-- FUNCIÓN: Actualizar suscripción de usuario tras pago aprobado
-- ============================================================
CREATE OR REPLACE FUNCTION update_user_subscription_after_payment(
  p_user_id uuid,
  p_plan_name TEXT,
  p_billing_period TEXT DEFAULT 'monthly'
)
RETURNS void AS $$
DECLARE
  v_expires_at TIMESTAMPTZ;
BEGIN
  -- Calcular fecha de expiración
  IF p_billing_period = 'yearly' THEN
    v_expires_at := NOW() + INTERVAL '1 year';
  ELSE
    v_expires_at := NOW() + INTERVAL '1 month';
  END IF;

  -- Actualizar perfil del usuario
  UPDATE profiles
  SET
    subscription_plan = p_plan_name,
    subscription_status = 'active',
    subscription_expires_at = v_expires_at,
    updated_at = NOW()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Dar permisos al service_role para llamar la función
GRANT EXECUTE ON FUNCTION update_user_subscription_after_payment(uuid, TEXT, TEXT)
  TO service_role;

-- ============================================================
-- VISTA: Resumen de pagos para el admin
-- Nota: el email vive en auth.users, no en profiles
-- ============================================================
CREATE OR REPLACE VIEW admin_payments_summary AS
SELECT
  p.id,
  p.created_at,
  p.amount,
  p.currency,
  p.status,
  p.plan_name,
  p.billing_period,
  p.payment_method,
  p.mp_payment_id,
  pr.full_name AS agent_name,
  u.email      AS agent_email
FROM payments p
LEFT JOIN profiles  pr ON pr.id = p.user_id
LEFT JOIN auth.users u  ON u.id  = p.user_id
ORDER BY p.created_at DESC;

-- Dar acceso a admins a la vista
GRANT SELECT ON admin_payments_summary TO authenticated;
