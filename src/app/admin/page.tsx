import { createClient } from '@/lib/supabase-server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, Users, BarChart3, TrendingUp, DollarSign } from 'lucide-react'
import Link from 'next/link'

export default async function AdminDashboard() {
    const supabase = await createClient()

    // Fetch statistics
    const { count: totalProperties } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })

    const { count: totalAgents } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'agent')

    const { count: activeProperties } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')

    // Fetch total revenue from approved payments
    const { data: paymentsData } = await supabase
        .from('payments')
        .select('amount, status')
        .in('status', ['approved', 'completed'])

    const totalRevenue = (paymentsData || []).reduce((acc, p) => acc + (Number(p.amount) || 0), 0)

    const stats = [
        {
            title: 'Total Propiedades',
            value: (totalProperties || 0).toString(),
            icon: Building2,
            color: 'text-blue-600',
            description: 'En toda la plataforma',
            href: '/admin/all-properties'
        },
        {
            title: 'Propiedades Activas',
            value: (activeProperties || 0).toString(),
            icon: TrendingUp,
            color: 'text-green-600',
            description: 'Disponibles para venta',
            href: '/admin/all-properties'
        },
        {
            title: 'Agentes Registrados',
            value: (totalAgents || 0).toString(),
            icon: Users,
            color: 'text-purple-600',
            description: 'Usuarios activos',
            href: '/admin/agents'
        },
        {
            title: 'Ingresos por Ventas',
            value: `$${totalRevenue.toLocaleString('es-MX')} MXN`,
            icon: DollarSign,
            color: 'text-emerald-600',
            description: 'Ver detalle de facturación',
            href: '/admin/sales'
        },
    ]

    return (
        <div className="p-8 space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-zinc-900">Dashboard Admin</h1>
                <p className="text-zinc-500 mt-2">Bienvenido al panel de administración - Super Agente</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => {
                    const Icon = stat.icon
                    return (
                        <Link key={stat.title} href={stat.href}>
                            <Card className="border-zinc-200 shadow-sm hover:shadow-md hover:border-zinc-300 transition-all cursor-pointer h-full">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium text-zinc-600">
                                        {stat.title}
                                    </CardTitle>
                                    <Icon className={`h-5 w-5 ${stat.color}`} />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-black text-zinc-900 tracking-tight">{stat.value}</div>
                                    <p className="text-xs text-zinc-500 mt-1">{stat.description}</p>
                                </CardContent>
                            </Card>
                        </Link>
                    )
                })}
            </div>

            {/* Quick Actions */}
            <Card className="border-zinc-200">
                <CardHeader>
                    <CardTitle className="text-zinc-900">Acciones Rápidas</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Link
                        href="/admin/sales"
                        className="p-4 rounded-xl border border-zinc-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all group"
                    >
                        <DollarSign className="h-8 w-8 text-emerald-600 mb-2" />
                        <h3 className="font-bold text-zinc-900 group-hover:text-emerald-700">Ventas & Facturación</h3>
                        <p className="text-sm text-zinc-500 mt-1">Suscripciones y cierres de venta</p>
                    </Link>
                    <Link
                        href="/admin/my-properties"
                        className="p-4 rounded-xl border border-zinc-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all group"
                    >
                        <Building2 className="h-8 w-8 text-blue-600 mb-2" />
                        <h3 className="font-bold text-zinc-900 group-hover:text-blue-600">Mis Propiedades</h3>
                        <p className="text-sm text-zinc-500 mt-1">Gestiona tus propiedades ilimitadas</p>
                    </Link>
                    <Link
                        href="/admin/agents"
                        className="p-4 rounded-xl border border-zinc-200 hover:border-purple-300 hover:bg-purple-50/50 transition-all group"
                    >
                        <Users className="h-8 w-8 text-purple-600 mb-2" />
                        <h3 className="font-bold text-zinc-900 group-hover:text-purple-600">Gestionar Agentes</h3>
                        <p className="text-sm text-zinc-500 mt-1">Administra usuarios y permisos</p>
                    </Link>
                    <Link
                        href="/admin/settings"
                        className="p-4 rounded-xl border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-100 transition-all group"
                    >
                        <BarChart3 className="h-8 w-8 text-zinc-600 mb-2" />
                        <h3 className="font-bold text-zinc-900 group-hover:text-zinc-700">Configuración</h3>
                        <p className="text-sm text-zinc-500 mt-1">Hero, planes y ajustes del sitio</p>
                    </Link>
                </CardContent>
            </Card>
        </div>
    )
}
