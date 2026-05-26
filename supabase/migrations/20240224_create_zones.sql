-- Create zones table
CREATE TABLE IF NOT EXISTS public.zones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    full_name TEXT,
    description TEXT,
    image_url TEXT,
    appreciation TEXT DEFAULT '0%',
    properties_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.zones ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public zones are viewable by everyone" 
ON public.zones FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage zones" 
ON public.zones FOR ALL 
USING (auth.jwt() ->> 'role' = 'admin');

-- Function to sync zone property counts
CREATE OR REPLACE FUNCTION public.sync_zone_counts()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.zones
    SET properties_count = (
        SELECT count(*) 
        FROM public.properties 
        WHERE location ILIKE '%' || public.zones.name || '%'
        AND status = 'active'
    );
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to sync counts when properties change
CREATE TRIGGER tr_sync_zone_counts
AFTER INSERT OR UPDATE OR DELETE ON public.properties
FOR EACH STATEMENT EXECUTE FUNCTION public.sync_zone_counts();
