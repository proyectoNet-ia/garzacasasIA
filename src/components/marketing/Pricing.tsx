import { createClient } from "@/lib/supabase-server"
import { Check, Zap, Crown, Building2, Brain, Search, BarChart3, ShieldCheck, Home } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ScrollReveal } from "@/components/ui/ScrollReveal"
import Link from "next/link"

const iconMap: any = {
    'Gratis': Building2,
    'Pro': Zap,
    'Enterprise': Crown,
    'Platino': Crown,
}

const services = [
    {
        title: "Valuación por IA",
        description: "Algoritmos avanzados que analizan el mercado en tiempo real para darte el precio exacto de venta o renta.",
        icon: Brain,
        color: "text-blue-500",
        bg: "bg-blue-500/5"
    },
    {
        title: "Búsqueda Predictiva",
        description: "Encontramos propiedades que aún no salen al mercado basándonos en tus preferencias y comportamiento.",
        icon: Search,
        color: "text-purple-500",
        bg: "bg-purple-500/5"
    },
    {
        title: "Análisis de Inversión",
        description: "Proyecciones de plusvalía y ROI detalladas para que cada centavo invertido tenga un propósito.",
        icon: BarChart3,
        color: "text-emerald-500",
        bg: "bg-emerald-500/5"
    },
    {
        title: "Gestión Patrimonial",
        description: "Asesoría legal y fiscal integrada para blindar tus transacciones inmobiliarias de principio a fin.",
        icon: ShieldCheck,
        color: "text-amber-500",
        bg: "bg-amber-500/5"
    },
    {
        title: "Marketing Exponencial",
        description: "Exposición masiva de tu propiedad en redes y portales premium con fotografía de alta gama.",
        icon: Zap,
        color: "text-rose-500",
        bg: "bg-rose-500/5"
    },
    {
        title: "Concierge Inmobiliario",
        description: "Atención personalizada 24/7 para coordinar visitas, trámites y mudanzas sin que muevas un dedo.",
        icon: Home,
        color: "text-indigo-500",
        bg: "bg-indigo-500/5"
    }
]

export async function Pricing() {
    const supabase = await createClient()
    const { data: plans, error } = await supabase
        .from('subscriptions_config')
        .select('*')
        .order('priority', { ascending: true })

    // Verificar si hay sesión activa
    const { data: { user } } = await supabase.auth.getUser()

    if (error || !plans || plans.length === 0) {
        return null
    }

    return (
        <section id="planes" className="py-24 bg-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50/50 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />

            <div className="container mx-auto px-4 md:px-6 relative z-10">
                
                {/* --- PARTE SUPERIOR: TARJETAS DE PLANES (PAQUETES) --- */}
                <ScrollReveal className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
                    <Badge variant="outline" className="border-blue-500/10 bg-blue-500/5 text-blue-600 rounded-full px-4 py-1 uppercase tracking-widest text-[10px] font-bold">
                        Suscripciones
                    </Badge>
                    <h2 className="text-3xl font-black tracking-tighter text-zinc-900 sm:text-5xl font-heading">
                        Escala tu éxito inmobiliario
                    </h2>
                    <p className="max-w-[700px] text-zinc-500 md:text-xl font-medium">
                        Elige el plan que mejor se adapte a tus necesidades.
                    </p>
                </ScrollReveal>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {plans.map((plan, index) => {
                        const Icon = iconMap[plan.name] || Building2
                        const features = Array.isArray(plan.features) ? plan.features : []
                        const isPopular = plan.name === 'Pro'
                        const isFree = !plan.monthly_price || plan.monthly_price === 0
                        const isEnterprise = plan.name === 'Enterprise'

                        const ctaHref = isEnterprise
                            ? '/contacto'
                            : isFree
                                ? '/registro'
                                : user
                                    ? '/dashboard/suscripcion'
                                    : '/registro'

                        const ctaLabel = isEnterprise
                            ? 'Contactar'
                            : isFree
                                ? 'Empezar gratis'
                                : 'Empezar ahora'

                        return (
                            <ScrollReveal
                                key={plan.id}
                                delay={index * 0.1}
                                direction="up"
                                className="h-full"
                            >
                                <div
                                    className={`group relative flex h-full flex-col rounded-[3rem] border transition-all hover:-translate-y-2 shadow-sm hover:shadow-2xl duration-500 ${isPopular ? 'border-blue-600/20 bg-white ring-1 ring-blue-600/10' : 'border-black/5 bg-zinc-50'}`}
                                >
                                    {isPopular && (
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                                            <div className="bg-blue-600 text-white text-[9px] font-black uppercase tracking-[0.2em] px-5 py-2 rounded-full shadow-[0_10px_30px_-5px_rgba(37,99,235,0.4)] flex items-center gap-2 whitespace-nowrap border-2 border-white">
                                                < Zap className="h-3 w-3 fill-white" />
                                                PLAN RECOMENDADO
                                            </div>
                                        </div>
                                    )}

                                    <div className="p-8 pb-0 relative">
                                        <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl ${isPopular ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-[0_10px_20px_-5px_rgba(37,99,235,0.4)]' : 'bg-zinc-100 text-zinc-400'} mb-6 group-hover:scale-110 transition-all duration-500`}>
                                            <Icon className="h-6 w-6" />
                                        </div>
                                        <h3 className="text-2xl font-black text-zinc-700">{plan.name}</h3>
                                        <div className="mt-4 flex items-baseline text-zinc-700">
                                            {typeof plan.monthly_price === 'number' && plan.monthly_price > 0 ? (
                                                <>
                                                    <span className="text-4xl font-black tracking-tight">$</span>
                                                    <span className="text-5xl font-black tracking-tight leading-none">{Math.floor(plan.monthly_price)}</span>
                                                    <span className="ml-1 text-sm font-bold text-zinc-400">/mes</span>
                                                </>
                                            ) : (
                                                <span className="text-5xl font-black tracking-tight leading-none">
                                                    {plan.monthly_price === 0 ? 'Gratis' : (plan.monthly_price || 'Custom')}
                                                </span>
                                            )}
                                        </div>
                                        <p className="mt-6 text-sm text-zinc-500 leading-relaxed font-medium">
                                            {plan.description}
                                        </p>
                                    </div>

                                    <div className="p-8 flex-1 flex flex-col">
                                        <ul className="mb-10 space-y-4 flex-1">
                                            {features.map((feature: string) => (
                                                <li key={feature} className="flex items-center gap-3 text-sm text-zinc-600 font-medium text-left">
                                                    <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${isPopular ? 'bg-blue-600/10 text-blue-600' : 'bg-black/5 text-zinc-400'}`}>
                                                        <Check className="h-3 w-3" />
                                                    </div>
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>

                                        <Link
                                            href={ctaHref}
                                            className={`flex items-center justify-center w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs transition-all ${isPopular ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20 hover:bg-blue-500 hover:-translate-y-0.5' : 'bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100'}`}
                                        >
                                            {ctaLabel}
                                        </Link>
                                    </div>
                                </div>
                            </ScrollReveal>
                        )
                    })}
                </div>

                <div className="h-px bg-zinc-100 w-full my-32" />

                {/* --- PARTE INFERIOR: INFORMACIÓN DE SERVICIOS INTELIGENTES --- */}
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <ScrollReveal className="space-y-8 max-w-xl text-left">
                        <Badge variant="outline" className="border-blue-500/20 bg-blue-500/5 text-blue-600 rounded-full px-4 py-1 uppercase tracking-widest text-[10px] font-bold">
                            Nuestras Capacidades
                        </Badge>
                        <h2 className="text-4xl font-black tracking-tighter text-zinc-900 sm:text-7xl font-heading leading-[0.9]">
                            Servicios <span className="text-blue-500 italic block">Premium</span>
                        </h2>
                        <p className="text-zinc-500 text-lg md:text-xl font-medium leading-relaxed">
                            No solo vendemos casas, orquestamos transacciones inteligentes respaldadas por la tecnología más avanzada del sector.
                        </p>
                        <div className="grid grid-cols-2 gap-6 pt-4">
                            <div className="p-6 rounded-[2rem] bg-zinc-50 border border-zinc-100">
                                <div className="text-3xl font-black text-blue-600 mb-1">98%</div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Precisión en Valuación</div>
                            </div>
                            <div className="p-6 rounded-[2rem] bg-zinc-50 border border-zinc-100">
                                <div className="text-3xl font-black text-blue-600 mb-1">-30%</div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Tiempo de Cierre</div>
                            </div>
                        </div>
                    </ScrollReveal>

                    <div className="grid sm:grid-cols-2 gap-6">
                        {services.map((service, i) => (
                            <ScrollReveal
                                key={i}
                                delay={i * 0.1}
                                direction="left"
                                className="h-full"
                            >
                                <div
                                    className="group h-full p-8 rounded-[2.5rem] bg-white border border-zinc-100 transition-all duration-500 hover:border-blue-500/30 hover:shadow-[0_30px_60px_-20px_rgba(0,0,0,0.05)] text-left"
                                >
                                    <div className={`h-14 w-14 rounded-2xl ${service.bg} ${service.color} flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                                        <service.icon className="h-7 w-7" />
                                    </div>
                                    <h3 className="text-xl font-bold text-zinc-700 mb-2">{service.title}</h3>
                                    <p className="text-sm font-medium text-zinc-500 leading-relaxed">
                                        {service.description}
                                    </p>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
