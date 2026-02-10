-- -----------------------------------------------------------------------------
-- Navbar Social & Contact Data Setup
-- This script creates the site_settings table and seeds the contact_config record.
-- -----------------------------------------------------------------------------

-- 1. Create the site_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.site_settings (
    key TEXT PRIMARY KEY,
    value JSONB,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable Row Level Security
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- 3. Set RLS Policies
-- Allow public read access to all settings
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Site settings are viewable by everyone') THEN
        CREATE POLICY "Site settings are viewable by everyone" ON public.site_settings FOR SELECT USING (true);
    END IF;
END $$;

-- Allow only admins to manage settings
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Admins can update site settings') THEN
        CREATE POLICY "Admins can update site settings" ON public.site_settings FOR ALL USING (
            EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
            )
        );
    END IF;
END $$;

-- 4. Seed initial contact data record
INSERT INTO public.site_settings (key, value)
VALUES ('contact_config', '{
    "phone": "+52 (81) 1234 5678",
    "email": "contacto@garzacasas.ia",
    "instagram": "https://instagram.com/garzacasas.ia",
    "facebook": "https://facebook.com/garzacasas.ia",
    "whatsapp": "https://wa.me/528112345678",
    "address": "Monterrey, Nuevo León"
}')
ON CONFLICT (key) DO UPDATE SET 
    value = EXCLUDED.value,
    updated_at = NOW();

-- 5. Seed default hero config (if not already present)
INSERT INTO public.site_settings (key, value)
VALUES ('hero_config', '{
    "title": "Encuentra tu hogar ideal impulsado por IA",
    "subtitle": "La plataforma inteligente que conecta compradores y agentes con análisis de mercado en tiempo real.",
    "image_url": "https://images.unsplash.com/photo-1582407947304-fd86f028f716?q=80&w=1600&auto=format&fit=crop"
}')
ON CONFLICT (key) DO NOTHING;
