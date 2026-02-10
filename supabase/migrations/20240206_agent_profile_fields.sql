-- Add agent profile fields to profiles table
-- These fields are needed for agent contact information and public profile

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS whatsapp TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_company ON public.profiles(company_name);

-- Update existing profiles with default values if needed
UPDATE public.profiles 
SET company_name = 'Independiente' 
WHERE company_name IS NULL AND role = 'agent';

COMMENT ON COLUMN public.profiles.phone IS 'Agent phone number for contact';
COMMENT ON COLUMN public.profiles.whatsapp IS 'Agent WhatsApp number (can be same as phone)';
COMMENT ON COLUMN public.profiles.avatar_url IS 'URL to agent profile picture';
COMMENT ON COLUMN public.profiles.company_name IS 'Real estate company or agency name';
COMMENT ON COLUMN public.profiles.bio IS 'Agent biography or description';
