import { NextResponse } from 'next/server'
import { getMunicipiosPorEstado } from '@/lib/inegi/geografia'

/**
 * API para obtener municipios por estado
 * GET /api/inegi/municipios?estado=16
 * 
 * Ahora utiliza el JSON local como fuente de verdad para mayor velocidad y confiabilidad.
 */
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const estadoId = searchParams.get('estado')

        if (!estadoId) {
            return NextResponse.json({ error: 'Estado ID es requerido' }, { status: 400 })
        }

        // Cargamos desde el JSON local (src/lib/inegi/geografia.ts)
        const municipios = getMunicipiosPorEstado(estadoId)

        if (municipios.length === 0) {
            // Si no hay municipios en el JSON para ese ID, intentamos fallback a INEGI
            // o simplemente retornamos vacío si el ID no es válido
            console.warn(`[API Municipios] No se encontraron municipios locales para Estado: ${estadoId}`)
        }

        return NextResponse.json(municipios)
    } catch (error: any) {
        console.error('[API Municipios] Fatal Error:', error.message)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
