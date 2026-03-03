'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { CheckoutButton, SecurePaymentBadge } from '@/components/payments/CheckoutButton'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Check, Zap, Crown, Building2, CreditCard, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'

const supabase = createClient()

const iconMap: Record<string, any> = {
    'Gratis': Building2,
    'Pro': Zap,
    'Enterprise': Crown,
    'Platino': Crown,
}

export default function SuscripcionPage() {
    const [plans, setPlans] = useState<any[]>([])
    const [currentPlan, setCurrentPlan] = useState<string>('Gratis')
    const [loading, setLoading] = useState(true)
    const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly')

    useEffect(() => {
        async function fetchData() {
            // Obtener planes
            const { data: plansData } = await supabase
                .from('subscriptions_config')
                .select('*')
                .order('priority', { ascending: true })

            // Obtener plan actual del usuario
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('subscription_plan, subscription_status, subscription_expires_at')
                    .eq('id', user.id)
                    .single()

                if (profile?.subscription_plan) {
                    setCurrentPlan(profile.subscription_plan)
                }
            }

            if (plansData) setPlans(plansData)
            setLoading(false)
        }
        fetchData()
    }, [])

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-96" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <Skeleton key={i} className="h-96 rounded-3xl" />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-zinc-800 font-heading">Planes y Suscripción</h1>
                <p className="text-zinc-500 font-medium mt-1">
                    Plan actual: <span className="font-bold text-blue-600">{currentPlan}</span>
                </p>
            </div>

            {/* Toggle mensual / anual */}
            <div className="flex items-center gap-3 bg-zinc-100 rounded-2xl p-1.5 w-fit">
                <Button
                    size="sm"
                    onClick={() => setBillingPeriod('monthly')}
                    className={`rounded-xl px-5 h-9 font-bold transition-all ${billingPeriod === 'monthly'
                            ? 'bg-white shadow text-zinc-900'
                            : 'bg-transparent text-zinc-500 hover:text-zinc-700 shadow-none'
                        }`}
                    variant="ghost"
                >
                    <Calendar className="h-3.5 w-3.5 mr-1.5" />
                    Mensual
                </Button>
                <Button
                    size="sm"
                    onClick={() => setBillingPeriod('yearly')}
                    className={`rounded-xl px-5 h-9 font-bold transition-all ${billingPeriod === 'yearly'
                            ? 'bg-white shadow text-zinc-900'
                            : 'bg-transparent text-zinc-500 hover:text-zinc-700 shadow-none'
                        }`}
                    variant="ghost"
                >
                    <Zap className="h-3.5 w-3.5 mr-1.5" />
                    Anual
                    <Badge className="ml-2 text-[9px] bg-green-100 text-green-700 border-green-200 px-1.5">
                        2 meses gratis
                    </Badge>
                </Button>
            </div>

            {/* Cards de planes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan) => {
                    const Icon = iconMap[plan.name] || Building2
                    const features = Array.isArray(plan.features) ? plan.features : []
                    const isPopular = plan.name === 'Pro'
                    const isFree = !plan.monthly_price || plan.monthly_price === 0
                    const isCurrentPlanCard = plan.name === currentPlan

                    const displayAmount = billingPeriod === 'yearly'
                        ? (plan.yearly_price ?? plan.monthly_price * 10)
                        : plan.monthly_price

                    return (
                        <div
                            key={plan.id}
                            className={`relative flex flex-col rounded-[2.5rem] border transition-all duration-300 ${isPopular
                                    ? 'border-blue-600/20 bg-white ring-1 ring-blue-600/10 shadow-xl shadow-blue-600/10'
                                    : isCurrentPlanCard
                                        ? 'border-green-500/30 bg-green-50/30 ring-1 ring-green-500/20'
                                        : 'border-zinc-200 bg-zinc-50'
                                }`}
                        >
                            {isPopular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                                    <div className="bg-blue-600 text-white text-[9px] font-black uppercase tracking-[0.2em] px-5 py-2 rounded-full shadow-lg flex items-center gap-2 whitespace-nowrap border-2 border-white">
                                        <Zap className="h-3 w-3 fill-white" />
                                        MÁS POPULAR
                                    </div>
                                </div>
                            )}

                            <div className="p-7 pb-0">
                                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl mb-5 ${isPopular
                                        ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-[0_8px_16px_-4px_rgba(37,99,235,0.4)]'
                                        : 'bg-zinc-100 text-zinc-400'
                                    }`}>
                                    <Icon className="h-5 w-5" />
                                </div>

                                <h3 className="text-xl font-black text-zinc-800">{plan.name}</h3>

                                <div className="mt-3 flex items-baseline text-zinc-800">
                                    {isFree ? (
                                        <span className="text-4xl font-black">Gratis</span>
                                    ) : (
                                        <>
                                            <span className="text-2xl font-black">$</span>
                                            <span className="text-4xl font-black leading-none ml-0.5">
                                                {Math.floor(displayAmount)}
                                            </span>
                                            <span className="ml-1 text-sm font-bold text-zinc-400">
                                                /{billingPeriod === 'yearly' ? 'año' : 'mes'}
                                            </span>
                                        </>
                                    )}
                                </div>

                                <p className="mt-4 text-sm text-zinc-500 leading-relaxed">
                                    {plan.description}
                                </p>
                            </div>

                            <div className="p-7 flex-1 flex flex-col">
                                <ul className="mb-8 space-y-3 flex-1">
                                    {features.map((feature: string) => (
                                        <li key={feature} className="flex items-center gap-2.5 text-sm text-zinc-600 font-medium">
                                            <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${isPopular ? 'bg-blue-600/10 text-blue-600' : 'bg-black/5 text-zinc-400'
                                                }`}>
                                                <Check className="h-2.5 w-2.5" />
                                            </div>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>

                                <div>
                                    {plan.name === 'Enterprise' ? (
                                        <a
                                            href="https://wa.me/528180000000"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`flex items-center justify-center w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs transition-all ${isPopular
                                                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20 hover:bg-blue-500'
                                                    : 'bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100'
                                                }`}
                                        >
                                            Contactar ventas
                                        </a>
                                    ) : (
                                        <CheckoutButton
                                            planId={plan.id}
                                            planName={plan.name}
                                            amount={displayAmount}
                                            billingPeriod={billingPeriod}
                                            isFree={isFree}
                                            isCurrentPlan={isCurrentPlanCard}
                                            variant={isPopular ? 'popular' : 'default'}
                                        />
                                    )}
                                    {!isFree && !isCurrentPlanCard && (
                                        <SecurePaymentBadge />
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Info adicional */}
            <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-5 flex gap-3 items-start">
                <CreditCard className="h-5 w-5 text-zinc-400 mt-0.5 shrink-0" />
                <div className="text-sm text-zinc-600">
                    <p className="font-semibold text-zinc-700 mb-0.5">Métodos de pago aceptados</p>
                    <p>Tarjetas de crédito y débito (Visa, Mastercard, AMEX), PayPal, OXXO, transferencia bancaria y más — procesado por Mercado Pago.</p>
                </div>
            </div>
        </div>
    )
}
