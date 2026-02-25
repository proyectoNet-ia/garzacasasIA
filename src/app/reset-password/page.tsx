'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Lock, Loader2, Building2, Eye, EyeOff, ShieldCheck, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

type PageState = 'loading' | 'ready' | 'invalid' | 'success'

export default function ResetPasswordPage() {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [pageState, setPageState] = useState<PageState>('loading')
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        // Supabase handles the session from the URL fragment (#access_token=...) automatically.
        // We listen to the PASSWORD_RECOVERY auth event which fires once the session is ready.
        // This prevents the race condition of checking session before it's established.
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'PASSWORD_RECOVERY') {
                // Session is now active via the recovery token — show the form
                setPageState('ready')
            } else if (event === 'SIGNED_IN' && session) {
                // Already have a session (e.g. navigating back to this page while logged in)
                setPageState('ready')
            }
        })

        // Fallback: if user arrives here with an active session (e.g. re-opening the page)
        // give it a short window before declaring invalid
        const timeout = setTimeout(async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (session) {
                setPageState('ready')
            } else {
                setPageState('invalid')
                toast.error('El enlace de recuperación ha expirado. Solicita uno nuevo.')
            }
        }, 2500)

        return () => {
            subscription.unsubscribe()
            clearTimeout(timeout)
        }
    }, [])

    // Strength indicator
    const getStrength = (pw: string) => {
        let score = 0
        if (pw.length >= 8) score++
        if (/[A-Z]/.test(pw)) score++
        if (/[0-9]/.test(pw)) score++
        if (/[^A-Za-z0-9]/.test(pw)) score++
        return score
    }
    const strength = getStrength(password)
    const strengthLabel = ['', 'Débil', 'Regular', 'Buena', 'Fuerte'][strength]
    const strengthColor = ['', 'bg-red-500', 'bg-amber-500', 'bg-blue-500', 'bg-green-500'][strength]

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault()

        if (password !== confirmPassword) {
            toast.error('Las contraseñas no coinciden')
            return
        }
        if (password.length < 8) {
            toast.error('La contraseña debe tener al menos 8 caracteres')
            return
        }

        setLoading(true)
        try {
            const { error } = await supabase.auth.updateUser({ password })
            if (error) throw error

            setPageState('success')
            toast.success('¡Contraseña actualizada! Redirigiendo...')
            setTimeout(() => router.push('/login'), 2500)
        } catch (error: any) {
            console.error('Password update error:', error)
            toast.error(error.message || 'Error al actualizar la contraseña')
        } finally {
            setLoading(false)
        }
    }

    // ── Loading state ────────────────────────────────────────────────────────
    if (pageState === 'loading') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-blue-950 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-zinc-400">
                    <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
                    <p className="text-sm font-medium">Verificando enlace de recuperación...</p>
                </div>
            </div>
        )
    }

    // ── Invalid / expired ────────────────────────────────────────────────────
    if (pageState === 'invalid') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-blue-950 flex items-center justify-center p-4">
                <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-xl shadow-2xl w-full max-w-md text-center p-8">
                    <div className="mb-4 flex justify-center">
                        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
                            <Lock className="h-8 w-8 text-red-400" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Enlace expirado</h2>
                    <p className="text-zinc-400 text-sm mb-6">
                        Este enlace de recuperación ya no es válido. Solicita uno nuevo desde la página de login.
                    </p>
                    <Button asChild className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold">
                        <Link href="/forgot-password">Solicitar nuevo enlace</Link>
                    </Button>
                </Card>
            </div>
        )
    }

    // ── Success ──────────────────────────────────────────────────────────────
    if (pageState === 'success') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-blue-950 flex items-center justify-center p-4">
                <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-xl shadow-2xl w-full max-w-md text-center p-8">
                    <div className="mb-4 flex justify-center">
                        <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center animate-in zoom-in">
                            <CheckCircle2 className="h-8 w-8 text-green-400" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">¡Contraseña actualizada!</h2>
                    <p className="text-zinc-400 text-sm">Redirigiendo al inicio de sesión...</p>
                </Card>
            </div>
        )
    }

    // ── Ready: show form ─────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-blue-950 flex items-center justify-center p-4">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 -left-48 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Brand */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-600/50">
                        <Building2 className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-black text-white mb-2">Garza Casas IA</h1>
                    <p className="text-zinc-400">Nueva Contraseña</p>
                </div>

                <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-xl shadow-2xl">
                    <CardHeader className="space-y-1">
                        <div className="flex items-center gap-2 text-green-400 text-xs font-bold uppercase tracking-widest mb-1">
                            <ShieldCheck className="h-4 w-4" />
                            Enlace verificado
                        </div>
                        <CardTitle className="text-2xl font-bold text-white">Establece tu nueva contraseña</CardTitle>
                        <CardDescription className="text-zinc-400">
                            Crea una contraseña segura de al menos 8 caracteres.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handlePasswordUpdate} className="space-y-5">
                            {/* New Password */}
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-zinc-300">Nueva Contraseña</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Mínimo 8 caracteres"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        disabled={loading}
                                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-blue-500 pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>

                                {/* Strength bar */}
                                {password.length > 0 && (
                                    <div className="space-y-1">
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4].map((i) => (
                                                <div
                                                    key={i}
                                                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength ? strengthColor : 'bg-zinc-700'}`}
                                                />
                                            ))}
                                        </div>
                                        <p className="text-xs text-zinc-400">
                                            Seguridad: <span className="font-bold text-white">{strengthLabel}</span>
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword" className="text-zinc-300">Confirmar Contraseña</Label>
                                <Input
                                    id="confirmPassword"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Repite tu contraseña"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    disabled={loading}
                                    className={`bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-blue-500 transition-colors ${confirmPassword && confirmPassword !== password ? 'border-red-500' : ''
                                        }`}
                                />
                                {confirmPassword && confirmPassword !== password && (
                                    <p className="text-xs text-red-400">Las contraseñas no coinciden</p>
                                )}
                            </div>

                            <Button
                                type="submit"
                                disabled={loading || (!!confirmPassword && confirmPassword !== password)}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 font-bold h-12 transition-all"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Actualizando...
                                    </>
                                ) : (
                                    <>
                                        <Lock className="mr-2 h-4 w-4" />
                                        Guardar Nueva Contraseña
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
