# Guía para crear usuario Admin

## Paso 1: Crear usuario en Supabase

1. Ve a: https://supabase.com/dashboard/project/wcsscjydecukdgzihcsm/auth/users
2. Click en **"Add user"** → **"Create new user"**
3. Ingresa:
   - Email: `cliente@garzacasas.com` (o el email de tu cliente)
   - Password: Una contraseña segura (mínimo 8 caracteres)
   - Auto Confirm User: ✅ Activado
4. Click **"Create user"**
5. **Copia el UUID** del usuario creado

## Paso 2: Convertir usuario en Admin

1. Ve a: https://supabase.com/dashboard/project/wcsscjydecukdgzihcsm/sql/new
2. Pega este código (reemplaza `USER_UUID_AQUI` con el UUID que copiaste):

```sql
-- Actualizar el perfil del usuario para hacerlo admin
UPDATE public.profiles
SET 
    role = 'admin',
    is_unlimited = true,
    full_name = 'Cliente Admin',
    updated_at = NOW()
WHERE id = 'USER_UUID_AQUI';

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
```

3. Click en **"Run"**

## Credenciales de acceso

El cliente podrá iniciar sesión con:
- Email: El que configuraste
- Password: La que configuraste
- URL: https://tudominio.com/login

## Cambios realizados en el CMS

✅ Mejorada la sección de Favicon con:
- Instrucciones claras sobre tamaño recomendado (512x512px o 192x192px)
- Formato recomendado (PNG con fondo transparente)
- Vista previa del favicon actual
- Indicador de estado cuando está configurado
- Actualización automática en tiempo real

El favicon se actualizará automáticamente en todo el sitio cuando el admin lo cambie desde el CMS.
