import { createClient } from '@/lib/supabase-server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, Users, BarChart3, TrendingUp } from 'lucide-react'

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

    const stats = [
        {
            title: 'Total Propiedades',
            value: totalProperties || 0,
            icon: Building2,
            color: 'blue',
            description: 'En toda la plataforma'
        },
        {
            title: 'Propiedades Activas',
            value: activeProperties || 0,
            icon: TrendingUp,
            color: 'green',
            description: 'Disponibles para venta'
        },
        {
            title: 'Agentes Registrados',
            value: totalAgents || 0,
            icon: Users,
            color: 'purple',
            description: 'Usuarios activos'
        },
        {
            title: 'Tasa de Conversión',
            value: '0%',
            icon: BarChart3,
            color: 'orange',
            description: 'Próximamente'
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
                        <Card key={stat.title} className="border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-zinc-600">
                                    {stat.title}
                                </CardTitle>
                                <Icon className={`h-5 w-5 text-${stat.color}-600`} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-black text-zinc-900">{stat.value}</div>
                                <p className="text-xs text-zinc-500 mt-1">{stat.description}</p>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* Quick Actions */}
            <Card className="border-zinc-200">
                <CardHeader>
                    <CardTitle className="text-zinc-900">Acciones Rápidas</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <a
                        href="/admin/my-properties"
                        className="p-4 rounded-xl border border-zinc-200 hover:border-blue-300 hover:bg-blue-50 transition-all group"
                    >
                        <Building2 className="h-8 w-8 text-blue-600 mb-2" />
                        <h3 className="font-bold text-zinc-900 group-hover:text-blue-600">Mis Propiedades</h3>
                        <p className="text-sm text-zinc-500 mt-1">Gestiona tus propiedades ilimitadas</p>
                    </a>
                    <a
                        href="/admin/agents"
                        className="p-4 rounded-xl border border-zinc-200 hover:border-purple-300 hover:bg-purple-50 transition-all group"
                    >
                        <Users className="h-8 w-8 text-purple-600 mb-2" />
                        <h3 className="font-bold text-zinc-900 group-hover:text-purple-600">Gestionar Agentes</h3>
                        <p className="text-sm text-zinc-500 mt-1">Administra usuarios y permisos</p>
                    </a>
                    <a
                        href="/admin/settings"
                        className="p-4 rounded-xl border border-zinc-200 hover:border-green-300 hover:bg-green-50 transition-all group"
                    >
                        <BarChart3 className="h-8 w-8 text-green-600 mb-2" />
                        <h3 className="font-bold text-zinc-900 group-hover:text-green-600">Configuración</h3>
                        <p className="text-sm text-zinc-500 mt-1">Hero, planes y ajustes del sitio</p>
                    </a>
                </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="border-zinc-200">
                <CardHeader>
                    <CardTitle className="text-zinc-900">Actividad Reciente</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-zinc-500 text-sm">No hay actividad reciente para mostrar.</p>
                </CardContent>
            </Card>
        </div>
    )
}
