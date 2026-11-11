'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LogIn, Loader2, Building2, Lock, Mail, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { BrandLogo } from '@/components/brand/BrandLogo'
import { Suspense } from 'react'

function LoginForm() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const searchParams = useSearchParams()
    const supabase = createClient()

    // Leer el parámetro ?next= para redirigir después del login
    const nextPath = searchParams.get('next') || '/dashboard'
    // Leer mensaje de error del callback (link expirado, etc.)
    const errorParam = searchParams.get('error')
    const errorDescription = searchParams.get('description')

    useEffect(() => {
        if (errorParam === 'link-expirado') {
            toast.error('El enlace de verificación expiró. Por favor inicia sesión.')
        } else if (errorParam) {
            toast.error(errorDescription || 'Ocurrió un error al verificar tu cuenta')
        }
    }, [errorParam, errorDescription])

    // Redirect si ya está loggeado
    useEffect(() => {
        let isMounted = true
        async function checkUser() {
            const { data: { user } } = await supabase.auth.getUser()
            if (user && isMounted) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .maybeSingle()

                const target = searchParams.get('next')
                    || (profile?.role === 'admin' ? '/admin' : '/dashboard')

                window.location.assign(target)
            }
        }
        checkUser()
        return () => {
            isMounted = false
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email: email.trim().toLowerCase(),
                password,
            })

            if (authError) throw authError
            if (!authData.user) throw new Error('No se pudo autenticar el usuario')

            // Obtener perfil para mensaje de bienvenida y rol
            const { data: profile } = await supabase
                .from('profiles')
                .select('full_name, role')
                .eq('id', authData.user.id)
                .maybeSingle()

            toast.success(`¡Bienvenido${profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}!`)

            // Destino inteligente:
            // 1) Si viene parámetro ?next=... se respeta (ej. /admin/cms)
            // 2) Si es admin sin next explícito -> /admin
            // 3) Si es agente / usuario regular -> /dashboard
            const nextParam = searchParams.get('next')
            const destination = nextParam || (profile?.role === 'admin' ? '/admin' : '/dashboard')

            // Usar window.location.assign para garantizar que las cookies de sesión
            // de Supabase Auth se sincronicen de inmediato con el servidor Next.js
            // y el middleware no rebote de regreso al login.
            window.location.assign(destination)
            // Mantener loading=true activo mientras el navegador transiciona
            return

        } catch (error: any) {
            console.error('Login error:', error)
            if (error.message?.includes('Invalid login credentials')) {
                toast.error('Email o contraseña incorrectos')
            } else if (error.message?.includes('Email not confirmed')) {
                toast.error('Confirma tu email antes de iniciar sesión')
            } else {
                toast.error(error.message || 'Error al iniciar sesión')
            }
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
                        <BrandLogo
                            initialSurface="dark"
                            imgClassName="h-14 max-w-[260px]"
                            fallback={
                                <>
                                <div className="h-12 w-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/30">
                                    <Building2 className="h-6 w-6 text-white" />
                                </div>
                                <span className="text-2xl font-black text-white tracking-tighter">
                                    GARZA CASAS <span className="text-blue-500">IA</span>
                                </span>
                                </>
                            }
                        />
                    </Link>
                </div>

                {/* Card */}
                <div className="bg-zinc-900 border border-white/10 rounded-[2rem] p-10 shadow-2xl space-y-6">
                    <div>
                        <h1 className="text-3xl font-black text-white uppercase tracking-tighter">
                            Inicia sesión
                        </h1>
                        <p className="text-zinc-500 text-sm mt-1">
                            Accede a tu panel de agente.
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
                        {/* Email */}
                        <div className="space-y-2">
                            <Label className="text-zinc-400 text-xs font-bold uppercase tracking-wider">
                                Email
                            </Label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    placeholder="tu@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={loading}
                                    className="auth-dark-input h-13 pl-10 bg-white/5 border-white/10 text-white placeholder:text-zinc-500 focus:border-blue-500 rounded-xl"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-zinc-400 text-xs font-bold uppercase tracking-wider">
                                    Contraseña
                                </Label>
                                <Link
                                    href="/forgot-password"
                                    className="text-xs text-blue-500 hover:text-blue-400 font-bold transition-colors"
                                >
                                    ¿Olvidaste tu contraseña?
                                </Link>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={loading}
                                    className="auth-dark-input h-13 pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder:text-zinc-500 focus:border-blue-500 rounded-xl"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-13 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-xs group transition-all shadow-lg shadow-blue-600/20"
                        >
                            {loading ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verificando...</>
                            ) : (
                                <>
                                    <LogIn className="mr-2 h-4 w-4" />
                                    Entrar
                                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/5" />
                        </div>
                        <div className="relative flex justify-center">
                            <span className="bg-zinc-900 px-3 text-xs text-zinc-400">¿No tienes cuenta?</span>
                        </div>
                    </div>

                    <Button
                        asChild
                        variant="outline"
                        className="w-full h-12 rounded-xl border-white/15 bg-white/5 text-white hover:bg-white/10 hover:border-white/25 hover:text-white font-bold text-sm transition-all"
                    >
                        <Link href="/registro">
                            Crear cuenta gratis
                        </Link>
                    </Button>
                </div>

                <p className="text-center text-zinc-500 text-xs mt-6">
                    © 2026 Garza Casas · <Link href="/" className="text-zinc-400 hover:text-white transition-colors">Volver al inicio</Link>
                </p>
            </div>
        </div>
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        }>
            <LoginForm />
        </Suspense>
    )
}
