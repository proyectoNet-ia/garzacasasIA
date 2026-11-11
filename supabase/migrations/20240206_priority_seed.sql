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

-- Seed 30 properties with exactly 9 columns each across Mexico
INSERT INTO public.properties (title, description, price, location, property_type, status, priority_tier, main_image_url, features)
VALUES
('Residencia de Lujo en Polanco', 'Exclusiva propiedad con acabados de mármol y arquitectura vanguardista.', 45000000, 'Polanco, Miguel Hidalgo, CDMX', 'Casa', 'active', 3, 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=1200', '{"beds": 5, "baths": 6, "sqft": 850}'::jsonb),
('Penthouse en Puerta de Hierro', 'Vistas panorámicas 360 al skyline tapatío.', 28000000, 'Zapopan, Jalisco', 'Departamento', 'active', 3, 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200', '{"beds": 3, "baths": 3.5, "sqft": 420}'::jsonb),
('Mansión en Juriquilla', 'Estilo contemporáneo con alberca infinity y jardín privado.', 32000000, 'Juriquilla, Querétaro', 'Casa', 'active', 3, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200', '{"beds": 4, "baths": 5, "sqft": 680}'::jsonb),
('Villa Tropical en Aldea Zamá', 'Arquitectura eco-chic integrada a la selva maya.', 18000000, 'Tulum, Quintana Roo', 'Casa', 'active', 3, 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1200', '{"beds": 4, "baths": 4, "sqft": 520}'::jsonb),
('Loft en Roma Norte', 'Único en su tipo, techos doble altura y terraza privada.', 8500000, 'Roma Norte, Cuauhtémoc, CDMX', 'Departamento', 'active', 3, 'https://images.unsplash.com/photo-1515263487990-61b07816b324?q=80&w=1200', '{"beds": 1, "baths": 1.5, "sqft": 180}'::jsonb),
('Mansión de Diseño en Lomas de Chapultepec', 'Diseño minimalista con vistas arboladas.', 55000000, 'Lomas de Chapultepec, CDMX', 'Casa', 'active', 3, 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?q=80&w=1200', '{"beds": 6, "baths": 7, "sqft": 920}'::jsonb),
('Loft Ejecutivo en Providencia', 'Equipado con domótica y acabados de lujo.', 12000000, 'Providencia, Guadalajara, Jalisco', 'Departamento', 'active', 3, 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1200', '{"beds": 2, "baths": 2, "sqft": 145}'::jsonb),
('Penthouse frente al Mar en Marina Vallarta', 'Diseño icónico con muelle y amenidades de resort.', 19500000, 'Puerto Vallarta, Jalisco', 'Departamento', 'active', 3, 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=1200', '{"beds": 3, "baths": 4, "sqft": 380}'::jsonb),
('Casa Minimalista en La Vista Country Club', 'Seguridad máxima y campo de golf profesional.', 11200000, 'San Andrés Cholula, Puebla', 'Casa', 'active', 3, 'https://images.unsplash.com/photo-1513584684374-8bdb7489feef?q=80&w=1200', '{"beds": 3, "baths": 3.5, "sqft": 410}'::jsonb),
('Casa Contemporánea en Zibatá', 'Excelente ubicación con campo de golf y parques.', 5800000, 'El Marqués, Querétaro', 'Casa', 'active', 2, 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1200', '{"beds": 3, "baths": 2.5, "sqft": 250}'::jsonb),
('Departamento en Santa Fe', 'Ideal para ejecutivos con acceso a centros corporativos.', 3200000, 'Cuajimalpa, CDMX', 'Departamento', 'active', 2, 'https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=1200', '{"beds": 2, "baths": 2, "sqft": 120}'::jsonb),
('Casa Colonial con Alberca en Centro de Mérida', 'Techumbres históricas restauradas y amplio jardín tropical.', 12500000, 'Centro, Mérida, Yucatán', 'Casa', 'active', 2, 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?q=80&w=1200', '{"beds": 4, "baths": 4.5, "sqft": 450}'::jsonb),
('Moderno Depa en Angelópolis', 'Zona de alta rentabilidad y vida nocturna.', 4500000, 'Puebla, Puebla', 'Departamento', 'active', 2, 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1200', '{"beds": 2, "baths": 2, "sqft": 95}'::jsonb),
('Residencia en Playacar', 'Seguridad 24/7 y acceso a playa privada.', 6900000, 'Playa del Carmen, Quintana Roo', 'Casa', 'active', 2, 'https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?q=80&w=1200', '{"beds": 3, "baths": 3, "sqft": 280}'::jsonb),
('Residencia Campestre en Avándaro', 'Terreno de 5000m2 con bosque de pinos y chimenea.', 14500000, 'Valle de Bravo, Estado de México', 'Casa', 'active', 2, 'https://images.unsplash.com/photo-1500076656116-558758c991c1?q=80&w=1200', '{"beds": 4, "baths": 4, "sqft": 350}'::jsonb),
('Propiedad en Residencial Campestre', 'Zona de alta plusvalía y campos de golf.', 7800000, 'León, Guanajuato', 'Casa', 'active', 2, 'https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?q=80&w=1200', '{"beds": 3, "baths": 3, "sqft": 310}'::jsonb),
('Inversión en Centro Histórico', 'Para oficinas, hotel boutique o consultorios.', 4200000, 'Querétaro Centro, Querétaro', 'Casa', 'active', 2, 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=1200', '{"beds": 3, "baths": 2, "sqft": 220}'::jsonb),
('Terreno Residencial en Temozón Norte', 'Listo para construir en la zona dorada de Mérida.', 8900000, 'Mérida, Yucatán', 'Terreno', 'active', 2, 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1200', '{"sqft": 450}'::jsonb),
('Depa Loft en La Condesa', 'Frente al Parque México.', 3800000, 'Condesa, Cuauhtémoc, CDMX', 'Departamento', 'active', 2, 'https://images.unsplash.com/photo-1545324418-f1d3ac157304?q=80&w=1200', '{"beds": 1, "baths": 1, "sqft": 85}'::jsonb),
('Local Comercial en Insurgentes Sur', 'Alto flujo peatonal y vehicular.', 7500000, 'Benito Juárez, CDMX', 'Local', 'active', 2, 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?q=80&w=1200', '{"sqft": 120}'::jsonb),
('Penthouse Soho Chapultepec', 'Estilo New York en el corredor cultural.', 6200000, 'Americana, Guadalajara, Jalisco', 'Departamento', 'active', 2, 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1200', '{"beds": 2, "baths": 2, "sqft": 115}'::jsonb),
('Terreno Comercial en Boulevard Riviera Maya', 'Ubicado en avenida principal de alta densidad.', 15000000, 'Cancún, Quintana Roo', 'Terreno', 'active', 1, 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1200', '{}'::jsonb),
('Local en Plaza Paseo Cuernavaca', 'Punto estratégico y comercial.', 2800000, 'Cuernavaca, Morelos', 'Local', 'active', 1, 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?q=80&w=1200', '{}'::jsonb),
('Casa Duplex en Boca del Río', 'Cerca del malecón y centros comerciales.', 1800000, 'Boca del Río, Veracruz', 'Casa', 'active', 1, 'https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?q=80&w=1200', '{}'::jsonb),
('Departamento en Chapultepec Oriente', 'Ideal para inversión de estudiantes o ejecutivos.', 1200000, 'Morelia, Michoacán', 'Departamento', 'active', 1, 'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?q=80&w=1200', '{}'::jsonb),
('Casa en San Mateo Atenco', 'Zona familiar con rápida salida a CDMX.', 2950000, 'Toluca, Estado de México', 'Casa', 'active', 1, 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=1200', '{}'::jsonb),
('Casa para Remodelar en San Ángel', 'Gran potencial histórico y cultural.', 5500000, 'Álvaro Obregón, CDMX', 'Casa', 'active', 1, 'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?q=80&w=1200', '{}'::jsonb),
('Propiedad en Playas de Tijuana', 'Fácil acceso vial y vista hacia la costa.', 4900000, 'Tijuana, Baja California', 'Casa', 'active', 1, 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1200', '{}'::jsonb),
('Estudio en Zona Centro San Miguel', 'Ideal para rentas de corta estancia.', 1850000, 'San Miguel de Allende, Guanajuato', 'Departamento', 'active', 1, 'https://images.unsplash.com/photo-1493201481628-6cd50998cc5a?q=80&w=1200', '{}'::jsonb),
('Casa en Fraccionamiento Las Américas', 'Escuelas y centros comerciales cercanos.', 1100000, 'Mérida, Yucatán', 'Casa', 'active', 1, 'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?q=80&w=1200', '{}'::jsonb);
