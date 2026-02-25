import Link from 'next/link'
import { Building2, Mail, ArrowRight, RefreshCw } from 'lucide-react'

export default function VerificaCorreoPage({
    searchParams,
}: {
    searchParams: { email?: string }
}) {
    const email = searchParams.email || 'tu correo'

    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 w-full max-w-md text-center space-y-8">
                {/* Logo */}
                <Link href="/" className="inline-flex items-center gap-3 justify-center">
                    <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30">
                        <Building2 className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xl font-black text-white tracking-tighter">
                        GARZA CASAS <span className="text-blue-500">IA</span>
                    </span>
                </Link>

                {/* Card */}
                <div className="bg-zinc-900 border border-white/10 rounded-[2rem] p-10 space-y-6 shadow-2xl">
                    {/* Animated Email Icon */}
                    <div className="flex justify-center">
                        <div className="relative h-24 w-24">
                            <div className="absolute inset-0 bg-blue-600/20 rounded-full animate-ping" />
                            <div className="relative h-24 w-24 rounded-full bg-blue-600/10 border border-blue-600/30 flex items-center justify-center">
                                <Mail className="h-10 w-10 text-blue-400" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h1 className="text-3xl font-black text-white uppercase tracking-tighter">
                            Revisa tu correo
                        </h1>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                            Enviamos un enlace de verificación a <br />
                            <span className="text-blue-400 font-bold">{email}</span>
                        </p>
                        <p className="text-zinc-600 text-xs leading-relaxed">
                            Haz clic en el enlace del correo para activar tu cuenta y acceder al dashboard.
                        </p>
                    </div>

                    {/* Steps */}
                    <div className="text-left space-y-3 bg-white/5 rounded-2xl p-5">
                        {[
                            'Abre tu bandeja de entrada',
                            'Busca el correo de Garza Casas IA',
                            'Haz clic en "Confirmar cuenta"',
                        ].map((step, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="h-6 w-6 rounded-full bg-blue-600/20 border border-blue-600/30 flex items-center justify-center text-[10px] font-black text-blue-400 shrink-0">
                                    {i + 1}
                                </div>
                                <p className="text-sm text-zinc-300 font-medium">{step}</p>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-3 pt-2">
                        <p className="text-xs text-zinc-600">¿No recibiste el correo? Revisa tu carpeta de spam.</p>
                        <Link
                            href="/registro"
                            className="inline-flex items-center gap-2 text-xs font-bold text-blue-500 hover:text-blue-400 transition-colors"
                        >
                            <RefreshCw className="h-3 w-3" />
                            Intentar de nuevo con otro email
                        </Link>
                    </div>
                </div>

                <Link href="/" className="inline-flex items-center gap-2 text-xs text-zinc-600 hover:text-zinc-400 transition-colors font-medium">
                    ← Volver al inicio
                </Link>
            </div>
        </div>
    )
}
