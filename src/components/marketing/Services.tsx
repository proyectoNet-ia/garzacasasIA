'use client'

import { Badge } from "@/components/ui/badge"
import { Brain, Search, BarChart3, ShieldCheck, Home, Zap } from "lucide-react"

export function Services() {
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

    return (
        <section id="servicios" className="py-24 bg-white relative overflow-hidden">
            <div className="container mx-auto px-4 md:px-6 relative">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8 max-w-xl">
                        <Badge variant="outline" className="border-blue-500/20 bg-blue-500/5 text-blue-600 rounded-full px-4 py-1 uppercase tracking-widest text-[10px] font-bold">
                            Nuestras Soluciones
                        </Badge>
                        <h2 className="text-4xl font-black tracking-tighter text-zinc-700 sm:text-7xl font-heading leading-[0.9]">
                            Servicios <span className="text-blue-500 italic block">Inteligentes</span>
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
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6">
                        {services.map((service, i) => (
                            <div
                                key={i}
                                className="group p-8 rounded-[2.5rem] bg-white border border-zinc-100 transition-all duration-500 hover:border-blue-500/30 hover:shadow-[0_30px_60px_-20px_rgba(0,0,0,0.05)]"
                            >
                                <div className={`h-14 w-14 rounded-2xl ${service.bg} ${service.color} flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                                    <service.icon className="h-7 w-7" />
                                </div>
                                <h3 className="text-xl font-bold text-zinc-700 mb-2">{service.title}</h3>
                                <p className="text-sm font-medium text-zinc-500 leading-relaxed">
                                    {service.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
