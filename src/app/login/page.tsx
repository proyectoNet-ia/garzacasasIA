'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LogIn, Loader2, AlertCircle, Building2 } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    // Redirect if already logged in - Security check & UX
    useEffect(() => {
        async function checkUser() {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single()

                if (profile?.role === 'admin') {
                    router.push('/admin')
                } else {
                    router.push('/dashboard')
                }
            }
        }
        checkUser()
    }, [supabase, router])

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            // Intentar login con Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (authError) throw authError

            if (!authData.user) {
                throw new Error('No se pudo autenticar el usuario')
            }

            // Verificar el rol del usuario en la tabla profiles
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('role, full_name')
                .eq('id', authData.user.id)
                .single()

            if (profileError) {
                console.error('Error fetching profile:', profileError)
                throw new Error('No se pudo obtener el perfil del usuario')
            }

            // Mostrar mensaje de bienvenida
            toast.success(`¡Bienvenido, ${profile?.full_name || 'Usuario'}!`)

            // Redirigir según el rol
            if (profile?.role === 'admin') {
                router.push('/admin')
            } else {
                router.push('/dashboard')
            }

            // Forzar refresh para que el middleware detecte la sesión
            router.refresh()

        } catch (error: any) {
            console.error('Login error:', error)

            // Mensajes de error más amigables
            if (error.message.includes('Invalid login credentials')) {
                toast.error('Email o contraseña incorrectos')
            } else if (error.message.includes('Email not confirmed')) {
                toast.error('Por favor confirma tu email antes de iniciar sesión')
            } else {
                toast.error(error.message || 'Error al iniciar sesión')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-blue-950 flex items-center justify-center p-4">
            {/* Decorative Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 -left-48 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Logo/Brand */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-600/50">
                        <Building2 className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-black text-white mb-2">Garza Casas IA</h1>
                    <p className="text-zinc-400">Panel de Administración</p>
                </div>

                {/* Login Card */}
                <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-xl shadow-2xl">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold text-white">Iniciar Sesión</CardTitle>
                        <CardDescription className="text-zinc-400">
                            Ingresa tus credenciales para acceder al dashboard
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-zinc-300">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="admin@garzacasas.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={loading}
                                    className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-zinc-300">Contraseña</Label>
                                    <Link
                                        href="/forgot-password"
                                        className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                                    >
                                        ¿Olvidaste tu contraseña?
                                    </Link>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={loading}
                                    className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 transition-all hover:shadow-blue-600/40"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Iniciando sesión...
                                    </>
                                ) : (
                                    <>
                                        <LogIn className="mr-2 h-4 w-4" />
                                        Iniciar Sesión
                                    </>
                                )}
                            </Button>
                        </form>

                        {/* Info Box */}
                        <div className="mt-6 p-4 bg-blue-950/30 border border-blue-900/50 rounded-lg">
                            <div className="flex gap-3">
                                <AlertCircle className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-zinc-400">
                                    <p className="font-semibold text-blue-400 mb-1">Acceso Restringido</p>
                                    <p>Solo usuarios autorizados pueden acceder al panel de administración.</p>
                                </div>
                            </div>
                        </div>

                        {/* Back to Home */}
                        <div className="mt-6 text-center">
                            <Link
                                href="/"
                                className="text-sm text-zinc-400 hover:text-white transition-colors"
                            >
                                ← Volver al inicio
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                {/* Footer */}
                <p className="text-center text-zinc-500 text-sm mt-8">
                    © 2026 Garza Casas IA. Todos los derechos reservados.
                </p>
            </div>
        </div>
    )
}
