'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import { SecondaryNavbar } from '@/components/layout/SecondaryNavbar'
import { Footer } from '@/components/layout/Footer'
import { getSiteSettings } from '@/lib/settings'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    MapPin, BedDouble, Bath, Square, ChevronLeft, ChevronRight,
    Share2, Heart, MessageSquare, Phone, User,
    Building2, Calendar, ShieldCheck, Zap, Crown,
    ArrowRight, Loader2, X
} from 'lucide-react'
import { IconWhatsApp } from '@/components/ui/SocialIcons'
import { toast } from 'sonner'
import Link from 'next/link'
import { trackPropertyView, trackPropertyInteraction } from '@/lib/analytics'
import { PropertyDetailSkeleton } from '@/components/admin/AdminSkeletons'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { PlusvaliaBadge } from '@/components/inegi/PlusvaliaBadge'
import { ServiciosCercanos } from '@/components/inegi/ServiciosCercanos'

export default function PropertyDetailPage() {
    const { id } = useParams()
    const router = useRouter()
    const [property, setProperty] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [contactConfig, setContactConfig] = useState<any>(null)
    const supabase = createClient()

    useEffect(() => {
        async function fetchData() {
            try {
                // Fetch site settings for navbar
                const settings = await getSiteSettings('contact_config')
                setContactConfig(settings)

                // Fetch property with agent info
                const { data, error } = await supabase
                    .from('properties')
                    .select(`
                        *,
                        agent:profiles(full_name, avatar_url, phone, whatsapp, company_name, bio)
                    `)
                    .eq('id', id)
                    .single()

                if (error) throw error
                setProperty(data)

                // Track property view
                if (data && data.agent_id) {
                    trackPropertyView(data.id, data.agent_id)
                }
            } catch (error: any) {
                console.error('Error:', error)
                toast.error('No se pudo encontrar la propiedad')
                router.push('/propiedades')
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [id])

    const [activeImage, setActiveImage] = useState<string | null>(null)
    const [isLightboxOpen, setIsLightboxOpen] = useState(false)
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [isLiked, setIsLiked] = useState(false)

    const handleShare = async () => {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: property.title,
                    text: property.description?.substring(0, 100) + '...',
                    url: window.location.href,
                })
                trackPropertyInteraction(property.id, property.agent_id, 'share')
            } else {
                // Fallback for browsers that don't support Web Share API
                await navigator.clipboard.writeText(window.location.href)
                toast.success('Enlace copiado al portapapeles')
                trackPropertyInteraction(property.id, property.agent_id, 'share', { method: 'copy_clipboard' })
            }
        } catch (error) {
            console.error('Error sharing:', error)
        }
    }

    const handleLike = () => {
        setIsLiked(!isLiked)
        if (!isLiked) {
            toast.success('Agregado a favoritos', {
                icon: <Heart className="h-4 w-4 text-red-500 fill-red-500" />
            })
            trackPropertyInteraction(property.id, property.agent_id, 'favorite')
        }
    }

    useEffect(() => {
        if (property?.main_image_url) {
            setActiveImage(property.main_image_url)
        }
    }, [property])

    // Keyboard navigation for Lightbox
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isLightboxOpen) return
            if (e.key === 'Escape') setIsLightboxOpen(false)
            if (e.key === 'ArrowRight') nextImage()
            if (e.key === 'ArrowLeft') prevImage()
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isLightboxOpen, currentImageIndex])

    if (loading) {
        return <PropertyDetailSkeleton />
    }

    if (!property) return null

    const allImages = [
        property.main_image_url,
        ...(Array.isArray(property.images) ? property.images : [])
    ].filter(Boolean)

    const openLightbox = (index: number) => {
        setCurrentImageIndex(index)
        setIsLightboxOpen(true)
    }

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % allImages.length)
    }

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length)
    }

    const features = property.features as any || {}
    const agent = property.agent as any || {}
    const waNumber = (agent?.whatsapp || agent?.phone || '').replace(/\D/g, '')

    return (
        <div className="min-h-screen bg-zinc-50 font-sans">
            <SecondaryNavbar contactConfig={contactConfig} />

            <main className="pt-32 pb-20 lg:pb-32">
                <div className="container mx-auto px-4 md:px-6">
                    {/* Breadcrumbs & Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-10 pt-4">
                        <Button
                            variant="ghost"
                            onClick={() => router.back()}
                            className="text-zinc-600 hover:text-blue-600 pl-0 font-bold group"
                        >
                            <ChevronLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
                            Volver al catálogo
                        </Button>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handleShare}
                                className="rounded-full border-zinc-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm active:scale-95"
                                title="Compartir"
                            >
                                <Share2 className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handleLike}
                                className={cn(
                                    "rounded-full border-zinc-200 transition-all shadow-sm active:scale-95",
                                    isLiked ? "bg-red-50 text-red-500 border-red-200" : "hover:bg-red-50 hover:text-red-500 hover:border-red-200"
                                )}
                                title="Favorito"
                            >
                                <Heart className={cn("h-4 w-4 transition-all", isLiked && "fill-current scale-110")} />
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        {/* LEFT COLUMN: Media & Info */}
                        <div className="lg:col-span-2 space-y-10">
                            {/* Main Gallery */}
                            <div className="space-y-4">
                                <motion.div
                                    layoutId="main-image"
                                    onClick={() => openLightbox(allImages.indexOf(activeImage || ''))}
                                    className="relative aspect-[16/9] w-full rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden shadow-2xl bg-zinc-200 group cursor-zoom-in"
                                >
                                    <img
                                        src={activeImage || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200"}
                                        alt={property.title}
                                        className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                                    <div className="absolute top-8 left-8 flex flex-col gap-3">
                                        <Badge className="bg-white/90 backdrop-blur-xl text-zinc-900 border-none rounded-full px-5 py-2 font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl">
                                            {property.property_type}
                                        </Badge>
                                        {property.priority_tier >= 2 && (
                                            <Badge className="bg-blue-600 text-white border-none rounded-full px-5 py-2 flex items-center gap-2 font-black shadow-2xl text-[10px] tracking-[0.2em]">
                                                <Zap className="h-3 w-3 fill-white animate-pulse" />
                                                PROPIEDAD DESTACADA
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="bg-white/90 backdrop-blur-xl p-4 rounded-2xl shadow-2xl">
                                            <ArrowRight className="h-6 w-6 text-blue-600" />
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Thumbnails */}
                                {allImages.length > 1 && (
                                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide px-2">
                                        {allImages.map((img, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setActiveImage(img)}
                                                className={cn(
                                                    "relative h-20 w-32 shrink-0 rounded-2xl overflow-hidden border-2 transition-all duration-300 transform active:scale-95 shadow-md",
                                                    activeImage === img ? "border-blue-600 ring-4 ring-blue-600/10 scale-105" : "border-transparent hover:border-zinc-300 opacity-70 hover:opacity-100"
                                                )}
                                            >
                                                <img src={img} className="h-full w-full object-cover" />
                                                <div className="absolute inset-0 bg-black/10" />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Title & Basics */}
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-blue-600 text-xs font-bold uppercase tracking-widest">
                                        <MapPin className="h-4 w-4" />
                                        {property.location}
                                    </div>
                                    <h1 className="text-4xl md:text-5xl font-black text-zinc-900 tracking-tight leading-tight">
                                        {property.title}
                                    </h1>
                                </div>

                                <div className="flex flex-wrap items-baseline gap-4 py-6 border-y border-zinc-200/60">
                                    <span className="text-4xl md:text-5xl font-light text-zinc-900">
                                        {property.price ? `$${property.price.toLocaleString()}` : 'Precio no disponible'}
                                    </span>
                                    <span className="text-zinc-500 font-medium">
                                        {property.listing_type === 'Renta' ? 'MXN / mes' : 'MXN'}
                                    </span>
                                    {property.listing_type === 'Renta' && (
                                        <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-widest">
                                            Precio de Renta
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Features Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    { icon: BedDouble, label: Number(property.features?.beds || 3) === 1 ? 'Habitación' : 'Habitaciones', val: property.features?.beds || 3 },
                                    { icon: Bath, label: 'Baños', val: features.baths || 2 },
                                    { icon: Square, label: 'M² Totales', val: features.sqft || 250 },
                                    { icon: Calendar, label: 'Año', val: features.year || 2024 },
                                ].map((item, i) => (
                                    <div key={i} className="bg-white p-6 rounded-[2rem] border border-zinc-100 flex flex-col items-center gap-2 shadow-sm">
                                        <item.icon className="h-6 w-6 text-blue-500 mb-1" />
                                        <span className="text-2xl font-bold text-zinc-900">{item.val}</span>
                                        <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-400">{item.label}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Description */}
                            <div className="bg-white p-8 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border border-zinc-100 shadow-sm space-y-6">
                                <h2 className="text-2xl font-bold text-zinc-900">Descripción</h2>
                                <p className="text-zinc-600 leading-relaxed text-sm md:text-lg whitespace-pre-line">
                                    {property.description}
                                </p>
                            </div>

                            {/* INEGI Premium Insights */}
                            <div className="space-y-8">
                                <div className="flex items-center gap-3">
                                    <Badge className="bg-blue-600 text-white rounded-full px-4 py-1 uppercase tracking-widest text-[10px] font-bold">
                                        Inteligencia de Zona
                                    </Badge>
                                    <h2 className="text-2xl font-bold text-zinc-900 leading-none">Datos Oficiales INEGI</h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <PlusvaliaBadge
                                        municipio={property.location?.split(',')[0]?.trim() || 'Nacional'}
                                        tipo={property.property_type?.toLowerCase().includes('depto') ? 'departamento' : 'casa'}
                                        lat={property.latitude}
                                        lng={property.longitude}
                                    />
                                    {(property.latitude && property.longitude) ? (
                                        <ServiciosCercanos
                                            lat={property.latitude}
                                            lng={property.longitude}
                                        />
                                    ) : (
                                        <div className="p-6 bg-zinc-100 rounded-[2rem] border border-dashed border-zinc-300 flex flex-col items-center justify-center text-center opacity-60">
                                            <MapPin className="h-8 w-8 text-zinc-400 mb-2" />
                                            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Ubicación no georreferenciada</p>
                                            <p className="text-[10px] text-zinc-400 mt-1">Registra las coordenadas para activar el análisis de servicios.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Contact & Safety */}
                        <div className="space-y-8">
                            {/* Agent Card */}
                            <Card className="rounded-[3rem] border-zinc-200 shadow-xl overflow-hidden sticky top-28 bg-white">
                                <CardHeader className="bg-zinc-900 text-white p-8">
                                    <CardTitle className="text-xl">Contactar al Agente</CardTitle>
                                    <CardDescription className="text-zinc-400">Atención personalizada inmediata</CardDescription>
                                </CardHeader>
                                <CardContent className="p-8 space-y-8">
                                    {/* Agent Profile Info */}
                                    <div className="flex items-center gap-4">
                                        <div className="relative h-20 w-20 rounded-2xl overflow-hidden bg-zinc-100 ring-4 ring-zinc-50 shrink-0">
                                            {agent?.avatar_url ? (
                                                <img src={agent.avatar_url} alt={agent.full_name} className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center">
                                                    <User className="h-10 w-10 text-zinc-300" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="text-lg font-bold text-zinc-900 truncate">
                                                {agent?.full_name || 'Consultor Inmobiliario'}
                                            </h3>
                                            <div className="flex items-center gap-1.5 text-zinc-500 text-sm">
                                                <Building2 className="h-3.5 w-3.5" />
                                                <span className="truncate">{agent?.company_name || 'Independiente'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {agent?.bio && (
                                        <p className="text-zinc-500 text-sm italic line-clamp-3">
                                            "{agent.bio}"
                                        </p>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="space-y-3 pt-4">
                                        {waNumber && (
                                            <Button
                                                asChild
                                                className="w-full h-14 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-bold shadow-lg shadow-green-600/20"
                                            >
                                                <a
                                                    href={`https://wa.me/${waNumber}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={() => trackPropertyInteraction(property.id, property.agent_id, 'whatsapp_click')}
                                                >
                                                    <IconWhatsApp className="mr-2 h-7 w-7" />
                                                    WhatsApp
                                                </a>
                                            </Button>
                                        )}
                                        {agent?.phone && (
                                            <Button
                                                asChild
                                                variant="outline"
                                                className="w-full h-14 border-zinc-200 text-zinc-700 rounded-2xl font-bold hover:bg-zinc-50"
                                            >
                                                <a
                                                    href={`tel:${agent.phone}`}
                                                    onClick={() => trackPropertyInteraction(property.id, property.agent_id, 'phone_click')}
                                                >
                                                    <Phone className="mr-2 h-7 w-7" />
                                                    Llamar ahora
                                                </a>
                                            </Button>
                                        )}
                                    </div>

                                    {/* Verification Badge */}
                                    <div className="bg-blue-50 rounded-2xl p-4 flex gap-3">
                                        <ShieldCheck className="h-6 w-6 text-blue-600 shrink-0" />
                                        <div className="text-xs text-blue-900/70">
                                            <p className="font-bold text-blue-900 mb-0.5">Agente Verificado</p>
                                            <p>Este profesional cumple con los estándares de calidad de Garza Casas IA.</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Mini CTA Sidebar */}
                            <div className="p-8 rounded-[3rem] bg-gradient-to-br from-blue-600 to-indigo-700 text-white space-y-4 shadow-xl shadow-blue-600/20">
                                <h4 className="text-xl font-bold">¿Buscas algo similar?</h4>
                                <p className="text-blue-100 text-sm leading-relaxed">
                                    Nuestra IA puede buscar propiedades similares en tiempo real según tus preferencias.
                                </p>
                                <Button className="w-full bg-white text-blue-700 hover:bg-zinc-100 rounded-2xl font-bold">
                                    Activar búsqueda IA
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Mobile Floating Contact Bar */}
            <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white/80 backdrop-blur-xl border-t border-zinc-200 p-4 shadow-2xl animate-in slide-in-from-bottom duration-500">
                <div className="flex items-center justify-between gap-4 max-w-md mx-auto">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Precio</span>
                        <span className="text-xl font-black text-zinc-900">${property.price.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {agent?.phone && (
                            <Button
                                asChild
                                variant="outline"
                                size="icon"
                                className="h-12 w-12 rounded-xl border-zinc-200 text-zinc-700"
                            >
                                <a
                                    href={`tel:${agent.phone}`}
                                    onClick={() => trackPropertyInteraction(property.id, property.agent_id, 'phone_click')}
                                >
                                    <Phone className="h-7 w-7" />
                                </a>
                            </Button>
                        )}
                        {waNumber && (
                            <Button
                                asChild
                                className="h-12 px-6 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-lg shadow-green-600/20"
                            >
                                <a
                                    href={`https://wa.me/${waNumber}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => trackPropertyInteraction(property.id, property.agent_id, 'whatsapp_click')}
                                >
                                    <IconWhatsApp className="mr-2 h-7 w-7" />
                                    Contactar
                                </a>
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Lightbox Overlay */}
            <AnimatePresence>
                {isLightboxOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-zinc-950/98 backdrop-blur-2xl flex flex-col items-center justify-center p-4 md:p-10 select-none"
                    >
                        {/* Close Button */}
                        <button
                            onClick={() => setIsLightboxOpen(false)}
                            className="absolute top-6 right-6 z-[110] bg-white/10 hover:bg-white/20 text-white p-4 rounded-full transition-all active:scale-95"
                        >
                            <X className="h-8 w-8" />
                        </button>

                        {/* Image Counter */}
                        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-[110] bg-white/10 px-6 py-2 rounded-full backdrop-blur-md">
                            <span className="text-white font-black tracking-widest text-xs">
                                {currentImageIndex + 1} / {allImages.length}
                            </span>
                        </div>

                        {/* Navigation Buttons */}
                        <button
                            onClick={prevImage}
                            className="absolute left-4 md:left-10 z-[110] bg-white/10 hover:bg-white/20 text-white p-4 rounded-full transition-all active:scale-95 disabled:opacity-30"
                        >
                            <ChevronLeft className="h-8 w-8" />
                        </button>
                        <button
                            onClick={nextImage}
                            className="absolute right-4 md:right-10 z-[110] bg-white/10 hover:bg-white/20 text-white p-4 rounded-full transition-all active:scale-95 disabled:opacity-30"
                        >
                            <ChevronRight className="h-8 w-8" />
                        </button>

                        {/* Main Image Container */}
                        <div className="relative w-full h-full flex items-center justify-center px-4 md:px-20 overflow-hidden">
                            <AnimatePresence mode="wait">
                                <motion.img
                                    key={currentImageIndex}
                                    src={allImages[currentImageIndex]}
                                    initial={{ opacity: 0, scale: 0.9, x: 20 }}
                                    animate={{ opacity: 1, scale: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, x: -20 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    className="max-h-[85vh] max-w-full object-contain rounded-3xl md:rounded-[3rem] shadow-2xl"
                                />
                            </AnimatePresence>
                        </div>

                        {/* Thumbnail Strip in Lightbox */}
                        <div className="absolute bottom-10 left-0 right-0 z-[110] flex justify-center gap-2 md:gap-4 px-4 overflow-x-auto py-4 scrollbar-hide">
                            {allImages.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentImageIndex(idx)}
                                    className={cn(
                                        "relative h-14 md:h-20 w-20 md:w-32 shrink-0 rounded-xl md:rounded-2xl overflow-hidden border-2 transition-all duration-300",
                                        currentImageIndex === idx ? "border-white scale-110 shadow-xl ring-4 ring-white/20" : "border-transparent opacity-40 hover:opacity-100"
                                    )}
                                >
                                    <img src={img} className="h-full w-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Footer />
        </div>
    )
}

function Card({ children, className }: { children: React.ReactNode, className?: string }) {
    return <div className={className}>{children}</div>
}
function CardHeader({ children, className }: { children: React.ReactNode, className?: string }) {
    return <div className={className}>{children}</div>
}
function CardTitle({ children, className }: { children: React.ReactNode, className?: string }) {
    return <h2 className={className}>{children}</h2>
}
function CardDescription({ children, className }: { children: React.ReactNode, className?: string }) {
    return <p className={className}>{children}</p>
}
function CardContent({ children, className }: { children: React.ReactNode, className?: string }) {
    return <div className={className}>{children}</div>
}
