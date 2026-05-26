-- ============================================================================
-- MIGRACIONES CONSOLIDADAS - GARZA CASAS IA
-- ============================================================================
-- Este archivo contiene todas las migraciones pendientes en orden secuencial.
-- Ejecutar todo de una vez en Supabase SQL Editor.
-- Fecha: 2026-02-09
-- ============================================================================

-- ============================================================================
-- MIGRACIÓN 1: DUAL DASHBOARD ROLES
-- ============================================================================
-- Agrega soporte para roles (admin/agent) y planes ilimitados

-- Agregar columna 'role' a profiles si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'role'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'agent';
    END IF;
END $$;

-- Agregar columna 'is_unlimited' a profiles si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'is_unlimited'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN is_unlimited BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Agregar constraint para validar roles
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'valid_role'
    ) THEN
        ALTER TABLE public.profiles 
        ADD CONSTRAINT valid_role CHECK (role IN ('admin', 'agent'));
    END IF;
END $$;

-- Crear índice para búsquedas por rol
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Comentarios para documentación
COMMENT ON COLUMN public.profiles.role IS 'User role: admin (unlimited access) or agent (subscription-based)';
COMMENT ON COLUMN public.profiles.is_unlimited IS 'Override subscription limits (for special cases or admin testing)';

-- ============================================================================
-- MIGRACIÓN 2: CMS SITE SETTINGS
-- ============================================================================
-- Crea tabla para gestión de contenido del sitio (Hero, SEO, Redes Sociales)

-- Crear tabla site_settings
CREATE TABLE IF NOT EXISTS public.site_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    
    -- Hero Section
    hero_title TEXT,
    hero_subtitle TEXT,
    hero_image_url TEXT,
    
    -- Site Branding
    site_icon_url TEXT,
    site_name TEXT DEFAULT 'Garza Casas IA',
    
    -- Social Media
    social_facebook TEXT,
    social_instagram TEXT,
    social_linkedin TEXT,
    social_twitter TEXT,
    social_youtube TEXT,
    
    -- SEO
    seo_title TEXT,
    seo_description TEXT,
    seo_keywords TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure only one row exists
    CONSTRAINT single_row_check CHECK (id = 1)
);

-- Insertar valores por defecto
INSERT INTO public.site_settings (
    id,
    hero_title,
    hero_subtitle,
    hero_image_url,
    site_name,
    seo_title,
    seo_description,
    seo_keywords
) VALUES (
    1,
    'Encuentra tu hogar ideal en Monterrey',
    'Descubre las mejores propiedades con ayuda de inteligencia artificial',
    'https://images.unsplash.com/photo-1582407947304-fd86f028f716?q=80&w=1600&auto=format&fit=crop',
    'Garza Casas IA',
    'Garza Casas IA - Encuentra tu hogar ideal en Monterrey',
    'Plataforma inmobiliaria con inteligencia artificial para encontrar las mejores propiedades en Monterrey y área metropolitana',
    'casas monterrey, bienes raíces, propiedades, IA, inteligencia artificial, real estate'
) ON CONFLICT (id) DO NOTHING;

-- Crear storage bucket para site assets (hero images, icons, etc.)
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-assets', 'site-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Habilitar RLS en site_settings
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Permitir lectura pública de site settings
DROP POLICY IF EXISTS "Public read access for site settings" ON public.site_settings;
CREATE POLICY "Public read access for site settings"
ON public.site_settings FOR SELECT
USING (true);

-- Solo admins pueden actualizar site settings
DROP POLICY IF EXISTS "Admin update access for site settings" ON public.site_settings;
CREATE POLICY "Admin update access for site settings"
ON public.site_settings FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role = 'admin'
    )
);

-- Políticas de storage para site-assets
DROP POLICY IF EXISTS "Public read access for site assets" ON storage.objects;
CREATE POLICY "Public read access for site assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'site-assets');

DROP POLICY IF EXISTS "Admin upload access for site assets" ON storage.objects;
CREATE POLICY "Admin upload access for site assets"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'site-assets' AND
    auth.role() = 'authenticated'
);

DROP POLICY IF EXISTS "Admin update access for site assets" ON storage.objects;
CREATE POLICY "Admin update access for site assets"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'site-assets' AND
    auth.role() = 'authenticated'
);

DROP POLICY IF EXISTS "Admin delete access for site assets" ON storage.objects;
CREATE POLICY "Admin delete access for site assets"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'site-assets' AND
    auth.role() = 'authenticated'
);

-- Crear índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_site_settings_id ON public.site_settings(id);

-- Comentarios para documentación
COMMENT ON TABLE public.site_settings IS 'Global site configuration and CMS content';
COMMENT ON COLUMN public.site_settings.hero_title IS 'Main title displayed on hero banner';
COMMENT ON COLUMN public.site_settings.hero_subtitle IS 'Subtitle displayed on hero banner';
COMMENT ON COLUMN public.site_settings.hero_image_url IS 'Background image URL for hero banner';
COMMENT ON COLUMN public.site_settings.site_icon_url IS 'Site favicon/logo URL';

-- ============================================================================
-- MIGRACIÓN 3: PRODUCTION RLS POLICIES
-- ============================================================================
-- Implementa políticas de seguridad estrictas para producción

-- ============================================================================
-- 1. SITE SETTINGS - Solo lectura pública, solo admins pueden modificar
-- ============================================================================

-- Eliminar políticas de desarrollo si existen
DROP POLICY IF EXISTS "Enable all access for development" ON public.site_settings;
DROP POLICY IF EXISTS "Dev Full Access" ON public.site_settings;

-- Las políticas ya fueron creadas en la migración anterior, solo verificamos

-- ============================================================================
-- 2. PROFILES - Usuarios solo pueden ver/editar su propio perfil
-- ============================================================================

-- Eliminar políticas de desarrollo
DROP POLICY IF EXISTS "Enable all access for development" ON public.profiles;
DROP POLICY IF EXISTS "Dev Full Access" ON public.profiles;

-- Lectura pública de perfiles de agentes (para mostrar en propiedades)
DROP POLICY IF EXISTS "Public View Agent Profiles" ON public.profiles;
CREATE POLICY "Public View Agent Profiles"
ON public.profiles FOR SELECT
USING (role = 'agent');

-- Usuarios pueden ver su propio perfil
DROP POLICY IF EXISTS "Users View Own Profile" ON public.profiles;
CREATE POLICY "Users View Own Profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

-- Usuarios pueden actualizar su propio perfil (excepto role)
DROP POLICY IF EXISTS "Users Update Own Profile" ON public.profiles;
CREATE POLICY "Users Update Own Profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Admins pueden ver todos los perfiles
DROP POLICY IF EXISTS "Admin View All Profiles" ON public.profiles;
CREATE POLICY "Admin View All Profiles"
ON public.profiles FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Admins pueden actualizar cualquier perfil (incluyendo roles)
DROP POLICY IF EXISTS "Admin Update All Profiles" ON public.profiles;
CREATE POLICY "Admin Update All Profiles"
ON public.profiles FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- ============================================================================
-- 3. PROPERTIES - Público ve activas, agentes gestionan las suyas, admins todo
-- ============================================================================

-- Eliminar políticas de desarrollo
DROP POLICY IF EXISTS "Enable all access for development" ON public.properties;
DROP POLICY IF EXISTS "Dev Full Access" ON public.properties;

-- Lectura pública de propiedades activas
DROP POLICY IF EXISTS "Public View Active Properties" ON public.properties;
CREATE POLICY "Public View Active Properties"
ON public.properties FOR SELECT
USING (status = 'active');

-- Agentes pueden ver todas sus propiedades
DROP POLICY IF EXISTS "Agents View Own Properties" ON public.properties;
CREATE POLICY "Agents View Own Properties"
ON public.properties FOR SELECT
USING (auth.uid() = agent_id);

-- Agentes pueden crear sus propias propiedades
DROP POLICY IF EXISTS "Agents Create Own Properties" ON public.properties;
CREATE POLICY "Agents Create Own Properties"
ON public.properties FOR INSERT
WITH CHECK (auth.uid() = agent_id);

-- Agentes pueden actualizar sus propias propiedades
DROP POLICY IF EXISTS "Agents Update Own Properties" ON public.properties;
CREATE POLICY "Agents Update Own Properties"
ON public.properties FOR UPDATE
USING (auth.uid() = agent_id)
WITH CHECK (auth.uid() = agent_id);

-- Agentes pueden eliminar sus propias propiedades
DROP POLICY IF EXISTS "Agents Delete Own Properties" ON public.properties;
CREATE POLICY "Agents Delete Own Properties"
ON public.properties FOR DELETE
USING (auth.uid() = agent_id);

-- Admins tienen acceso completo a todas las propiedades
DROP POLICY IF EXISTS "Admin Full Access Properties" ON public.properties;
CREATE POLICY "Admin Full Access Properties"
ON public.properties FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- ============================================================================
-- 4. SUBSCRIPTIONS_CONFIG - Solo admins pueden modificar
-- ============================================================================

-- Eliminar políticas de desarrollo
DROP POLICY IF EXISTS "Enable all access for development" ON public.subscriptions_config;
DROP POLICY IF EXISTS "Dev Full Access" ON public.subscriptions_config;

-- Lectura pública de planes (para mostrar en página de pricing)
DROP POLICY IF EXISTS "Public Read Subscription Plans" ON public.subscriptions_config;
CREATE POLICY "Public Read Subscription Plans"
ON public.subscriptions_config FOR SELECT
USING (true);

-- Solo admins pueden modificar planes
DROP POLICY IF EXISTS "Admin Manage Subscription Plans" ON public.subscriptions_config;
CREATE POLICY "Admin Manage Subscription Plans"
ON public.subscriptions_config FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- ============================================================================
-- 5. STORAGE BUCKETS - Control de acceso a imágenes
-- ============================================================================

-- BUCKET: properties (imágenes de propiedades)
-- Lectura pública
DROP POLICY IF EXISTS "Public Read Properties Images" ON storage.objects;
CREATE POLICY "Public Read Properties Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'properties');

-- Solo propietarios pueden subir/actualizar/eliminar
DROP POLICY IF EXISTS "Agents Manage Own Property Images" ON storage.objects;
CREATE POLICY "Agents Manage Own Property Images"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'properties' AND
    auth.role() = 'authenticated'
);

DROP POLICY IF EXISTS "Agents Update Own Property Images" ON storage.objects;
CREATE POLICY "Agents Update Own Property Images"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'properties' AND
    auth.role() = 'authenticated'
);

DROP POLICY IF EXISTS "Agents Delete Own Property Images" ON storage.objects;
CREATE POLICY "Agents Delete Own Property Images"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'properties' AND
    auth.role() = 'authenticated'
);

-- Las políticas de site-assets ya fueron creadas en la migración 2

-- ============================================================================
-- VERIFICACIÓN FINAL
-- ============================================================================

-- Verificar que RLS está habilitado en todas las tablas críticas
DO $$
BEGIN
    -- Habilitar RLS si no está habilitado
    ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.subscriptions_config ENABLE ROW LEVEL SECURITY;
    
    RAISE NOTICE '✅ RLS habilitado en todas las tablas críticas';
END $$;

-- ============================================================================
-- FIN DE MIGRACIONES
-- ============================================================================

-- Mostrar resumen de políticas creadas
SELECT 
    schemaname,
    tablename,
    policyname,
    CASE 
        WHEN cmd = 'SELECT' THEN '🔍 SELECT'
        WHEN cmd = 'INSERT' THEN '➕ INSERT'
        WHEN cmd = 'UPDATE' THEN '✏️ UPDATE'
        WHEN cmd = 'DELETE' THEN '🗑️ DELETE'
        WHEN cmd = '*' THEN '🔓 ALL'
    END as command
FROM pg_policies 
WHERE tablename IN ('site_settings', 'profiles', 'properties', 'subscriptions_config')
ORDER BY tablename, policyname;

-- ============================================================================
-- MIGRACIÓN CRÍTICA: CAMPOS DE PERFIL DE AGENTE
-- ============================================================================
-- Agrega campos necesarios para información de contacto del agente
-- IMPORTANTE: Esta migración debe ejecutarse para que funcione FeaturedProperties

-- Agregar campos de perfil de agente
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS whatsapp TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT;

-- Agregar índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_company ON public.profiles(company_name);

-- Establecer valores por defecto para agentes existentes
UPDATE public.profiles 
SET company_name = 'Independiente' 
WHERE company_name IS NULL AND role = 'agent';

-- Comentarios de documentación
COMMENT ON COLUMN public.profiles.phone IS 'Agent phone number for contact';
COMMENT ON COLUMN public.profiles.whatsapp IS 'Agent WhatsApp number (can be same as phone)';
COMMENT ON COLUMN public.profiles.avatar_url IS 'URL to agent profile picture';
COMMENT ON COLUMN public.profiles.company_name IS 'Real estate company or agency name';
COMMENT ON COLUMN public.profiles.bio IS 'Agent biography or description';

-- ============================================================================
-- ✅ MIGRACIONES COMPLETADAS
-- ============================================================================
SELECT '✅ Todas las migraciones se han aplicado correctamente' as status;
