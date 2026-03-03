import MercadoPagoConfig, { Preference, Payment } from 'mercadopago'

// ─── Cliente Singleton de Mercado Pago ───────────────────────────────────────
let mpClient: MercadoPagoConfig | null = null

export function getMpClient(): MercadoPagoConfig {
    if (!mpClient) {
        const accessToken = process.env.MP_ACCESS_TOKEN
        if (!accessToken) {
            throw new Error('MP_ACCESS_TOKEN no está configurado en las variables de entorno.')
        }
        mpClient = new MercadoPagoConfig({
            accessToken,
            options: { timeout: 5000 }
        })
    }
    return mpClient
}

// ─── Tipos ────────────────────────────────────────────────────────────────────
export interface CreatePreferenceInput {
    planName: string
    planId: string
    amount: number
    billingPeriod: 'monthly' | 'yearly'
    userId: string
    userEmail: string
    userName: string
    externalReference: string // UUID único por intento de pago
}

export interface PreferenceResult {
    preferenceId: string
    initPoint: string       // URL de checkout en producción
    sandboxInitPoint: string // URL de checkout en sandbox/test
}

// ─── Crear Preferencia de Pago ────────────────────────────────────────────────
export async function createPaymentPreference(
    input: CreatePreferenceInput
): Promise<PreferenceResult> {
    const client = getMpClient()
    const preference = new Preference(client)

    // Prioridad: APP_URL (server) → NEXT_PUBLIC_APP_URL → localhost
    const rawUrl = (
        process.env.APP_URL ||
        process.env.NEXT_PUBLIC_APP_URL ||
        'http://localhost:3000'
    )

    // Sanitizar: quitar espacios, trailing slash y cualquier char inválido al final
    // Esto protege contra variables de entorno mal copiadas (ej: "https://garzacasas.come")
    const baseUrl = rawUrl
        .trim()
        .replace(/\/+$/, '')                    // trailing slashes
        .replace(/[^a-zA-Z0-9\-._~:/?#@!$&'()*+,;=%]+$/, '') // chars inválidos al final

    console.log('[MP] baseUrl:', baseUrl) // Debug temporal

    const successUrl = `${baseUrl}/dashboard/suscripcion/exito`
    const failureUrl = `${baseUrl}/dashboard/suscripcion/error`
    const pendingUrl = `${baseUrl}/dashboard/suscripcion/pendiente`


    const response = await preference.create({
        body: {
            items: [
                {
                    id: input.planId,
                    title: `Garza Casas IA - Plan ${input.planName} (${input.billingPeriod === 'yearly' ? 'Anual' : 'Mensual'})`,
                    description: `Suscripción ${input.billingPeriod === 'yearly' ? 'anual' : 'mensual'} al plan ${input.planName} de Garza Casas IA`,
                    quantity: 1,
                    unit_price: input.amount,
                    currency_id: 'MXN',
                }
            ],
            payer: {
                email: input.userEmail,
                name: input.userName,
            },
            back_urls: {
                success: successUrl,
                failure: failureUrl,
                pending: pendingUrl,
            },
            // auto_return requiere URLs HTTPS públicas — solo en producción
            ...(baseUrl.startsWith('https://') ? { auto_return: 'approved' } : {}),
            external_reference: input.externalReference,
            notification_url: baseUrl.startsWith('https://')
                ? `${baseUrl}/api/webhooks/mercadopago`
                : undefined,   // MP no puede notificar a localhost
            metadata: {
                user_id: input.userId,
                plan_name: input.planName,
                plan_id: input.planId,
                billing_period: input.billingPeriod,
            },
            statement_descriptor: 'GARZA CASAS IA',
        }
    })

    return {
        preferenceId: response.id ?? '',
        initPoint: response.init_point ?? '',
        sandboxInitPoint: response.sandbox_init_point ?? '',
    }

}

// ─── Obtener información de un pago por ID ────────────────────────────────────
export async function getPaymentById(paymentId: string) {
    const client = getMpClient()
    const payment = new Payment(client)
    return await payment.get({ id: paymentId })
}
