import { NextRequest, NextResponse } from 'next/server'
import { getPaymentById } from '@/lib/mercadopago/client'
import { createServiceClient } from '@/lib/supabase-server'

// Mercado Pago enviará notificaciones a este endpoint
// Documentación: https://www.mercadopago.com.mx/developers/es/docs/your-integrations/notifications/webhooks

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        console.log('[MP Webhook] Received:', JSON.stringify(body, null, 2))

        // MP envía diferentes tipos de notificaciones
        const { type, data } = body

        // Solo procesamos notificaciones de pagos
        if (type !== 'payment') {
            return NextResponse.json({ status: 'ignored', reason: `type '${type}' not handled` })
        }

        const paymentId = data?.id
        if (!paymentId) {
            return NextResponse.json({ status: 'ignored', reason: 'no payment id' })
        }

        // Obtener detalles del pago desde MP
        const mpPayment = await getPaymentById(String(paymentId))

        if (!mpPayment) {
            return NextResponse.json({ status: 'error', reason: 'payment not found in MP' }, { status: 404 })
        }

        const externalReference = mpPayment.external_reference
        const mpStatus = mpPayment.status           // approved | rejected | pending | in_process
        const mpStatusDetail = mpPayment.status_detail

        console.log(`[MP Webhook] Payment ${paymentId} | status: ${mpStatus} | ref: ${externalReference}`)

        if (!externalReference) {
            return NextResponse.json({ status: 'error', reason: 'no external_reference' }, { status: 400 })
        }

        // Usar service role para bypass RLS en operaciones de webhook
        const supabase = createServiceClient()

        // Buscar el pago en nuestra BD por external_reference
        const { data: payment, error: findError } = await supabase
            .from('payments')
            .select('*, user_id, plan_name, billing_period')
            .eq('mp_external_reference', externalReference)
            .single()

        if (findError || !payment) {
            console.error('[MP Webhook] Payment not found in DB:', externalReference)
            // Respondemos 200 para que MP no reintente (evitar bucle)
            return NextResponse.json({ status: 'ok', note: 'payment reference not found locally' })
        }

        // Actualizar el pago en nuestra BD
        const { error: updateError } = await supabase
            .from('payments')
            .update({
                status: mpStatus ?? 'pending',
                mp_payment_id: String(paymentId),
                payment_method: mpPayment.payment_type_id,
                metadata: {
                    mp_status_detail: mpStatusDetail,
                    mp_payment_method: mpPayment.payment_method_id,
                    mp_payer_email: mpPayment.payer?.email,
                    processed_at: new Date().toISOString(),
                },
                updated_at: new Date().toISOString(),
            })
            .eq('mp_external_reference', externalReference)

        if (updateError) {
            console.error('[MP Webhook] Error updating payment:', updateError)
            return NextResponse.json({ status: 'error', reason: updateError.message }, { status: 500 })
        }

        // Si el pago fue APROBADO → actualizar la suscripción del usuario
        if (mpStatus === 'approved') {
            const { error: subError } = await supabase
                .rpc('update_user_subscription_after_payment', {
                    p_user_id: payment.user_id,
                    p_plan_name: payment.plan_name,
                    p_billing_period: payment.billing_period ?? 'monthly',
                })

            if (subError) {
                console.error('[MP Webhook] Error updating subscription:', subError)
                // No devolvemos error para que MP no reintente, pero logueamos
            } else {
                console.log(`[MP Webhook] ✅ Subscription updated for user ${payment.user_id} → ${payment.plan_name}`)
            }
        }

        return NextResponse.json({ status: 'ok', paymentStatus: mpStatus })

    } catch (error: any) {
        console.error('[MP Webhook] Unexpected error:', error)
        // Siempre devolver 200 al webhook de MP para evitar reintentos infinitos
        return NextResponse.json({ status: 'error', message: error.message })
    }
}

// MP también envía GET para verificar que el endpoint existe
export async function GET() {
    return NextResponse.json({ status: 'webhook endpoint active' })
}
