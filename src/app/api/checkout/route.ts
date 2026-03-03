import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase-server'
import { createPaymentPreference } from '@/lib/mercadopago/client'
import { v4 as uuidv4 } from 'uuid'

export async function POST(req: NextRequest) {
    // 🔍 DEBUG — ver qué credenciales tiene el servidor en runtime
    const token = process.env.MP_ACCESS_TOKEN || 'NO_TOKEN'
    const pubKey = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY || 'NO_KEY'
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'NO_URL'
    console.log('[Checkout] MP_ACCESS_TOKEN prefix:', token.substring(0, 15) + '...')
    console.log('[Checkout] MP_PUBLIC_KEY prefix:', pubKey.substring(0, 15) + '...')
    console.log('[Checkout] APP_URL:', appUrl)
    // ────────────────────────────────────────────────────────────
    try {

        // 1. Verificar autenticación (cliente normal del usuario)
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                { error: 'No autenticado. Por favor inicia sesión.' },
                { status: 401 }
            )
        }

        // 2. Obtener datos del body
        const body = await req.json()
        const { planId, billingPeriod = 'monthly' } = body

        if (!planId) {
            return NextResponse.json(
                { error: 'planId es requerido' },
                { status: 400 }
            )
        }

        // Service client para operaciones de BD con bypass de RLS
        const serviceSupabase = createServiceClient()

        // 3. Obtener info del plan de la BD
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

        // No se puede pagar el plan gratuito
        if (!plan.monthly_price || plan.monthly_price === 0) {
            return NextResponse.json(
                { error: 'Este plan es gratuito, no requiere pago.' },
                { status: 400 }
            )
        }

        // 4. Obtener nombre del perfil (email viene de auth.getUser)
        const { data: profile } = await serviceSupabase
            .from('profiles')
            .select('full_name')
            .eq('id', user.id)
            .single()

        const amount = billingPeriod === 'yearly'
            ? (plan.yearly_price ?? plan.monthly_price * 10)  // 2 meses gratis si paga anual
            : plan.monthly_price

        // 5. Crear referencia externa única para este intento de pago
        const externalReference = uuidv4()

        // 6. Registrar el intento de pago en la BD usando service client (bypass RLS)
        const { error: paymentError } = await serviceSupabase
            .from('payments')
            .insert({
                user_id: user.id,
                plan_id: planId,
                plan_name: plan.name,
                amount,
                currency: 'MXN',
                status: 'pending',
                billing_period: billingPeriod,
                mp_external_reference: externalReference,
            })

        if (paymentError) {
            console.error('Error registrando pago:', paymentError)
            return NextResponse.json(
                { error: 'Error interno al registrar el pago.' },
                { status: 500 }
            )
        }

        // 7. Crear preferencia en Mercado Pago
        // ⚠️ IMPORTANTE SANDBOX: MP rechaza si el payer email pertenece
        // a una cuenta real de MP. En TEST usamos el email del comprador de prueba.
        const isSandboxToken = process.env.MP_ACCESS_TOKEN?.startsWith('TEST-')
        const payerEmail = isSandboxToken
            ? 'test_user_1562492252061690351@testuser.com'  // Comprador de prueba
            : (user.email ?? '')

        const preference = await createPaymentPreference({
            planName: plan.name,
            planId: plan.id,
            amount,
            billingPeriod,
            userId: user.id,
            userEmail: payerEmail,
            userName: profile?.full_name ?? 'Agente',
            externalReference,
        })


        // 8. Actualizar el payment con el preference_id de MP (service client)
        await serviceSupabase
            .from('payments')
            .update({ mp_preference_id: preference.preferenceId })
            .eq('mp_external_reference', externalReference)

        return NextResponse.json({
            preferenceId: preference.preferenceId,
            // El servidor decide qué URL usar según el token configurado
            // TEST- = sandbox,  APP- = producción
            checkoutUrl: process.env.MP_ACCESS_TOKEN?.startsWith('TEST-')
                ? preference.sandboxInitPoint
                : preference.initPoint,
            // También exponer ambas por si se necesitan
            initPoint: preference.initPoint,
            sandboxInitPoint: preference.sandboxInitPoint,
        })


    } catch (error: any) {
        console.error('Error en /api/checkout:', error)
        return NextResponse.json(
            { error: error.message ?? 'Error interno del servidor' },
            { status: 500 }
        )
    }
}
