// ============================================================
// CLIENTE BASE — INEGI APIs
// Maneja autenticación, caché en Supabase y errores
// ============================================================

import { createClient } from '@/lib/supabase'
import type { InegicacheEntry } from './tipos'

const INEGI_TOKEN = process.env.INEGI_API_TOKEN
const DENUE_BASE = process.env.INEGI_DENUE_BASE_URL ?? 'https://www.inegi.org.mx/app/api/denue/v1/consulta'
const INDICADORES_BASE = process.env.INEGI_INDICADORES_BASE_URL ?? 'https://www.inegi.org.mx/app/api/indicadores/series'

// TTL del caché en horas
const CACHE_TTL_HORAS = {
    denue: 24 * 7,       // 7 días — los negocios cambian poco
    indicadores: 24,     // 1 día  — indicadores se actualizan a diario
    precios: 24 * 30,    // 30 días — precios/m² son mensuales
}

// ---- Caché ----

async function getCached<T>(key: string): Promise<T | null> {
    try {
        const supabase = createClient()
        const { data, error } = await supabase
            .from('inegi_cache')
            .select('data, expires_at')
            .eq('cache_key', key)
            .single()

        if (error || !data) return null

        const expired = new Date(data.expires_at) < new Date()
        if (expired) return null

        return data.data as T
    } catch {
        return null
    }
}

async function setCache(key: string, data: unknown, ttlHoras: number): Promise<void> {
    try {
        const supabase = createClient()
        const expiresAt = new Date(Date.now() + ttlHoras * 60 * 60 * 1000).toISOString()

        await supabase
            .from('inegi_cache')
            .upsert({
                cache_key: key,
                data,
                expires_at: expiresAt,
            } satisfies Omit<InegicacheEntry, 'id'>)
    } catch (err) {
        // El caché es opcional — si falla, la app sigue funcionando
        console.warn('[INEGI Cache] Error guardando caché:', err)
    }
}

// ---- Fetch con caché ----

export async function fetchConCache<T>(
    url: string,
    cacheKey: string,
    ttlHoras: number
): Promise<T> {
    // 1. Intentar desde caché
    const cached = await getCached<T>(cacheKey)
    if (cached) return cached

    // 2. Llamar a la API
    const res = await fetch(url, {
        headers: { 'Accept': 'application/json' },
        next: { revalidate: ttlHoras * 3600 }, // Next.js ISR
    })

    if (!res.ok) {
        throw new Error(`[INEGI API] Error ${res.status} en: ${url}`)
    }

    const data: T = await res.json()

    // 3. Guardar en caché
    await setCache(cacheKey, data, ttlHoras)

    return data
}

// ---- Helpers de URL ----

export function denueUrl(endpoint: string): string {
    if (!INEGI_TOKEN) throw new Error('[INEGI] Falta INEGI_API_TOKEN en variables de entorno')
    return `${DENUE_BASE}/${endpoint}/${INEGI_TOKEN}/`
}

export function indicadorUrl(serie: string, area: string): string {
    if (!INEGI_TOKEN) throw new Error('[INEGI] Falta INEGI_API_TOKEN en variables de entorno')
    return `${INDICADORES_BASE}/${serie}/es/${area}/false/json`
}

export { CACHE_TTL_HORAS }
