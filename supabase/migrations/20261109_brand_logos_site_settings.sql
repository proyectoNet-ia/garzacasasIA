-- ==============================================================================
-- CMS Y LOGOTIPOS DE MARCA: CAMPOS DE BASE DE DATOS Y STORAGE BUCKET
-- ==============================================================================

-- 1. Asegurar columnas para logotipos e isotipo/favicon en site_settings
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS logo_on_dark_url TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS logo_on_light_url TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS site_icon_url TEXT;

-- 2. Asegurar existencia del bucket público 'site-assets'
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'site-assets',
    'site-assets',
    true,
    10485760, -- 10 MB
    ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml', 'image/x-icon', 'image/vnd.microsoft.icon']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 3. Políticas de acceso para el bucket 'site-assets'
-- Lectura pública para cualquier usuario/visitante
DROP POLICY IF EXISTS "Public read access for site assets" ON storage.objects;
CREATE POLICY "Public read access for site assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'site-assets');

-- Subida permitida para usuarios autenticados (administradores)
DROP POLICY IF EXISTS "Admin upload access for site assets" ON storage.objects;
CREATE POLICY "Admin upload access for site assets"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'site-assets');

-- Modificación permitida para usuarios autenticados (administradores)
DROP POLICY IF EXISTS "Admin update access for site assets" ON storage.objects;
CREATE POLICY "Admin update access for site assets"
ON storage.objects FOR UPDATE
USING (bucket_id = 'site-assets');

-- Eliminación permitida para usuarios autenticados (administradores)
DROP POLICY IF EXISTS "Admin delete access for site assets" ON storage.objects;
CREATE POLICY "Admin delete access for site assets"
ON storage.objects FOR DELETE
USING (bucket_id = 'site-assets');
