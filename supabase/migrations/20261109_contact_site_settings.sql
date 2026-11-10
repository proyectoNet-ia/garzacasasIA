-- ==============================================================================
-- CMS Y BARRA SUPERIOR: CAMPOS DE CONTACTO EN SITE_SETTINGS
-- ==============================================================================

-- 1. Agregar columnas para teléfono, email y WhatsApp a public.site_settings
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS contact_phone TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS contact_email TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS contact_whatsapp TEXT;

-- 2. Asignar valores por defecto para Garza Casas IA en id = 1
UPDATE public.site_settings
SET 
    contact_phone = COALESCE(contact_phone, '+52 (81) 1234-5678'),
    contact_email = COALESCE(contact_email, 'contacto@garzacasas.com'),
    contact_whatsapp = COALESCE(contact_whatsapp, 'https://wa.me/528112345678')
WHERE id = 1;
