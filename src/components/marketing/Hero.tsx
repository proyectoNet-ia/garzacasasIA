'use client'

import { Button } from "@/components/ui/button"
import { Search, MapPin, Home as HomeIcon, DollarSign, ChevronDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useSearch } from "@/providers/SearchProvider"
import { useState } from "react"
import Image from "next/image"

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
                {/* Fallback image if config.image_url is missing */}
                <Image
                    src={config?.image_url || "https://images.unsplash.com/photo-1582407947304-fd86f028f716?q=80&w=1600&auto=format&fit=crop"}
                    alt="Hero background"
                    fill
                    priority
                    className="h-full w-full object-cover opacity-50 contrast-125"
                />
                {/* Gradient overlay: Dark for text contrast */}
                <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/20 via-zinc-950/60 to-zinc-950" />
            </div>

            <div className="relative z-10 container mx-auto px-4 text-center md:px-6">
                <div className="mx-auto max-w-5xl space-y-10">
                    <div className="space-y-4">
                        <div className="inline-block rounded-lg bg-zinc-900/50 px-3 py-1 text-sm text-blue-400 border border-blue-500/20 backdrop-blur-md">
                            <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 border-blue-500/20 mr-2">Novedad</Badge>
                            Análisis predictivo de precios disponible
                        </div>
                        <h1 className="text-4xl font-black tracking-tighter text-white sm:text-6xl md:text-7xl lg:text-8xl">
                            {config?.title || "Encuentra tu hogar ideal impulsado por IA"}
                        </h1>
                        <p className="mx-auto max-w-[700px] text-zinc-400 md:text-xl/relaxed lg:text-2xl/relaxed">
                            {config?.subtitle || "La plataforma inteligente que conecta compradores y agentes con análisis de mercado en tiempo real."}
                        </p>
                    </div>

                    <div className="mx-auto w-full max-w-4xl">
                        {/* Search Bar - Dark Mode */}
                        <div className="relative flex flex-col items-center gap-4 rounded-3xl bg-zinc-900/40 p-3 backdrop-blur-2xl border border-white/5 md:flex-row shadow-2xl">
                            <div className="relative w-full flex-1">
                                <MapPin className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
                                <input
                                    type="text"
                                    placeholder="¿Dónde quieres vivir? (Monterrey, San Pedro...)"
                                    className="h-14 w-full rounded-2xl bg-zinc-950/50 pl-12 text-white outline-none ring-1 ring-white/10 transition-all focus:ring-2 focus:ring-blue-500/50"
                                    value={localLocation}
                                    onChange={(e) => setLocalLocation(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                />
                            </div>

                            <div className="hidden h-10 w-px bg-white/10 md:block" />

                            <div className="flex w-full flex-1 items-center gap-2 px-2 md:w-auto">
                                <Button
                                    variant="ghost"
                                    className="h-12 flex-1 justify-between rounded-xl px-4 text-zinc-300 hover:bg-white/5"
                                    onClick={() => updateFilter('type', filters.type === 'Casa' ? 'Departamento' : 'Casa')}
                                >
                                    <div className="flex items-center gap-2">
                                        <HomeIcon className="h-4 w-4 text-blue-400" />
                                        <span>{filters.type || "Tipo"}</span>
                                    </div>
                                    <ChevronDown className="h-4 w-4 opacity-50" />
                                </Button>

                                <Button
                                    variant="ghost"
                                    className="h-12 flex-1 justify-between rounded-xl px-4 text-zinc-300 hover:bg-white/5"
                                    onClick={() => updateFilter('priceRange', filters.priceRange === '3M - 5M' ? '5M - 10M' : '3M - 5M')}
                                >
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="h-4 w-4 text-blue-400" />
                                        <span>{filters.priceRange || "Precio"}</span>
                                    </div>
                                    <ChevronDown className="h-4 w-4 opacity-50" />
                                </Button>
                            </div>

                            <Button
                                className="h-14 w-full rounded-2xl bg-blue-600 px-8 font-bold text-white transition-all hover:bg-blue-500 hover:scale-[1.02] active:scale-95 md:w-auto shadow-lg shadow-blue-600/20"
                                onClick={handleSearch}
                            >
                                <Search className="mr-2 h-5 w-5" />
                                Buscar
                            </Button>
                        </div>

                        <div className="mt-6 flex flex-wrap justify-center gap-3">
                            <span className="text-sm font-medium text-zinc-500">Búsquedas populares:</span>
                            {["San Pedro", "Cumbres", "Carretera Nacional"].map((city) => (
                                <button
                                    key={city}
                                    className="rounded-full bg-zinc-900/50 px-4 py-1.5 text-xs font-semibold text-zinc-300 transition-all hover:bg-zinc-800 hover:text-white border border-white/5"
                                    onClick={() => {
                                        setLocalLocation(city)
                                        handleSearch()
                                    }}
                                >
                                    {city}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce cursor-pointer p-2" onClick={() => {
                const results = document.getElementById('propiedades-destacadas')
                if (results) results.scrollIntoView({ behavior: 'smooth' })
            }}>
                <ChevronDown className="h-6 w-6 text-zinc-500" />
            </div>
        </section>
    )
}
