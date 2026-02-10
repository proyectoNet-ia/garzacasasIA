'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, Loader2, ArrowLeft, Building2, CheckCircle2 } from 'lucide-react'
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
                redirectTo: `${window.location.origin}/reset-password`,
            })

            if (error) throw error

            setSubmitted(true)
            toast.success('Enlace de recuperación enviado al correo')
        } catch (error: any) {
            console.error('Reset request error:', error)
            toast.error(error.message || 'Error al enviar el enlace de recuperación')
        } finally {
            setLoading(false)
        }
    }

    if (submitted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-blue-950 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-xl shadow-2xl text-center p-6">
                        <CardHeader>
                            <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                                <CheckCircle2 className="h-8 w-8 text-green-500" />
                            </div>
                            <CardTitle className="text-2xl font-bold text-white">¡Correo Enviado!</CardTitle>
                            <CardDescription className="text-zinc-400">
                                Hemos enviado un enlace de recuperación a <strong>{email}</strong>.
                                Por favor revisa tu bandeja de entrada y sigue las instrucciones.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-zinc-500">
                                Si no encuentras el correo, revisa tu carpeta de spam.
                            </p>
                            <Button asChild variant="outline" className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                                <Link href="/login">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Volver al inicio de sesión
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-blue-950 flex items-center justify-center p-4">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 -left-48 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-600/50">
                        <Building2 className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-black text-white mb-2">Garza Casas IA</h1>
                    <p className="text-zinc-400">Recuperar Contraseña</p>
                </div>

                <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-xl shadow-2xl">
                    <CardHeader className="space-y-1">
                        <div className="flex items-center gap-2 mb-2">
                            <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white">
                                <Link href="/login">
                                    <ArrowLeft className="h-4 w-4" />
                                </Link>
                            </Button>
                            <span className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Seguridad</span>
                        </div>
                        <CardTitle className="text-2xl font-bold text-white">¿Olvidaste tu contraseña?</CardTitle>
                        <CardDescription className="text-zinc-400">
                            Ingresa tu email y te enviaremos un enlace para restablecer tu acceso.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleResetRequest} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-zinc-300">Correo Electrónico</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="tu@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={loading}
                                    className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 transition-all"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Enviando enlace...
                                    </>
                                ) : (
                                    <>
                                        <Mail className="mr-2 h-4 w-4" />
                                        Enviar enlace de recuperación
                                    </>
                                )}
                            </Button>
                        </form>

                        <div className="mt-6 text-center">
                            <Link
                                href="/login"
                                className="text-sm text-zinc-400 hover:text-white transition-colors"
                            >
                                Recordé mi contraseña, volver al login
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
