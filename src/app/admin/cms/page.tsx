'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { FileText, Save, Image as ImageIcon, Upload, Loader2, Facebook, Instagram, Linkedin, Twitter, Youtube, RotateCcw, AlertCircle, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

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
            const { data } = await supabase
                .from('site_settings')
                .select('*')
                .single()

            if (data) {
                setHeroTitle(data.hero_title || '')
                setHeroSubtitle(data.hero_subtitle || '')
                setHeroImageUrl(data.hero_image_url || DEFAULT_HERO_IMAGE)
                setSiteIconUrl(data.site_icon_url || '')
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
            const fileExt = file.name.split('.').pop()
            const fileName = `hero-${Date.now()}.${fileExt}`
            const filePath = `cms/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('site-assets')
                .upload(filePath, file, { upsert: true })

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('site-assets')
                .getPublicUrl(filePath)

            setHeroImageUrl(publicUrl)
            toast.success(`Imagen del Hero cargada exitosamente (${validation.width}x${validation.height}px)`)
        } catch (error: any) {
            toast.error('Error al cargar imagen: ' + error.message)
        } finally {
            setUploadingHero(false)
        }
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
            const fileExt = file.name.split('.').pop()
            const fileName = `icon-${Date.now()}.${fileExt}`
            const filePath = `cms/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('site-assets')
                .upload(filePath, file, { upsert: true })

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('site-assets')
                .getPublicUrl(filePath)

            setSiteIconUrl(publicUrl)
            toast.success('Icono del sitio cargado exitosamente')
        } catch (error: any) {
            toast.error('Error al cargar icono: ' + error.message)
        } finally {
            setUploadingIcon(false)
        }
    }

    const handleSaveSettings = async () => {
        setSaving(true)

        try {
            const { error } = await supabase
                .from('site_settings')
                .upsert({
                    id: 1,
                    hero_title: heroTitle,
                    hero_subtitle: heroSubtitle,
                    hero_image_url: heroImageUrl,
                    site_icon_url: siteIconUrl,
                    social_facebook: socialMedia.facebook,
                    social_instagram: socialMedia.instagram,
                    social_linkedin: socialMedia.linkedin,
                    social_twitter: socialMedia.twitter,
                    social_youtube: socialMedia.youtube,
                    seo_title: seoTitle,
                    seo_description: seoDescription,
                    seo_keywords: seoKeywords,
                    updated_at: new Date().toISOString()
                })

            if (error) throw error

            toast.success('Configuración guardada exitosamente')
        } catch (error: any) {
            toast.error('Error al guardar: ' + error.message)
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        )
    }

    const isDefaultHeroImage = heroImageUrl === DEFAULT_HERO_IMAGE

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-zinc-900">CMS - Gestión de Contenido</h1>
                    <p className="text-zinc-500 mt-2">Edita el contenido y apariencia del sitio</p>
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
                            <CardTitle className="text-zinc-900 flex items-center gap-2">
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
                                <Label htmlFor="hero-title">Título Principal</Label>
                                <Input id="hero-title" value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} className="bg-zinc-50 border-zinc-200" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="hero-subtitle">Subtítulo</Label>
                                <Input id="hero-subtitle" value={heroSubtitle} onChange={(e) => setHeroSubtitle(e.target.value)} className="bg-zinc-50 border-zinc-200" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-zinc-200">
                    <CardHeader><CardTitle>Icono del Sitio</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-4 items-center">
                            {siteIconUrl && <div className="h-24 w-24 rounded-lg overflow-hidden border border-zinc-200 bg-white"><img src={siteIconUrl} alt="Icon" className="w-full h-full object-contain p-2" /></div>}
                            <div className="flex-1">
                                <Button onClick={() => iconFileRef.current?.click()} variant="outline" disabled={uploadingIcon} className="w-full gap-2">
                                    {uploadingIcon ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Upload className="h-4 w-4" /> Subir Icono</>}
                                </Button>
                            </div>
                            <input ref={iconFileRef} type="file" accept="image/*" onChange={handleIconUpload} className="hidden" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-zinc-200">
                    <CardHeader><CardTitle>Redes Sociales</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                        <div className="space-y-1"><Label>Facebook</Label><Input value={socialMedia.facebook} onChange={(e) => setSocialMedia({ ...socialMedia, facebook: e.target.value })} className="bg-zinc-50" /></div>
                        <div className="space-y-1"><Label>Instagram</Label><Input value={socialMedia.instagram} onChange={(e) => setSocialMedia({ ...socialMedia, instagram: e.target.value })} className="bg-zinc-50" /></div>
                        <div className="space-y-1"><Label>LinkedIn</Label><Input value={socialMedia.linkedin} onChange={(e) => setSocialMedia({ ...socialMedia, linkedin: e.target.value })} className="bg-zinc-50" /></div>
                    </CardContent>
                </Card>

                <Card className="border-zinc-200 lg:col-span-2">
                    <CardHeader><CardTitle>Configuración SEO</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1"><Label>Meta Title</Label><Input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} className="bg-zinc-50" /></div>
                            <div className="space-y-1"><Label>Keywords</Label><Input value={seoKeywords} onChange={(e) => setSeoKeywords(e.target.value)} className="bg-zinc-50" /></div>
                        </div>
                        <div className="space-y-1"><Label>Meta Description</Label><Textarea rows={3} value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} className="bg-zinc-50" /></div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
