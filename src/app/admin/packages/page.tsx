'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Loader2,
    Save,
    Plus,
    Trash2,
    Zap,
    Crown,
    Building2,
    Check,
    CreditCard,
    ArrowUp,
    ArrowDown,
    AlertCircle,
    Info,
    Sparkles,
    Shield,
    ExternalLink,
    HelpCircle,
    Eye,
    CheckCircle2
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
    UNLIMITED_LIMIT,
    isUnlimitedLimit,
    normalizePlanFeatures,
    syncFeatureBulletsWithLimits,
    hasPlanBulletMismatch
} from '@/lib/plans'

const supabase = createClient()

export interface PlanConfig {
    id: string
    name: string
    monthly_price: number
    yearly_price: number
    description: string
    priority: number
    features: string[]
    properties_limit: number
    images_per_property: number
    is_popular: boolean
    has_ai_analysis: boolean
    has_priority_support: boolean
    cta_type: 'register' | 'checkout' | 'contact'
    cta_label: string
    cta_url?: string | null
}

const DEFAULT_NEW_PLAN: Omit<PlanConfig, 'id'> = {
    name: 'Nuevo Plan',
    monthly_price: 299,
    yearly_price: 2990,
    description: 'Descripción para agentes inmobiliarios.',
    priority: 4,
    features: [
        'Hasta 20 propiedades',
        '8 imágenes por propiedad',
        'Soporte estándar'
    ],
    properties_limit: 20,
    images_per_property: 8,
    is_popular: false,
    has_ai_analysis: false,
    has_priority_support: false,
    cta_type: 'checkout',
    cta_label: 'Empezar ahora',
    cta_url: null
}

const FEATURE_SUGGESTIONS = [
    'Hasta 100 propiedades',
    'Fotos ilimitadas en HD',
    'Análisis de Mercado INEGI',
    'Generador de Descripciones IA',
    'Soporte VIP 24/7',
    'Account Manager dedicado',
    'Destacado en Página Principal',
    'Exportación a Portales'
]

export default function AdminPackagesPage() {
    const [plans, setPlans] = useState<PlanConfig[]>([])
    const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [newFeatureText, setNewFeatureText] = useState('')
    const [deleteConfirmPlanId, setDeleteConfirmPlanId] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor')

    useEffect(() => {
        fetchPlans()
    }, [])

    async function fetchPlans() {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('subscriptions_config')
                .select('id, name, monthly_price, yearly_price, description, priority, features, properties_limit, images_per_property, is_popular, has_ai_analysis, has_priority_support, cta_type, cta_label, cta_url')
                .order('priority', { ascending: true })

            if (error) throw error

            if (data && data.length > 0) {
                const normalizedPlans: PlanConfig[] = data.map((item: any) => {
                    const featuresArr = normalizePlanFeatures(item.features)
                    const fallbackProps = item.name === 'Enterprise' ? UNLIMITED_LIMIT : item.name === 'Pro' ? 20 : 3
                    const fallbackImgs = item.name === 'Enterprise' ? 15 : item.name === 'Pro' ? 5 : 3

                    return {
                        id: item.id,
                        name: item.name || 'Sin Nombre',
                        monthly_price: Number(item.monthly_price ?? 0),
                        yearly_price: Number(item.yearly_price ?? 0),
                        description: item.description || '',
                        priority: Number(item.priority ?? 1),
                        features: featuresArr,
                        properties_limit: item.properties_limit !== null && item.properties_limit !== undefined
                            ? Number(item.properties_limit)
                            : fallbackProps,
                        images_per_property: item.images_per_property !== null && item.images_per_property !== undefined
                            ? Number(item.images_per_property)
                            : fallbackImgs,
                        is_popular: Boolean(item.is_popular ?? (item.name === 'Pro')),
                        has_ai_analysis: Boolean(item.has_ai_analysis ?? (item.name !== 'Gratis')),
                        has_priority_support: Boolean(item.has_priority_support ?? (item.name !== 'Gratis')),
                        cta_type: item.cta_type || (item.name === 'Enterprise' ? 'contact' : Number(item.monthly_price ?? 0) === 0 ? 'register' : 'checkout'),
                        cta_label: item.cta_label || (item.name === 'Enterprise' ? 'Contactar' : Number(item.monthly_price ?? 0) === 0 ? 'Empezar gratis' : 'Empezar ahora'),
                        cta_url: item.cta_url || null
                    }
                })

                setPlans(normalizedPlans)
                if (!selectedPlanId || !normalizedPlans.find(p => p.id === selectedPlanId)) {
                    setSelectedPlanId(normalizedPlans[0].id)
                }
            }
        } catch (err: any) {
            console.error('Error al cargar planes:', err)
            toast.error('Error cargando planes: ' + (err.message || 'Error de conexión'))
        } finally {
            setLoading(false)
        }
    }

    const currentPlan = plans.find(p => p.id === selectedPlanId) || plans[0]

    function updateCurrentPlan(updates: Partial<PlanConfig>) {
        if (!currentPlan) return
        setPlans(plans.map(p => p.id === currentPlan.id ? { ...p, ...updates } : p))
    }

    function updatePlanLimitsAndSyncBullets(updates: { properties_limit?: number; images_per_property?: number }) {
        if (!currentPlan) return
        const nextPropsLimit = updates.properties_limit ?? currentPlan.properties_limit
        const nextImgsLimit = updates.images_per_property ?? currentPlan.images_per_property
        const syncedFeatures = syncFeatureBulletsWithLimits(
            currentPlan.features,
            nextPropsLimit,
            nextImgsLimit,
            { ensureBullets: true }
        )
        updateCurrentPlan({
            ...updates,
            features: syncedFeatures,
        })
    }

    function handleSyncCurrentPlanBullets() {
        if (!currentPlan) return
        const syncedFeatures = syncFeatureBulletsWithLimits(
            currentPlan.features,
            currentPlan.properties_limit,
            currentPlan.images_per_property,
            { ensureBullets: true }
        )
        updateCurrentPlan({ features: syncedFeatures })
        toast.success('Viñetas sincronizadas con los límites técnicos del plan')
    }

    // --- Manejadores de Viñetas (Features) ---
    function handleAddFeature(text?: string) {
        const textToAdd = (text || newFeatureText).trim()
        if (!textToAdd || !currentPlan) return
        if (currentPlan.features.includes(textToAdd)) {
            toast.info('Esta viñeta ya se encuentra en la lista')
            return
        }
        updateCurrentPlan({
            features: [...currentPlan.features, textToAdd]
        })
        setNewFeatureText('')
    }

    function handleRemoveFeature(index: number) {
        if (!currentPlan) return
        const updated = currentPlan.features.filter((_, i) => i !== index)
        updateCurrentPlan({ features: updated })
    }

    function handleEditFeature(index: number, newText: string) {
        if (!currentPlan) return
        const updated = [...currentPlan.features]
        updated[index] = newText
        updateCurrentPlan({ features: updated })
    }

    function handleMoveFeature(index: number, direction: 'up' | 'down') {
        if (!currentPlan) return
        const targetIndex = direction === 'up' ? index - 1 : index + 1
        if (targetIndex < 0 || targetIndex >= currentPlan.features.length) return
        const updated = [...currentPlan.features]
        const temp = updated[index]
        updated[index] = updated[targetIndex]
        updated[targetIndex] = temp
        updateCurrentPlan({ features: updated })
    }

    // --- Cálculo sugerido PayPal ---
    function handleAutoCalculateYearly() {
        if (!currentPlan) return
        // Fórmula estándar comercial: 10 meses = 2 meses gratis
        const suggestedYearly = Math.round(currentPlan.monthly_price * 10)
        updateCurrentPlan({ yearly_price: suggestedYearly })
        toast.success(`Precio anual calculado: $${suggestedYearly.toLocaleString('es-MX')} MXN (2 meses de descuento)`)
    }

    // --- Guardar en Supabase ---
    async function handleSaveCurrentPlan() {
        if (!currentPlan) return

        // Validaciones PayPal
        if (currentPlan.cta_type === 'checkout') {
            if (currentPlan.monthly_price <= 0) {
                toast.error('Un plan con pasarela PayPal debe tener un precio mensual mayor a $0 MXN.')
                return
            }
            if (currentPlan.yearly_price < 0) {
                toast.error('El precio anual no puede ser negativo.')
                return
            }
        }

        setSaving(true)
        const toastId = toast.loading(`Guardando cambios para ${currentPlan.name}...`)

        const hadMismatch = hasPlanBulletMismatch(
            currentPlan.features,
            currentPlan.properties_limit,
            currentPlan.images_per_property
        )
        const syncedFeatures = syncFeatureBulletsWithLimits(
            currentPlan.features,
            currentPlan.properties_limit,
            currentPlan.images_per_property,
            { ensureBullets: currentPlan.features.length === 0 }
        )

        try {
            // Intentar actualizar con todas las columnas
            const payload: any = {
                name: currentPlan.name.trim(),
                monthly_price: Number(currentPlan.monthly_price),
                yearly_price: Number(currentPlan.yearly_price),
                description: currentPlan.description.trim(),
                priority: Number(currentPlan.priority),
                features: syncedFeatures,
                properties_limit: currentPlan.properties_limit,
                images_per_property: currentPlan.images_per_property,
                is_popular: currentPlan.is_popular,
                has_ai_analysis: currentPlan.has_ai_analysis,
                has_priority_support: currentPlan.has_priority_support,
                cta_type: currentPlan.cta_type,
                cta_label: currentPlan.cta_label.trim(),
                cta_url: currentPlan.cta_url || null
            }

            const { error: fullUpdateError } = await supabase
                .from('subscriptions_config')
                .update(payload)
                .eq('id', currentPlan.id)

            if (fullUpdateError) {
                // Si faltan columnas en la base de datos (antes de aplicar migración SQL),
                // guardamos de forma segura las columnas base para no romper nada
                console.warn('Fallback a guardado de columnas base:', fullUpdateError.message)
                const safePayload = {
                    name: currentPlan.name.trim(),
                    monthly_price: Number(currentPlan.monthly_price),
                    yearly_price: Number(currentPlan.yearly_price),
                    description: currentPlan.description.trim(),
                    priority: Number(currentPlan.priority),
                    features: syncedFeatures
                }

                const { error: safeError } = await supabase
                    .from('subscriptions_config')
                    .update(safePayload)
                    .eq('id', currentPlan.id)

                if (safeError) throw safeError

                updateCurrentPlan({ features: syncedFeatures })
                toast.success('¡Plan guardado con éxito! (Aplica la migración SQL para habilitar límites avanzados en Supabase)', { id: toastId })
            } else {
                updateCurrentPlan({ features: syncedFeatures })
                toast.success(
                    hadMismatch
                        ? `¡Plan "${currentPlan.name}" guardado con viñetas sincronizadas!`
                        : `¡Plan "${currentPlan.name}" actualizado correctamente!`,
                    { id: toastId }
                )
            }
        } catch (err: any) {
            console.error('Error guardando plan:', err)
            toast.error('Error al guardar: ' + (err.message || 'Error desconocido'), { id: toastId })
        } finally {
            setSaving(false)
        }
    }

    // --- Crear Nuevo Plan ---
    async function handleCreatePlan() {
        setSaving(true)
        const toastId = toast.loading('Creando nuevo paquete...')

        try {
            const newPriority = plans.length > 0 ? Math.max(...plans.map(p => p.priority)) + 1 : 1
            const payload: any = {
                ...DEFAULT_NEW_PLAN,
                priority: newPriority,
                features: DEFAULT_NEW_PLAN.features
            }

            const { data, error } = await supabase
                .from('subscriptions_config')
                .insert(payload)
                .select('id')
                .single()

            if (error) {
                // Fallback seguro si faltan columnas
                const safePayload = {
                    name: DEFAULT_NEW_PLAN.name,
                    monthly_price: DEFAULT_NEW_PLAN.monthly_price,
                    yearly_price: DEFAULT_NEW_PLAN.yearly_price,
                    description: DEFAULT_NEW_PLAN.description,
                    priority: newPriority,
                    features: DEFAULT_NEW_PLAN.features
                }

                const { data: safeData, error: safeError } = await supabase
                    .from('subscriptions_config')
                    .insert(safePayload)
                    .select('id')
                    .single()

                if (safeError) throw safeError

                if (safeData) {
                    await fetchPlans()
                    setSelectedPlanId(safeData.id)
                    toast.success('¡Nuevo plan creado correctamente!', { id: toastId })
                }
            } else if (data) {
                await fetchPlans()
                setSelectedPlanId(data.id)
                toast.success('¡Nuevo plan creado correctamente!', { id: toastId })
            }
        } catch (err: any) {
            console.error('Error creando plan:', err)
            toast.error('Error al crear plan: ' + err.message, { id: toastId })
        } finally {
            setSaving(false)
        }
    }

    // --- Eliminar Plan ---
    async function handleDeletePlan(planId: string) {
        setSaving(true)
        const toastId = toast.loading('Eliminando plan...')

        try {
            const { error } = await supabase
                .from('subscriptions_config')
                .delete()
                .eq('id', planId)

            if (error) throw error

            const remaining = plans.filter(p => p.id !== planId)
            setPlans(remaining)
            setDeleteConfirmPlanId(null)
            if (remaining.length > 0) {
                setSelectedPlanId(remaining[0].id)
            }
            toast.success('Plan eliminado correctamente', { id: toastId })
        } catch (err: any) {
            console.error('Error eliminando plan:', err)
            toast.error('Error al eliminar: ' + err.message, { id: toastId })
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                <p className="text-sm font-bold text-zinc-500">Cargando paquetes y configuración de PayPal...</p>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-7xl space-y-8">
            {/* Header Principal */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[2.5rem] border border-zinc-200/80 shadow-sm">
                <div>
                    <div className="flex items-center gap-2 text-blue-600 text-xs font-bold uppercase tracking-widest mb-1">
                        <Sparkles className="h-4 w-4" />
                        Comercio & Monetización
                    </div>
                    <h1 className="text-3xl font-black font-heading text-zinc-900 tracking-tight">
                        Gestor de Paquetes y Suscripciones
                    </h1>
                    <p className="text-zinc-500 text-sm mt-0.5">
                        Configura los precios para PayPal API v2 (MXN), los límites de publicación y las viñetas visuales.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        onClick={() => setActiveTab(activeTab === 'editor' ? 'preview' : 'editor')}
                        variant="outline"
                        className="rounded-2xl h-11 border-zinc-200 font-bold gap-2 text-zinc-700 hover:bg-zinc-100"
                    >
                        <Eye className="h-4 w-4" />
                        {activeTab === 'editor' ? 'Ver Tarjetas en Vivo' : 'Volver al Editor'}
                    </Button>
                    <Button
                        onClick={handleCreatePlan}
                        disabled={saving}
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl h-11 px-5 font-bold gap-2 shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
                    >
                        <Plus className="h-4 w-4" />
                        Crear Nuevo Plan
                    </Button>
                </div>
            </div>

            {/* --- SECCIÓN 1: VISTA PREVIA VISUAL EN TIEMPO REAL --- */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-black text-zinc-900 flex items-center gap-2">
                            <Eye className="h-5 w-5 text-blue-600" />
                            Vista Previa de Tarjetas (Lo que ve el usuario)
                        </h2>
                        <p className="text-xs text-zinc-500">
                            Haz clic en cualquier tarjeta para seleccionarla y editarla inmediatamente.
                        </p>
                    </div>
                    <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700 font-bold text-xs">
                        {plans.length} Planes Activos
                    </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {plans.map((plan) => {
                        const isSelected = plan.id === currentPlan?.id
                        const isPopular = plan.is_popular
                        const isFree = plan.monthly_price === 0
                        const isEnterprise = plan.cta_type ? plan.cta_type === 'contact' : plan.name === 'Enterprise'
                        const previewFeatures = syncFeatureBulletsWithLimits(
                            plan.features,
                            plan.properties_limit,
                            plan.images_per_property,
                            { ensureBullets: plan.features.length === 0 }
                        )
                        const hasMismatch = hasPlanBulletMismatch(
                            plan.features,
                            plan.properties_limit,
                            plan.images_per_property
                        )

                        return (
                            <div
                                key={plan.id}
                                onClick={() => setSelectedPlanId(plan.id)}
                                className={cn(
                                    "relative flex flex-col rounded-[2.5rem] border p-7 cursor-pointer transition-all duration-300",
                                    isSelected
                                        ? "ring-2 ring-blue-600 border-blue-600 bg-white shadow-xl shadow-blue-600/10 scale-[1.02]"
                                        : "border-zinc-200 bg-zinc-50/70 hover:bg-white hover:border-zinc-300 hover:shadow-md"
                                )}
                            >
                                {isPopular && (
                                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20">
                                        <div className="bg-blue-600 text-white text-[9px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 whitespace-nowrap border-2 border-white">
                                            <Zap className="h-3 w-3 fill-white" />
                                            PLAN RECOMENDADO
                                        </div>
                                    </div>
                                )}

                                {(isSelected || hasMismatch) && (
                                    <div className="absolute top-4 right-4 flex items-center gap-1.5">
                                        {hasMismatch && (
                                            <Badge className="bg-amber-100 text-amber-800 border border-amber-300 text-[9px] px-2 py-0.5 font-bold">
                                                Desfase viñetas
                                            </Badge>
                                        )}
                                        {isSelected && (
                                            <Badge className="bg-blue-600 text-white border-none text-[9px] px-2 py-0.5">
                                                Editando
                                            </Badge>
                                        )}
                                    </div>
                                )}

                                <div className="space-y-3 pb-4">
                                    <div className={cn(
                                        "inline-flex h-12 w-12 items-center justify-center rounded-2xl",
                                        isPopular
                                            ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/30"
                                            : isFree
                                                ? "bg-zinc-100 text-zinc-600"
                                                : "bg-indigo-50 text-indigo-600"
                                    )}>
                                        {isEnterprise ? <Crown className="h-6 w-6" /> : isPopular ? <Zap className="h-6 w-6" /> : <Building2 className="h-6 w-6" />}
                                    </div>

                                    <h3 className="text-2xl font-black text-zinc-900">{plan.name}</h3>

                                    <div className="flex items-baseline text-zinc-900">
                                        {isFree ? (
                                            <span className="text-4xl font-black tracking-tight">Gratis</span>
                                        ) : (
                                            <>
                                                <span className="text-3xl font-black">$</span>
                                                <span className="text-4xl font-black leading-none ml-0.5">
                                                    {Math.floor(plan.monthly_price).toLocaleString('es-MX')}
                                                </span>
                                                <span className="ml-1 text-xs font-bold text-zinc-400">/mes</span>
                                            </>
                                        )}
                                    </div>

                                    <p className="text-xs text-zinc-500 leading-relaxed font-medium min-h-[36px]">
                                        {plan.description || 'Sin descripción configurada.'}
                                    </p>
                                </div>

                                <div className="border-t border-zinc-100 pt-4 flex-1 flex flex-col justify-between">
                                    <ul className="space-y-2.5 mb-6">
                                        {previewFeatures.map((feature, i) => (
                                            <li key={i} className="flex items-start gap-2.5 text-xs text-zinc-600 font-medium">
                                                <div className={cn(
                                                    "flex h-4 w-4 mt-0.5 shrink-0 items-center justify-center rounded-full",
                                                    isPopular ? "bg-blue-600/10 text-blue-600" : "bg-black/5 text-zinc-500"
                                                )}>
                                                    <Check className="h-2.5 w-2.5" />
                                                </div>
                                                <span className="leading-tight">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <div className="pt-2">
                                        <div className={cn(
                                            "w-full h-11 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center transition-all",
                                            isPopular
                                                ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                                                : isFree
                                                    ? "bg-zinc-900 text-white"
                                                    : "bg-blue-50 text-blue-600 border border-blue-200"
                                        )}>
                                            {plan.cta_label || (isEnterprise ? 'Contactar' : isFree ? 'Empezar gratis' : 'Empezar ahora')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* --- SECCIÓN 2: EDITOR DETALLADO DEL PLAN SELECCIONADO --- */}
            {currentPlan && (
                <div className="bg-white rounded-[2.5rem] border border-zinc-200 shadow-sm overflow-hidden">
                    {/* Header del Plan Seleccionado */}
                    <div className="p-6 md:p-8 bg-zinc-50/70 border-b border-zinc-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/20">
                                <CreditCard className="h-7 w-7" />
                            </div>
                            <div>
                                <div className="flex items-center gap-3">
                                    <h2 className="text-2xl font-black text-zinc-900">
                                        Editando: Plan {currentPlan.name}
                                    </h2>
                                    {currentPlan.is_popular && (
                                        <Badge className="bg-blue-600 text-white border-none font-bold text-xs">
                                            Recomendado
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-xs text-zinc-500 mt-0.5">
                                    Los cambios impactan el checkout de PayPal y la visualización pública.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {plans.length > 1 && (
                                <Button
                                    onClick={() => setDeleteConfirmPlanId(currentPlan.id)}
                                    variant="outline"
                                    className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-2xl font-bold h-11"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Eliminar Plan
                                </Button>
                            )}

                            <Button
                                onClick={handleSaveCurrentPlan}
                                disabled={saving}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl h-11 px-7 font-black gap-2 shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
                            >
                                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                Guardar Cambios
                            </Button>
                        </div>
                    </div>

                    <div className="p-6 md:p-8 space-y-8">
                        {/* 1. Información Comercial y Precios PayPal */}
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <CreditCard className="h-5 w-5 text-blue-600" />
                                <h3 className="text-lg font-black text-zinc-900">1. Comercial & Precios PayPal (MXN)</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-zinc-700 uppercase">Nombre del Plan</Label>
                                    <Input
                                        value={currentPlan.name}
                                        onChange={(e) => updateCurrentPlan({ name: e.target.value })}
                                        className="h-11 rounded-xl bg-zinc-50 border-zinc-200 font-bold"
                                        placeholder="Ej: Pro, Platino"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-xs font-bold text-zinc-700 uppercase">Precio Mensual (MXN)</Label>
                                        <span className="text-[10px] text-zinc-400 font-mono">Format: $599.00</span>
                                    </div>
                                    <div className="relative">
                                        <span className="absolute left-3.5 top-3 text-zinc-400 font-bold">$</span>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={currentPlan.monthly_price}
                                            onChange={(e) => updateCurrentPlan({ monthly_price: parseFloat(e.target.value) || 0 })}
                                            className="h-11 pl-8 rounded-xl bg-zinc-50 border-zinc-200 font-bold text-zinc-900"
                                            placeholder="599.00"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-xs font-bold text-zinc-700 uppercase">Precio Anual (MXN)</Label>
                                        <button
                                            type="button"
                                            onClick={handleAutoCalculateYearly}
                                            className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-1"
                                        >
                                            <Sparkles className="h-3 w-3" /> Auto (10 meses)
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <span className="absolute left-3.5 top-3 text-zinc-400 font-bold">$</span>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={currentPlan.yearly_price}
                                            onChange={(e) => updateCurrentPlan({ yearly_price: parseFloat(e.target.value) || 0 })}
                                            className="h-11 pl-8 rounded-xl bg-zinc-50 border-zinc-200 font-bold text-zinc-900"
                                            placeholder="5990.00"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-zinc-700 uppercase">Descripción Comercial</Label>
                                    <Input
                                        value={currentPlan.description}
                                        onChange={(e) => updateCurrentPlan({ description: e.target.value })}
                                        className="h-11 rounded-xl bg-zinc-50 border-zinc-200 text-sm"
                                        placeholder="Ej: Potencia tu presencia con herramientas de IA."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-zinc-700 uppercase">Prioridad / Orden</Label>
                                        <Input
                                            type="number"
                                            min="1"
                                            value={currentPlan.priority}
                                            onChange={(e) => updateCurrentPlan({ priority: parseInt(e.target.value) || 1 })}
                                            className="h-11 rounded-xl bg-zinc-50 border-zinc-200 font-bold"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-zinc-700 uppercase">Tipo de Acción / Botón</Label>
                                        <select
                                            value={currentPlan.cta_type}
                                            onChange={(e) => updateCurrentPlan({ cta_type: e.target.value as any })}
                                            className="h-11 w-full rounded-xl bg-zinc-50 border border-zinc-200 font-bold text-xs px-3 text-zinc-800"
                                        >
                                            <option value="checkout">Checkout PayPal (/dashboard/suscripcion)</option>
                                            <option value="register">Registro Gratuito (/registro)</option>
                                            <option value="contact">Contacto / WhatsApp (/contacto)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-zinc-700 uppercase">Texto del Botón (CTA)</Label>
                                    <Input
                                        value={currentPlan.cta_label}
                                        onChange={(e) => updateCurrentPlan({ cta_label: e.target.value })}
                                        className="h-11 rounded-xl bg-zinc-50 border-zinc-200 font-bold text-sm"
                                        placeholder="Ej: Empezar ahora, Contactar"
                                    />
                                </div>

                                {currentPlan.cta_type === 'contact' && (
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-zinc-700 uppercase">URL de Contacto o WhatsApp (Opcional)</Label>
                                        <Input
                                            value={currentPlan.cta_url || ''}
                                            onChange={(e) => updateCurrentPlan({ cta_url: e.target.value })}
                                            className="h-11 rounded-xl bg-zinc-50 border-zinc-200 text-sm"
                                            placeholder="https://wa.me/528180000000 o /contacto"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Caja de Simulación PayPal */}
                            <div className="mt-4 p-4 rounded-2xl bg-blue-50/60 border border-blue-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                                        <Shield className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-blue-900 uppercase tracking-wider">
                                            Simulación de Orden PayPal API v2
                                        </p>
                                        <p className="text-xs text-blue-700 font-medium mt-0.5">
                                            {currentPlan.monthly_price > 0 ? (
                                                <>Cobro mensual: <strong className="font-bold">${Number(currentPlan.monthly_price).toFixed(2)} MXN</strong> | Cobro anual: <strong className="font-bold">${Number(currentPlan.yearly_price).toFixed(2)} MXN</strong></>
                                            ) : (
                                                <span>Plan gratuito ($0 MXN) — Se activa sin requerir pago ni autorización de PayPal.</span>
                                            )}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="is_popular_toggle"
                                        checked={currentPlan.is_popular}
                                        onCheckedChange={(checked) => updateCurrentPlan({ is_popular: Boolean(checked) })}
                                    />
                                    <Label htmlFor="is_popular_toggle" className="text-xs font-bold text-zinc-900 cursor-pointer">
                                        Marcar como Plan Recomendado
                                    </Label>
                                </div>
                            </div>
                        </div>

                        {/* 2. Editor de Viñetas de Beneficios (Marketing) */}
                        <div className="pt-6 border-t border-zinc-200">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="h-5 w-5 text-indigo-600" />
                                        <h3 className="text-lg font-black text-zinc-900">2. Viñetas de Beneficios (Texto en la Tarjeta)</h3>
                                    </div>
                                    <p className="text-xs text-zinc-500">
                                        Se sincronizan automáticamente con los límites técnicos de la Sección 3 al editar límites o guardar.
                                    </p>
                                </div>
                                <Badge variant="outline" className="text-xs font-bold border-zinc-200">
                                    {currentPlan.features.length} Viñetas
                                </Badge>
                            </div>

                            {hasPlanBulletMismatch(
                                currentPlan.features,
                                currentPlan.properties_limit,
                                currentPlan.images_per_property
                            ) && (
                                <div className="mb-4 p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="flex items-start gap-2.5">
                                        <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                                        <p className="text-xs text-amber-900 font-medium">
                                            Las viñetas guardadas muestran un número distinto a los límites reales de la Sección 3 (<strong>{isUnlimitedLimit(currentPlan.properties_limit) ? 'Propiedades ilimitadas' : `${currentPlan.properties_limit} propiedades`}</strong> · <strong>{isUnlimitedLimit(currentPlan.images_per_property) ? 'Imágenes ilimitadas' : `${currentPlan.images_per_property} imágenes`}</strong>).
                                        </p>
                                    </div>
                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={handleSyncCurrentPlanBullets}
                                        className="bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shrink-0"
                                    >
                                        Sincronizar viñetas
                                    </Button>
                                </div>
                            )}

                            {/* Lista de viñetas con controles de orden y edición */}
                            <div className="space-y-2 mb-4">
                                {currentPlan.features.map((feature, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-50 border border-zinc-200 hover:border-zinc-300 transition-colors"
                                    >
                                        <div className="flex flex-col gap-0.5 text-zinc-400">
                                            <button
                                                type="button"
                                                onClick={() => handleMoveFeature(index, 'up')}
                                                disabled={index === 0}
                                                className="hover:text-blue-600 disabled:opacity-30 p-0.5"
                                                title="Subir posición"
                                            >
                                                <ArrowUp className="h-3.5 w-3.5" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleMoveFeature(index, 'down')}
                                                disabled={index === currentPlan.features.length - 1}
                                                className="hover:text-blue-600 disabled:opacity-30 p-0.5"
                                                title="Bajar posición"
                                            >
                                                <ArrowDown className="h-3.5 w-3.5" />
                                            </button>
                                        </div>

                                        <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 text-xs font-black">
                                            {index + 1}
                                        </div>

                                        <Input
                                            value={feature}
                                            onChange={(e) => handleEditFeature(index, e.target.value)}
                                            className="h-10 bg-white border-zinc-200 font-medium text-sm text-zinc-800"
                                            placeholder="Texto del beneficio..."
                                        />

                                        <Button
                                            type="button"
                                            onClick={() => handleRemoveFeature(index)}
                                            variant="ghost"
                                            size="sm"
                                            className="text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-xl shrink-0"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}

                                {currentPlan.features.length === 0 && (
                                    <div className="p-6 text-center border-2 border-dashed border-zinc-200 rounded-2xl text-zinc-400 text-xs font-medium">
                                        No hay viñetas añadidas para este plan. Añade una abajo o usa una sugerencia rápida.
                                    </div>
                                )}
                            </div>

                            {/* Agregar nueva viñeta */}
                            <div className="flex gap-2">
                                <Input
                                    value={newFeatureText}
                                    onChange={(e) => setNewFeatureText(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault()
                                            handleAddFeature()
                                        }
                                    }}
                                    placeholder="Escribe un nuevo beneficio (ej: Acceso a reportes de inversión en PDF)..."
                                    className="h-11 rounded-xl bg-zinc-50 border-zinc-200 text-sm font-medium"
                                />
                                <Button
                                    type="button"
                                    onClick={() => handleAddFeature()}
                                    className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl h-11 px-5 font-bold gap-2 shrink-0"
                                >
                                    <Plus className="h-4 w-4" />
                                    Agregar Viñeta
                                </Button>
                            </div>

                            {/* Sugerencias Rápidas */}
                            <div className="mt-3">
                                <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
                                    Sugerencias Rápidas (Haz clic para agregar):
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {FEATURE_SUGGESTIONS.map((sug, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => handleAddFeature(sug)}
                                            className="text-xs bg-zinc-100 hover:bg-blue-50 hover:text-blue-600 border border-zinc-200 hover:border-blue-200 px-3 py-1.5 rounded-full font-medium transition-all"
                                        >
                                            + {sug}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* 3. Configuración de Límites de Software (Enforced) */}
                        <div className="pt-6 border-t border-zinc-200">
                            <div className="flex items-center gap-2 mb-4">
                                <Shield className="h-5 w-5 text-emerald-600" />
                                <h3 className="text-lg font-black text-zinc-900">3. Límites Técnicos del Software (Restricciones del Sistema)</h3>
                            </div>
                            <p className="text-xs text-zinc-500 mb-6">
                                Estos valores controlan el código que valida los límites cuando el agente usa el dashboard.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-xs font-bold text-zinc-700 uppercase">Límite Máximo de Propiedades</Label>
                                        <div className="flex items-center gap-2">
                                            <Checkbox
                                                id="unlimited_properties"
                                                checked={isUnlimitedLimit(currentPlan.properties_limit)}
                                                onCheckedChange={(checked) => updatePlanLimitsAndSyncBullets({
                                                    properties_limit: checked ? UNLIMITED_LIMIT : (currentPlan.name === 'Gratis' ? 3 : 20)
                                                })}
                                            />
                                            <Label htmlFor="unlimited_properties" className="text-xs font-bold text-zinc-600 cursor-pointer">
                                                Ilimitadas
                                            </Label>
                                        </div>
                                    </div>
                                    <Input
                                        type="number"
                                        min="1"
                                        disabled={isUnlimitedLimit(currentPlan.properties_limit)}
                                        value={isUnlimitedLimit(currentPlan.properties_limit) ? UNLIMITED_LIMIT : currentPlan.properties_limit}
                                        onChange={(e) => {
                                            const raw = parseInt(e.target.value, 10)
                                            const safeVal = Number.isNaN(raw) ? 1 : Math.max(1, raw)
                                            updatePlanLimitsAndSyncBullets({ properties_limit: safeVal })
                                        }}
                                        className="h-11 rounded-xl bg-white border-zinc-200 font-bold"
                                    />
                                    <p className="text-[11px] text-zinc-400">
                                        Al modificar este valor, las viñetas de la Sección 2, `/registro`, `/planes` y el dashboard se actualizan automáticamente.
                                    </p>
                                </div>

                                <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-xs font-bold text-zinc-700 uppercase">Imágenes por Propiedad</Label>
                                        <div className="flex items-center gap-2">
                                            <Checkbox
                                                id="unlimited_images"
                                                checked={isUnlimitedLimit(currentPlan.images_per_property)}
                                                onCheckedChange={(checked) => updatePlanLimitsAndSyncBullets({
                                                    images_per_property: checked ? UNLIMITED_LIMIT : (currentPlan.name === 'Gratis' ? 3 : 15)
                                                })}
                                            />
                                            <Label htmlFor="unlimited_images" className="text-xs font-bold text-zinc-600 cursor-pointer">
                                                Ilimitadas
                                            </Label>
                                        </div>
                                    </div>
                                    <Input
                                        type="number"
                                        min="1"
                                        disabled={isUnlimitedLimit(currentPlan.images_per_property)}
                                        value={isUnlimitedLimit(currentPlan.images_per_property) ? UNLIMITED_LIMIT : currentPlan.images_per_property}
                                        onChange={(e) => {
                                            const raw = parseInt(e.target.value, 10)
                                            const safeVal = Number.isNaN(raw) ? 1 : Math.max(1, raw)
                                            updatePlanLimitsAndSyncBullets({ images_per_property: safeVal })
                                        }}
                                        className="h-11 rounded-xl bg-white border-zinc-200 font-bold"
                                    />
                                    <p className="text-[11px] text-zinc-400">
                                        Límite de fotografías que el formulario de propiedades permite adjuntar por publicación.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <p className="text-sm font-bold text-zinc-900">Herramientas de IA y Datos INEGI</p>
                                        <p className="text-xs text-zinc-500">Activa el asistente predictivo y los datos del INEGI.</p>
                                    </div>
                                    <Checkbox
                                        checked={currentPlan.has_ai_analysis}
                                        onCheckedChange={(checked) => updateCurrentPlan({ has_ai_analysis: Boolean(checked) })}
                                    />
                                </div>

                                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <p className="text-sm font-bold text-zinc-900">Soporte VIP Prioritario</p>
                                        <p className="text-xs text-zinc-500">Asigna badge PRIORITARIO y SLA &lt; 2 horas en tickets.</p>
                                    </div>
                                    <Checkbox
                                        checked={currentPlan.has_priority_support}
                                        onCheckedChange={(checked) => updateCurrentPlan({ has_priority_support: Boolean(checked) })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer con Botón de Guardado */}
                    <div className="p-6 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between">
                        <span className="text-xs text-zinc-500 font-medium">
                            * Los cambios aplicados se reflejarán inmediatamente en la pasarela de PayPal y en el catálogo.
                        </span>
                        <Button
                            onClick={handleSaveCurrentPlan}
                            disabled={saving}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl h-12 px-8 font-black gap-2 shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
                        >
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            Guardar Plan {currentPlan.name}
                        </Button>
                    </div>
                </div>
            )}

            {/* Modal de Confirmación de Eliminación (Cumpliendo Regla 6: Sin confirm() nativo) */}
            {deleteConfirmPlanId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-zinc-200 animate-in fade-in zoom-in-95">
                        <div className="h-12 w-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
                            <AlertCircle className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-zinc-900">¿Eliminar este plan?</h3>
                            <p className="text-sm text-zinc-500 mt-1">
                                Esta acción eliminará el paquete del catálogo y los agentes ya no podrán suscribirse a él. Esta acción no se puede deshacer.
                            </p>
                        </div>
                        <div className="flex gap-3 pt-2">
                            <Button
                                onClick={() => setDeleteConfirmPlanId(null)}
                                variant="outline"
                                className="flex-1 rounded-2xl h-11 font-bold"
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={() => handleDeletePlan(deleteConfirmPlanId)}
                                disabled={saving}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-2xl h-11 font-bold"
                            >
                                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sí, Eliminar'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
