'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, BedDouble, Bath, Square, ArrowRight, Zap, Crown, User, Eye, SearchX, Loader2, LayoutGrid, List, Share2 } from "lucide-react"
import Link from "next/link"
import { PropertyCardInteractions } from "./PropertyCardInteractions"
import { useSearch } from "@/providers/SearchProvider"
import { createClient } from "@/lib/supabase-client"
import { PropertyGridSkeleton } from "./PropertySkeletons"
import { trackPropertyInteraction } from "@/lib/analytics"

export interface FeaturedPropertiesProps {
    limit?: number;
    randomize?: boolean;
    sidebarLayout?: boolean;
}

const ITEMS_PER_PAGE = 6

export function FeaturedProperties({ limit, randomize = false, sidebarLayout = false }: FeaturedPropertiesProps) {
    const { filters, clearFilters } = useSearch()
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
        if (!isInitial && (!hasMoreRef.current || loadingRef.current)) return

        if (isInitial) {
            setLoading(true)
            setPage(0)
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

            // Apply DB level filters
            if (filters.location) query = query.ilike('location', `%${filters.location}%`)
            if (filters.type) query = query.eq('property_type', filters.type)

            // Price filters
            if (filters.minPrice && !isNaN(Number(filters.minPrice))) {
                query = query.gte('price', filters.minPrice)
            }
            if (filters.maxPrice && !isNaN(Number(filters.maxPrice))) {
                query = query.lte('price', filters.maxPrice)
            }

            // Legacy Price Range Support
            if (!filters.minPrice && !filters.maxPrice && filters.priceRange) {
                if (filters.priceRange === '0-5M') query = query.lte('price', 5000000)
                else if (filters.priceRange === '5-15M') query = query.gt('price', 5000000).lte('price', 15000000)
                else if (filters.priceRange === '15M+') query = query.gt('price', 15000000)
            }

            // Features filters
            if (filters.beds && !isNaN(Number(filters.beds))) {
                query = query.filter('features->>beds', 'gte', filters.beds)
            }
            if (filters.baths && !isNaN(Number(filters.baths))) {
                query = query.filter('features->>baths', 'gte', filters.baths)
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
                setHasMore(false)
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

    useEffect(() => {
        fetchProperties(true)
    }, [filters.location, filters.type, filters.priceRange, filters.minPrice, filters.maxPrice, filters.beds, filters.baths])

    const lastElementRef = useCallback((node: any) => {
        if (loadingRef.current || limit) return
        if (observer.current) observer.current.disconnect()
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMoreRef.current) fetchProperties(false)
        })
        if (node) observer.current.observe(node)
    }, [limit, fetchProperties])

    const displayProperties = properties

    return (
        <section id="propiedades-destacadas" className={`${sidebarLayout ? 'py-0 w-full bg-transparent' : 'py-24 bg-white'} relative ${sidebarLayout ? '' : 'overflow-hidden'} transition-colors duration-300`}>
            {!sidebarLayout && (
                <>
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/5 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-zinc-200 blur-[100px] rounded-full -translate-x-1/2 translate-y-1/2" />
                </>
            )}

            <div className={`${sidebarLayout ? '' : 'container mx-auto px-4 md:px-6'} relative`}>
                <div className={`flex flex-col md:flex-row md:items-end justify-between gap-8 ${sidebarLayout ? 'mb-8' : 'mb-20'}`}>
                    <div className="space-y-4 max-w-2xl text-left w-full flex items-center justify-between">
                        {!sidebarLayout ? (
                            <div>
                                <Badge variant="outline" className="border-blue-500/20 bg-blue-500/5 text-blue-600 rounded-full px-4 py-1 uppercase tracking-widest text-[10px] font-bold">
                                    Catálogo Premium
                                </Badge>
                                <h2 className="text-4xl font-black tracking-tighter text-zinc-700 sm:text-7xl font-heading leading-[0.9] transition-colors mt-4">
                                    Propiedades <span className="text-blue-500 italic block sm:inline">Destacadas</span>
                                </h2>
                                <p className="text-zinc-600 text-lg md:text-xl font-medium leading-relaxed transition-colors mt-4">
                                    Residencias seleccionadas bajo los más altos estándares de calidad, ubicación y diseño arquitectónico.
                                </p>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between w-full">
                                <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">
                                    Mostrando {displayProperties.length} {displayProperties.length === 1 ? 'propiedad' : 'propiedades'}
                                </p>
                            </div>
                        )}
                    </div>
                    {!sidebarLayout && (filters.location || filters.type || filters.priceRange || filters.minPrice || filters.maxPrice || filters.beds || filters.baths) && (
                        <Button onClick={clearFilters} variant="ghost" className="text-blue-600 font-bold hover:bg-blue-50">
                            Limpiar Filtros
                        </Button>
                    )}
                </div>

                {loading ? (
                    <PropertyGridSkeleton count={limit || 6} />
                ) : displayProperties.length > 0 ? (
                    <>
                        <div className="grid gap-8 grid-cols-1">
                            {displayProperties.map((property, index) => {
                                const features = property.features as any || {}
                                const agent = property.agent as any || {}
                                const isLast = index === displayProperties.length - 1

                                return (
                                    <div
                                        key={property.id}
                                        ref={isLast ? lastElementRef : null}
                                        className="group relative flex flex-col md:flex-row rounded-[2.5rem] bg-white border border-black/5 overflow-hidden transition-all duration-700 hover:-translate-y-2 hover:shadow-[0_45px_100px_-20px_rgba(0,0,0,0.1)] hover:border-black/10 shadow-sm"
                                    >
                                        {/* Media Section */}
                                        <div className="relative w-full aspect-[4/3] md:aspect-auto md:h-auto md:w-2/5 md:min-h-[240px] shrink-0 overflow-hidden">
                                            <img
                                                src={property.main_image_url || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800"}
                                                alt={property.title}
                                                className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />

                                            <div className="absolute top-6 left-6 right-6 flex justify-between items-start z-10">
                                                <div className="flex flex-col gap-2">
                                                    <Badge className="w-fit bg-white/90 backdrop-blur-md text-zinc-900 border-none rounded-full px-4 py-1.5 font-bold text-[10px] uppercase tracking-widest shadow-lg">
                                                        {property.property_type}
                                                    </Badge>
                                                    {property.priority_tier === 3 && (
                                                        <Badge className="bg-amber-500 text-zinc-900 border-none rounded-full px-4 py-1.5 flex items-center gap-2 font-black shadow-lg shadow-amber-500/20 text-[10px] tracking-widest">
                                                            <Crown className="h-3 w-3" />
                                                            PLATINO
                                                        </Badge>
                                                    )}
                                                    {property.priority_tier === 2 && (
                                                        <Badge className="bg-blue-600 text-white border-none rounded-full px-4 py-1.5 flex items-center gap-2 font-black shadow-lg shadow-blue-600/20 text-[10px] tracking-widest">
                                                            <Zap className="h-3 w-3 fill-white" />
                                                            PRO
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        size="icon"
                                                        className="h-12 w-12 rounded-2xl backdrop-blur-xl border bg-white/40 text-zinc-700 border-black/10 transition-all duration-300 active:scale-90 hover:scale-110 hover:bg-blue-500/10 hover:text-blue-600 hover:border-blue-500/30 shadow-sm flex items-center justify-center group/share"
                                                    >
                                                        <Share2 className="h-6 w-6 transition-transform duration-300 group-hover/share:scale-110" />
                                                    </Button>
                                                    <PropertyCardInteractions property={property} variant="like" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Content Section */}
                                        <div className="flex flex-col justify-between p-6 md:w-3/5">
                                            <div className="space-y-6">
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-2 text-blue-600 text-[10px] font-bold uppercase tracking-widest">
                                                        <MapPin className="h-3 w-3" />
                                                        {property.location}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl font-bold text-zinc-800 leading-tight group-hover:text-blue-600 transition-colors duration-300 line-clamp-2 mb-2">
                                                            {property.title}
                                                        </h3>
                                                        <div className="flex items-baseline gap-1 text-zinc-800">
                                                            <span className="text-xs font-semibold text-zinc-400">$</span>
                                                            <span className="text-2xl font-black tracking-tight">
                                                                {property.price.toLocaleString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between md:justify-start md:gap-6 py-4 border-y border-zinc-100">
                                                    <div className="flex items-center gap-2">
                                                        <BedDouble className="h-4 w-4 text-zinc-400" />
                                                        <span className="text-sm font-bold text-zinc-700">{features.beds || 3} <span className="text-[10px] font-medium text-zinc-400 uppercase hidden sm:inline">Camas</span></span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Bath className="h-4 w-4 text-zinc-400" />
                                                        <span className="text-sm font-bold text-zinc-700">{features.baths || 2} <span className="text-[10px] font-medium text-zinc-400 uppercase hidden sm:inline">Baños</span></span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Square className="h-4 w-4 text-zinc-400" />
                                                        <span className="text-sm font-bold text-zinc-700">{features.sqft || 250} <span className="text-[10px] font-medium text-zinc-400 uppercase hidden sm:inline">m²</span></span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between pt-6 mt-auto">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-zinc-100 overflow-hidden ring-2 ring-white shadow-md">
                                                        {agent?.avatar_url ? (
                                                            <img src={agent.avatar_url} alt={agent.full_name} className="h-full w-full object-cover" />
                                                        ) : (
                                                            <div className="h-full w-full flex items-center justify-center bg-zinc-200">
                                                                <User className="h-5 w-5 text-zinc-400" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Agente</span>
                                                        <span className="text-xs font-bold text-zinc-700 truncate max-w-[100px]">
                                                            {agent?.full_name || 'Consultor'}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <PropertyCardInteractions property={property} variant="compare" />
                                                    <Link href={`/propiedades/${property.id}`}>
                                                        <Button
                                                            size="icon"
                                                            className="h-14 w-14 rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-600/20 transition-all duration-300 hover:scale-110 active:scale-90 hover:bg-blue-500 hover:shadow-[0_0_25px_-5px_rgba(59,130,246,0.6)] border-none flex items-center justify-center p-0"
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

                        {loadingMore && (
                            <div className="mt-16 flex justify-center">
                                <div className="flex items-center gap-3 bg-white/80 backdrop-blur-md px-6 py-3 rounded-full border border-black/5 shadow-lg">
                                    <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                                    <span className="text-sm font-bold text-zinc-600 uppercase tracking-widest">Cargando más...</span>
                                </div>
                            </div>
                        )}

                        {!hasMore && properties.length > 0 && !limit && (
                            <div className="mt-20 text-center">
                                <p className="text-zinc-400 text-sm font-medium uppercase tracking-[0.2em]">Has llegado al final</p>
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
                        <Button onClick={clearFilters} variant="outline" className="rounded-full px-8">
                            Ver todo el catálogo
                        </Button>
                    </div>
                )}
            </div>
        </section>
    )
}
