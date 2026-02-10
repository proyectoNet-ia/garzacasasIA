-- ============================================================================
-- PROPERTY ANALYTICS & TRACKING SYSTEM
-- ============================================================================
-- This migration creates tables to track property views, interactions, and agent performance

-- 1. Property Views Table
CREATE TABLE IF NOT EXISTS public.property_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    session_id TEXT, -- Anonymous tracking via browser fingerprint or session
    ip_address TEXT,
    user_agent TEXT,
    referrer TEXT,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Property Interactions Table (WhatsApp clicks, phone calls, etc.)
CREATE TABLE IF NOT EXISTS public.property_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    interaction_type TEXT NOT NULL CHECK (interaction_type IN ('whatsapp_click', 'phone_click', 'email_click', 'share', 'favorite', 'compare_add')),
    session_id TEXT,
    ip_address TEXT,
    metadata JSONB DEFAULT '{}'::jsonb, -- Additional context (e.g., device type, location)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Agent Performance Summary (Materialized view for quick access)
CREATE TABLE IF NOT EXISTS public.agent_stats_cache (
    agent_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    total_properties INTEGER DEFAULT 0,
    total_views INTEGER DEFAULT 0,
    total_whatsapp_clicks INTEGER DEFAULT 0,
    total_phone_clicks INTEGER DEFAULT 0,
    total_favorites INTEGER DEFAULT 0,
    avg_views_per_property NUMERIC DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_property_views_property_id ON public.property_views(property_id);
CREATE INDEX IF NOT EXISTS idx_property_views_agent_id ON public.property_views(agent_id);
CREATE INDEX IF NOT EXISTS idx_property_views_viewed_at ON public.property_views(viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_property_interactions_property_id ON public.property_interactions(property_id);
CREATE INDEX IF NOT EXISTS idx_property_interactions_agent_id ON public.property_interactions(agent_id);
CREATE INDEX IF NOT EXISTS idx_property_interactions_type ON public.property_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_property_interactions_created_at ON public.property_interactions(created_at DESC);

-- 5. Enable RLS
ALTER TABLE public.property_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_stats_cache ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies

-- Anyone can INSERT views (anonymous tracking)
DROP POLICY IF EXISTS "Anyone can log property views" ON public.property_views;
CREATE POLICY "Anyone can log property views"
ON public.property_views FOR INSERT
WITH CHECK (true);

-- Anyone can INSERT interactions (anonymous tracking)
DROP POLICY IF EXISTS "Anyone can log interactions" ON public.property_interactions;
CREATE POLICY "Anyone can log interactions"
ON public.property_interactions FOR INSERT
WITH CHECK (true);

-- Agents can view their own stats
DROP POLICY IF EXISTS "Agents view own property views" ON public.property_views;
CREATE POLICY "Agents view own property views"
ON public.property_views FOR SELECT
USING (agent_id = auth.uid());

DROP POLICY IF EXISTS "Agents view own interactions" ON public.property_interactions;
CREATE POLICY "Agents view own interactions"
ON public.property_interactions FOR SELECT
USING (agent_id = auth.uid());

DROP POLICY IF EXISTS "Agents view own stats cache" ON public.agent_stats_cache;
CREATE POLICY "Agents view own stats cache"
ON public.agent_stats_cache FOR SELECT
USING (agent_id = auth.uid());

-- Admins have full access
DROP POLICY IF EXISTS "Admin Full Access Views" ON public.property_views;
CREATE POLICY "Admin Full Access Views"
ON public.property_views FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

DROP POLICY IF EXISTS "Admin Full Access Interactions" ON public.property_interactions;
CREATE POLICY "Admin Full Access Interactions"
ON public.property_interactions FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

DROP POLICY IF EXISTS "Admin Full Access Stats Cache" ON public.agent_stats_cache;
CREATE POLICY "Admin Full Access Stats Cache"
ON public.agent_stats_cache FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- 7. Function to refresh agent stats cache
CREATE OR REPLACE FUNCTION refresh_agent_stats_cache(target_agent_id UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.agent_stats_cache (
        agent_id,
        total_properties,
        total_views,
        total_whatsapp_clicks,
        total_phone_clicks,
        total_favorites,
        avg_views_per_property,
        last_updated
    )
    SELECT
        target_agent_id,
        (SELECT COUNT(*) FROM public.properties WHERE agent_id = target_agent_id AND status = 'active'),
        (SELECT COUNT(*) FROM public.property_views WHERE agent_id = target_agent_id),
        (SELECT COUNT(*) FROM public.property_interactions WHERE agent_id = target_agent_id AND interaction_type = 'whatsapp_click'),
        (SELECT COUNT(*) FROM public.property_interactions WHERE agent_id = target_agent_id AND interaction_type = 'phone_click'),
        (SELECT COUNT(*) FROM public.property_interactions WHERE agent_id = target_agent_id AND interaction_type = 'favorite'),
        COALESCE(
            (SELECT COUNT(*)::NUMERIC / NULLIF(COUNT(DISTINCT property_id), 0)
             FROM public.property_views
             WHERE agent_id = target_agent_id),
            0
        ),
        NOW()
    ON CONFLICT (agent_id) DO UPDATE SET
        total_properties = EXCLUDED.total_properties,
        total_views = EXCLUDED.total_views,
        total_whatsapp_clicks = EXCLUDED.total_whatsapp_clicks,
        total_phone_clicks = EXCLUDED.total_phone_clicks,
        total_favorites = EXCLUDED.total_favorites,
        avg_views_per_property = EXCLUDED.avg_views_per_property,
        last_updated = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Comments
COMMENT ON TABLE public.property_views IS 'Tracks every time a property is viewed';
COMMENT ON TABLE public.property_interactions IS 'Tracks user interactions with properties (clicks, favorites, etc.)';
COMMENT ON TABLE public.agent_stats_cache IS 'Cached aggregated statistics for agent performance';
COMMENT ON FUNCTION refresh_agent_stats_cache IS 'Refreshes the cached statistics for a specific agent';
