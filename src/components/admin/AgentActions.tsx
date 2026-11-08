'use client'

import React, { useState } from 'react'
import {
    MoreHorizontal,
    Loader2,
    Eye,
    UserX,
    Shield,
    Ban,
    CheckCircle2,
    Trash2,
} from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { StatusModal, type StatusModalType } from '@/components/ui/StatusModal'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

type PendingAction = 'promote' | 'demote' | 'suspend' | 'reactivate' | 'delete' | null

interface AgentActionsProps {
    agentId: string
    agentName: string
    currentRole: string
    currentStatus?: string | null
    propertiesCount?: number
    isSelf?: boolean
}

export function AgentActions({
    agentId,
    agentName,
    currentRole,
    currentStatus = 'active',
    propertiesCount = 0,
    isSelf = false,
}: AgentActionsProps) {
    const [loading, setLoading] = useState(false)
    const [pendingAction, setPendingAction] = useState<PendingAction>(null)
    const router = useRouter()

    const isSuspended = currentStatus === 'suspended'
    const isAdmin = currentRole === 'admin'
    const shortName = (agentName || 'Agente').split(' ')[0]

    const modalMeta: Record<
        Exclude<PendingAction, null>,
        { type: StatusModalType; title: string; description: string; confirmLabel: string }
    > = {
        promote: {
            type: 'info',
            title: 'Promover a Super Agente',
            description: `¿Otorgar permisos completos de administración a ${agentName}? Podrá gestionar usuarios, paquetes y configuración del sitio.`,
            confirmLabel: 'Sí, hacer Super Agente',
        },
        demote: {
            type: 'warning',
            title: 'Retirar privilegios de Admin',
            description: `¿Convertir a ${agentName} nuevamente en Agente estándar? Perderá acceso al panel administrativo.`,
            confirmLabel: 'Retirar rol Admin',
        },
        suspend: {
            type: 'warning',
            title: 'Suspender cuenta de agente',
            description: `Se bloqueará el inicio de sesión de ${agentName}${
                propertiesCount > 0
                    ? ` y sus ${propertiesCount} propiedad(es) pasarán a borrador fuera del catálogo público.`
                    : '.'
            } Podrás reactivar su cuenta en cualquier momento.`,
            confirmLabel: 'Suspender agente',
        },
        reactivate: {
            type: 'success',
            title: 'Reactivar cuenta de agente',
            description: `${agentName} podrá volver a iniciar sesión y administrar sus inmuebles dentro de los límites de su plan.`,
            confirmLabel: 'Reactivar cuenta',
        },
        delete: {
            type: 'danger',
            title: 'Eliminar agente definitivamente',
            description: `Esta acción es irreversible. Se eliminará el acceso de ${agentName}, sus archivos en Storage y ${propertiesCount} propiedad(es) asociadas. El historial de pagos reales aprobados se conservará para contabilidad.`,
            confirmLabel: 'Eliminar permanentemente',
        },
    }

    const executeAction = async () => {
        if (!pendingAction) return

        setLoading(true)
        try {
            if (pendingAction === 'delete') {
                const res = await fetch(`/api/admin/agents/${agentId}`, {
                    method: 'DELETE',
                })
                const data = await res.json()
                if (!res.ok) throw new Error(data.error || 'No se pudo eliminar el agente.')

                toast.success(
                    `${agentName} eliminado correctamente (${data.deletedPropertiesCount ?? 0} inmuebles limpiados)`
                )
            } else {
                const res = await fetch(`/api/admin/agents/${agentId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: pendingAction }),
                })
                const data = await res.json()
                if (!res.ok) throw new Error(data.error || 'No se pudo ejecutar la acción.')

                const successMessages: Record<Exclude<PendingAction, null | 'delete'>, string> = {
                    promote: `${agentName} ahora es Super Agente (Admin)`,
                    demote: `${agentName} ahora tiene rol de Agente`,
                    suspend: `Cuenta de ${agentName} suspendida`,
                    reactivate: `Cuenta de ${agentName} reactivada`,
                }
                toast.success(successMessages[pendingAction])
            }

            setPendingAction(null)
            router.refresh()
        } catch (error: any) {
            toast.error(error?.message || 'Ocurrió un error inesperado')
        } finally {
            setLoading(false)
        }
    }

    const activeMeta = pendingAction ? modalMeta[pendingAction] : null

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" disabled={loading}>
                        {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <MoreHorizontal className="h-4 w-4" />
                        )}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="truncate">
                        Acciones para {shortName}
                    </DropdownMenuLabel>

                    <DropdownMenuItem
                        onClick={() => router.push(`/agentes/${agentId}`)}
                        className="cursor-pointer"
                    >
                        <Eye className="mr-2 h-4 w-4 text-zinc-500" />
                        Ver Perfil Público
                    </DropdownMenuItem>

                    {isSelf ? (
                        <>
                            <DropdownMenuSeparator />
                            <div className="px-2 py-1.5 text-xs text-zinc-400">
                                Tu sesión actual está protegida contra baja o cambio de rol.
                            </div>
                        </>
                    ) : (
                        <>
                            <DropdownMenuSeparator />

                            {!isAdmin ? (
                                <DropdownMenuItem
                                    onClick={() => setPendingAction('promote')}
                                    className="text-blue-600 font-medium cursor-pointer"
                                >
                                    <Shield className="mr-2 h-4 w-4" />
                                    Hacer Super Agente
                                </DropdownMenuItem>
                            ) : (
                                <DropdownMenuItem
                                    onClick={() => setPendingAction('demote')}
                                    className="text-orange-600 font-medium cursor-pointer"
                                >
                                    <UserX className="mr-2 h-4 w-4" />
                                    Quitar Admin
                                </DropdownMenuItem>
                            )}

                            {!isAdmin && (
                                <>
                                    {!isSuspended ? (
                                        <DropdownMenuItem
                                            onClick={() => setPendingAction('suspend')}
                                            className="text-amber-600 font-medium cursor-pointer"
                                        >
                                            <Ban className="mr-2 h-4 w-4" />
                                            Suspender Agente
                                        </DropdownMenuItem>
                                    ) : (
                                        <DropdownMenuItem
                                            onClick={() => setPendingAction('reactivate')}
                                            className="text-emerald-600 font-medium cursor-pointer"
                                        >
                                            <CheckCircle2 className="mr-2 h-4 w-4" />
                                            Reactivar Agente
                                        </DropdownMenuItem>
                                    )}

                                    <DropdownMenuSeparator />

                                    <DropdownMenuItem
                                        onClick={() => setPendingAction('delete')}
                                        className="text-red-600 focus:text-red-600 focus:bg-red-50 font-semibold cursor-pointer"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Eliminar Definitivamente
                                    </DropdownMenuItem>
                                </>
                            )}
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            {activeMeta && (
                <StatusModal
                    open={Boolean(pendingAction)}
                    onOpenChange={(open) => {
                        if (!open && !loading) setPendingAction(null)
                    }}
                    type={activeMeta.type}
                    title={activeMeta.title}
                    description={activeMeta.description}
                    confirmLabel={activeMeta.confirmLabel}
                    cancelLabel="Cancelar"
                    onConfirm={executeAction}
                    onCancel={() => setPendingAction(null)}
                    loading={loading}
                    variant="confirm"
                />
            )}
        </>
    )
}
