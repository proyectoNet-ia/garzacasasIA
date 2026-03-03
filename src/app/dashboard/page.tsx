'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
    Building2, Eye, MessageSquare, TrendingUp,
    MapPin, ArrowUpRight, Crown, Star
} from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { getAgentStats, refreshAgentStats } from '@/lib/analytics'
import Link from 'next/link'
import { toast } from 'sonner'

const supabase = createClient()

interface DashboardStats {
    activeProperties: number
    totalViews: number
    totalContacts: number
    planName: string
    isUnlimited: boolean
}

interface TopProperty {
    id: string
    title: string
    location: string
    price: number
    main_image_url: string | null
    views: number
    interactions: number
}

function StatsSkeleton() {
    return (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
                <Card key={i} className="bg-white border-zinc-200 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <Skeleton className="h-4 w-28 bg-zinc-100" />
                        <Skeleton className="h-4 w-4 rounded-full bg-zinc-100" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-8 w-16 bg-zinc-100 mb-2" />
                        <Skeleton className="h-3 w-24 bg-zinc-100" />
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

function PropertiesSkeleton() {
    return (
        <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-white border border-zinc-100 shadow-sm">
                    <Skeleton className="h-14 w-20 rounded-xl bg-zinc-100 shrink-0" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-40 bg-zinc-100" />
                        <Skeleton className="h-3 w-28 bg-zinc-100" />
                    </div>
                    <div className="text-right space-y-2">
                        <Skeleton className="h-4 w-16 bg-zinc-100" />
                        <Skeleton className="h-3 w-12 bg-zinc-100" />
                    </div>
                </div>
            ))}
        </div>
    )
}

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [topProperties, setTopProperties] = useState<TopProperty[]>([])
    const [agentName, setAgentName] = useState<string>('')
    const [loadingStats, setLoadingStats] = useState(true)
    const [loadingProps, setLoadingProps] = useState(true)
    const searchParams = useSearchParams()
    const router = useRouter()

    // 🎉 Show welcome toast when agent verifies email for the first time
    useEffect(() => {
        if (searchParams.get('verified') === 'true') {
            setTimeout(() => {
                toast.success(
                    '🎉 ¡Cuenta verificada! Bienvenido a Garza Casas IA.',
                    {
                        description: 'Tu cuenta está lista. Comienza subiendo tu primera propiedad.',
                        duration: 6000,
                        action: {
                            label: 'Subir propiedad',
                            onClick: () => router.push('/dashboard/listings'),
                        },
                    }
                )
            }, 800) // slight delay so the dashboard loads first
            // Clean the URL without a re-render
            window.history.replaceState({}, '', '/dashboard')
        }
    }, [searchParams, router])

    // Load dashboard data on mount
    useEffect(() => {
        fetchDashboardData()
    }, [])

    async function fetchDashboardData() {
        try {
            // Get current user session
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // Fetch profile (name + plan info)
            const { data: profile } = await supabase
                .from('profiles')
                .select('full_name, subscription_plan, is_unlimited, role')
                .eq('id', user.id)
                .single()

            if (profile) {
                setAgentName(profile.full_name || user.email?.split('@')[0] || 'Agente')
            }

            const isUnlimited = profile?.is_unlimited || profile?.role === 'admin'
            const planName = isUnlimited ? 'Ilimitado' : (profile?.subscription_plan || 'Gratis')

            // Fetch active properties count
            const { count: activeCount } = await supabase
                .from('properties')
                .select('*', { count: 'exact', head: true })
                .eq('agent_id', user.id)
                .eq('status', 'active')

            // Refresh stats cache automatically on load
            await refreshAgentStats(user.id)

            // Fetch agent stats from cache
            const { data: statsCache } = await supabase
                .from('agent_stats_cache')
                .select('*')
                .eq('agent_id', user.id)
                .maybeSingle()

            setStats({
                activeProperties: activeCount || 0,
                totalViews: statsCache?.total_views || 0,
                totalContacts: (statsCache?.total_whatsapp_clicks || 0) + (statsCache?.total_phone_clicks || 0),
                planName,
                isUnlimited
            })
            setLoadingStats(false)

            // Fetch top properties with their view counts
            const { data: properties } = await supabase
                .from('properties')
                .select('id, title, location, price, main_image_url')
                .eq('agent_id', user.id)
                .eq('status', 'active')
                .limit(5)

            if (properties && properties.length > 0) {
                const propsWithStats = await Promise.all(
                    properties.map(async (prop) => {
                        const { count: views } = await supabase
                            .from('property_views')
                            .select('*', { count: 'exact', head: true })
                            .eq('property_id', prop.id)

                        const { count: interactions } = await supabase
                            .from('property_interactions')
                            .select('*', { count: 'exact', head: true })
                            .eq('property_id', prop.id)

                        return { ...prop, views: views || 0, interactions: interactions || 0 }
                    })
                )
                setTopProperties(propsWithStats.sort((a, b) => b.views - a.views))
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error)
        } finally {
            setLoadingStats(false)
            setLoadingProps(false)
        }
    }

    const statCards = stats ? [
        {
            label: 'Propiedades Activas',
            value: stats.activeProperties.toString(),
            icon: Building2,
            trend: 'Publicadas ahora',
            href: '/dashboard/listings'
        },
        {
            label: 'Vistas Totales',
            value: stats.totalViews.toLocaleString(),
            icon: Eye,
            trend: 'En todas tus propiedades',
            href: '/dashboard/stats'
        },
        {
            label: 'Contactos Generados',
            value: stats.totalContacts.toLocaleString(),
            icon: MessageSquare,
            trend: 'WhatsApp + Teléfono',
            href: '/dashboard/stats'
        },
        {
            label: 'Plan Activo',
            value: stats.planName,
            icon: stats.isUnlimited ? Crown : TrendingUp,
            trend: stats.isUnlimited ? 'Acceso ilimitado' : 'Ver opciones de mejora',
            href: '/dashboard/suscripcion'
        },
    ] : []

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-2">
                {loadingStats ? (
                    <>
                        <Skeleton className="h-9 w-64 bg-zinc-200" />
                        <Skeleton className="h-5 w-80 bg-zinc-200" />
                    </>
                ) : (
                    <>
                        <h1 className="text-3xl font-black text-zinc-900 font-heading">
                            Bienvenido, {agentName} 👋
                        </h1>
                        <p className="text-zinc-500 font-medium">
                            Aquí tienes un resumen de tu actividad en Garza Casas IA.
                        </p>
                    </>
                )}
            </div>

            {/* Stats Grid */}
            {loadingStats ? (
                <StatsSkeleton />
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {statCards.map((stat) => (
                        <Link key={stat.label} href={stat.href} className="h-full">
                            <Card className="h-full bg-white border-zinc-200 hover:border-blue-500/50 transition-all hover:scale-[1.02] shadow-sm cursor-pointer group flex flex-col">
                                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                    <CardTitle className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                                        {stat.label}
                                    </CardTitle>
                                    <stat.icon className="h-4 w-4 text-blue-600 transition-colors" />
                                </CardHeader>
                                <CardContent className="flex-1 flex flex-col justify-end">
                                    <div className="text-2xl font-black text-zinc-900">{stat.value}</div>
                                    <p className="text-xs text-blue-600 mt-1 font-bold flex items-center gap-1 uppercase tracking-tight">
                                        {stat.trend}
                                        <ArrowUpRight className="h-3 w-3 opacity-60" />
                                    </p>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}

            {/* Bottom Grid */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Top Properties */}
                <Card className="bg-white border-zinc-200 shadow-sm overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-50 bg-zinc-50/50">
                        <CardTitle className="text-lg font-black text-zinc-900 flex items-center gap-2 uppercase tracking-tighter">
                            <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                            Propiedades Más Vistas
                        </CardTitle>
                        <Link
                            href="/dashboard/listings"
                            className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1 uppercase tracking-widest"
                        >
                            Ver todas <ArrowUpRight className="h-3 w-3" />
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {loadingProps ? (
                            <PropertiesSkeleton />
                        ) : topProperties.length === 0 ? (
                            <div className="text-center py-10 space-y-3">
                                <Building2 className="h-10 w-10 mx-auto text-white/20" />
                                <p className="text-zinc-500 text-sm italic">
                                    Aún no tienes propiedades activas.
                                </p>
                                <Link
                                    href="/dashboard/listings"
                                    className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-white font-semibold transition-colors"
                                >
                                    Publicar primera propiedad <ArrowUpRight className="h-3 w-3" />
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {topProperties.map((prop, i) => (
                                    <Link
                                        key={prop.id}
                                        href={`/propiedades/${prop.id}`}
                                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-zinc-50 transition-all border border-transparent hover:border-zinc-100 group"
                                    >
                                        <div className="h-14 w-20 rounded-xl overflow-hidden bg-zinc-100 shrink-0 border border-zinc-200">
                                            {prop.main_image_url ? (
                                                <img
                                                    src={prop.main_image_url}
                                                    alt={prop.title}
                                                    className="h-full w-full object-cover transition-transform group-hover:scale-110"
                                                />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center">
                                                    <Building2 className="h-5 w-5 text-zinc-300" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-zinc-900 text-sm truncate group-hover:text-blue-600 transition-colors">
                                                {prop.title}
                                            </p>
                                            <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5 font-medium">
                                                <MapPin className="h-3 w-3" />
                                                {prop.location}
                                            </p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-sm font-black text-zinc-900">
                                                {prop.views} <span className="text-zinc-400 font-bold text-[10px] uppercase tracking-widest">vistas</span>
                                            </p>
                                            <p className="text-[10px] font-bold text-blue-600 mt-0.5 uppercase tracking-widest">
                                                {prop.interactions} contactos
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="bg-white border-zinc-200 shadow-sm overflow-hidden">
                    <CardHeader className="border-b border-zinc-50 bg-zinc-50/50">
                        <CardTitle className="text-lg font-black text-zinc-900 uppercase tracking-tighter">Acciones Rápidas</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-3">
                        {[
                            {
                                label: 'Publicar Nueva Propiedad',
                                desc: 'Agrega un inmueble al catálogo',
                                icon: Building2,
                                href: '/dashboard/listings',
                                color: 'text-blue-600',
                                bg: 'bg-blue-50 hover:bg-blue-100 border-blue-100'
                            },
                            {
                                label: 'Ver mis Estadísticas',
                                desc: 'Vistas, contactos y rendimiento',
                                icon: TrendingUp,
                                href: '/dashboard/stats',
                                color: 'text-emerald-600',
                                bg: 'bg-emerald-50 hover:bg-emerald-100 border-emerald-100'
                            },
                            {
                                label: 'Mejorar mi Plan',
                                desc: 'Publica más propiedades',
                                icon: Crown,
                                href: '/dashboard/suscripcion',
                                color: 'text-amber-600',
                                bg: 'bg-amber-50 hover:bg-amber-100 border-amber-100'
                            },
                            {
                                label: 'Editar Perfil',
                                desc: 'Foto, contacto y bio',
                                icon: Eye,
                                href: '/dashboard/profile',
                                color: 'text-indigo-600',
                                bg: 'bg-indigo-50 hover:bg-indigo-100 border-indigo-100'
                            },
                        ].map((action) => (
                            <Link
                                key={action.label}
                                href={action.href}
                                className={`flex items-center gap-4 p-4 rounded-xl border transition-all group ${action.bg}`}
                            >
                                <div className={`h-10 w-10 rounded-xl flex items-center justify-center bg-white shadow-sm border border-zinc-100`}>
                                    <action.icon className={`h-5 w-5 ${action.color}`} />
                                </div>
                                <div>
                                    <p className="font-bold text-zinc-900 text-sm group-hover:text-zinc-900">
                                        {action.label}
                                    </p>
                                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{action.desc}</p>
                                </div>
                                <ArrowUpRight className={`ml-auto h-4 w-4 ${action.color} opacity-0 group-hover:opacity-100 transition-all`} />
                            </Link>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
