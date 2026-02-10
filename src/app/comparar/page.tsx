"use client"

import { useInteractions } from "@/providers/InteractionsProvider"
import { BedDouble, Bath, Square, MapPin, ArrowLeft, Trash2, Zap, Crown } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export default function CompararPage() {
    const { compareList, toggleCompare, clearCompare } = useInteractions()

    if (compareList.length === 0) {
        return (
            <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-8 text-center space-y-6 transition-colors duration-300">
                <div className="h-24 w-24 rounded-full bg-black/5 flex items-center justify-center text-zinc-400">
                    <Zap className="h-12 w-12" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-3xl font-black text-zinc-700 uppercase tracking-tighter">Tu comparador está vacío</h1>
                    <p className="text-zinc-500 font-medium max-w-md mx-auto">Selecciona hasta 3 propiedades para analizarlas lado a lado y tomar la mejor decisión.</p>
                </div>
                <Link href="/">
                    <Button className="h-12 px-8 rounded-2xl bg-zinc-900 text-white hover:bg-zinc-800 font-black uppercase tracking-widest text-xs gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Volver al Inicio
                    </Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white text-zinc-700 p-6 sm:p-12 md:p-20 space-y-12 transition-colors duration-300">
            <div className="max-w-7xl mx-auto space-y-12">
                <header className="flex flex-col md:flex-row justify-between items-center gap-8 border-b border-black/5 pb-12">
                    <div className="space-y-4 text-center md:text-left">
                        <h1 className="text-4xl sm:text-6xl font-black tracking-tighter text-zinc-700 font-heading">
                            Comparar <span className="text-blue-600">Propiedades</span>
                        </h1>
                        <p className="text-zinc-500 font-bold text-sm uppercase tracking-widest">Análisis detallado de tus opciones favoritas</p>
                    </div>
                    <div className="flex gap-4">
                        <Button variant="ghost" onClick={clearCompare} className="text-zinc-500 hover:text-red-500 hover:bg-red-500/10 font-bold uppercase tracking-widest text-xs gap-2">
                            <Trash2 className="h-4 w-4" />
                            Limpiar Todo
                        </Button>
                        <Link href="/">
                            <Button variant="outline" className="border-black/10 text-zinc-700 hover:bg-black/5 rounded-2xl font-bold uppercase tracking-widest text-xs">
                                Añadir más
                            </Button>
                        </Link>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {compareList.map((property) => {
                        const features = property.features || {}
                        return (
                            <div key={property.id} className="bg-white border border-black/5 rounded-[3rem] overflow-hidden flex flex-col group hover:border-blue-500/30 transition-all duration-500 shadow-sm">
                                <div className="h-64 relative overflow-hidden">
                                    <img
                                        src={property.main_image_url || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800"}
                                        alt={property.title}
                                        className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-80" />

                                    <div className="absolute top-6 left-6">
                                        {property.priority_tier >= 2 && (
                                            <Badge className="bg-blue-600/90 backdrop-blur-md text-white border-0 py-1.5 px-4 rounded-full flex items-center gap-2">
                                                {property.priority_tier === 3 ? <Crown className="h-3.5 w-3.5" /> : <Zap className="h-3.5 w-3.5" />}
                                                <span className="text-[10px] font-black uppercase tracking-widest">Premium</span>
                                            </Badge>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => toggleCompare(property)}
                                        className="absolute top-6 right-6 h-10 w-10 bg-black/50 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-red-500 transition-colors"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>

                                    {/* Original price display removed from here */}
                                </div>

                                <div className="p-10 space-y-10 flex-1 flex flex-col">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 text-blue-600 text-[10px] font-medium uppercase tracking-[0.2em]">
                                            <MapPin className="h-3.5 w-3.5" />
                                            {property.location}
                                        </div>
                                        <div className="text-3xl font-black text-zinc-700">
                                            ${property.price.toLocaleString()}
                                        </div>
                                        <h3 className="text-2xl font-black text-zinc-700 group-hover:text-blue-600 transition-all">
                                            {property.title}
                                        </h3>
                                    </div>

                                    <div className="grid grid-cols-1 gap-6 py-8 border-y border-black/5">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4 text-zinc-500">
                                                <div className="p-3 rounded-xl bg-black/5">
                                                    <BedDouble className="h-5 w-5" />
                                                </div>
                                                <span className="text-xs font-bold uppercase tracking-widest">Dormitorios</span>
                                            </div>
                                            <span className="text-lg font-medium text-zinc-700">{features.beds || '-'}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4 text-zinc-500">
                                                <div className="p-3 rounded-xl bg-black/5">
                                                    <Bath className="h-5 w-5" />
                                                </div>
                                                <span className="text-xs font-bold uppercase tracking-widest">Baños</span>
                                            </div>
                                            <span className="text-lg font-medium text-zinc-700">{features.baths || '-'}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4 text-zinc-500">
                                                <div className="p-3 rounded-xl bg-black/5">
                                                    <Square className="h-5 w-5" />
                                                </div>
                                                <span className="text-xs font-bold uppercase tracking-widest">Construcción</span>
                                            </div>
                                            <span className="text-lg font-medium text-zinc-700">{features.sqft || '-'} m²</span>
                                        </div>
                                    </div>

                                    <div className="pt-4 mt-auto">
                                        <Link href={`/propiedades/${property.id}`} className="block">
                                            <Button className="w-full h-14 rounded-2xl bg-zinc-900 text-white hover:bg-zinc-800 font-black uppercase tracking-widest text-xs">
                                                Ver Ficha Completa
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )
                    })}

                    {compareList.length < 3 && Array.from({ length: 3 - compareList.length }).map((_, i) => (
                        <Link key={`empty-${i}`} href="/" className="border-2 border-dashed border-black/5 rounded-[3rem] flex flex-col items-center justify-center p-12 text-center group hover:bg-black/[0.01] transition-all">
                            <div className="h-16 w-16 rounded-full bg-black/5 flex items-center justify-center text-zinc-400 group-hover:text-blue-500 transition-colors mb-6">
                                <Zap className="h-8 w-8" />
                            </div>
                            <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest leading-relaxed">Añade otra propiedad<br />para comparar</p>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}
