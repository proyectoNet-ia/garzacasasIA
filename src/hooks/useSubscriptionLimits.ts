import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'

const supabase = createClient()

export interface PlanLimits {
    properties_limit: number
    images_per_property: number
    priority_tier: number
    has_ai_analysis: boolean
    has_advanced_stats: boolean
    has_priority_support: boolean
    has_featured_badge: boolean
}

export interface UsageStats {
    properties_count: number
    can_create_property: boolean
    remaining_properties: number
}

export function useSubscriptionLimits() {
    const [limits, setLimits] = useState<PlanLimits>({
        properties_limit: 5,
        images_per_property: 3,
        priority_tier: 1,
        has_ai_analysis: false,
        has_advanced_stats: false,
        has_priority_support: false,
        has_featured_badge: false,
    })

    const [usage, setUsage] = useState<UsageStats>({
        properties_count: 0,
        can_create_property: true,
        remaining_properties: 5,
    })

    const [loading, setLoading] = useState(true)
    const [planName, setPlanName] = useState('Gratis')
    const [isUnlimited, setIsUnlimited] = useState(false)

    useEffect(() => {
        fetchLimitsAndUsage()
    }, [])

    const fetchLimitsAndUsage = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // ── 1. Límites del plan via RPC server-side ──────────────────
            const { data: planData, error: planError } = await supabase
                .rpc('get_agent_plan_limits', { p_agent_id: user.id })
                .single()

            if (!planError && planData) {
                const plan = planData as any
                setPlanName(plan.plan_name)
                setIsUnlimited(plan.is_unlimited)
                setLimits({
                    properties_limit: plan.properties_limit,
                    images_per_property: plan.images_per_property,
                    priority_tier: plan.priority_tier,
                    has_ai_analysis: plan.has_ai_analysis,
                    has_advanced_stats: plan.has_advanced_stats,
                    has_priority_support: plan.has_priority_support,
                    has_featured_badge: plan.has_featured_badge,
                })
            } else {
                // Fallback si el RPC falla (e.g. función no existe aún)
                console.warn('RPC get_agent_plan_limits no disponible, usando fallback cliente')
                await fetchLimitsClientSide(user.id)
                return
            }

            // ── 2. Uso actual via RPC server-side ────────────────────────
            const { data: limitData, error: limitError } = await supabase
                .rpc('check_property_limit', { p_agent_id: user.id })
                .single()

            if (!limitError && limitData) {
                const check = limitData as any
                setUsage({
                    properties_count: check.current_count,
                    can_create_property: check.can_create,
                    remaining_properties: Math.max(0, check.max_limit - check.current_count),
                })
            }

        } catch (error) {
            console.error('Error fetching limits:', error)
        } finally {
            setLoading(false)
        }
    }

    // ── Fallback cliente (por si las funciones SQL aún no están) ─────────
    const fetchLimitsClientSide = async (userId: string) => {
        try {
            const { data: profile } = await supabase
                .from('profiles')
                .select('subscription_plan, is_unlimited, role')
                .eq('id', userId)
                .single()

            if (profile?.is_unlimited || profile?.role === 'admin') {
                setIsUnlimited(true)
                setLimits({ properties_limit: 999999, images_per_property: 999999, priority_tier: 3, has_ai_analysis: true, has_advanced_stats: true, has_priority_support: true, has_featured_badge: true })
                setUsage({ properties_count: 0, can_create_property: true, remaining_properties: 999999 })
                setPlanName('Ilimitado')
                return
            }

            const planNameLocal = profile?.subscription_plan || 'Gratis'
            setPlanName(planNameLocal)

            const { data: planConfig } = await supabase
                .from('subscriptions_config')
                .select('features')
                .eq('name', planNameLocal)
                .single()

            if (planConfig?.features) {
                const f = planConfig.features as any
                setLimits({
                    properties_limit: f.properties_limit || 5,
                    images_per_property: f.images_per_property || 3,
                    priority_tier: f.priority_tier || 1,
                    has_ai_analysis: f.has_ai_analysis || false,
                    has_advanced_stats: f.has_advanced_stats || false,
                    has_priority_support: f.has_priority_support || false,
                    has_featured_badge: f.has_featured_badge || false,
                })
            }

            const { count } = await supabase
                .from('properties')
                .select('*', { count: 'exact', head: true })
                .eq('agent_id', userId)

            const currentCount = count || 0
            const limit = (planConfig?.features as any)?.properties_limit || 5
            setUsage({ properties_count: currentCount, can_create_property: currentCount < limit, remaining_properties: Math.max(0, limit - currentCount) })
        } finally {
            setLoading(false)
        }
    }

    const checkCanCreateProperty = (): { allowed: boolean; message?: string } => {
        if (isUnlimited) return { allowed: true }
        if (!usage.can_create_property) {
            return {
                allowed: false,
                message: `Has alcanzado el límite de ${limits.properties_limit} propiedades de tu plan ${planName}. Mejora tu plan para crear más.`
            }
        }
        return { allowed: true }
    }

    const checkCanUploadImages = (currentImageCount: number): { allowed: boolean; message?: string } => {
        if (isUnlimited) return { allowed: true }
        if (currentImageCount >= limits.images_per_property) {
            return {
                allowed: false,
                message: `Has alcanzado el límite de ${limits.images_per_property} imágenes por propiedad de tu plan ${planName}.`
            }
        }
        return { allowed: true }
    }

    return {
        limits,
        usage,
        loading,
        planName,
        isUnlimited,
        checkCanCreateProperty,
        checkCanUploadImages,
        refreshUsage: fetchLimitsAndUsage,
    }
}
