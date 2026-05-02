'use client'

import React, { useEffect, useState } from 'react'
import {
    School,
    Hospital,
    Building2,
    ShoppingCart,
    Utensils,
    Fuel,
    Dumbbell,
    MapPin,
    Loader2,
    Info
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ServiciosCercanos as ServiciosCercanosType } from '@/lib/inegi/tipos'

interface Props {
    lat: number
    lng: number
    radio?: number
    className?: string
}

export function ServiciosCercanos({ lat, lng, radio = 1000, className }: Props) {
    const [data, setData] = useState<ServiciosCercanosType | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchServicios() {
            try {
                setLoading(true)
                const res = await fetch(`/api/inegi/servicios?lat=${lat}&lng=${lng}&radio=${radio}`)
                const json = await res.json()

                if (!res.ok || json.error) {
                    throw new Error(json.details || json.error || 'Error al cargar servicios')
                }

                setData(json)
            } catch (err: any) {
                console.error('Error fetching services:', err)
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        if (lat && lng) {
            fetchServicios()
        }
    }, [lat, lng, radio])

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-zinc-50 rounded-2xl border border-zinc-100 animate-pulse">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin mb-3" />
                <p className="text-sm font-medium text-zinc-500">Analizando entorno con datos INEGI...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-6 bg-red-50 border border-red-100 rounded-2xl">
                <div className="flex items-center gap-3 text-red-700 mb-2">
                    <Info className="h-5 w-5" />
                    <span className="font-bold">Servicio temporalmente no disponible</span>
                </div>
                <p className="text-xs text-red-600 leading-relaxed">
                    {error.includes('Token')
                        ? 'Falta configurar el Token del INEGI. Los datos se mostrarán una vez activada la API.'
                        : 'Hubo un problema al conectar con el servidor del INEGI. Por favor, intenta más tarde.'}
                </p>
                <p className="mt-2 text-[8px] text-red-400 opacity-50 font-mono">
                    Debug: {error}
                </p>
            </div>
        )
    }

    if (!data) return null

    const items = [
        { label: 'Escuelas', value: data.escuelas, icon: School, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Hospitales', value: data.hospitales, icon: Hospital, color: 'text-red-600', bg: 'bg-red-50' },
        { label: 'Bancos', value: data.bancos, icon: Building2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Súper', value: data.supermercados, icon: ShoppingCart, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Gimnasios', value: data.gimnasios, icon: Dumbbell, color: 'text-purple-600', bg: 'bg-indigo-50' },
        { label: 'Restaurantes', value: data.restaurantes, icon: Utensils, color: 'text-orange-600', bg: 'bg-orange-50' },
    ].filter(item => item.value > 0)

    if (items.length === 0) {
        return (
            <div className="p-6 bg-amber-50 border border-amber-100 rounded-2xl text-center">
                <p className="text-sm font-medium text-amber-900">Zona exclusivamente residencial</p>
                <p className="text-xs text-amber-700 mt-1">No se detectan comercios o servicios en un radio de {radio}m.</p>
            </div>
        )
    }

    return (
        <div className={cn("space-y-6", className)}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-zinc-900">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    <h3 className="font-bold text-lg tracking-tight">Servicios en la Zona</h3>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-100 rounded-full border border-zinc-200">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                    </span>
                    <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">INEGI 2026</span>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {items.map((item) => (
                    <div
                        key={item.label}
                        className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white border border-zinc-100 shadow-sm hover:shadow-md transition-shadow group"
                    >
                        <div className={cn("p-3 rounded-xl mb-3 group-hover:scale-110 transition-transform", item.bg, item.color)}>
                            <item.icon className="h-5 w-5" />
                        </div>
                        <span className="text-2xl font-black text-zinc-900 leading-none">{item.value}</span>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase mt-1 tracking-wider">{item.label}</span>
                    </div>
                ))}
            </div>

            <p className="text-[10px] text-zinc-400 font-medium italic">
                * Análisis basado en un radio de {radio}m alrededor de la propiedad. Fuente: DENUE (Directorio Nacional de Unidades Económicas).
            </p>
        </div>
    )
}
