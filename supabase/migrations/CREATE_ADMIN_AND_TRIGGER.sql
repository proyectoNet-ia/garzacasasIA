-- ============================================================================
-- CREAR TRIGGER AUTOMÁTICO PARA NUEVOS USUARIOS
-- ============================================================================
-- Este trigger crea automáticamente un perfil cuando se registra un nuevo usuario

-- Función que se ejecuta cuando se crea un nuevo usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuario'),
        'agent', -- Por defecto todos son agentes
        NOW(),
        NOW()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear el trigger (si no existe)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- CREAR USUARIO ADMIN
-- ============================================================================

-- INSTRUCCIONES:
-- 1. Ve a: https://supabase.com/dashboard/project/wcsscjydecukdgzihcsm/auth/users
-- 2. Click en "Add user" → "Create new user"
-- 3. Ingresa:
--    - Email: cliente@garzacasas.com (o el que prefieras)
--    - Password: (una contraseña segura)
--    - Auto Confirm User: ✅ ACTIVADO (muy importante)
-- 4. Click "Create user"
-- 5. COPIA EL UUID del usuario que se creó
-- 6. Ejecuta el siguiente SQL reemplazando 'USER_UUID_AQUI':

-- Convertir usuario en admin
UPDATE public.profiles
SET 
    role = 'admin',
    is_unlimited = true,
    full_name = 'Cliente Admin',
    updated_at = NOW()
WHERE id = 'USER_UUID_AQUI'; -- ⚠️ REEMPLAZAR con el UUID del usuario

-- Verificar que se actualizó correctamente
SELECT 
    id,
    email,
    full_name,
    role,
    is_unlimited,
    created_at
FROM public.profiles
WHERE role = 'admin';

-- ============================================================================
-- ALTERNATIVA: Si prefieres crear el usuario directamente con SQL
-- ============================================================================
-- NOTA: Esta opción solo funciona si tienes acceso directo a auth.users
-- Si no funciona, usa la opción de arriba (crear desde el dashboard)

/*
DO $$
DECLARE
    new_user_id UUID;
    user_email TEXT := 'cliente@garzacasas.com'; -- ⚠️ CAMBIAR
    user_password TEXT := 'TuPassword123!'; -- ⚠️ CAMBIAR (mínimo 8 caracteres)
BEGIN
    -- Verificar si el usuario ya existe
    SELECT id INTO new_user_id
    FROM auth.users
    WHERE email = user_email;

    IF new_user_id IS NULL THEN
        -- Crear nuevo usuario en auth.users
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            confirmation_token,
            email_change,
            email_change_token_new,
            recovery_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            user_email,
            crypt(user_password, gen_salt('bf')),
            NOW(),
            '{"provider":"email","providers":["email"]}',
            '{"full_name":"Cliente Admin"}',
            NOW(),
            NOW(),
            '',
            '',
            '',
            ''
        )
        RETURNING id INTO new_user_id;

        -- El trigger creará automáticamente el perfil como 'agent'
        -- Ahora lo actualizamos a 'admin'
        UPDATE public.profiles
        SET 
            role = 'admin',
            is_unlimited = true,
            full_name = 'Cliente Admin',
            updated_at = NOW()
        WHERE id = new_user_id;

        RAISE NOTICE '✅ Usuario admin creado exitosamente';
        RAISE NOTICE 'Email: %', user_email;
        RAISE NOTICE 'UUID: %', new_user_id;
        RAISE NOTICE 'Password: %', user_password;
    ELSE
        RAISE NOTICE '⚠️ El usuario ya existe con UUID: %', new_user_id;
        
        -- Actualizar a admin si no lo es
        UPDATE public.profiles
        SET 
            role = 'admin',
            is_unlimited = true,
            full_name = 'Cliente Admin',
            updated_at = NOW()
        WHERE id = new_user_id;
        
        RAISE NOTICE '✅ Usuario actualizado a admin';
    END IF;
END $$;

-- Verificar el resultado
SELECT 
    p.id,
    p.email,
    p.full_name,
    p.role,
    p.is_unlimited,
    p.created_at,
    au.email_confirmed_at,
    au.last_sign_in_at
FROM public.profiles p
LEFT JOIN auth.users au ON p.id = au.id
WHERE p.role = 'admin'
ORDER BY p.created_at DESC;
*/
