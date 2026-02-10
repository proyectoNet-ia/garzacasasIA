import React from 'react'
import { CheckCircle2, MousePointerClick, Zap, Layers, BarChart3, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const advantages = [
    {
        title: 'Gestión de Leads IA',
        description: 'Clasificación automática de prospectos basada en su comportamiento y preferencias reales.',
        icon: Users,
        color: 'blue'
    },
    {
        title: 'Reportes en un Click',
        description: 'Genera reportos de rendimiento y comparativas de mercado para tus clientes al instante.',
        icon: MousePointerClick,
        color: 'green'
    },
    {
        title: 'Multimedia 4K',
        description: 'Soporte nativo para galerías de alta resolución y tours virtuales con carga ultra-rápida.',
        icon: Zap,
        color: 'yellow'
    },
    {
        title: 'Integración CRM',
        description: 'Exporta tus datos fácilmente a Salesforce, HubSpot o cualquier herramienta que ya uses.',
        icon: Layers,
        color: 'purple'
    },
    {
        title: 'Métricas en Tiempo Real',
        description: 'Visualiza cuántas personas ven tus propiedades y qué zonas tienen mayor demanda hoy.',
        icon: BarChart3,
        color: 'primary'
    },
    {
        title: 'Verificación de Identidad',
        description: 'Sistema de seguridad avanzado para asegurar que cada trato sea con personas reales.',
        icon: CheckCircle2,
        color: 'blue'
    }
]

export function Advantages() {
    return (
        <section className="py-24 bg-zinc-50 relative overflow-hidden transition-colors duration-300">
            {/* Soft Ambient Backdrop */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.03),transparent)] pointer-events-none" />

            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <Badge variant="outline" className="border-blue-600/10 bg-blue-600/5 text-blue-600 rounded-full px-4 py-1 uppercase tracking-widest text-[10px] font-bold">
                                Herramientas Elite
                            </Badge>
                            <h2 className="text-4xl font-black tracking-tighter text-zinc-700 sm:text-6xl font-heading leading-[0.9]">
                                La plataforma que <span className="text-blue-600 italic">trabaja</span> para ti.
                            </h2>
                            <p className="text-zinc-500 text-lg md:text-xl font-medium leading-relaxed">
                                Eficiencia diseñada para el agente moderno en México. Menos papeleo, más resultados reales.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                            {advantages.map((adv) => (
                                <div key={adv.title} className="group p-8 rounded-[2.5rem] border border-black/[0.03] bg-white transition-all hover:bg-white hover:border-black/[0.08] hover:shadow-xl hover:-translate-y-1">
                                    <div className="h-12 w-12 flex items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-600/20 text-white mb-6 group-hover:scale-110 transition-transform">
                                        <adv.icon className="h-6 w-6" />
                                    </div>
                                    <h4 className="text-lg font-bold text-zinc-700 mb-2 uppercase tracking-tight">{adv.title}</h4>
                                    <p className="text-sm text-zinc-500 font-medium leading-relaxed">{adv.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute -inset-10 bg-blue-600/10 rounded-full blur-[120px] opacity-10" />
                        <div className="relative aspect-square md:aspect-[4/5] rounded-[3.5rem] border border-black/[0.05] overflow-hidden shadow-2xl group bg-white">
                            <img
                                src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200&auto=format&fit=crop"
                                alt="Propiedad de Lujo"
                                className="h-full w-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-1000"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/10 to-transparent" />
                            <div className="absolute bottom-10 left-10 right-10 p-10 bg-white/80 backdrop-blur-3xl rounded-[2.5rem] border border-black/5 space-y-4 shadow-2xl">
                                <div className="text-2xl font-black text-zinc-700">Resultados Comprobados</div>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                                        <span>Eficiencia de Cierre</span>
                                        <span className="text-blue-600">+45%</span>
                                    </div>
                                    <div className="h-2 w-full bg-black/5 rounded-full overflow-hidden">
                                        <div className="h-full w-[85%] bg-blue-600 rounded-full" />
                                    </div>
                                </div>
                                <p className="text-sm text-zinc-500 italic">"Garza Casas IA duplicó mi volumen de ventas en solo 3 meses."</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
