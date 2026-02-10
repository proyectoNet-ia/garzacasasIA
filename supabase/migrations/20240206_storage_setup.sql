-- Create 'marketing' bucket for assets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('marketing', 'marketing', true)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow public to view images
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'marketing' );

-- Policy to allow anonymous uploads for dev
-- WARNING: Replace with authenticated policies for production
CREATE POLICY "Allow anonymous uploads for dev" 
ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'marketing' );

CREATE POLICY "Allow anonymous updates for dev" 
ON storage.objects FOR UPDATE 
USING ( bucket_id = 'marketing' );
