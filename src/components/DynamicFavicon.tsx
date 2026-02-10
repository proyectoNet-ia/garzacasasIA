'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

const supabase = createClient()

export function DynamicFavicon() {
    const [faviconUrl, setFaviconUrl] = useState<string | null>(null)

    useEffect(() => {
        const fetchFavicon = async () => {
            try {
                const { data } = await supabase
                    .from('site_settings')
                    .select('site_icon_url')
                    .single()

                if (data?.site_icon_url) {
                    setFaviconUrl(data.site_icon_url)
                }
            } catch (error) {
                console.error('Error fetching favicon:', error)
            }
        }

        fetchFavicon()

        // Subscribe to changes in site_settings
        const channel = supabase
            .channel('site_settings_changes')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'site_settings'
                },
                (payload) => {
                    if (payload.new && 'site_icon_url' in payload.new) {
                        setFaviconUrl(payload.new.site_icon_url as string)
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

        // Update all favicon links
        const updateFavicon = (rel: string, sizes?: string) => {
            let link = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement

            if (!link) {
                link = document.createElement('link')
                link.rel = rel
                if (sizes) link.setAttribute('sizes', sizes)
                document.head.appendChild(link)
            }

            link.href = faviconUrl
        }

        // Update different favicon sizes
        updateFavicon('icon')
        updateFavicon('apple-touch-icon', '180x180')
        updateFavicon('icon', '32x32')
        updateFavicon('icon', '16x16')

    }, [faviconUrl])

    return null
}
