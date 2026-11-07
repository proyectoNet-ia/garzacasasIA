import { NextResponse } from 'next/server'
import { obtenerMercadoInmobiliario } from '@/lib/inegi/mercadoNacional'
import { getPreciosVivienda, extraerDatosRecientes, AREAS } from '@/lib/inegi/indicadores'

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const municipioParam = searchParams.get('municipio') || ''
        const estadoParam = searchParams.get('estado') || ''
        const claveParam = searchParams.get('clave') || ''
        const tipo = (searchParams.get('tipo') || 'casa') as 'casa' | 'departamento' | 'terreno' | 'local'
        const lat = parseFloat(searchParams.get('lat') || '0')
        const lng = parseFloat(searchParams.get('lng') || '0')

        // 1. Obtener cálculo calibrado de inteligencia de mercado nacional para este municipio/estado
        const mercado = obtenerMercadoInmobiliario({
            municipio: municipioParam,
            estado: estadoParam,
            clave: claveParam,
            tipo,
            lat,
            lng
        })

        // 2. Intentar consultar INEGI en tiempo real si está disponible
        try {
            const rawData = await getPreciosVivienda(AREAS.NACIONAL, tipo === 'departamento' ? 'departamento' : 'casa')
            const procesados = extraerDatosRecientes(rawData)
            if (procesados && procesados.variacion_anual_pct) {
                // Confirmamos período reciente si INEGI BIE responde
                mercado.periodo = procesados.periodo
            }
        } catch {
            // Continúa con los datos calibrados SHF del mercado nacional
        }

        return NextResponse.json([mercado])
    } catch (error: any) {
        console.error('[API Plusvalía] Error controlado:', error.message)
        const fallback = obtenerMercadoInmobiliario({ tipo: 'casa' })
        return NextResponse.json([fallback])
    }
}

