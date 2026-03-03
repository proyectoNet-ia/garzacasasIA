'use client'

import { useState, useEffect } from 'react'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Star, MessageSquare, Mail, Loader2 } from "lucide-react"
import { IconInstagram, IconLinkedIn } from "@/components/ui/SocialIcons"
import { ScrollReveal } from "@/components/ui/ScrollReveal"
import { createClient } from "@/lib/supabase-client"

interface Agent {
    id: string
    full_name: string | null
    role: string | null
    avatar_url: string | null
    bio: string | null
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
                    avatar_url: p.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.full_name || 'A')}&background=0D0D0D&color=fff`,
                    bio: p.bio,
                    stats: {
                        sales: "10+", // Placeholder hasta tener tracking real
                        rating: "5.0",
                        experience: p.created_at ? `${new Date().getFullYear() - new Date(p.created_at).getFullYear() + 1} años` : '1 año'
                    },
                    social: {
                        email: `mailto:${p.email || ''}`,
                        instagram: '#', // Estos campos podrían agregarse a la DB después
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
                                <div
                                    className="group relative h-full bg-white rounded-[3rem] p-4 border border-zinc-200 transition-all duration-500 hover:border-blue-500/30 hover:shadow-[0_40px_100px_-30px_rgba(0,0,0,0.08)]"
                                >
                                    <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden mb-6">
                                        <img
                                            src={agent.avatar_url || ''}
                                            alt={agent.full_name || ''}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4 translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-100">
                                            {[
                                                { render: () => <IconInstagram className="h-4 w-4" />, href: agent.social?.instagram },
                                                { render: () => <IconLinkedIn className="h-4 w-4" />, href: agent.social?.linkedin },
                                                { render: () => <Mail className="h-4 w-4" />, href: agent.social?.email }
                                            ].map((social, idx) => (
                                                <a
                                                    key={idx}
                                                    href={social.href || '#'}
                                                    className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center text-white hover:bg-white hover:text-blue-600 transition-all"
                                                >
                                                    {social.render()}
                                                </a>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="px-4 pb-4 space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-xl font-bold text-zinc-700">{agent.full_name}</h3>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{agent.role}</p>
                                            </div>
                                            <div className="flex items-center gap-1 bg-amber-500/10 text-amber-600 px-3 py-1 rounded-full text-xs font-bold">
                                                <Star className="h-3 w-3 fill-amber-600" />
                                                {agent.stats?.rating}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-100">
                                            <div>
                                                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Ventas</p>
                                                <p className="text-lg font-bold text-zinc-700">{agent.stats?.sales}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Exp.</p>
                                                <p className="text-lg font-bold text-zinc-700">{agent.stats?.experience}</p>
                                            </div>
                                        </div>

                                        <Button className="w-full h-12 rounded-2xl bg-zinc-950 text-white hover:bg-blue-600 transition-all font-bold gap-2">
                                            <MessageSquare className="h-4 w-4" />
                                            Contactar ahora
                                        </Button>
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
