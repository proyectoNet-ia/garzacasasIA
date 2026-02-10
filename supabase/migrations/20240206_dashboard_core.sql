-- 1. Subscriptions Table
CREATE TABLE public.subscriptions_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    monthly_price NUMERIC DEFAULT 0,
    yearly_price NUMERIC DEFAULT 0,
    features JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Profiles (Extended for Admin/Agents)
-- Assuming Supabase Auth is handled, we link to auth.users
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT DEFAULT 'agent' CHECK (role IN ('admin', 'agent')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending')),
    plan_id UUID REFERENCES public.subscriptions_config(id),
    portfolio_value NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Agent Feedback
CREATE TABLE public.agent_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    asunto TEXT NOT NULL,
    categoria TEXT,
    comentario TEXT NOT NULL,
    analysis_result JSONB DEFAULT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'analyzed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Properties (Refined)
CREATE TABLE public.properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL,
    location TEXT NOT NULL,
    property_type TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold', 'draft')),
    features JSONB DEFAULT '{}'::jsonb,
    main_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Basic (Enable for development bypass or specific policies)
ALTER TABLE public.subscriptions_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Development Policies (Master Bypass for rapid prototyping)
CREATE POLICY "Dev Master Access Subscriptions" ON public.subscriptions_config FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Dev Master Access Profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Dev Master Access Feedback" ON public.agent_feedback FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Dev Master Access Properties" ON public.properties FOR ALL USING (true) WITH CHECK (true);

-- Initial Data
INSERT INTO public.subscriptions_config (name, monthly_price, yearly_price, features)
VALUES 
('Gratis', 0, 0, '{"properties_limit": 5, "images_per_property": 3}'),
('Pro', 29.99, 299.99, '{"properties_limit": 50, "images_per_property": 15, "ai_analysis": true}');
