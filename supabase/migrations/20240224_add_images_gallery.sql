-- Add images column to properties if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'properties' AND column_name = 'images'
    ) THEN
        ALTER TABLE public.properties ADD COLUMN images JSONB DEFAULT '[]';
    END IF;
END $$;

-- Comment for documentation
COMMENT ON COLUMN public.properties.images IS 'Array of URLs for the property gallery';
