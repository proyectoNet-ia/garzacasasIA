'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { createClient } from '@/lib/supabase'
import { EMPTY_BRAND_LOGOS, type BrandLogos } from '@/lib/brand'

const BrandContext = createContext<BrandLogos>(EMPTY_BRAND_LOGOS)

export function useBrandLogos(): BrandLogos {
    return useContext(BrandContext)
}

interface BrandProviderProps {
    initialLogos?: BrandLogos | null
    children: ReactNode
}

/**
 * Distribuye los logotipos configurados en /admin/cms (site_settings) a todo el sitio
 * y se actualiza en tiempo real cuando el Admin cambia los logos.
 */
export function BrandProvider({ initialLogos, children }: BrandProviderProps) {
    const [logos, setLogos] = useState<BrandLogos>(initialLogos || EMPTY_BRAND_LOGOS)

    useEffect(() => {
        const supabase = createClient()
        const channel = supabase
            .channel('brand_logo_changes')
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'site_settings' },
                (payload) => {
                    const next = payload.new as Record<string, unknown> | null
                    if (!next) return
                    if ('logo_on_dark_url' in next || 'logo_on_light_url' in next) {
                        setLogos({
                            onDark: (next.logo_on_dark_url as string) || null,
                            onLight: (next.logo_on_light_url as string) || null,
                        })
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    return <BrandContext.Provider value={logos}>{children}</BrandContext.Provider>
}
