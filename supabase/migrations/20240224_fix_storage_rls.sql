-- Final RLS Fix for Storage 'properties' bucket
-- This ensures agents can upload, update and delete their own property images,
-- and the public can view them.

-- 1. Ensure the bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('properties', 'properties', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Drop existing conflicting policies to start fresh
DROP POLICY IF EXISTS "Public View Property Images" ON storage.objects;
DROP POLICY IF EXISTS "Public Read Properties" ON storage.objects;
DROP POLICY IF EXISTS "Agents Upload Property Images" ON storage.objects;
DROP POLICY IF EXISTS "Allow anonymous uploads Properties dev" ON storage.objects;
DROP POLICY IF EXISTS "Allow anonymous updates Properties dev" ON storage.objects;
DROP POLICY IF EXISTS "Allow anonymous delete Properties dev" ON storage.objects;

-- 3. Create Clean, robust policies

-- SELECT: Anyone can view property images
CREATE POLICY "Public View Property Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'properties');

-- INSERT: Authenticated users can upload to 'properties' bucket
CREATE POLICY "Authenticated Users Upload Property Images"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'properties' 
    AND auth.role() = 'authenticated'
);

-- UPDATE: Authenticated users can update images in 'properties' bucket
CREATE POLICY "Authenticated Users Update Property Images"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'properties' 
    AND auth.role() = 'authenticated'
);

-- DELETE: Authenticated users can delete images in 'properties' bucket
CREATE POLICY "Authenticated Users Delete Property Images"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'properties' 
    AND auth.role() = 'authenticated'
);
