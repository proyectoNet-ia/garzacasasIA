'use client'

import React, { useState } from 'react'
import { MoreHorizontal, Loader2, Crown, Eye, UserX, Shield } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface AgentActionsProps {
    agentId: string
    agentName: string
    currentRole: string
}

export function AgentActions({ agentId, agentName, currentRole }: AgentActionsProps) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handlePromote = async () => {
        if (!confirm(`¿Estás seguro de promover a ${agentName} a Super Agente (Admin)? Tendrá acceso total al panel.`)) return

        setLoading(true)
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ role: 'admin' })
                .eq('id', agentId)

            if (error) throw error

            toast.success(`${agentName} ahora es Admin`)
            router.refresh()
        } catch (error: any) {
            toast.error('Error: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleDemote = async () => {
        if (!confirm(`¿Estás seguro de quitar privilegios de Admin a ${agentName}?`)) return

        setLoading(true)
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ role: 'agent' })
                .eq('id', agentId)

            if (error) throw error

            toast.success(`${agentName} ahora es Agente`)
            router.refresh()
        } catch (error: any) {
            toast.error('Error: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Acciones para {agentName.split(' ')[0]}</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => router.push(`/admin/agents/${agentId}`)}>
                    <Eye className="mr-2 h-4 w-4" />
                    Ver Detalles
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {currentRole !== 'admin' ? (
                    <DropdownMenuItem onClick={handlePromote} className="text-blue-600 font-medium cursor-pointer">
                        <Shield className="mr-2 h-4 w-4" />
                        Hacer Super Agente
                    </DropdownMenuItem>
                ) : (
                    <DropdownMenuItem onClick={handleDemote} className="text-orange-600 font-medium cursor-pointer">
                        <UserX className="mr-2 h-4 w-4" />
                        Quitar Admin
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
