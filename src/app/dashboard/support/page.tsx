'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    LifeBuoy,
    Plus,
    MessageSquare,
    Clock,
    CheckCircle2,
    AlertCircle,
    ChevronRight,
    Search,
    Loader2,
    X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSubscriptionLimits } from '@/hooks/useSubscriptionLimits'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

export default function SupportPage() {
    const [supabase] = useState(() => createClient())
    const [tickets, setTickets] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const { limits, planName } = useSubscriptionLimits()
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

    useEffect(() => {
        fetchTickets()
    }, [])

    async function fetchTickets() {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data, error } = await supabase
                .from('support_tickets')
                .select('*')
                .eq('agent_id', user.id)
                .order('last_message_at', { ascending: false })

            if (error) throw error
            setTickets(data || [])
        } catch (error: any) {
            console.error('Error fetching tickets:', error)
            toast.error('No se pudieron cargar los tickets')
        } finally {
            setLoading(false)
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'open':
                return <Badge className="bg-blue-100 text-blue-700 border-none">Abierto</Badge>
            case 'in_progress':
                return <Badge className="bg-amber-100 text-amber-700 border-none">En Curso</Badge>
            case 'resolved':
                return <Badge className="bg-emerald-100 text-emerald-700 border-none">Resuelto</Badge>
            case 'closed':
                return <Badge className="bg-zinc-100 text-zinc-700 border-none">Cerrado</Badge>
            default:
                return null
        }
    }

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[2.5rem] border border-zinc-100 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                        <LifeBuoy className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-zinc-900 tracking-tight">Soporte Técnico</h1>
                        <p className="text-xs text-zinc-500 font-medium flex items-center gap-2">
                            Gestiona tus dudas y reportes
                            {limits.has_priority_support && (
                                <Badge className="bg-indigo-600 text-white border-none text-[8px] px-2 py-0">PRIORITARIO</Badge>
                            )}
                        </p>
                    </div>
                </div>

                <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl h-12 px-6 font-bold flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all active:scale-95"
                >
                    <Plus className="h-5 w-5" />
                    Nuevo Ticket
                </Button>
            </div>

            {/* Info Cards / Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-[2rem] bg-indigo-50 border border-indigo-100 flex items-start gap-4">
                    <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                        <Clock className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-indigo-900 uppercase tracking-widest mb-1">Tiempo de Respuesta</p>
                        <p className="text-lg font-bold text-zinc-900">
                            {limits.has_priority_support ? '< 2 Horas' : '12-24 Horas'}
                        </p>
                        <p className="text-[10px] text-indigo-700/60 font-medium">Promedio según tu plan {planName}</p>
                    </div>
                </div>

                <div className="p-6 rounded-[2rem] bg-blue-50 border border-blue-100 flex items-start gap-4">
                    <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                        <MessageSquare className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-blue-900 uppercase tracking-widest mb-1">Tickets Totales</p>
                        <p className="text-xl font-bold text-zinc-900">{tickets.length}</p>
                    </div>
                </div>

                {!limits.has_priority_support && (
                    <div className="p-6 rounded-[2rem] bg-gradient-to-br from-zinc-900 to-zinc-800 text-white flex items-start gap-4">
                        <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center shadow-sm">
                            <Crown className="h-5 w-5 text-amber-400" />
                        </div>
                        <div className="flex-1">
                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Mejora tu Soporte</p>
                            <p className="text-xs font-bold leading-tight mb-2">Obtén respuestas en menos de 2 horas con los planes Premium.</p>
                            <Button variant="ghost" className="h-7 text-[9px] w-full bg-white/10 border-white/20 text-white font-black uppercase tracking-widest hover:bg-white/20">
                                Ver Planes
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Tickets Table / List */}
            <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-zinc-50 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-zinc-900">Historial de Consultas</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Buscar ticket..."
                            className="pl-10 pr-4 py-2 bg-zinc-50 border-none rounded-xl text-sm w-64 focus:ring-2 focus:ring-blue-500/20"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="p-20 flex flex-col items-center justify-center gap-4">
                        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                        <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Cargando tickets...</p>
                    </div>
                ) : tickets.length === 0 ? (
                    <div className="p-20 flex flex-col items-center justify-center gap-6 text-center">
                        <div className="h-20 w-20 rounded-full bg-zinc-50 flex items-center justify-center">
                            <LifeBuoy className="h-10 w-10 text-zinc-200" />
                        </div>
                        <div className="max-w-xs space-y-2">
                            <p className="text-lg font-bold text-zinc-900 uppercase tracking-tight">Sin tickets activos</p>
                            <p className="text-sm text-zinc-500">
                                Actualmente no tienes ninguna consulta abierta. Si necesitas ayuda, haz clic en el botón de abajo.
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => setIsCreateModalOpen(true)}
                            className="rounded-xl border-zinc-200 font-bold"
                        >
                            Crear mi primer ticket
                        </Button>
                    </div>
                ) : (
                    <div className="divide-y divide-zinc-50">
                        {tickets.map((ticket) => (
                            <div
                                key={ticket.id}
                                className="group p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-zinc-50/50 transition-colors cursor-pointer"
                            >
                                <div className="flex items-start gap-4">
                                    <div className={cn(
                                        "h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105",
                                        ticket.status === 'open' ? "bg-blue-50 text-blue-600" :
                                            ticket.status === 'resolved' ? "bg-emerald-50 text-emerald-600" : "bg-zinc-50 text-zinc-400"
                                    )}>
                                        <MessageSquare className="h-6 w-6" />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-zinc-900 group-hover:text-blue-600 transition-colors">{ticket.subject}</h3>
                                            {getStatusBadge(ticket.status)}
                                            {ticket.priority === 'priority' && (
                                                <Badge className="bg-indigo-600 text-white text-[8px] px-1.5 py-0 border-none">PRIORITARIO</Badge>
                                            )}
                                        </div>
                                        <p className="text-xs text-zinc-500 font-medium line-clamp-1 opacity-80">{ticket.description}</p>
                                        <div className="flex items-center gap-4 text-[10px] text-zinc-400 font-bold uppercase tracking-widest pt-1">
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                Actualizado {formatDistanceToNow(new Date(ticket.last_message_at), { addSuffix: true, locale: es })}
                                            </span>
                                            <span className="bg-zinc-100 px-2 py-0.5 rounded-md">{ticket.category}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 self-end md:self-center">
                                    <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl hover:bg-white border border-transparent hover:border-zinc-100 group-hover:shadow-sm">
                                        <ChevronRight className="h-5 w-5 text-zinc-400 group-hover:text-zinc-900" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal placeholder (We'll build this component next) */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl border border-zinc-100 overflow-hidden animate-in zoom-in-95 duration-300">
                        {/* Content will be the NewTicketForm */}
                        <NewTicketForm
                            onClose={() => setIsCreateModalOpen(false)}
                            onSuccess={() => {
                                setIsCreateModalOpen(false)
                                fetchTickets()
                            }}
                            priority={limits.has_priority_support ? 'priority' : 'standard'}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}

function NewTicketForm({ onClose, onSuccess, priority }: { onClose: () => void, onSuccess: () => void, priority: string }) {
    const [supabase] = useState(() => createClient())
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        subject: '',
        description: '',
        category: 'general'
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Usuario no autenticado')

            const { data: ticket, error: ticketError } = await supabase
                .from('support_tickets')
                .insert({
                    agent_id: user.id,
                    subject: formData.subject,
                    description: formData.description,
                    category: formData.category,
                    priority: priority
                })
                .select()
                .single()

            if (ticketError) throw ticketError

            // Create initial message
            const { error: msgError } = await supabase
                .from('ticket_messages')
                .insert({
                    ticket_id: ticket.id,
                    sender_id: user.id,
                    content: formData.description
                })

            if (msgError) throw msgError

            toast.success('Ticket creado correctamente. Te responderemos pronto.')
            onSuccess()
        } catch (error: any) {
            console.error('Error creating ticket:', error)
            toast.error('Ocurrió un error al crear el ticket')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
                        <Plus className="h-5 w-5 text-blue-600" />
                    </div>
                    <h2 className="text-xl font-bold text-zinc-900">Nuevo Ticket</h2>
                </div>
                <Button type="button" variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                    <X className="h-5 w-5" />
                </Button>
            </div>

            <div className="space-y-4">
                <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-black text-zinc-400 tracking-widest pl-1">Asunto</label>
                    <input
                        required
                        type="text"
                        placeholder="Ej: Problema con sincronización de fotos"
                        className="w-full h-12 bg-zinc-50 border-none rounded-2xl px-4 text-sm font-medium focus:ring-2 focus:ring-blue-500/20"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-black text-zinc-400 tracking-widest pl-1">Categoría</label>
                    <select
                        className="w-full h-12 bg-zinc-50 border-none rounded-2xl px-4 text-sm font-medium focus:ring-2 focus:ring-blue-500/20"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                        <option value="general">Consulta General</option>
                        <option value="technical">Problema Técnico</option>
                        <option value="billing">Facturación y Planes</option>
                        <option value="property_ai">IA y Reportes</option>
                        <option value="other">Otro</option>
                    </select>
                </div>

                <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-black text-zinc-400 tracking-widest pl-1">Descripción detallada</label>
                    <textarea
                        required
                        rows={4}
                        placeholder="Cuéntanos más detalles para ayudarte mejor..."
                        className="w-full bg-zinc-50 border-none rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 resize-none"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>
            </div>

            <div className="flex gap-3 pt-2">
                <Button
                    type="button"
                    variant="ghost"
                    onClick={onClose}
                    className="flex-1 h-12 rounded-2xl font-bold"
                >
                    Cancelar
                </Button>
                <Button
                    type="submit"
                    disabled={loading}
                    className="flex-[2] h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-blue-600/20"
                >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Abrir Ticket'}
                </Button>
            </div>

            {priority === 'priority' && (
                <div className="p-3 bg-indigo-50 rounded-xl flex items-center gap-3">
                    <Crown className="h-4 w-4 text-indigo-600" />
                    <p className="text-[10px] font-bold text-indigo-700 uppercase leading-none">
                        Este ticket tiene prioridad alta por tu Plan Premium.
                    </p>
                </div>
            )}
        </form>
    )
}

function Crown({ className }: { className?: string }) {
    return <svg className={cn("h-5 w-5", className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" /></svg>
}
