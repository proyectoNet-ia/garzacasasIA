'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle2, ArrowRight, Home, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

function ExitoContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [countdown, setCountdown] = useState(8)
    const [capturing, setCapturing] = useState(false)
    const [captureError, setCaptureError] = useState<string | null>(null)
    const [confirmedPlan, setConfirmedPlan] = useState<string | null>(null)

    // PayPal devuelve 'token' como el Order ID y opcionalmente 'PayerID'
    const orderId = searchParams.get('token') || searchParams.get('order_id')
    const paymentId = orderId || searchParams.get('payment_id')
    const externalReference = searchParams.get('external_reference')
    const status = searchParams.get('status')

    // Captura automática de la orden de PayPal al retornar
    useEffect(() => {
        async function completeCapture() {
            if (!orderId) return

            setCapturing(true)
            setCaptureError(null)

            try {
                const res = await fetch('/api/checkout/capture', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ orderId }),
                })

                const data = await res.json()

                if (!res.ok || !data.success) {
                    throw new Error(data.error || data.message || 'Error al capturar la orden en PayPal')
                }

                if (data.planName) {
                    setConfirmedPlan(data.planName)
                }
            } catch (err: any) {
                console.error('[Exito] Error capturando orden:', err)
                setCaptureError(err.message || 'Error confirmando el pago.')
            } finally {
                setCapturing(false)
            }
        }

        completeCapture()
    }, [orderId])

    // Cuenta regresiva para redirección al dashboard (solo si no está capturando ni con error)
    useEffect(() => {
        if (capturing || captureError) return

        const timer = setInterval(() => {
            setCountdown((c) => {
                if (c <= 1) {
                    clearInterval(timer)
                    window.location.href = '/dashboard'
                    return 0
                }
                return c - 1
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [capturing, captureError])

    // Estado de carga mientras se confirma con PayPal
    if (capturing) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-zinc-100 p-8 text-center space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
                    <h2 className="text-2xl font-black text-zinc-800">Confirmando con PayPal...</h2>
                    <p className="text-zinc-500 text-sm">
                        Estamos validando tu pago y activando los beneficios de tu cuenta. Solo tomará unos segundos.
                    </p>
                </div>
            </div>
        )
    }

    // Estado si ocurrió algún error en la captura
    if (captureError) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-zinc-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-red-100 p-8 text-center">
                    <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-5 text-red-600">
                        <AlertCircle className="h-10 w-10" />
                    </div>
                    <h1 className="text-2xl font-black text-zinc-900 mb-2">Atención con tu pago</h1>
                    <p className="text-zinc-500 text-sm mb-6 leading-relaxed">
                        {captureError}
                    </p>
                    <div className="flex flex-col gap-3">
                        <Button
                            asChild
                            className="w-full h-12 rounded-2xl font-bold bg-blue-600 hover:bg-blue-500"
                        >
                            <Link href="/dashboard/suscripcion">
                                Volver a suscripción
                            </Link>
                        </Button>
                        <Button
                            asChild
                            variant="ghost"
                            className="w-full h-10 rounded-2xl text-zinc-500"
                        >
                            <Link href="/dashboard">
                                Ir al Dashboard
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Card */}
                <div className="bg-white rounded-3xl shadow-2xl shadow-green-500/10 border border-green-100 p-8 text-center">

                    {/* Icono animado */}
                    <div className="relative inline-flex mb-6">
                        <div className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center mx-auto animate-pulse-slow">
                            <CheckCircle2 className="h-14 w-14 text-green-500" strokeWidth={1.5} />
                        </div>
                        <div className="absolute inset-0 rounded-full bg-green-300/20 animate-ping" />
                    </div>

                    <h1 className="text-3xl font-black text-zinc-800 mb-2">
                        ¡Pago exitoso!
                    </h1>
                    <p className="text-zinc-500 font-medium mb-6">
                        {confirmedPlan
                            ? `Tu suscripción al Plan ${confirmedPlan} ha sido activada con éxito.`
                            : 'Tu suscripción ha sido activada. Ya puedes disfrutar de todos los beneficios de tu nuevo plan.'}
                    </p>

                    {/* Detalles del pago */}
                    {paymentId && (
                        <div className="bg-zinc-50 rounded-2xl p-4 mb-6 text-left space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-zinc-500 font-medium">ID de Orden PayPal</span>
                                <span className="text-zinc-700 font-bold font-mono text-xs">{paymentId}</span>
                            </div>
                            {externalReference && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-500 font-medium">Referencia</span>
                                    <span className="text-zinc-700 font-mono text-xs truncate max-w-[160px]">{externalReference}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-sm">
                                <span className="text-zinc-500 font-medium">Estado</span>
                                <span className="text-green-600 font-bold capitalize">{status ?? 'approved'}</span>
                            </div>
                        </div>
                    )}

                    {/* Countdown */}
                    <p className="text-sm text-zinc-400 mb-4">
                        Redirigiendo al dashboard en <span className="font-bold text-blue-600">{countdown}s</span>...
                    </p>

                    <div className="flex flex-col gap-3">
                        <Button
                            asChild
                            className="w-full h-12 rounded-2xl font-black gap-2 bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/20"
                        >
                            <Link href="/dashboard">
                                Ir al Dashboard <ArrowRight className="h-4 w-4" />
                            </Link>
                        </Button>
                        <Button
                            asChild
                            variant="ghost"
                            className="w-full h-10 rounded-2xl text-zinc-500 gap-2"
                        >
                            <Link href="/">
                                <Home className="h-4 w-4" /> Inicio
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function SuscripcionExitoPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        }>
            <ExitoContent />
        </Suspense>
    )
}
