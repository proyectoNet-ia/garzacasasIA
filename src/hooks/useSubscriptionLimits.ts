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

const KNOWN_PLAN_LIMITS: Record<string, PlanLimits> = {
    'Gratis': {
        properties_limit: 5,
        images_per_property: 3,
        priority_tier: 1,
        has_ai_analysis: false,
        has_advanced_stats: false,
        has_priority_support: false,
        has_featured_badge: false,
    },
    'Pro': {
        properties_limit: 50,
        images_per_property: 15,
        priority_tier: 2,
        has_ai_analysis: true,
        has_advanced_stats: true,
        has_priority_support: true,
        has_featured_badge: true,
    },
    'Platino': {
        properties_limit: 999999,
        images_per_property: 999999,
        priority_tier: 3,
        has_ai_analysis: true,
        has_advanced_stats: true,
        has_priority_support: true,
        has_featured_badge: true,
    },
    'Enterprise': {
        properties_limit: 999999,
        images_per_property: 999999,
        priority_tier: 3,
        has_ai_analysis: true,
        has_advanced_stats: true,
        has_priority_support: true,
        has_featured_badge: true,
    },
}

export function useSubscriptionLimits() {
    const [limits, setLimits] = useState<PlanLimits>(KNOWN_PLAN_LIMITS['Gratis'])
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

            let resolvedPropertiesLimit = 5

            if (!planError && planData) {
                const plan = planData as any
                const currentPlanName = plan.plan_name || 'Gratis'
                const defaults = KNOWN_PLAN_LIMITS[currentPlanName] || KNOWN_PLAN_LIMITS['Gratis']

                setPlanName(currentPlanName)
                setIsUnlimited(plan.is_unlimited || currentPlanName === 'Enterprise' || currentPlanName === 'Platino')

                // Si el plan es Pro o superior pero la función SQL devolvió el fallback de 5, aplicar límites reales
                resolvedPropertiesLimit = (currentPlanName === 'Pro' && (!plan.properties_limit || plan.properties_limit <= 5))
                    ? defaults.properties_limit
                    : (plan.properties_limit || defaults.properties_limit)

                const resolvedImages = (currentPlanName === 'Pro' && (!plan.images_per_property || plan.images_per_property <= 3))
                    ? defaults.images_per_property
                    : (plan.images_per_property || defaults.images_per_property)

                setLimits({
                    properties_limit: resolvedPropertiesLimit,
                    images_per_property: resolvedImages,
                    priority_tier: plan.priority_tier || defaults.priority_tier,
                    has_ai_analysis: currentPlanName === 'Pro' ? true : (plan.has_ai_analysis || defaults.has_ai_analysis),
                    has_advanced_stats: currentPlanName === 'Pro' ? true : (plan.has_advanced_stats || defaults.has_advanced_stats),
                    has_priority_support: currentPlanName === 'Pro' ? true : (plan.has_priority_support || defaults.has_priority_support),
                    has_featured_badge: currentPlanName === 'Pro' ? true : (plan.has_featured_badge || defaults.has_featured_badge),
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
                const maxLimit = Math.max(check.max_limit || 0, resolvedPropertiesLimit)
                setUsage({
                    properties_count: check.current_count,
                    can_create_property: check.current_count < maxLimit,
                    remaining_properties: Math.max(0, maxLimit - check.current_count),
                })
            } else {
                // Si el RPC check_property_limit falla, contar directamente
                const { count } = await supabase
                    .from('properties')
                    .select('*', { count: 'exact', head: true })
                    .eq('agent_id', user.id)
                    .in('status', ['active', 'draft'])

                const currentCount = count || 0
                setUsage({
                    properties_count: currentCount,
                    can_create_property: currentCount < resolvedPropertiesLimit,
                    remaining_properties: Math.max(0, resolvedPropertiesLimit - currentCount),
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
                setLimits(KNOWN_PLAN_LIMITS['Enterprise'])
                setUsage({ properties_count: 0, can_create_property: true, remaining_properties: 999999 })
                setPlanName('Ilimitado')
                return
            }

            const planNameLocal = profile?.subscription_plan || 'Gratis'
            setPlanName(planNameLocal)

            const { data: dbPlan } = await supabase
                .from('subscriptions_config')
                .select('*')
                .eq('name', planNameLocal)
                .single()

            const planDefaults = KNOWN_PLAN_LIMITS[planNameLocal] || KNOWN_PLAN_LIMITS['Gratis']
            const resolvedLimits: PlanLimits = {
                properties_limit: Number(dbPlan?.properties_limit ?? planDefaults.properties_limit),
                images_per_property: Number(dbPlan?.images_per_property ?? planDefaults.images_per_property),
                priority_tier: Number(dbPlan?.priority ?? planDefaults.priority_tier),
                has_ai_analysis: Boolean(dbPlan?.has_ai_analysis !== undefined ? dbPlan.has_ai_analysis : planDefaults.has_ai_analysis),
                has_advanced_stats: Boolean(dbPlan?.has_ai_analysis !== undefined ? dbPlan.has_ai_analysis : planDefaults.has_advanced_stats),
                has_priority_support: Boolean(dbPlan?.has_priority_support !== undefined ? dbPlan.has_priority_support : planDefaults.has_priority_support),
                has_featured_badge: Boolean(dbPlan?.is_popular !== undefined ? dbPlan.is_popular : planDefaults.has_featured_badge),
            }
            setLimits(resolvedLimits)

            const { count } = await supabase
                .from('properties')
                .select('*', { count: 'exact', head: true })
                .eq('agent_id', userId)
                .in('status', ['active', 'draft'])

            const currentCount = count || 0
            setUsage({
                properties_count: currentCount,
                can_create_property: currentCount < resolvedLimits.properties_limit,
                remaining_properties: Math.max(0, resolvedLimits.properties_limit - currentCount),
            })
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
