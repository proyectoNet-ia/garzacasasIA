import { NextResponse } from 'next/server'
import { getServiciosCercanos } from '@/lib/inegi/denue'

/**
 * API para obtener servicios cercanos (DENUE) por coordenadas
 * GET /api/inegi/servicios?lat=19.7006&lng=-101.1863&radio=500
 */
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const lat = parseFloat(searchParams.get('lat') || '')
        const lng = parseFloat(searchParams.get('lng') || '')
        const radio = parseInt(searchParams.get('radio') || '500')

        if (isNaN(lat) || isNaN(lng)) {
            return NextResponse.json(
                { error: 'Latitud y longitud son requeridas y deben ser números' },
                { status: 400 }
            )
        }

        const servicios = await getServiciosCercanos(lat, lng, radio)
        return NextResponse.json(servicios)
    } catch (error: any) {
        console.error('[API Servicios] Error controlado:', error.message)

        return NextResponse.json(
            { 
                error: 'Servicios no disponibles temporalmente',
                details: error.message,
                fallback: true 
            },
            { status: 200 }
        )
    }
}
