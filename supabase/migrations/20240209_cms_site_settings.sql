-- Create site_settings table for CMS content management
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

-- Insert default values
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


-- Create storage bucket for site assets (hero images, icons, etc.)
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-assets', 'site-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to site-assets
CREATE POLICY "Public read access for site assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'site-assets');

-- Allow authenticated users (admins) to upload site assets
CREATE POLICY "Admin upload access for site assets"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'site-assets');

-- Allow authenticated users (admins) to update site assets
CREATE POLICY "Admin update access for site assets"
ON storage.objects FOR UPDATE
USING (bucket_id = 'site-assets');

-- Allow authenticated users (admins) to delete site assets
CREATE POLICY "Admin delete access for site assets"
ON storage.objects FOR DELETE
USING (bucket_id = 'site-assets');

-- Add RLS policies for site_settings table
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access to site settings
CREATE POLICY "Public read access for site settings"
ON public.site_settings FOR SELECT
USING (true);

-- Allow only admins to update site settings
CREATE POLICY "Admin update access for site settings"
ON public.site_settings FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role = 'admin'
    )
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_site_settings_id ON public.site_settings(id);

-- Add comments for documentation
COMMENT ON TABLE public.site_settings IS 'Global site configuration and CMS content';
COMMENT ON COLUMN public.site_settings.hero_title IS 'Main title displayed on hero banner';
COMMENT ON COLUMN public.site_settings.hero_subtitle IS 'Subtitle displayed on hero banner';
COMMENT ON COLUMN public.site_settings.hero_image_url IS 'Background image URL for hero banner';
COMMENT ON COLUMN public.site_settings.site_icon_url IS 'Site favicon/logo URL';
