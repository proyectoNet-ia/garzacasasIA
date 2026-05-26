'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { XCircle, RefreshCw, Home, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

function ErrorContent() {
    const searchParams = useSearchParams()
    const reason = searchParams.get('reason')

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="bg-white rounded-3xl shadow-2xl shadow-red-500/10 border border-red-100 p-8 text-center">

                    {/* Icono */}
                    <div className="h-24 w-24 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
                        <XCircle className="h-14 w-14 text-red-400" strokeWidth={1.5} />
                    </div>

                    <h1 className="text-3xl font-black text-zinc-800 mb-2">
                        Pago no procesado
                    </h1>
                    <p className="text-zinc-500 font-medium mb-6">
                        El pago no pudo completarse. No se realizó ningún cargo a tu cuenta.
                        {reason && (
                            <span className="block mt-2 text-sm text-red-400">
                                Motivo: {reason}
                            </span>
                        )}
                    </p>

                    <div className="bg-zinc-50 rounded-2xl p-4 mb-6 text-sm text-zinc-600 text-left">
                        <p className="font-semibold mb-2 text-zinc-700">Posibles causas:</p>
                        <ul className="space-y-1 text-xs list-disc list-inside text-zinc-500">
                            <li>Tarjeta rechazada o fondos insuficientes</li>
                            <li>El pago fue cancelado manualmente</li>
                            <li>Error de conexión con el banco</li>
                            <li>Datos de pago incorrectos</li>
                        </ul>
                    </div>

                    <div className="flex flex-col gap-3">
                        <Button
                            asChild
                            className="w-full h-12 rounded-2xl font-black gap-2 bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/20"
                        >
                            <Link href="/dashboard/suscripcion">
                                <RefreshCw className="h-4 w-4" /> Intentar de nuevo
                            </Link>
                        </Button>
                        <Button
                            asChild
                            variant="ghost"
                            className="w-full h-10 rounded-2xl text-zinc-500 gap-2"
                        >
                            <Link href="/dashboard">
                                <Home className="h-4 w-4" /> Volver al Dashboard
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function SuscripcionErrorPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        }>
            <ErrorContent />
        </Suspense>
    )
}
