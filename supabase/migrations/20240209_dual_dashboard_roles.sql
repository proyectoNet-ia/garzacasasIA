-- Add role and unlimited access columns to profiles
-- This migration enables the dual dashboard architecture (Admin vs Agent)

-- Add role column (admin or agent)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'agent' CHECK (role IN ('admin', 'agent'));

-- Add is_unlimited column for admin (SUPER AGENTE)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_unlimited BOOLEAN DEFAULT false;

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_unlimited ON public.profiles(is_unlimited);

-- Mark all admin users as unlimited
UPDATE public.profiles 
SET is_unlimited = true 
WHERE role = 'admin';

-- Comment for documentation
COMMENT ON COLUMN public.profiles.role IS 'User role: admin (super agent with unlimited access) or agent (regular agent with plan limits)';
COMMENT ON COLUMN public.profiles.is_unlimited IS 'Whether user has unlimited properties and images (true for admins)';
