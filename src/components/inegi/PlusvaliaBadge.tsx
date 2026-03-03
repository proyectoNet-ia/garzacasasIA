'use client'

import { useEffect, useState } from 'react'
import { Badge } from "@/components/ui/badge"
import { TrendingUp, ArrowUpRight, ShieldCheck, Timer } from "lucide-react"
import { ScrollReveal } from "@/components/ui/ScrollReveal"
import type { PrecioZona } from "@/lib/inegi/tipos"

interface Props {
    municipio?: string
    tipo?: 'casa' | 'departamento'
}

export function PlusvaliaBadge({ municipio = 'Morelia', tipo = 'casa' }: Props) {
    const [dato, setDato] = useState<PrecioZona | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchPlusvalia() {
            try {
                const res = await fetch(`/api/inegi/plusvalia?municipio=${municipio}`)
                const data = await res.json()
                const filtered = data.find((d: PrecioZona) => d.tipo === tipo)
                setDato(filtered || data[0])
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchPlusvalia()
    }, [municipio, tipo])

    if (loading || !dato) return null

    // Lógica de semáforo
    const getStatus = (val: number) => {
        if (val > 10) return { label: 'Plusvalía Alta', color: 'bg-emerald-500', text: 'text-emerald-500', border: 'border-emerald-500/20' }
        if (val > 5) return { label: 'Plusvalía Estable', color: 'bg-blue-500', text: 'text-blue-500', border: 'border-blue-500/20' }
        return { label: 'Zona en Crecimiento', color: 'bg-amber-500', text: 'text-amber-500', border: 'border-amber-500/20' }
    }

    const status = getStatus(dato.variacion_anual)

    return (
        <ScrollReveal className="bg-zinc-950 rounded-[2.5rem] p-8 border border-white/10 relative overflow-hidden group">
            {/* Decoración */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 transition-all group-hover:bg-blue-600/20" />

            <div className="relative space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <TrendingUp className={`h-5 w-5 ${status.text}`} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Análisis de Mercado</span>
                    </div>
                    <Badge variant="outline" className={`${status.border} bg-white/5 ${status.text} rounded-full px-3 py-0.5 uppercase tracking-widest text-[9px] font-bold`}>
                        {dato.fuente}
                    </Badge>
                </div>

                <div className="space-y-1">
                    <h4 className="text-3xl font-black text-white tracking-tighter flex items-baseline gap-2">
                        +{dato.variacion_anual}%
                        <span className="text-xs font-bold text-zinc-500 tracking-normal">anual</span>
                    </h4>
                    <p className="text-sm font-medium text-zinc-400">Crecimiento estimado en {dato.municipio}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/5">
                    <div className="space-y-1">
                        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Precio m² Promedio</p>
                        <p className="text-xl font-bold text-white">${dato.precio_m2.toLocaleString()} MXN</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Estado de Zona</p>
                        <div className="flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full ${status.color} animate-pulse`} />
                            <p className={`text-xs font-bold ${status.text}`}>{status.label}</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/5">
                    <ShieldCheck className="h-4 w-4 text-blue-400" />
                    <p className="text-[10px] font-medium text-zinc-400">
                        Inversión segura: Datos liquidados al periodo {dato.periodo}.
                    </p>
                </div>
            </div>
        </ScrollReveal>
    )
}
