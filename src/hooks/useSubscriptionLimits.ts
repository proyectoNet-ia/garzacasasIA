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
            // For development: mock user data
            // TODO: Replace with real auth when implemented
            const mockUserId = 'dev-user-id'

            // Fetch user profile and subscription plan
            const { data: profile } = await supabase
                .from('profiles')
                .select('subscription_plan, is_unlimited, role')
                .eq('id', mockUserId)
                .single()

            // Check if user is admin with unlimited access
            if (profile?.is_unlimited || profile?.role === 'admin') {
                setIsUnlimited(true)
                setLimits({
                    properties_limit: 999999,
                    images_per_property: 999999,
                    priority_tier: 3,
                    has_ai_analysis: true,
                    has_advanced_stats: true,
                    has_priority_support: true,
                    has_featured_badge: true,
                })
                setUsage({
                    properties_count: 0,
                    can_create_property: true,
                    remaining_properties: 999999,
                })
                setPlanName('Ilimitado')
                setLoading(false)
                return
            }

            // Fetch plan limits from subscriptions_config
            const planName = profile?.subscription_plan || 'Gratis'
            setPlanName(planName)

            const { data: planConfig } = await supabase
                .from('subscriptions_config')
                .select('features')
                .eq('name', planName)
                .single()

            if (planConfig?.features) {
                setLimits({
                    properties_limit: planConfig.features.properties_limit || 5,
                    images_per_property: planConfig.features.images_per_property || 3,
                    priority_tier: planConfig.features.priority_tier || 1,
                    has_ai_analysis: planConfig.features.has_ai_analysis || false,
                    has_advanced_stats: planConfig.features.has_advanced_stats || false,
                    has_priority_support: planConfig.features.has_priority_support || false,
                    has_featured_badge: planConfig.features.has_featured_badge || false,
                })
            }

            // Fetch current usage
            const { count: propertiesCount } = await supabase
                .from('properties')
                .select('*', { count: 'exact', head: true })
                .eq('agent_id', mockUserId)

            const currentCount = propertiesCount || 0
            const limit = planConfig?.features?.properties_limit || 5

            setUsage({
                properties_count: currentCount,
                can_create_property: currentCount < limit,
                remaining_properties: Math.max(0, limit - currentCount),
            })

        } catch (error) {
            console.error('Error fetching limits:', error)
        } finally {
            setLoading(false)
        }
    }

    const checkCanCreateProperty = (): { allowed: boolean; message?: string } => {
        if (isUnlimited) {
            return { allowed: true }
        }

        if (!usage.can_create_property) {
            return {
                allowed: false,
                message: `Has alcanzado el límite de ${limits.properties_limit} propiedades de tu plan ${planName}. Mejora tu plan para crear más propiedades.`
            }
        }

        return { allowed: true }
    }

    const checkCanUploadImages = (currentImageCount: number): { allowed: boolean; message?: string } => {
        if (isUnlimited) {
            return { allowed: true }
        }

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
