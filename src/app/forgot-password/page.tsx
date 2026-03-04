'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail, Loader2, Building2, CheckCircle2, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const supabase = createClient()

    const handleResetRequest = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
            })

            if (error) throw error

            setSubmitted(true)
            toast.success('Enlace de recuperación enviado')
        } catch (error: any) {
            console.error('Reset request error:', error)
            toast.error(error.message || 'Error al enviar el enlace de recuperación')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-blue-600/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-indigo-600/5 rounded-full blur-[80px]" />
            </div>

            <div className="relative z-10 w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-10">
                    <Link href="/" className="inline-flex items-center gap-3">
                        <div className="h-12 w-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/30">
                            <Building2 className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-2xl font-black text-white tracking-tighter">
                            GARZA CASAS <span className="text-blue-500">IA</span>
                        </span>
                    </Link>
                </div>

                {submitted ? (
                    /* ── Éxito ── */
                    <div className="bg-zinc-900 border border-white/10 rounded-[2rem] p-10 shadow-2xl text-center space-y-6">
                        <div className="flex justify-center">
                            <div className="h-20 w-20 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                                <CheckCircle2 className="h-10 w-10 text-green-400" />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-white">¡Correo enviado!</h1>
                            <p className="text-zinc-400 text-sm mt-2 leading-relaxed">
                                Enviamos un enlace de recuperación a{' '}
                                <span className="text-blue-400 font-bold">{email}</span>.
                                Revisa tu bandeja de entrada y carpeta de spam.
                            </p>
                        </div>
                        <Button
                            asChild
                            className="w-full h-12 rounded-xl border-white/10 bg-white/5 text-white hover:bg-white/10 font-bold"
                            variant="outline"
                        >
                            <Link href="/login">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Volver al inicio de sesión
                            </Link>
                        </Button>
                    </div>
                ) : (
                    /* ── Formulario ── */
                    <div className="bg-zinc-900 border border-white/10 rounded-[2rem] p-10 shadow-2xl space-y-6">
                        <div>
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-zinc-300 uppercase tracking-widest transition-colors mb-6"
                            >
                                <ArrowLeft className="h-3 w-3" />
                                Volver al login
                            </Link>
                            <h1 className="text-3xl font-black text-white uppercase tracking-tighter">
                                ¿Olvidaste tu contraseña?
                            </h1>
                            <p className="text-zinc-500 text-sm mt-1">
                                Ingresa tu email y te enviaremos un enlace para restablecer tu acceso.
                            </p>
                        </div>

                        <form onSubmit={handleResetRequest} className="space-y-5">
                            <div className="space-y-2">
                                <Label className="text-zinc-400 text-xs font-bold uppercase tracking-wider">
                                    Correo Electrónico
                                </Label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="tu@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        disabled={loading}
                                        className="h-13 pl-10 bg-white/5 border-white/10 text-white placeholder:text-zinc-600 focus:border-blue-500 rounded-xl"
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-13 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-xs shadow-lg shadow-blue-600/20 transition-all"
                            >
                                {loading ? (
                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando...</>
                                ) : (
                                    <><Mail className="mr-2 h-4 w-4" /> Enviar enlace de recuperación</>
                                )}
                            </Button>
                        </form>
                    </div>
                )}

                <p className="text-center text-zinc-700 text-xs mt-6">
                    © 2026 Garza Casas IA · <Link href="/" className="hover:text-zinc-500 transition-colors">Volver al inicio</Link>
                </p>
            </div>
        </div>
    )
}
