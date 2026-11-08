-- 1. Columna status en profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
UPDATE public.profiles SET status = 'active' WHERE status IS NULL;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_status_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_status_check CHECK (status IN ('active', 'suspended', 'pending'));

-- 2. Preservación contable en payments (ON DELETE SET NULL + snapshots)
ALTER TABLE public.payments ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS agent_name_snapshot TEXT, ADD COLUMN IF NOT EXISTS agent_email_snapshot TEXT;
UPDATE public.payments p SET user_id = NULL WHERE p.user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.profiles pr WHERE pr.id = p.user_id);

-- 3. Actualizar FKs dinámicamente en payments y properties
DO $mig$
DECLARE r RECORD;
BEGIN
    FOR r IN (
        SELECT tc.constraint_name FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public' AND tc.table_name = 'payments' AND kcu.column_name = 'user_id'
    ) LOOP
        EXECUTE format('ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS %I', r.constraint_name);
    END LOOP;
    ALTER TABLE public.payments ADD CONSTRAINT payments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

    UPDATE public.properties prop SET agent_id = NULL WHERE prop.agent_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.profiles pr WHERE pr.id = prop.agent_id);
    FOR r IN (
        SELECT tc.constraint_name FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public' AND tc.table_name = 'properties' AND kcu.column_name = 'agent_id'
    ) LOOP
        EXECUTE format('ALTER TABLE public.properties DROP CONSTRAINT IF EXISTS %I', r.constraint_name);
    END LOOP;
    ALTER TABLE public.properties ADD CONSTRAINT properties_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
END $mig$;

SELECT 'OK: Integridad contable y borrado de agentes aplicados' AS status;
