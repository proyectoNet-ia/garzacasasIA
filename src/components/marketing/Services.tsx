'use client'

import { Badge } from "@/components/ui/badge"
import { Construction, Sparkles } from "lucide-react"
import { ScrollReveal } from "@/components/ui/ScrollReveal"

export function Services() {
    return (
        <section id="servicios" className="py-24 bg-zinc-50 relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-zinc-200/50 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
            
            <div className="container mx-auto px-4 md:px-6 relative">
                <ScrollReveal className="flex flex-col items-center justify-center text-center space-y-8 py-20">
                    <div className="relative">
                        <div className="absolute -inset-4 bg-blue-500/20 blur-2xl rounded-full animate-pulse" />
                        <div className="h-24 w-24 rounded-3xl bg-blue-600 flex items-center justify-center text-white shadow-2xl shadow-blue-600/20 relative rotate-3 group-hover:rotate-0 transition-transform duration-500">
                            <Construction className="h-12 w-12" />
                        </div>
                    </div>

                    <div className="space-y-4 max-w-2xl">
                        <Badge variant="outline" className="border-blue-500/20 bg-blue-500/5 text-blue-600 rounded-full px-4 py-1 uppercase tracking-widest text-[10px] font-bold gap-2">
                            <Sparkles className="h-3 w-3" />
                            Próximamente
                        </Badge>
                        <h2 className="text-4xl font-black tracking-tighter text-zinc-900 sm:text-7xl font-heading leading-none">
                            Sitio en <span className="text-blue-600 italic">Construcción</span>
                        </h2>
                        <p className="text-zinc-500 text-lg md:text-xl font-medium leading-relaxed">
                            Estamos evolucionando nuestra plataforma de servicios para ofrecerte una experiencia inmobiliaria sin precedentes. Vuelve pronto para descubrir lo nuevo.
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <div className="h-2 w-2 rounded-full bg-blue-600 animate-bounce [animation-delay:-0.3s]" />
                        <div className="h-2 w-2 rounded-full bg-blue-600 animate-bounce [animation-delay:-0.15s]" />
                        <div className="h-2 w-2 rounded-full bg-blue-600 animate-bounce" />
                    </div>
                </ScrollReveal>
            </div>
        </section>
    )
}

