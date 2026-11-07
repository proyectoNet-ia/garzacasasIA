import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase-server'
import { capturePayPalOrder, isValidPayPalId } from '@/lib/paypal/client'

export async function POST(req: NextRequest) {
    try {
        // 1. Verificar autenticación del usuario
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                { error: 'No autenticado. Por favor inicia sesión.' },
                { status: 401 }
            )
        }

        const body = await req.json()
        const rawOrderId = body?.orderId

        if (!isValidPayPalId(rawOrderId)) {
            return NextResponse.json(
                { error: 'orderId válido es requerido para completar la captura.' },
                { status: 400 }
            )
        }

        const orderId = rawOrderId.trim()
        const serviceSupabase = createServiceClient()

        // 2. Buscar el registro del pago restringido estrictamente al usuario autenticado
        const { data: payment, error: findError } = await serviceSupabase
            .from('payments')
            .select('*')
            .eq('user_id', user.id)
            .eq('paypal_order_id', orderId)
            .single()

        if (findError || !payment) {
            console.error('[PayPal Capture] No se encontró pago propio para la orden:', orderId)
            return NextResponse.json(
                { error: 'Registro de pago no encontrado en el sistema.' },
                { status: 404 }
            )
        }

        // Si ya fue aprobado previamente, responder con éxito inmediato (idempotencia)
        if (payment.status === 'approved' || payment.status === 'completed') {
            return NextResponse.json({
                success: true,
                status: 'approved',
                orderId,
                message: 'El pago ya había sido procesado y aprobado.',
                planName: payment.plan_name,
            })
        }

        // 3. Capturar la orden en PayPal
        const captureResult = await capturePayPalOrder(orderId)

        if (captureResult.status !== 'COMPLETED') {
            return NextResponse.json({
                success: false,
                status: captureResult.status,
                message: `El estado de la orden en PayPal es ${captureResult.status}, no ha sido completada.`,
            })
        }

        // Verificar integridad del monto capturado frente al monto registrado en BD
        const capturedAmount = Number(captureResult.amount)
        const expectedAmount = Number(payment.amount)
        if (!Number.isFinite(capturedAmount) || capturedAmount + 0.01 < expectedAmount) {
            console.error('[PayPal Capture] Discrepancia de monto detectada:', {
                orderId,
                capturedAmount,
                expectedAmount,
            })
            return NextResponse.json(
                { error: 'El monto capturado no coincide con el monto del plan solicitado.' },
                { status: 400 }
            )
        }

        // 4. Actualizar el pago a 'approved' en Supabase
        const { error: updateError } = await serviceSupabase
            .from('payments')
            .update({
                status: 'approved',
                paypal_capture_id: captureResult.captureId,
                paypal_payer_id: captureResult.payerId,
                payment_method: 'paypal',
                updated_at: new Date().toISOString(),
                metadata: {
                    ...(typeof payment.metadata === 'object' && payment.metadata !== null ? payment.metadata : {}),
                    paypal_order_id: orderId,
                    paypal_capture_id: captureResult.captureId,
                    payer_email: captureResult.payerEmail,
                    captured_at: new Date().toISOString(),
                },
            })
            .eq('id', payment.id)

        if (updateError) {
            console.error('[PayPal Capture] Error actualizando el pago en Supabase:', updateError)
        }

        // 5. Ejecutar la función RPC para actualizar la membresía del usuario
        const { error: subError } = await serviceSupabase
            .rpc('update_user_subscription_after_payment', {
                p_user_id: payment.user_id,
                p_plan_name: payment.plan_name,
                p_billing_period: payment.billing_period ?? 'monthly',
            })

        if (subError) {
            console.error('[PayPal Capture] Error en RPC update_user_subscription_after_payment:', subError)
            return NextResponse.json(
                { error: 'El pago fue cobrado en PayPal pero ocurrió un problema activando la membresía en BD.' },
                { status: 500 }
            )
        }

        console.log(`[PayPal Capture] ✅ Suscripción activada con éxito para el usuario ${payment.user_id} (${payment.plan_name})`)

        return NextResponse.json({
            success: true,
            status: 'approved',
            orderId,
            captureId: captureResult.captureId,
            planName: payment.plan_name,
        })

    } catch (error: any) {
        console.error('[PayPal Capture] Excepción durante la captura:', error)
        return NextResponse.json(
            { error: error.message ?? 'Error capturando el pago en PayPal.' },
            { status: 500 }
        )
    }
}
