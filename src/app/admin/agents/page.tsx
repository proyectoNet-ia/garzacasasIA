import { createClient } from '@/lib/supabase-server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Crown, Building2, UserCheck, Shield } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { AgentActions } from '@/components/admin/AgentActions'

export default async function AdminAgents() {
    const supabase = await createClient()

    // Fetch all profiles (agents & admins)
    const { data: agents, count } = await supabase
        .from('profiles')
        .select('*, properties(count)', { count: 'exact' })
        .in('role', ['agent', 'admin'])
        .order('created_at', { ascending: false })

    const agentsList = agents || []

    // Compute summary stats
    const totalAgents = agentsList.filter(a => a.role === 'agent').length
    const totalAdmins = agentsList.filter(a => a.role === 'admin').length
    const totalProperties = agentsList.reduce((sum, a) => sum + (a.properties?.[0]?.count || 0), 0)

    const summaryCards = [
        {
            title: 'Total Agentes',
            value: totalAgents,
            icon: Users,
            color: 'text-blue-600',
            bg: 'bg-blue-50'
        },
        {
            title: 'Super Agentes',
            value: totalAdmins,
            icon: Crown,
            color: 'text-amber-600',
            bg: 'bg-amber-50'
        },
        {
            title: 'Total Propiedades',
            value: totalProperties,
            icon: Building2,
            color: 'text-green-600',
            bg: 'bg-green-50'
        },
        {
            title: 'Usuarios Activos',
            value: agentsList.length,
            icon: UserCheck,
            color: 'text-purple-600',
            bg: 'bg-purple-50'
        },
    ]

    return (
        <div className="p-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-zinc-900 flex items-center gap-3">
                        <Shield className="h-8 w-8 text-blue-600" />
                        Gestión de Usuarios
                    </h1>
                    <p className="text-zinc-500 mt-1">
                        Administra agentes, permisos y roles de la plataforma
                    </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-500 bg-zinc-100 px-4 py-2 rounded-xl">
                    <Users className="h-4 w-4" />
                    <span className="font-semibold text-zinc-900">{agentsList.length}</span> usuarios registrados
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {summaryCards.map((card) => {
                    const Icon = card.icon
                    return (
                        <Card key={card.title} className="border-zinc-200 shadow-sm">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-3">
                                    <div className={`h-10 w-10 rounded-xl ${card.bg} flex items-center justify-center shrink-0`}>
                                        <Icon className={`h-5 w-5 ${card.color}`} />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-black text-zinc-900">{card.value}</p>
                                        <p className="text-xs text-zinc-500 font-medium">{card.title}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* Agents Table */}
            <Card className="border-zinc-200 shadow-sm overflow-hidden">
                <CardHeader className="border-b border-zinc-100 bg-zinc-50/50">
                    <CardTitle className="text-zinc-900 flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Lista de Usuarios
                        <Badge variant="secondary" className="ml-2 text-xs">
                            {agentsList.length} total
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {agentsList.length === 0 ? (
                        <div className="text-center py-16">
                            <Users className="h-12 w-12 mx-auto text-zinc-200 mb-4" />
                            <p className="text-zinc-500 font-medium">No hay usuarios registrados aún.</p>
                            <p className="text-zinc-400 text-sm mt-1">Los agentes aparecerán aquí cuando se registren.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-zinc-100 bg-zinc-50/30">
                                        <th className="text-left py-3.5 px-6 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                                            Agente
                                        </th>
                                        <th className="text-left py-3.5 px-6 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                                            Email
                                        </th>
                                        <th className="text-left py-3.5 px-6 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                                            Rol
                                        </th>
                                        <th className="text-left py-3.5 px-6 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                                            Propiedades
                                        </th>
                                        <th className="text-left py-3.5 px-6 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                                            Estado
                                        </th>
                                        <th className="text-right py-3.5 px-6 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100">
                                    {agentsList.map((agent: any) => (
                                        <tr
                                            key={agent.id}
                                            className={`hover:bg-zinc-50 transition-colors ${agent.role === 'admin' ? 'bg-amber-50/40' : ''}`}
                                        >
                                            {/* Agent Info */}
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 ${agent.role === 'admin' ? 'bg-amber-500' : 'bg-blue-600'}`}>
                                                        {agent.full_name?.charAt(0)?.toUpperCase() || agent.email?.charAt(0)?.toUpperCase() || '?'}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-zinc-900 flex items-center gap-1.5 text-sm">
                                                            {agent.full_name || 'Sin nombre'}
                                                            {agent.role === 'admin' && (
                                                                <Crown className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                                                            )}
                                                        </p>
                                                        <p className="text-xs text-zinc-400 font-mono">
                                                            {agent.id.slice(0, 12)}…
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Email */}
                                            <td className="py-4 px-6 text-sm text-zinc-600">
                                                {agent.email || 'N/A'}
                                            </td>

                                            {/* Role Badge */}
                                            <td className="py-4 px-6">
                                                <Badge
                                                    variant={agent.role === 'admin' ? 'default' : 'outline'}
                                                    className={`gap-1 text-xs ${agent.role === 'admin'
                                                        ? 'bg-amber-500 hover:bg-amber-600 border-0'
                                                        : 'border-zinc-300 text-zinc-600'
                                                        }`}
                                                >
                                                    {agent.role === 'admin'
                                                        ? <><Crown className="h-3 w-3" /> Super Agente</>
                                                        : <><Users className="h-3 w-3" /> Agente</>
                                                    }
                                                </Badge>
                                            </td>

                                            {/* Properties Count */}
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Building2 className="h-4 w-4 text-zinc-400" />
                                                    <span className="font-bold text-zinc-900">
                                                        {agent.properties?.[0]?.count || 0}
                                                    </span>
                                                    <span className="text-zinc-400 text-xs">propiedades</span>
                                                </div>
                                            </td>

                                            {/* Status */}
                                            <td className="py-4 px-6">
                                                <Badge
                                                    variant="secondary"
                                                    className="bg-green-100 text-green-700 border-green-200 text-xs gap-1"
                                                >
                                                    <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                                                    Activo
                                                </Badge>
                                            </td>

                                            {/* Actions */}
                                            <td className="py-4 px-6 text-right">
                                                <AgentActions
                                                    agentId={agent.id}
                                                    agentName={agent.full_name || agent.email}
                                                    currentRole={agent.role}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
