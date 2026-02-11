'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Loader2, Save, Image as ImageIcon, Upload, Building2, Plus, Trash2, Check, X } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'

const supabase = createClient()

export default function AdminSettings() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [config, setConfig] = useState({
        title: '',
        subtitle: '',
        image_url: ''
    })
    const [plans, setPlans] = useState<any[]>([])
    const [expandedPlan, setExpandedPlan] = useState<string | null>(null)

    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        async function fetchData() {
            // Fetch Hero Config
            const { data: heroData } = await supabase
                .from('site_settings')
                .select('value')
                .eq('key', 'hero_config')
                .single()

            if (heroData) {
                setConfig(heroData.value)
            }

            // Fetch Plans
            const { data: plansData } = await supabase
                .from('subscriptions_config')
                .select('*')
                .order('priority', { ascending: true })

            if (plansData) {
                setPlans(plansData)
            }

            setLoading(false)
        }
        fetchData()
    }, [])

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        setUploading(true)
        try {
            const fileExt = file.name.split('.').pop()
            const fileName = `hero-bg-${Math.random()}.${fileExt}`
            const filePath = `${fileName}`

            // Try 'marketing' (lowercase) first
            let bucketName = 'marketing'
            let { error: uploadError } = await supabase.storage
                .from(bucketName)
                .upload(filePath, file)

            // If bucket not found, try 'MARKETING' (uppercase)
            if (uploadError && (uploadError.message.includes('Bucket not found') || (uploadError as any).error === 'Bucket not found')) {
                console.log('Bucket "marketing" not found, trying "MARKETING"...')
                bucketName = 'MARKETING'
                const retry = await supabase.storage
                    .from(bucketName)
                    .upload(filePath, file)
                uploadError = retry.error
            }

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from(bucketName)
                .getPublicUrl(filePath)

            setConfig(prev => ({ ...prev, image_url: publicUrl }))
            alert('Imagen subida con éxito (Recuerda guardar los cambios finales)')
        } catch (error: any) {
            console.error('Upload error:', error)
            alert('Error al subir imagen: ' + error.message)
        } finally {
            setUploading(false)
        }
    }

    async function handleSaveHero() {
        setSaving(true)
        const { error } = await supabase
            .from('site_settings')
            .upsert({
                key: 'hero_config',
                value: config,
                updated_at: new Date().toISOString()
            })

        if (error) {
            alert('Error guardando configuración: ' + error.message)
        } else {
            alert('¡Configuración de Hero actualizada!')
        }
        setSaving(false)
    }

    async function handleUpdatePlan(planId: string, updates: any) {
        const { error } = await supabase
            .from('subscriptions_config')
            .update(updates)
            .eq('id', planId)

        if (error) {
            alert('Error actualizando plan: ' + error.message)
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
            alert('Error eliminando plan: ' + error.message)
        } else {
            setPlans(plans.filter(p => p.id !== planId))
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
            alert('Error creando plan: ' + error.message)
        } else if (data) {
            setPlans([...plans, data])
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
                <h1 className="text-3xl font-bold font-heading text-zinc-700">Panel de Administración</h1>
                <p className="text-zinc-500">Gestiona la configuración visual y comercial de Garza Casas IA.</p>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
                {/* Hero Config Card */}
                <Card className="border-zinc-200 shadow-xl bg-white">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-zinc-700">
                            <ImageIcon className="h-5 w-5" />
                            Configuración del Hero
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title" className="text-zinc-700">Título del Banner</Label>
                            <Input
                                id="title"
                                value={config.title}
                                onChange={(e) => setConfig({ ...config, title: e.target.value })}
                                placeholder="Ej: Encuentra tu hogar ideal..."
                                className="bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="subtitle" className="text-zinc-700">Subtítulo / Descripción</Label>
                            <textarea
                                id="subtitle"
                                rows={3}
                                value={config.subtitle}
                                onChange={(e) => setConfig({ ...config, subtitle: e.target.value })}
                                placeholder="Descripción corta debajo del título..."
                                className="flex w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 ring-offset-background placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                            />
                        </div>

                        <div className="space-y-4">
                            <Label className="text-zinc-700">Imagen de Fondo</Label>
                            <div className="flex flex-col gap-4">
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="relative flex aspect-video cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50 transition-all hover:bg-zinc-100"
                                >
                                    {config.image_url ? (
                                        <img src={config.image_url} alt="Preview" className="h-full w-full object-cover rounded-lg" />
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 text-zinc-400">
                                            <Upload className="h-10 w-10" />
                                            <span>Subir nueva imagen</span>
                                        </div>
                                    )}
                                    {uploading && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                                            <Loader2 className="h-8 w-8 animate-spin text-white" />
                                        </div>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={handleSaveHero} disabled={saving || uploading} className="w-full gap-2 py-6 text-lg font-bold shadow-lg shadow-blue-500/20">
                            {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                            Guardar Configuración Hero
                        </Button>
                    </CardFooter>
                </Card>

                {/* Plans Config Card */}
                <Card className="border-zinc-200 shadow-xl bg-white lg:col-span-1">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-zinc-700">
                                <Building2 className="h-5 w-5" />
                                Planes y Suscripciones
                            </CardTitle>
                            <Button onClick={handleAddPlan} size="sm" className="gap-2">
                                <Plus className="h-4 w-4" />
                                Nuevo Plan
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
                        {plans.map((plan) => {
                            const isExpanded = expandedPlan === plan.id
                            const features = plan.features || {}

                            return (
                                <div key={plan.id} className="p-4 rounded-xl border border-zinc-200 bg-zinc-50 space-y-4">
                                    {/* Basic Info */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <Label className="text-xs text-zinc-500 uppercase">Nombre</Label>
                                            <Input
                                                value={plan.name}
                                                onChange={(e) => handleUpdatePlan(plan.id, { name: e.target.value })}
                                                className="bg-white border-zinc-200 h-8 text-sm text-zinc-900 placeholder:text-zinc-400"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs text-zinc-500 uppercase">Prioridad</Label>
                                            <Input
                                                type="number"
                                                value={plan.priority || 1}
                                                onChange={(e) => handleUpdatePlan(plan.id, { priority: parseInt(e.target.value) })}
                                                className="bg-white border-zinc-200 h-8 text-sm text-zinc-900 placeholder:text-zinc-400"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <Label className="text-xs text-zinc-500 uppercase">Precio Mensual ($)</Label>
                                            <Input
                                                type="number"
                                                value={plan.monthly_price}
                                                onChange={(e) => handleUpdatePlan(plan.id, { monthly_price: parseFloat(e.target.value) })}
                                                className="bg-white border-zinc-200 h-8 text-sm text-zinc-900 placeholder:text-zinc-400"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs text-zinc-500 uppercase">Precio Anual ($)</Label>
                                            <Input
                                                type="number"
                                                value={plan.yearly_price || 0}
                                                onChange={(e) => handleUpdatePlan(plan.id, { yearly_price: parseFloat(e.target.value) })}
                                                className="bg-white border-zinc-200 h-8 text-sm text-zinc-900 placeholder:text-zinc-400"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <Label className="text-xs text-zinc-500 uppercase">Descripción</Label>
                                        <textarea
                                            className="flex w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            rows={2}
                                            value={plan.description || ''}
                                            onChange={(e) => handleUpdatePlan(plan.id, { description: e.target.value })}
                                        />
                                    </div>

                                    {/* Toggle Features Section */}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setExpandedPlan(isExpanded ? null : plan.id)}
                                        className="w-full text-xs"
                                    >
                                        {isExpanded ? 'Ocultar' : 'Mostrar'} Límites y Características
                                    </Button>

                                    {/* Features Section */}
                                    {isExpanded && (
                                        <div className="space-y-3 pt-2 border-t border-zinc-200">
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-1">
                                                    <Label className="text-xs text-zinc-500">Límite de Propiedades</Label>
                                                    <Input
                                                        type="number"
                                                        value={features.properties_limit || 5}
                                                        onChange={(e) => updatePlanFeature(plan.id, 'properties_limit', parseInt(e.target.value))}
                                                        className="bg-white border-zinc-200 h-8 text-sm text-zinc-900 placeholder:text-zinc-400"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-xs text-zinc-500">Imágenes por Propiedad</Label>
                                                    <Input
                                                        type="number"
                                                        value={features.images_per_property || 3}
                                                        onChange={(e) => updatePlanFeature(plan.id, 'images_per_property', parseInt(e.target.value))}
                                                        className="bg-white border-zinc-200 h-8 text-sm text-zinc-900 placeholder:text-zinc-400"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-1">
                                                <Label className="text-xs text-zinc-500">Tier de Prioridad (1-3)</Label>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    max="3"
                                                    value={features.priority_tier || 1}
                                                    onChange={(e) => updatePlanFeature(plan.id, 'priority_tier', parseInt(e.target.value))}
                                                    className="bg-white border-zinc-200 h-8 text-sm text-zinc-900 placeholder:text-zinc-400"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-xs text-zinc-500 uppercase">Características Premium</Label>
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <Checkbox
                                                            checked={features.ai_analysis || false}
                                                            onCheckedChange={(checked) => updatePlanFeature(plan.id, 'ai_analysis', checked)}
                                                        />
                                                        <Label className="text-xs text-zinc-700">Análisis con IA</Label>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Checkbox
                                                            checked={features.advanced_stats || false}
                                                            onCheckedChange={(checked) => updatePlanFeature(plan.id, 'advanced_stats', checked)}
                                                        />
                                                        <Label className="text-xs text-zinc-700">Estadísticas Avanzadas</Label>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Checkbox
                                                            checked={features.priority_support || false}
                                                            onCheckedChange={(checked) => updatePlanFeature(plan.id, 'priority_support', checked)}
                                                        />
                                                        <Label className="text-xs text-zinc-700">Soporte Prioritario</Label>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Checkbox
                                                            checked={features.featured_badge || false}
                                                            onCheckedChange={(checked) => updatePlanFeature(plan.id, 'featured_badge', checked)}
                                                        />
                                                        <Label className="text-xs text-zinc-700">Badge Destacado</Label>
                                                    </div>
                                                </div>
                                            </div>

                                            {features.featured_badge && (
                                                <div className="space-y-1">
                                                    <Label className="text-xs text-zinc-500">Texto del Badge</Label>
                                                    <Input
                                                        value={features.badge_text || ''}
                                                        onChange={(e) => updatePlanFeature(plan.id, 'badge_text', e.target.value)}
                                                        placeholder="Ej: Pro, Platino"
                                                        className="bg-white border-zinc-200 h-8 text-sm text-zinc-900 placeholder:text-zinc-400"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Delete Button */}
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleDeletePlan(plan.id)}
                                        className="w-full gap-2"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        Eliminar Plan
                                    </Button>
                                </div>
                            )
                        })}
                    </CardContent>
                    <CardFooter className="flex-col gap-2">
                        <div className="text-[10px] text-zinc-500 text-center w-full">
                            * Los cambios en los planes se guardan automáticamente al editar.
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
