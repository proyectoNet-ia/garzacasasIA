import React from 'react'
import { Brain, Search, ShieldCheck, Zap, Sparkles, LayoutGrid } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export function BentoFeatures() {
    return (
        <section className="py-24 bg-zinc-950 relative overflow-hidden">
            {/* Seamless transition from Hero */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />

            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
                    <Badge variant="outline" className="border-blue-500/20 bg-blue-500/10 text-blue-400 rounded-full px-4 py-1 uppercase tracking-widest text-[10px] font-bold">
                        Innovación
                    </Badge>
                    <h2 className="text-3xl font-black tracking-tighter text-white sm:text-5xl font-heading">
                        Inteligencia en cada paso
                    </h2>
                    <p className="max-w-[700px] text-zinc-400 md:text-xl font-medium">
                        Nuestra tecnología optimiza la búsqueda y gestión de tu próximo hogar.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-[250px]">
                    {/* Big Bento Box 1 */}
                    <div className="md:col-span-2 md:row-span-2 group relative overflow-hidden rounded-[3rem] border border-white/5 bg-zinc-900/50 p-10 transition-all hover:border-blue-500/40 hover:shadow-2xl hover:shadow-blue-500/10">
                        <div className="relative z-10 flex h-full flex-col justify-between">
                            <div className="flex items-center justify-center h-16 w-16 rounded-3xl bg-blue-600 shadow-xl shadow-blue-600/20">
                                <Brain className="h-8 w-8 text-white" />
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-3xl font-black text-white">Análisis de Mercado IA</h3>
                                <p className="text-zinc-400 text-lg leading-relaxed max-w-sm">
                                    Algoritmos procesando datos en tiempo real para darte el valor preciso de cada propiedad.
                                </p>
                            </div>
                        </div>
                        <div className="absolute top-10 right-10 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Sparkles className="h-32 w-32 text-blue-400" />
                        </div>
                    </div>

                    {/* Small Bento Box 1 */}
                    <div className="group relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-white/5 p-8 transition-all hover:bg-white/10 hover:border-white/20">
                        <div className="flex flex-col h-full items-center justify-center text-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-zinc-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Zap className="h-6 w-6 text-blue-400" />
                            </div>
                            <h4 className="text-lg font-bold text-white uppercase tracking-tight">Velocidad</h4>
                            <p className="text-xs text-zinc-500 font-medium">Carga instantánea con Next.js 15.</p>
                        </div>
                    </div>

                    {/* Small Bento Box 2 */}
                    <div className="group relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-white/5 p-8 transition-all hover:bg-white/10 hover:border-white/20">
                        <div className="flex flex-col h-full items-center justify-center text-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-zinc-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <ShieldCheck className="h-6 w-6 text-green-400" />
                            </div>
                            <h4 className="text-lg font-bold text-white uppercase tracking-tight">Seguridad</h4>
                            <p className="text-xs text-zinc-500 font-medium">Agentes verificados con Supabase.</p>
                        </div>
                    </div>

                    {/* Medium Bento Box 1 */}
                    <div className="md:col-span-2 group relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-zinc-900 p-8 transition-all hover:border-white/20 shadow-2xl">
                        <div className="flex items-center gap-8 h-full">
                            <div className="flex-1 space-y-2">
                                <h3 className="text-2xl font-black text-white">Búsqueda Inteligente</h3>
                                <p className="text-zinc-400 font-medium">Filtros dinámicos basados en IA.</p>
                            </div>
                            <div className="h-20 w-32 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-center">
                                <Search className="h-10 w-10 text-zinc-700" />
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    )
}
