-- Temporary policy for development: Allow anyone to update settings
-- WARNING: Delete this before going to production
CREATE POLICY "Allow anonymous updates for dev" 
ON public.site_settings 
FOR UPDATE 
USING (true) 
WITH CHECK (true);

-- Also allow anonymous insert for those starting fresh
CREATE POLICY "Allow anonymous insert for dev" 
ON public.site_settings 
FOR INSERT 
WITH CHECK (true);
