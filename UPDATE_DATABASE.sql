-- 1. Asegurar columnas de geolocalización en propiedades
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS municipio_clave TEXT;

-- 2. Crear tabla de caché para mejorar performance de APIs INEGI
CREATE TABLE IF NOT EXISTS inegi_cache (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  cache_key TEXT UNIQUE NOT NULL,  -- e.g. "denue_19_032_25.6820_-100.3161_500"
  data JSONB NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para limpieza rápida de caché expirado
CREATE INDEX IF NOT EXISTS idx_inegi_cache_expires ON inegi_cache(expires_at);

-- 3. Comentario informativo
COMMENT ON COLUMN properties.municipio_clave IS 'Clave oficial del INEGI (Estado+Municipio, e.g. 19039 para Monterrey)';
COMMENT ON COLUMN properties.latitude IS 'Latitud en formato decimal (e.g. 25.682823)';
COMMENT ON COLUMN properties.longitude IS 'Longitud en formato decimal (e.g. -100.312948)';
