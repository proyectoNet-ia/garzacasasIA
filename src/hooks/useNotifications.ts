'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'

export interface Notification {
    id: string
    user_id: string
    title: string
    message: string
    type: 'info' | 'warning' | 'success' | 'error' | 'stats' | 'plan'
    link?: string
    is_read: boolean
    created_at: string
}

export function useNotifications() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    const fetchNotifications = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(20)

            if (data) {
                setNotifications(data)
                setUnreadCount(data.filter(n => !n.is_read).length)
            }
        } catch (error) {
            console.error('Error fetching notifications:', error)
        } finally {
            setLoading(false)
        }
    }

    const markAsRead = async (id: string) => {
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', id)

        if (!error) {
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, is_read: true } : n)
            )
            setUnreadCount(prev => Math.max(0, prev - 1))
        }
    }

    const markAllAsRead = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', user.id)
            .eq('is_read', false)

        if (!error) {
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
            setUnreadCount(0)
        }
    }

    useEffect(() => {
        let channel: any
        let isMounted = true

        const init = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user || !isMounted) {
                    setLoading(false)
                    return
                }

                // Initial fetch
                const { data, error } = await supabase
                    .from('notifications')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(20)

                if (data && isMounted) {
                    setNotifications(data)
                    setUnreadCount(data.filter(n => !n.is_read).length)
                }

                if (!isMounted) return

                // Setup Real-time
                channel = supabase
                    .channel(`user-notifications-${user.id}`)
                    .on(
                        'postgres_changes',
                        {
                            event: 'INSERT',
                            schema: 'public',
                            table: 'notifications',
                            filter: `user_id=eq.${user.id}`
                        },
                        (payload) => {
                            if (!isMounted) return
                            const newNotif = payload.new as Notification
                            setNotifications(prev => [newNotif, ...prev.slice(0, 19)])
                            setUnreadCount(prev => prev + 1)
                        }
                    )
                    .subscribe()

            } catch (err) {
                console.error('Notification system init error:', err)
            } finally {
                if (isMounted) setLoading(false)
            }
        }

        init()

        // Fallback safety: always release loading after 10s
        const timeout = setTimeout(() => {
            if (isMounted) setLoading(false)
        }, 10000)

        return () => {
            isMounted = false
            clearTimeout(timeout)
            if (channel) supabase.removeChannel(channel)
        }
    }, [])

    return {
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        refresh: fetchNotifications
    }
}
