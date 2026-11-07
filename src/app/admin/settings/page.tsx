'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Loader2, Save, Building2, Plus, Trash2, Phone, Mail, Instagram, Facebook, ArrowRight, FileText, Sparkles } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'

const supabase = createClient()

export default function AdminSettings() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [contactConfig, setContactConfig] = useState({
        phone: '',
        email: '',
        whatsapp: '',
        instagram: '',
        facebook: ''
    })
    const [plans, setPlans] = useState<any[]>([])
    const [expandedPlan, setExpandedPlan] = useState<string | null>(null)

    useEffect(() => {
        async function fetchData() {
            try {
                // Fetch Global Settings (Flat Columns, id=1)
                const { data: siteData } = await supabase
                    .from('site_settings')
                    .select('*')
                    .eq('id', 1)
                    .single()

                if (siteData) {
                    setContactConfig({
                        phone: siteData.contact_phone || '',
                        email: siteData.contact_email || '',
                        whatsapp: siteData.contact_whatsapp || '',
                        instagram: siteData.social_instagram || '',
                        facebook: siteData.social_facebook || ''
                    })
                }

                // Fetch Plans
                const { data: plansData } = await supabase
                    .from('subscriptions_config')
                    .select('*')
                    .order('priority', { ascending: true })

                if (plansData) {
                    setPlans(plansData)
                }
            } catch (error) {
                console.error('Error fetching admin settings:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const handleSaveContact = async () => {
        setSaving(true)
        try {
            const { error } = await supabase
                .from('site_settings')
                .upsert({
                    id: 1,
                    contact_phone: contactConfig.phone,
                    contact_email: contactConfig.email,
                    contact_whatsapp: contactConfig.whatsapp,
                    social_instagram: contactConfig.instagram,
                    social_facebook: contactConfig.facebook,
                    updated_at: new Date().toISOString()
                })

            if (error) throw error
            toast.success('¡Información de contacto actualizada correctamente!')
        } catch (error: any) {
            toast.error('Error guardando contacto: ' + error.message)
        } finally {
            setSaving(false)
        }
    }

    async function handleUpdatePlan(planId: string, updates: any) {
        const { error } = await supabase
            .from('subscriptions_config')
            .update(updates)
            .eq('id', planId)

        if (error) {
            toast.error('Error actualizando plan: ' + error.message)
        } else {
            setPlans(plans.map(p => p.id === planId ? { ...p, ...updates } : p))
        }
    }

    function updatePlanFeature(planId: string, featureKey: string, value: any) {
        const plan = plans.find(p => p.id === planId)
        if (!plan) return

        const updatedFeatures = {
            ...(plan.features || {}),
            [featureKey]: value
        }

        handleUpdatePlan(planId, { features: updatedFeatures })
    }

    async function handleDeletePlan(planId: string) {
        if (!confirm('¿Estás seguro de eliminar este plan?')) return

        const { error } = await supabase
            .from('subscriptions_config')
            .delete()
            .eq('id', planId)

        if (error) {
            toast.error('Error eliminando plan: ' + error.message)
        } else {
            setPlans(plans.filter(p => p.id !== planId))
            toast.success('Plan eliminado correctamente')
        }
    }

    async function handleAddPlan() {
        const newPlan = {
            name: 'Nuevo Plan',
            monthly_price: 0,
            yearly_price: 0,
            description: 'Descripción del plan',
            priority: plans.length + 1,
            features: {
                properties_limit: 5,
                images_per_property: 3,
                priority_tier: 1,
                ai_analysis: false,
                advanced_stats: false,
                priority_support: false,
                featured_badge: false
            }
        }

        const { data, error } = await supabase
            .from('subscriptions_config')
            .insert(newPlan)
            .select()
            .single()

        if (error) {
            toast.error('Error creando plan: ' + error.message)
        } else if (data) {
            setPlans([...plans, data])
            toast.success('Plan creado correctamente')
        }
    }

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="container mx-auto py-10 px-4 max-w-7xl">
            <div className="mb-8">
                <h1 className="text-3xl font-black font-heading text-zinc-900">Configuración Global</h1>
                <p className="text-zinc-600 font-medium">Gestiona la configuración visual y comercial de Garza Casas IA.</p>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
                {/* CMS Visual & Branding Shortcut Card */}
                <Card className="border-zinc-200 shadow-xl bg-gradient-to-br from-indigo-900 to-zinc-950 text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                    <CardHeader>
                        <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-1">
                            <Sparkles className="h-4 w-4" />
                            Personalización Visual
                        </div>
                        <CardTitle className="text-2xl font-black text-white flex items-center gap-2">
                            <FileText className="h-6 w-6 text-indigo-400" />
                            CMS y Marca del Sitio
                        </CardTitle>
                        <CardDescription className="text-zinc-300 text-sm leading-relaxed">
                            Personaliza el Banner Hero de la página principal, el Favicon de la pestaña, los títulos SEO y los enlaces a redes sociales en un solo lugar.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                                <p className="font-bold text-white mb-0.5">Hero & Textos</p>
                                <p className="text-zinc-400 text-[11px]">Título, subtítulo e imagen principal</p>
                            </div>
                            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                                <p className="font-bold text-white mb-0.5">Favicon & SEO</p>
                                <p className="text-zinc-400 text-[11px]">Icono y metadatos de Google</p>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="pt-2">
                        <Link href="/admin/cms" className="w-full">
                            <Button className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold gap-2 shadow-lg shadow-indigo-600/30">
                                Ir al Editor de Contenido CMS
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </Link>
                    </CardFooter>
                </Card>

                {/* Contact Config Card */}
                <Card className="border-zinc-200 shadow-xl bg-white">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-zinc-900 font-black">
                            <Phone className="h-5 w-5" />
                            Información de Contacto
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="contact_phone" className="text-zinc-700">Teléfono</Label>
                                <Input
                                    id="contact_phone"
                                    value={contactConfig.phone}
                                    onChange={(e) => setContactConfig({ ...contactConfig, phone: e.target.value })}
                                    placeholder="+52 (81) ..."
                                    className="bg-zinc-50 border-zinc-200 text-zinc-900"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="contact_email" className="text-zinc-700">Email</Label>
                                <Input
                                    id="contact_email"
                                    value={contactConfig.email}
                                    onChange={(e) => setContactConfig({ ...contactConfig, email: e.target.value })}
                                    placeholder="contacto@..."
                                    className="bg-zinc-50 border-zinc-200 text-zinc-900"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="contact_whatsapp" className="text-zinc-700">Enlace WhatsApp</Label>
                            <Input
                                id="contact_whatsapp"
                                value={contactConfig.whatsapp}
                                onChange={(e) => setContactConfig({ ...contactConfig, whatsapp: e.target.value })}
                                placeholder="https://wa.me/..."
                                className="bg-zinc-50 border-zinc-200 text-zinc-900"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="social_instagram" className="text-zinc-700">Instagram URL</Label>
                                <div className="relative">
                                    <Instagram className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                                    <Input
                                        id="social_instagram"
                                        value={contactConfig.instagram}
                                        onChange={(e) => setContactConfig({ ...contactConfig, instagram: e.target.value })}
                                        placeholder="https://instagram.com/..."
                                        className="pl-9 bg-zinc-50 border-zinc-200 text-zinc-900"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="social_facebook" className="text-zinc-700">Facebook URL</Label>
                                <div className="relative">
                                    <Facebook className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                                    <Input
                                        id="social_facebook"
                                        value={contactConfig.facebook}
                                        onChange={(e) => setContactConfig({ ...contactConfig, facebook: e.target.value })}
                                        placeholder="https://facebook.com/..."
                                        className="pl-9 bg-zinc-50 border-zinc-200 text-zinc-900"
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={handleSaveContact} disabled={saving} className="w-full gap-2 py-6 text-lg font-bold shadow-lg shadow-blue-500/20 bg-zinc-800 hover:bg-zinc-900 text-white">
                            {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                            Guardar Contacto
                        </Button>
                    </CardFooter>
                </Card>

                {/* Packages & PayPal Monetization Shortcut Card */}
                <Card className="border-zinc-200 shadow-xl bg-gradient-to-br from-blue-900 via-indigo-950 to-zinc-950 text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                    <CardHeader>
                        <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-widest mb-1">
                            <Sparkles className="h-4 w-4" />
                            Comercio y PayPal API v2
                        </div>
                        <CardTitle className="text-2xl font-black text-white flex items-center gap-2">
                            <Building2 className="h-6 w-6 text-blue-400" />
                            Paquetes y Suscripciones
                        </CardTitle>
                        <CardDescription className="text-zinc-300 text-sm leading-relaxed">
                            Gestiona de forma dedicada los planes (Gratis, Pro, Enterprise), los precios en MXN para PayPal, las viñetas visuales y los límites reales de software.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                                <p className="font-bold text-white mb-0.5">Precios PayPal</p>
                                <p className="text-zinc-400 text-[11px]">Validación MXN y cálculo anual con descuento</p>
                            </div>
                            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                                <p className="font-bold text-white mb-0.5">Viñetas & Límites</p>
                                <p className="text-zinc-400 text-[11px]">Editor de beneficios y límites de propiedades</p>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="pt-2">
                        <Link href="/admin/packages" className="w-full">
                            <Button className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold gap-2 shadow-lg shadow-blue-600/30">
                                Abrir Gestor Especializado de Paquetes
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </Link>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
