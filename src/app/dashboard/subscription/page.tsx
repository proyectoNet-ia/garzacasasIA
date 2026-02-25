'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Crown, Check, TrendingUp, Zap, Building2, Image as ImageIcon, ShieldCheck, BarChart3 } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { toast } from 'sonner'

const supabase = createClient()

interface Plan {
    id: string
    name: string
    monthly_price: number
    yearly_price: number
    description: string
    features: {
        properties_limit?: number
        images_per_property?: number
        priority_tier?: number
        ai_analysis?: boolean
        advanced_stats?: boolean
        priority_support?: boolean
        featured_badge?: boolean
        badge_text?: string
    }
}

interface CurrentPlanInfo {
    planName: string
    propertiesCount: number
    propertiesLimit: number
    imagesPerProperty: number
    priorityTier: number
    isUnlimited: boolean
}

function PlanSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
                <Card key={i} className="border-zinc-200">
                    <CardHeader className="space-y-3">
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-10 w-28" />
                        <Skeleton className="h-4 w-full" />
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {[...Array(4)].map((_, j) => (
                            <div key={j} className="flex items-center gap-2">
                                <Skeleton className="h-4 w-4 rounded-full" />
                                <Skeleton className="h-4 flex-1" />
                            </div>
                        ))}
                        <Skeleton className="h-10 w-full rounded-lg mt-4" />
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

const TIER_LABELS = ['', 'Básica', 'Media', 'Máxima']
const TIER_COLORS = ['', 'text-zinc-600', 'text-blue-600', 'text-purple-600']

function featureItems(features: Plan['features']) {
    const items = []
    if (features.properties_limit) items.push(`${features.properties_limit} propiedades`)
    if (features.images_per_property) items.push(`${features.images_per_property} imágenes por propiedad`)
    if (features.priority_tier) items.push(`Prioridad ${TIER_LABELS[features.priority_tier] || features.priority_tier}`)
    if (features.ai_analysis) items.push('Análisis con IA')
    if (features.advanced_stats) items.push('Estadísticas avanzadas')
    if (features.priority_support) items.push('Soporte prioritario')
    if (features.featured_badge) items.push(`Badge "${features.badge_text || 'Destacado'}"`)
    return items
}

export default function AgentSubscription() {
    const [plans, setPlans] = useState<Plan[]>([])
    const [currentInfo, setCurrentInfo] = useState<CurrentPlanInfo | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchData()
    }, [])

    async function fetchData() {
        try {
            // Get current user
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // Fetch profile
            const { data: profile } = await supabase
                .from('profiles')
                .select('subscription_plan, is_unlimited, role')
                .eq('id', user.id)
                .single()

            const isUnlimited = profile?.is_unlimited || profile?.role === 'admin'
            const planName = isUnlimited ? 'Ilimitado' : (profile?.subscription_plan || 'Gratis')

            // Fetch properties count
            const { count: propertiesCount } = await supabase
                .from('properties')
                .select('*', { count: 'exact', head: true })
                .eq('agent_id', user.id)

            // Fetch plans from DB
            const { data: plansData } = await supabase
                .from('subscriptions_config')
                .select('*')
                .order('priority', { ascending: true })

            if (plansData && plansData.length > 0) {
                setPlans(plansData)
            } else {
                // Fallback plans if DB is empty
                setPlans([
                    {
                        id: '1', name: 'Gratis', monthly_price: 0, yearly_price: 0,
                        description: 'Ideal para comenzar',
                        features: { properties_limit: 5, images_per_property: 3, priority_tier: 1 }
                    },
                    {
                        id: '2', name: 'Pro', monthly_price: 499, yearly_price: 4990,
                        description: 'Para agentes en crecimiento',
                        features: { properties_limit: 50, images_per_property: 15, priority_tier: 2, ai_analysis: true }
                    },
                    {
                        id: '3', name: 'Platino', monthly_price: 999, yearly_price: 9990,
                        description: 'Acceso completo sin límites',
                        features: { properties_limit: 500, images_per_property: 30, priority_tier: 3, ai_analysis: true, advanced_stats: true, priority_support: true, featured_badge: true }
                    },
                ])
            }

            // Get limits for current plan
            const currentPlanConfig = plansData?.find(p => p.name === planName)
            setCurrentInfo({
                planName,
                propertiesCount: propertiesCount || 0,
                propertiesLimit: currentPlanConfig?.features?.properties_limit || 5,
                imagesPerProperty: currentPlanConfig?.features?.images_per_property || 3,
                priorityTier: currentPlanConfig?.features?.priority_tier || 1,
                isUnlimited
            })
        } catch (error) {
            console.error('Error fetching subscription data:', error)
            toast.error('No se pudo cargar la información de suscripción')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-black text-zinc-900">Mi Plan</h1>
                <p className="text-zinc-500 mt-2">Gestiona tu suscripción y mejora tu rendimiento</p>
            </div>

            {/* Current Plan */}
            {loading ? (
                <Card className="border-zinc-200">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-7 w-48" />
                            <Skeleton className="h-9 w-24" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="space-y-2">
                                    <Skeleton className="h-4 w-28" />
                                    <Skeleton className="h-7 w-20" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            ) : currentInfo && (
                <Card className={`border-2 ${currentInfo.isUnlimited ? 'border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50' : 'border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50'}`}>
                    <CardHeader>
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <CardTitle className="text-zinc-900 flex items-center gap-2">
                                <Crown className={`h-5 w-5 ${currentInfo.isUnlimited ? 'text-amber-500' : 'text-blue-600'}`} />
                                Plan Actual:&nbsp;
                                <span className={currentInfo.isUnlimited ? 'text-amber-600' : 'text-blue-700'}>
                                    {currentInfo.planName}
                                </span>
                            </CardTitle>
                            {currentInfo.isUnlimited && (
                                <Badge className="bg-amber-500 text-white border-0 gap-1">
                                    <Zap className="h-3 w-3 fill-white" /> Acceso Ilimitado
                                </Badge>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="flex items-start gap-3">
                                <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                                    <Building2 className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-zinc-500 font-medium uppercase tracking-wide">Propiedades</p>
                                    <p className="text-xl font-bold text-zinc-900">
                                        {currentInfo.propertiesCount}
                                        <span className="text-sm font-normal text-zinc-500">
                                            {' '}/ {currentInfo.isUnlimited ? '∞' : currentInfo.propertiesLimit}
                                        </span>
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="h-10 w-10 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
                                    <ImageIcon className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-zinc-500 font-medium uppercase tracking-wide">Imágenes/propiedad</p>
                                    <p className="text-xl font-bold text-zinc-900">
                                        {currentInfo.isUnlimited ? '∞' : currentInfo.imagesPerProperty}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="h-10 w-10 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                                    <TrendingUp className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-zinc-500 font-medium uppercase tracking-wide">Prioridad</p>
                                    <p className={`text-xl font-bold ${currentInfo.isUnlimited ? 'text-amber-600' : TIER_COLORS[currentInfo.priorityTier]}`}>
                                        {currentInfo.isUnlimited ? 'Máxima' : (TIER_LABELS[currentInfo.priorityTier] || `Tier ${currentInfo.priorityTier}`)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Available Plans */}
            <div>
                <h2 className="text-2xl font-bold text-zinc-900 mb-6">Planes Disponibles</h2>
                {loading ? (
                    <PlanSkeleton />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {plans.map((plan) => {
                            const isCurrent = currentInfo?.planName === plan.name
                            const isPopular = plan.features?.priority_tier === 2
                            const isPlatino = plan.features?.priority_tier === 3

                            return (
                                <Card
                                    key={plan.id}
                                    className={`border-2 relative transition-all ${isCurrent
                                        ? 'border-blue-400 bg-blue-50 shadow-lg shadow-blue-100'
                                        : isPlatino
                                            ? 'border-purple-200 hover:border-purple-400 hover:shadow-lg'
                                            : 'border-zinc-200 hover:border-zinc-300 hover:shadow-md'
                                        }`}
                                >
                                    {isPopular && !isCurrent && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                            <Badge className="bg-blue-600 text-white border-0 text-xs px-3">
                                                🔥 Más Popular
                                            </Badge>
                                        </div>
                                    )}
                                    {isCurrent && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                            <Badge className="bg-green-600 text-white border-0 text-xs px-3">
                                                ✓ Plan Actual
                                            </Badge>
                                        </div>
                                    )}
                                    <CardHeader className="pb-4">
                                        <CardTitle className="text-zinc-900 flex items-center gap-2">
                                            {isPlatino && <Crown className="h-5 w-5 text-amber-500" />}
                                            {plan.name}
                                        </CardTitle>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-4xl font-black text-zinc-900">
                                                ${plan.monthly_price.toLocaleString()}
                                            </span>
                                            <span className="text-sm text-zinc-500 font-normal">/mes</span>
                                        </div>
                                        {plan.yearly_price > 0 && (
                                            <p className="text-xs text-green-600 font-medium">
                                                ${plan.yearly_price.toLocaleString()}/año — Ahorra{' '}
                                                {Math.round((1 - plan.yearly_price / (plan.monthly_price * 12)) * 100)}%
                                            </p>
                                        )}
                                        <p className="text-sm text-zinc-500">{plan.description}</p>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <ul className="space-y-2.5">
                                            {featureItems(plan.features).map((feature, i) => (
                                                <li key={i} className="flex items-center gap-2 text-sm text-zinc-700">
                                                    <Check className="h-4 w-4 text-green-600 shrink-0" />
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                        <Button
                                            className={`w-full gap-2 mt-2 ${isPlatino && !isCurrent ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
                                            variant={isCurrent ? 'outline' : 'default'}
                                            disabled={isCurrent}
                                            onClick={() => {
                                                if (!isCurrent) {
                                                    toast.info('Próximamente: integración con Mercado Pago 🚀')
                                                }
                                            }}
                                        >
                                            {isCurrent ? (
                                                <><Check className="h-4 w-4" /> Plan Actual</>
                                            ) : (
                                                <><TrendingUp className="h-4 w-4" /> Mejorar a {plan.name}</>
                                            )}
                                        </Button>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Info Box */}
            <Card className="border-zinc-200 bg-zinc-50">
                <CardContent className="p-6 flex items-start gap-4">
                    <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                        <ShieldCheck className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                        <p className="font-bold text-zinc-900 mb-1">Integración de pagos próximamente</p>
                        <p className="text-sm text-zinc-500">
                            Estamos integrando Mercado Pago para que puedas actualizar tu plan directamente desde aquí.
                            Por el momento, contacta con tu administrador para cambiar de plan.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
