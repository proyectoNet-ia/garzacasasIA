'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
    Eye, MessageSquare, Phone, TrendingUp,
    Users, Building2, Loader2, Crown, Award,
    ArrowUpRight, ArrowDownRight, BarChart3, Star
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

interface AgentPerformance {
    id: string
    full_name: string
    email: string
    avatar_url: string | null
    company_name: string | null
    role: string
    total_properties: number
    total_views: number
    total_whatsapp_clicks: number
    total_phone_clicks: number
    total_favorites: number
    avg_views_per_property: number
    engagement_rate: number
}

export default function AdminAnalyticsPage() {
    const [loading, setLoading] = useState(true)
    const [agents, setAgents] = useState<AgentPerformance[]>([])
    const [platformStats, setPlatformStats] = useState<any>(null)
    const [sortBy, setSortBy] = useState<'views' | 'engagement' | 'properties'>('views')
    const supabase = createClient()

    useEffect(() => {
        fetchData()
    }, [sortBy])

    async function fetchData() {
        setLoading(true)
        try {
            // Fetch all agents with their stats
            const { data: agentsData } = await supabase
                .from('profiles')
                .select(`
                    id,
                    full_name,
                    email,
                    avatar_url,
                    company_name,
                    role
                `)
                .eq('role', 'agent')

            if (!agentsData) return

            // Fetch stats for each agent
            const agentsWithStats = await Promise.all(
                agentsData.map(async (agent) => {
                    const { data: statsCache } = await supabase
                        .from('agent_stats_cache')
                        .select('*')
                        .eq('agent_id', agent.id)
                        .single()

                    const stats = statsCache || {
                        total_properties: 0,
                        total_views: 0,
                        total_whatsapp_clicks: 0,
                        total_phone_clicks: 0,
                        total_favorites: 0,
                        avg_views_per_property: 0
                    }

                    const totalInteractions = stats.total_whatsapp_clicks + stats.total_phone_clicks
                    const engagementRate = stats.total_views > 0
                        ? (totalInteractions / stats.total_views) * 100
                        : 0

                    return {
                        ...agent,
                        ...stats,
                        engagement_rate: engagementRate
                    }
                })
            )

            // Sort agents
            const sorted = agentsWithStats.sort((a, b) => {
                if (sortBy === 'views') return b.total_views - a.total_views
                if (sortBy === 'engagement') return b.engagement_rate - a.engagement_rate
                if (sortBy === 'properties') return b.total_properties - a.total_properties
                return 0
            })

            setAgents(sorted)

            // Calculate platform-wide stats
            const platformTotals = agentsWithStats.reduce((acc, agent) => ({
                totalAgents: acc.totalAgents + 1,
                totalProperties: acc.totalProperties + agent.total_properties,
                totalViews: acc.totalViews + agent.total_views,
                totalWhatsAppClicks: acc.totalWhatsAppClicks + agent.total_whatsapp_clicks,
                totalPhoneClicks: acc.totalPhoneClicks + agent.total_phone_clicks,
                totalFavorites: acc.totalFavorites + agent.total_favorites
            }), {
                totalAgents: 0,
                totalProperties: 0,
                totalViews: 0,
                totalWhatsAppClicks: 0,
                totalPhoneClicks: 0,
                totalFavorites: 0
            })

            setPlatformStats(platformTotals)
        } catch (error) {
            console.error('Error fetching analytics:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        )
    }

    const platformCards = [
        {
            title: 'Total de Agentes',
            value: platformStats?.totalAgents || 0,
            icon: Users,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50'
        },
        {
            title: 'Propiedades Totales',
            value: platformStats?.totalProperties || 0,
            icon: Building2,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50'
        },
        {
            title: 'Vistas Totales',
            value: platformStats?.totalViews || 0,
            icon: Eye,
            color: 'text-green-600',
            bgColor: 'bg-green-50'
        },
        {
            title: 'Contactos Generados',
            value: (platformStats?.totalWhatsAppClicks || 0) + (platformStats?.totalPhoneClicks || 0),
            icon: MessageSquare,
            color: 'text-orange-600',
            bgColor: 'bg-orange-50'
        }
    ]

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-zinc-900">Analytics Global</h1>
                    <p className="text-zinc-500 mt-2">Monitoreo de rendimiento de todos los agentes</p>
                </div>
                <Button
                    onClick={fetchData}
                    variant="outline"
                    className="border-zinc-200 hover:bg-zinc-50"
                >
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Actualizar
                </Button>
            </div>

            {/* Platform Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {platformCards.map((stat, i) => (
                    <Card key={i} className="border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`h-12 w-12 rounded-2xl ${stat.bgColor} flex items-center justify-center`}>
                                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-3xl font-black text-zinc-900">{stat.value.toLocaleString()}</p>
                                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{stat.title}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Sorting Controls */}
            <Card className="border-zinc-200 shadow-sm">
                <CardHeader className="border-b border-zinc-100 bg-zinc-50/50">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <CardTitle className="text-xl">Ranking de Agentes</CardTitle>
                            <CardDescription>Desempeño individual de cada agente</CardDescription>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant={sortBy === 'views' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setSortBy('views')}
                                className={sortBy === 'views' ? 'bg-blue-600' : ''}
                            >
                                <Eye className="mr-2 h-4 w-4" />
                                Por Vistas
                            </Button>
                            <Button
                                variant={sortBy === 'engagement' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setSortBy('engagement')}
                                className={sortBy === 'engagement' ? 'bg-blue-600' : ''}
                            >
                                <TrendingUp className="mr-2 h-4 w-4" />
                                Por Engagement
                            </Button>
                            <Button
                                variant={sortBy === 'properties' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setSortBy('properties')}
                                className={sortBy === 'properties' ? 'bg-blue-600' : ''}
                            >
                                <Building2 className="mr-2 h-4 w-4" />
                                Por Propiedades
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    {agents.length > 0 ? (
                        <div className="space-y-4">
                            {agents.map((agent, i) => (
                                <div
                                    key={agent.id}
                                    className="flex items-center gap-4 p-6 rounded-2xl border border-zinc-100 hover:bg-zinc-50 transition-all hover:shadow-md"
                                >
                                    {/* Ranking Badge */}
                                    <div className="relative shrink-0">
                                        {i < 3 && (
                                            <div className="absolute -top-2 -right-2 z-10">
                                                {i === 0 && <Crown className="h-6 w-6 text-amber-500 fill-amber-500" />}
                                                {i === 1 && <Award className="h-6 w-6 text-zinc-400 fill-zinc-400" />}
                                                {i === 2 && <Award className="h-6 w-6 text-orange-600 fill-orange-600" />}
                                            </div>
                                        )}
                                        <div className={`flex items-center justify-center h-14 w-14 rounded-xl font-black text-lg shrink-0 ${i === 0 ? 'bg-amber-500 text-white' :
                                                i === 1 ? 'bg-zinc-400 text-white' :
                                                    i === 2 ? 'bg-orange-600 text-white' :
                                                        'bg-zinc-100 text-zinc-600'
                                            }`}>
                                            #{i + 1}
                                        </div>
                                    </div>

                                    {/* Avatar */}
                                    <div className="h-14 w-14 rounded-xl overflow-hidden bg-zinc-100 shrink-0 ring-2 ring-zinc-200">
                                        {agent.avatar_url ? (
                                            <img
                                                src={agent.avatar_url}
                                                alt={agent.full_name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center bg-blue-600 text-white font-bold text-xl">
                                                {agent.full_name?.charAt(0) || agent.email?.charAt(0) || '?'}
                                            </div>
                                        )}
                                    </div>

                                    {/* Agent Info */}
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-zinc-900 truncate">{agent.full_name || 'Sin nombre'}</h4>
                                        <p className="text-sm text-zinc-500 truncate">{agent.company_name || agent.email}</p>
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="hidden lg:grid grid-cols-4 gap-6 shrink-0">
                                        <div className="text-center">
                                            <div className="flex items-center justify-center gap-1 text-blue-600 font-bold">
                                                <Building2 className="h-4 w-4" />
                                                {agent.total_properties}
                                            </div>
                                            <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1">Propiedades</p>
                                        </div>
                                        <div className="text-center">
                                            <div className="flex items-center justify-center gap-1 text-green-600 font-bold">
                                                <Eye className="h-4 w-4" />
                                                {agent.total_views}
                                            </div>
                                            <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1">Vistas</p>
                                        </div>
                                        <div className="text-center">
                                            <div className="flex items-center justify-center gap-1 text-purple-600 font-bold">
                                                <MessageSquare className="h-4 w-4" />
                                                {agent.total_whatsapp_clicks + agent.total_phone_clicks}
                                            </div>
                                            <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1">Contactos</p>
                                        </div>
                                        <div className="text-center">
                                            <div className={`flex items-center justify-center gap-1 font-bold ${agent.engagement_rate >= 10 ? 'text-green-600' :
                                                    agent.engagement_rate >= 5 ? 'text-orange-600' :
                                                        'text-red-600'
                                                }`}>
                                                <TrendingUp className="h-4 w-4" />
                                                {agent.engagement_rate.toFixed(1)}%
                                            </div>
                                            <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1">Engagement</p>
                                        </div>
                                    </div>

                                    {/* Mobile Stats */}
                                    <div className="lg:hidden flex flex-col gap-2 shrink-0">
                                        <Badge variant="outline" className="border-blue-200 text-blue-700 text-xs">
                                            {agent.total_views} vistas
                                        </Badge>
                                        <Badge variant="outline" className="border-green-200 text-green-700 text-xs">
                                            {agent.engagement_rate.toFixed(1)}% engagement
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-zinc-500">
                            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p className="font-medium">No hay agentes registrados</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Performance Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Performers */}
                <Card className="border-zinc-200 shadow-sm">
                    <CardHeader className="border-b border-zinc-100 bg-gradient-to-r from-amber-50 to-orange-50">
                        <CardTitle className="text-lg flex items-center gap-2 text-amber-900">
                            <Star className="h-5 w-5 fill-amber-500 text-amber-500" />
                            Top 3 Agentes del Mes
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-3">
                        {agents.slice(0, 3).map((agent, i) => (
                            <div key={agent.id} className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50">
                                <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold ${i === 0 ? 'bg-amber-500 text-white' :
                                        i === 1 ? 'bg-zinc-400 text-white' :
                                            'bg-orange-600 text-white'
                                    }`}>
                                    {i + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-zinc-900 truncate text-sm">{agent.full_name}</p>
                                    <p className="text-xs text-zinc-500">{agent.total_views} vistas totales</p>
                                </div>
                                <Badge className="bg-green-100 text-green-700 border-green-200">
                                    {agent.engagement_rate.toFixed(1)}%
                                </Badge>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Platform Health */}
                <Card className="border-zinc-200 shadow-sm">
                    <CardHeader className="border-b border-zinc-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                        <CardTitle className="text-lg flex items-center gap-2 text-blue-900">
                            <BarChart3 className="h-5 w-5" />
                            Salud de la Plataforma
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-zinc-600 font-medium">Tasa de Conversión Global</span>
                            <span className="text-2xl font-bold text-blue-600">
                                {platformStats?.totalViews > 0
                                    ? (((platformStats.totalWhatsAppClicks + platformStats.totalPhoneClicks) / platformStats.totalViews) * 100).toFixed(1)
                                    : 0}%
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-zinc-600 font-medium">Promedio de Propiedades/Agente</span>
                            <span className="text-2xl font-bold text-purple-600">
                                {platformStats?.totalAgents > 0
                                    ? Math.round(platformStats.totalProperties / platformStats.totalAgents)
                                    : 0}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-zinc-600 font-medium">Vistas Promedio/Propiedad</span>
                            <span className="text-2xl font-bold text-green-600">
                                {platformStats?.totalProperties > 0
                                    ? Math.round(platformStats.totalViews / platformStats.totalProperties)
                                    : 0}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
