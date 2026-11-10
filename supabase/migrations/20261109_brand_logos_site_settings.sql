-- Logotipos de marca configurables desde /admin/cms (versión para fondo oscuro y para fondo claro)
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS logo_on_dark_url TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS logo_on_light_url TEXT;
