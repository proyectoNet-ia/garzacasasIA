'use client'

import React, { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase-client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
    LifeBuoy,
    MessageSquare,
    Clock,
    CheckCircle2,
    AlertCircle,
    Search,
    Loader2,
    Send,
    User,
    Crown,
    Filter,
    ArrowUpDown,
    Check,
    RotateCcw,
    XCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface Ticket {
    id: string
    agent_id: string
    subject: string
    description: string
    priority: 'standard' | 'priority'
    status: 'open' | 'in_progress' | 'resolved' | 'closed'
    category: 'general' | 'technical' | 'billing' | 'property_ai' | 'other'
    last_message_at: string
    created_at: string
    agent?: {
        full_name: string | null
        email?: string | null
        phone?: string | null
        company_name?: string | null
        avatar_url?: string | null
        subscription_plan?: string | null
    }
}

interface TicketMessage {
    id: string
    ticket_id: string
    sender_id: string
    content: string
    is_admin_reply: boolean
    created_at: string
    sender?: {
        full_name: string | null
        avatar_url: string | null
        role: string
    }
}

export default function AdminSupportPage() {
    const [supabase] = useState(() => createClient())
    const [tickets, setTickets] = useState<Ticket[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
    const [messages, setMessages] = useState<TicketMessage[]>([])
    const [loadingMessages, setLoadingMessages] = useState(false)
    const [replyText, setReplyText] = useState('')
    const [sendingReply, setSendingReply] = useState(false)

    // Filters
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [priorityFilter, setPriorityFilter] = useState<string>('all')
    const [searchQuery, setSearchQuery] = useState('')

    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        fetchTickets()

        // Realtime subscription for tickets
        const ticketsChannel = supabase
            .channel('admin-support-tickets')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'support_tickets' },
                () => {
                    fetchTickets(false)
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(ticketsChannel)
        }
    }, [supabase])

    useEffect(() => {
        if (!selectedTicket) return

        fetchMessages(selectedTicket.id)

        // Realtime subscription for selected ticket messages
        const msgChannel = supabase
            .channel(`admin-ticket-${selectedTicket.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'ticket_messages',
                    filter: `ticket_id=eq.${selectedTicket.id}`
                },
                (payload) => {
                    setMessages((prev) => {
                        if (prev.some(m => m.id === payload.new.id)) return prev
                        return [...prev, payload.new as TicketMessage]
                    })
                    scrollToBottom()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(msgChannel)
        }
    }, [selectedTicket?.id, supabase])

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        }, 100)
    }

    async function fetchTickets(showLoading = true) {
        if (showLoading) setLoading(true)
        try {
            const { data: ticketsData, error: ticketsError } = await supabase
                .from('support_tickets')
                .select('*')
                .order('last_message_at', { ascending: false })

            if (ticketsError) {
                if (ticketsError.code === 'PGRST205' || ticketsError.message?.includes('schema cache')) {
                    console.warn('La tabla support_tickets aún no está creada en Supabase.')
                    setTickets([])
                    return
                }
                throw ticketsError
            }

            // Fetch agents data
            if (ticketsData && ticketsData.length > 0) {
                const agentIds = Array.from(new Set(ticketsData.map((t) => t.agent_id)))
                const { data: profilesData } = await supabase
                    .from('profiles')
                    .select('id, full_name, phone, company_name, avatar_url, subscription_plan')
                    .in('id', agentIds)

                const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || [])

                const enrichedTickets = ticketsData.map(ticket => ({
                    ...ticket,
                    agent: profilesMap.get(ticket.agent_id) || { full_name: 'Agente Desconocido' }
                }))

                setTickets(enrichedTickets)

                // Select first ticket if none selected
                if (!selectedTicket && enrichedTickets.length > 0) {
                    setSelectedTicket(enrichedTickets[0])
                } else if (selectedTicket) {
                    // Refresh selected ticket info
                    const updatedSelected = enrichedTickets.find(t => t.id === selectedTicket.id)
                    if (updatedSelected) setSelectedTicket(updatedSelected)
                }
            } else {
                setTickets([])
                setSelectedTicket(null)
            }
        } catch (error: any) {
            console.error('Error fetching admin tickets:', error)
            toast.error('Error al cargar tickets: ' + error.message)
        } finally {
            if (showLoading) setLoading(false)
        }
    }

    async function fetchMessages(ticketId: string) {
        setLoadingMessages(true)
        try {
            const { data, error } = await supabase
                .from('ticket_messages')
                .select('*')
                .eq('ticket_id', ticketId)
                .order('created_at', { ascending: true })

            if (error) throw error
            setMessages(data || [])
            scrollToBottom()
        } catch (error: any) {
            console.error('Error fetching ticket messages:', error)
            toast.error('Error al cargar mensajes del ticket')
        } finally {
            setLoadingMessages(false)
        }
    }

    async function handleSendMessage(e: React.FormEvent) {
        e.preventDefault()
        if (!replyText.trim() || !selectedTicket || sendingReply) return

        setSendingReply(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('No autenticado')

            const { error: msgError } = await supabase
                .from('ticket_messages')
                .insert({
                    ticket_id: selectedTicket.id,
                    sender_id: user.id,
                    content: replyText.trim(),
                    is_admin_reply: true
                })

            if (msgError) throw msgError

            // Automatically set status to in_progress if it was open
            if (selectedTicket.status === 'open') {
                await updateTicketStatus(selectedTicket.id, 'in_progress')
            }

            setReplyText('')
            toast.success('Respuesta enviada')
        } catch (error: any) {
            console.error('Error sending reply:', error)
            toast.error('Error al enviar respuesta: ' + error.message)
        } finally {
            setSendingReply(false)
        }
    }

    async function updateTicketStatus(ticketId: string, newStatus: Ticket['status']) {
        try {
            const { error } = await supabase
                .from('support_tickets')
                .update({ status: newStatus })
                .eq('id', ticketId)

            if (error) throw error

            setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: newStatus } : t))
            if (selectedTicket?.id === ticketId) {
                setSelectedTicket(prev => prev ? { ...prev, status: newStatus } : null)
            }
            toast.success(`Estado actualizado a ${getStatusLabel(newStatus)}`)
        } catch (error: any) {
            console.error('Error updating status:', error)
            toast.error('Error al actualizar estado: ' + error.message)
        }
    }

    async function updateTicketPriority(ticketId: string, newPriority: Ticket['priority']) {
        try {
            const { error } = await supabase
                .from('support_tickets')
                .update({ priority: newPriority })
                .eq('id', ticketId)

            if (error) throw error

            setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, priority: newPriority } : t))
            if (selectedTicket?.id === ticketId) {
                setSelectedTicket(prev => prev ? { ...prev, priority: newPriority } : null)
            }
            toast.success(`Prioridad actualizada`)
        } catch (error: any) {
            console.error('Error updating priority:', error)
            toast.error('Error al actualizar prioridad: ' + error.message)
        }
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'open': return 'Abierto'
            case 'in_progress': return 'En Curso'
            case 'resolved': return 'Resuelto'
            case 'closed': return 'Cerrado'
            default: return status
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'open':
                return <Badge className="bg-blue-100 text-blue-700 border-none font-bold">Abierto</Badge>
            case 'in_progress':
                return <Badge className="bg-amber-100 text-amber-700 border-none font-bold">En Curso</Badge>
            case 'resolved':
                return <Badge className="bg-emerald-100 text-emerald-700 border-none font-bold">Resuelto</Badge>
            case 'closed':
                return <Badge className="bg-zinc-100 text-zinc-600 border-none font-bold">Cerrado</Badge>
            default:
                return null
        }
    }

    // Filter tickets
    const filteredTickets = tickets.filter(ticket => {
        const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter
        const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter
        const matchesSearch = searchQuery === '' ||
            ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ticket.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (ticket.agent?.full_name && ticket.agent.full_name.toLowerCase().includes(searchQuery.toLowerCase()))

        return matchesStatus && matchesPriority && matchesSearch
    })

    const stats = {
        total: tickets.length,
        open: tickets.filter(t => t.status === 'open').length,
        inProgress: tickets.filter(t => t.status === 'in_progress').length,
        resolved: tickets.filter(t => t.status === 'resolved').length,
        priority: tickets.filter(t => t.priority === 'priority' && (t.status === 'open' || t.status === 'in_progress')).length,
    }

    return (
        <div className="p-8 space-y-8 max-w-[1600px] mx-auto h-[calc(100vh-2rem)] flex flex-col">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-3xl font-black text-zinc-900 tracking-tight flex items-center gap-3">
                        <LifeBuoy className="h-8 w-8 text-indigo-600" />
                        Centro de Soporte Técnico
                    </h1>
                    <p className="text-zinc-500 font-medium mt-1">
                        Atiende dudas, reportes y requerimientos de los agentes registrados.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        onClick={() => fetchTickets()}
                        variant="outline"
                        size="sm"
                        className="rounded-xl border-zinc-200 hover:bg-zinc-50 font-bold"
                    >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Actualizar
                    </Button>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 shrink-0">
                <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Total Consultas</p>
                    <p className="text-2xl font-black text-zinc-900 mt-1">{stats.total}</p>
                </div>
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-wider text-blue-600">Por Responder</p>
                    <p className="text-2xl font-black text-blue-700 mt-1">{stats.open}</p>
                </div>
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-wider text-amber-600">En Curso</p>
                    <p className="text-2xl font-black text-amber-700 mt-1">{stats.inProgress}</p>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-wider text-emerald-600">Resueltos</p>
                    <p className="text-2xl font-black text-emerald-700 mt-1">{stats.resolved}</p>
                </div>
                <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 shadow-sm col-span-2 md:col-span-1">
                    <p className="text-[10px] font-black uppercase tracking-wider text-indigo-600 flex items-center gap-1">
                        <Crown className="h-3.5 w-3.5 text-indigo-600" />
                        Prioritarios Activos
                    </p>
                    <p className="text-2xl font-black text-indigo-700 mt-1">{stats.priority}</p>
                </div>
            </div>

            {/* Main Workbench (Split Screen) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0 bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
                {/* Left Side: Ticket List & Filters */}
                <div className="lg:col-span-5 border-r border-zinc-100 flex flex-col h-full overflow-hidden">
                    {/* Search & Filter Bar */}
                    <div className="p-4 border-b border-zinc-100 space-y-3 shrink-0 bg-zinc-50/50">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                            <Input
                                placeholder="Buscar por agente, asunto o contenido..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 bg-white border-zinc-200 rounded-xl text-xs h-10 focus-visible:ring-indigo-500"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="bg-white border border-zinc-200 text-zinc-700 text-xs rounded-xl px-3 py-2 font-medium flex-1 outline-none focus:ring-2 focus:ring-indigo-500/20"
                            >
                                <option value="all">Todos los estados</option>
                                <option value="open">Abiertos</option>
                                <option value="in_progress">En Curso</option>
                                <option value="resolved">Resueltos</option>
                                <option value="closed">Cerrados</option>
                            </select>

                            <select
                                value={priorityFilter}
                                onChange={(e) => setPriorityFilter(e.target.value)}
                                className="bg-white border border-zinc-200 text-zinc-700 text-xs rounded-xl px-3 py-2 font-medium flex-1 outline-none focus:ring-2 focus:ring-indigo-500/20"
                            >
                                <option value="all">Toda prioridad</option>
                                <option value="priority">Prioritarios (Platino)</option>
                                <option value="standard">Estándar</option>
                            </select>
                        </div>
                    </div>

                    {/* Scrollable Ticket List */}
                    <div className="flex-1 overflow-y-auto divide-y divide-zinc-50">
                        {loading ? (
                            <div className="p-12 flex flex-col items-center justify-center gap-3">
                                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Cargando tickets...</p>
                            </div>
                        ) : filteredTickets.length === 0 ? (
                            <div className="p-12 text-center text-zinc-400 space-y-2">
                                <MessageSquare className="h-8 w-8 mx-auto opacity-40" />
                                <p className="text-sm font-bold text-zinc-600">No se encontraron tickets</p>
                                <p className="text-xs">No hay tickets que coincidan con los filtros actuales.</p>
                            </div>
                        ) : (
                            filteredTickets.map((ticket) => {
                                const isSelected = selectedTicket?.id === ticket.id
                                return (
                                    <div
                                        key={ticket.id}
                                        onClick={() => setSelectedTicket(ticket)}
                                        className={cn(
                                            "p-4 cursor-pointer transition-all border-l-4",
                                            isSelected
                                                ? "bg-indigo-50/50 border-indigo-600"
                                                : "border-transparent hover:bg-zinc-50"
                                        )}
                                    >
                                        <div className="flex items-start justify-between gap-2 mb-1.5">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <span className="font-bold text-sm text-zinc-900 truncate">
                                                    {ticket.subject}
                                                </span>
                                            </div>
                                            {getStatusBadge(ticket.status)}
                                        </div>

                                        <p className="text-xs text-zinc-500 line-clamp-2 mb-3 leading-relaxed">
                                            {ticket.description}
                                        </p>

                                        <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 border-t border-zinc-100/60">
                                            <div className="flex items-center gap-2 font-medium text-zinc-600 truncate">
                                                <User className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                                                <span className="truncate">{ticket.agent?.full_name || 'Agente'}</span>
                                            </div>

                                            <div className="flex items-center gap-2 shrink-0">
                                                {ticket.priority === 'priority' && (
                                                    <Badge className="bg-indigo-600 text-white text-[8px] px-1.5 py-0 border-none font-bold">
                                                        PRIORITARIO
                                                    </Badge>
                                                )}
                                                <span className="text-[10px] font-bold text-zinc-400">
                                                    {formatDistanceToNow(new Date(ticket.last_message_at), { addSuffix: true, locale: es })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>

                {/* Right Side: Conversation Thread & Action Controls */}
                <div className="lg:col-span-7 flex flex-col h-full overflow-hidden bg-zinc-50/30">
                    {selectedTicket ? (
                        <>
                            {/* Ticket Detail Header */}
                            <div className="p-6 border-b border-zinc-100 bg-white shrink-0 space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h2 className="text-xl font-black text-zinc-900">{selectedTicket.subject}</h2>
                                            {getStatusBadge(selectedTicket.status)}
                                            {selectedTicket.priority === 'priority' && (
                                                <Badge className="bg-indigo-600 text-white text-[9px] font-black border-none">
                                                    PLAN PLATINO / ENTERPRISE
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-zinc-500 font-medium">
                                            <span>Categoría: <strong className="text-zinc-700 uppercase">{selectedTicket.category}</strong></span>
                                            <span>•</span>
                                            <span>Creado el {new Date(selectedTicket.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </div>

                                    {/* Action dropdowns */}
                                    <div className="flex items-center gap-2">
                                        <select
                                            value={selectedTicket.status}
                                            onChange={(e) => updateTicketStatus(selectedTicket.id, e.target.value as any)}
                                            className="bg-zinc-50 border border-zinc-200 text-zinc-900 text-xs font-bold rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/20"
                                        >
                                            <option value="open">Abierto</option>
                                            <option value="in_progress">En Curso</option>
                                            <option value="resolved">Resuelto</option>
                                            <option value="closed">Cerrado</option>
                                        </select>

                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => updateTicketPriority(
                                                selectedTicket.id,
                                                selectedTicket.priority === 'priority' ? 'standard' : 'priority'
                                            )}
                                            className={cn(
                                                "text-xs font-bold rounded-xl",
                                                selectedTicket.priority === 'priority'
                                                    ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                                                    : "border-zinc-200 text-zinc-600"
                                            )}
                                        >
                                            <Crown className="h-3.5 w-3.5 mr-1" />
                                            {selectedTicket.priority === 'priority' ? 'Prioritario' : 'Estándar'}
                                        </Button>
                                    </div>
                                </div>

                                {/* Agent Details Bar */}
                                <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50 border border-zinc-100 text-xs">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                                            {selectedTicket.agent?.full_name?.charAt(0) || 'A'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-zinc-900">{selectedTicket.agent?.full_name || 'Agente'}</p>
                                            <p className="text-zinc-500 text-[10px]">{selectedTicket.agent?.company_name || 'Inmobiliaria Independiente'}</p>
                                        </div>
                                    </div>
                                    {selectedTicket.agent?.phone && (
                                        <div className="text-right">
                                            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Contacto</p>
                                            <p className="font-bold text-zinc-700">{selectedTicket.agent.phone}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Chat Thread */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                {loadingMessages ? (
                                    <div className="p-8 flex justify-center">
                                        <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="p-8 text-center text-zinc-400 text-xs">
                                        No hay mensajes registrados en este ticket.
                                    </div>
                                ) : (
                                    messages.map((msg) => (
                                        <div
                                            key={msg.id}
                                            className={cn(
                                                "flex flex-col max-w-[80%]",
                                                msg.is_admin_reply ? "ml-auto items-end" : "mr-auto items-start"
                                            )}
                                        >
                                            <div className="flex items-center gap-2 mb-1 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                                                <span>{msg.is_admin_reply ? 'Tú (Soporte Admin)' : selectedTicket.agent?.full_name || 'Agente'}</span>
                                                <span>•</span>
                                                <span>{formatDistanceToNow(new Date(msg.created_at), { addSuffix: true, locale: es })}</span>
                                            </div>

                                            <div
                                                className={cn(
                                                    "p-4 rounded-3xl text-sm font-medium leading-relaxed shadow-sm",
                                                    msg.is_admin_reply
                                                        ? "bg-indigo-600 text-white rounded-br-none"
                                                        : "bg-white text-zinc-900 border border-zinc-200 rounded-bl-none"
                                                )}
                                            >
                                                <p className="whitespace-pre-wrap">{msg.content}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Reply Input Box */}
                            <div className="p-4 bg-white border-t border-zinc-100 shrink-0">
                                <form onSubmit={handleSendMessage} className="flex gap-3">
                                    <textarea
                                        rows={2}
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        placeholder="Escribe tu respuesta al agente..."
                                        className="flex-1 bg-zinc-50 border border-zinc-200 rounded-2xl p-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none text-zinc-900 placeholder:text-zinc-400"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault()
                                                handleSendMessage(e)
                                            }
                                        }}
                                    />
                                    <Button
                                        type="submit"
                                        disabled={sendingReply || !replyText.trim()}
                                        className="h-auto px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/20"
                                    >
                                        {sendingReply ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : (
                                            <>
                                                <Send className="h-4 w-4" />
                                                Responder
                                            </>
                                        )}
                                    </Button>
                                </form>
                                <div className="flex items-center justify-between text-[10px] text-zinc-400 mt-2 px-1">
                                    <span>Presiona <strong>Enter</strong> para enviar, <strong>Shift + Enter</strong> para salto de línea.</span>
                                    {selectedTicket.status === 'open' && (
                                        <span className="text-indigo-600 font-bold">
                                            * Al responder, el ticket cambiará automáticamente a "En Curso".
                                        </span>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-zinc-400">
                            <LifeBuoy className="h-12 w-12 mb-3 opacity-30 text-indigo-600" />
                            <p className="font-bold text-zinc-700">Selecciona un ticket</p>
                            <p className="text-xs max-w-sm mt-1">
                                Elige una consulta de la lista izquierda para ver la conversación y responderle al agente.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
