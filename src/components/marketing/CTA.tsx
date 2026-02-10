import React from 'react'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles } from 'lucide-react'

export function CTA() {
    return (
        <section className="py-24 bg-white px-4 md:px-0 relative overflow-hidden">
            {/* Decorative lines and gradients for the "Airy" look */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-black/5 to-transparent" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-50/50 rounded-full blur-[120px] pointer-events-none" />

            <div className="container mx-auto max-w-6xl rounded-[3.5rem] bg-zinc-50 p-12 md:p-24 relative overflow-hidden border border-black/5 shadow-2xl shadow-blue-500/5">
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-blue-600/5 rounded-full blur-[80px]" />

                <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
                    <div className="max-w-2xl text-center lg:text-left space-y-8">
                        <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-6 py-2 text-[10px] font-black uppercase tracking-widest text-blue-600 border border-blue-500/10">
                            <Sparkles className="h-3.5 w-3.5" />
                            Acceso Anticipado
                        </div>
                        <h2 className="text-4xl font-black tracking-tighter text-zinc-700 sm:text-7xl leading-[0.9]">
                            ¿Listo para <br /> <span className="text-blue-600 italic">revolucionar</span> tu carrera?
                        </h2>
                        <p className="text-zinc-500 text-lg md:text-xl font-medium max-w-lg mx-auto lg:mx-0">
                            Únete a los agentes que están cerrando tratos en tiempo récord con nuestra IA.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-6 w-full lg:w-auto">
                        <Button size="lg" className="h-16 px-10 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-widest text-xs hover:bg-blue-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-600/40 transition-all group">
                            Empezar ahora
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                        <Button variant="outline" size="lg" className="h-16 px-10 rounded-2xl border-black/10 bg-transparent text-zinc-600 font-black uppercase tracking-widest text-xs hover:bg-black/5 transition-all">
                            Ver Demo
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    )
}
