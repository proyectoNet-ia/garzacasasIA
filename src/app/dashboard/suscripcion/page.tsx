'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { CheckoutButton, SecurePaymentBadge } from '@/components/payments/CheckoutButton'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
    Check, Zap, Crown, Building2, CreditCard, Calendar,
    TrendingUp, Image, AlertCircle, Clock, ChevronRight,
    Star, Infinity, ArrowUpRight, Receipt, Shield
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSubscriptionLimits } from '@/hooks/useSubscriptionLimits'
import { cn } from '@/lib/utils'
import Link from 'next/link'

const supabase = createClient()

const PLAN_ICONS: Record<string, any> = {
    'Gratis': Building2,
    'Pro': Zap,
    'Platino': Crown,
    'Enterprise': Crown,
}

const PLAN_GRADIENT: Record<string, string> = {
    'Gratis': 'from-zinc-500 to-zinc-700',
    'Pro': 'from-blue-500 to-blue-700',
    'Platino': 'from-amber-500 to-amber-700',
    'Enterprise': 'from-purple-500 to-purple-700',
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
    'approved': { label: 'Aprobado', color: 'text-green-600 bg-green-50 border-green-200' },
    'pending': { label: 'Pendiente', color: 'text-amber-600 bg-amber-50 border-amber-200' },
    'rejected': { label: 'Rechazado', color: 'text-red-600 bg-red-50 border-red-200' },
    'cancelled': { label: 'Cancelado', color: 'text-zinc-600 bg-zinc-50 border-zinc-200' },
    'refunded': { label: 'Reembolsado', color: 'text-blue-600 bg-blue-50 border-blue-200' },
    'in_process': { label: 'En proceso', color: 'text-blue-600 bg-blue-50 border-blue-200' },
}

export default function SuscripcionPage() {
    const [plans, setPlans] = useState<any[]>([])
    const [profile, setProfile] = useState<any>(null)
    const [payments, setPayments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly')
    const { limits, usage, loading: limitsLoading, planName, isUnlimited } = useSubscriptionLimits()

    useEffect(() => {
        async function fetchData() {
            try {
                const { data: plansData } = await supabase
                    .from('subscriptions_config')
                    .select('*')
                    .order('priority', { ascending: true })

                const { data: { user } } = await supabase.auth.getUser()
                if (user) {
                    const { data: profileData } = await supabase
                        .from('profiles')
                        .select('subscription_plan, subscription_status, subscription_expires_at, is_unlimited, role')
                        .eq('id', user.id)
                        .single()

                    setProfile(profileData)

                    const { data: paymentsData } = await supabase
                        .from('payments')
                        .select('*')
                        .eq('user_id', user.id)
                        .order('created_at', { ascending: false })
                        .limit(5)

                    setPayments(paymentsData || [])
                }

                if (plansData) setPlans(plansData)
            } catch (error) {
                console.error('Error fetching subscription data:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const currentPlan = profile?.subscription_plan || 'Gratis'
    const isAdminOrUnlimited = profile?.is_unlimited || profile?.role === 'admin'

    if (loading || limitsLoading) {
        return (
            <div className="space-y-6">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-96" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1">
                        <Skeleton className="h-64 rounded-3xl" />
                    </div>
                    <div className="lg:col-span-2">
                        <Skeleton className="h-64 rounded-3xl" />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <Skeleton key={i} className="h-96 rounded-3xl" />
                    ))}
                </div>
            </div>
        )
    }

    const propertiesUsedPct = isUnlimited || !limits?.properties_limit
        ? 0
        : Math.min(100, Math.round((usage?.properties_count || 0) / limits.properties_limit * 100))

    const imagesUsedPct = isUnlimited || !limits?.images_per_property
        ? 0
        : Math.min(100, 40)  // approximation for display

    return (
        <div className="space-y-8 max-w-6xl">
            {/* ── Header ── */}
            <div>
                <h1 className="text-3xl font-black text-zinc-900">Planes y Suscripción</h1>
                <p className="text-zinc-500 font-medium mt-1">
                    Gestiona tu plan y visualiza el uso de tu cuenta.
                </p>
            </div>

            {/* ── Current Plan + Usage ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Plan Card */}
                <div className={cn(
                    "relative rounded-3xl p-6 text-white overflow-hidden",
                    `bg-gradient-to-br ${PLAN_GRADIENT[currentPlan] || 'from-zinc-500 to-zinc-700'}`
                )}>
                    {/* Decorative circles */}
                    <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10" />
                    <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-white/5" />

                    <div className="relative">
                        {isAdminOrUnlimited && (
                            <Badge className="bg-white/20 text-white border-none mb-3 text-[10px] font-bold uppercase tracking-widest">
                                Acceso ilimitado
                            </Badge>
                        )}
                        <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center mb-4">
                            {(() => {
                                const Icon = PLAN_ICONS[currentPlan] || Building2
                                return <Icon className="h-6 w-6" />
                            })()}
                        </div>
                        <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">Plan activo</p>
                        <h2 className="text-3xl font-black">{currentPlan}</h2>

                        {profile?.subscription_expires_at && !isAdminOrUnlimited && (
                            <div className="flex items-center gap-2 mt-4 bg-white/10 rounded-xl px-3 py-2">
                                <Clock className="h-4 w-4 text-white/70" />
                                <span className="text-sm font-medium text-white/80">
                                    Vence el {new Date(profile.subscription_expires_at).toLocaleDateString('es-MX', {
                                        day: 'numeric', month: 'long', year: 'numeric'
                                    })}
                                </span>
                            </div>
                        )}

                        {profile?.subscription_status && profile.subscription_status !== 'active' && (
                            <div className="flex items-center gap-2 mt-3 bg-red-500/20 rounded-xl px-3 py-2">
                                <AlertCircle className="h-4 w-4" />
                                <span className="text-sm font-medium">
                                    Estado: {profile.subscription_status}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Usage Stats */}
                <div className="lg:col-span-2 bg-white rounded-3xl border border-zinc-200 p-6 shadow-sm space-y-5">
                    <div className="flex items-center justify-between">
                        <h3 className="font-black text-zinc-900 text-lg">Uso de tu Plan</h3>
                        {isAdminOrUnlimited && (
                            <Badge className="bg-blue-50 text-blue-600 border-blue-200 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                                <Infinity className="h-3 w-3" />
                                Sin límites
                            </Badge>
                        )}
                    </div>

                    {/* Properties usage */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2 text-zinc-600 font-medium">
                                <Building2 className="h-4 w-4 text-blue-500" />
                                Propiedades publicadas
                            </div>
                            <span className="font-black text-zinc-900">
                                {isAdminOrUnlimited ? (
                                    <span className="flex items-center gap-1">
                                        {usage?.properties_count || 0}
                                        <span className="text-zinc-400 font-normal">/ ∞</span>
                                    </span>
                                ) : (
                                    `${usage?.properties_count || 0} / ${limits?.properties_limit || 0}`
                                )}
                            </span>
                        </div>
                        {!isAdminOrUnlimited && (
                            <div className="h-2 rounded-full bg-zinc-100 overflow-hidden">
                                <div
                                    className={cn(
                                        "h-full rounded-full transition-all duration-700",
                                        propertiesUsedPct >= 90 ? "bg-red-500" :
                                            propertiesUsedPct >= 70 ? "bg-amber-500" : "bg-blue-600"
                                    )}
                                    style={{ width: `${propertiesUsedPct}%` }}
                                />
                            </div>
                        )}
                        {!isAdminOrUnlimited && propertiesUsedPct >= 80 && (
                            <p className="text-xs text-amber-600 font-bold flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                Estás cerca de tu límite — considera mejorar tu plan
                            </p>
                        )}
                    </div>

                    {/* Images per property */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2 text-zinc-600 font-medium">
                                <Image className="h-4 w-4 text-indigo-500" />
                                Imágenes por propiedad
                            </div>
                            <span className="font-black text-zinc-900">
                                {isAdminOrUnlimited ? '∞ ilimitadas' : `hasta ${limits?.images_per_property || 0} fotos`}
                            </span>
                        </div>
                        {!isAdminOrUnlimited && (
                            <div className="h-2 rounded-full bg-zinc-100 overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-indigo-500 transition-all duration-700"
                                    style={{ width: isAdminOrUnlimited ? '100%' : `${Math.min(100, ((limits?.images_per_property || 3) / 20) * 100)}%` }}
                                />
                            </div>
                        )}
                    </div>

                    {/* Extra metrics grid */}
                    <div className="grid grid-cols-3 gap-3 pt-2">
                        {[
                            {
                                label: 'Propiedades disponibles',
                                value: isAdminOrUnlimited ? '∞' : (usage?.remaining_properties ?? 0).toString(),
                                icon: TrendingUp,
                                color: 'text-green-600',
                                bg: 'bg-green-50',
                            },
                            {
                                label: 'Imágenes por propiedad',
                                value: isAdminOrUnlimited ? '∞' : (limits?.images_per_property || 0).toString(),
                                icon: Image,
                                color: 'text-indigo-600',
                                bg: 'bg-indigo-50',
                            },
                            {
                                label: 'Análisis con IA INEGI',
                                value: limits?.has_ai_analysis ? 'Sí' : 'No',
                                icon: Star,
                                color: limits?.has_ai_analysis ? 'text-amber-600' : 'text-zinc-400',
                                bg: limits?.has_ai_analysis ? 'bg-amber-50' : 'bg-zinc-50',
                            },
                        ].map((item, i) => (
                            <div key={i} className={cn("rounded-2xl p-3", item.bg)}>
                                <item.icon className={cn("h-4 w-4 mb-2", item.color)} />
                                <div className={cn("text-xl font-black", item.color)}>{item.value}</div>
                                <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mt-0.5 leading-tight">
                                    {item.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Payment History ── */}
            {payments.length > 0 && (
                <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-50/50 px-6 py-4">
                        <h3 className="font-black text-zinc-900 flex items-center gap-2">
                            <Receipt className="h-5 w-5 text-zinc-400" />
                            Historial de Pagos
                        </h3>
                        <span className="text-xs text-zinc-400 font-medium">Últimos 5 pagos</span>
                    </div>
                    <div className="divide-y divide-zinc-50">
                        {payments.map((payment) => {
                            const statusInfo = STATUS_LABELS[payment.status] || { label: payment.status, color: 'text-zinc-500 bg-zinc-50 border-zinc-200' }
                            return (
                                <div key={payment.id} className="flex items-center justify-between px-6 py-4 hover:bg-zinc-50/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                                            <CreditCard className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-zinc-900 text-sm">
                                                Plan {payment.plan_name}
                                                <span className="text-zinc-400 font-medium ml-2 text-xs">
                                                    · {payment.billing_period === 'yearly' ? 'Anual' : 'Mensual'}
                                                </span>
                                            </p>
                                            <p className="text-xs text-zinc-400 font-medium mt-0.5">
                                                {new Date(payment.created_at).toLocaleDateString('es-MX', {
                                                    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 shrink-0">
                                        <Badge className={cn("border font-bold text-xs", statusInfo.color)}>
                                            {statusInfo.label}
                                        </Badge>
                                        <span className="font-black text-zinc-900 tabular-nums">
                                            ${payment.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })} {payment.currency}
                                        </span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* ── Plans Grid ── */}
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-black text-zinc-900">Cambiar de Plan</h2>
                        <p className="text-zinc-500 text-sm mt-1">Elige el plan que mejor se adapte a tu negocio.</p>
                    </div>
                    {/* Toggle mensual / anual */}
                    <div className="flex items-center gap-1 bg-zinc-100 rounded-2xl p-1.5 w-fit">
                        <button
                            onClick={() => setBillingPeriod('monthly')}
                            className={cn(
                                "rounded-xl px-5 h-9 font-bold text-sm transition-all flex items-center gap-1.5",
                                billingPeriod === 'monthly'
                                    ? 'bg-white shadow text-zinc-900'
                                    : 'text-zinc-500 hover:text-zinc-700'
                            )}
                        >
                            <Calendar className="h-3.5 w-3.5" />
                            Mensual
                        </button>
                        <button
                            onClick={() => setBillingPeriod('yearly')}
                            className={cn(
                                "rounded-xl px-5 h-9 font-bold text-sm transition-all flex items-center gap-1.5",
                                billingPeriod === 'yearly'
                                    ? 'bg-white shadow text-zinc-900'
                                    : 'text-zinc-500 hover:text-zinc-700'
                            )}
                        >
                            <Zap className="h-3.5 w-3.5" />
                            Anual
                            <span className="ml-1 text-[10px] font-black bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                2 meses gratis
                            </span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {plans.map((plan) => {
                        const Icon = PLAN_ICONS[plan.name] || Building2
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
                                className={cn(
                                    "relative flex flex-col rounded-[2.5rem] border transition-all duration-300",
                                    isCurrentPlanCard
                                        ? 'border-green-400/40 bg-green-50/30 ring-2 ring-green-400/20 shadow-lg shadow-green-500/5'
                                        : isPopular
                                            ? 'border-blue-600/20 bg-white ring-1 ring-blue-600/10 shadow-xl shadow-blue-600/10'
                                            : 'border-zinc-200 bg-zinc-50'
                                )}
                            >
                                {isCurrentPlanCard && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                                        <div className="bg-green-600 text-white text-[9px] font-black uppercase tracking-[0.2em] px-5 py-2 rounded-full shadow-lg flex items-center gap-2 whitespace-nowrap border-2 border-white">
                                            <Check className="h-3 w-3" />
                                            Tu plan actual
                                        </div>
                                    </div>
                                )}

                                {!isCurrentPlanCard && isPopular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                                        <div className="bg-blue-600 text-white text-[9px] font-black uppercase tracking-[0.2em] px-5 py-2 rounded-full shadow-lg flex items-center gap-2 whitespace-nowrap border-2 border-white">
                                            <Zap className="h-3 w-3 fill-white" />
                                            Más popular
                                        </div>
                                    </div>
                                )}

                                <div className="p-7 pb-0">
                                    <div className={cn(
                                        "inline-flex h-12 w-12 items-center justify-center rounded-2xl mb-5",
                                        isCurrentPlanCard
                                            ? 'bg-green-100 text-green-600'
                                            : isPopular
                                                ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-[0_8px_16px_-4px_rgba(37,99,235,0.4)]'
                                                : 'bg-zinc-100 text-zinc-400'
                                    )}>
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
                                                    {Math.floor(displayAmount).toLocaleString()}
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
                                            <li key={feature} className="flex items-start gap-2.5 text-sm text-zinc-600 font-medium">
                                                <div className={cn(
                                                    "flex h-4 w-4 mt-0.5 shrink-0 items-center justify-center rounded-full",
                                                    isCurrentPlanCard
                                                        ? 'bg-green-100 text-green-600'
                                                        : isPopular
                                                            ? 'bg-blue-600/10 text-blue-600'
                                                            : 'bg-black/5 text-zinc-400'
                                                )}>
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
                                                className="flex items-center justify-center w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs transition-all bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100"
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
                                                variant={isPopular && !isCurrentPlanCard ? 'popular' : 'default'}
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
            </div>

            {/* ── Security Notice ── */}
            <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-5 flex gap-4 items-start">
                <div className="h-10 w-10 rounded-xl bg-zinc-100 flex items-center justify-center shrink-0">
                    <Shield className="h-5 w-5 text-zinc-400" />
                </div>
                <div>
                    <p className="font-bold text-zinc-700 mb-1">Pagos 100% seguros con Mercado Pago</p>
                    <p className="text-sm text-zinc-500 leading-relaxed">
                        Aceptamos tarjetas de crédito y débito (Visa, Mastercard, AMEX), PayPal, transacciones OXXO y transferencias bancarias. Todos los pagos están protegidos con encriptación SSL de 256 bits. Puedes cancelar tu suscripción en cualquier momento.
                    </p>
                </div>
            </div>
        </div>
    )
}
