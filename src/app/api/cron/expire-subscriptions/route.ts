import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'

/**
 * Endpoint Cron diario de Vercel (/api/cron/expire-subscriptions)
 * Degrada automáticamente a 'Gratis' las suscripciones con vigencia expirada.
 * Protegido mediante cabecera Authorization: Bearer <CRON_SECRET>.
 */
export async function GET(req: NextRequest) {
    const cronSecret = process.env.CRON_SECRET?.trim()
    const authHeader = req.headers.get('authorization')

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const supabase = createServiceClient()
        const { data: expiredCount, error } = await supabase.rpc('expire_overdue_subscriptions')

        if (error) {
            console.error('[Cron Expire Subscriptions] Error ejecutando RPC:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            expiredCount: expiredCount ?? 0,
            executedAt: new Date().toISOString(),
        })
    } catch (error: any) {
        console.error('[Cron Expire Subscriptions] Excepción inesperada:', error)
        return NextResponse.json(
            { error: error.message ?? 'Internal server error' },
            { status: 500 }
        )
    }
}
