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
import { Loader2, Upload, X, Check, Image as ImageIcon, Plus, MapPin, Info, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { optimizeImage } from '@/lib/image-optimizer'
import { useSubscriptionLimits } from '@/hooks/useSubscriptionLimits'
import { toast } from 'sonner'
import { ESTADOS, getMunicipiosPorEstado, type Estado, type Municipio } from '@/lib/inegi/geografia'

interface PropertyFormProps {
    initialData?: any
    onSuccess: () => void
    onCancel: () => void
}

export function PropertyForm({ initialData, onSuccess, onCancel }: PropertyFormProps) {
    const [supabase] = useState(() => createClient())
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
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
            beds: number
            baths: number
            sqft: number
        }
        municipio_clave?: string
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
        features: initialData?.features || { beds: 3, baths: 2, sqft: 200 },
        municipio_clave: initialData?.municipio_clave || '',
        latitude: initialData?.latitude || '',
        longitude: initialData?.longitude || ''
    })

    const [selectedEstadoId, setSelectedEstadoId] = useState<string>('')
    const [municipiosDisponibles, setMunicipiosDisponibles] = useState<Municipio[]>([])
    const [loadingMunicipios, setLoadingMunicipios] = useState(false)
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
                location: `${mun.nombre}, ${edo.nombre}`
            }))
        }
    }

    const openInGoogleMaps = () => {
        const edo = ESTADOS.find(e => e.id === selectedEstadoId)
        const mun = municipiosDisponibles.find(m => m.id === formData.municipio_clave)

        let query = "México"
        if (edo && mun) {
            query = `${mun.nombre}, ${edo.nombre}, México`
        } else if (edo) {
            query = `${edo.nombre}, México`
        }

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

    const handleSmartCoordInput = (value: string) => {
        setCoordInput(value)

        // Intentar separar por coma, tab o espacio múltiple (entre lat y lng)
        // Ejemplos: "20.3, -102.3" o "20°N 102°W"
        let parts = value.split(/[,|\t]|\s{2,}/)

        // Si no hay separador claro, intentar espacio simple si hay letras de dirección
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
            // Si solo hay un número, intentar guardarlo como latitud por si el usuario escribe lento
            const single = parseCoordPart(value)
            if (single !== null) {
                setFormData(prev => ({ ...prev, latitude: single }))
            }
        }
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
                const filePath = `${fileName}`

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

            const { error } = await supabase
                .from('properties')
                .upsert({
                    id: initialData?.id,
                    ...formData,
                    price: parseFloat(formData.price.toString()),
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
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title" className="text-zinc-900 font-bold">Título del Inmueble</Label>
                        <Input
                            id="title"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="bg-zinc-50 border-zinc-200 text-zinc-900 focus:ring-blue-500 h-11"
                            placeholder="Ej: Penthouse con vista al Campestre"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="price" className="text-zinc-900 font-bold">Precio (MXN)</Label>
                        <Input
                            id="price"
                            type="number"
                            required
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            className="bg-zinc-50 border-zinc-200 text-zinc-900 focus:ring-blue-500 h-11"
                            placeholder="0.00"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-zinc-900 font-bold">Tipo</Label>
                            <Select
                                value={formData.property_type}
                                onValueChange={(val) => setFormData({ ...formData, property_type: val })}
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
                    </div>

                    {/* Status selector */}
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
                                        Activo — visible al público
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
                </div>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
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

                    {/* Geolocation Section */}
                    <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-4">
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-blue-600" />
                                <Label className="text-zinc-900 font-bold tracking-tight">Geolocalización Precise (INEGI)</Label>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={openInGoogleMaps}
                                className="h-8 text-[10px] font-bold uppercase gap-1.5 border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800 rounded-full"
                            >
                                <ExternalLink className="h-3 w-3" />
                                Buscar en el mapa
                            </Button>
                        </div>
                        <div className="space-y-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="coords" className="text-[10px] uppercase font-black text-zinc-500 tracking-wider">Punto Geográfico</Label>
                                <Input
                                    id="coords"
                                    type="text"
                                    placeholder="Ej: 19.70, -101.18 o 20°20'N 102°02'W"
                                    value={coordInput}
                                    onChange={(e) => handleSmartCoordInput(e.target.value)}
                                    className="bg-white border-zinc-200 h-11 text-sm font-medium focus:ring-blue-500"
                                />
                            </div>

                            {/* Visual Feedback of Parsed Coords */}
                            {formData.latitude && formData.longitude && (
                                <div className="flex items-center gap-3 px-3 py-2 bg-white rounded-xl border border-blue-50 shadow-sm animate-in fade-in slide-in-from-top-1">
                                    <div className="flex-1 space-y-0.5">
                                        <p className="text-[8px] uppercase font-bold text-zinc-400">Latitud detectada</p>
                                        <p className="text-xs font-black text-blue-600">{formData.latitude}</p>
                                    </div>
                                    <div className="w-px h-6 bg-zinc-100" />
                                    <div className="flex-1 space-y-0.5">
                                        <p className="text-[8px] uppercase font-bold text-zinc-400">Longitud detectada</p>
                                        <p className="text-xs font-black text-blue-600">{formData.longitude}</p>
                                    </div>
                                    <Check className="h-4 w-4 text-emerald-500" />
                                </div>
                            )}
                        </div>
                        <div className="flex items-start gap-2 text-[10px] text-blue-700 font-medium">
                            <Info className="h-3 w-3 mt-0.5 shrink-0" />
                            <p className="leading-tight opacity-80">
                                Estas coordenadas permiten que la IA genere el reporte de servicios cercanos (escuelas, hospitales, etc.) usando datos reales.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <Label className="text-zinc-900 font-bold flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" /> Portada y Galería
                </Label>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Main Image */}
                    <div className="md:col-span-1 space-y-2 flex flex-col">
                        <Label className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Imagen de Portada</Label>
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className={cn(
                                "relative flex flex-1 min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50 transition-all hover:bg-zinc-100 overflow-hidden group",
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
                                <div className="flex flex-col items-center gap-2 text-zinc-400">
                                    <Upload className="h-8 w-8" />
                                    <span className="text-[10px] font-bold uppercase">Subir Portada</span>
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
                            <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-full uppercase">
                                Plan {planName}
                            </span>
                        </div>
                        <div className="flex-1 grid grid-cols-3 sm:grid-cols-4 gap-3 min-h-[200px] p-4 rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50/50">
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
                                    <span className="text-[8px] font-bold mt-1 uppercase">Añadir</span>
                                </button>
                            )}
                        </div>
                        <input type="file" ref={galleryInputRef} className="hidden" accept="image/*" multiple onChange={(e) => handleImageUpload(e, false)} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label className="text-zinc-900 font-bold">Habitaciones</Label>
                    <Input
                        type="number"
                        value={formData.features.beds}
                        onChange={(e) => setFormData({ ...formData, features: { ...formData.features, beds: parseInt(e.target.value) || 0 } })}
                        className="bg-zinc-50 border-zinc-200 text-zinc-900 h-11"
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-zinc-900 font-bold">Baños</Label>
                    <Input
                        type="number"
                        step="0.5"
                        value={formData.features.baths}
                        onChange={(e) => setFormData({ ...formData, features: { ...formData.features, baths: parseFloat(e.target.value) || 0 } })}
                        className="bg-zinc-50 border-zinc-200 text-zinc-900 h-11"
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-zinc-900 font-bold">M²</Label>
                    <Input
                        type="number"
                        value={formData.features.sqft}
                        onChange={(e) => setFormData({ ...formData, features: { ...formData.features, sqft: parseInt(e.target.value) || 0 } })}
                        className="bg-zinc-50 border-zinc-200 text-zinc-900 h-11"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label className="text-zinc-900 font-bold">Descripción</Label>
                <Textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="bg-zinc-50 border-zinc-200 text-zinc-900 focus:ring-blue-500 py-3"
                    placeholder="Describe los detalles de la propiedad..."
                />
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-zinc-100">
                <Button type="button" variant="ghost" onClick={onCancel}>
                    Cancelar
                </Button>
                <Button type="submit" disabled={loading || uploading} className="min-w-[150px] bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 rounded-xl shadow-lg shadow-blue-600/20">
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : initialData ? 'Guardar Cambios' : 'Publicar Inmueble'}
                </Button>
            </div>
        </form >
    )
}
