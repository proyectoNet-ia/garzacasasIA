-- ============================================================================
-- NOTIFICATION SYSTEM - GARZA CASAS IA
-- ============================================================================
-- Crea la infraestructura para notificaciones de usuario (Stats, Planes, etc.)

-- 1. Agregar columna de expiración de plan a profiles
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'plan_expires_at'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN plan_expires_at TIMESTAMPTZ;
    END IF;
END $$;

-- 2. Tabla de notificaciones
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error', 'stats', 'plan')),
    link TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Habilitar RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 4. Políticas de RLS
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 5. Índices para rendimiento
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);

-- 6. Función para enviar notificaciones de expiración de plan
CREATE OR REPLACE FUNCTION public.notify_plan_expiration()
RETURNS trigger AS $$
BEGIN
    -- Si el plan_expires_at se actualiza y es en el futuro cercano, podríamos notificar.
    -- Pero usualmente esto se corre como un CRON o cuando el usuario entra.
    -- Por simplicidad, notificaremos si plan_expires_at cambia a un valor no nulo.
    IF (NEW.plan_expires_at IS NOT NULL AND (OLD.plan_expires_at IS NULL OR NEW.plan_expires_at <> OLD.plan_expires_at)) THEN
        INSERT INTO public.notifications (user_id, title, message, type, link)
        VALUES (
            NEW.id,
            'Plan Actualizado',
            'Tu plan ahora vence el ' || to_char(NEW.plan_expires_at, 'DD/MM/YYYY') || '.',
            'plan',
            '/dashboard/subscription'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Trigger para cambios en el plan
DROP TRIGGER IF EXISTS trigger_notify_plan_change ON public.profiles;
CREATE TRIGGER trigger_notify_plan_change
AFTER UPDATE OF plan_expires_at ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.notify_plan_expiration();

-- Comentarios
COMMENT ON TABLE public.notifications IS 'User notifications for system events, stats, and plans';
