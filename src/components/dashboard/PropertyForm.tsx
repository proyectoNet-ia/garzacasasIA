import React, { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'
import { Loader2, Upload, X, Check, Image as ImageIcon, Plus, MapPin, Info, ExternalLink, Locate, Map as MapIcon, Sparkles, FileText, SlidersHorizontal, ArrowRight, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { optimizeImage } from '@/lib/image-optimizer'
import { useSubscriptionLimits } from '@/hooks/useSubscriptionLimits'
import { toast } from 'sonner'
import { ESTADOS, getMunicipiosPorEstado, type Estado, type Municipio } from '@/lib/inegi/geografia'
import { MapPicker } from './MapPicker'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

interface PropertyFormProps {
    initialData?: any
    onSuccess: () => void
    onCancel: () => void
}

export function PropertyForm({ initialData, onSuccess, onCancel }: PropertyFormProps) {
    const [supabase] = useState(() => createClient())
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [activeTab, setActiveTab] = useState('general')
    const { limits, checkCanUploadImages, planName } = useSubscriptionLimits()

    const [formData, setFormData] = useState<{
        title: string
        description: string
        price: string | number
        location: string
        property_type: string
        listing_type: string
        main_image_url: string
        images: string[]
        status: string
        features: {
            beds: string | number
            baths: string | number
            sqft: string | number
            colonia?: string
            codigo_postal?: string
        }
        municipio_clave?: string
        colonia?: string
        codigo_postal?: string
        latitude?: string | number
        longitude?: string | number
    }>({
        title: initialData?.title || '',
        description: initialData?.description || '',
        price: initialData?.price || '',
        location: initialData?.location || '',
        property_type: initialData?.property_type || 'Casa',
        listing_type: initialData?.listing_type || 'Venta',
        main_image_url: initialData?.main_image_url || '',
        images: initialData?.images || [],
        status: initialData?.status || 'active',
        features: initialData?.features || { beds: '', baths: '', sqft: '' },
        municipio_clave: initialData?.municipio_clave || '',
        colonia: initialData?.features?.colonia || '',
        codigo_postal: initialData?.features?.codigo_postal || initialData?.features?.zip_code || '',
        latitude: initialData?.latitude || '',
        longitude: initialData?.longitude || ''
    })

    const [selectedEstadoId, setSelectedEstadoId] = useState<string>('')
    const [municipiosDisponibles, setMunicipiosDisponibles] = useState<Municipio[]>([])
    const [loadingMunicipios, setLoadingMunicipios] = useState(false)
    const [isMapPickerOpen, setIsMapPickerOpen] = useState(false)
    const [isGeocoding, setIsGeocoding] = useState(false)
    const [isLocatingGPS, setIsLocatingGPS] = useState(false)
    const [coordInput, setCoordInput] = useState(
        initialData?.latitude && initialData?.longitude
            ? `${initialData.latitude}, ${initialData.longitude}`
            : ''
    )

    // Inicializar estados/municipios si estamos editando
    useEffect(() => {
        async function initLocation() {
            if (initialData?.municipio_clave) {
                const edoId = initialData.municipio_clave.substring(0, 2)
                setSelectedEstadoId(edoId)

                // Cargamos municipios de ese estado localmente
                const data = getMunicipiosPorEstado(edoId)
                setMunicipiosDisponibles(data)
            }
        }
        initLocation()
    }, [initialData])

    const buildLocationString = (colonia?: string, munId?: string, cp?: string) => {
        const activeMunId = munId !== undefined ? munId : formData.municipio_clave
        const mun = (municipiosDisponibles || []).find(m => m.id === activeMunId)
        const edo = ESTADOS.find(e => e.id === selectedEstadoId)
        const col = (colonia !== undefined ? colonia : formData.colonia || '').trim()
        const codigo = (cp !== undefined ? cp : formData.codigo_postal || '').trim()

        const parts: string[] = []
        if (col) parts.push(col)
        if (mun && edo) {
            parts.push(`${mun.nombre}, ${edo.nombre}`)
        } else if (mun) {
            parts.push(mun.nombre)
        } else if (edo) {
            parts.push(edo.nombre)
        }
        if (codigo) parts.push(`C.P. ${codigo}`)

        return parts.join(', ')
    }

    const handleEstadoChange = (estadoId: string) => {
        setSelectedEstadoId(estadoId)
        setFormData(prev => ({ ...prev, municipio_clave: '' }))

        // Carga instantánea desde JSON local
        const data = getMunicipiosPorEstado(estadoId)
        setMunicipiosDisponibles(data)
    }

    const handleMunicipioChange = (municipioId: string) => {
        const mun = (municipiosDisponibles || []).find(m => m.id === municipioId)
        const edo = ESTADOS.find(e => e.id === selectedEstadoId)
        if (mun && edo) {
            setFormData(prev => ({
                ...prev,
                municipio_clave: municipioId,
                location: buildLocationString(prev.colonia, municipioId, prev.codigo_postal)
            }))
        }
    }

    const handleColoniaChange = (coloniaVal: string) => {
        setFormData(prev => ({
            ...prev,
            colonia: coloniaVal,
            location: buildLocationString(coloniaVal, prev.municipio_clave, prev.codigo_postal)
        }))
    }

    const handleCodigoPostalChange = (cpVal: string) => {
        setFormData(prev => ({
            ...prev,
            codigo_postal: cpVal,
            location: buildLocationString(prev.colonia, prev.municipio_clave, cpVal)
        }))
    }

    const openInGoogleMaps = () => {
        const edo = ESTADOS.find(e => e.id === selectedEstadoId)
        const mun = (municipiosDisponibles || []).find(m => m.id === formData.municipio_clave)

        const queryParts: string[] = []
        if (formData.colonia?.trim()) queryParts.push(formData.colonia.trim())
        if (mun) queryParts.push(mun.nombre)
        if (edo) queryParts.push(edo.nombre)
        if (formData.codigo_postal?.trim()) queryParts.push(`C.P. ${formData.codigo_postal.trim()}`)
        queryParts.push("México")

        const query = queryParts.length > 1 ? queryParts.join(', ') : "México"
        window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`, '_blank')
    }

    /**
     * Convierte coordenadas de Grados, Minutos, Segundos (DMS) o Decimales mixtos
     */
    const parseCoordPart = (str: string): number | null => {
        if (!str) return null
        const cleanStr = str.trim()

        // DMS Regex: 20°20'05.2"N
        const dmsRegex = /(\d+)[°|\s]+(\d+)['|\s]+(\d+(?:\.\d+)?)"?\s*([NSEW])/i
        const dmsMatch = cleanStr.match(dmsRegex)

        if (dmsMatch) {
            const degrees = parseFloat(dmsMatch[1])
            const minutes = parseFloat(dmsMatch[2])
            const seconds = parseFloat(dmsMatch[3])
            const direction = dmsMatch[4].toUpperCase()
            let decimal = degrees + (minutes / 60) + (seconds / 3600)
            if (direction === 'S' || direction === 'W') decimal *= -1
            return parseFloat(decimal.toFixed(6))
        }

        // Decimal limpio: -102.0338
        const decimalStr = cleanStr.replace(/[^\d.-]/g, '')
        const num = parseFloat(decimalStr)
        return !isNaN(num) ? num : null
    }

    const handleSmartCoordInput = async (value: string) => {
        setCoordInput(value)

        // Si el usuario pegó un enlace de Google Maps
        if (value.includes('google.com/maps') || value.includes('maps.app.goo.gl') || value.includes('goo.gl')) {
            const urlToast = toast.loading('Extrayendo coordenadas de Google Maps...')
            try {
                const res = await fetch(`/api/geo/geocode?q=${encodeURIComponent(value)}`)
                const data = await res.json()
                if (data.success && data.latitude && data.longitude) {
                    setFormData(prev => ({ ...prev, latitude: data.latitude, longitude: data.longitude }))
                    setCoordInput(`${data.latitude}, ${data.longitude}`)
                    toast.success('Coordenadas extraídas exitosamente del enlace', { id: urlToast })
                    return
                } else {
                    toast.error('No se pudieron extraer coordenadas de este enlace', { id: urlToast })
                }
            } catch {
                toast.error('Error al procesar el enlace de Google Maps', { id: urlToast })
            }
            return
        }

        // Parsing habitual por comas o DMS
        let parts = value.split(/[,|\t]|\s{2,}/)

        if (parts.length < 2 && (value.includes('N') || value.includes('S'))) {
            parts = value.split(/\s+(?=\d)/)
        }

        if (parts.length >= 2) {
            const lat = parseCoordPart(parts[0])
            const lng = parseCoordPart(parts[1])

            if (lat !== null && lng !== null) {
                setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }))
                if (value.includes('°')) toast.success('Coordenadas DMS detectadas y sincronizadas')
            }
        } else {
            const single = parseCoordPart(value)
            if (single !== null) {
                setFormData(prev => ({ ...prev, latitude: single }))
            }
        }
    }

    const handleAutoGeocode = async () => {
        const edo = ESTADOS.find(e => e.id === selectedEstadoId)
        const mun = (municipiosDisponibles || []).find(m => m.id === formData.municipio_clave)

        if (!edo && !mun && !formData.colonia) {
            toast.error('Selecciona al menos un Municipio o escribe una Colonia primero')
            return
        }

        setIsGeocoding(true)
        const geoToast = toast.loading('Buscando coordenadas por dirección...')
        try {
            const params = new URLSearchParams()
            if (formData.colonia) params.set('colonia', formData.colonia)
            if (mun) params.set('municipio', mun.nombre)
            if (edo) params.set('estado', edo.nombre)
            if (formData.codigo_postal) params.set('cp', formData.codigo_postal)

            const res = await fetch(`/api/geo/geocode?${params.toString()}`)
            const data = await res.json()

            if (data.success && data.latitude && data.longitude) {
                setFormData(prev => ({
                    ...prev,
                    latitude: data.latitude,
                    longitude: data.longitude
                }))
                setCoordInput(`${data.latitude}, ${data.longitude}`)
                toast.success('Ubicación encontrada y sincronizada', { id: geoToast })
            } else {
                toast.error('No se encontraron coordenadas precisas. Usa "Ubicar en el mapa".', { id: geoToast })
            }
        } catch {
            toast.error('Error al consultar geocodificación', { id: geoToast })
        } finally {
            setIsGeocoding(false)
        }
    }

    const handleBrowserGPS = () => {
        if (!navigator.geolocation) {
            toast.error('Tu navegador no soporta geolocalización')
            return
        }

        setIsLocatingGPS(true)
        const gpsToast = toast.loading('Obteniendo posición GPS del dispositivo...')
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const lat = parseFloat(pos.coords.latitude.toFixed(6))
                const lng = parseFloat(pos.coords.longitude.toFixed(6))
                setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }))
                setCoordInput(`${lat}, ${lng}`)
                setIsLocatingGPS(false)
                toast.success('Coordenadas GPS sincronizadas', { id: gpsToast })
            },
            (err) => {
                setIsLocatingGPS(false)
                toast.error('Error de GPS: ' + err.message, { id: gpsToast })
            },
            { enableHighAccuracy: true, timeout: 10000 }
        )
    }

    const handleMapPickerConfirm = (lat: number, lng: number) => {
        setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }))
        setCoordInput(`${lat}, ${lng}`)
        toast.success('Punto geográfico establecido desde el mapa')
    }

    const fileInputRef = useRef<HTMLInputElement>(null)
    const galleryInputRef = useRef<HTMLInputElement>(null)

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isMain: boolean = true) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        if (!isMain) {
            const check = checkCanUploadImages(formData.images.length)
            if (!check.allowed) {
                toast.error(check.message)
                return
            }
        }

        setUploading(true)
        const uploadToast = toast.loading(isMain ? 'Optimizando portada...' : 'Optimizando imágenes...')

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user?.id) {
                throw new Error('Debes iniciar sesión para subir imágenes.')
            }
            const userFolder = `${user.id}/`
            const uploadedUrls: string[] = []

            for (const file of Array.from(files)) {
                // Apply Image Optimization
                const optimizedFile = await optimizeImage(file, {
                    maxWidth: 1600,
                    maxHeight: 1200,
                    quality: 0.8
                })

                const fileExt = optimizedFile.name.split('.').pop()
                const fileName = `prop-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`
                const filePath = `${userFolder}${fileName}`

                let bucketName = 'properties'
                const { error: uploadError } = await supabase.storage
                    .from(bucketName)
                    .upload(filePath, optimizedFile)

                if (uploadError) throw uploadError

                const { data: { publicUrl } } = supabase.storage
                    .from(bucketName)
                    .getPublicUrl(filePath)

                uploadedUrls.push(publicUrl)

                if (isMain) break // Main image only takes the first file
            }

            if (isMain) {
                setFormData(prev => ({ ...prev, main_image_url: uploadedUrls[0] }))
                toast.success('Portada actualizada y optimizada', { id: uploadToast })
            } else {
                setFormData(prev => ({ ...prev, images: [...prev.images, ...uploadedUrls] }))
                toast.success(`${uploadedUrls.length} imágenes añadidas a la galería`, { id: uploadToast })
            }
        } catch (error: any) {
            console.error('Upload Error:', error)
            toast.error('Error al subir imagen: ' + error.message, { id: uploadToast })
        } finally {
            setUploading(false)
            if (fileInputRef.current) fileInputRef.current.value = ''
            if (galleryInputRef.current) galleryInputRef.current.value = ''
        }
    }

    const removeGalleryImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("Debes iniciar sesión para publicar.")

            const { colonia, codigo_postal, ...propertyPayload } = formData

            const { error } = await supabase
                .from('properties')
                .upsert({
                    id: initialData?.id,
                    ...propertyPayload,
                    price: parseFloat(formData.price.toString()) || 0,
                    features: {
                        ...formData.features,
                        colonia: colonia || '',
                        codigo_postal: codigo_postal || '',
                        beds: parseInt(formData.features.beds.toString()) || 0,
                        baths: parseFloat(formData.features.baths.toString()) || 0,
                        sqft: parseInt(formData.features.sqft.toString()) || 0,
                    },
                    latitude: formData.latitude ? parseFloat(formData.latitude.toString()) : null,
                    longitude: formData.longitude ? parseFloat(formData.longitude.toString()) : null,
                    agent_id: user.id,
                    updated_at: new Date().toISOString()
                })

            if (error) throw error
            toast.success(initialData ? 'Propiedad actualizada' : 'Propiedad publicada exitosamente')
            onSuccess()
        } catch (error: any) {
            console.error('Submit Error:', error)
            toast.error('Error al guardar: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
                <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full h-auto p-1.5 bg-zinc-100 rounded-2xl gap-1.5 border border-zinc-200/50">
                    <TabsTrigger value="general" className="flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs sm:text-sm data-[state=active]:text-blue-600 transition-all">
                        <FileText className="h-4 w-4 shrink-0" />
                        <span className="truncate">1. Datos Principales</span>
                    </TabsTrigger>
                    <TabsTrigger value="ubicacion" className="flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs sm:text-sm data-[state=active]:text-blue-600 transition-all">
                        <MapPin className="h-4 w-4 shrink-0" />
                        <span className="truncate">2. Ubicación & Mapa</span>
                    </TabsTrigger>
                    <TabsTrigger value="caracteristicas" className="flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs sm:text-sm data-[state=active]:text-blue-600 transition-all">
                        <SlidersHorizontal className="h-4 w-4 shrink-0" />
                        <span className="truncate">3. Características</span>
                    </TabsTrigger>
                    <TabsTrigger value="multimedia" className="flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs sm:text-sm data-[state=active]:text-blue-600 transition-all">
                        <ImageIcon className="h-4 w-4 shrink-0" />
                        <span className="truncate">4. Fotos ({formData.images.length + (formData.main_image_url ? 1 : 0)})</span>
                    </TabsTrigger>
                </TabsList>

                {/* BLOQUE 1: DATOS PRINCIPALES */}
                <TabsContent value="general" className="space-y-6 mt-0">
                    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200/80 shadow-xs space-y-6">
                        <div className="border-b border-zinc-100 pb-4">
                            <h3 className="text-lg font-black text-zinc-900 tracking-tight">Información Principal del Inmueble</h3>
                            <p className="text-xs text-zinc-500 font-medium">Define los datos comerciales esenciales de la publicación</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="title" className="text-zinc-900 font-bold">Título del Inmueble</Label>
                            <Input
                                id="title"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="bg-zinc-50 border-zinc-200 text-zinc-900 focus:ring-blue-500 h-12 text-sm sm:text-base font-medium"
                                placeholder="Ej: Penthouse con vista al Campestre y acabados de lujo"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label className="text-zinc-900 font-bold">Tipo de Inmueble</Label>
                                <Select
                                    value={formData.property_type}
                                    onValueChange={(val) => {
                                        const isTerreno = val === 'Terreno'
                                        setFormData({
                                            ...formData,
                                            property_type: val,
                                            features: {
                                                ...formData.features,
                                                beds: isTerreno ? 0 : formData.features.beds,
                                                baths: isTerreno ? 0 : formData.features.baths,
                                            }
                                        })
                                    }}
                                >
                                    <SelectTrigger className="bg-zinc-50 border-zinc-200 text-zinc-900 h-11">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Casa">Casa</SelectItem>
                                        <SelectItem value="Departamento">Departamento</SelectItem>
                                        <SelectItem value="Terreno">Terreno</SelectItem>
                                        <SelectItem value="Local">Local</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-zinc-900 font-bold">Operación</Label>
                                <Select
                                    value={formData.listing_type}
                                    onValueChange={(val) => setFormData({ ...formData, listing_type: val })}
                                >
                                    <SelectTrigger className="bg-zinc-50 border-zinc-200 text-zinc-900 h-11">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Venta">Venta</SelectItem>
                                        <SelectItem value="Renta">Renta</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="price-inline" className="text-zinc-900 font-bold">
                                    {formData.listing_type === 'Renta' ? 'Precio Renta /mes' : 'Precio (MXN)'}
                                </Label>
                                <Input
                                    id="price-inline"
                                    type="number"
                                    required
                                    min={0}
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    className="bg-zinc-50 border-zinc-200 text-zinc-900 focus:ring-blue-500 h-11 font-semibold"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-zinc-900 font-bold">Estado de la Publicación</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(val) => setFormData({ ...formData, status: val })}
                            >
                                <SelectTrigger className="bg-zinc-50 border-zinc-200 text-zinc-900 h-11">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">
                                        <span className="flex items-center gap-2">
                                            <span className="h-2 w-2 rounded-full bg-green-500 inline-block" />
                                            Activo — visible al público en el catálogo
                                        </span>
                                    </SelectItem>
                                    <SelectItem value="draft">
                                        <span className="flex items-center gap-2">
                                            <span className="h-2 w-2 rounded-full bg-zinc-400 inline-block" />
                                            Borrador — solo tú lo ves
                                        </span>
                                    </SelectItem>
                                    <SelectItem value="sold">
                                        <span className="flex items-center gap-2">
                                            <span className="h-2 w-2 rounded-full bg-red-500 inline-block" />
                                            Vendido / Rentado
                                        </span>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-zinc-900 font-bold">Descripción Completa</Label>
                            <Textarea
                                rows={5}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="bg-zinc-50 border-zinc-200 text-zinc-900 focus:ring-blue-500 py-3"
                                placeholder="Describe a detalle la propiedad: acabados, distribución, amenidades del fraccionamiento, etc..."
                            />
                        </div>

                        <div className="flex justify-end pt-3 border-t border-zinc-100">
                            <Button
                                type="button"
                                onClick={() => setActiveTab('ubicacion')}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 px-6 rounded-xl gap-2 shadow-sm"
                            >
                                <span>Siguiente: Ubicación & Mapa</span>
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </TabsContent>

                {/* BLOQUE 2: UBICACIÓN & MAPA */}
                <TabsContent value="ubicacion" className="space-y-6 mt-0">
                    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200/80 shadow-xs space-y-6">
                        <div className="border-b border-zinc-100 pb-4">
                            <h3 className="text-lg font-black text-zinc-900 tracking-tight">Localización Geográfica</h3>
                            <p className="text-xs text-zinc-500 font-medium">Ubicación administrativa y georreferenciación satelital para el INEGI</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-zinc-900 font-bold">Estado</Label>
                                <Select
                                    value={selectedEstadoId}
                                    onValueChange={handleEstadoChange}
                                >
                                    <SelectTrigger className="bg-zinc-50 border-zinc-200 text-zinc-900 h-11">
                                        <SelectValue placeholder="Selecciona Estado" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ESTADOS.map(edo => (
                                            <SelectItem key={edo.id} value={edo.id}>{edo.nombre}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-zinc-900 font-bold">Municipio</Label>
                                <Select
                                    value={formData.municipio_clave}
                                    onValueChange={handleMunicipioChange}
                                    disabled={!selectedEstadoId || loadingMunicipios}
                                >
                                    <SelectTrigger className="bg-zinc-50 border-zinc-200 text-zinc-900 h-11">
                                        <SelectValue placeholder={loadingMunicipios ? "Cargando..." : "Selecciona municipio"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(municipiosDisponibles || []).map(mun => (
                                            <SelectItem key={mun.id} value={mun.id}>{mun.nombre}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Micro-zona: Colonia y C.P. */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="sm:col-span-2 space-y-2">
                                <Label className="text-zinc-900 font-bold">Colonia o Fraccionamiento</Label>
                                <Input
                                    value={formData.colonia || ''}
                                    onChange={(e) => handleColoniaChange(e.target.value)}
                                    className="bg-zinc-50 border-zinc-200 text-zinc-900 focus:ring-blue-500 h-11"
                                    placeholder="Ej: Fracc. Peña, Centro, Santa Fe, Ciudad del Sol"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-zinc-900 font-bold">Código Postal</Label>
                                <Input
                                    value={formData.codigo_postal || ''}
                                    onChange={(e) => handleCodigoPostalChange(e.target.value)}
                                    maxLength={5}
                                    className="bg-zinc-50 border-zinc-200 text-zinc-900 focus:ring-blue-500 h-11 font-mono"
                                    placeholder="Ej: 59300"
                                />
                            </div>
                        </div>

                        {/* Geolocation Section */}
                        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-blue-50/70 to-indigo-50/40 border border-blue-100 space-y-4">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 rounded-lg bg-blue-600 text-white shadow-sm">
                                        <MapPin className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <Label className="text-zinc-900 font-bold tracking-tight text-sm">
                                            Geolocalización Precisa (INEGI)
                                        </Label>
                                        <p className="text-[11px] text-zinc-500 font-medium">
                                            Requerida para el análisis de servicios y plusvalía
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button
                                        type="button"
                                        variant="default"
                                        size="sm"
                                        onClick={() => setIsMapPickerOpen(true)}
                                        className="h-8 text-[11px] font-bold gap-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-sm shadow-blue-500/20 px-3"
                                    >
                                        <MapIcon className="h-3.5 w-3.5" />
                                        Ubicar en el mapa
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={openInGoogleMaps}
                                        className="h-8 text-[11px] font-bold gap-1.5 border-zinc-200 text-zinc-600 hover:bg-white hover:text-blue-700 rounded-full px-2.5"
                                        title="Abrir búsqueda en Google Maps"
                                    >
                                        <ExternalLink className="h-3 w-3" />
                                        <span className="hidden sm:inline">Google Maps</span>
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="coords" className="text-[10px] uppercase font-black text-zinc-500 tracking-wider">
                                            Punto Geográfico o Enlace de Google Maps
                                        </Label>
                                        <span className="text-[10px] text-zinc-400 font-medium">
                                            Admite: coordenadas o links de Maps
                                        </span>
                                    </div>
                                    <Input
                                        id="coords"
                                        type="text"
                                        placeholder="Ej: 20.3464, -102.0358 o pega enlace de Google Maps"
                                        value={coordInput}
                                        onChange={(e) => handleSmartCoordInput(e.target.value)}
                                        className="bg-white border-zinc-200 h-11 text-sm font-medium focus:ring-blue-500 shadow-sm"
                                    />
                                </div>

                                {/* Acciones Rápidas de 1 Clic */}
                                <div className="flex flex-wrap items-center gap-2 pt-1">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        disabled={isGeocoding}
                                        onClick={handleAutoGeocode}
                                        className="h-8 text-xs font-bold gap-1.5 bg-white border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800 rounded-xl shadow-xs"
                                    >
                                        {isGeocoding ? (
                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        ) : (
                                            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                                        )}
                                        Auto-ubicar por dirección
                                    </Button>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        disabled={isLocatingGPS}
                                        onClick={handleBrowserGPS}
                                        className="h-8 text-xs font-bold gap-1.5 bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 rounded-xl shadow-xs"
                                    >
                                        {isLocatingGPS ? (
                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        ) : (
                                            <Locate className="h-3.5 w-3.5 text-emerald-600" />
                                        )}
                                        Usar mi GPS actual
                                    </Button>
                                </div>

                                {/* Visual Feedback of Parsed Coords */}
                                {formData.latitude && formData.longitude && (
                                    <div className="flex items-center gap-3 px-3.5 py-2.5 bg-white rounded-xl border border-blue-100 shadow-sm animate-in fade-in slide-in-from-top-1">
                                        <div className="flex-1 space-y-0.5">
                                            <p className="text-[9px] uppercase font-bold text-zinc-400">Latitud detectada</p>
                                            <p className="text-xs font-black text-blue-600 font-mono">{formData.latitude}</p>
                                        </div>
                                        <div className="w-px h-6 bg-zinc-100" />
                                        <div className="flex-1 space-y-0.5">
                                            <p className="text-[9px] uppercase font-bold text-zinc-400">Longitud detectada</p>
                                            <p className="text-xs font-black text-blue-600 font-mono">{formData.longitude}</p>
                                        </div>
                                        <div className="p-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                                            <Check className="h-4 w-4" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-start gap-2 text-[10px] text-blue-700 font-medium">
                                <Info className="h-3.5 w-3.5 mt-0.5 shrink-0 opacity-70" />
                                <p className="leading-tight opacity-80">
                                    Estas coordenadas permiten que la IA genere el reporte de servicios cercanos a 500m (escuelas, hospitales, comercios) usando la base DENUE del INEGI.
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-3 border-t border-zinc-100">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setActiveTab('general')}
                                className="rounded-xl h-11 px-5 font-bold gap-2 text-zinc-600"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                <span>Anterior</span>
                            </Button>
                            <Button
                                type="button"
                                onClick={() => setActiveTab('caracteristicas')}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 px-6 rounded-xl gap-2 shadow-sm"
                            >
                                <span>Siguiente: Características</span>
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </TabsContent>

                {/* BLOQUE 3: CARACTERÍSTICAS */}
                <TabsContent value="caracteristicas" className="space-y-6 mt-0">
                    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200/80 shadow-xs space-y-6">
                        <div className="border-b border-zinc-100 pb-4">
                            <h3 className="text-lg font-black text-zinc-900 tracking-tight">Dimensiones y Distribución</h3>
                            <p className="text-xs text-zinc-500 font-medium">Métricas clave para el cálculo automático de precio por m² y avalúo</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label className={`text-zinc-900 font-bold ${formData.property_type === 'Terreno' ? 'text-zinc-400' : ''}`}>
                                    Habitaciones / Recámaras
                                    {formData.property_type === 'Terreno' && <span className="ml-1 text-[10px] text-zinc-400 font-normal">(N/A)</span>}
                                </Label>
                                <Input
                                    type="number"
                                    min={0}
                                    disabled={formData.property_type === 'Terreno'}
                                    value={formData.features.beds}
                                    placeholder="0"
                                    onChange={(e) => setFormData({ ...formData, features: { ...formData.features, beds: e.target.value } })}
                                    className={`bg-zinc-50 border-zinc-200 text-zinc-900 h-12 text-base font-semibold ${formData.property_type === 'Terreno' ? 'opacity-40 cursor-not-allowed' : ''}`}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className={`text-zinc-900 font-bold ${formData.property_type === 'Terreno' ? 'text-zinc-400' : ''}`}>
                                    Baños Completos
                                    {formData.property_type === 'Terreno' && <span className="ml-1 text-[10px] text-zinc-400 font-normal">(N/A)</span>}
                                </Label>
                                <Input
                                    type="number"
                                    step="0.5"
                                    min={0}
                                    disabled={formData.property_type === 'Terreno'}
                                    value={formData.features.baths}
                                    placeholder="0"
                                    onChange={(e) => setFormData({ ...formData, features: { ...formData.features, baths: e.target.value } })}
                                    className={`bg-zinc-50 border-zinc-200 text-zinc-900 h-12 text-base font-semibold ${formData.property_type === 'Terreno' ? 'opacity-40 cursor-not-allowed' : ''}`}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-zinc-900 font-bold">
                                    Superficie (M²)
                                </Label>
                                <Input
                                    type="number"
                                    min={0}
                                    value={formData.features.sqft}
                                    placeholder="0"
                                    onChange={(e) => setFormData({ ...formData, features: { ...formData.features, sqft: e.target.value } })}
                                    className="bg-zinc-50 border-zinc-200 text-zinc-900 h-12 text-base font-semibold focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        {formData.property_type === 'Terreno' && (
                            <div className="p-4 bg-amber-50 border border-amber-200/60 rounded-2xl text-xs text-amber-800 font-medium">
                                En la categoría Terreno, las habitaciones y baños se configuran automáticamente en 0. Solo se toma en cuenta el metraje total de superficie.
                            </div>
                        )}

                        <div className="flex justify-between items-center pt-3 border-t border-zinc-100">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setActiveTab('ubicacion')}
                                className="rounded-xl h-11 px-5 font-bold gap-2 text-zinc-600"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                <span>Anterior</span>
                            </Button>
                            <Button
                                type="button"
                                onClick={() => setActiveTab('multimedia')}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 px-6 rounded-xl gap-2 shadow-sm"
                            >
                                <span>Siguiente: Fotos</span>
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </TabsContent>

                {/* BLOQUE 4: FOTOS & GALERÍA */}
                <TabsContent value="multimedia" className="space-y-6 mt-0">
                    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200/80 shadow-xs space-y-6">
                        <div className="border-b border-zinc-100 pb-4">
                            <h3 className="text-lg font-black text-zinc-900 tracking-tight">Fotografía y Galería</h3>
                            <p className="text-xs text-zinc-500 font-medium">Las imágenes se optimizan y comprimen automáticamente para garantizar máxima velocidad</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Main Image */}
                            <div className="md:col-span-1 space-y-2 flex flex-col">
                                <Label className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Imagen de Portada</Label>
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className={cn(
                                        "relative flex flex-1 min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50 transition-all hover:bg-zinc-100 overflow-hidden group",
                                        formData.main_image_url && "border-blue-500/50"
                                    )}
                                >
                                    {formData.main_image_url ? (
                                        <>
                                            <img src={formData.main_image_url} alt="Main" className="h-full w-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Plus className="text-white h-8 w-8" />
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 text-zinc-400 p-4 text-center">
                                            <Upload className="h-8 w-8 text-blue-500" />
                                            <span className="text-xs font-bold text-zinc-700">Subir Portada</span>
                                            <span className="text-[10px] text-zinc-400">Formatos JPG, PNG, WebP</span>
                                        </div>
                                    )}
                                    {uploading && (
                                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                                            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                                        </div>
                                    )}
                                </div>
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, true)} />
                            </div>

                            {/* Gallery */}
                            <div className="md:col-span-2 space-y-2 flex flex-col">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs text-zinc-500 uppercase tracking-wider font-bold">
                                        Galería de Fotos ({formData.images.length}/{limits.images_per_property})
                                    </Label>
                                    <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2.5 py-0.5 rounded-full uppercase">
                                        Plan {planName}
                                    </span>
                                </div>
                                <div className="flex-1 grid grid-cols-3 sm:grid-cols-4 gap-3 min-h-[220px] p-4 rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50/50">
                                    {formData.images.map((url, idx) => (
                                        <div key={idx} className="relative aspect-square rounded-xl overflow-hidden shadow-sm ring-1 ring-zinc-200 group">
                                            <img src={url} alt={`Gallery ${idx}`} className="h-full w-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removeGalleryImage(idx)}
                                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}
                                    {formData.images.length < limits.images_per_property && (
                                        <button
                                            type="button"
                                            onClick={() => galleryInputRef.current?.click()}
                                            className="aspect-square flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-300 hover:border-blue-400 hover:bg-blue-50 transition-colors text-zinc-400 hover:text-blue-500"
                                        >
                                            <Plus className="h-6 w-6" />
                                            <span className="text-[9px] font-bold mt-1 uppercase">Añadir</span>
                                        </button>
                                    )}
                                </div>
                                <input type="file" ref={galleryInputRef} className="hidden" accept="image/*" multiple onChange={(e) => handleImageUpload(e, false)} />
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-3 border-t border-zinc-100">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setActiveTab('caracteristicas')}
                                className="rounded-xl h-11 px-5 font-bold gap-2 text-zinc-600"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                <span>Anterior</span>
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading || uploading}
                                className="min-w-[170px] bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 px-6 rounded-2xl shadow-lg shadow-blue-600/20"
                            >
                                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : initialData ? 'Guardar Cambios' : 'Publicar Inmueble'}
                            </Button>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Form Footer Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-zinc-200">
                <Button type="button" variant="ghost" onClick={onCancel} className="font-bold text-zinc-500 order-2 sm:order-1">
                    Cancelar
                </Button>
                <div className="flex items-center gap-3 w-full sm:w-auto order-1 sm:order-2">
                    <span className="text-xs text-zinc-400 font-medium hidden md:inline">
                        Los cambios de todas las pestañas se guardan juntos
                    </span>
                    <Button
                        type="submit"
                        disabled={loading || uploading}
                        className="w-full sm:w-auto min-w-[160px] bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 rounded-2xl shadow-lg shadow-blue-600/20"
                    >
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : initialData ? 'Guardar Cambios' : 'Publicar Inmueble'}
                    </Button>
                </div>
            </div>

            {/* Modal de Selector de Mapa Interactivo */}
            <MapPicker
                isOpen={isMapPickerOpen}
                onClose={() => setIsMapPickerOpen(false)}
                initialLat={formData.latitude ? parseFloat(formData.latitude.toString()) : null}
                initialLng={formData.longitude ? parseFloat(formData.longitude.toString()) : null}
                defaultSearchText={formData.colonia || (municipiosDisponibles.find(m => m.id === formData.municipio_clave)?.nombre) || ''}
                onConfirm={handleMapPickerConfirm}
            />
        </form>
    )
}
