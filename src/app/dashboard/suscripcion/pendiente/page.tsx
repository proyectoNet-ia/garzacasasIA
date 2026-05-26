'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Clock, Home, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

function PendienteContent() {
    const searchParams = useSearchParams()
    const paymentId = searchParams.get('payment_id')

    return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="bg-white rounded-3xl shadow-2xl shadow-yellow-500/10 border border-yellow-100 p-8 text-center">

                    {/* Icono */}
                    <div className="h-24 w-24 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-6 animate-pulse">
                        <Clock className="h-14 w-14 text-yellow-500" strokeWidth={1.5} />
                    </div>

                    <h1 className="text-3xl font-black text-zinc-800 mb-2">
                        Pago en proceso
                    </h1>
                    <p className="text-zinc-500 font-medium mb-6">
                        Tu pago está siendo procesado. Algunos métodos de pago (como OXXO) pueden tardar hasta 72 horas en confirmarse.
                    </p>

                    {paymentId && (
                        <div className="bg-zinc-50 rounded-2xl p-4 mb-6 text-sm text-left">
                            <div className="flex justify-between">
                                <span className="text-zinc-500 font-medium">ID de Pago</span>
                                <span className="text-zinc-700 font-bold font-mono text-xs">{paymentId}</span>
                            </div>
                        </div>
                    )}

                    <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-6 text-sm text-yellow-800 text-left">
                        <p className="font-semibold mb-1">¿Qué sigue?</p>
                        <p className="text-xs text-yellow-700">
                            Te notificaremos por email cuando el pago sea confirmado. Tu suscripción se activará automáticamente.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3">
                        <Button
                            asChild
                            className="w-full h-12 rounded-2xl font-black gap-2 bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/20"
                        >
                            <Link href="/dashboard">
                                <Home className="h-4 w-4" /> Ir al Dashboard
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function SuscripcionPendientePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        }>
            <PendienteContent />
        </Suspense>
    )
}
