'use client'

import { useState } from 'react'
import { Loader2, CreditCard, Lock, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface CheckoutButtonProps {
    planId: string
    planName: string
    amount: number
    billingPeriod: 'monthly' | 'yearly'
    isFree?: boolean
    isCurrentPlan?: boolean
    variant?: 'default' | 'popular'
}

export function CheckoutButton({
    planId,
    planName,
    amount,
    billingPeriod,
    isFree = false,
    isCurrentPlan = false,
    variant = 'default',
}: CheckoutButtonProps) {
    const [loading, setLoading] = useState(false)

    const baseStyles = variant === 'popular'
        ? 'w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs bg-blue-600 text-white shadow-xl shadow-blue-600/20 hover:bg-blue-500 hover:-translate-y-0.5 transition-all'
        : 'w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 transition-all'

    // Plan actual — solo mostrar badge
    if (isCurrentPlan) {
        return (
            <div className="w-full h-14 rounded-2xl flex items-center justify-center gap-2 bg-green-50 border border-green-200 text-green-700 font-black text-xs uppercase tracking-widest">
                <CheckCircle2 className="h-4 w-4" />
                Tu Plan Actual
            </div>
        )
    }

    // Plan gratuito — no requiere pago
    if (isFree) {
        return (
            <Button className={baseStyles} disabled>
                Plan Gratuito
            </Button>
        )
    }

    async function handleCheckout() {
        setLoading(true)
        try {
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planId, billingPeriod }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error ?? 'Error al iniciar el pago')
            }

            // El servidor ya decide si usar sandbox o producción
            const checkoutUrl = data.checkoutUrl

            if (!checkoutUrl) {
                throw new Error('No se pudo obtener la URL de pago')
            }

            toast.info(`Redirigiendo al checkout de ${planName}...`)
            window.location.href = checkoutUrl

        } catch (error: any) {
            console.error('Checkout error:', error)
            toast.error(error.message ?? 'Error al procesar el pago. Inténtalo de nuevo.')
            setLoading(false)
        }
    }

    return (
        <Button
            onClick={handleCheckout}
            disabled={loading}
            className={baseStyles}
        >
            {loading ? (
                <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Procesando...
                </>
            ) : (
                <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Suscribirme ahora
                </>
            )}
        </Button>
    )
}

// Indicator de seguridad para mostrar debajo del botón
export function SecurePaymentBadge() {
    return (
        <div className="flex items-center justify-center gap-1.5 text-[10px] text-zinc-400 mt-2">
            <Lock className="h-3 w-3" />
            <span>Pago seguro con Mercado Pago · SSL 256-bit</span>
        </div>
    )
}
