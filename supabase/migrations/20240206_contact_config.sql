-- Add contact_config to site_settings
INSERT INTO public.site_settings (key, value)
VALUES ('contact_config', '{
  "phone": "+52 (55) 1234 5678",
  "email": "contacto@garzacasas.ia",
  "instagram": "https://instagram.com/garzacasas.ia",
  "facebook": "https://facebook.com/garzacasas.ia",
  "whatsapp": "https://wa.me/525512345678",
  "address": "Ciudad de México / Cobertura Nacional"
}')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
