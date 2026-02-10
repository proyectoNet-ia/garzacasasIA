-- ============================================================================
-- CREAR USUARIO ADMIN INICIAL (SUPER AGENTE)
-- ============================================================================
-- Este script crea el primer usuario administrador del sistema.
-- Ejecutar DESPUÉS de aplicar APPLY_ALL_MIGRATIONS.sql
-- ============================================================================

-- IMPORTANTE: Este script debe ejecutarse MANUALMENTE en Supabase Dashboard
-- porque la creación de usuarios requiere acceso a auth.users

-- ============================================================================
-- OPCIÓN 1: Crear usuario admin desde Supabase Dashboard (RECOMENDADO)
-- ============================================================================

/*
1. Ve a: Authentication → Users en Supabase Dashboard
2. Click en "Add user" → "Create new user"
3. Ingresa:
   - Email: admin@garzacasas.com (o el email que prefieras)
   - Password: (genera una contraseña segura)
   - Auto Confirm User: ✅ (activado)
4. Click "Create user"
5. Copia el UUID del usuario creado
6. Ejecuta el siguiente SQL reemplazando 'USER_UUID_AQUI':
*/

-- Actualizar el perfil del usuario para hacerlo admin
UPDATE public.profiles
SET 
    role = 'admin',
    is_unlimited = true,
    full_name = 'Super Agente',
    updated_at = NOW()
WHERE id = 'USER_UUID_AQUI'; -- ⚠️ REEMPLAZAR con el UUID real del usuario

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
-- OPCIÓN 2: Crear usuario admin via SQL (AVANZADO)
-- ============================================================================

/*
NOTA: Esta opción requiere acceso directo a la tabla auth.users
Solo funciona si tienes permisos de superusuario en PostgreSQL.
Si no funciona, usa la OPCIÓN 1.
*/

-- Insertar usuario en auth.users (requiere permisos especiales)
-- REEMPLAZA los valores entre comillas simples con tus datos

DO $$
DECLARE
    new_user_id UUID;
    user_email TEXT := 'admin@garzacasas.com'; -- ⚠️ CAMBIAR
    user_password TEXT := 'Admin123!'; -- ⚠️ CAMBIAR (mínimo 8 caracteres)
BEGIN
    -- Verificar si el usuario ya existe
    SELECT id INTO new_user_id
    FROM auth.users
    WHERE email = user_email;

    IF new_user_id IS NULL THEN
        -- Crear nuevo usuario
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            recovery_sent_at,
            last_sign_in_at,
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
            crypt(user_password, gen_salt('bf')), -- Encriptar password
            NOW(), -- Email confirmado automáticamente
            NOW(),
            NOW(),
            '{"provider":"email","providers":["email"]}',
            '{}',
            NOW(),
            NOW(),
            '',
            '',
            '',
            ''
        )
        RETURNING id INTO new_user_id;

        -- Crear perfil de admin
        INSERT INTO public.profiles (
            id,
            email,
            full_name,
            role,
            is_unlimited,
            created_at,
            updated_at
        ) VALUES (
            new_user_id,
            user_email,
            'Super Agente',
            'admin',
            true,
            NOW(),
            NOW()
        );

        RAISE NOTICE '✅ Usuario admin creado exitosamente';
        RAISE NOTICE 'Email: %', user_email;
        RAISE NOTICE 'UUID: %', new_user_id;
    ELSE
        RAISE NOTICE '⚠️ El usuario ya existe con UUID: %', new_user_id;
        
        -- Actualizar a admin si no lo es
        UPDATE public.profiles
        SET 
            role = 'admin',
            is_unlimited = true,
            full_name = 'Super Agente',
            updated_at = NOW()
        WHERE id = new_user_id;
        
        RAISE NOTICE '✅ Usuario actualizado a admin';
    END IF;
END $$;

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================

-- Ver todos los usuarios admin
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

-- ============================================================================
-- CREDENCIALES DE ACCESO
-- ============================================================================

/*
Después de ejecutar este script, podrás iniciar sesión con:

📧 Email: admin@garzacasas.com (o el que configuraste)
🔑 Password: Admin123! (o el que configuraste)

🔗 URL de Login: http://localhost:3000/login

⚠️ IMPORTANTE: 
1. Cambia la contraseña inmediatamente después del primer login
2. Guarda las credenciales en un lugar seguro
3. No compartas las credenciales con nadie
*/

-- ============================================================================
-- NOTAS ADICIONALES
-- ============================================================================

/*
CAMBIAR CONTRASEÑA MANUALMENTE:
Si necesitas cambiar la contraseña de un usuario existente:

1. Ve a: Authentication → Users en Supabase Dashboard
2. Busca el usuario
3. Click en los tres puntos (...)
4. Click en "Reset password"
5. Ingresa la nueva contraseña
*/
