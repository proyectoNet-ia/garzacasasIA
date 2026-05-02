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
        const municipio = searchParams.get('municipio')?.toUpperCase() || 'MORELIA'
        const tipo = (searchParams.get('tipo') || 'casa') as 'casa' | 'departamento'

        // 1. Mapear municipio a clave INEGI
        const claveArea = (MUNICIPIOS_MICHOACAN as any)[municipio] || AREAS.NACIONAL

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
        } catch (apiError) {
            console.warn('[API Plusvalía] Falló consulta real, usando fallback:', apiError)
        }

        // 3. Fallback a datos estáticos si la API falla o no hay datos
        const datos = PRECIOS_MORELIA_2026.filter(
            p => p.municipio.toUpperCase() === municipio
        )

        return NextResponse.json(datos.length > 0 ? datos : PRECIOS_MORELIA_2026)
    } catch (error: any) {
        return NextResponse.json(
            { error: 'Error al obtener indicadores de plusvalía' },
            { status: 500 }
        )
    }
}
