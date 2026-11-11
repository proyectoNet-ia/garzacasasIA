'use client'

import { MapPin, TrendingUp, Home, ArrowUpRight, Zap, Loader2 } from 'lucide-react'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { useSearch } from '@/providers/SearchProvider'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase-client'
import { useState, useEffect } from 'react'

export function ZoneExplorer() {
    const { updateFilter } = useSearch()
    const [zones, setZones] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchZones() {
            const supabase = createClient()

            // Consultar propiedades activas para calcular el conteo real
            let propertyLocations: string[] = []
            try {
                const { data: propData } = await supabase
                    .from('properties')
                    .select('location')
                    .eq('status', 'active')
                if (propData) {
                    propertyLocations = propData.map((p: any) => (p.location || '').toLowerCase())
                }
            } catch (err) {
                console.error('Error fetching property counts:', err)
            }

            const baseZones = [
                {
                    id: 'cdmx',
                    name: 'Ciudad de México',
                    searchKey: 'Ciudad de México',
                    appreciation: '+8.9%', // Oficial SHF / INEGI
                    image_url: '/images/zones/cdmx.jpg',
                    description: 'Epicentro financiero, cultural y de alta demanda residencial en el país.',
                    tag: 'ALTA DEMANDA'
                },
                {
                    id: 'monterrey',
                    name: 'Monterrey',
                    searchKey: 'Monterrey',
                    appreciation: '+11.2%', // Oficial SHF / INEGI
                    image_url: '/images/zones/monterrey.jpg',
                    description: 'Potencia industrial, corporativa y de inversión inmobiliaria del norte.',
                    tag: 'ALTA DEMANDA'
                },
                {
                    id: 'guadalajara',
                    name: 'Guadalajara',
                    searchKey: 'Guadalajara',
                    appreciation: '+10.5%', // Oficial SHF / INEGI
                    image_url: '/images/zones/guadalajara.jpg',
                    description: 'Hub tecnológico e innovación con gran dinamismo en el occidente.',
                    tag: 'ZONA DESTACADA'
                },
                {
                    id: 'queretaro',
                    name: 'Querétaro',
                    searchKey: 'Querétaro',
                    appreciation: '+10.1%', // Oficial SHF / INEGI
                    image_url: '/images/zones/queretaro.jpg',
                    description: 'Crecimiento industrial estratégico y calidad de vida superior en el Bajío.',
                    tag: 'ALTA DEMANDA'
                },
                {
                    id: 'riviera-maya',
                    name: 'Riviera Maya',
                    searchKey: 'Riviera Maya',
                    appreciation: '+12.8%', // Oficial SHF / INEGI
                    image_url: '/images/zones/riviera-maya.jpg',
                    description: 'Destino turístico internacional de alta plusvalía y rentabilidad vacacional.',
                    tag: 'ZONA TURÍSTICA'
                }
            ]

            const enrichedZones = baseZones.map((zone) => {
                const count = propertyLocations.filter((loc) =>
                    loc.includes(zone.searchKey.toLowerCase()) || loc.includes(zone.name.toLowerCase())
                ).length
                return {
                    ...zone,
                    real_count: count
                }
            })

            setZones(enrichedZones)
            setLoading(false)
        }
        fetchZones()
    }, [])

    const handleZoneSelect = (location: string) => {
        updateFilter('location', location)
        const section = document.getElementById('propiedades-destacadas')
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' })
        }
    }

    return (
        <section className="py-24 bg-zinc-50 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-zinc-200 to-transparent" />

            <div className="container mx-auto px-4 md:px-6">
                <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-4">
                    <ScrollReveal className="space-y-4 max-w-2xl text-left">
                        <div className="inline-flex items-center gap-2 rounded-full bg-blue-600/10 px-4 py-1 text-[10px] font-black uppercase tracking-widest text-blue-600 border border-blue-600/10">
                            Plusvalía Oficial SHF / INEGI
                        </div>
                        <h2 className="text-4xl font-black tracking-tighter text-zinc-900 sm:text-6xl font-heading leading-tight uppercase">
                            Explora las <span className="text-blue-600 italic">Zonas Top</span>
                        </h2>
                        <p className="text-zinc-500 text-lg font-medium leading-relaxed">
                            Analizamos el mercado inmobiliario para mostrarte las áreas con mayor crecimiento y plusvalía en toda la República Mexicana.
                        </p>
                    </ScrollReveal>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-5">
                    {zones.map((zone, index) => (
                        <ScrollReveal
                            key={zone.id}
                            delay={index * 0.08}
                            className="h-full"
                        >
                            <button
                                onClick={() => handleZoneSelect(zone.name)}
                                className="group relative w-full h-[480px] rounded-[2rem] overflow-hidden bg-white border border-black/5 shadow-sm transition-all duration-700 hover:-translate-y-2 hover:shadow-2xl hover:border-blue-500/20"
                            >
                                <img
                                    src={zone.image_url}
                                    alt={zone.name}
                                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent transition-opacity duration-700 group-hover:opacity-90" />

                                <div className="absolute top-5 left-5 flex flex-col gap-1.5 z-20">
                                    <div className="bg-zinc-950/60 backdrop-blur-md border border-white/20 px-2.5 py-1 rounded-full flex items-center gap-1.5 text-white shadow-lg">
                                        <TrendingUp className="h-3 w-3 text-emerald-400" />
                                        <span className="text-[9px] font-black uppercase tracking-wider">{zone.appreciation} SHF</span>
                                    </div>
                                    {zone.tag && (
                                        <div className="bg-blue-600/90 backdrop-blur-md border border-blue-400/30 px-2.5 py-1 rounded-full flex items-center gap-1.5 text-white shadow-lg">
                                            <Zap className="h-3 w-3 fill-white" />
                                            <span className="text-[9px] font-black uppercase tracking-wider">{zone.tag}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="absolute bottom-8 left-5 right-5 z-20 space-y-2.5 text-left">
                                    <h4 className="text-xl xl:text-2xl font-black text-white tracking-tighter uppercase leading-none">
                                        {zone.name}
                                    </h4>
                                    <p className="text-zinc-300 text-xs font-medium leading-relaxed opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-3 group-hover:translate-y-0 line-clamp-2">
                                        {zone.description}
                                    </p>

                                    <div className="flex items-center justify-between pt-3 border-t border-white/10 mt-3 opacity-0 group-hover:opacity-100 transition-all duration-700">
                                        <div className="flex items-center gap-1.5 text-white">
                                            <Home className="h-3.5 w-3.5 text-blue-400" />
                                            <span className="text-[10px] font-black uppercase tracking-wider">
                                                {zone.real_count > 0 
                                                    ? `${zone.real_count} ${zone.real_count === 1 ? 'Propiedad' : 'Propiedades'}` 
                                                    : 'Ver Catálogo'}
                                            </span>
                                        </div>
                                        <div className="h-9 w-9 rounded-full bg-blue-600 text-white flex items-center justify-center transition-transform group-hover:scale-110">
                                            <ArrowUpRight className="h-4 w-4" />
                                        </div>
                                    </div>
                                </div>
                            </button>
                        </ScrollReveal>
                    ))}
                </div>
            </div>
        </section>
    )
}
