'use client'

import React, { useEffect, useState, useRef } from 'react'
import { Users, Home, TrendingUp, Zap, Building2, Globe } from 'lucide-react'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { cn } from '@/lib/utils'

const stats = [
    {
        id: 'propiedades',
        label: 'Propiedades Verificadas',
        value: 5240,
        suffix: '+',
        icon: Home,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50'
    },
    {
        id: 'agentes',
        label: 'Agentes Activos',
        value: 180,
        suffix: '+',
        icon: Users,
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-50'
    },
    {
        id: 'transacciones',
        label: 'Millones Gestionados',
        value: 350,
        prefix: '$',
        suffix: 'M',
        icon: TrendingUp,
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50'
    },
    {
        id: 'exactitud',
        label: 'Exactitud IA Valuación',
        value: 98,
        suffix: '%',
        icon: Zap,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50'
    }
]

function AnimatedNumber({ value, prefix = '', suffix = '' }: { value: number, prefix?: string, suffix?: string }) {
    const [displayValue, setDisplayValue] = useState(0)
    const [hasAnimated, setHasAnimated] = useState(false)
    const elementRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !hasAnimated) {
                setHasAnimated(true)
                let start = 0
                const end = value
                const duration = 2000
                const stepTime = Math.abs(Math.floor(duration / end))

                const timer = setInterval(() => {
                    start += Math.ceil(end / (duration / 16))
                    if (start >= end) {
                        setDisplayValue(end)
                        clearInterval(timer)
                    } else {
                        setDisplayValue(start)
                    }
                }, 16)
            }
        }, { threshold: 0.1 })

        if (elementRef.current) observer.observe(elementRef.current)
        return () => observer.disconnect()
    }, [value, hasAnimated])

    return (
        <div ref={elementRef} className="tabular-nums">
            {prefix}{displayValue.toLocaleString()}{suffix}
        </div>
    )
}

export function LiveStats() {
    return (
        <section className="py-24 bg-white relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-zinc-200 to-transparent" />

            <div className="container mx-auto px-4 md:px-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {stats.map((stat, index) => (
                        <ScrollReveal
                            key={stat.id}
                            delay={index * 0.1}
                            className="h-full"
                        >
                            <div className="group relative p-8 rounded-[2.5rem] bg-zinc-50 border border-zinc-100 transition-all duration-500 hover:bg-white hover:shadow-2xl hover:shadow-zinc-200/50 hover:-translate-y-2">
                                <div className={cn(
                                    "h-14 w-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3",
                                    stat.bgColor,
                                    stat.color
                                )}>
                                    <stat.icon className="h-7 w-7" />
                                </div>

                                <div className="space-y-1">
                                    <div className="text-4xl font-black tracking-tighter text-zinc-900 font-heading">
                                        <AnimatedNumber
                                            value={stat.value}
                                            prefix={stat.prefix}
                                            suffix={stat.suffix}
                                        />
                                    </div>
                                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-[0.2em]">
                                        {stat.label}
                                    </p>
                                </div>

                                {/* Subtle accent bar */}
                                <div className={cn(
                                    "absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-1 rounded-full transition-all duration-500 group-hover:w-1/3",
                                    stat.color.replace('text-', 'bg-')
                                )} />
                            </div>
                        </ScrollReveal>
                    ))}
                </div>

                {/* Bottom decorative quote or detail */}
                <ScrollReveal delay={0.5} className="mt-16 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="h-px w-24 bg-zinc-200" />
                    <p className="text-zinc-400 text-sm font-medium italic">
                        Datos procesados en tiempo real por el motor de inteligencia de Garza Casas.
                    </p>
                </ScrollReveal>
            </div>
        </section>
    )
}
