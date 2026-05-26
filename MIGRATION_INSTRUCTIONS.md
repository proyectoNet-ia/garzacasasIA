# 🔧 Aplicar Migración de Campos de Perfil de Agente

## ❌ Error Actual
```
column profiles_1.phone does not exist
```

## ✅ Solución

Necesitas agregar los campos de perfil de agente a la tabla `profiles` en tu base de datos de Supabase.

### Opción 1: Usando el SQL Editor de Supabase Dashboard (Recomendado)

1. **Abre tu proyecto en Supabase Dashboard:**
   - Ve a: https://supabase.com/dashboard
   - Selecciona tu proyecto: `wcsscjydecukdgzihcsm`

2. **Navega al SQL Editor:**
   - En el menú lateral, haz clic en "SQL Editor"
   - Haz clic en "New query"

3. **Copia y pega el siguiente SQL:**

```sql
-- Add agent profile fields to profiles table
-- These fields are needed for agent contact information and public profile

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS whatsapp TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_company ON public.profiles(company_name);

-- Update existing profiles with default values if needed
UPDATE public.profiles 
SET company_name = 'Independiente' 
WHERE company_name IS NULL AND role = 'agent';

COMMENT ON COLUMN public.profiles.phone IS 'Agent phone number for contact';
COMMENT ON COLUMN public.profiles.whatsapp IS 'Agent WhatsApp number (can be same as phone)';
COMMENT ON COLUMN public.profiles.avatar_url IS 'URL to agent profile picture';
COMMENT ON COLUMN public.profiles.company_name IS 'Real estate company or agency name';
COMMENT ON COLUMN public.profiles.bio IS 'Agent biography or description';
```

4. **Ejecuta la query:**
   - Haz clic en "Run" o presiona `Ctrl + Enter`
   - Deberías ver un mensaje de éxito

5. **Verifica los cambios:**
   - Ve a "Table Editor" → "profiles"
   - Deberías ver las nuevas columnas: `phone`, `whatsapp`, `avatar_url`, `company_name`, `bio`

### Opción 2: Usando Supabase CLI (Si lo tienes instalado)

```bash
# Instalar Supabase CLI (si no lo tienes)
npm install -g supabase

# Aplicar la migración
supabase db push
```

## 📋 Campos Agregados

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `phone` | TEXT | Número de teléfono del agente |
| `whatsapp` | TEXT | Número de WhatsApp del agente |
| `avatar_url` | TEXT | URL de la foto de perfil |
| `company_name` | TEXT | Nombre de la inmobiliaria o agencia |
| `bio` | TEXT | Biografía o descripción del agente |

## 🔄 Después de Aplicar la Migración

1. **Recarga la página** en tu navegador
2. **Verifica que no haya errores** en la consola
3. **Las propiedades deberían cargar correctamente** con la información del agente

## 📝 Actualizar Perfil de Agente

Después de aplicar la migración, puedes actualizar tu perfil de agente desde el dashboard:

1. Ve a: http://localhost:3000/dashboard/profile
2. Completa los campos de contacto (teléfono, WhatsApp, etc.)
3. Guarda los cambios

---

**Nota:** Esta migración es segura y no afectará los datos existentes. Solo agrega nuevas columnas a la tabla `profiles`.
