import { Landmark, MessageSquare, TrendingUp, ShieldCheck, BarChart3, MapPin } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ScrollReveal } from "@/components/ui/ScrollReveal"

const advantages = [
    {
        title: 'Datos Oficiales INEGI',
        description: 'Muestra automáticamente escuelas, hospitales, bancos y comercios a 500m de tu inmueble usando datos satelitales oficiales DENUE.',
        icon: Landmark
    },
    {
        title: 'Contacto Directo WhatsApp',
        description: 'Tus prospectos te contactan directo a tu celular con la propiedad precargada. 0% de comisiones sobre tu venta.',
        icon: MessageSquare
    },
    {
        title: 'Plusvalía Nacional',
        description: 'Respaldamos tus publicaciones con indicadores de plusvalía y costo promedio por m² en los 32 estados de México.',
        icon: TrendingUp
    },
    {
        title: 'Perfil Digital Verificado',
        description: 'Tu propia página web profesional (/agentes/tu-nombre) con insignia de verificación y todo tu inventario activo.',
        icon: ShieldCheck
    },
    {
        title: 'Métricas de Rendimiento',
        description: 'Visualiza en tiempo real cuántas personas ven tus propiedades, cuántos hacen clic a WhatsApp y cuántos las guardan.',
        icon: BarChart3
    },
    {
        title: 'Ubicación Satelital Exacta',
        description: 'Geolocalización precisa con vistas de calle y satélite para que tus compradores conozcan el entorno de inmediato.',
        icon: MapPin
    }
]

export function Advantages() {
    return (
        <section className="py-24 bg-zinc-50 relative overflow-hidden transition-colors duration-300">
            {/* Soft Ambient Backdrop */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.03),transparent)] pointer-events-none" />

            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <div className="grid lg:grid-cols-2 gap-16 items-stretch">
                    <div className="space-y-8">
                        <ScrollReveal className="space-y-4">
                            <Badge variant="outline" className="border-blue-600/10 bg-blue-600/5 text-blue-600 rounded-full px-4 py-1 uppercase tracking-widest text-[10px] font-bold">
                                Herramientas Elite
                            </Badge>
                            <h2 className="text-4xl font-black tracking-tighter text-zinc-900 sm:text-6xl font-heading leading-[0.9]">
                                La plataforma que <span className="text-blue-600 italic">trabaja</span> para ti.
                            </h2>
                            <p className="text-zinc-500 text-lg md:text-xl font-medium leading-relaxed">
                                Tecnología inmobiliaria con datos oficiales del INEGI y contacto directo. Diseñada para potenciar al agente en todo México.
                            </p>
                        </ScrollReveal>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                            {advantages.map((adv, index) => (
                                <ScrollReveal
                                    key={adv.title}
                                    delay={index * 0.1}
                                    className="h-full"
                                >
                                    <div className="group h-full p-8 rounded-[2.5rem] border border-black/[0.03] bg-white transition-all hover:bg-white hover:border-black/[0.08] hover:shadow-xl hover:-translate-y-1">
                                        <div className="h-12 w-12 flex items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-600/20 text-white mb-6 group-hover:scale-110 transition-transform">
                                            <adv.icon className="h-6 w-6" />
                                        </div>
                                        <h4 className="text-lg font-bold text-zinc-800 mb-2 uppercase tracking-tight">{adv.title}</h4>
                                        <p className="text-sm text-zinc-500 font-medium leading-relaxed">{adv.description}</p>
                                    </div>
                                </ScrollReveal>
                            ))}
                        </div>
                    </div>

                    <ScrollReveal direction="left" className="relative h-full">
                        <div className="absolute -inset-10 bg-blue-600/10 rounded-full blur-[120px] opacity-10" />
                        <div className="relative h-full rounded-[3.5rem] border border-black/[0.05] overflow-hidden shadow-2xl group bg-white">
                            <img
                                src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200&auto=format&fit=crop"
                                alt="Propiedad Premium en México"
                                className="h-full w-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-1000"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/10 to-transparent" />
                            <div className="absolute bottom-10 left-10 right-10 p-10 bg-white/80 backdrop-blur-3xl rounded-[2.5rem] border border-black/5 space-y-4 shadow-2xl">
                                <div className="text-2xl font-black text-zinc-900">Cobertura Nacional</div>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                                        <span>Comisión del Agente</span>
                                        <span className="text-blue-600 font-black">100% Para Ti</span>
                                    </div>
                                    <div className="h-2 w-full bg-black/5 rounded-full overflow-hidden">
                                        <div className="h-full w-full bg-blue-600 rounded-full" />
                                    </div>
                                </div>
                                <p className="text-sm text-zinc-600 font-medium leading-relaxed">
                                    Tecnología de datos y difusión inmobiliaria diseñada para agentes independientes y agencias en los 32 estados de la República.
                                </p>
                            </div>
                        </div>
                    </ScrollReveal>
                </div>
            </div>
        </section>
    )
}
