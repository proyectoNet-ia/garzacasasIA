"use client"

import { useState, useEffect } from "react"
import { useInteractions } from "@/providers/InteractionsProvider"
import { createClient } from "@/lib/supabase-client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, ArrowLeft, MapPin, BedDouble, Bath, Square, Eye } from "lucide-react"
import Link from "next/link"
import { PropertyGridSkeleton } from "@/components/marketing/PropertySkeletons"
import { PropertyCardInteractions } from "@/components/marketing/PropertyCardInteractions"
import { cn } from "@/lib/utils"

export default function FavoritosClient() {
    const { favorites } = useInteractions()
    const [properties, setProperties] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [supabase] = useState(() => createClient())

    useEffect(() => {
        async function fetchFavorites() {
            if (favorites.length === 0) {
                setProperties([])
                setLoading(false)
                return
            }

            setLoading(true)
            try {
                const { data, error } = await supabase
                    .from('properties')
                    .select(`
                        *,
                        agent:profiles(full_name, avatar_url, phone, whatsapp, company_name)
                    `)
                    .in('id', favorites)
                    .eq('status', 'active')

                if (error) throw error
                setProperties(data || [])
            } catch (error) {
                console.error('Error fetching favorites:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchFavorites()
    }, [favorites, supabase])

    if (!loading && favorites.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center space-y-6">
                <div className="h-24 w-24 rounded-full bg-red-50 flex items-center justify-center text-red-300">
                    <Heart className="h-12 w-12" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-3xl font-black text-zinc-900 uppercase tracking-tighter">No tienes favoritos</h1>
                    <p className="text-zinc-500 font-medium max-w-md mx-auto">Explora nuestras propiedades y guarda las que más te gusten para verlas aquí más tarde.</p>
                </div>
                <Link href="/propiedades">
                    <Button className="h-12 px-8 rounded-2xl bg-zinc-900 text-white hover:bg-zinc-800 font-black uppercase tracking-widest text-xs gap-2 shadow-xl shadow-zinc-900/20">
                        <ArrowLeft className="h-4 w-4" />
                        Explorar Propiedades
                    </Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="container mx-auto max-w-7xl pt-10 pb-20">
            <header className="mb-16 space-y-4 px-4 md:px-0">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-red-50 flex items-center justify-center text-red-500 shadow-sm shadow-red-500/10">
                        <Heart className="h-5 w-5 fill-red-500" />
                    </div>
                    <Badge variant="outline" className="border-red-500/20 bg-red-500/5 text-red-600 rounded-full px-4 py-1 uppercase tracking-widest text-[10px] font-bold">
                        Tu Selección Personal
                    </Badge>
                </div>
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-zinc-900 font-heading leading-none decoration-red-500/30">
                    Mis <span className="text-red-500 italic">Favoritos</span>
                </h1>
                <p className="text-zinc-500 font-medium text-lg max-w-2xl leading-relaxed">
                    Gestiona y revisa las residencias que han captado tu atención. Tu próximo hogar podría estar en esta lista.
                </p>
            </header>

            {loading ? (
                <div className="px-4 md:px-0">
                    <PropertyGridSkeleton count={3} />
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 px-4 md:px-0">
                    {properties.map((property) => {
                        const features = property.features || {}
                        
                        return (
                            <div
                                key={property.id}
                                className="group relative flex flex-col rounded-[2.5rem] bg-white border border-zinc-100 overflow-hidden transition-all duration-700 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] hover:border-zinc-200 h-full"
                            >
                                <div className="relative aspect-[4/3] overflow-hidden shrink-0">
                                    <img
                                        src={property.main_image_url || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800"}
                                        alt={property.title}
                                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                                    
                                    <div className="absolute top-6 left-6 right-6 flex justify-between items-start z-10">
                                        <Badge className="bg-white/95 backdrop-blur-md text-zinc-900 border-none rounded-full px-4 py-1.5 font-black text-[9px] uppercase tracking-widest shadow-xl">
                                            {property.property_type}
                                        </Badge>
                                        <PropertyCardInteractions property={property} variant="like" />
                                    </div>

                                    <div className="absolute bottom-6 left-6 z-10">
                                        <Badge className={cn(
                                            "border-none rounded-full px-4 py-1.5 font-black text-[9px] tracking-widest shadow-lg",
                                            property.listing_type === 'Venta' ? "bg-blue-600 text-white" : "bg-zinc-900 text-white"
                                        )}>
                                            {property.listing_type === 'Renta' ? 'RENTA' : 'VENTA'}
                                        </Badge>
                                    </div>
                                </div>

                                <div className="flex flex-col flex-1 p-8 justify-between">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] opacity-80">
                                                <MapPin className="h-3.5 w-3.5" />
                                                {property.location}
                                            </div>
                                            
                                            <h3 className="text-2xl font-black text-zinc-900 leading-tight group-hover:text-blue-600 transition-colors duration-300 line-clamp-2">
                                                {property.title}
                                            </h3>

                                            <div className="flex items-baseline gap-1 pt-2">
                                                <span className="text-3xl font-black tracking-tighter text-zinc-900">
                                                    ${property.price ? property.price.toLocaleString() : 'P.N.A'}
                                                </span>
                                                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">
                                                    {property.listing_type === 'Renta' ? 'MXN / mes' : 'MXN'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6 py-5 border-y border-zinc-100/80">
                                            <div className="flex items-center gap-2">
                                                <BedDouble className="h-4 w-4 text-blue-500/60" />
                                                <span className="text-sm font-bold text-zinc-700">
                                                    {features.beds || 3} <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">Hab.</span>
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Bath className="h-4 w-4 text-blue-500/60" />
                                                <span className="text-sm font-bold text-zinc-700">
                                                    {features.baths || 2} <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">Bañ.</span>
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Square className="h-4 w-4 text-blue-500/60" />
                                                <span className="text-sm font-bold text-zinc-700">
                                                    {features.sqft || 250} <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">m²</span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-6 mt-4">
                                        <Link href={`/propiedades/${property.id}`} className="flex-1 mr-4">
                                            <Button
                                                className="w-full h-12 rounded-2xl bg-zinc-900 text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-zinc-900/10 hover:bg-black transition-all group/btn"
                                            >
                                                <span className="flex items-center gap-2">
                                                    Ver Detalle
                                                    <Eye className="h-4 w-4 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                                                </span>
                                            </Button>
                                        </Link>
                                        <PropertyCardInteractions property={property} variant="compare" />
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
