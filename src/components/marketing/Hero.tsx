'use client'

import { Button } from "@/components/ui/button"
import { Search, MapPin, Home as HomeIcon, DollarSign, ChevronDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useSearch } from "@/providers/SearchProvider"
import { useState } from "react"
import Image from "next/image"
import { ScrollReveal } from "@/components/ui/ScrollReveal"

interface HeroProps {
    config?: any;
}

export function Hero({ config }: HeroProps) {
    const { filters, setFilters, updateFilter } = useSearch()
    const [localLocation, setLocalLocation] = useState(filters.location)

    const title = config?.title || "Encuentra tu hogar ideal impulsado por IA"
    const subtitle = config?.subtitle || "La plataforma inteligente que conecta compradores y agentes con análisis de mercado en tiempo real."
    const image = (config?.image_url && config.image_url.trim() !== "")
        ? config.image_url
        : "https://images.unsplash.com/photo-1582407947304-fd86f028f716?q=80&w=1600&auto=format&fit=crop"

    const handleSearch = () => {
        setFilters({
            ...filters,
            location: localLocation
        })
        // Scroll to results
        const results = document.getElementById('propiedades-destacadas')
        if (results) results.scrollIntoView({ behavior: 'smooth' })
    }

    return (
        <section className="relative flex min-h-[95vh] flex-col items-center justify-center overflow-hidden pt-20 bg-zinc-950 transition-colors duration-300">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0 select-none">
                <Image
                    src={config?.image_url || "https://images.unsplash.com/photo-1582407947304-fd86f028f716?q=80&w=1600&auto=format&fit=crop"}
                    alt="Hero background"
                    fill
                    priority
                    className="h-full w-full object-cover opacity-40 mix-blend-overlay"
                />
                {/* Advanced Multi-layer Gradient */}
                <div className="absolute inset-0 bg-zinc-950/40" />
                <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-transparent to-zinc-950" />
                <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-transparent to-zinc-950 opacity-60" />
            </div>

            <div className="relative z-10 container mx-auto px-4 text-center md:px-6">
                <div className="mx-auto max-w-5xl space-y-10">
                    <ScrollReveal className="space-y-4">
                        <div className="inline-block rounded-lg bg-zinc-900/50 px-3 py-1 text-sm text-blue-400 border border-blue-500/20 backdrop-blur-md">
                            <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 border-blue-500/20 mr-2">Novedad</Badge>
                            Análisis predictivo de precios disponible
                        </div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
                            {config?.title || "Encuentra tu hogar ideal impulsado por IA"}
                        </h1>
                        <p className="mx-auto max-w-[700px] text-zinc-300 font-medium md:text-lg lg:text-xl">
                            {config?.subtitle || "La plataforma inteligente que conecta compradores y agentes con análisis de mercado en tiempo real."}
                        </p>
                    </ScrollReveal>

                    <ScrollReveal delay={0.2} className="mx-auto w-full max-w-4xl space-y-6">
                        {/* Transaction Type Toggle */}
                        <div className="flex justify-center">
                            <div className="inline-flex p-1 bg-zinc-900/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
                                <button
                                    onClick={() => updateFilter('listing_type', 'Venta')}
                                    className={`px-8 py-2.5 rounded-xl text-sm font-black transition-all duration-500 uppercase tracking-widest ${filters.listing_type === 'Venta'
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-105'
                                        : 'text-zinc-400 hover:text-white'
                                        }`}
                                >
                                    Comprar
                                </button>
                                <button
                                    onClick={() => updateFilter('listing_type', 'Renta')}
                                    className={`px-8 py-2.5 rounded-xl text-sm font-black transition-all duration-500 uppercase tracking-widest ${filters.listing_type === 'Renta'
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-105'
                                        : 'text-zinc-400 hover:text-white'
                                        }`}
                                >
                                    Rentar
                                </button>
                            </div>
                        </div>

                        {/* Search Bar - Premium Dark Mode */}
                        <div className="relative group/searchbar">
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-[2.5rem] blur-2xl opacity-0 md:group-hover/searchbar:opacity-100 transition duration-1000" />
                            <div className="relative flex flex-col p-4 gap-4 md:p-2 md:flex-row md:items-center md:gap-2 rounded-[2.5rem] bg-zinc-900/60 backdrop-blur-3xl border border-white/10 shadow-2xl transition-all duration-500 md:hover:border-white/20">
                                {/* Location Input */}
                                <div className="relative w-full flex-[1.5]">
                                    <MapPin className="absolute left-6 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-400" />
                                    <input
                                        type="text"
                                        placeholder="¿En qué zona buscas?"
                                        className="h-14 md:h-16 w-full rounded-[2rem] bg-zinc-800/50 md:bg-transparent pl-14 pr-4 text-white placeholder:text-zinc-500 outline-none transition-all focus:bg-zinc-800/80 md:focus:bg-transparent"
                                        value={localLocation}
                                        onChange={(e) => setLocalLocation(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    />
                                </div>

                                <div className="hidden h-10 w-px bg-white/10 md:block" />

                                <div className="flex flex-col sm:flex-row gap-4 md:gap-0 w-full md:w-auto">
                                    {/* Property Type Select */}
                                    <div className="w-full min-w-[160px]">
                                        <Select
                                            value={filters.type || 'all'}
                                            onValueChange={(val) => updateFilter('type', val === 'all' ? '' : val)}
                                        >
                                            <SelectTrigger className="h-14 md:h-16 border-none bg-zinc-800/50 md:bg-transparent text-white focus:ring-0 shadow-none hover:bg-white/5 rounded-[2rem] md:rounded-2xl px-6 data-[state=open]:bg-zinc-800/80 md:data-[state=open]:bg-transparent">
                                                <div className="flex items-center gap-3">
                                                    <HomeIcon className="h-5 w-5 text-blue-400" />
                                                    <span className="font-bold text-sm tracking-tight"><SelectValue placeholder="Tipo" /></span>
                                                </div>
                                            </SelectTrigger>
                                            <SelectContent className="bg-zinc-900 border-zinc-800 text-white rounded-2xl p-1 shadow-2xl backdrop-blur-3xl">
                                                <SelectItem value="all" className="rounded-xl focus:bg-blue-600/20 focus:text-blue-400 font-bold">Cualquier Tipo</SelectItem>
                                                <SelectItem value="Casa" className="rounded-xl focus:bg-blue-600/20 focus:text-blue-400 font-bold">Casa</SelectItem>
                                                <SelectItem value="Departamento" className="rounded-xl focus:bg-blue-600/20 focus:text-blue-400 font-bold">Departamento</SelectItem>
                                                <SelectItem value="Terreno" className="rounded-xl focus:bg-blue-600/20 focus:text-blue-400 font-bold">Terreno</SelectItem>
                                                <SelectItem value="Local" className="rounded-xl focus:bg-blue-600/20 focus:text-blue-400 font-bold">Comercial</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="hidden h-10 w-px bg-white/10 md:block" />

                                    {/* Price Range Select */}
                                    <div className="w-full min-w-[180px]">
                                        <Select
                                            value={filters.priceRange || 'all'}
                                            onValueChange={(val) => updateFilter('priceRange', val === 'all' ? '' : val)}
                                        >
                                            <SelectTrigger className="h-14 md:h-16 border-none bg-zinc-800/50 md:bg-transparent text-white focus:ring-0 shadow-none hover:bg-white/5 rounded-[2rem] md:rounded-2xl px-6 data-[state=open]:bg-zinc-800/80 md:data-[state=open]:bg-transparent">
                                                <div className="flex items-center gap-3">
                                                    <DollarSign className="h-5 w-5 text-blue-400" />
                                                    <span className="font-bold text-sm tracking-tight"><SelectValue placeholder="Precio" /></span>
                                                </div>
                                            </SelectTrigger>
                                            <SelectContent className="bg-zinc-900 border-zinc-800 text-white rounded-2xl p-1 shadow-2xl backdrop-blur-3xl">
                                                <SelectItem value="all" className="rounded-xl focus:bg-blue-600/20 focus:text-blue-400 font-bold">Cualquier Precio</SelectItem>
                                                <SelectItem value="0-5M" className="rounded-xl focus:bg-blue-600/20 focus:text-blue-400 font-bold">Hasta $5M</SelectItem>
                                                <SelectItem value="5-15M" className="rounded-xl focus:bg-blue-600/20 focus:text-blue-400 font-bold">$5M - $15M</SelectItem>
                                                <SelectItem value="15M+" className="rounded-xl focus:bg-blue-600/20 focus:text-blue-400 font-bold">Más de $15M</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Search Button */}
                                <Button
                                    className="mt-2 md:mt-0 h-14 w-full md:w-14 shrink-0 rounded-[2rem] md:rounded-full bg-blue-600 p-0 text-white transition-all duration-300 hover:bg-blue-500 hover:scale-[1.02] md:hover:scale-[1.1] active:scale-95 shadow-xl shadow-blue-600/30 md:mr-2 flex items-center justify-center gap-2"
                                    onClick={handleSearch}
                                >
                                    <Search className="h-5 w-5 md:h-6 md:w-6" />
                                    <span className="font-black tracking-widest uppercase md:sr-only">Buscar</span>
                                </Button>
                            </div>
                        </div>
                    </ScrollReveal>

                    {/* Quick Filter Badges */}
                    <ScrollReveal delay={0.4} className="mt-8 hidden flex-col items-center gap-4 md:flex md:flex-row md:justify-center md:gap-3 md:flex-wrap">
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] md:mr-2">Top Zonas:</span>
                        <div className="flex flex-wrap justify-center gap-2">
                            {["San Pedro", "Cumbres", "Carretera Nacional", "Valle Poniente"].map((city) => (
                                <button
                                    key={city}
                                    className="group relative overflow-hidden rounded-full px-5 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-300 transition-all hover:text-white border border-white/5 hover:border-blue-500/50 bg-white/5 backdrop-blur-sm"
                                    onClick={() => {
                                        setLocalLocation(city)
                                        handleSearch()
                                    }}
                                >
                                    <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/10 transition-colors" />
                                    {city}
                                </button>
                            ))}
                        </div>
                    </ScrollReveal>
                </div>
            </div>

            <ScrollReveal delay={1} direction="down" distance={20} className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce cursor-pointer p-2" onClick={() => {
                const results = document.getElementById('propiedades-destacadas')
                if (results) results.scrollIntoView({ behavior: 'smooth' })
            }}>
                <ChevronDown className="h-6 w-6 text-zinc-400" />
            </ScrollReveal>
        </section >
    )
}
