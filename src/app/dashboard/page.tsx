import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Building2, Users, PieChart, TrendingUp } from 'lucide-react'

const stats = [
    { label: 'Propiedades Activas', value: '12', icon: Building2, trend: '+2 este mes' },
    { label: 'Leads Generados', value: '48', icon: Users, trend: '+15% vs ayer' },
    { label: 'Portfolio Val.', value: '$2.4M', icon: PieChart, trend: 'Estable' },
    { label: 'Ingresos Mensuales', value: '$12,400', icon: TrendingUp, trend: '+8% vs mes anterior' },
]

export default function DashboardPage() {
    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-white font-heading">Bienvenido de nuevo, Agente</h1>
                <p className="text-zinc-400">Aquí tienes un resumen de lo que está pasando con tus propiedades hoy.</p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.label} className="glass border-white/10 bg-white/5 hover:bg-white/10 transition-colors shadow-xl">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium text-zinc-400">
                                {stat.label}
                            </CardTitle>
                            <stat.icon className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{stat.value}</div>
                            <p className="text-xs text-primary mt-1 font-medium">
                                {stat.trend}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card className="glass border-white/10 bg-white/5 shadow-xl min-h-[300px]">
                    <CardHeader>
                        <CardTitle className="text-lg text-white">Actividad Reciente</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center h-48 text-zinc-500">
                        <p className="text-sm italic">Próximamente: Gráficas de rendimiento y actividad en tiempo real.</p>
                    </CardContent>
                </Card>

                <Card className="glass border-white/10 bg-white/5 shadow-xl min-h-[300px]">
                    <CardHeader>
                        <CardTitle className="text-lg text-white">Próximas Citas</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center h-48 text-zinc-500">
                        <p className="text-sm italic">Próximamente: Integración con calendario y gestión de visitas.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
