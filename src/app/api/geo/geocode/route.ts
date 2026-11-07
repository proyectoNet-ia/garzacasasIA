import { NextResponse } from 'next/server'

/**
 * Endpoint de Geocodificación y Extracción de Coordenadas
 * Soporta:
 * 1. Búsqueda por dirección / colonia / municipio en OpenStreetMap Nominatim (México)
 * 2. Resolución y extracción de coordenadas de enlaces de Google Maps (incluyendo maps.app.goo.gl)
 */
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const query = searchParams.get('q')?.trim() || ''
        const colonia = searchParams.get('colonia')?.trim() || ''
        const municipio = searchParams.get('municipio')?.trim() || ''
        const estado = searchParams.get('estado')?.trim() || ''
        const cp = searchParams.get('cp')?.trim() || ''

        // -------------------------------------------------------------
        // CASO 1: Es una URL de Google Maps o enlace compartido
        // -------------------------------------------------------------
        if (query.includes('google.com/maps') || query.includes('maps.app.goo.gl') || query.includes('goo.gl/maps')) {
            const coords = await extraerCoordenadasDeUrl(query)
            if (coords) {
                return NextResponse.json({
                    success: true,
                    latitude: coords.lat,
                    longitude: coords.lng,
                    source: 'google_maps_url',
                    display_name: 'Coordenadas extraídas de Google Maps'
                })
            }
        }

        // -------------------------------------------------------------
        // CASO 2: Geocodificación por Dirección / Colonia / Municipio
        // -------------------------------------------------------------
        // Construir cadenas de búsqueda con diferente nivel de especificidad
        const busquedas: string[] = []

        if (query) {
            busquedas.push(query.includes('México') || query.includes('Mexico') ? query : `${query}, México`)
        }

        // Búsqueda específica con Colonia, Municipio y Estado
        const partesEspecificas: string[] = []
        if (colonia) partesEspecificas.push(colonia)
        if (municipio) partesEspecificas.push(municipio)
        if (estado) partesEspecificas.push(estado)
        if (cp) partesEspecificas.push(`C.P. ${cp}`)
        if (partesEspecificas.length > 0) {
            busquedas.push(`${partesEspecificas.join(', ')}, México`)
        }

        // Fallback: Municipio y Estado
        if (municipio && estado) {
            busquedas.push(`${municipio}, ${estado}, México`)
        }

        for (const searchStr of busquedas) {
            try {
                const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchStr)}&countrycodes=mx&limit=1`
                const res = await fetch(nominatimUrl, {
                    headers: {
                        'User-Agent': 'GarzaCasasIA/1.0 (contacto@garzacasas.com)'
                    },
                    next: { revalidate: 86400 } // Caché de 24 horas
                })

                if (res.ok) {
                    const data = await res.json()
                    if (Array.isArray(data) && data.length > 0) {
                        const item = data[0]
                        const lat = parseFloat(item.lat)
                        const lng = parseFloat(item.lon)

                        if (!isNaN(lat) && !isNaN(lng)) {
                            return NextResponse.json({
                                success: true,
                                latitude: lat,
                                longitude: lng,
                                display_name: item.display_name,
                                source: 'osm_nominatim'
                            })
                        }
                    }
                }
            } catch (err: any) {
                console.warn('[Geocode] Falló intento:', searchStr, err.message)
            }
        }

        return NextResponse.json({
            success: false,
            message: 'No se encontraron coordenadas precisas para esta dirección.'
        }, { status: 404 })

    } catch (error: any) {
        console.error('[Geocode API Error]:', error)
        return NextResponse.json({
            success: false,
            message: error.message || 'Error interno del servidor de geolocalización'
        }, { status: 500 })
    }
}

/**
 * Helper para resolver enlaces cortos y extraer latitud/longitud
 */
async function extraerCoordenadasDeUrl(rawUrl: string): Promise<{ lat: number; lng: number } | null> {
    try {
        let finalUrl = rawUrl.trim()

        // Si es enlace corto maps.app.goo.gl, seguir redirect
        if (finalUrl.includes('goo.gl')) {
            const resp = await fetch(finalUrl, { method: 'HEAD', redirect: 'follow' })
            finalUrl = resp.url
        }

        // Patrón 1: @lat,lng,zoom (ej: /@20.346492,-102.035891,17z)
        const matchAt = finalUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
        if (matchAt) {
            return {
                lat: parseFloat(matchAt[1]),
                lng: parseFloat(matchAt[2])
            }
        }

        // Patrón 2: q=lat,lng o ll=lat,lng (ej: ?q=20.346492,-102.035891)
        const matchQuery = finalUrl.match(/[?&](?:q|ll)=(-?\d+\.\d+),(-?\d+\.\d+)/)
        if (matchQuery) {
            return {
                lat: parseFloat(matchQuery[1]),
                lng: parseFloat(matchQuery[2])
            }
        }

        // Patrón 3: place/.../!3dlat!4dlng
        const matchPlace = finalUrl.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/)
        if (matchPlace) {
            return {
                lat: parseFloat(matchPlace[1]),
                lng: parseFloat(matchPlace[2])
            }
        }

        return null
    } catch {
        return null
    }
}
