-- Create a bucket for property images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('properties', 'properties', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for public reading
CREATE POLICY "Public Read Properties" ON storage.objects FOR SELECT USING (bucket_id = 'properties');

-- Policies for development (Allow anonymous uploads/updates)
CREATE POLICY "Allow anonymous uploads Properties dev" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'properties');

CREATE POLICY "Allow anonymous updates Properties dev" ON storage.objects 
FOR UPDATE USING (bucket_id = 'properties') WITH CHECK (bucket_id = 'properties');

CREATE POLICY "Allow anonymous delete Properties dev" ON storage.objects 
FOR DELETE USING (bucket_id = 'properties');
