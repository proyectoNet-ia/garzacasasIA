import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'
import {
    getPayPalOrderDetails,
    isValidPayPalId,
    verifyPayPalWebhookSignature,
} from '@/lib/paypal/client'

/**
 * Receptor blindado de Webhooks de PayPal
 * 1. Verifica firma criptográfica si PAYPAL_WEBHOOK_ID está configurado
 * 2. Valida servidor-a-servidor contra la API v2 de PayPal antes de aprobar suscripciones
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const eventType = typeof body?.event_type === 'string' ? body.event_type : ''
        const resource = body?.resource

        // 1. Verificación criptográfica de firma de PayPal (cuando PAYPAL_WEBHOOK_ID está definido)
        const webhookId = process.env.PAYPAL_WEBHOOK_ID?.trim()
        if (webhookId) {
            const isValidSig = await verifyPayPalWebhookSignature(req.headers, body, webhookId)
            if (!isValidSig) {
                console.warn('[PayPal Webhook] Firma criptográfica inválida rechazada.')
                return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 })
            }
        }

        console.log(`[PayPal Webhook] Evento recibido: ${eventType}`)

        // 2. Manejo del evento de captura completada
        if (eventType === 'PAYMENT.CAPTURE.COMPLETED') {
            const rawCaptureId = resource?.id
            const rawOrderId = resource?.supplementary_data?.related_ids?.order_id

            const validOrderId = isValidPayPalId(rawOrderId) ? rawOrderId.trim() : null
            const validCaptureId = isValidPayPalId(rawCaptureId) ? rawCaptureId.trim() : null

            if (!validOrderId && !validCaptureId) {
                return NextResponse.json({ status: 'ignored', reason: 'Identificadores ausentes o inválidos' })
            }

            const supabase = createServiceClient()

            // Buscar el pago de forma parametrizada segura (sin interpolación en .or())
            const paymentQuery = validOrderId
                ? supabase.from('payments').select('*').eq('paypal_order_id', validOrderId)
                : supabase.from('payments').select('*').eq('paypal_capture_id', validCaptureId!)

            const { data: payment, error: findError } = await paymentQuery.maybeSingle()

            if (findError || !payment) {
                console.warn('[PayPal Webhook] No se encontró pago local para la captura:', {
                    orderId: validOrderId,
                    captureId: validCaptureId,
                })
                return NextResponse.json({ status: 'ok', note: 'Referencia de pago no encontrada localmente' })
            }

            if (payment.status === 'approved' || payment.status === 'completed') {
                return NextResponse.json({ status: 'ok', note: 'El pago ya estaba aprobado' })
            }

            // 3. Defensa en profundidad: Verificar servidor-a-servidor contra PayPal OAuth2 API
            const orderIdToVerify = validOrderId || payment.paypal_order_id
            if (!isValidPayPalId(orderIdToVerify)) {
                return NextResponse.json(
                    { error: 'El registro local no posee un paypal_order_id verificable.' },
                    { status: 400 }
                )
            }

            const verifiedOrder = await getPayPalOrderDetails(orderIdToVerify)
            const purchaseUnit = verifiedOrder?.purchase_units?.[0]
            const verifiedCapture = purchaseUnit?.payments?.captures?.find(
                (c: { status?: string }) => c.status === 'COMPLETED'
            ) || purchaseUnit?.payments?.captures?.[0]

            if (verifiedOrder?.status !== 'COMPLETED' || verifiedCapture?.status !== 'COMPLETED') {
                console.warn('[PayPal Webhook] Orden no aparece COMPLETED al consultar PayPal directamente:', {
                    orderId: orderIdToVerify,
                    orderStatus: verifiedOrder?.status,
                })
                return NextResponse.json({ error: 'Order not completed on PayPal' }, { status: 400 })
            }

            const verifiedAmount = Number(verifiedCapture?.amount?.value)
            const expectedAmount = Number(payment.amount)
            if (!Number.isFinite(verifiedAmount) || verifiedAmount + 0.01 < expectedAmount) {
                console.error('[PayPal Webhook] Monto verificado inferior al esperado:', {
                    orderId: orderIdToVerify,
                    verifiedAmount,
                    expectedAmount,
                })
                return NextResponse.json({ error: 'Payment amount mismatch' }, { status: 400 })
            }

            // 4. Actualizar registro en Supabase
            await supabase
                .from('payments')
                .update({
                    status: 'approved',
                    paypal_capture_id: verifiedCapture?.id || validCaptureId || payment.paypal_capture_id,
                    paypal_payer_id: verifiedOrder?.payer?.payer_id || payment.paypal_payer_id,
                    payment_method: 'paypal',
                    updated_at: new Date().toISOString(),
                    metadata: {
                        ...(typeof payment.metadata === 'object' && payment.metadata !== null ? payment.metadata : {}),
                        webhook_processed_at: new Date().toISOString(),
                        webhook_event: eventType,
                    },
                })
                .eq('id', payment.id)

            // 5. Activar membresía en el perfil del agente
            const { error: subError } = await supabase
                .rpc('update_user_subscription_after_payment', {
                    p_user_id: payment.user_id,
                    p_plan_name: payment.plan_name,
                    p_billing_period: payment.billing_period ?? 'monthly',
                })

            if (subError) {
                console.error('[PayPal Webhook] Error al activar la suscripción vía RPC:', subError)
            } else {
                console.log(`[PayPal Webhook] ✅ Suscripción activada automáticamente para el usuario ${payment.user_id}`)
            }
        }

        return NextResponse.json({ status: 'ok', event: eventType })

    } catch (error: any) {
        console.error('[PayPal Webhook] Error inesperado procesando webhook:', error)
        return NextResponse.json({ status: 'error', message: error.message }, { status: 500 })
    }
}

export async function GET() {
    return NextResponse.json({ status: 'PayPal webhook endpoint activo' })
}
