'use client'

import { useState, useEffect } from 'react'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Star, MessageSquare, Mail, Loader2, ArrowUpRight } from "lucide-react"
import { IconInstagram, IconLinkedIn, IconWhatsApp } from "@/components/ui/SocialIcons"
import { ScrollReveal } from "@/components/ui/ScrollReveal"
import { createClient } from "@/lib/supabase-client"
import Link from 'next/link'

interface Agent {
    id: string
    full_name: string | null
    role: string | null
    avatar_url: string | null
    bio: string | null
    phone: string | null
    whatsapp: string | null
    stats?: {
        sales: string
        rating: string
        experience: string
    }
    social?: {
        instagram?: string
        linkedin?: string
        email?: string
    }
}

export function Agents() {
    const [agents, setAgents] = useState<Agent[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        async function fetchAgents() {
            try {
                // Traemos perfiles con rol 'agent'
                // Nota: Podríamos agregar un filtro 'is_public' en el futuro
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('role', 'agent')
                    .limit(6)

                if (error) throw error

                // Adaptamos los datos o usamos fallbacks
                const formattedAgents = (data || []).map(p => ({
                    id: p.id,
                    full_name: p.full_name || 'Agente Garza Casas',
                    role: p.company_name || 'Consultor Inmobiliario',
                    avatar_url: p.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.full_name || 'A')}&background=1e3a5f&color=fff`,
                    bio: p.bio,
                    phone: p.phone || null,
                    whatsapp: p.whatsapp || p.phone || null,
                    stats: {
                        sales: "10+",
                        rating: "5.0",
                        experience: p.created_at ? `${new Date().getFullYear() - new Date(p.created_at).getFullYear() + 1} años` : '1 año'
                    },
                    social: {
                        email: `mailto:${p.email || ''}`,
                        instagram: '#',
                        linkedin: '#'
                    }
                }))

                setAgents(formattedAgents)
            } catch (error) {
                console.error('Error fetching agents:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchAgents()
    }, [])

    return (
        <section id="agentes" className="py-24 bg-zinc-50 relative overflow-hidden transition-colors duration-300">
            {/* Soft Ambient Background */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-black/5 to-transparent" />

            <div className="container mx-auto px-4 md:px-6 relative">
                <ScrollReveal className="text-center space-y-4 mb-16 max-w-3xl mx-auto">
                    <Badge variant="outline" className="border-blue-500/20 bg-blue-500/5 text-blue-600 rounded-full px-4 py-1 uppercase tracking-widest text-[10px] font-bold">
                        Nuestro Equipo
                    </Badge>
                    <h2 className="text-4xl font-black tracking-tighter text-zinc-700 sm:text-6xl font-heading leading-[0.9]">
                        Agentes que Transforman la <span className="text-blue-500 italic">Experiencia</span>
                    </h2>
                    <p className="text-zinc-500 text-lg font-medium leading-relaxed">
                        Expertos capacitados con herramientas de IA para ofrecerte el análisis de mercado más preciso de Monterrey.
                    </p>
                </ScrollReveal>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {agents.map((agent, i) => (
                            <ScrollReveal
                                key={agent.id}
                                delay={i * 0.1}
                                className="h-full"
                            >
                                <div className="group relative h-full bg-white rounded-[3rem] p-4 border border-zinc-200 transition-all duration-500 hover:border-blue-500/30 hover:shadow-[0_40px_100px_-30px_rgba(0,0,0,0.08)]">
                                    {/* Clickable image area → goes to agent profile */}
                                    <Link href={`/agentes/${agent.id}`} className="block">
                                        <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden mb-6">
                                            <img
                                                src={agent.avatar_url || ''}
                                                alt={agent.full_name || ''}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                            {/* View Profile Overlay */}
                                            <div className="absolute inset-0 flex items-end justify-center pb-8 opacity-0 group-hover:opacity-100 transition-all duration-500">
                                                <span className="bg-white/20 backdrop-blur-xl border border-white/30 text-white font-bold text-xs uppercase tracking-widest px-5 py-2.5 rounded-full flex items-center gap-2">
                                                    Ver perfil <ArrowUpRight className="h-3.5 w-3.5" />
                                                </span>
                                            </div>
                                        </div>
                                    </Link>

                                    <div className="px-4 pb-4 space-y-4">
                                        <div className="flex justify-between items-start">
                                            <Link href={`/agentes/${agent.id}`} className="hover:text-blue-600 transition-colors">
                                                <h3 className="text-xl font-bold text-zinc-700 group-hover:text-blue-600 transition-colors">{agent.full_name}</h3>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{agent.role}</p>
                                            </Link>
                                            <div className="flex items-center gap-1 bg-amber-500/10 text-amber-600 px-3 py-1 rounded-full text-xs font-bold shrink-0">
                                                <Star className="h-3 w-3 fill-amber-600" />
                                                {agent.stats?.rating}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-100">
                                            <div>
                                                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Experiencia</p>
                                                <p className="text-lg font-bold text-zinc-700">{agent.stats?.experience}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Rating</p>
                                                <p className="text-lg font-bold text-zinc-700">{agent.stats?.rating} ★</p>
                                            </div>
                                        </div>

                                        {/* Contact or View Profile */}
                                        {agent.whatsapp ? (
                                            <a
                                                href={`https://wa.me/${agent.whatsapp.replace(/\D/g, '')}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex w-full h-12 rounded-2xl bg-green-600 hover:bg-green-700 transition-all text-white font-bold items-center justify-center gap-2 shadow-sm"
                                            >
                                                <IconWhatsApp className="h-5 w-5" />
                                                Contactar por WhatsApp
                                            </a>
                                        ) : (
                                            <Link href={`/agentes/${agent.id}`}>
                                                <Button className="w-full h-12 rounded-2xl bg-zinc-950 text-white hover:bg-blue-600 transition-all font-bold gap-2">
                                                    <MessageSquare className="h-4 w-4" />
                                                    Ver perfil completo
                                                </Button>
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                )}
            </div>
        </section>
    )
}
