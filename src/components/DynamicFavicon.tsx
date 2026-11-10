'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

const supabase = createClient()

interface DynamicFaviconProps {
    initialFaviconUrl?: string | null
}

export function DynamicFavicon({ initialFaviconUrl }: DynamicFaviconProps) {
    const [faviconUrl, setFaviconUrl] = useState<string | null>(initialFaviconUrl || null)

    useEffect(() => {
        if (initialFaviconUrl && initialFaviconUrl !== faviconUrl) {
            setFaviconUrl(initialFaviconUrl)
        }
    }, [initialFaviconUrl])

    useEffect(() => {
        const fetchFavicon = async () => {
            try {
                const { data } = await supabase
                    .from('site_settings')
                    .select('site_icon_url')
                    .eq('id', 1)
                    .maybeSingle()

                if (data?.site_icon_url) {
                    setFaviconUrl(data.site_icon_url)
                }
            } catch (error) {
                console.error('Error fetching favicon:', error)
            }
        }

        if (!faviconUrl) {
            fetchFavicon()
        }

        // Suscribirse a cambios en tiempo real
        const channel = supabase
            .channel('site_settings_favicon')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'site_settings',
                },
                (payload) => {
                    if (payload.new && 'site_icon_url' in payload.new) {
                        const newUrl = payload.new.site_icon_url as string | null
                        if (newUrl) setFaviconUrl(newUrl)
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    useEffect(() => {
        if (!faviconUrl) return

        const applyFavicon = () => {
            const existingLinks = document.querySelectorAll<HTMLLinkElement>(
                'link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]'
            )

            if (existingLinks.length > 0) {
                existingLinks.forEach((link) => {
                    link.href = faviconUrl
                })
            } else {
                const link = document.createElement('link')
                link.rel = 'icon'
                link.href = faviconUrl
                document.head.appendChild(link)
            }

            let shortcut = document.querySelector<HTMLLinkElement>('link[rel="shortcut icon"]')
            if (!shortcut) {
                shortcut = document.createElement('link')
                shortcut.rel = 'shortcut icon'
                document.head.appendChild(shortcut)
            }
            shortcut.href = faviconUrl
        }

        applyFavicon()
        const handleFocus = () => applyFavicon()
        window.addEventListener('focus', handleFocus)
        return () => {
            window.removeEventListener('focus', handleFocus)
        }
    }, [faviconUrl])

    return null
}
