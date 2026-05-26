'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, BedDouble, Bath, Square, ArrowRight, Zap, Crown, User, Eye, SearchX, Loader2, LayoutGrid, List, Share2, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { PropertyCardInteractions } from "./PropertyCardInteractions"
import { useSearch } from "@/providers/SearchProvider"
import { createClient } from "@/lib/supabase-client"
import { PropertyGridSkeleton } from "./PropertySkeletons"
import { trackPropertyInteraction } from "@/lib/analytics"
import { cn } from "@/lib/utils"
import { ScrollReveal } from "@/components/ui/ScrollReveal"

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
    const [totalCount, setTotalCount] = useState(0)
    const [currentPageNum, setCurrentPageNum] = useState(1) // para paginación numerada
    const totalPages = sidebarLayout ? Math.ceil(totalCount / ITEMS_PER_PAGE) : 0


    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

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

    const fetchProperties = useCallback(async (isInitial = false, targetPage?: number) => {
        if (!isInitial && !sidebarLayout && (!hasMoreRef.current || loadingRef.current)) return

        if (isInitial) {
            setLoading(true)
            setPage(0)
            hasMoreRef.current = true
            loadingRef.current = true
        } else if (!sidebarLayout) {
            setLoadingMore(true)
            loadingRef.current = true
        } else {
            setLoading(true)
        }

        const pageIndex = targetPage !== undefined ? targetPage - 1 : isInitial ? 0 : (pageRef.current + 1)
        const start = pageIndex * ITEMS_PER_PAGE
        const end = start + (limit ? limit : ITEMS_PER_PAGE) - 1

        try {
            let query = supabase
                .from('properties')
                .select(`
                    *,
                    agent:profiles(full_name, avatar_url, phone, whatsapp, company_name)
                `, { count: 'exact' })
                .eq('status', 'active')

            // Apply DB level filters
            if (filters.location) query = query.ilike('location', `%${filters.location}%`)
            if (filters.type) query = query.eq('property_type', filters.type)
            if (filters.listing_type) query = query.eq('listing_type', filters.listing_type)

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

            const { data, error, count } = await query

            if (error) throw error

            if (count !== null && count !== undefined) setTotalCount(count)

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
                setProperties(prev => {
                    const combined = (isInitial || sidebarLayout) ? newData : [...prev, ...newData]
                    return Array.from(new Map(combined.map(item => [item.id, item])).values())
                })
                setHasMore(newData.length >= ITEMS_PER_PAGE && !limit && !sidebarLayout)
                if (!isInitial && !sidebarLayout) setPage(prev => prev + 1)
            }
        } catch (error) {
            console.error('Error fetching properties:', error)
        } finally {
            setLoading(false)
            setLoadingMore(false)
            loadingRef.current = false
        }
    }, [filters, limit, randomize, supabase, sidebarLayout])

    useEffect(() => {
        setCurrentPageNum(1)
        fetchProperties(true)
    }, [filters.location, filters.type, filters.listing_type, filters.priceRange, filters.minPrice, filters.maxPrice, filters.beds, filters.baths])

    const lastElementRef = useCallback((node: any) => {
        if (loadingRef.current || limit || sidebarLayout) return
        if (observer.current) observer.current.disconnect()
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMoreRef.current) fetchProperties(false)
        })
        if (node) observer.current.observe(node)
    }, [limit, fetchProperties, sidebarLayout])

    const goToPage = (p: number) => {
        setCurrentPageNum(p)
        fetchProperties(false, p)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const displayProperties = properties

    return (
        <section id="propiedades-destacadas" className={cn(
            sidebarLayout ? 'py-0 w-full bg-transparent' : 'py-24 bg-white shadow-[0_-50px_100px_-20px_rgba(0,0,0,0.3)] -mt-20 rounded-t-[4rem]',
            "relative",
            !sidebarLayout && "overflow-hidden",
            "transition-all duration-300 z-20"
        )}>
            {!sidebarLayout && (
                <>
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/5 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-zinc-200 blur-[100px] rounded-full -translate-x-1/2 translate-y-1/2" />
                </>
            )}

            <div className={`${sidebarLayout ? '' : 'container mx-auto px-4 md:px-6'} relative`}>
                <div className={`flex flex-col md:flex-row md:items-end justify-between gap-8 ${sidebarLayout ? 'mb-8' : 'mb-20'}`}>
                    <ScrollReveal className="space-y-4 max-w-2xl text-left w-full flex items-center justify-between">
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
                                    {loading ? 'Cargando...' : `${totalCount} ${totalCount === 1 ? 'propiedad encontrada' : 'propiedades encontradas'}`}
                                </p>
                                {totalPages > 1 && (
                                    <span className="text-zinc-400 text-xs font-medium">
                                        Página {currentPageNum} de {totalPages}
                                    </span>
                                )}
                            </div>
                        )}
                    </ScrollReveal>

                    <div />

                </div>

                {loading ? (
                    <PropertyGridSkeleton count={limit || 6} />
                ) : displayProperties.length > 0 ? (
                    <>
                        <div className={cn(
                            "grid gap-8",
                            viewMode === 'grid'
                                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                                : "grid-cols-1"
                        )}>
                            {displayProperties.map((property, index) => {
                                const features = property.features as any || {}
                                const agent = property.agent as any || {}
                                const isLast = index === displayProperties.length - 1

                                return (
                                    <ScrollReveal
                                        key={property.id}
                                        delay={(index % 4) * 0.1}
                                        className="h-full"
                                    >
                                        <div
                                            ref={isLast ? lastElementRef : null}
                                            className={cn(
                                                "group relative flex h-full rounded-[2rem] bg-white border border-black/5 overflow-hidden transition-all duration-700 hover:-translate-y-1 hover:shadow-xl hover:border-black/10 shadow-sm",
                                                viewMode === 'grid' ? "flex-col" : "flex-col md:flex-row h-auto md:h-[240px]"
                                            )}
                                        >
                                            <div className={cn(
                                                "relative overflow-hidden shrink-0",
                                                viewMode === 'grid' ? "w-full aspect-[4/3]" : "w-full md:w-[320px] h-[200px] md:h-full"
                                            )}>
                                                <img
                                                    src={property.main_image_url || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800"}
                                                    alt={property.title}
                                                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-50" />

                                                <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
                                                    <Badge className="w-fit bg-white/95 backdrop-blur-md text-zinc-900 border-none rounded-full px-3 py-1 font-bold text-[9px] uppercase tracking-widest shadow-md">
                                                        {property.property_type}
                                                    </Badge>
                                                    <PropertyCardInteractions property={property} variant="like" />
                                                </div>

                                                {viewMode === 'list' && (
                                                    <div className="absolute bottom-4 left-4 z-10">
                                                        <Badge className={cn(
                                                            "border-none rounded-full px-3 py-1 font-black text-[9px] tracking-widest shadow-lg",
                                                            property.listing_type === 'Venta' ? "bg-blue-600 text-white" : "bg-zinc-900 text-white"
                                                        )}>
                                                            {property.listing_type === 'Renta' ? 'RENTA' : 'VENTA'}
                                                        </Badge>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex flex-col flex-1 p-5 md:p-6 justify-between">
                                                <div className="space-y-3">
                                                    <div className="space-y-1.5">
                                                        <div className="flex items-center gap-2 text-blue-600 text-[9px] font-black uppercase tracking-[0.2em]">
                                                            <MapPin className="h-3 w-3" />
                                                            {property.location}
                                                        </div>

                                                        <h3 className={cn(
                                                            "font-bold text-zinc-800 leading-tight group-hover:text-blue-600 transition-colors duration-300 line-clamp-1",
                                                            viewMode === 'list' ? "text-xl" : "text-lg"
                                                        )}>
                                                            {property.title}
                                                        </h3>

                                                        <div className="flex items-baseline gap-1 text-zinc-800">
                                                            <span className="text-[10px] font-medium text-zinc-400">$</span>
                                                            <span className={cn(
                                                                "font-extrabold tracking-tight",
                                                                viewMode === 'list' ? "text-xl" : "text-lg"
                                                            )}>
                                                                {property.price ? property.price.toLocaleString() : 'P.N.A'}
                                                            </span>
                                                            <span className="text-[9px] font-bold text-zinc-400 ml-0.5 uppercase tracking-wider">
                                                                {property.listing_type === 'Renta' ? 'MXN / mes' : 'MXN'}
                                                            </span>
                                                        </div>
                                                        {property.listing_type === 'Renta' && (
                                                            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Precio de Renta</span>
                                                        )}
                                                    </div>

                                                    <div className={cn(
                                                        "flex items-center gap-5 py-3 border-y border-zinc-100/60",
                                                        viewMode === 'list' ? "max-w-xs" : ""
                                                    )}>
                                                        <div className="flex items-center gap-1.5">
                                                            <BedDouble className="h-4 w-4 text-blue-500/50" />
                                                            <span className="text-xs font-bold text-zinc-600">
                                                                {features.beds || 3} <span className="text-[9px] font-medium text-zinc-400 uppercase">{Number(features.beds || 3) === 1 ? 'Hab.' : 'Hab.'}</span>
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <Bath className="h-4 w-4 text-blue-500/50" />
                                                            <span className="text-xs font-bold text-zinc-600">
                                                                {features.baths || 2} <span className="text-[9px] font-medium text-zinc-400 uppercase">Bañ.</span>
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <Square className="h-4 w-4 text-blue-500/50" />
                                                            <span className="text-xs font-bold text-zinc-600">
                                                                {features.sqft || 250} <span className="text-[9px] font-medium text-zinc-400 uppercase">m²</span>
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between pt-4 mt-2">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="h-8 w-8 rounded-full bg-zinc-100 overflow-hidden ring-1 ring-zinc-200">
                                                            {agent?.avatar_url ? (
                                                                <img src={agent.avatar_url} alt={agent.full_name} className="h-full w-full object-cover" />
                                                            ) : (
                                                                <div className="h-full w-full flex items-center justify-center bg-zinc-200">
                                                                    <User className="h-4 w-4 text-zinc-400" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <span className="text-[11px] font-bold text-zinc-700 truncate max-w-[100px]">
                                                            {agent?.full_name || 'Agente'}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <PropertyCardInteractions property={property} variant="compare" />
                                                        <Link href={`/propiedades/${property.id}`}>
                                                            <Button
                                                                size="icon"
                                                                className="h-9 w-9 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700 border-none"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </ScrollReveal>
                                )
                            })}
                        </div>

                        {/* Infinite scroll loader — solo en home */}
                        {loadingMore && !sidebarLayout && (
                            <div className="mt-16 flex justify-center">
                                <div className="flex items-center gap-3 bg-white/80 backdrop-blur-md px-6 py-3 rounded-full border border-black/5 shadow-lg">
                                    <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                                    <span className="text-sm font-bold text-zinc-600 uppercase tracking-widest">Cargando más...</span>
                                </div>
                            </div>
                        )}

                        {/* Paginación numerada — solo en /propiedades */}
                        {sidebarLayout && totalPages > 1 && (
                            <div className="mt-10 flex items-center justify-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => goToPage(currentPageNum - 1)}
                                    disabled={currentPageNum === 1 || loading}
                                    className="h-10 w-10 p-0 rounded-xl border-zinc-200 hover:bg-zinc-50"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>

                                {Array.from({ length: totalPages }, (_, i) => i + 1)
                                    .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPageNum) <= 1)
                                    .reduce<(number | string)[]>((acc, p, idx, arr) => {
                                        if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('...')
                                        acc.push(p)
                                        return acc
                                    }, [])
                                    .map((p, idx) =>
                                        p === '...' ? (
                                            <span key={`e-${idx}`} className="text-zinc-400 text-sm w-10 text-center">…</span>
                                        ) : (
                                            <Button
                                                key={p}
                                                size="sm"
                                                onClick={() => goToPage(p as number)}
                                                disabled={loading}
                                                className={cn(
                                                    'h-10 w-10 p-0 rounded-xl font-bold text-sm transition-all',
                                                    currentPageNum === p
                                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 border-blue-600'
                                                        : 'bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-50 hover:border-blue-300'
                                                )}
                                            >
                                                {p}
                                            </Button>
                                        )
                                    )
                                }

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => goToPage(currentPageNum + 1)}
                                    disabled={currentPageNum === totalPages || loading}
                                    className="h-10 w-10 p-0 rounded-xl border-zinc-200 hover:bg-zinc-50"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        )}

                        {!sidebarLayout && (
                            <div className="mt-20 flex justify-center">
                                <ScrollReveal delay={0.6} direction="up">
                                    <Link href="/propiedades">
                                        <Button
                                            size="lg"
                                            className="group h-16 px-10 rounded-2xl bg-zinc-900 overflow-hidden relative transition-all duration-500 hover:scale-105 active:scale-95 shadow-2xl border-none"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                            <div className="relative z-10 flex items-center gap-3">
                                                <span className="text-sm font-black uppercase tracking-widest text-white">Ver todas las propiedades</span>
                                                <div className="h-8 w-8 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-blue-600 transition-all duration-500">
                                                    <ArrowRight className="h-4 w-4" />
                                                </div>
                                            </div>
                                        </Button>
                                    </Link>
                                </ScrollReveal>
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
