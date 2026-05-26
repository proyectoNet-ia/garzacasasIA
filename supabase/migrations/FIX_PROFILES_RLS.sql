-- Fix for infinite recursion in RLS policies when updating profiles (specifically for Admins)

-- 1. Create a SECURITY DEFINER function to check for admin role
-- This avoids triggering RLS policies on the profiles table recursively
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Drop the recursive policies from public.profiles
DROP POLICY IF EXISTS "Admin CRUD Profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin View All Profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin Update All Profiles" ON public.profiles;
DROP POLICY IF EXISTS "User Update Own Profile" ON public.profiles;
DROP POLICY IF EXISTS "Users Update Own Profile" ON public.profiles;

-- 3. Recreate the policies using the new non-recursive function

-- Admins can do everything
CREATE POLICY "Admin CRUD Profiles" 
ON public.profiles FOR ALL 
USING (public.is_admin());

-- Users can update their own profile
CREATE POLICY "Users Update Own Profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (
    auth.uid() = id 
    AND (
        -- Protect the role column: non-admins cannot change their role
        NOT public.is_admin() 
        OR role = 'admin'
    )
);

-- Note: SELECT policies like "Users View Own Profile" and "Public Read Profiles" 
-- or "Public View Agent Profiles" should already be in place and non-recursive.
