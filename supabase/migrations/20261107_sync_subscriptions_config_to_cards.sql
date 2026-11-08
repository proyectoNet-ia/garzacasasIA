-- Sincroniza los límites técnicos de public.subscriptions_config con las tarjetas vigentes (/admin/packages como única fuente de verdad)
UPDATE public.subscriptions_config
SET
    properties_limit = 3,
    images_per_property = 3,
    features = '["Hasta 3 propiedades", "3 imágenes por propiedad", "Dashboard básico", "Soporte vía email"]'::jsonb
WHERE name = 'Gratis';

UPDATE public.subscriptions_config
SET
    properties_limit = 20,
    images_per_property = 5,
    features = '["Hasta 20 propiedades", "5 imágenes por propiedad", "Análisis de mercado IA", "Soporte VIP 24/7"]'::jsonb
WHERE name = 'Pro';

UPDATE public.subscriptions_config
SET
    properties_limit = 999999,
    images_per_property = 15,
    features = '["Propiedades ilimitadas", "15 imágenes por propiedad", "Análisis de mercado IA", "Soporte VIP 24/7"]'::jsonb
WHERE name = 'Enterprise';
