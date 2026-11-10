'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { FileText, Save, Image as ImageIcon, Upload, Loader2, Facebook, Instagram, Linkedin, Twitter, Youtube, RotateCcw, AlertCircle, CheckCircle, Sparkles, RefreshCw, Bot, Phone, Mail, MessageSquare } from 'lucide-react'
import { DEFAULT_CONTACT_CONFIG } from '@/lib/settings'
import { CMSSkeleton } from '@/components/admin/AdminSkeletons'
import { toast } from 'sonner'
import { analyzeLogoFileLuminance } from '@/lib/brand'
import { cn } from '@/lib/utils'

type LogoSlot = 'onDark' | 'onLight'
const MAX_LOGO_BYTES = 2 * 1024 * 1024

const supabase = createClient()

// Default hero image from Unsplash (original)
const DEFAULT_HERO_IMAGE = "https://images.unsplash.com/photo-1582407947304-fd86f028f716?q=80&w=1600&auto=format&fit=crop"

// Minimum recommended dimensions
const MIN_HERO_WIDTH = 1280
const MIN_HERO_HEIGHT = 720
const RECOMMENDED_HERO_WIDTH = 1920
const RECOMMENDED_HERO_HEIGHT = 1080

export default function AdminCMS() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [uploadingHero, setUploadingHero] = useState(false)
    const [uploadingIcon, setUploadingIcon] = useState(false)

    // Hero Section
    const [heroTitle, setHeroTitle] = useState('')
    const [heroSubtitle, setHeroSubtitle] = useState('')
    const [heroImageUrl, setHeroImageUrl] = useState('')
    const [heroImageDimensions, setHeroImageDimensions] = useState<{ width: number, height: number } | null>(null)
    const heroFileRef = useRef<HTMLInputElement>(null)

    // Site Icon
    const [siteIconUrl, setSiteIconUrl] = useState('')
    const iconFileRef = useRef<HTMLInputElement>(null)

    // Logotipos de marca (fondo oscuro / fondo claro)
    const [logoOnDarkUrl, setLogoOnDarkUrl] = useState('')
    const [logoOnLightUrl, setLogoOnLightUrl] = useState('')
    const [uploadingLogo, setUploadingLogo] = useState<LogoSlot | null>(null)
    const logoOnDarkFileRef = useRef<HTMLInputElement>(null)
    const logoOnLightFileRef = useRef<HTMLInputElement>(null)

    // Contact Info (Barra Superior y Footer)
    const [contactPhone, setContactPhone] = useState('')
    const [contactEmail, setContactEmail] = useState('')
    const [contactWhatsapp, setContactWhatsapp] = useState('')

    // Social Media
    const [socialMedia, setSocialMedia] = useState({
        facebook: '',
        instagram: '',
        linkedin: '',
        twitter: '',
        youtube: ''
    })

    // SEO
    const [seoTitle, setSeoTitle] = useState('')
    const [seoDescription, setSeoDescription] = useState('')
    const [seoKeywords, setSeoKeywords] = useState('')
    const [generatingSeo, setGeneratingSeo] = useState(false)
    const [detectedServices, setDetectedServices] = useState<string[] | null>(null)

    useEffect(() => {
        fetchSettings()
    }, [])

    useEffect(() => {
        if (heroImageUrl) {
            loadImageDimensions(heroImageUrl)
        }
    }, [heroImageUrl])

    const loadImageDimensions = (url: string) => {
        const img = new Image()
        img.onload = () => {
            setHeroImageDimensions({ width: img.width, height: img.height })
        }
        img.src = url
    }

    const fetchSettings = async () => {
        try {
            const baseColumns = 'hero_title, hero_subtitle, hero_image_url, site_icon_url, contact_phone, contact_email, contact_whatsapp, social_facebook, social_instagram, social_linkedin, social_twitter, social_youtube, seo_title, seo_description, seo_keywords'
            let { data, error: fetchError }: { data: any; error: any } = await supabase
                .from('site_settings')
                .select(`${baseColumns}, logo_on_dark_url, logo_on_light_url`)
                .single()

            // Compatibilidad: si aún no se aplicaron migraciones recientes, reintentar con columnas base
            if (fetchError) {
                const fallbackColumns = 'hero_title, hero_subtitle, hero_image_url, site_icon_url, social_facebook, social_instagram, social_linkedin, social_twitter, social_youtube, seo_title, seo_description, seo_keywords'
                const retry = await supabase.from('site_settings').select(fallbackColumns).single()
                data = retry.data
                fetchError = retry.error
            }

            if (data) {
                setHeroTitle(data.hero_title || '')
                setHeroSubtitle(data.hero_subtitle || '')
                setHeroImageUrl(data.hero_image_url || DEFAULT_HERO_IMAGE)
                setSiteIconUrl(data.site_icon_url || '')
                setLogoOnDarkUrl(data.logo_on_dark_url || '')
                setLogoOnLightUrl(data.logo_on_light_url || '')
                setContactPhone(data.contact_phone || DEFAULT_CONTACT_CONFIG.phone)
                setContactEmail(data.contact_email || DEFAULT_CONTACT_CONFIG.email)
                setContactWhatsapp(data.contact_whatsapp || DEFAULT_CONTACT_CONFIG.whatsapp)
                setSocialMedia({
                    facebook: data.social_facebook || '',
                    instagram: data.social_instagram || '',
                    linkedin: data.social_linkedin || '',
                    twitter: data.social_twitter || '',
                    youtube: data.social_youtube || ''
                })
                setSeoTitle(data.seo_title || '')
                setSeoDescription(data.seo_description || '')
                setSeoKeywords(data.seo_keywords || '')
            }
        } catch (error) {
            console.error('Error fetching settings:', error)
        } finally {
            setLoading(false)
        }
    }

    const validateImageDimensions = (file: File): Promise<{ valid: boolean, width: number, height: number, message?: string }> => {
        return new Promise((resolve) => {
            const img = new Image()
            const url = URL.createObjectURL(file)

            img.onload = () => {
                URL.revokeObjectURL(url)
                const { width, height } = img

                if (width < MIN_HERO_WIDTH || height < MIN_HERO_HEIGHT) {
                    resolve({
                        valid: false,
                        width,
                        height,
                        message: `La imagen es demasiado pequeña (${width}x${height}px). Mínimo recomendado: ${MIN_HERO_WIDTH}x${MIN_HERO_HEIGHT}px`
                    })
                } else if (width < RECOMMENDED_HERO_WIDTH || height < RECOMMENDED_HERO_HEIGHT) {
                    resolve({
                        valid: true,
                        width,
                        height,
                        message: `Imagen aceptable (${width}x${height}px), pero se recomienda ${RECOMMENDED_HERO_WIDTH}x${RECOMMENDED_HERO_HEIGHT}px para mejor calidad`
                    })
                } else {
                    resolve({
                        valid: true,
                        width,
                        height,
                        message: `Imagen óptima (${width}x${height}px)`
                    })
                }
            }

            img.onerror = () => {
                URL.revokeObjectURL(url)
                resolve({
                    valid: false,
                    width: 0,
                    height: 0,
                    message: 'Error al cargar la imagen'
                })
            }

            img.src = url
        })
    }

    const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const validation = await validateImageDimensions(file)

        if (!validation.valid) {
            toast.error(validation.message || 'Imagen inválida')
            return
        }

        if (validation.message && validation.message.includes('aceptable')) {
            toast.warning(validation.message)
        }

        setUploadingHero(true)
        try {
            const publicUrl = await uploadAssetViaApi(file, 'hero')
            setHeroImageUrl(publicUrl)
            toast.success(`Imagen del Hero cargada exitosamente (${validation.width}x${validation.height}px)`)
        } catch (error: any) {
            toast.error('Error al cargar imagen: ' + error.message)
        } finally {
            setUploadingHero(false)
        }
    }

    const uploadAssetViaApi = async (file: File, prefix: string): Promise<string> => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('prefix', prefix)

        const res = await fetch('/api/admin/cms/upload', {
            method: 'POST',
            body: formData,
        })

        if (!res.ok) {
            const errData = await res.json().catch(() => ({}))
            throw new Error(errData.error || `Error ${res.status} al subir archivo`)
        }

        const data = await res.json()
        if (!data.publicUrl) {
            throw new Error('No se recibió la URL pública del archivo.')
        }
        return data.publicUrl
    }

    const handleRestoreDefaultHero = () => {
        if (confirm('¿Estás seguro de restaurar la imagen original del Hero?')) {
            setHeroImageUrl(DEFAULT_HERO_IMAGE)
            toast.success('Imagen del Hero restaurada a la original')
        }
    }

    const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploadingIcon(true)
        try {
            const publicUrl = await uploadAssetViaApi(file, 'icon')
            setSiteIconUrl(publicUrl)
            toast.success('Favicon / Isotipo cargado exitosamente')
        } catch (error: any) {
            toast.error('Error al cargar favicon: ' + error.message)
        } finally {
            setUploadingIcon(false)
        }
    }

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>, slot: LogoSlot) => {
        const file = e.target.files?.[0]
        e.target.value = ''
        if (!file) return

        if (file.size > MAX_LOGO_BYTES) {
            toast.error('El logotipo no debe superar 2 MB')
            return
        }

        // Análisis inteligente de contraste antes de subir
        const luminance = await analyzeLogoFileLuminance(file)
        if (luminance !== null) {
            if (slot === 'onDark' && luminance < 0.35) {
                toast.warning('Este logotipo parece oscuro: podría verse poco sobre fondos oscuros. Se recomienda una versión blanca o clara.')
            } else if (slot === 'onLight' && luminance > 0.75) {
                toast.warning('Este logotipo parece muy claro: podría perderse sobre fondos blancos. Se recomienda una versión oscura o a color.')
            }
        }

        setUploadingLogo(slot)
        try {
            const prefix = slot === 'onDark' ? 'logo-dark-bg' : 'logo-light-bg'
            const publicUrl = await uploadAssetViaApi(file, prefix)

            if (slot === 'onDark') setLogoOnDarkUrl(publicUrl)
            else setLogoOnLightUrl(publicUrl)

            toast.success('Logotipo cargado. Presiona "Guardar Todo" para publicarlo.')
        } catch (error: any) {
            toast.error('Error al cargar logotipo: ' + error.message)
        } finally {
            setUploadingLogo(null)
        }
    }

    const handleGenerateSeo = async () => {
        setGeneratingSeo(true)
        try {
            const res = await fetch('/api/admin/cms/ai-seo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            })

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}))
                throw new Error(errData.error || `Error ${res.status} al consultar al Agente SEO`)
            }

            const data = await res.json()
            if (data.meta_title) setSeoTitle(data.meta_title)
            if (data.meta_description) setSeoDescription(data.meta_description)
            if (data.keywords) setSeoKeywords(data.keywords)
            if (data.detected_services) setDetectedServices(data.detected_services)

            toast.success('¡SEO optimizado por el Agente Experto con los servicios actuales!')
        } catch (error: any) {
            toast.error('Error al generar SEO: ' + error.message)
        } finally {
            setGeneratingSeo(false)
        }
    }

    const handleSaveSettings = async () => {
        setSaving(true)

        try {
            const payload = {
                hero_title: heroTitle,
                hero_subtitle: heroSubtitle,
                hero_image_url: heroImageUrl,
                site_icon_url: siteIconUrl,
                logo_on_dark_url: logoOnDarkUrl || null,
                logo_on_light_url: logoOnLightUrl || null,
                contact_phone: contactPhone,
                contact_email: contactEmail,
                contact_whatsapp: contactWhatsapp,
                social_facebook: socialMedia.facebook,
                social_instagram: socialMedia.instagram,
                social_linkedin: socialMedia.linkedin,
                social_twitter: socialMedia.twitter,
                social_youtube: socialMedia.youtube,
                seo_title: seoTitle,
                seo_description: seoDescription,
                seo_keywords: seoKeywords,
            }

            const res = await fetch('/api/admin/cms/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}))
                throw new Error(errData.error || `Error ${res.status} al guardar configuración`)
            }

            toast.success('Configuración guardada exitosamente')
        } catch (error: any) {
            toast.error('Error al guardar: ' + error.message)
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return <CMSSkeleton />
    }

    const isDefaultHeroImage = heroImageUrl === DEFAULT_HERO_IMAGE

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-zinc-900">CMS - Gestión de Contenido</h1>
                    <p className="text-zinc-600 mt-2 font-medium">Edita el contenido y apariencia del sitio</p>
                </div>
                <Button
                    onClick={handleSaveSettings}
                    disabled={saving}
                    className="gap-2 shadow-lg shadow-blue-500/20"
                >
                    {saving ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /> Guardando...</>
                    ) : (
                        <><Save className="h-4 w-4" /> Guardar Todo</>
                    )}
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-zinc-200 lg:col-span-2">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-zinc-900 flex items-center gap-2 font-black">
                                <ImageIcon className="h-5 w-5" /> Banner Hero (Página Principal)
                            </CardTitle>
                            {!isDefaultHeroImage && (
                                <Button
                                    onClick={handleRestoreDefaultHero}
                                    variant="outline"
                                    size="sm"
                                    className="gap-2"
                                >
                                    <RotateCcw className="h-4 w-4" /> Restaurar Original
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-zinc-700">Imagen de Fondo</Label>
                            <div className="flex gap-4 items-start">
                                <div className="flex-1">
                                    {heroImageUrl ? (
                                        <div className="space-y-2">
                                            <div className="relative aspect-video rounded-lg overflow-hidden border border-zinc-200">
                                                <img src={heroImageUrl} alt="Hero" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                                    <Button onClick={() => heroFileRef.current?.click()} variant="secondary" size="sm" disabled={uploadingHero}>
                                                        {uploadingHero ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Upload className="h-4 w-4 mr-2" /> Cambiar Imagen</>}
                                                    </Button>
                                                </div>
                                            </div>
                                            {heroImageDimensions && (
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="text-zinc-600">Dimensiones: {heroImageDimensions.width}x{heroImageDimensions.height}px</span>
                                                    {isDefaultHeroImage && <span className="text-blue-600 font-medium">Imagen Original</span>}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div onClick={() => heroFileRef.current?.click()} className="aspect-video rounded-lg border-2 border-dashed border-zinc-300 bg-zinc-50 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                                            <Upload className="h-12 w-12 text-zinc-400 mb-2" />
                                            <p className="text-sm text-zinc-600 font-medium">Haz clic para subir imagen</p>
                                        </div>
                                    )}
                                    <input ref={heroFileRef} type="file" accept="image/*" onChange={handleHeroImageUpload} className="hidden" />
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="hero-title" className="text-zinc-700 font-bold">Título Principal</Label>
                                <Input id="hero-title" value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} className="bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="hero-subtitle" className="text-zinc-700 font-bold">Subtítulo</Label>
                                <Input id="hero-subtitle" value={heroSubtitle} onChange={(e) => setHeroSubtitle(e.target.value)} className="bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Logotipos de marca: fondo oscuro y fondo claro */}
                <Card className="border-zinc-200 lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-zinc-900 font-black">
                            <ImageIcon className="h-5 w-5" />
                            Logotipo de Garza Casas (Fondo Oscuro y Claro)
                        </CardTitle>
                        <p className="text-sm text-zinc-500 font-medium">
                            El sitio detecta automáticamente el fondo detrás del logotipo (navbar transparente, hero, menús, footer, login) y muestra la versión correcta. Si solo cargas una versión, se usará en ambos fondos.
                        </p>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {([
                                {
                                    slot: 'onDark' as LogoSlot,
                                    title: 'Para fondos OSCUROS',
                                    hint: 'Versión blanca o clara del logotipo',
                                    url: logoOnDarkUrl,
                                    setUrl: setLogoOnDarkUrl,
                                    ref: logoOnDarkFileRef,
                                    previewClass: 'bg-zinc-950 border-zinc-800',
                                    emptyText: 'text-zinc-500',
                                },
                                {
                                    slot: 'onLight' as LogoSlot,
                                    title: 'Para fondos CLAROS',
                                    hint: 'Versión oscura o a color del logotipo',
                                    url: logoOnLightUrl,
                                    setUrl: setLogoOnLightUrl,
                                    ref: logoOnLightFileRef,
                                    previewClass: 'bg-white border-zinc-200',
                                    emptyText: 'text-zinc-400',
                                },
                            ]).map((item) => (
                                <div key={item.slot} className="space-y-3">
                                    <div>
                                        <p className="text-sm font-black text-zinc-900">{item.title}</p>
                                        <p className="text-xs text-zinc-500">{item.hint} · PNG/SVG/WebP transparente · máx. 2 MB</p>
                                    </div>
                                    <div className={`h-32 rounded-2xl border flex items-center justify-center p-6 ${item.previewClass}`}>
                                        {item.url ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={item.url} alt={item.title} className="max-h-full max-w-full object-contain" />
                                        ) : (
                                            <span className={`text-xs font-bold uppercase tracking-widest ${item.emptyText}`}>Sin logotipo</span>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => item.ref.current?.click()}
                                            disabled={uploadingLogo !== null}
                                            className="flex-1 gap-2"
                                        >
                                            {uploadingLogo === item.slot ? (
                                                <><Loader2 className="h-4 w-4 animate-spin" /> Subiendo...</>
                                            ) : (
                                                <><Upload className="h-4 w-4" /> {item.url ? 'Cambiar logotipo' : 'Subir logotipo'}</>
                                            )}
                                        </Button>
                                        {item.url && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                onClick={() => item.setUrl('')}
                                                disabled={uploadingLogo !== null}
                                                className="text-zinc-500 hover:text-red-600 hover:bg-red-50"
                                            >
                                                Quitar
                                            </Button>
                                        )}
                                    </div>
                                    <input
                                        ref={item.ref}
                                        type="file"
                                        accept="image/png,image/svg+xml,image/webp,image/jpeg"
                                        onChange={(e) => handleLogoUpload(e, item.slot)}
                                        className="hidden"
                                    />
                                </div>
                            ))}
                        </div>
                        {(logoOnDarkUrl || logoOnLightUrl) && !(logoOnDarkUrl && logoOnLightUrl) && (
                            <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 font-medium">
                                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                                Solo hay una versión cargada; se usará en ambos fondos. Para máximo contraste carga también la versión {logoOnDarkUrl ? 'para fondos claros' : 'para fondos oscuros'}.
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-zinc-200">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-zinc-900 font-black">
                            <ImageIcon className="h-5 w-5" />
                            Favicon (Icono del Sitio)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                            <p className="text-xs text-blue-800 font-medium mb-1">📌 Recomendaciones:</p>
                            <ul className="text-xs text-blue-700 space-y-1 ml-4 list-disc">
                                <li>Tamaño recomendado: <strong>512x512px</strong> o <strong>192x192px</strong></li>
                                <li>Formato: <strong>PNG</strong> con fondo transparente</li>
                                <li>El favicon aparecerá en la pestaña del navegador</li>
                            </ul>
                        </div>
                        <div className="flex gap-4 items-center">
                            {siteIconUrl && (
                                <div className="h-24 w-24 rounded-lg overflow-hidden border-2 border-zinc-200 bg-white shadow-sm">
                                    <img src={siteIconUrl} alt="Favicon" className="w-full h-full object-contain p-2" />
                                </div>
                            )}
                            <div className="flex-1 space-y-2">
                                <Button
                                    onClick={() => iconFileRef.current?.click()}
                                    variant="outline"
                                    disabled={uploadingIcon}
                                    className="w-full gap-2"
                                >
                                    {uploadingIcon ? (
                                        <><Loader2 className="h-4 w-4 animate-spin" /> Subiendo...</>
                                    ) : (
                                        <><Upload className="h-4 w-4" /> {siteIconUrl ? 'Cambiar Favicon' : 'Subir Favicon'}</>
                                    )}
                                </Button>
                                {siteIconUrl && (
                                    <p className="text-xs text-green-600 flex items-center gap-1">
                                        <CheckCircle className="h-3 w-3" />
                                        Favicon configurado correctamente
                                    </p>
                                )}
                            </div>
                            <input ref={iconFileRef} type="file" accept="image/png,image/jpeg,image/svg+xml,image/x-icon" onChange={handleIconUpload} className="hidden" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-zinc-200">
                    <CardHeader><CardTitle className="text-zinc-900 font-black">Redes Sociales</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                        <div className="space-y-1"><Label className="text-zinc-700 font-bold">Facebook</Label><Input value={socialMedia.facebook} onChange={(e) => setSocialMedia({ ...socialMedia, facebook: e.target.value })} className="bg-zinc-50 border-zinc-200 text-zinc-900" /></div>
                        <div className="space-y-1"><Label className="text-zinc-700 font-bold">Instagram</Label><Input value={socialMedia.instagram} onChange={(e) => setSocialMedia({ ...socialMedia, instagram: e.target.value })} className="bg-zinc-50 border-zinc-200 text-zinc-900" /></div>
                        <div className="space-y-1"><Label className="text-zinc-700 font-bold">LinkedIn</Label><Input value={socialMedia.linkedin} onChange={(e) => setSocialMedia({ ...socialMedia, linkedin: e.target.value })} className="bg-zinc-50 border-zinc-200 text-zinc-900" /></div>
                    </CardContent>
                </Card>

                {/* Datos de Contacto (Barra Superior y Footer) */}
                <Card className="border-zinc-200 lg:col-span-2 shadow-sm">
                    <CardHeader className="border-b border-zinc-100 pb-4">
                        <div>
                            <CardTitle className="text-zinc-900 font-black flex items-center gap-2">
                                <Phone className="h-5 w-5 text-blue-600" />
                                Datos de Contacto (Barra Superior y Footer)
                            </CardTitle>
                            <p className="text-xs text-zinc-500 font-medium mt-1">
                                Esta información se actualiza automáticamente en la barra superior y en el pie de página de todas las secciones del sitio (Inicio, Propiedades, Agentes, Planes, etc.).
                            </p>
                        </div>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-5">
                        <div className="space-y-1.5">
                            <Label className="text-zinc-700 font-bold flex items-center gap-1.5 text-xs">
                                <Phone className="h-3.5 w-3.5 text-blue-500" />
                                Teléfono Principal
                            </Label>
                            <Input
                                value={contactPhone}
                                onChange={(e) => setContactPhone(e.target.value)}
                                placeholder="+52 (81) 1234-5678"
                                className="bg-zinc-50 border-zinc-200 text-zinc-900 font-medium"
                            />
                            <p className="text-[11px] text-zinc-400">Permite llamadas directas al hacer clic en la barra superior.</p>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-zinc-700 font-bold flex items-center gap-1.5 text-xs">
                                <Mail className="h-3.5 w-3.5 text-blue-500" />
                                Correo Electrónico
                            </Label>
                            <Input
                                value={contactEmail}
                                onChange={(e) => setContactEmail(e.target.value)}
                                placeholder="contacto@garzacasas.com"
                                className="bg-zinc-50 border-zinc-200 text-zinc-900 font-medium"
                            />
                            <p className="text-[11px] text-zinc-400">Abre el cliente de correo al hacer clic en la barra superior.</p>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-zinc-700 font-bold flex items-center gap-1.5 text-xs">
                                <MessageSquare className="h-3.5 w-3.5 text-emerald-500" />
                                WhatsApp de Contacto
                            </Label>
                            <Input
                                value={contactWhatsapp}
                                onChange={(e) => setContactWhatsapp(e.target.value)}
                                placeholder="https://wa.me/528112345678"
                                className="bg-zinc-50 border-zinc-200 text-zinc-900 font-medium"
                            />
                            <p className="text-[11px] text-zinc-400">Enlace directo al chat de WhatsApp o número internacional.</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-zinc-200 lg:col-span-2 shadow-sm">
                    <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-100 pb-4">
                        <div>
                            <CardTitle className="text-zinc-900 font-black flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-blue-600" />
                                Configuración SEO Inmobiliario
                            </CardTitle>
                            <p className="text-xs text-zinc-500 font-medium mt-1">
                                Optimizado para posicionamiento orgánico en Google Search y rich snippets en México.
                            </p>
                        </div>
                        <Button
                            type="button"
                            onClick={handleGenerateSeo}
                            disabled={generatingSeo || saving}
                            className="bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-md shadow-blue-500/20 shrink-0 font-bold text-xs"
                        >
                            {generatingSeo ? (
                                <><Loader2 className="h-4 w-4 animate-spin" /> Analizando servicios...</>
                            ) : (
                                <><Sparkles className="h-4 w-4 text-blue-200" /> Optimizar con Agente SEO IA</>
                            )}
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-5 pt-5">
                        {detectedServices && detectedServices.length > 0 && (
                            <div className="bg-blue-50/60 border border-blue-200/80 rounded-2xl p-4 text-xs text-blue-900 space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 font-bold">
                                        <Bot className="h-4 w-4 text-blue-600" />
                                        <span>Servicios y paquetes detectados y sincronizados por el Agente IA:</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleGenerateSeo}
                                        disabled={generatingSeo}
                                        className="text-[11px] text-blue-700 hover:underline flex items-center gap-1 font-semibold"
                                    >
                                        <RefreshCw className={cn("h-3 w-3", generatingSeo && "animate-spin")} /> Re-analizar
                                    </button>
                                </div>
                                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-blue-800 list-disc list-inside">
                                    {detectedServices.map((service, idx) => (
                                        <li key={idx} className="truncate">{service}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <Label className="text-zinc-700 font-bold text-xs">Meta Title (Google SERP)</Label>
                                    <span className={cn(
                                        "text-[10px] font-bold px-2 py-0.5 rounded-full",
                                        seoTitle.length >= 45 && seoTitle.length <= 65 ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                                    )}>
                                        {seoTitle.length} / 60 caracteres
                                    </span>
                                </div>
                                <Input
                                    value={seoTitle}
                                    onChange={(e) => setSeoTitle(e.target.value)}
                                    placeholder="Garza Casas IA | Bienes Raíces y Casas en Monterrey con IA"
                                    className="bg-zinc-50 border-zinc-200 text-zinc-900"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <Label className="text-zinc-700 font-bold text-xs">Keywords (Separadas por coma)</Label>
                                    <span className="text-[10px] text-zinc-400 font-medium">
                                        {seoKeywords ? seoKeywords.split(',').filter(Boolean).length : 0} términos
                                    </span>
                                </div>
                                <Input
                                    value={seoKeywords}
                                    onChange={(e) => setSeoKeywords(e.target.value)}
                                    placeholder="casas en monterrey, bienes raices san pedro, avaluo IA..."
                                    className="bg-zinc-50 border-zinc-200 text-zinc-900"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <Label className="text-zinc-700 font-bold text-xs">Meta Description (Snippet de resultados)</Label>
                                <span className={cn(
                                    "text-[10px] font-bold px-2 py-0.5 rounded-full",
                                    seoDescription.length >= 135 && seoDescription.length <= 165 ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                                )}>
                                    {seoDescription.length} / 155 caracteres
                                </span>
                            </div>
                            <Textarea
                                rows={3}
                                value={seoDescription}
                                onChange={(e) => setSeoDescription(e.target.value)}
                                placeholder="Encuentra casas y departamentos en Monterrey con valuación e inteligencia artificial..."
                                className="bg-zinc-50 border-zinc-200 text-zinc-900 leading-relaxed"
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
