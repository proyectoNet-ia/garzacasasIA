'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Building2, Loader2, User, Mail, Phone, Lock, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { formatPhone } from '@/hooks/usePhoneFormat'

const PLAN_FEATURES = [
    'Hasta 5 propiedades activas',
    'Dashboard con métricas básicas',
    'Perfil público de agente',
    'Leads directos de compradores',
    'Soporte por email',
]

export default function RegistroPage() {
    const [step, setStep] = useState<1 | 2>(1)
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const [form, setForm] = useState({
        full_name: '',
        email: '',
        phone: '',
        password: '',
        confirm_password: '',
    })

    const update = (field: string, value: string) =>
        setForm(prev => ({ ...prev, [field]: value }))

    const handleNextStep = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.full_name || !form.email || !form.phone) {
            toast.error('Por favor completa todos los campos')
            return
        }

        setLoading(true)
        try {
            // Verificar si el email o teléfono ya existen
            const { data: existing, error } = await supabase
                .from('profiles')
                .select('email, phone')
                .or(`email.eq.${form.email},phone.eq.${form.phone}`)
                .maybeSingle()

            if (existing) {
                if (existing.email === form.email) {
                    toast.error('Este email ya está registrado')
                } else if (existing.phone === form.phone) {
                    toast.error('Este número de teléfono ya está registrado')
                }
                return
            }

            setStep(2)
        } catch (error) {
            console.error('Validation error:', error)
            // Si hay error de red, permitimos pasar y que Auth maneje la validación final
            setStep(2)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (form.password !== form.confirm_password) {
            toast.error('Las contraseñas no coinciden')
            return
        }
        if (form.password.length < 8) {
            toast.error('La contraseña debe tener mínimo 8 caracteres')
            return
        }

        setLoading(true)
        try {
            // 1. Create Auth user
            // Get the current site URL for the email redirect
            const siteUrl = window.location.origin

            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: form.email,
                password: form.password,
                options: {
                    emailRedirectTo: `${siteUrl}/auth/callback`,
                    data: {
                        full_name: form.full_name,
                        phone: form.phone,
                    }
                }
            })

            if (authError) throw authError
            if (!authData.user) throw new Error('No se pudo crear el usuario')

            // 2. Upsert profile with agent role and plan info
            const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                    id: authData.user.id,
                    full_name: form.full_name,
                    phone: form.phone,
                    whatsapp: form.phone,
                    role: 'agent',
                    updated_at: new Date().toISOString(),
                })

            if (profileError) {
                console.error('Profile error:', profileError)
                // Non-fatal — user was created, profile can be completed later
            }

            toast.success('¡Cuenta creada! Revisa tu correo para verificarla.')
            router.push(`/verifica-correo?email=${encodeURIComponent(form.email)}`)

        } catch (error: any) {
            console.error('Signup error:', error)
            if (error.message?.includes('already registered') || error.message?.includes('User already registered')) {
                toast.error('Este email ya está registrado. ¿Quieres iniciar sesión?')
            } else {
                toast.error(error.message || 'Error al crear la cuenta')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-indigo-600/5 rounded-full blur-[80px]" />
            </div>

            <div className="relative z-10 w-full max-w-5xl">
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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-hidden rounded-[2.5rem] border border-white/10 shadow-2xl">
                    {/* LEFT: Plan Info */}
                    <div className="bg-zinc-900 p-10 lg:p-14 flex flex-col justify-between gap-10 border-r border-white/5">
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-2 rounded-full bg-blue-600/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-blue-400 border border-blue-600/20">
                                <Sparkles className="h-3 w-3" />
                                Plan Gratuito
                            </div>
                            <div>
                                <div className="flex items-end gap-2 mb-2">
                                    <span className="text-6xl font-black text-white">$0</span>
                                    <span className="text-zinc-500 font-bold mb-3">/mes</span>
                                </div>
                                <p className="text-zinc-400 text-sm leading-relaxed">
                                    Comienza sin costo y crece con las herramientas más avanzadas del mercado inmobiliario.
                                </p>
                            </div>
                            <ul className="space-y-4">
                                {PLAN_FEATURES.map((feature, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm text-zinc-300 font-medium">
                                        <CheckCircle2 className="h-4 w-4 text-blue-500 shrink-0" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <p className="text-xs text-zinc-600 font-medium">
                            Sin tarjeta de crédito • Sin compromisos • Cancela cuando quieras
                        </p>
                    </div>

                    {/* RIGHT: Registration Form */}
                    <div className="bg-zinc-950 p-10 lg:p-14 flex flex-col justify-center">
                        {/* Step indicator */}
                        <div className="flex items-center gap-3 mb-8">
                            {[1, 2].map(s => (
                                <div key={s} className="flex items-center gap-2">
                                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300 ${step >= s
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-white/5 text-zinc-600 border border-white/10'
                                        }`}>
                                        {s}
                                    </div>
                                    {s === 1 && <div className={`h-px w-10 transition-all duration-500 ${step === 2 ? 'bg-blue-600' : 'bg-white/10'}`} />}
                                </div>
                            ))}
                            <span className="text-xs text-zinc-500 font-bold uppercase tracking-widest ml-2">
                                {step === 1 ? 'Datos personales' : 'Configura tu acceso'}
                            </span>
                        </div>

                        <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">
                            {step === 1 ? 'Crea tu cuenta' : 'Elige tu contraseña'}
                        </h1>
                        <p className="text-zinc-500 text-sm mb-8">
                            {step === 1 ? 'Solo toma 2 minutos.' : 'Casi listo. Elige una contraseña segura.'}
                        </p>

                        {step === 1 ? (
                            <form onSubmit={handleNextStep} className="space-y-5">
                                <div className="space-y-2">
                                    <Label className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Nombre completo</Label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                        <Input
                                            value={form.full_name}
                                            onChange={e => update('full_name', e.target.value)}
                                            placeholder="Ej. Carlos Garza"
                                            required
                                            className="h-13 pl-10 bg-white/5 border-white/10 text-white placeholder:text-zinc-400 focus:border-blue-500 rounded-xl"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                        <Input
                                            type="email"
                                            value={form.email}
                                            onChange={e => update('email', e.target.value)}
                                            placeholder="tu@email.com"
                                            required
                                            className="h-13 pl-10 bg-white/5 border-white/10 text-white placeholder:text-zinc-400 focus:border-blue-500 rounded-xl"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Teléfono</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                        <Input
                                            type="tel"
                                            value={form.phone}
                                            onChange={e => update('phone', formatPhone(e.target.value))}
                                            placeholder="(812) 000-0000"
                                            required
                                            maxLength={14}
                                            className="h-13 pl-10 bg-white/5 border-white/10 text-white placeholder:text-zinc-400 focus:border-blue-500 rounded-xl"
                                        />
                                    </div>
                                </div>
                                <Button type="submit" className="w-full h-13 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-xs mt-2 group">
                                    Continuar
                                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </form>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-2">
                                    <Label className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Contraseña</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                        <Input
                                            type="password"
                                            value={form.password}
                                            onChange={e => update('password', e.target.value)}
                                            placeholder="Mínimo 8 caracteres"
                                            required
                                            minLength={8}
                                            className="h-13 pl-10 bg-white/5 border-white/10 text-white placeholder:text-zinc-400 focus:border-blue-500 rounded-xl"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Confirmar contraseña</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                        <Input
                                            type="password"
                                            value={form.confirm_password}
                                            onChange={e => update('confirm_password', e.target.value)}
                                            placeholder="Repite tu contraseña"
                                            required
                                            className="h-13 pl-10 bg-white/5 border-white/10 text-white placeholder:text-zinc-400 focus:border-blue-500 rounded-xl"
                                        />
                                    </div>
                                </div>

                                {/* Password strength indicator */}
                                <div className="flex gap-1.5 h-1.5">
                                    {[...Array(4)].map((_, i) => (
                                        <div key={i} className={`flex-1 rounded-full transition-all duration-300 ${form.password.length > i * 3
                                            ? i < 2 ? 'bg-red-500' : i < 3 ? 'bg-orange-500' : 'bg-green-500'
                                            : 'bg-white/10'
                                            }`} />
                                    ))}
                                </div>
                                <p className="text-xs text-zinc-600">
                                    {form.password.length === 0 ? 'Ingresa una contraseña' :
                                        form.password.length < 6 ? 'Muy corta' :
                                            form.password.length < 10 ? 'Aceptable' :
                                                form.password.length < 14 ? 'Buena' : 'Excelente'}
                                </p>

                                <div className="flex gap-3 mt-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setStep(1)}
                                        className="flex-1 h-13 rounded-xl border-white/10 text-zinc-400 hover:text-white hover:bg-white/5 font-black uppercase tracking-widest text-xs"
                                    >
                                        Atrás
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-[2] h-13 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-xs group"
                                    >
                                        {loading ? (
                                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creando cuenta...</>
                                        ) : (
                                            <>Crear cuenta gratis <ArrowRight className="ml-2 h-4 w-4" /></>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        )}

                        <p className="text-center text-zinc-600 text-xs mt-8">
                            ¿Ya tienes cuenta?{' '}
                            <Link href="/login" className="text-blue-500 hover:text-blue-400 font-bold transition-colors">
                                Inicia sesión
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
