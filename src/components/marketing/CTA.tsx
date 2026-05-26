'use client'

import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles } from 'lucide-react'
import { ScrollReveal } from "@/components/ui/ScrollReveal"
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { DemoModal } from './DemoModal'

export function CTA() {
    const [isDemoOpen, setIsDemoOpen] = useState(false)

    return (
        <section className="py-24 relative overflow-hidden bg-zinc-950">
            {/* Parallax / Cinematic Background */}
            <div className="absolute inset-0 z-0 select-none">
                <Image
                    src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2000&auto=format&fit=crop"
                    alt="City Skyline"
                    fill
                    className="object-cover opacity-30 blur-[2px] scale-110 motion-safe:animate-[pulse_10s_ease-in-out_infinite]"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-950/40 to-zinc-950" />
                <div className="absolute inset-0 bg-blue-600/10 mix-blend-overlay" />
            </div>

            <div className="container mx-auto max-w-6xl rounded-[3.5rem] bg-white/5 backdrop-blur-xl p-12 md:p-24 relative overflow-hidden border border-white/10 shadow-2xl">
                {/* Internal Glows */}
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-blue-600/10 rounded-full blur-[80px]" />

                <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
                    <ScrollReveal className="max-w-2xl text-center lg:text-left space-y-8">
                        <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 px-6 py-2 text-[10px] font-black uppercase tracking-widest text-blue-400 border border-blue-400/20">
                            <Sparkles className="h-3.5 w-3.5" />
                            Acceso Anticipado
                        </div>
                        <h2 className="text-4xl font-black tracking-tighter text-white sm:text-7xl leading-[0.9]">
                            ¿Listo para <br /> <span className="text-blue-500 italic">revolucionar</span> tu carrera?
                        </h2>
                        <p className="text-zinc-300 text-lg md:text-xl font-medium max-w-lg mx-auto lg:mx-0">
                            Únete a los agentes que están cerrando tratos en tiempo récord con nuestra IA.
                        </p>
                    </ScrollReveal>

                    <ScrollReveal delay={0.2} direction="left" className="flex flex-col sm:flex-row gap-6 w-full lg:w-auto">
                        {/* Empezar ahora → va al login */}
                        <Link href="/registro" className="w-full sm:w-auto">
                            <Button
                                size="lg"
                                className="h-16 w-full px-10 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-widest text-xs hover:bg-blue-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-600/40 transition-all group border-none"
                            >
                                Empezar ahora
                                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Button>
                        </Link>

                        {/* Ver Demo → abre modal */}
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={() => setIsDemoOpen(true)}
                            className="h-16 px-10 rounded-2xl border-white/10 bg-white/5 text-white font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all backdrop-blur-md"
                        >
                            Ver Demo
                        </Button>
                    </ScrollReveal>
                </div>
            </div>

            {/* Demo Modal */}
            <DemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />
        </section>
    )
}
