import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { UNLIMITED_LIMIT, isUnlimitedLimit } from '@/lib/plans'

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
        properties_limit: 3,
        images_per_property: 3,
        priority_tier: 1,
        has_ai_analysis: false,
        has_advanced_stats: false,
        has_priority_support: false,
        has_featured_badge: false,
    },
    'Pro': {
        properties_limit: 20,
        images_per_property: 5,
        priority_tier: 2,
        has_ai_analysis: true,
        has_advanced_stats: true,
        has_priority_support: true,
        has_featured_badge: true,
    },
    'Platino': {
        properties_limit: UNLIMITED_LIMIT,
        images_per_property: 15,
        priority_tier: 3,
        has_ai_analysis: true,
        has_advanced_stats: true,
        has_priority_support: true,
        has_featured_badge: true,
    },
    'Enterprise': {
        properties_limit: UNLIMITED_LIMIT,
        images_per_property: 15,
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
        remaining_properties: KNOWN_PLAN_LIMITS['Gratis'].properties_limit,
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

            // ── 1. Límites del plan via RPC server-side (única fuente: subscriptions_config) ──
            const { data: planData, error: planError } = await supabase
                .rpc('get_agent_plan_limits', { p_agent_id: user.id })
                .single()

            let resolvedPropertiesLimit = KNOWN_PLAN_LIMITS['Gratis'].properties_limit
            let resolvedIsUnlimited = false

            if (!planError && planData) {
                const plan = planData as any
                const currentPlanName = plan.plan_name || 'Gratis'
                const defaults = KNOWN_PLAN_LIMITS[currentPlanName] || KNOWN_PLAN_LIMITS['Gratis']

                resolvedPropertiesLimit = Number(plan.properties_limit ?? defaults.properties_limit)
                const resolvedImages = Number(plan.images_per_property ?? defaults.images_per_property)
                resolvedIsUnlimited = Boolean(plan.is_unlimited) || isUnlimitedLimit(resolvedPropertiesLimit)

                setPlanName(currentPlanName)
                setIsUnlimited(resolvedIsUnlimited)

                setLimits({
                    properties_limit: resolvedPropertiesLimit,
                    images_per_property: resolvedImages,
                    priority_tier: Number(plan.priority_tier ?? defaults.priority_tier),
                    has_ai_analysis: Boolean(plan.has_ai_analysis ?? defaults.has_ai_analysis),
                    has_advanced_stats: Boolean(plan.has_advanced_stats ?? defaults.has_advanced_stats),
                    has_priority_support: Boolean(plan.has_priority_support ?? defaults.has_priority_support),
                    has_featured_badge: Boolean(plan.has_featured_badge ?? defaults.has_featured_badge),
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
                const maxLimit = Number(check.max_limit ?? resolvedPropertiesLimit)
                setUsage({
                    properties_count: check.current_count,
                    can_create_property: resolvedIsUnlimited || check.current_count < maxLimit,
                    remaining_properties: resolvedIsUnlimited
                        ? UNLIMITED_LIMIT
                        : Math.max(0, maxLimit - check.current_count),
                })
            } else {
                // Si el RPC check_property_limit falla, contar directamente
                const { count } = await supabase
                    .from('properties')
                    .select('id', { count: 'exact', head: true })
                    .eq('agent_id', user.id)
                    .in('status', ['active', 'draft'])

                const currentCount = count || 0
                setUsage({
                    properties_count: currentCount,
                    can_create_property: resolvedIsUnlimited || currentCount < resolvedPropertiesLimit,
                    remaining_properties: resolvedIsUnlimited
                        ? UNLIMITED_LIMIT
                        : Math.max(0, resolvedPropertiesLimit - currentCount),
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
                const { count } = await supabase
                    .from('properties')
                    .select('id', { count: 'exact', head: true })
                    .eq('agent_id', userId)
                    .in('status', ['active', 'draft'])

                setIsUnlimited(true)
                setLimits({
                    properties_limit: UNLIMITED_LIMIT,
                    images_per_property: UNLIMITED_LIMIT,
                    priority_tier: 3,
                    has_ai_analysis: true,
                    has_advanced_stats: true,
                    has_priority_support: true,
                    has_featured_badge: true,
                })
                setUsage({
                    properties_count: count || 0,
                    can_create_property: true,
                    remaining_properties: UNLIMITED_LIMIT,
                })
                setPlanName('Ilimitado')
                return
            }

            const planNameLocal = profile?.subscription_plan || 'Gratis'
            setPlanName(planNameLocal)

            const { data: dbPlan } = await supabase
                .from('subscriptions_config')
                .select('name, priority, properties_limit, images_per_property, is_popular, has_ai_analysis, has_priority_support')
                .eq('name', planNameLocal)
                .single()

            const planDefaults = KNOWN_PLAN_LIMITS[planNameLocal] || KNOWN_PLAN_LIMITS['Gratis']
            const resolvedPropsLimit = Number(dbPlan?.properties_limit ?? planDefaults.properties_limit)
            const resolvedUnlimited = isUnlimitedLimit(resolvedPropsLimit)
            setIsUnlimited(resolvedUnlimited)

            const resolvedLimits: PlanLimits = {
                properties_limit: resolvedPropsLimit,
                images_per_property: Number(dbPlan?.images_per_property ?? planDefaults.images_per_property),
                priority_tier: Number(dbPlan?.priority ?? planDefaults.priority_tier),
                has_ai_analysis: Boolean(dbPlan?.has_ai_analysis ?? planDefaults.has_ai_analysis),
                has_advanced_stats: Boolean(dbPlan?.has_ai_analysis ?? planDefaults.has_advanced_stats),
                has_priority_support: Boolean(dbPlan?.has_priority_support ?? planDefaults.has_priority_support),
                has_featured_badge: Boolean(dbPlan?.is_popular ?? planDefaults.has_featured_badge),
            }
            setLimits(resolvedLimits)

            const { count } = await supabase
                .from('properties')
                .select('id', { count: 'exact', head: true })
                .eq('agent_id', userId)
                .in('status', ['active', 'draft'])

            const currentCount = count || 0
            setUsage({
                properties_count: currentCount,
                can_create_property: resolvedUnlimited || currentCount < resolvedLimits.properties_limit,
                remaining_properties: resolvedUnlimited
                    ? UNLIMITED_LIMIT
                    : Math.max(0, resolvedLimits.properties_limit - currentCount),
            })
        } finally {
            setLoading(false)
        }
    }

    const checkCanCreateProperty = (): { allowed: boolean; message?: string } => {
        if (isUnlimited || isUnlimitedLimit(limits.properties_limit)) return { allowed: true }
        if (!usage.can_create_property) {
            return {
                allowed: false,
                message: `Has alcanzado el límite de ${limits.properties_limit} propiedades de tu plan ${planName}. Mejora tu plan para crear más.`
            }
        }
        return { allowed: true }
    }

    const checkCanUploadImages = (currentImageCount: number): { allowed: boolean; message?: string } => {
        if (isUnlimitedLimit(limits.images_per_property)) return { allowed: true }
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
