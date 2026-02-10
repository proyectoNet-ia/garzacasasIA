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
    MapPin, BedDouble, Bath, Square, ChevronLeft,
    Share2, Heart, MessageSquare, Phone, User,
    Building2, Calendar, ShieldCheck, Zap, Crown,
    ArrowRight, Loader2
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { trackPropertyView, trackPropertyInteraction } from '@/lib/analytics'

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

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
                    <p className="text-zinc-500 font-medium">Cargando detalles...</p>
                </div>
            </div>
        )
    }

    if (!property) return null

    const features = property.features as any || {}
    const agent = property.agent as any || {}
    const waNumber = (agent?.whatsapp || agent?.phone || '').replace(/\D/g, '')

    return (
        <div className="min-h-screen bg-zinc-50">
            <SecondaryNavbar contactConfig={contactConfig} />

            <main className="pt-24 pb-20 lg:pb-32">
                <div className="container mx-auto px-4 md:px-6">
                    {/* Breadcrumbs & Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                        <Button
                            variant="ghost"
                            onClick={() => router.back()}
                            className="text-zinc-600 hover:text-blue-600 pl-0"
                        >
                            <ChevronLeft className="h-4 w-4 mr-2" />
                            Volver al catálogo
                        </Button>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" className="rounded-full border-zinc-200">
                                <Share2 className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" className="rounded-full border-zinc-200">
                                <Heart className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        {/* LEFT COLUMN: Media & Info */}
                        <div className="lg:col-span-2 space-y-10">
                            {/* Main Image Gallery (Simplified for now) */}
                            <div className="relative aspect-[16/9] w-full rounded-[2.5rem] overflow-hidden shadow-2xl bg-zinc-200">
                                <img
                                    src={property.main_image_url || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200"}
                                    alt={property.title}
                                    className="h-full w-full object-cover"
                                />
                                <div className="absolute top-6 left-6 flex flex-col gap-2">
                                    <Badge className="bg-white/90 backdrop-blur-md text-zinc-900 border-none rounded-full px-4 py-1.5 font-bold text-[10px] uppercase tracking-widest shadow-lg">
                                        {property.property_type}
                                    </Badge>
                                    {property.priority_tier >= 2 && (
                                        <Badge className="bg-blue-600 text-white border-none rounded-full px-4 py-1.5 flex items-center gap-2 font-black shadow-xl text-[10px] tracking-widest">
                                            <Zap className="h-3 w-3 fill-white" />
                                            PROPIEDAD DESTACADA
                                        </Badge>
                                    )}
                                </div>
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
                                        ${property.price.toLocaleString()}
                                    </span>
                                    <span className="text-zinc-500 font-medium">MXN</span>
                                </div>
                            </div>

                            {/* Features Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    { icon: BedDouble, label: 'Camas', val: features.beds || 3 },
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
                                                    <MessageSquare className="mr-2 h-5 w-5" />
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
                                                    <Phone className="mr-2 h-5 w-5" />
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
                                    <Phone className="h-5 w-5" />
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
                                    <MessageSquare className="mr-2 h-5 w-5" />
                                    Contactar
                                </a>
                            </Button>
                        )}
                    </div>
                </div>
            </div>

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
