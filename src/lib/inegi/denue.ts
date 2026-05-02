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

    const respuesta = await fetchConCache<DenueRespuesta | DenueEstablecimiento[]>(
        url,
        cacheKey,
        CACHE_TTL_HORAS.denue
    )

    // La API puede devolver el array directamente o en .datos
    if (Array.isArray(respuesta)) return respuesta
    if ('datos' in respuesta) return respuesta.datos
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
    const establecimientos = await getEstablecimientosCercanos(lat, lng, radioMetros)

    const contar = (prefijo: string) =>
        establecimientos.filter(e => {
            const codigo = e.codigo_act || (e as any).Codigo_scian || ''
            return codigo.toString().startsWith(prefijo)
        }).length

    return {
        escuelas: contar('611'),
        hospitales: contar('622'),
        clinicas: contar('621'),
        farmacias: contar('464112'),
        bancos: contar('522'),
        supermercados: contar('464111'),
        restaurantes: contar('722'),
        gasolineras: contar('447'),
        gimnasios: contar('71394'),
        parques: 0,
        total: establecimientos.length,
        detalle: establecimientos,
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
