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
    MapPin, BedDouble, Bath, Square, Phone, MessageSquare,
    User, Building2, Star, Calendar, ArrowLeft,
    Eye, Heart, Loader2, ArrowUpRight, ShieldCheck,
    TrendingUp, Home, Mail
} from 'lucide-react'
import { IconWhatsApp } from '@/components/ui/SocialIcons'
import { toast } from 'sonner'
import Link from 'next/link'
import { trackPropertyInteraction } from '@/lib/analytics'
import { cn, formatPrice } from '@/lib/utils'
import { motion } from 'framer-motion'

export default function AgentProfilePage() {
    const { id } = useParams()
    const router = useRouter()
    const [agent, setAgent] = useState<any>(null)
    const [properties, setProperties] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [contactConfig, setContactConfig] = useState<any>(null)
    const supabase = createClient()

    useEffect(() => {
        async function fetchData() {
            try {
                const settings = await getSiteSettings('contact_config')
                setContactConfig(settings)

                // Fetch agent profile
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', id)
                    .single()

                if (profileError) throw profileError
                setAgent(profile)

                // Fetch agent's active properties
                const { data: props, error: propsError } = await supabase
                    .from('properties')
                    .select('*')
                    .eq('agent_id', id)
                    .eq('status', 'active')
                    .order('created_at', { ascending: false })
                    .limit(12)

                if (!propsError) setProperties(props || [])

            } catch (error: any) {
                console.error('Error:', error)
                toast.error('No se pudo encontrar el perfil del agente')
                router.push('/agentes')
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [id])

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto" />
                    <p className="text-zinc-500 font-medium">Cargando perfil...</p>
                </div>
            </div>
        )
    }

    if (!agent) return null

    const waNumber = (agent?.whatsapp || agent?.phone || '').replace(/\D/g, '')
    const yearsExperience = agent?.created_at
        ? Math.max(1, new Date().getFullYear() - new Date(agent.created_at).getFullYear() + 1)
        : 1
    const avatarUrl = agent?.avatar_url ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(agent?.full_name || 'A')}&background=1e3a5f&color=fff&size=200`

    return (
        <div className="min-h-screen bg-zinc-50 font-sans">
            <SecondaryNavbar contactConfig={contactConfig} />

            <main className="pt-32 pb-24">
                {/* Hero Banner */}
                <div className="relative bg-zinc-900 overflow-hidden">
                    {/* Background pattern */}
                    <div className="absolute inset-0 opacity-10"
                        style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, #3b82f6 0%, transparent 60%), radial-gradient(circle at 70% 30%, #6366f1 0%, transparent 50%)' }}
                    />
                    <div className="container mx-auto px-4 md:px-6 py-16 relative">
                        <Button
                            variant="ghost"
                            onClick={() => router.back()}
                            className="text-zinc-400 hover:text-white pl-0 font-bold group mb-8 gap-2"
                        >
                            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                            Volver a Agentes
                        </Button>

                        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                            {/* Avatar */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5 }}
                                className="relative shrink-0"
                            >
                                <div className="h-36 w-36 md:h-44 md:w-44 rounded-[2.5rem] overflow-hidden ring-4 ring-white/10 shadow-2xl">
                                    <img
                                        src={avatarUrl}
                                        alt={agent.full_name || 'Agente'}
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                                {/* Verified badge */}
                                <div className="absolute -bottom-3 -right-3 h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center shadow-lg border-4 border-zinc-900">
                                    <ShieldCheck className="h-5 w-5 text-white" />
                                </div>
                            </motion.div>

                            {/* Info */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                className="flex-1 min-w-0 text-center md:text-left"
                            >
                                <Badge className="bg-blue-600/20 text-blue-400 border-none mb-3 rounded-full font-bold uppercase tracking-widest text-[10px]">
                                    Agente Verificado
                                </Badge>
                                <h1 className="text-3xl md:text-4xl font-black text-white leading-tight">
                                    {agent.full_name || 'Consultor Inmobiliario'}
                                </h1>
                                <p className="text-zinc-400 font-medium mt-1 text-lg">
                                    {agent.company_name || 'Consultor Independiente'}
                                </p>
                                {agent.bio && (
                                    <p className="text-zinc-400 mt-4 max-w-2xl text-sm leading-relaxed line-clamp-3">
                                        {agent.bio}
                                    </p>
                                )}

                                {/* Stats Row */}
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 mt-6">
                                    <div className="flex items-center gap-2 text-zinc-300">
                                        <Home className="h-4 w-4 text-blue-400" />
                                        <span className="font-bold text-white">{properties.length}</span>
                                        <span className="text-xs uppercase tracking-widest font-bold">Propiedades activas</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-zinc-300">
                                        <Calendar className="h-4 w-4 text-blue-400" />
                                        <span className="font-bold text-white">{yearsExperience}</span>
                                        <span className="text-xs uppercase tracking-widest font-bold">{yearsExperience === 1 ? 'Año' : 'Años'} en la plataforma</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-amber-400">
                                        {[1, 2, 3, 4, 5].map(s => (
                                            <Star key={s} className="h-4 w-4 fill-amber-400" />
                                        ))}
                                        <span className="text-white font-bold ml-1">5.0</span>
                                    </div>
                                </div>

                                {/* Contact Buttons */}
                                <div className="flex flex-wrap gap-3 mt-6 justify-center md:justify-start">
                                    {waNumber && (
                                        <Button
                                            asChild
                                            className="h-12 px-6 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-bold shadow-lg shadow-green-600/20 gap-2"
                                        >
                                            <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noopener noreferrer">
                                                <IconWhatsApp className="h-5 w-5" />
                                                WhatsApp
                                            </a>
                                        </Button>
                                    )}
                                    {agent.phone && (
                                        <Button
                                            asChild
                                            variant="outline"
                                            className="h-12 px-6 border-zinc-700 text-white bg-white/5 hover:bg-white/10 rounded-2xl font-bold gap-2"
                                        >
                                            <a href={`tel:${agent.phone}`}>
                                                <Phone className="h-5 w-5" />
                                                Llamar
                                            </a>
                                        </Button>
                                    )}
                                    {agent.email && (
                                        <Button
                                            asChild
                                            variant="outline"
                                            className="h-12 px-6 border-zinc-700 text-white bg-white/5 hover:bg-white/10 rounded-2xl font-bold gap-2"
                                        >
                                            <a href={`mailto:${agent.email}`}>
                                                <Mail className="h-5 w-5" />
                                                Email
                                            </a>
                                        </Button>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="container mx-auto px-4 md:px-6 -mt-6 relative z-10">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: 'Propiedades publicadas', value: properties.length.toString(), icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50' },
                            { label: 'Años en plataforma', value: yearsExperience.toString(), icon: Calendar, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                            { label: 'Calificación', value: '5.0 ★', icon: Star, color: 'text-amber-600', bg: 'bg-amber-50' },
                            { label: 'Agente verificado', value: 'Sí', icon: ShieldCheck, color: 'text-green-600', bg: 'bg-green-50' },
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: i * 0.08 }}
                                className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm"
                            >
                                <div className={`h-10 w-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                                </div>
                                <div className="text-2xl font-black text-zinc-900">{stat.value}</div>
                                <div className="text-[10px] uppercase tracking-widest font-bold text-zinc-400 mt-0.5">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Properties Grid */}
                <div className="container mx-auto px-4 md:px-6 mt-12">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-black text-zinc-900">Propiedades del Agente</h2>
                            <p className="text-zinc-500 text-sm mt-1">
                                {properties.length > 0
                                    ? `${properties.length} inmueble${properties.length !== 1 ? 's' : ''} disponible${properties.length !== 1 ? 's' : ''}`
                                    : 'Sin propiedades publicadas actualmente'}
                            </p>
                        </div>
                        <Link href="/propiedades">
                            <Button variant="outline" className="gap-2 border-zinc-200 font-bold rounded-xl">
                                Ver catálogo completo
                                <ArrowUpRight className="h-4 w-4" />
                            </Button>
                        </Link>
                    </div>

                    {properties.length === 0 ? (
                        <div className="bg-white rounded-3xl border border-zinc-200 py-24 text-center">
                            <Building2 className="h-14 w-14 mx-auto text-zinc-200 mb-4" />
                            <h3 className="text-lg font-bold text-zinc-500">Sin propiedades activas</h3>
                            <p className="text-zinc-400 text-sm mt-2">Este agente no tiene inmuebles publicados por el momento.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {properties.map((property, i) => {
                                const features = property.features as any || {}
                                return (
                                    <motion.div
                                        key={property.id}
                                        initial={{ opacity: 0, y: 24 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.4, delay: i * 0.07 }}
                                    >
                                        <Link
                                            href={`/propiedades/${property.id}`}
                                            className="group block bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300"
                                        >
                                            {/* Image */}
                                            <div className="relative aspect-[4/3] overflow-hidden bg-zinc-100">
                                                {property.main_image_url ? (
                                                    <img
                                                        src={property.main_image_url}
                                                        alt={property.title}
                                                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                    />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center">
                                                        <Building2 className="h-14 w-14 text-zinc-300" />
                                                    </div>
                                                )}
                                                {/* Price badge */}
                                                <div className="absolute bottom-4 left-4">
                                                    <span className="bg-white/90 backdrop-blur-xl text-zinc-900 font-black text-lg px-4 py-1.5 rounded-full shadow-lg">
                                                        {formatPrice(property.price)}
                                                    </span>
                                                </div>
                                                {/* Type badge */}
                                                <div className="absolute top-4 left-4">
                                                    <Badge className="bg-zinc-900/80 backdrop-blur-xl text-white border-none rounded-full text-[10px] font-bold uppercase tracking-wider">
                                                        {property.listing_type || 'Venta'} · {property.property_type}
                                                    </Badge>
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="p-5 space-y-3">
                                                <div>
                                                    <h3 className="font-bold text-zinc-900 text-base leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
                                                        {property.title}
                                                    </h3>
                                                    <div className="flex items-center gap-1.5 text-zinc-500 text-xs mt-1 font-medium">
                                                        <MapPin className="h-3 w-3" />
                                                        {property.location}
                                                    </div>
                                                </div>

                                                {/* Features */}
                                                <div className="flex items-center gap-4 pt-3 border-t border-zinc-100 text-zinc-500">
                                                    {features.beds > 0 && (
                                                        <div className="flex items-center gap-1.5 text-xs font-bold">
                                                            <BedDouble className="h-3.5 w-3.5" />
                                                            {features.beds}
                                                        </div>
                                                    )}
                                                    {features.baths > 0 && (
                                                        <div className="flex items-center gap-1.5 text-xs font-bold">
                                                            <Bath className="h-3.5 w-3.5" />
                                                            {features.baths}
                                                        </div>
                                                    )}
                                                    {features.sqft > 0 && (
                                                        <div className="flex items-center gap-1.5 text-xs font-bold">
                                                            <Square className="h-3.5 w-3.5" />
                                                            {features.sqft} m²
                                                        </div>
                                                    )}
                                                    <div className="ml-auto">
                                                        <ArrowUpRight className="h-4 w-4 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    )
}
