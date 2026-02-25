'use client'

import React from 'react'
import {
    Bell,
    CheckCircle2,
    AlertCircle,
    Info,
    TrendingUp,
    CreditCard,
    X,
    MessageSquare,
    Clock
} from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { useNotifications, Notification } from '@/hooks/useNotifications'
import { cn } from '@/lib/utils'
import Link from 'next/link'

// Helper nativo para tiempo relativo (sin dependencias externas)
function formatRelativeTime(date: Date) {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'Hace un momento'

    const diffInMinutes = Math.floor(diffInSeconds / 60)
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `Hace ${diffInHours} h`

    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `Hace ${diffInDays} d`

    return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
}

export function NotificationCenter() {
    const { notifications, unreadCount, markAsRead, markAllAsRead, loading } = useNotifications()
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    const getIcon = (type: Notification['type']) => {
        switch (type) {
            case 'success': return <CheckCircle2 className="h-4 w-4 text-green-500" />
            case 'warning': return <AlertCircle className="h-4 w-4 text-amber-500" />
            case 'error': return <X className="h-4 w-4 text-red-500" />
            case 'stats': return <TrendingUp className="h-4 w-4 text-blue-500" />
            case 'plan': return <CreditCard className="h-4 w-4 text-indigo-500" />
            default: return <Info className="h-4 w-4 text-zinc-500" />
        }
    }

    const getBgColor = (type: Notification['type'], isRead: boolean) => {
        if (isRead) return 'bg-transparent'
        switch (type) {
            case 'success': return 'bg-green-50/50'
            case 'warning': return 'bg-amber-50/50'
            case 'error': return 'bg-red-50/50'
            case 'stats': return 'bg-blue-50/50'
            case 'plan': return 'bg-indigo-50/50'
            default: return 'bg-zinc-50/50'
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative group hover:bg-zinc-100 rounded-full h-10 w-10 transition-all">
                    <Bell className="h-5 w-5 text-zinc-500 group-hover:text-zinc-900 transition-colors" />
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white ring-2 ring-white animate-in zoom-in duration-300">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0 rounded-2xl border-zinc-200 shadow-2xl overflow-hidden bg-white/95 backdrop-blur-xl">
                <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-sm text-zinc-900">Notificaciones</h3>
                        <p className="text-[10px] text-zinc-500">Tienes {unreadCount} mensajes sin leer</p>
                    </div>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                                e.preventDefault()
                                markAllAsRead()
                            }}
                            className="text-[10px] font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-7"
                        >
                            Marcar todo como leído
                        </Button>
                    )}
                </div>

                <div className="max-h-[400px] overflow-y-auto overflow-x-hidden">
                    {loading ? (
                        <div className="p-8 text-center">
                            <Clock className="h-8 w-8 text-zinc-200 mx-auto animate-spin mb-2" />
                            <p className="text-xs text-zinc-400">Cargando...</p>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="p-12 text-center">
                            <Bell className="h-10 w-10 text-zinc-100 mx-auto mb-3" />
                            <p className="text-sm font-medium text-zinc-900">Sin notificaciones</p>
                            <p className="text-xs text-zinc-400 mt-1">Te avisaremos cuando pase algo importante.</p>
                        </div>
                    ) : (
                        notifications.map((notif) => (
                            <DropdownMenuItem
                                key={notif.id}
                                onClick={() => markAsRead(notif.id)}
                                className={cn(
                                    "flex flex-col items-start gap-1 p-4 cursor-pointer focus:bg-zinc-100/80 transition-colors border-b border-zinc-50 last:border-0",
                                    getBgColor(notif.type, notif.is_read)
                                )}
                            >
                                <div className="flex items-start justify-between w-full gap-2">
                                    <div className="flex items-center gap-2">
                                        {getIcon(notif.type)}
                                        <span className={cn(
                                            "font-bold text-sm",
                                            notif.is_read ? "text-zinc-600" : "text-zinc-900"
                                        )}>
                                            {notif.title}
                                        </span>
                                    </div>
                                    {!notif.is_read && (
                                        <div className="h-2 w-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                                    )}
                                </div>
                                <p className="text-xs text-zinc-500 leading-relaxed pr-2">
                                    {notif.message}
                                </p>
                                <div className="flex items-center justify-between w-full mt-1">
                                    <span className="text-[10px] text-zinc-400 font-medium">
                                        {mounted ? (() => {
                                            try {
                                                return formatRelativeTime(new Date(notif.created_at))
                                            } catch (e) {
                                                return 'Reciente'
                                            }
                                        })() : '...'}
                                    </span>
                                    {notif.link && (
                                        <Link
                                            href={notif.link}
                                            className="text-[10px] font-bold text-blue-600 hover:underline"
                                        >
                                            Ver más
                                        </Link>
                                    )}
                                </div>
                            </DropdownMenuItem>
                        ))
                    )}
                </div>

                <DropdownMenuSeparator />
                <div className="p-3 bg-zinc-50/30 text-center">
                    <Button variant="ghost" size="sm" className="w-full text-xs font-bold text-zinc-500 hover:text-zinc-900 h-8">
                        Ver todas las notificaciones
                    </Button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
