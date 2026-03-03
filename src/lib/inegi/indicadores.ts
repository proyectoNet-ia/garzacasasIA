// ============================================================
// INDICADORES — Banco de Indicadores INEGI
// Precios de vivienda, INPC, tipo de cambio, UMA, etc.
// Documentación: https://www.inegi.org.mx/app/api/indicadores/
// ============================================================

import { fetchConCache, indicadorUrl, CACHE_TTL_HORAS } from './client'
import type { IndicadoresRespuesta, PrecioZona } from './tipos'

// ---- Claves de series del Banco de Indicadores ----
// Puedes buscar más en: https://www.inegi.org.mx/app/indicadores/
const SERIES = {
    // Índice SHF de precios de vivienda por entidad
    PRECIOS_VIVIENDA_CASA: '444074',  // Casa habitación (nacional)
    PRECIOS_VIVIENDA_DEPTO: '444075',  // Departamento (nacional)

    // Precios al consumidor
    INPC: '216064',  // Índice Nacional de Precios al Consumidor

    // Actividad económica
    IGAE: '493911',  // Indicador Global de Actividad Económica

    // UMA 2026 (Unidad de Medida y Actualización — referencia legal de avalúos)
    UMA_DIARIO: '381016',
}

// ---- Claves de área geográfica ----
// Más en: https://www.inegi.org.mx/app/api/indicadores/
export const AREAS = {
    NACIONAL: '00',
    MICHOACAN: '16',  // Clave INEGI Michoacán de Ocampo
    JALISCO: '14',
    CDMX: '09',
    NUEVO_LEON: '19',
    // Agrega más estados según necesidad
}

// Claves de municipios relevantes de Michoacán
export const MUNICIPIOS_MICHOACAN = {
    MORELIA: '16053',
    URUAPAN: '16102',
    ZAMORA: '16114',
    LAZARO_CARDENAS: '16052',
    PATZCUARO: '16066',
    APATZINGAN: '16006',
    ZITACUARO: '16116',
}

/**
 * Obtiene el índice de precios de vivienda para un área
 */
export async function getPreciosVivienda(
    areaClave: string = AREAS.MICHOACAN,
    tipo: 'casa' | 'departamento' = 'casa'
): Promise<IndicadoresRespuesta> {
    const serie = tipo === 'casa'
        ? SERIES.PRECIOS_VIVIENDA_CASA
        : SERIES.PRECIOS_VIVIENDA_DEPTO

    const cacheKey = `precios_${serie}_${areaClave}`
    const url = indicadorUrl(serie, areaClave)

    return fetchConCache<IndicadoresRespuesta>(url, cacheKey, CACHE_TTL_HORAS.precios)
}

/**
 * Obtiene el INPC más reciente (inflación general)
 */
export async function getINPC(): Promise<IndicadoresRespuesta> {
    const cacheKey = `inpc_nacional`
    const url = indicadorUrl(SERIES.INPC, AREAS.NACIONAL)
    return fetchConCache<IndicadoresRespuesta>(url, cacheKey, CACHE_TTL_HORAS.indicadores)
}

/**
 * Obtiene el valor de la UMA vigente (2026)
 */
export async function getUMA(): Promise<number | null> {
    try {
        const cacheKey = 'uma_2026'
        const url = indicadorUrl(SERIES.UMA_DIARIO, AREAS.NACIONAL)
        const data = await fetchConCache<IndicadoresRespuesta>(url, cacheKey, CACHE_TTL_HORAS.precios)

        const obs = data?.Series?.[0]?.OBSERVACIONES
        if (!obs || obs.length === 0) return null

        // Tomar la observación más reciente
        const ultima = obs[obs.length - 1]
        return parseFloat(ultima.OBS_VALUE)
    } catch {
        return null
    }
}

/**
 * Extrae los datos más recientes de una serie de indicadores
 * y calcula la variación anual automáticamente
 */
export function extraerDatosRecientes(data: IndicadoresRespuesta): {
    valor_actual: number
    valor_hace_un_anio: number
    variacion_anual_pct: number
    periodo: string
} | null {
    try {
        const obs = data?.Series?.[0]?.OBSERVACIONES
        if (!obs || obs.length < 2) return null

        const actual = obs[obs.length - 1]
        const haceUnAnio = obs[obs.length - 13] ?? obs[0] // Aprox 12 meses atrás

        const valorActual = parseFloat(actual.OBS_VALUE)
        const valorAnterior = parseFloat(haceUnAnio.OBS_VALUE)
        const variacion = ((valorActual - valorAnterior) / valorAnterior) * 100

        return {
            valor_actual: valorActual,
            valor_hace_un_anio: valorAnterior,
            variacion_anual_pct: Math.round(variacion * 10) / 10,
            periodo: actual.PERIODO,
        }
    } catch {
        return null
    }
}

/**
 * Datos hardcodeados con precios reales de Morelia Feb 2026
 * USAR MIENTRAS SE INTEGRA LA API — son datos verificados
 */
export const PRECIOS_MORELIA_2026: PrecioZona[] = [
    {
        municipio: 'Morelia',
        clave_municipio: MUNICIPIOS_MICHOACAN.MORELIA,
        estado: 'Michoacán',
        precio_m2: 23233,
        variacion_anual: 8.3,
        tipo: 'casa',
        periodo: '2026-02',
        fuente: 'SHF-INEGI',
    },
    {
        municipio: 'Morelia',
        clave_municipio: MUNICIPIOS_MICHOACAN.MORELIA,
        estado: 'Michoacán',
        precio_m2: 20842,
        variacion_anual: 8.3,
        tipo: 'departamento',
        periodo: '2026-02',
        fuente: 'SHF-INEGI',
    },
]
