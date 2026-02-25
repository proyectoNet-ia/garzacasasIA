'use client'

import React from 'react'
import { Dog, Mountain, Cpu, Sparkles, Building2, Trees } from 'lucide-react'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { useSearch } from '@/providers/SearchProvider'
import { cn } from '@/lib/utils'

const lifestyles = [
    {
        id: 'smart-homes',
        title: 'Smart Homes',
        subtitle: 'Domótica e IA',
        icon: Cpu,
        query: 'Tecnología',
        color: 'from-blue-600 to-indigo-600'
    },
    {
        id: 'pet-friendly',
        title: 'Pet Friendly',
        subtitle: 'Espacios abiertos',
        icon: Dog,
        query: 'Jardín',
        color: 'from-emerald-500 to-teal-600'
    },
    {
        id: 'mountain-views',
        title: 'Vistas a la Sierra',
        subtitle: 'Panorámicas únicas',
        icon: Mountain,
        query: 'Montaña',
        color: 'from-orange-500 to-red-600'
    },
    {
        id: 'minimalist',
        title: 'Minimalismo Urbano',
        subtitle: 'Diseño y sobriedad',
        icon: Building2,
        query: 'Minimalista',
        color: 'from-zinc-700 to-black'
    },
    {
        id: 'nature',
        title: 'Conexión Natural',
        subtitle: 'Rodeado de bosque',
        icon: Trees,
        query: 'Bosque',
        color: 'from-green-600 to-emerald-700'
    },
    {
        id: 'luxury',
        title: 'Lujo Premium',
        subtitle: 'Altos estándares',
        icon: Sparkles,
        query: 'Lujo',
        color: 'from-amber-400 to-orange-500'
    }
]

export function LifestyleNavigator() {
    const { updateFilter } = useSearch()

    const handleSelect = (query: string) => {
        updateFilter('location', query) // O un filtro de keywords si existiera
        const section = document.getElementById('propiedades-destacadas')
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' })
        }
    }

    return (
        <section className="py-20 bg-white overflow-hidden">
            <div className="container mx-auto px-4 md:px-6">
                <ScrollReveal className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
                    <h2 className="text-3xl font-black tracking-tighter text-zinc-900 sm:text-5xl font-heading uppercase">
                        Encuentra por <span className="text-blue-600 italic">Estilo de Vida</span>
                    </h2>
                    <p className="max-w-[700px] text-zinc-500 font-medium">
                        ¿Buscas algo específico? Filtra rápidamente por el ambiente que mejor conecta contigo.
                    </p>
                </ScrollReveal>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                    {lifestyles.map((item, index) => (
                        <ScrollReveal
                            key={item.id}
                            delay={index * 0.1}
                            className="h-full"
                        >
                            <button
                                onClick={() => handleSelect(item.query)}
                                className="group relative w-full aspect-square rounded-[2rem] overflow-hidden bg-zinc-50 border border-zinc-100 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:border-blue-200"
                            >
                                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-white to-transparent z-10" />

                                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 z-20 transition-transform duration-500 group-hover:-translate-y-2">
                                    <div className={cn(
                                        "h-16 w-16 rounded-2xl flex items-center justify-center bg-gradient-to-br shadow-lg mb-4 text-white transition-all duration-500 group-hover:rotate-6",
                                        item.color
                                    )}>
                                        <item.icon className="h-8 w-8" />
                                    </div>
                                    <div className="text-center">
                                        <h4 className="text-sm font-black text-zinc-900 line-clamp-1">{item.title}</h4>
                                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                            {item.subtitle}
                                        </p>
                                    </div>
                                </div>

                                <div className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-[0.03] transition-opacity" />
                            </button>
                        </ScrollReveal>
                    ))}
                </div>
            </div>
        </section>
    )
}
