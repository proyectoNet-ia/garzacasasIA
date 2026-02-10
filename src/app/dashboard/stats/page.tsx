'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
    Eye, MessageSquare, Phone, Heart, TrendingUp,
    BarChart3, Loader2, ArrowUpRight, ArrowDownRight,
    Users, Building2
} from 'lucide-react'
import { getAgentStats, refreshAgentStats, getTopProperties } from '@/lib/analytics'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function StatsPage() {
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState<any>(null)
    const [topProperties, setTopProperties] = useState<any[]>([])
    const [refreshing, setRefreshing] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        fetchData()
    }, [])

    async function fetchData() {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // Fetch cached stats
            const agentStats = await getAgentStats(user.id)
            setStats(agentStats)

            // Fetch top performing properties
            const topProps = await getTopProperties(user.id, 5)
            setTopProperties(topProps)
        } catch (error) {
            console.error('Error fetching stats:', error)
        } finally {
            setLoading(false)
        }
    }

    async function handleRefresh() {
        setRefreshing(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                await refreshAgentStats(user.id)
                await fetchData()
            }
        } catch (error) {
            console.error('Error refreshing stats:', error)
        } finally {
            setRefreshing(false)
        }
    }

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        )
    }

    const statCards = [
        {
            title: 'Total de Vistas',
            value: stats?.total_views || 0,
            icon: Eye,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            trend: '+12%',
            trendUp: true
        },
        {
            title: 'Clicks en WhatsApp',
            value: stats?.total_whatsapp_clicks || 0,
            icon: MessageSquare,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
            trend: '+8%',
            trendUp: true
        },
        {
            title: 'Llamadas Telefónicas',
            value: stats?.total_phone_clicks || 0,
            icon: Phone,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
            trend: '+5%',
            trendUp: true
        },
        {
            title: 'Propiedades Favoritas',
            value: stats?.total_favorites || 0,
            icon: Heart,
            color: 'text-red-600',
            bgColor: 'bg-red-50',
            trend: '-2%',
            trendUp: false
        }
    ]

    return (
        <div className="p-4 lg:p-8 space-y-6 lg:space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-black text-zinc-900 leading-tight">Estadísticas de Rendimiento</h1>
                    <p className="text-sm text-zinc-500 mt-1">Analiza el desempeño en tiempo real</p>
                </div>
                <Button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    variant="outline"
                    className="border-zinc-200 hover:bg-zinc-50 w-full md:w-auto h-12 md:h-10 font-bold md:font-medium"
                >
                    {refreshing ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Actualizando...
                        </>
                    ) : (
                        <>
                            <TrendingUp className="mr-2 h-4 w-4" />
                            Actualizar Datos
                        </>
                    )}
                </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
                {statCards.map((stat, i) => (
                    <Card key={i} className="border-zinc-200 shadow-sm overflow-hidden">
                        <CardContent className="p-4 lg:p-6">
                            <div className="flex items-center justify-between mb-3 lg:mb-4">
                                <div className={`h-10 w-10 lg:h-12 lg:w-12 rounded-xl lg:rounded-2xl ${stat.bgColor} flex items-center justify-center`}>
                                    <stat.icon className={`h-5 w-5 lg:h-6 lg:w-6 ${stat.color}`} />
                                </div>
                                <div className={`hidden sm:flex items-center gap-0.5 text-[10px] lg:text-sm font-bold ${stat.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                                    {stat.trendUp ? <ArrowUpRight className="h-3 w-3 lg:h-4 lg:w-4" /> : <ArrowDownRight className="h-3 w-3 lg:h-4 lg:w-4" />}
                                    {stat.trend}
                                </div>
                            </div>
                            <div className="space-y-0.5 lg:space-y-1">
                                <p className="text-xl lg:text-3xl font-black text-zinc-900">{stat.value.toLocaleString()}</p>
                                <p className="text-[9px] lg:text-xs font-bold text-zinc-400 uppercase tracking-widest truncate">{stat.title}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                {/* Properties Overview */}
                <Card className="border-zinc-200 shadow-sm rounded-2xl">
                    <CardHeader className="border-b border-zinc-100 bg-zinc-50/50 p-4 lg:p-6">
                        <CardTitle className="text-base lg:text-lg flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-blue-600" />
                            Resumen de Propiedades
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 lg:p-6 space-y-4">
                        <div className="flex justify-between items-baseline">
                            <span className="text-sm lg:text-base text-zinc-500 font-medium">Activas</span>
                            <span className="text-xl lg:text-2xl font-black text-zinc-900">{stats?.total_properties || 0}</span>
                        </div>
                        <div className="flex justify-between items-baseline">
                            <span className="text-sm lg:text-base text-zinc-500 font-medium">Promedio Vistas</span>
                            <span className="text-xl lg:text-2xl font-black text-blue-600">
                                {Math.round(stats?.avg_views_per_property || 0)}
                            </span>
                        </div>
                        <div className="pt-4 border-t border-zinc-100">
                            <Link href="/dashboard/listings">
                                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-12">
                                    Mis Propiedades
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                {/* Engagement Rate */}
                <Card className="border-zinc-200 shadow-sm rounded-2xl">
                    <CardHeader className="border-b border-zinc-100 bg-zinc-50/50 p-4 lg:p-6">
                        <CardTitle className="text-base lg:text-lg flex items-center gap-2">
                            <Users className="h-5 w-5 text-green-600" />
                            Engagement
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 lg:p-6 space-y-4 text-center">
                        <div>
                            <div className="text-4xl lg:text-5xl font-black text-green-600 mb-1 lg:mb-2">
                                {stats?.total_views > 0
                                    ? Math.round(((stats.total_whatsapp_clicks + stats.total_phone_clicks) / stats.total_views) * 100)
                                    : 0}%
                            </div>
                            <p className="text-[10px] lg:text-sm text-zinc-400 font-bold uppercase tracking-wider">
                                Conversión a contacto
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 pt-4 border-t border-zinc-100">
                            <div className="p-2 bg-zinc-50 rounded-xl">
                                <span className="block text-[8px] font-bold text-zinc-400 uppercase mb-1">WhatsApp</span>
                                <span className="text-sm font-black text-zinc-900">{stats?.total_whatsapp_clicks || 0}</span>
                            </div>
                            <div className="p-2 bg-zinc-50 rounded-xl">
                                <span className="block text-[8px] font-bold text-zinc-400 uppercase mb-1">Llamadas</span>
                                <span className="text-sm font-black text-zinc-900">{stats?.total_phone_clicks || 0}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Last Update */}
                <Card className="border-zinc-200 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl">
                    <CardHeader className="border-b border-blue-100 p-4 lg:p-6">
                        <CardTitle className="text-base lg:text-lg flex items-center gap-2 text-blue-900 font-black">
                            <BarChart3 className="h-5 w-5" />
                            Estado del Sistema
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 lg:p-6 space-y-4">
                        <div>
                            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Último rastro</p>
                            <p className="text-sm lg:text-base text-blue-700 font-bold">
                                {stats?.last_updated
                                    ? new Date(stats.last_updated).toLocaleString('es-MX', {
                                        day: 'numeric',
                                        month: 'short',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })
                                    : 'Sin datos'}
                            </p>
                        </div>
                        <div className="pt-4 border-t border-blue-100">
                            <p className="text-[11px] text-blue-900/60 leading-relaxed font-medium">
                                Los datos se sincronizan automáticamente. Refresca para ver los últimos clicks.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Top Properties */}
            <Card className="border-zinc-200 shadow-sm rounded-2xl overflow-hidden">
                <CardHeader className="border-b border-zinc-100 bg-zinc-50/50 p-4 lg:p-6">
                    <CardTitle className="text-lg lg:text-xl font-black">Ranking de Propiedades</CardTitle>
                    <CardDescription className="text-xs lg:text-sm">Tus inmuebles con mayor tracción</CardDescription>
                </CardHeader>
                <CardContent className="p-2 lg:p-6">
                    {topProperties.length > 0 ? (
                        <div className="space-y-2">
                            {topProperties.map((property, i) => (
                                <div
                                    key={property.id}
                                    className="flex items-center gap-3 lg:gap-4 p-3 lg:p-4 rounded-xl lg:rounded-2xl border border-zinc-100 hover:bg-zinc-50 transition-all group"
                                >
                                    <div className={`flex items-center justify-center h-8 w-8 lg:h-12 lg:w-12 rounded-lg lg:rounded-xl font-black text-xs lg:text-lg shrink-0 ${i === 0 ? 'bg-amber-100 text-amber-600' :
                                            i === 1 ? 'bg-zinc-100 text-zinc-500' :
                                                i === 2 ? 'bg-orange-100 text-orange-600' :
                                                    'bg-zinc-50 text-zinc-400'
                                        }`}>
                                        {i + 1}
                                    </div>
                                    <div className="h-12 w-16 lg:h-16 lg:w-24 rounded-lg lg:rounded-xl overflow-hidden bg-zinc-100 shrink-0 border border-zinc-200">
                                        <img
                                            src={property.main_image_url || 'https://via.placeholder.com/150'}
                                            alt={property.title}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-sm lg:text-base text-zinc-900 truncate leading-tight">{property.title}</h4>
                                        <div className="flex items-center gap-3 mt-1">
                                            <div className="flex items-center gap-1 text-[10px] lg:text-xs text-blue-600 font-bold">
                                                <Eye className="h-3 w-3 lg:h-3.5 lg:w-3.5" />
                                                {property.views}
                                            </div>
                                            <div className="flex items-center gap-1 text-[10px] lg:text-xs text-green-600 font-bold">
                                                <MessageSquare className="h-3 w-3 lg:h-3.5 lg:w-3.5" />
                                                {property.interactions}
                                            </div>
                                        </div>
                                    </div>
                                    <Link href={`/propiedades/${property.id}`} className="hidden sm:block">
                                        <Button variant="ghost" size="sm" className="rounded-lg font-bold">
                                            Detalles
                                        </Button>
                                    </Link>
                                    <Link href={`/propiedades/${property.id}`} className="sm:hidden">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                                            <ArrowUpRight className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 text-zinc-400">
                            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-20" />
                            <p className="font-bold text-sm uppercase tracking-widest">Esperando datos...</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
