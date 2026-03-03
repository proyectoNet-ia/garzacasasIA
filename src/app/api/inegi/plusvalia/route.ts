import { NextResponse } from 'next/server'
import { PRECIOS_MORELIA_2026 } from '@/lib/inegi/indicadores'

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const municipio = searchParams.get('municipio') || 'Morelia'

        // Buscamos en nuestros datos reales (Feb 2026)
        // En una fase posterior, esto llamaría a getPreciosVivienda() para datos nacionales
        const datos = PRECIOS_MORELIA_2026.filter(
            p => p.municipio.toLowerCase() === municipio.toLowerCase()
        )

        if (datos.length === 0) {
            // Si no hay datos específicos del municipio, devolvemos el promedio de Morelia como fallback
            return NextResponse.json(PRECIOS_MORELIA_2026)
        }

        return NextResponse.json(datos)
    } catch (error: any) {
        return NextResponse.json(
            { error: 'Error al obtener indicadores de plusvalía' },
            { status: 500 }
        )
    }
}
