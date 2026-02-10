-- FINAL PRODUCTION RLS POLICIES
-- This migration hardens the database for production, removing development shortcuts.

-----------------------------------------------------------
-- 1. SITE SETTINGS (CMS)
-----------------------------------------------------------
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Drop dev policies
DROP POLICY IF EXISTS "Dev Master Access" ON public.site_settings;
DROP POLICY IF EXISTS "Public read access for site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admin update access for site settings" ON public.site_settings;

-- Production Policies
CREATE POLICY "Public Read Settings" ON public.site_settings
FOR SELECT USING (true);

CREATE POLICY "Admin CRUD Settings" ON public.site_settings
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-----------------------------------------------------------
-- 2. PROFILES
-----------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Everyone can see agent profiles (for property listings)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public Read Profiles" ON public.profiles
FOR SELECT USING (true);

-- Users can only update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "User Update Own Profile" ON public.profiles
FOR UPDATE USING (auth.uid() = id)
WITH CHECK (
    auth.uid() = id 
    AND (
        -- Protect the role column: non-admins cannot change their role
        NOT EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        ) 
        OR role = 'admin' -- Admins can update their own role (to admin...)
    )
);

-- Admins can do everything
CREATE POLICY "Admin CRUD Profiles" ON public.profiles
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-----------------------------------------------------------
-- 3. PROPERTIES
-----------------------------------------------------------
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Public can only see active properties
DROP POLICY IF EXISTS "Properties are viewable by everyone" ON public.properties;
CREATE POLICY "Public View Active Properties" ON public.properties
FOR SELECT USING (status = 'active');

-- Agents can see ALL their own properties (even drafts)
CREATE POLICY "Agents View Own Properties" ON public.properties
FOR SELECT USING (auth.uid() = agent_id);

-- Agents can CRUD their own properties
CREATE POLICY "Agents CRUD Own Properties" ON public.properties
FOR ALL USING (auth.uid() = agent_id)
WITH CHECK (auth.uid() = agent_id);

-- Admins can CRUD ALL properties
CREATE POLICY "Admin CRUD All Properties" ON public.properties
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-----------------------------------------------------------
-- 4. SUBSCRIPTIONS CONFIG
-----------------------------------------------------------
ALTER TABLE public.subscriptions_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anonymous read" ON public.subscriptions_config;
CREATE POLICY "Public View Plans" ON public.subscriptions_config
FOR SELECT USING (true);

CREATE POLICY "Admin CRUD Plans" ON public.subscriptions_config
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-----------------------------------------------------------
-- 5. STORAGE POLICIES
-----------------------------------------------------------
-- Note: These policies must be applied via SQL or Dashboard

-- For properties bucket
-- (Assumes bucket 'properties' exists)
CREATE POLICY "Public View Property Images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'properties');

CREATE POLICY "Agents Upload Property Images" 
ON storage.objects FOR INSERT 
WITH CHECK (
    bucket_id = 'properties' 
    AND auth.role() = 'authenticated'
);

-- For site-assets bucket
CREATE POLICY "Public View Site Assets" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'site-assets');

CREATE POLICY "Admin Manage Site Assets" 
ON storage.objects FOR ALL 
USING (
    bucket_id = 'site-assets' 
    AND EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);
