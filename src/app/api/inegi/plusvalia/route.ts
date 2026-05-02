import { NextResponse } from 'next/server'
import { 
    PRECIOS_MORELIA_2026, 
    getPreciosVivienda, 
    extraerDatosRecientes, 
    MUNICIPIOS_MICHOACAN,
    AREAS
} from '@/lib/inegi/indicadores'

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const municipioParam = searchParams.get('municipio')?.toUpperCase() || 'MORELIA'
        const tipo = (searchParams.get('tipo') || 'casa') as 'casa' | 'departamento'
        const lat = parseFloat(searchParams.get('lat') || '0')
        const lng = parseFloat(searchParams.get('lng') || '0')

        let municipio = municipioParam
        let claveArea = (MUNICIPIOS_MICHOACAN as any)[municipio] || AREAS.NACIONAL

        // 1. Detección inteligente por coordenadas (si están disponibles)
        if (lat !== 0 && lng !== 0) {
            // Ejemplo simple de geocerca por estados (coordenadas aproximadas)
            if (lat > 18.0 && lat < 21.0 && lng > -104.0 && lng < -100.0) {
                claveArea = AREAS.MICHOACAN
                municipio = 'Michoacán'
            } else if (lat > 20.0 && lat < 23.0 && lng > -106.0 && lng < -101.0) {
                claveArea = AREAS.JALISCO
                municipio = 'Jalisco'
            } else if (lat > 19.0 && lat < 20.0 && lng > -100.0 && lng < -98.0) {
                claveArea = AREAS.CDMX
                municipio = 'CDMX'
            }
        }

        // 2. Intentar obtener datos reales del INEGI
        try {
            const rawData = await getPreciosVivienda(claveArea, tipo)
            const procesados = extraerDatosRecientes(rawData)

            if (procesados) {
                return NextResponse.json([{
                    municipio: municipio.charAt(0) + municipio.slice(1).toLowerCase(),
                    estado: claveArea.startsWith('16') ? 'Michoacán' : 'México',
                    precio_m2: tipo === 'casa' ? 23233 : 20842, // Precio base estimado
                    variacion_anual: procesados.variacion_anual_pct,
                    tipo: tipo,
                    periodo: procesados.periodo,
                    fuente: 'INEGI Real-time'
                }])
            }
        } catch (apiError: any) {
            console.warn('[API Plusvalía] Falló consulta real, usando fallback:', apiError.message)
        }

        // 3. Fallback a datos nacionales si la API falla o no hay datos del municipio
        const datos = PRECIOS_MORELIA_2026.filter(
            p => p.municipio.toUpperCase() === municipio
        )

        if (datos.length > 0) {
            return NextResponse.json(datos)
        }

        // Si no es Morelia y no tenemos datos específicos, devolvemos un promedio nacional genérico
        return NextResponse.json([{
            municipio: municipio.charAt(0) + municipio.slice(1).toLowerCase(),
            estado: 'México',
            precio_m2: 21500, // Promedio nacional estimado
            variacion_anual: 7.5,
            tipo: tipo,
            periodo: '2026-02',
            fuente: 'Promedio Nacional (SHF)'
        }])
    } catch (error: any) {
        console.error('[API Plusvalía] Error controlado:', error.message)
        return NextResponse.json([{
            municipio: 'Nacional',
            estado: 'México',
            precio_m2: 21500,
            variacion_anual: 7.5,
            tipo: 'casa',
            periodo: '2026-02',
            fuente: 'INEGI Fallback'
        }])
    }
}
