-- Add listing_type column to properties table
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS listing_type TEXT DEFAULT 'Venta' CHECK (listing_type IN ('Venta', 'Renta'));

-- Update existing records to have a default value
UPDATE public.properties SET listing_type = 'Venta' WHERE listing_type IS NULL;

-- Add index for performance in searches
CREATE INDEX IF NOT EXISTS idx_properties_listing_type ON public.properties (listing_type);
