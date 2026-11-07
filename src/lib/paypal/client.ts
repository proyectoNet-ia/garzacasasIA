/**
 * Cliente REST API v2 de PayPal
 * Implementación nativa para Next.js App Router (sin dependencias obsoletas)
 */

export interface CreateOrderInput {
    planName: string
    planId: string
    amount: number
    billingPeriod: 'monthly' | 'yearly'
    userId: string
    userEmail: string
    userName: string
    externalReference: string // UUID interno
}

export interface PayPalOrderResult {
    orderId: string
    approveUrl: string
    status: string
}

export interface PayPalCaptureResult {
    orderId: string
    captureId: string
    status: string
    payerEmail?: string
    payerId?: string
    amount: string
    currency: string
    externalReference?: string
}

const PAYPAL_ID_REGEX = /^[A-Z0-9_-]{8,64}$/i

export function isValidPayPalId(value: unknown): value is string {
    return typeof value === 'string' && PAYPAL_ID_REGEX.test(value.trim())
}

function getPayPalApiBaseUrl(): string {
    const mode = process.env.PAYPAL_MODE?.toLowerCase() || 'sandbox'
    return mode === 'live' || mode === 'production'
        ? 'https://api-m.paypal.com'
        : 'https://api-m.sandbox.paypal.com'
}

function getBaseAppUrl(): string {
    const raw = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'http://localhost:3000'
    return raw.trim().replace(/\/+$/, '')
}

/**
 * Obtiene un Access Token OAuth 2.0 de PayPal usando Client ID y Client Secret
 */
export async function getPayPalAccessToken(): Promise<string> {
    const clientId = process.env.PAYPAL_CLIENT_ID
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET

    if (!clientId || !clientSecret) {
        throw new Error(
            'PAYPAL_CLIENT_ID o PAYPAL_CLIENT_SECRET no están configurados en las variables de entorno.'
        )
    }

    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
    const response = await fetch(`${getPayPalApiBaseUrl()}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
        cache: 'no-store',
    })

    if (!response.ok) {
        const errorText = await response.text()
        console.error('[PayPal] Error obteniendo Access Token:', errorText)
        throw new Error(`Error de autenticación con PayPal: ${response.statusText}`)
    }

    const data = await response.json()
    return data.access_token
}

/**
 * Crea una orden de pago en PayPal con redirección a Checkout
 */
export async function createPayPalOrder(input: CreateOrderInput): Promise<PayPalOrderResult> {
    const token = await getPayPalAccessToken()
    const baseAppUrl = getBaseAppUrl()
    const formattedAmount = Number(input.amount).toFixed(2)

    const payload = {
        intent: 'CAPTURE',
        purchase_units: [
            {
                reference_id: input.externalReference,
                custom_id: input.userId,
                description: `Garza Casas IA - Plan ${input.planName} (${input.billingPeriod === 'yearly' ? 'Anual' : 'Mensual'})`,
                amount: {
                    currency_code: 'MXN',
                    value: formattedAmount,
                    breakdown: {
                        item_total: {
                            currency_code: 'MXN',
                            value: formattedAmount,
                        },
                    },
                },
                items: [
                    {
                        name: `Plan ${input.planName}`,
                        description: `Suscripción inmobiliaria ${input.billingPeriod === 'yearly' ? 'anual' : 'mensual'}`,
                        quantity: '1',
                        unit_amount: {
                            currency_code: 'MXN',
                            value: formattedAmount,
                        },
                        category: 'DIGITAL_GOODS',
                    },
                ],
            },
        ],
        payment_source: {
            paypal: {
                experience_context: {
                    payment_method_preference: 'IMMEDIATE_PAYMENT_REQUIRED',
                    brand_name: 'Garza Casas IA',
                    locale: 'es-MX',
                    landing_page: 'LOGIN',
                    shipping_preference: 'NO_SHIPPING',
                    user_action: 'PAY_NOW',
                    return_url: `${baseAppUrl}/dashboard/suscripcion/exito`,
                    cancel_url: `${baseAppUrl}/dashboard/suscripcion/error`,
                },
            },
        },
    }

    const response = await fetch(`${getPayPalApiBaseUrl()}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Prefer: 'return=representation',
        },
        body: JSON.stringify(payload),
        cache: 'no-store',
    })

    const data = await response.json()

    if (!response.ok) {
        console.error('[PayPal] Error creando orden:', data)
        const detailMessage = data.details?.[0]?.description || data.message || 'Error al crear la orden en PayPal'
        throw new Error(detailMessage)
    }

    // Buscar enlace de redirección de aprobación (payer-action o approve)
    const approveLink = data.links?.find(
        (link: { rel: string; href: string }) => link.rel === 'approve' || link.rel === 'payer-action'
    )?.href

    if (!approveLink) {
        throw new Error('PayPal no devolvió un enlace de aprobación para la orden.')
    }

    return {
        orderId: data.id,
        approveUrl: approveLink,
        status: data.status,
    }
}

/**
 * Captura el pago de una orden previamente aprobada por el comprador
 */
export async function capturePayPalOrder(orderId: string): Promise<PayPalCaptureResult> {
    if (!isValidPayPalId(orderId)) {
        throw new Error('Identificador de orden de PayPal inválido.')
    }

    const token = await getPayPalAccessToken()
    const safeOrderId = encodeURIComponent(orderId.trim())

    const response = await fetch(`${getPayPalApiBaseUrl()}/v2/checkout/orders/${safeOrderId}/capture`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Prefer: 'return=representation',
        },
        cache: 'no-store',
    })

    const data = await response.json()

    if (!response.ok) {
        console.error(`[PayPal] Error capturando orden ${orderId}:`, data)
        const detailMessage = data.details?.[0]?.description || data.message || 'Error al capturar la orden en PayPal'
        throw new Error(detailMessage)
    }

    const purchaseUnit = data.purchase_units?.[0]
    const capture = purchaseUnit?.payments?.captures?.[0]

    return {
        orderId: data.id,
        captureId: capture?.id || '',
        status: data.status, // e.g. 'COMPLETED'
        payerEmail: data.payer?.email_address,
        payerId: data.payer?.payer_id,
        amount: capture?.amount?.value || '',
        currency: capture?.amount?.currency_code || 'MXN',
        externalReference: purchaseUnit?.reference_id,
    }
}

/**
 * Obtiene los detalles de una orden en PayPal
 */
export async function getPayPalOrderDetails(orderId: string) {
    if (!isValidPayPalId(orderId)) {
        throw new Error('Identificador de orden de PayPal inválido.')
    }

    const token = await getPayPalAccessToken()
    const safeOrderId = encodeURIComponent(orderId.trim())

    const response = await fetch(`${getPayPalApiBaseUrl()}/v2/checkout/orders/${safeOrderId}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        cache: 'no-store',
    })

    if (!response.ok) {
        throw new Error(`Error obteniendo orden ${safeOrderId} desde PayPal: ${response.statusText}`)
    }

    return await response.json()
}

/**
 * Verifica criptográficamente la firma de un Webhook de PayPal contra la API v1 de Notificaciones
 */
export async function verifyPayPalWebhookSignature(
    headers: Headers,
    webhookEvent: Record<string, unknown>,
    webhookId: string
): Promise<boolean> {
    const transmissionId = headers.get('paypal-transmission-id')
    const transmissionTime = headers.get('paypal-transmission-time')
    const certUrl = headers.get('paypal-cert-url')
    const authAlgo = headers.get('paypal-auth-algo')
    const transmissionSig = headers.get('paypal-transmission-sig')

    if (!transmissionId || !transmissionTime || !certUrl || !authAlgo || !transmissionSig) {
        return false
    }

    const token = await getPayPalAccessToken()
    const response = await fetch(`${getPayPalApiBaseUrl()}/v1/notifications/verify-webhook-signature`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            auth_algo: authAlgo,
            cert_url: certUrl,
            transmission_id: transmissionId,
            transmission_sig: transmissionSig,
            transmission_time: transmissionTime,
            webhook_id: webhookId,
            webhook_event: webhookEvent,
        }),
        cache: 'no-store',
    })

    if (!response.ok) {
        console.error('[PayPal] Falló verificación de firma de webhook:', await response.text())
        return false
    }

    const data = await response.json()
    return data.verification_status === 'SUCCESS'
}
