-- Ensure the subscriptions_config table exists
CREATE TABLE IF NOT EXISTS public.subscriptions_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    monthly_price NUMERIC DEFAULT 0,
    yearly_price NUMERIC DEFAULT 0,
    features JSONB DEFAULT '[]'::jsonb,
    priority INTEGER DEFAULT 1,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_subscription_name UNIQUE (name)
);

-- Ensure necessary columns exist in subscriptions_config
ALTER TABLE public.subscriptions_config ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 1;
ALTER TABLE public.subscriptions_config ADD COLUMN IF NOT EXISTS description TEXT;

-- Update or insert initial subscription tiers
INSERT INTO public.subscriptions_config (name, monthly_price, yearly_price, priority, description, features)
VALUES 
('Gratis', 0, 0, 1, 'Ideal para agentes individuales que están empezando.', '["Hasta 5 propiedades", "3 imágenes por propiedad", "Dashboard básico", "Soporte vía email"]'),
('Pro', 599, 5990, 2, 'Potencia tu presencia con herramientas de IA.', '["Hasta 50 propiedades", "15 imágenes por propiedad", "Análisis de mercado IA", "Soporte VIP 24/7"]'),
('Enterprise', 2500, 25000, 3, 'Soluciones a medida para grandes inmobiliarias.', '["Propiedades ilimitadas", "Galerías 4K", "API de integración", "Account Manager dedicado"]')
ON CONFLICT (name) DO UPDATE SET 
    monthly_price = EXCLUDED.monthly_price,
    yearly_price = EXCLUDED.yearly_price,
    priority = EXCLUDED.priority,
    description = EXCLUDED.description,
    features = EXCLUDED.features;

-- Ensure properties table and all columns exist with correct types
CREATE TABLE IF NOT EXISTS public.properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS price NUMERIC DEFAULT 0;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS property_type TEXT DEFAULT 'Casa';
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS priority_tier INTEGER DEFAULT 1;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS main_image_url TEXT;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS agent_id UUID;

-- Force correct types
ALTER TABLE public.properties ALTER COLUMN title TYPE TEXT;
ALTER TABLE public.properties ALTER COLUMN location TYPE TEXT;
ALTER TABLE public.properties ALTER COLUMN description TYPE TEXT;
ALTER TABLE public.properties ALTER COLUMN features TYPE JSONB USING features::jsonb;

-- Create index for sorting
CREATE INDEX IF NOT EXISTS idx_properties_priority_date ON public.properties (priority_tier DESC, created_at DESC);

-- Seed 30 properties with exactly 9 columns each
INSERT INTO public.properties (title, description, price, location, property_type, status, priority_tier, main_image_url, features)
VALUES
('Residencia de Lujo en San Pedro', 'Exclusiva propiedad con acabados de mármol.', 45000000, 'San Pedro Garza García', 'Casa', 'active', 3, 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=1200', '{"beds": 5, "baths": 6, "sqft": 850}'::jsonb),
('Penthouse The Metropolitan', 'Vistas panorámicas 360.', 28000000, 'Valle Oriente, SPGG', 'Departamento', 'active', 3, 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200', '{"beds": 3, "baths": 3.5, "sqft": 420}'::jsonb),
('Mansión en Sierra Alta', 'Estilo contemporáneo al pie de la montaña.', 32000000, 'Carretera Nacional', 'Casa', 'active', 3, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200', '{"beds": 4, "baths": 5, "sqft": 680}'::jsonb),
('Villa Toscana Residencial', 'Arquitectura clásica y amplios jardines.', 18000000, 'Zona Las Estancias', 'Casa', 'active', 3, 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1200', '{"beds": 4, "baths": 4, "sqft": 520}'::jsonb),
('Loft en Barrio Antiguo', 'Único en su tipo, techos doble altura.', 8500000, 'Centro Monterrey', 'Departamento', 'active', 3, 'https://images.unsplash.com/photo-1515263487990-61b07816b324?q=80&w=1200', '{"beds": 1, "baths": 1.5, "sqft": 180}'::jsonb),
('Mansión de Vidrio en Chipinque', 'Diseño minimalista con vistas a la Sierra Madre.', 55000000, 'Chipinque, San Pedro', 'Casa', 'active', 3, 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?q=80&w=1200', '{"beds": 6, "baths": 7, "sqft": 920}'::jsonb),
('Loft Ejecutivo Valle Campestre', 'Equipado con domótica y acabados de lujo.', 12000000, 'Campestre, San Pedro', 'Departamento', 'active', 3, 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1200', '{"beds": 2, "baths": 2, "sqft": 145}'::jsonb),
('Penthouse en Highpark', 'Diseño icónico y servicios tipo hotel.', 19500000, 'San Pedro Garza García', 'Departamento', 'active', 3, 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=1200', '{"beds": 3, "baths": 4, "sqft": 380}'::jsonb),
('Casa Minimalista en Vía Cordillera', 'Cerca de cañones y zonas recreativas.', 11200000, 'Santa Catarina, NL', 'Casa', 'active', 3, 'https://images.unsplash.com/photo-1513584684374-8bdb7489feef?q=80&w=1200', '{"beds": 3, "baths": 3.5, "sqft": 410}'::jsonb),
('Casa Contemporánea en Cumbres', 'Excelente ubicación cerca de colegios.', 5800000, 'Cumbres 5to Sector', 'Casa', 'active', 2, 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1200', '{"beds": 3, "baths": 2.5, "sqft": 250}'::jsonb),
('Departamento en Colinas', 'Ideal para ejecutivos.', 3200000, 'San Jerónimo', 'Departamento', 'active', 2, 'https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=1200', '{"beds": 2, "baths": 2, "sqft": 120}'::jsonb),
('Casa con Alberca en Contry', 'Área social de gran tamaño.', 12500000, 'Contry La Silla', 'Casa', 'active', 2, 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?q=80&w=1200', '{"beds": 4, "baths": 4.5, "sqft": 450}'::jsonb),
('Moderno Depa en Tec', 'Zona de alta rentabilidad.', 4500000, 'Zona Tec, Monterrey', 'Departamento', 'active', 2, 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1200', '{"beds": 2, "baths": 2, "sqft": 95}'::jsonb),
('Residencia en Privada Leones', 'Seguridad 24/7.', 6900000, 'Dominio Cumbres', 'Casa', 'active', 2, 'https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?q=80&w=1200', '{"beds": 3, "baths": 3, "sqft": 280}'::jsonb),
('Residencia Campestre en Santiago', 'Terreno de 5000m2 con casa principal.', 14500000, 'Santiago, NL', 'Casa', 'active', 2, 'https://images.unsplash.com/photo-1500076656116-558758c991c1?q=80&w=1200', '{"beds": 4, "baths": 4, "sqft": 350}'::jsonb),
('Propiedad en Portal del Norte', 'Zona de alta plusvalía.', 7800000, 'Zuazua, NL', 'Casa', 'active', 2, 'https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?q=80&w=1200', '{"beds": 3, "baths": 3, "sqft": 310}'::jsonb),
('Inversión en Mitras Centro', 'Para oficinas o consultorios.', 4200000, 'Monterrey Centro', 'Casa', 'active', 2, 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=1200', '{"beds": 3, "baths": 2, "sqft": 220}'::jsonb),
('Terreno Residencial La Toscana', 'Listo para construir.', 8900000, 'Monterrey Sur', 'Terreno', 'active', 2, 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1200', '{"sqft": 450}'::jsonb),
('Depa Loft en Paseo Santa Lucía', 'Frente al emblemático paseo.', 3800000, 'Monterrey Centro', 'Departamento', 'active', 2, 'https://images.unsplash.com/photo-1545324418-f1d3ac157304?q=80&w=1200', '{"beds": 1, "baths": 1, "sqft": 85}'::jsonb),
('Local Comercial Ave. Juárez', 'Alto flujo peatonal.', 7500000, 'Monterrey Centro', 'Local', 'active', 2, 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?q=80&w=1200', '{"sqft": 120}'::jsonb),
('Penthouse Soho Monterrey', 'Estilo New York.', 6200000, 'Monterrey Centro', 'Departamento', 'active', 2, 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1200', '{"beds": 2, "baths": 2, "sqft": 115}'::jsonb),
('Terreno Comercial en Escobedo', 'Ubicado en avenida principal.', 15000000, 'Escobedo, NL', 'Terreno', 'active', 1, 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1200', '{}'::jsonb),
('Local en Plaza Santa Catarina', 'Punto estratégico.', 2800000, 'Santa Catarina', 'Local', 'active', 1, 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?q=80&w=1200', '{}'::jsonb),
('Casa Duplex en Guadalupe', 'Cerca de transporte.', 1800000, 'Guadalupe, NL', 'Casa', 'active', 1, 'https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?q=80&w=1200', '{}'::jsonb),
('Departamento en Apodaca', 'Ideal inversión.', 1200000, 'Apodaca, NL', 'Departamento', 'active', 1, 'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?q=80&w=1200', '{}'::jsonb),
('Casa en San Nicolás', 'Zona familiar tranquila.', 2950000, 'San Nicolás', 'Casa', 'active', 1, 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=1200', '{}'::jsonb),
('Casa para Remodelar en Obispado', 'Gran potencial histórico.', 5500000, 'Centro, Monterrey', 'Casa', 'active', 1, 'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?q=80&w=1200', '{}'::jsonb),
('Propiedad en San Jerónimo', 'Fácil acceso vial.', 4900000, 'Monterrey West', 'Casa', 'active', 1, 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1200', '{}'::jsonb),
('Estudio en Zona Medicos', 'Ideal para residentes.', 1850000, 'Col. Mitras', 'Departamento', 'active', 1, 'https://images.unsplash.com/photo-1493201481628-6cd50998cc5a?q=80&w=1200', '{}'::jsonb),
('Casa en Zona Solidaridad', 'Escuelas cercanas.', 1100000, 'Monterrey Norte', 'Casa', 'active', 1, 'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?q=80&w=1200', '{}'::jsonb);
