'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, BedDouble, Bath, Square, ArrowRight, Zap, Crown, User, Eye, SearchX, Loader2 } from "lucide-react"
import Link from "next/link"
import { PropertyCardInteractions } from "./PropertyCardInteractions"
import { useSearch } from "@/providers/SearchProvider"
import { createClient } from "@/lib/supabase-client"
import { PropertyGridSkeleton } from "./PropertySkeletons"
import { trackPropertyInteraction } from "@/lib/analytics"

export interface FeaturedPropertiesProps {
    limit?: number;
    randomize?: boolean;
}

const ITEMS_PER_PAGE = 6

export function FeaturedProperties({ limit, randomize = false }: FeaturedPropertiesProps) {
    const { filters } = useSearch()
    const [properties, setProperties] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [page, setPage] = useState(0)
    const [hasMore, setHasMore] = useState(true)
    // Use state initializer to create stable client instance once
    const [supabase] = useState(() => createClient())
    const observer = useRef<IntersectionObserver | null>(null)

    // Load state reference for the intersection observer callback
    const loadingRef = useRef(false)
    const hasMoreRef = useRef(true)
    const pageRef = useRef(0)

    useEffect(() => {
        loadingRef.current = loading || loadingMore
        hasMoreRef.current = hasMore
        pageRef.current = page
    }, [loading, loadingMore, hasMore, page])

    const fetchProperties = useCallback(async (isInitial = false) => {
        // Usar refs para evitar recreación constante de la función y romper ciclo de renderizado
        if (!isInitial && (!hasMoreRef.current || loadingRef.current)) return

        if (isInitial) {
            setLoading(true)
            setPage(0)
            // Sincronizar refs manualmente para asegurar estado consistente
            hasMoreRef.current = true
            loadingRef.current = true
        } else {
            setLoadingMore(true)
            loadingRef.current = true
        }

        const start = isInitial ? 0 : (pageRef.current + 1) * ITEMS_PER_PAGE
        const end = start + (limit ? limit : ITEMS_PER_PAGE) - 1

        try {
            let query = supabase
                .from('properties')
                .select(`
                    *,
                    agent:profiles(full_name, avatar_url, phone, whatsapp, company_name)
                `)
                .eq('status', 'active')

            // Apply DB level filters if present
            if (filters.location) {
                query = query.ilike('location', `%${filters.location}%`)
            }
            if (filters.type) {
                query = query.eq('property_type', filters.type)
            }

            // Price filters
            if (filters.priceRange === '0-5M') {
                query = query.lte('price', 5000000)
            } else if (filters.priceRange === '5-15M') {
                query = query.gt('price', 5000000).lte('price', 15000000)
            } else if (filters.priceRange === '15M+') {
                query = query.gt('price', 15000000)
            }

            // Ordering
            query = query
                .order('priority_tier', { ascending: false })
                .order('created_at', { ascending: false })
                .range(start, end)

            const { data, error } = await query

            if (error) throw error

            const newData = data || []

            if (randomize && isInitial) {
                // Keep the randomization logic for home page / featured sections
                const tieredGroups: { [key: number]: any[] } = {}
                newData.forEach((p: any) => {
                    const tier = p.priority_tier || 0
                    if (!tieredGroups[tier]) tieredGroups[tier] = []
                    tieredGroups[tier].push(p)
                })

                let randomizedList: any[] = []
                const tiers = Object.keys(tieredGroups).map(Number).sort((a, b) => b - a)
                tiers.forEach(tier => {
                    const shuffled = [...tieredGroups[tier]].sort(() => Math.random() - 0.5)
                    randomizedList = [...randomizedList, ...shuffled]
                })
                setProperties(randomizedList)
                setHasMore(false) // No pagination if randomized/limited
            } else {
                setProperties(prev => isInitial ? newData : [...prev, ...newData])
                setHasMore(newData.length >= ITEMS_PER_PAGE && !limit)
                if (!isInitial) setPage(prev => prev + 1)
            }
        } catch (error) {
            console.error('Error fetching properties:', error)
        } finally {
            setLoading(false)
            setLoadingMore(false)
            loadingRef.current = false
        }
    }, [filters, limit, randomize, supabase])

    // Reset and fetch when filters change
    useEffect(() => {
        fetchProperties(true)
    }, [filters.location, filters.type, filters.priceRange])

    // Intersection Observer for infinite scroll
    const lastElementRef = useCallback((node: any) => {
        if (loadingRef.current || limit) return
        if (observer.current) observer.current.disconnect()

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMoreRef.current) {
                fetchProperties(false)
            }
        })

        if (node) observer.current.observe(node)
    }, [limit, fetchProperties])

    const displayProperties = properties

    return (
        <section id="propiedades-destacadas" className="py-24 bg-white relative overflow-hidden transition-colors duration-300">
            {/* Ambient Background Decor */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/5 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-zinc-200 blur-[100px] rounded-full -translate-x-1/2 translate-y-1/2" />

            <div className="container mx-auto px-4 md:px-6 relative">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
                    <div className="space-y-4 max-w-2xl text-left">
                        <Badge variant="outline" className="border-blue-500/20 bg-blue-500/5 text-blue-600 rounded-full px-4 py-1 uppercase tracking-widest text-[10px] font-bold">
                            Catálogo Premium
                        </Badge>
                        <h2 className="text-4xl font-black tracking-tighter text-zinc-700 sm:text-7xl font-heading leading-[0.9] transition-colors">
                            Propiedades <span className="text-blue-500 italic block sm:inline">Destacadas</span>
                        </h2>
                        <p className="text-zinc-600 text-lg md:text-xl font-medium leading-relaxed transition-colors">
                            Residencias seleccionadas bajo los más altos estándares de calidad, ubicación y diseño arquitectónico.
                        </p>
                    </div>
                    {(filters.location || filters.type || filters.priceRange) && (
                        <Button onClick={() => window.location.reload()} variant="ghost" className="text-blue-600 font-bold hover:bg-blue-50">
                            Limpiar Filtros
                        </Button>
                    )}
                </div>

                {loading ? (
                    <PropertyGridSkeleton count={limit || 6} />
                ) : displayProperties.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            {displayProperties.map((property, index) => {
                                const features = property.features as any || {}
                                const agent = property.agent as any || {}
                                const isLast = index === displayProperties.length - 1

                                return (
                                    <div
                                        key={property.id}
                                        ref={isLast ? lastElementRef : null}
                                        className="group relative flex flex-col rounded-[3rem] bg-white border border-black/5 overflow-hidden transition-all duration-700 hover:-translate-y-4 hover:shadow-[0_45px_100px_-20px_rgba(0,0,0,0.1)] hover:border-black/10 shadow-sm"
                                    >
                                        {/* Media Section */}
                                        <div className="relative aspect-[4/3] w-full overflow-hidden">
                                            <img
                                                src={property.main_image_url || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800"}
                                                alt={property.title}
                                                className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                            />

                                            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-80" />

                                            {/* Action Bar */}
                                            <div className="absolute top-6 left-6 right-6 flex justify-between items-start">
                                                <div className="flex flex-col gap-2">
                                                    <Badge className="w-fit bg-white/40 backdrop-blur-xl text-zinc-700 border border-black/10 rounded-full px-4 py-1.5 font-bold text-[10px] uppercase tracking-widest">
                                                        {property.property_type}
                                                    </Badge>
                                                    {property.priority_tier === 3 && (
                                                        <Badge className="bg-amber-500 text-zinc-700 border-none rounded-full px-4 py-1.5 flex items-center gap-2 font-black shadow-2xl shadow-amber-500/50 text-[10px] tracking-widest">
                                                            <Crown className="h-3 w-3 fill-black" />
                                                            PLATINO
                                                        </Badge>
                                                    )}
                                                    {property.priority_tier === 2 && (
                                                        <Badge className="bg-blue-600 text-white border-none rounded-full px-4 py-1.5 flex items-center gap-2 font-black shadow-2xl shadow-blue-600/50 text-[10px] tracking-widest">
                                                            <Zap className="h-3 w-3 fill-white" />
                                                            PRO
                                                        </Badge>
                                                    )}
                                                </div>
                                                <PropertyCardInteractions property={property} variant="like" />
                                            </div>
                                        </div>

                                        {/* Content Section */}
                                        <div className="p-10 space-y-10">
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-2 text-blue-600 text-[9px] font-medium uppercase tracking-[0.2em]">
                                                    <MapPin className="h-3 w-3" />
                                                    {property.location}
                                                </div>
                                                <div className="space-y-1">
                                                    <h3 className="text-xl font-semibold text-zinc-700 leading-tight lg:group-hover:text-blue-600 transition-colors duration-500 line-clamp-2">
                                                        {property.title}
                                                    </h3>
                                                    <div className="flex items-baseline gap-1 text-zinc-400">
                                                        <span className="text-xs font-normal">$</span>
                                                        <span className="text-2xl font-normal">
                                                            {property.price.toLocaleString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Features */}
                                            <div className="grid grid-cols-3 gap-6 py-8 border-y border-black/5 relative bg-black/[0.02] rounded-3xl">
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="p-4 rounded-2xl bg-black/5 text-blue-600 ring-1 ring-black/5 group-hover:ring-blue-500/30 transition-all duration-500">
                                                        < BedDouble className="h-7 w-7" />
                                                    </div>
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-xl font-medium text-zinc-700">{features.beds || 3}</span>
                                                        <span className="text-[9px] font-medium text-zinc-500 tracking-[0.2em] uppercase">Camas</span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-center gap-3 border-x border-black/5">
                                                    <div className="p-4 rounded-2xl bg-black/5 text-blue-600 ring-1 ring-black/5 group-hover:ring-blue-500/30 transition-all duration-500">
                                                        <Bath className="h-7 w-7" />
                                                    </div>
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-xl font-medium text-zinc-700">{features.baths || 2}</span>
                                                        <span className="text-[9px] font-medium text-zinc-500 tracking-[0.2em] uppercase">Baños</span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="p-4 rounded-2xl bg-black/5 text-blue-600 ring-1 ring-black/5 group-hover:ring-blue-500/30 transition-all duration-500">
                                                        <Square className="h-7 w-7" />
                                                    </div>
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-xl font-medium text-zinc-700">{features.sqft || 250}</span>
                                                        <span className="text-[9px] font-medium text-zinc-500 tracking-[0.2em] uppercase">M² Totales</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Footer Section: Agent and Actions */}
                                            <div className="flex items-center justify-between gap-6 pt-2">
                                                <div className="flex items-center gap-4 group/agent">
                                                    <div className="relative h-14 w-14 rounded-full p-1 border border-black/10 bg-zinc-100 shrink-0 overflow-hidden group-hover/agent:border-blue-500/50 transition-all duration-500">
                                                        {agent?.avatar_url ? (
                                                            <img src={agent.avatar_url} alt={agent.full_name} className="h-full w-full object-cover rounded-full" />
                                                        ) : (
                                                            <div className="h-full w-full flex items-center justify-center bg-zinc-100 rounded-full">
                                                                <User className="h-7 w-7 text-zinc-400" />
                                                            </div>
                                                        )}
                                                        <div className="absolute bottom-1 right-1 h-3.5 w-3.5 bg-green-500 border-2 border-white rounded-full ring-2 ring-black/5 shadow-xl" title="Disponible" />
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="text-[8px] font-medium text-zinc-500 uppercase tracking-widest truncate">
                                                            {agent?.company_name || 'Agente Independiente'}
                                                        </span>
                                                        <span className="text-sm font-bold text-zinc-700 truncate lg:group-hover/agent:text-blue-600 transition-colors">
                                                            {agent?.full_name || 'Consultor'}
                                                        </span>
                                                        {(agent?.whatsapp || agent?.phone) && (
                                                            <a
                                                                href={`https://wa.me/${(agent?.whatsapp || agent?.phone).replace(/\D/g, '')}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                onClick={() => trackPropertyInteraction(property.id, property.agent_id, 'whatsapp_click')}
                                                                className="text-[10px] text-green-600 font-bold hover:underline flex items-center gap-1 mt-0.5"
                                                            >
                                                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                                                Contactar
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex gap-3">
                                                    <PropertyCardInteractions property={property} variant="compare" />
                                                    <Link href={`/propiedades/${property.id}`} className="block">
                                                        <Button
                                                            size="icon"
                                                            className="h-14 w-14 rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-600/20 transition-all duration-300 hover:scale-110 active:scale-90 hover:bg-blue-500 hover:shadow-[0_0_25px_-5px_rgba(59,130,246,0.6)] border-none"
                                                            title="Ver detalles"
                                                        >
                                                            <Eye className="h-6 w-6 transition-transform duration-300" />
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Infinite Scroll Loader */}
                        {loadingMore && (
                            <div className="mt-16 flex justify-center">
                                <div className="flex items-center gap-3 bg-white/80 backdrop-blur-md px-6 py-3 rounded-full border border-black/5 shadow-lg">
                                    <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                                    <span className="text-sm font-bold text-zinc-600 uppercase tracking-widest">Cargando más propiedades...</span>
                                </div>
                            </div>
                        )}

                        {!hasMore && properties.length > 0 && !limit && (
                            <div className="mt-20 text-center">
                                <p className="text-zinc-400 text-sm font-medium uppercase tracking-[0.2em]">Has llegado al final del catálogo</p>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="py-20 text-center space-y-4">
                        <div className="h-20 w-20 bg-zinc-100 rounded-full flex items-center justify-center mx-auto text-zinc-400">
                            <SearchX className="h-10 w-10" />
                        </div>
                        <h3 className="text-2xl font-bold text-zinc-700">No encontramos lo que buscas</h3>
                        <p className="text-zinc-500">Intenta ajustar los filtros para encontrar más opciones.</p>
                        <Button onClick={() => window.location.reload()} variant="outline" className="rounded-full px-8">
                            Ver todo el catálogo
                        </Button>
                    </div>
                )}
            </div>
        </section>
    )
}
