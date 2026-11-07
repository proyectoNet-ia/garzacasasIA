// ============================================================
// DENUE — Servicios cercanos a una propiedad
// Directorio Estadístico Nacional de Unidades Económicas
// Documentación: https://www.inegi.org.mx/app/api/denue/
// ============================================================

import { fetchConCache, denueUrl, CACHE_TTL_HORAS } from './client'
import type { DenueEstablecimiento, DenueRespuesta, ServiciosCercanos } from './tipos'

// Códigos SCIAN relevantes para inmobiliario
// Ref: https://www.inegi.org.mx/app/scian/
const CODIGOS_SCIAN = {
    escuelas: '61',   // Servicios educativos
    hospitales: '6221', // Hospitales generales
    clinicas: '6219', // Consultorios médicos y de salud
    farmacias: '4641', // Farmacias
    bancos: '5221', // Banca múltiple
    supermercados: '4711', // Supermercados y tiendas de autoservicio
    restaurantes: '7221', // Restaurantes con servicio de mesa completo
    gasolineras: '4471', // Gasolineras
    gimnasios: '7139', // Otras instalaciones deportivas y recreativas
}

/**
 * Obtiene todos los establecimientos en X metros de un punto
 */
export async function getEstablecimientosCercanos(
    lat: number,
    lng: number,
    radioMetros: number = 500,
    codigoActividad: string = '0' // '0' = todos
): Promise<DenueEstablecimiento[]> {
    const cacheKey = `denue_${lat.toFixed(4)}_${lng.toFixed(4)}_${radioMetros}_${codigoActividad}`

    // Endpoint: buscar por radio
    // GET /buscar/{condicion}/{latitud,longitud}/{distancia}/{token}/
    const condicion = codigoActividad === '0' ? 'todos' : codigoActividad
    const url = denueUrl(`buscar/${condicion}/${lat},${lng}/${radioMetros}`)

    const respuesta = await fetchConCache<any>(
        url,
        cacheKey,
        CACHE_TTL_HORAS.denue
    )

    // La API puede devolver el array directamente o en .datos, o como string serializado
    let parsed = respuesta
    if (typeof parsed === 'string') {
        try {
            parsed = JSON.parse(parsed)
        } catch {
            console.error('[DENUE] No se pudo parsear respuesta como JSON:', parsed?.slice(0, 100))
            return []
        }
    }

    if (Array.isArray(parsed)) return parsed
    if (parsed && typeof parsed === 'object' && 'datos' in parsed && Array.isArray(parsed.datos)) {
        return parsed.datos
    }
    return []
}

/**
 * Clasifica y cuenta los servicios cercanos por categoría
 * Este es el dato que se muestra en la ficha pública de la propiedad
 */
export async function getServiciosCercanos(
    lat: number,
    lng: number,
    radioMetros: number = 500
): Promise<ServiciosCercanos> {
    try {
        const establecimientos = await getEstablecimientosCercanos(lat, lng, radioMetros, 'todos')
        
        console.log(`[DEBUG INEGI] Encontrados ${establecimientos.length} negocios cerca de ${lat},${lng}`)

        const stats: ServiciosCercanos = {
            escuelas: 0,
            hospitales: 0,
            clinicas: 0,
            farmacias: 0,
            bancos: 0,
            supermercados: 0,
            restaurantes: 0,
            gasolineras: 0,
            gimnasios: 0,
            parques: 0,
            total: establecimientos.length,
            detalle: establecimientos
        }

        // Clasificación ultra-flexible (revisa código SCIAN, Nombre y Clase de actividad oficial del INEGI)
        establecimientos.forEach(est => {
            const scian = (est.codigo_act || (est as any).Codigo_scian || '').toString()
            const nombre = (est.nom_estab || (est as any).Nombre || '').toLowerCase()
            const clase = ((est as any).Clase_actividad || (est as any).clase_act || '').toLowerCase()
            
            if (scian.startsWith('611') || nombre.includes('escuela') || nombre.includes('colegio') || clase.includes('educa') || clase.includes('escuela') || clase.includes('profesores particulares')) {
                stats.escuelas++
            } else if (scian.startsWith('622') || nombre.includes('hospital') || clase.includes('hospital')) {
                stats.hospitales++
            } else if (scian.startsWith('621') || nombre.includes('clínica') || nombre.includes('consultorio') || clase.includes('médic') || clase.includes('salud') || clase.includes('consultorio')) {
                stats.clinicas++
            } else if (scian.startsWith('464112') || nombre.includes('farmacia') || clase.includes('farmacia')) {
                stats.farmacias++
            } else if (scian.startsWith('522') || nombre.includes('banco') || nombre.includes('bbva') || nombre.includes('santander') || nombre.includes('banamex') || nombre.includes('banorte') || clase.includes('banc') || clase.includes('financier')) {
                stats.bancos++
            } else if (scian.startsWith('464111') || nombre.includes('super') || nombre.includes('soriana') || nombre.includes('walmart') || nombre.includes('bodega aurrera') || nombre.includes('oxxo') || nombre.includes('abarrotes') || clase.includes('autoservicio') || clase.includes('abarrotes') || clase.includes('supermercado')) {
                stats.supermercados++
            } else if (scian.startsWith('722') || nombre.includes('restaurante') || nombre.includes('comida') || nombre.includes('tacos') || nombre.includes('cafetería') || clase.includes('restaurante') || clase.includes('alimento') || clase.includes('cafetería')) {
                stats.restaurantes++
            } else if (scian.startsWith('447') || nombre.includes('gasolinera') || nombre.includes('pemex') || nombre.includes('gas') || clase.includes('combustible') || clase.includes('gasolinera')) {
                stats.gasolineras++
            } else if (scian.startsWith('71394') || nombre.includes('gym') || nombre.includes('gimnasio') || nombre.includes('fitness') || clase.includes('acondicionamiento físico') || clase.includes('deportiv') || clase.includes('gimnasio')) {
                stats.gimnasios++
            }
        })

        return stats
    } catch (error: any) {
        throw new Error(`Error DENUE: ${error.message}`)
    }
}

/**
 * Formatea los servicios cercanos como texto para la IA
 * Útil para pasar el contexto a Gemini
 */
export function serviciosATexto(servicios: ServiciosCercanos): string {
    const partes: string[] = []
    if (servicios.escuelas) partes.push(`${servicios.escuelas} escuela(s)`)
    if (servicios.hospitales) partes.push(`${servicios.hospitales} hospital(es)`)
    if (servicios.clinicas) partes.push(`${servicios.clinicas} clínica(s)`)
    if (servicios.farmacias) partes.push(`${servicios.farmacias} farmacia(s)`)
    if (servicios.bancos) partes.push(`${servicios.bancos} banco(s)`)
    if (servicios.supermercados) partes.push(`${servicios.supermercados} supermercado(s)`)
    if (servicios.restaurantes) partes.push(`${servicios.restaurantes} restaurante(s)`)

    if (partes.length === 0) return 'Sin establecimientos registrados en el radio de búsqueda'
    return `A ${500}m: ${partes.join(', ')}`
}
