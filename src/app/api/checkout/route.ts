import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase-server'
import { createPayPalOrder } from '@/lib/paypal/client'

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

        // 2. Obtener datos de la solicitud
        const body = await req.json()
        const { planId, billingPeriod = 'monthly' } = body

        if (!planId) {
            return NextResponse.json(
                { error: 'planId es requerido' },
                { status: 400 }
            )
        }

        const serviceSupabase = createServiceClient()

        // 3. Obtener información del plan desde la base de datos
        const { data: plan, error: planError } = await serviceSupabase
            .from('subscriptions_config')
            .select('*')
            .eq('id', planId)
            .single()

        if (planError || !plan) {
            return NextResponse.json(
                { error: 'Plan no encontrado' },
                { status: 404 }
            )
        }

        // El plan gratuito no requiere pago
        if (!plan.monthly_price || plan.monthly_price === 0) {
            return NextResponse.json(
                { error: 'Este plan es gratuito, no requiere pago.' },
                { status: 400 }
            )
        }

        // 4. Obtener nombre del perfil
        const { data: profile } = await serviceSupabase
            .from('profiles')
            .select('full_name')
            .eq('id', user.id)
            .single()

        const amount = billingPeriod === 'yearly'
            ? (plan.yearly_price ?? plan.monthly_price * 10) // 2 meses de descuento en pago anual
            : plan.monthly_price

        // 5. Generar referencia interna única (Web Crypto nativa)
        const externalReference = crypto.randomUUID()

        // 6. Registrar el intento de pago en Supabase
        const { error: paymentError } = await serviceSupabase
            .from('payments')
            .insert({
                user_id: user.id,
                plan_id: planId,
                plan_name: plan.name,
                amount,
                currency: 'MXN',
                status: 'pending',
                gateway: 'paypal',
                billing_period: billingPeriod,
                mp_external_reference: externalReference, // Compatibilidad con schema previo
            })

        if (paymentError) {
            console.error('Error registrando pago en Supabase:', paymentError)
            return NextResponse.json(
                { error: 'Error interno al registrar el pago preliminar.' },
                { status: 500 }
            )
        }

        // 7. Crear la orden de pago en PayPal
        const order = await createPayPalOrder({
            planName: plan.name,
            planId: plan.id,
            amount,
            billingPeriod,
            userId: user.id,
            userEmail: user.email ?? '',
            userName: profile?.full_name ?? 'Agente Inmobiliario',
            externalReference,
        })

        // 8. Asociar el ID de orden de PayPal al registro de pago
        await serviceSupabase
            .from('payments')
            .update({
                paypal_order_id: order.orderId,
                mp_preference_id: order.orderId, // Para compatibilidad
            })
            .eq('mp_external_reference', externalReference)

        return NextResponse.json({
            orderId: order.orderId,
            checkoutUrl: order.approveUrl,
        })

    } catch (error: any) {
        console.error('Error en /api/checkout (PayPal):', error)
        return NextResponse.json(
            { error: error.message ?? 'Error interno del servidor procesando el pago.' },
            { status: 500 }
        )
    }
}
