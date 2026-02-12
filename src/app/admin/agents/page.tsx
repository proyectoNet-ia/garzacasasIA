import { createClient } from '@/lib/supabase-server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Users, Search, Plus, Crown, Building2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { AgentActions } from '@/components/admin/AgentActions'

export default async function AdminAgents() {
    const supabase = await createClient()

    // ...
    // Fetch all profiles (agents & admins)
    const { data: agents, count } = await supabase
        .from('profiles')
        .select('*, properties(count)', { count: 'exact' })
        .in('role', ['agent', 'admin']) // Mostrar todos
        .order('created_at', { ascending: false })

    const agentsList = agents || []

    return (
        <div className="p-8 space-y-8">
            {/* Header */}
            {/* ... (sin cambios Header) ... */}

            {/* ... (sin cambios Search) ... */}

            {/* Agents Table */}
            <Card className="border-zinc-200">
                <CardHeader>
                    <CardTitle className="text-zinc-900 flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Lista de Usuarios (Agentes y Admins)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {/* ... (sin cambios en Empty State) ... */}
                    {(agentsList.length > 0) && (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-zinc-200">
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-700">Agente</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-700">Email</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-700">Rol</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-700">Propiedades</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-700">Estado</th>
                                        <th className="text-right py-3 px-4 text-sm font-semibold text-zinc-700">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {agentsList.map((agent: any) => (
                                        <tr key={agent.id} className={`border-b border-zinc-100 hover:bg-zinc-50 ${agent.role === 'admin' ? 'bg-blue-50/50' : ''}`}>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${agent.role === 'admin' ? 'bg-amber-500' : 'bg-blue-600'}`}>
                                                        {agent.full_name?.charAt(0) || 'A'}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-zinc-900 flex items-center gap-2">
                                                            {agent.full_name || 'Sin nombre'}
                                                            {agent.role === 'admin' && <Crown className="h-3 w-3 text-amber-500 fill-amber-500" />}
                                                        </p>
                                                        <p className="text-xs text-zinc-500">ID: {agent.id.slice(0, 8)}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-zinc-700">{agent.email || 'N/A'}</td>
                                            <td className="py-3 px-4">
                                                <Badge variant={agent.role === 'admin' ? 'default' : 'outline'} className={`gap-1 ${agent.role === 'admin' ? 'bg-amber-500 hover:bg-amber-600' : ''}`}>
                                                    {agent.role === 'admin' ? <Crown className="h-3 w-3" /> : <Users className="h-3 w-3" />}
                                                    {agent.role === 'admin' ? 'Super Agente' : 'Agente'}
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
