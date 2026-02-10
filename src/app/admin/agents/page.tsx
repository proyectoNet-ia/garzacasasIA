import { createClient } from '@/lib/supabase-server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Users, Search, Plus, Crown, Building2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default async function AdminAgents() {
    const supabase = await createClient()

    // Fetch all agents (profiles with role = 'agent')
    const { data: agents, count } = await supabase
        .from('profiles')
        .select('*, properties(count)', { count: 'exact' })
        .eq('role', 'agent')
        .order('created_at', { ascending: false })

    const agentsList = agents || []

    return (
        <div className="p-8 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-zinc-900">Gestión de Agentes</h1>
                    <p className="text-zinc-500 mt-2">
                        {count || 0} agentes registrados en la plataforma
                    </p>
                </div>
                <Button className="gap-2 shadow-lg shadow-blue-500/20">
                    <Plus className="h-5 w-5" />
                    Invitar Agente
                </Button>
            </div>

            {/* Search & Filters */}
            <Card className="border-zinc-200">
                <CardContent className="pt-6">
                    <div className="flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                            <Input
                                placeholder="Buscar por nombre, email..."
                                className="pl-10 bg-zinc-50 border-zinc-200"
                            />
                        </div>
                        <Button variant="outline">Filtros</Button>
                    </div>
                </CardContent>
            </Card>

            {/* Agents Table */}
            <Card className="border-zinc-200">
                <CardHeader>
                    <CardTitle className="text-zinc-900 flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Lista de Agentes
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {agentsList.length === 0 ? (
                        <div className="text-center py-12">
                            <Users className="h-16 w-16 text-zinc-300 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-zinc-700 mb-2">No hay agentes registrados</h3>
                            <p className="text-zinc-500 mb-6">
                                Invita a tu primer agente para comenzar.
                            </p>
                            <Button className="gap-2">
                                <Plus className="h-5 w-5" />
                                Invitar Agente
                            </Button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-zinc-200">
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-700">Agente</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-700">Email</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-700">Plan</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-700">Propiedades</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-700">Estado</th>
                                        <th className="text-right py-3 px-4 text-sm font-semibold text-zinc-700">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {agentsList.map((agent: any) => (
                                        <tr key={agent.id} className="border-b border-zinc-100 hover:bg-zinc-50">
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                                                        {agent.full_name?.charAt(0) || 'A'}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-zinc-900">{agent.full_name || 'Sin nombre'}</p>
                                                        <p className="text-xs text-zinc-500">ID: {agent.id.slice(0, 8)}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-zinc-700">{agent.email || 'N/A'}</td>
                                            <td className="py-3 px-4">
                                                <Badge variant="outline" className="gap-1">
                                                    <Crown className="h-3 w-3" />
                                                    {agent.subscription_plan || 'Gratis'}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Building2 className="h-4 w-4 text-zinc-400" />
                                                    <span className="font-semibold text-zinc-900">
                                                        {agent.properties?.[0]?.count || 0}
                                                    </span>
                                                    <span className="text-zinc-500">propiedades</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <Badge variant="secondary" className="bg-green-100 text-green-700">
                                                    Activo
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <Button variant="ghost" size="sm">
                                                    Ver Detalles
                                                </Button>
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
