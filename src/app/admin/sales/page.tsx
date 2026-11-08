'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase-client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
    DollarSign,
    CreditCard,
    Building2,
    TrendingUp,
    Calendar,
    Search,
    Download,
    CheckCircle2,
    Clock,
    XCircle,
    ArrowUpRight,
    Users,
    Filter,
    Loader2,
    RefreshCw,
    ExternalLink,
    Tag,
    Home,
    Award
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import Link from 'next/link'

interface PaymentRecord {
    id: string
    user_id: string | null
    plan_name: string
    amount: number
    currency: string
    status: string
    payment_method: string | null
    gateway: string | null
    paypal_order_id: string | null
    mp_payment_id: string | null
    billing_period: string | null
    agent_name_snapshot?: string | null
    agent_email_snapshot?: string | null
    created_at: string
    agent?: {
        full_name: string | null
        email: string | null
        avatar_url: string | null
        company_name: string | null
    }
}

interface SoldPropertyRecord {
    id: string
    title: string
    price: number
    property_type: string
    location: string
    status: string
    main_image_url: string | null
    created_at: string
    updated_at: string
    agent_id: string
    agent?: {
        full_name: string | null
        email: string | null
    }
}

export default function AdminSalesPage() {
    const [supabase] = useState(() => createClient())
    const [activeTab, setActiveTab] = useState<'subscriptions' | 'properties'>('subscriptions')
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    // Datos de Suscripciones
    const [payments, setPayments] = useState<PaymentRecord[]>([])
    const [subSearch, setSubSearch] = useState('')
    const [subPlanFilter, setSubPlanFilter] = useState('all')
    const [subStatusFilter, setSubStatusFilter] = useState('all')

    // Datos de Inmuebles Vendidos
    const [soldProperties, setSoldProperties] = useState<SoldPropertyRecord[]>([])
    const [propSearch, setPropSearch] = useState('')
    const [propTypeFilter, setPropTypeFilter] = useState('all')

    useEffect(() => {
        fetchSalesData()
    }, [])

    async function fetchSalesData() {
        setLoading(true)
        try {
            // 1. Obtener pagos de suscripciones (con respaldo si las columnas snapshot aún no se migran)
            let { data: paymentsData, error: paymentsError } = await supabase
                .from('payments')
                .select(
                    'id, user_id, plan_name, amount, currency, status, payment_method, gateway, paypal_order_id, mp_payment_id, billing_period, agent_name_snapshot, agent_email_snapshot, created_at'
                )
                .order('created_at', { ascending: false })

            if (paymentsError) {
                const fallbackPayments = await supabase
                    .from('payments')
                    .select(
                        'id, user_id, plan_name, amount, currency, status, payment_method, gateway, paypal_order_id, mp_payment_id, billing_period, created_at'
                    )
                    .order('created_at', { ascending: false })
                if (fallbackPayments.error) throw fallbackPayments.error
                paymentsData = fallbackPayments.data as any
            }

            // Obtener datos de los agentes activos asociados a los pagos (filtrando user_id nulos de bajas)
            const userIds = Array.from(
                new Set((paymentsData?.map((p: any) => p.user_id) || []).filter((id): id is string => Boolean(id)))
            )
            let profilesMap = new Map()

            if (userIds.length > 0) {
                const { data: profilesData } = await supabase
                    .from('profiles')
                    .select('id, full_name, email, avatar_url, company_name')
                    .in('id', userIds)

                profilesMap = new Map(profilesData?.map(p => [p.id, p]) || [])
            }

            const enrichedPayments: PaymentRecord[] = (paymentsData || []).map((p: any) => ({
                ...p,
                agent: (p.user_id ? profilesMap.get(p.user_id) : null) || {
                    full_name: p.agent_name_snapshot || 'Agente Eliminado',
                    email: p.agent_email_snapshot || 'Cuenta dada de baja',
                    avatar_url: null,
                    company_name: null,
                },
            }))
            setPayments(enrichedPayments)

            // 2. Obtener propiedades vendidas / cerradas
            const { data: propsData, error: propsError } = await supabase
                .from('properties')
                .select('id, title, price, property_type, location, status, main_image_url, created_at, updated_at, agent_id')
                .in('status', ['sold', 'rented'])
                .order('updated_at', { ascending: false })

            if (!propsError && propsData) {
                const propAgentIds = Array.from(new Set(propsData.map(p => p.agent_id).filter(Boolean)))
                let propProfilesMap = new Map()

                if (propAgentIds.length > 0) {
                    const { data: propProfiles } = await supabase
                        .from('profiles')
                        .select('id, full_name, email')
                        .in('id', propAgentIds)
                    propProfilesMap = new Map(propProfiles?.map(p => [p.id, p]) || [])
                }

                const enrichedProps: SoldPropertyRecord[] = propsData.map(p => ({
                    ...p,
                    agent: propProfilesMap.get(p.agent_id) || { full_name: 'Agente Inmobiliario', email: '' }
                }))
                setSoldProperties(enrichedProps)
            } else {
                setSoldProperties([])
            }

        } catch (error: any) {
            console.error('Error cargando ventas:', error)
            toast.error('Error al cargar la información de ventas')
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    const handleRefresh = async () => {
        setRefreshing(true)
        await fetchSalesData()
        toast.success('Datos de ventas actualizados')
    }

    // ─── Cálculos de Suscripciones (Plataforma) ──────────────────────────────────
    const subStats = useMemo(() => {
        const approvedPayments = payments.filter(p => p.status === 'approved' || p.status === 'completed')
        const totalRevenue = approvedPayments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0)

        // Ingresos de este mes calendario
        const now = new Date()
        const currentMonth = now.getMonth()
        const currentYear = now.getFullYear()

        const monthlyRevenue = approvedPayments
            .filter(p => {
                const d = new Date(p.created_at)
                return d.getMonth() === currentMonth && d.getFullYear() === currentYear
            })
            .reduce((acc, p) => acc + (Number(p.amount) || 0), 0)

        const uniqueSubscribers = new Set(
            approvedPayments.map(p => p.user_id || p.agent_email_snapshot || p.id)
        ).size
        const averageTicket = approvedPayments.length > 0 ? totalRevenue / approvedPayments.length : 0

        return {
            totalRevenue,
            monthlyRevenue,
            uniqueSubscribers,
            averageTicket,
            totalTransactions: payments.length,
            approvedCount: approvedPayments.length
        }
    }, [payments])

    // Filtros de Suscripciones
    const filteredPayments = useMemo(() => {
        return payments.filter(p => {
            const matchesSearch =
                p.plan_name?.toLowerCase().includes(subSearch.toLowerCase()) ||
                p.agent?.full_name?.toLowerCase().includes(subSearch.toLowerCase()) ||
                p.agent?.email?.toLowerCase().includes(subSearch.toLowerCase()) ||
                p.paypal_order_id?.toLowerCase().includes(subSearch.toLowerCase()) ||
                p.id.toLowerCase().includes(subSearch.toLowerCase())

            const matchesPlan = subPlanFilter === 'all' || p.plan_name?.toLowerCase() === subPlanFilter.toLowerCase()
            const matchesStatus = subStatusFilter === 'all' || p.status?.toLowerCase() === subStatusFilter.toLowerCase()

            return matchesSearch && matchesPlan && matchesStatus
        })
    }, [payments, subSearch, subPlanFilter, subStatusFilter])

    // ─── Cálculos de Ventas Inmobiliarias ────────────────────────────────────────
    const propertyStats = useMemo(() => {
        const totalVolume = soldProperties.reduce((acc, p) => acc + (Number(p.price) || 0), 0)
        const totalSold = soldProperties.filter(p => p.status === 'sold').length
        const totalRented = soldProperties.filter(p => p.status === 'rented').length
        const avgPrice = soldProperties.length > 0 ? totalVolume / soldProperties.length : 0

        // Agente con más cierres
        const agentDealCounts: Record<string, { count: number; name: string }> = {}
        soldProperties.forEach(p => {
            const name = p.agent?.full_name || 'Agente'
            if (!agentDealCounts[name]) agentDealCounts[name] = { count: 0, name }
            agentDealCounts[name].count += 1
        })
        const topAgent = Object.values(agentDealCounts).sort((a, b) => b.count - a.count)[0]?.name || 'N/A'

        return {
            totalVolume,
            totalSold,
            totalRented,
            totalClosed: soldProperties.length,
            avgPrice,
            topAgent
        }
    }, [soldProperties])

    // Filtros de Inmuebles
    const filteredProperties = useMemo(() => {
        return soldProperties.filter(p => {
            const matchesSearch =
                p.title?.toLowerCase().includes(propSearch.toLowerCase()) ||
                p.location?.toLowerCase().includes(propSearch.toLowerCase()) ||
                p.agent?.full_name?.toLowerCase().includes(propSearch.toLowerCase())

            const matchesType = propTypeFilter === 'all' || p.property_type?.toLowerCase() === propTypeFilter.toLowerCase()

            return matchesSearch && matchesType
        })
    }, [soldProperties, propSearch, propTypeFilter])

    // ─── Exportar a CSV ──────────────────────────────────────────────────────────
    const handleExportCSV = () => {
        if (activeTab === 'subscriptions') {
            if (filteredPayments.length === 0) {
                toast.info('No hay transacciones para exportar')
                return
            }
            const headers = ['ID', 'Fecha', 'Agente', 'Email', 'Plan', 'Periodo', 'Monto (MXN)', 'Estado', 'Pasarela', 'Referencia']
            const rows = filteredPayments.map(p => [
                p.id,
                new Date(p.created_at).toISOString(),
                `"${p.agent?.full_name || ''}"`,
                `"${p.agent?.email || ''}"`,
                p.plan_name,
                p.billing_period || 'monthly',
                p.amount,
                p.status,
                p.gateway || 'paypal',
                `"${p.paypal_order_id || p.mp_payment_id || ''}"`
            ])
            const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
            const encodedUri = encodeURI(csvContent)
            const link = document.createElement('a')
            link.setAttribute('href', encodedUri)
            link.setAttribute('download', `ventas_suscripciones_${new Date().toISOString().slice(0, 10)}.csv`)
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            toast.success('Reporte de suscripciones exportado a CSV')
        } else {
            if (filteredProperties.length === 0) {
                toast.info('No hay propiedades cerradas para exportar')
                return
            }
            const headers = ['ID', 'Propiedad', 'Tipo', 'Ubicación', 'Agente', 'Precio (MXN)', 'Estado', 'Fecha']
            const rows = filteredProperties.map(p => [
                p.id,
                `"${p.title.replace(/"/g, '""')}"`,
                p.property_type,
                `"${p.location || ''}"`,
                `"${p.agent?.full_name || ''}"`,
                p.price,
                p.status,
                new Date(p.updated_at).toISOString()
            ])
            const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
            const encodedUri = encodeURI(csvContent)
            const link = document.createElement('a')
            link.setAttribute('href', encodedUri)
            link.setAttribute('download', `ventas_inmobiliarias_${new Date().toISOString().slice(0, 10)}.csv`)
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            toast.success('Reporte inmobiliario exportado a CSV')
        }
    }

    if (loading) {
        return (
            <div className="p-8 flex flex-col items-center justify-center min-h-[500px] space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                <p className="text-sm font-bold text-zinc-500">Cargando métricas de ventas y facturación...</p>
            </div>
        )
    }

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            {/* ── Header ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-zinc-200">
                <div>
                    <h1 className="text-3xl font-black text-zinc-900 tracking-tight flex items-center gap-3">
                        <DollarSign className="h-8 w-8 text-emerald-600 bg-emerald-50 p-1.5 rounded-2xl" />
                        Ventas & Facturación
                    </h1>
                    <p className="text-zinc-500 text-sm mt-1">
                        Control financiero de suscripciones en la plataforma y volumen inmobiliario cerrado.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="rounded-xl font-bold gap-2 text-zinc-600"
                    >
                        <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
                        Refrescar
                    </Button>
                    <Button
                        onClick={handleExportCSV}
                        size="sm"
                        className="rounded-xl font-bold gap-2 bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20"
                    >
                        <Download className="h-4 w-4" />
                        Exportar CSV
                    </Button>
                </div>
            </div>

            {/* ── Selector de Pestañas Principales ── */}
            <div className="flex items-center gap-2 p-1.5 bg-zinc-200/60 rounded-2xl w-fit">
                <button
                    onClick={() => setActiveTab('subscriptions')}
                    className={cn(
                        "flex items-center gap-2.5 px-6 py-2.5 rounded-xl font-bold text-sm transition-all",
                        activeTab === 'subscriptions'
                            ? "bg-white text-zinc-900 shadow-md shadow-zinc-950/5"
                            : "text-zinc-600 hover:text-zinc-900"
                    )}
                >
                    <CreditCard className="h-4 w-4 text-blue-600" />
                    Suscripciones Plataforma
                    <Badge variant="secondary" className="ml-1 bg-blue-50 text-blue-700 text-[10px] font-black">
                        {payments.length}
                    </Badge>
                </button>
                <button
                    onClick={() => setActiveTab('properties')}
                    className={cn(
                        "flex items-center gap-2.5 px-6 py-2.5 rounded-xl font-bold text-sm transition-all",
                        activeTab === 'properties'
                            ? "bg-white text-zinc-900 shadow-md shadow-zinc-950/5"
                            : "text-zinc-600 hover:text-zinc-900"
                    )}
                >
                    <Building2 className="h-4 w-4 text-emerald-600" />
                    Cierres Inmobiliarios
                    <Badge variant="secondary" className="ml-1 bg-emerald-50 text-emerald-700 text-[10px] font-black">
                        {soldProperties.length}
                    </Badge>
                </button>
            </div>

            {/* ─────────────────────────────────────────────────────────────────────────── */}
            {/* PESTAÑA 1: SUSCRIPCIONES Y MEMBRESÍAS                                      */}
            {/* ─────────────────────────────────────────────────────────────────────────── */}
            {activeTab === 'subscriptions' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                    {/* KPIs de Suscripciones */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        <Card className="rounded-3xl border-zinc-200/80 shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader className="pb-2">
                                <CardDescription className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                                    Ingresos Totales (Cobrados)
                                </CardDescription>
                                <CardTitle className="text-3xl font-black text-zinc-900">
                                    ${subStats.totalRevenue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                    <span className="text-xs font-bold text-zinc-400 ml-1">MXN</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    {subStats.approvedCount} pagos exitosos registrados
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="rounded-3xl border-zinc-200/80 shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader className="pb-2">
                                <CardDescription className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                                    Ingresos Mes en Curso
                                </CardDescription>
                                <CardTitle className="text-3xl font-black text-blue-600">
                                    ${subStats.monthlyRevenue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                    <span className="text-xs font-bold text-zinc-400 ml-1">MXN</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-xs text-zinc-500 font-medium">
                                    Recaudación del mes calendario actual
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="rounded-3xl border-zinc-200/80 shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader className="pb-2">
                                <CardDescription className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                                    Suscriptores Activos
                                </CardDescription>
                                <CardTitle className="text-3xl font-black text-zinc-900">
                                    {subStats.uniqueSubscribers}
                                    <span className="text-sm font-medium text-zinc-400 ml-1.5">agentes</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-xs text-indigo-600 font-bold flex items-center gap-1">
                                    <Users className="h-3.5 w-3.5" />
                                    Planes de pago vigentes
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="rounded-3xl border-zinc-200/80 shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader className="pb-2">
                                <CardDescription className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                                    Ticket Promedio
                                </CardDescription>
                                <CardTitle className="text-3xl font-black text-zinc-900">
                                    ${Math.round(subStats.averageTicket).toLocaleString('es-MX')}
                                    <span className="text-xs font-bold text-zinc-400 ml-1">MXN</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-xs text-zinc-500 font-medium">
                                    Promedio por venta realizada
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Tabla de Pagos */}
                    <Card className="rounded-3xl border-zinc-200/80 shadow-sm overflow-hidden">
                        <CardHeader className="border-b border-zinc-100 bg-zinc-50/50 p-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <CardTitle className="text-lg font-black text-zinc-900">
                                        Historial de Transacciones de Suscripciones
                                    </CardTitle>
                                    <CardDescription className="text-xs mt-0.5">
                                        Registro en tiempo real de los pagos procesados por PayPal y pasarelas
                                    </CardDescription>
                                </div>

                                {/* Filtros y Buscador */}
                                <div className="flex flex-wrap items-center gap-3">
                                    <div className="relative w-64">
                                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                        <Input
                                            value={subSearch}
                                            onChange={(e) => setSubSearch(e.target.value)}
                                            placeholder="Buscar agente, email o ref..."
                                            className="pl-9 h-10 rounded-xl text-xs bg-white border-zinc-200"
                                        />
                                    </div>

                                    <select
                                        value={subPlanFilter}
                                        onChange={(e) => setSubPlanFilter(e.target.value)}
                                        className="h-10 px-3 rounded-xl text-xs bg-white border border-zinc-200 font-medium text-zinc-700 outline-none"
                                    >
                                        <option value="all">Todos los planes</option>
                                        <option value="pro">Plan Pro</option>
                                        <option value="platino">Plan Platino</option>
                                        <option value="enterprise">Plan Enterprise</option>
                                    </select>

                                    <select
                                        value={subStatusFilter}
                                        onChange={(e) => setSubStatusFilter(e.target.value)}
                                        className="h-10 px-3 rounded-xl text-xs bg-white border border-zinc-200 font-medium text-zinc-700 outline-none"
                                    >
                                        <option value="all">Todos los estados</option>
                                        <option value="approved">Aprobados</option>
                                        <option value="pending">Pendientes</option>
                                        <option value="rejected">Rechazados</option>
                                    </select>
                                </div>
                            </div>
                        </CardHeader>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="border-b border-zinc-100 bg-zinc-50/80 text-[11px] font-black uppercase tracking-wider text-zinc-400">
                                        <th className="py-3.5 px-6">Fecha & Hora</th>
                                        <th className="py-3.5 px-6">Agente</th>
                                        <th className="py-3.5 px-6">Plan / Período</th>
                                        <th className="py-3.5 px-6">Monto</th>
                                        <th className="py-3.5 px-6">Pasarela</th>
                                        <th className="py-3.5 px-6">Estado</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100 text-zinc-700">
                                    {filteredPayments.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="py-12 text-center text-zinc-400 font-medium">
                                                No se encontraron transacciones con los filtros seleccionados.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredPayments.map((p) => {
                                            const isApproved = p.status === 'approved' || p.status === 'completed'
                                            const isPending = p.status === 'pending'
                                            return (
                                                <tr key={p.id} className="hover:bg-zinc-50/70 transition-colors">
                                                    <td className="py-4 px-6 font-medium text-zinc-500 whitespace-nowrap">
                                                        {new Date(p.created_at).toLocaleDateString('es-MX', {
                                                            day: '2-digit',
                                                            month: 'short',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">
                                                                {p.agent?.full_name?.charAt(0) || 'A'}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-zinc-900 leading-tight">
                                                                    {p.agent?.full_name || 'Agente'}
                                                                </p>
                                                                <p className="text-[11px] text-zinc-400 font-normal">
                                                                    {p.agent?.email || p.user_id.slice(0, 8)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <div className="flex items-center gap-2">
                                                            <Badge className={cn(
                                                                "border font-bold text-[10px] uppercase",
                                                                p.plan_name === 'Pro'
                                                                    ? "bg-blue-50 text-blue-700 border-blue-200"
                                                                    : "bg-purple-50 text-purple-700 border-purple-200"
                                                            )}>
                                                                Plan {p.plan_name}
                                                            </Badge>
                                                            <span className="text-[11px] text-zinc-400 capitalize">
                                                                {p.billing_period === 'yearly' ? 'Anual' : 'Mensual'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <span className="text-sm font-black text-zinc-900 tabular-nums">
                                                            ${Number(p.amount).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                                        </span>
                                                        <span className="text-[10px] text-zinc-400 font-bold ml-1">
                                                            {p.currency || 'MXN'}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-zinc-800 flex items-center gap-1.5 capitalize">
                                                                <span className="h-2 w-2 rounded-full bg-blue-500" />
                                                                {p.gateway || 'paypal'}
                                                            </span>
                                                            {(p.paypal_order_id || p.mp_payment_id) && (
                                                                <span className="text-[10px] font-mono text-zinc-400 truncate max-w-[130px]" title={p.paypal_order_id || p.mp_payment_id || ''}>
                                                                    {p.paypal_order_id || p.mp_payment_id}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <Badge className={cn(
                                                            "font-bold text-[10px] border",
                                                            isApproved && "bg-emerald-50 text-emerald-700 border-emerald-200",
                                                            isPending && "bg-amber-50 text-amber-700 border-amber-200",
                                                            !isApproved && !isPending && "bg-red-50 text-red-700 border-red-200"
                                                        )}>
                                                            {isApproved ? 'Aprobado' : isPending ? 'Pendiente' : 'Rechazado'}
                                                        </Badge>
                                                    </td>
                                                </tr>
                                            )
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            )}

            {/* ─────────────────────────────────────────────────────────────────────────── */}
            {/* PESTAÑA 2: VENTAS INMOBILIARIAS (CIERRES DE PROPIEDADES)                    */}
            {/* ─────────────────────────────────────────────────────────────────────────── */}
            {activeTab === 'properties' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                    {/* KPIs de Inmuebles */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        <Card className="rounded-3xl border-zinc-200/80 shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader className="pb-2">
                                <CardDescription className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                                    Volumen Total Transaccionado
                                </CardDescription>
                                <CardTitle className="text-3xl font-black text-zinc-900">
                                    ${propertyStats.totalVolume.toLocaleString('es-MX')}
                                    <span className="text-xs font-bold text-zinc-400 ml-1">MXN</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                                    <TrendingUp className="h-3.5 w-3.5" />
                                    Monto total en cierres de catálogo
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="rounded-3xl border-zinc-200/80 shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader className="pb-2">
                                <CardDescription className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                                    Propiedades Cerradas
                                </CardDescription>
                                <CardTitle className="text-3xl font-black text-emerald-600">
                                    {propertyStats.totalClosed}
                                    <span className="text-sm font-medium text-zinc-400 ml-1.5">inmuebles</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-xs text-zinc-500 font-medium">
                                    {propertyStats.totalSold} vendidas · {propertyStats.totalRented} rentadas
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="rounded-3xl border-zinc-200/80 shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader className="pb-2">
                                <CardDescription className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                                    Precio Promedio de Venta
                                </CardDescription>
                                <CardTitle className="text-3xl font-black text-zinc-900">
                                    ${Math.round(propertyStats.avgPrice).toLocaleString('es-MX')}
                                    <span className="text-xs font-bold text-zinc-400 ml-1">MXN</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-xs text-zinc-500 font-medium">
                                    Valor medio por propiedad cerrada
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="rounded-3xl border-zinc-200/80 shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader className="pb-2">
                                <CardDescription className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                                    Top Agente en Cierres
                                </CardDescription>
                                <CardTitle className="text-2xl font-black text-indigo-600 truncate" title={propertyStats.topAgent}>
                                    {propertyStats.topAgent}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-xs text-indigo-600 font-bold flex items-center gap-1">
                                    <Award className="h-3.5 w-3.5" />
                                    Mayor cantidad de operaciones
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Tabla de Inmuebles Vendidos */}
                    <Card className="rounded-3xl border-zinc-200/80 shadow-sm overflow-hidden">
                        <CardHeader className="border-b border-zinc-100 bg-zinc-50/50 p-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <CardTitle className="text-lg font-black text-zinc-900">
                                        Historial de Propiedades Vendidas y Rentadas
                                    </CardTitle>
                                    <CardDescription className="text-xs mt-0.5">
                                        Operaciones marcadas como exitosas en la plataforma
                                    </CardDescription>
                                </div>

                                {/* Buscador y Filtros de Inmuebles */}
                                <div className="flex flex-wrap items-center gap-3">
                                    <div className="relative w-64">
                                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                        <Input
                                            value={propSearch}
                                            onChange={(e) => setPropSearch(e.target.value)}
                                            placeholder="Buscar propiedad, zona o agente..."
                                            className="pl-9 h-10 rounded-xl text-xs bg-white border-zinc-200"
                                        />
                                    </div>

                                    <select
                                        value={propTypeFilter}
                                        onChange={(e) => setPropTypeFilter(e.target.value)}
                                        className="h-10 px-3 rounded-xl text-xs bg-white border border-zinc-200 font-medium text-zinc-700 outline-none"
                                    >
                                        <option value="all">Todos los tipos</option>
                                        <option value="casa">Casa</option>
                                        <option value="departamento">Departamento</option>
                                        <option value="terreno">Terreno</option>
                                        <option value="local">Comercial</option>
                                    </select>
                                </div>
                            </div>
                        </CardHeader>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="border-b border-zinc-100 bg-zinc-50/80 text-[11px] font-black uppercase tracking-wider text-zinc-400">
                                        <th className="py-3.5 px-6">Inmueble</th>
                                        <th className="py-3.5 px-6">Tipo & Zona</th>
                                        <th className="py-3.5 px-6">Agente</th>
                                        <th className="py-3.5 px-6">Precio de Cierre</th>
                                        <th className="py-3.5 px-6">Fecha Cierre</th>
                                        <th className="py-3.5 px-6">Estado</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100 text-zinc-700">
                                    {filteredProperties.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="py-12 text-center text-zinc-400 font-medium">
                                                No se encontraron propiedades marcadas como vendidas o rentadas aún.
                                                <p className="text-[11px] text-zinc-400 mt-1">
                                                    Cuando los agentes cambien el estado de sus propiedades a &quot;sold&quot; o &quot;rented&quot;, se reflejarán aquí.
                                                </p>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredProperties.map((p) => {
                                            const isSold = p.status === 'sold'
                                            return (
                                                <tr key={p.id} className="hover:bg-zinc-50/70 transition-colors">
                                                    <td className="py-4 px-6">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-10 w-12 rounded-xl bg-zinc-100 overflow-hidden relative shrink-0 border border-zinc-200">
                                                                {p.main_image_url ? (
                                                                    // eslint-disable-next-line @next/next/no-img-element
                                                                    <img
                                                                        src={p.main_image_url}
                                                                        alt={p.title}
                                                                        className="h-full w-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <Home className="h-5 w-5 text-zinc-400 m-auto mt-2.5" />
                                                                )}
                                                            </div>
                                                            <div>
                                                                <Link
                                                                    href={`/propiedades/${p.id}`}
                                                                    target="_blank"
                                                                    className="font-bold text-zinc-900 hover:text-blue-600 transition-colors flex items-center gap-1 leading-tight"
                                                                >
                                                                    {p.title}
                                                                    <ExternalLink className="h-3 w-3 text-zinc-400" />
                                                                </Link>
                                                                <span className="text-[10px] text-zinc-400 font-mono">
                                                                    ID: {p.id.slice(0, 8)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-zinc-800 capitalize">
                                                                {p.property_type || 'Inmueble'}
                                                            </span>
                                                            <span className="text-[11px] text-zinc-400 truncate max-w-[150px]">
                                                                {p.location || 'Sin ubicación'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <span className="font-bold text-zinc-900">
                                                            {p.agent?.full_name || 'Agente'}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <span className="text-sm font-black text-emerald-700 tabular-nums">
                                                            ${Number(p.price).toLocaleString('es-MX')}
                                                        </span>
                                                        <span className="text-[10px] text-zinc-400 font-bold ml-1">MXN</span>
                                                    </td>
                                                    <td className="py-4 px-6 text-zinc-500 whitespace-nowrap">
                                                        {new Date(p.updated_at).toLocaleDateString('es-MX', {
                                                            day: '2-digit',
                                                            month: 'short',
                                                            year: 'numeric'
                                                        })}
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <Badge className={cn(
                                                            "font-bold text-[10px] border",
                                                            isSold
                                                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                                : "bg-blue-50 text-blue-700 border-blue-200"
                                                        )}>
                                                            {isSold ? 'Vendida' : 'Rentada'}
                                                        </Badge>
                                                    </td>
                                                </tr>
                                            )
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    )
}
