'use client'

import React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { Play, Shield, Zap, TrendingUp, Sparkles, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface DemoModalProps {
    isOpen: boolean
    onClose: () => void
}

export function DemoModal({ isOpen, onClose }: DemoModalProps) {
    return (
        <DialogPrimitive.Root open={isOpen} onOpenChange={onClose}>
            <DialogPrimitive.Portal>
                <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
                <DialogPrimitive.Content
                    className={cn(
                        "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
                        "w-[92vw] max-w-6xl",
                        "overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 shadow-2xl",
                        "data-[state=open]:animate-in data-[state=closed]:animate-out",
                        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
                        "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
                        "duration-200 outline-none"
                    )}
                >
                    {/* Required for accessibility */}
                    <DialogPrimitive.Title className="sr-only">Demo Interactiva — Garza Casas IA</DialogPrimitive.Title>
                    <DialogPrimitive.Description className="sr-only">Vista previa del dashboard inteligente de Garza Casas IA.</DialogPrimitive.Description>

                    {/* Close button */}
                    <DialogPrimitive.Close className="absolute top-5 right-5 z-50 h-9 w-9 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/20 transition-all">
                        <X className="h-4 w-4" />
                    </DialogPrimitive.Close>

                    <div className="flex flex-col lg:flex-row" style={{ minHeight: '580px' }}>

                        {/* LEFT: Video Panel */}
                        <div className="relative lg:w-[58%] min-h-[280px] lg:min-h-full flex items-center justify-center group overflow-hidden bg-zinc-900">
                            <div
                                className="absolute inset-0 bg-cover bg-center opacity-50 transition-transform duration-1000 group-hover:scale-105"
                                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1200')" }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-tr from-blue-950/60 via-zinc-950/50 to-transparent" />

                            {/* Play Button */}
                            <div className="relative z-10 flex flex-col items-center gap-6 px-12 text-center">
                                <button className="h-24 w-24 rounded-full bg-blue-600 flex items-center justify-center shadow-2xl shadow-blue-600/60 hover:scale-110 active:scale-95 transition-all duration-300 ring-8 ring-blue-600/20">
                                    <Play className="h-10 w-10 text-white fill-white ml-1.5" />
                                </button>
                                <div>
                                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">Smart Dashboard Preview</h3>
                                    <p className="text-zinc-400 text-sm leading-relaxed max-w-xs">
                                        Observa cómo nuestra IA analiza el mercado en segundos y cierra tratos.
                                    </p>
                                </div>
                            </div>

                            {/* Progress bar */}
                            <div className="absolute bottom-6 left-8 right-8 h-1 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full w-1/3 bg-blue-500 rounded-full" />
                            </div>
                        </div>

                        {/* RIGHT: Content Panel */}
                        <div className="lg:w-[42%] p-10 lg:p-14 flex flex-col justify-between gap-10">
                            {/* Header */}
                            <div className="space-y-5">
                                <div className="inline-flex items-center gap-2 rounded-full bg-blue-600/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-blue-400 border border-blue-600/20">
                                    <Sparkles className="h-3 w-3" />
                                    Demo Interactiva
                                </div>
                                <h2 className="text-4xl font-black text-white uppercase tracking-tighter leading-[1.05]">
                                    El futuro de los <span className="text-blue-500 italic block">Bienes Raíces</span>
                                </h2>
                                <p className="text-zinc-400 text-sm leading-relaxed">
                                    Descubre por qué los mejores agentes están migrando a Garza Casas IA.
                                </p>
                            </div>

                            {/* Features */}
                            <div className="space-y-6">
                                {[
                                    { icon: Zap, title: "Análisis con IA", desc: "Valuaciones automáticas en tiempo real." },
                                    { icon: Shield, title: "Seguridad Premium", desc: "Gestión documental verificada digitalmente." },
                                    { icon: TrendingUp, title: "Crecimiento Exponencial", desc: "Herramientas de marketing integradas." }
                                ].map((feature, i) => (
                                    <div key={i} className="flex items-start gap-4 group">
                                        <div className="shrink-0 mt-0.5 h-11 w-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-blue-400 transition-all duration-300 group-hover:bg-blue-600 group-hover:text-white group-hover:border-transparent">
                                            <feature.icon className="h-5 w-5" />
                                        </div>
                                        <div className="pt-1">
                                            <h4 className="text-sm font-black text-white uppercase tracking-tight">{feature.title}</h4>
                                            <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{feature.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* CTAs */}
                            <div className="flex flex-col gap-3">
                                <Link href="/registro" className="w-full" onClick={onClose}>
                                    <Button size="lg" className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-600/20 transition-all hover:-translate-y-0.5">
                                        Empezar ahora gratis
                                    </Button>
                                </Link>
                                <button onClick={onClose} className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600 hover:text-zinc-400 transition-colors py-1">
                                    Quizás más tarde
                                </button>
                            </div>
                        </div>
                    </div>
                </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    )
}
