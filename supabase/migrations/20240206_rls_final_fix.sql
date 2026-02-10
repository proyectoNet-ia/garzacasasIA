-- Comprehensive RLS fix for site_settings (Development Only)
-- This allows anyone (anonymous) to read, insert, and update settings.

-- First, drop existing conflicting policies if they exist (optional but safer)
DROP POLICY IF EXISTS "Allow anonymous updates for dev" ON public.site_settings;
DROP POLICY IF EXISTS "Allow anonymous insert for dev" ON public.site_settings;
DROP POLICY IF EXISTS "Site settings are viewable by everyone" ON public.site_settings;
DROP POLICY IF EXISTS "Admins can update site settings" ON public.site_settings;

-- Create a single "Master" policy for development
CREATE POLICY "Dev Master Access" 
ON public.site_settings 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Ensure RLS is actually enabled (it should be, but let's be sure)
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
