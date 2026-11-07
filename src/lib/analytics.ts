// Analytics tracking utilities for property views and interactions

import { createClient } from '@/lib/supabase-client'

export const COOKIE_CONSENT_KEY = 'gc_cookie_consent'

export function hasAnalyticsConsent(): boolean {
    if (typeof window === 'undefined') return false
    try {
        return localStorage.getItem(COOKIE_CONSENT_KEY) === 'accepted'
    } catch {
        return false
    }
}

/**
 * Track a property view (gated by explicit cookie consent)
 */
export async function trackPropertyView(propertyId: string, agentId: string) {
    if (!propertyId || !agentId || !hasAnalyticsConsent()) return

    const supabase = createClient()

    try {
        let sessionId = localStorage.getItem('analytics_session_id')
        if (!sessionId) {
            sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
            localStorage.setItem('analytics_session_id', sessionId)
        }

        const { error } = await supabase.from('property_views').insert({
            property_id: propertyId,
            agent_id: agentId,
            session_id: sessionId,
            user_agent: navigator.userAgent,
            referrer: document.referrer || null
        })

        if (error) {
            console.error('Supabase error tracking view:', {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            })
        }
    } catch (error) {
        console.error('Unexpected error tracking property view:', error)
    }
}

/**
 * Track a property interaction (WhatsApp click, phone click, etc. — gated by consent)
 */
export async function trackPropertyInteraction(
    propertyId: string,
    agentId: string,
    interactionType: 'whatsapp_click' | 'phone_click' | 'email_click' | 'share' | 'favorite' | 'compare_add',
    metadata?: Record<string, any>
) {
    if (!propertyId || !agentId || !hasAnalyticsConsent()) return

    const supabase = createClient()

    try {
        let sessionId = localStorage.getItem('analytics_session_id')
        if (!sessionId) {
            sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
            localStorage.setItem('analytics_session_id', sessionId)
        }

        const { error } = await supabase.from('property_interactions').insert({
            property_id: propertyId,
            agent_id: agentId,
            interaction_type: interactionType,
            session_id: sessionId,
            metadata: metadata || {}
        })

        if (error) {
            console.error('Supabase error tracking interaction:', {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            })
        }
    } catch (error) {
        console.error('Unexpected error tracking property interaction:', error)
    }
}

/**
 * Get agent statistics from cache
 */
export async function getAgentStats(agentId: string) {
    const supabase = createClient()

    try {
        const { data, error } = await supabase
            .from('agent_stats_cache')
            .select('*')
            .eq('agent_id', agentId)
            .maybeSingle()

        if (error) {
            console.error('Supabase error fetching agent stats:', {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            })
            return null
        }

        return data
    } catch (error) {
        console.error('Unexpected error fetching agent stats:', error)
        return null
    }
}

/**
 * Refresh agent statistics cache
 */
export async function refreshAgentStats(agentId: string) {
    const supabase = createClient()

    try {
        const { error } = await supabase.rpc('refresh_agent_stats_cache', {
            target_agent_id: agentId
        })

        if (error) {
            console.error('Supabase error refreshing stats:', {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            })
        }
    } catch (error) {
        console.error('Unexpected error refreshing agent stats:', error)
    }
}

/**
 * Get detailed property analytics for a specific property
 */
export async function getPropertyAnalytics(propertyId: string) {
    const supabase = createClient()

    try {
        const { count: viewCount } = await supabase
            .from('property_views')
            .select('*', { count: 'exact', head: true })
            .eq('property_id', propertyId)

        const { data: interactions } = await supabase
            .from('property_interactions')
            .select('interaction_type')
            .eq('property_id', propertyId)

        const interactionCounts = interactions?.reduce((acc: any, curr: any) => {
            acc[curr.interaction_type] = (acc[curr.interaction_type] || 0) + 1
            return acc
        }, {}) || {}

        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        const { data: recentViews } = await supabase
            .from('property_views')
            .select('viewed_at')
            .eq('property_id', propertyId)
            .gte('viewed_at', thirtyDaysAgo.toISOString())
            .order('viewed_at', { ascending: true })

        return {
            totalViews: viewCount || 0,
            interactions: interactionCounts,
            recentViews: recentViews || []
        }
    } catch (error) {
        console.error('Error fetching property analytics:', error)
        return null
    }
}

/**
 * Get agent's top performing properties
 */
export async function getTopProperties(agentId: string, limit: number = 5) {
    const supabase = createClient()

    try {
        const { data: properties } = await supabase
            .from('properties')
            .select(`
                id,
                title,
                main_image_url,
                price,
                location
            `)
            .eq('agent_id', agentId)
            .eq('status', 'active')

        if (!properties) return []

        const propertiesWithStats = await Promise.all(
            properties.map(async (property) => {
                const { count: views } = await supabase
                    .from('property_views')
                    .select('*', { count: 'exact', head: true })
                    .eq('property_id', property.id)

                const { count: interactions } = await supabase
                    .from('property_interactions')
                    .select('*', { count: 'exact', head: true })
                    .eq('property_id', property.id)

                return {
                    ...property,
                    views: views || 0,
                    interactions: interactions || 0
                }
            })
        )

        return propertiesWithStats
            .sort((a, b) => b.views - a.views)
            .slice(0, limit)
    } catch (error) {
        console.error('Error fetching top properties:', error)
        return []
    }
}
