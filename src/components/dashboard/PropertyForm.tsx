'use client'

import React, { useState, useRef } from 'react'
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
import { Loader2, Upload, X, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PropertyFormProps {
    initialData?: any
    onSuccess: () => void
    onCancel: () => void
}

export function PropertyForm({ initialData, onSuccess, onCancel }: PropertyFormProps) {
    const [supabase] = useState(() => createClient())
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [formData, setFormData] = useState<{
        title: string
        description: string
        price: string | number
        location: string
        property_type: string
        main_image_url: string
        status: string
        features: {
            beds: number
            baths: number
            sqft: number
        }
    }>({
        title: initialData?.title || '',
        description: initialData?.description || '',
        price: initialData?.price || '',
        location: initialData?.location || '',
        property_type: initialData?.property_type || 'Casa',
        main_image_url: initialData?.main_image_url || '',
        status: initialData?.status || 'active',
        features: initialData?.features || { beds: 3, baths: 2, sqft: 200 }
    })

    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        try {
            const fileExt = file.name.split('.').pop()
            const fileName = `prop-${Math.random()}.${fileExt}`
            const filePath = `${fileName}`

            // Try 'properties' (lowercase) first
            let bucketName = 'properties'
            let { error: uploadError } = await supabase.storage
                .from(bucketName)
                .upload(filePath, file)

            // If bucket not found, try 'PROPERTIES' (uppercase)
            if (uploadError && (uploadError.message.includes('Bucket not found') || (uploadError as any).error === 'Bucket not found')) {
                console.log('Bucket "properties" not found, trying "PROPERTIES"...')
                bucketName = 'PROPERTIES'
                const retry = await supabase.storage
                    .from(bucketName)
                    .upload(filePath, file)
                uploadError = retry.error
            }

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from(bucketName)
                .getPublicUrl(filePath)

            setFormData(prev => ({ ...prev, main_image_url: publicUrl }))
        } catch (error: any) {
            console.error('Upload Error:', error)
            alert('Error al subir imagen: ' + error.message)
        } finally {
            setUploading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            // Get current user for agent_id
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) throw new Error("Debes iniciar sesión para publicar.")

            const { error } = await supabase
                .from('properties')
                .upsert({
                    id: initialData?.id, // CRITICAL: This prevents duplication on update
                    ...formData,
                    price: parseFloat(formData.price.toString()),
                    agent_id: user.id, // Inject Agent ID for RLS
                    updated_at: new Date().toISOString()
                })

            if (error) throw error
            onSuccess()
        } catch (error: any) {
            console.error('Submit Error:', error)
            alert('Error al guardar: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="title" className="text-zinc-700 font-medium">Título del Inmueble</Label>
                    <Input
                        id="title"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="bg-white border-zinc-200 text-zinc-900 focus:ring-blue-500"
                        placeholder="Ej: Penthouse con vista al Campestre"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="price" className="text-zinc-700 font-medium">Precio (MXN)</Label>
                    <Input
                        id="price"
                        type="number"
                        required
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="bg-white border-zinc-200 text-zinc-900 focus:ring-blue-500"
                        placeholder="0.00"
                    />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="location" className="text-zinc-700 font-medium">Ubicación / Zona</Label>
                    <Input
                        id="location"
                        required
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="bg-white border-zinc-200 text-zinc-900 focus:ring-blue-500"
                        placeholder="Ej: San Pedro Garza García, NL"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="property_type" className="text-zinc-700 font-medium">Tipo de Propiedad</Label>
                    <Select
                        value={formData.property_type}
                        onValueChange={(val) => setFormData({ ...formData, property_type: val })}
                    >
                        <SelectTrigger className="bg-white border-zinc-200 text-zinc-900 focus:ring-blue-500">
                            <SelectValue placeholder="Selecciona tipo" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-zinc-200 text-zinc-900 shadow-md">
                            <SelectItem value="Casa">Casa</SelectItem>
                            <SelectItem value="Departamento">Departamento</SelectItem>
                            <SelectItem value="Terreno">Terreno</SelectItem>
                            <SelectItem value="Local">Local Comercial</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="beds" className="text-zinc-700 font-medium">Recámaras</Label>
                    <Input
                        id="beds"
                        type="number"
                        min="0"
                        value={formData.features?.beds || ''}
                        onChange={(e) => setFormData({
                            ...formData,
                            features: { ...formData.features, beds: parseInt(e.target.value) || 0 }
                        })}
                        className="bg-white border-zinc-200 text-zinc-900 focus:ring-blue-500"
                        placeholder="0"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="baths" className="text-zinc-700 font-medium">Baños</Label>
                    <Input
                        id="baths"
                        type="number"
                        min="0"
                        step="0.5"
                        value={formData.features?.baths || ''}
                        onChange={(e) => setFormData({
                            ...formData,
                            features: { ...formData.features, baths: parseFloat(e.target.value) || 0 }
                        })}
                        className="bg-white border-zinc-200 text-zinc-900 focus:ring-blue-500"
                        placeholder="0"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="sqft" className="text-zinc-700 font-medium">Metros Cuadrados</Label>
                    <Input
                        id="sqft"
                        type="number"
                        min="0"
                        value={formData.features?.sqft || ''}
                        onChange={(e) => setFormData({
                            ...formData,
                            features: { ...formData.features, sqft: parseInt(e.target.value) || 0 }
                        })}
                        className="bg-white border-zinc-200 text-zinc-900 focus:ring-blue-500"
                        placeholder="0 m²"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="description" className="text-zinc-700 font-medium">Descripción Detallada</Label>
                <Textarea
                    id="description"
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="bg-white border-zinc-200 text-zinc-900 focus:ring-blue-500"
                    placeholder="Describe las características principales..."
                />
            </div>

            <div className="space-y-2">
                <Label className="text-zinc-700 font-medium">Imagen Principal</Label>
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                        "relative flex aspect-video cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50 transition-all hover:bg-zinc-100",
                        formData.main_image_url && "border-blue-500/50 bg-blue-50/50"
                    )}
                >
                    {formData.main_image_url ? (
                        <>
                            <img src={formData.main_image_url} alt="Preview" className="h-full w-full object-cover rounded-lg shadow-sm" />
                            <div className="absolute top-2 right-2 bg-white/80 p-1.5 rounded-full text-zinc-600 hover:text-red-500 hover:bg-white transition-colors shadow-sm"
                                onClick={(e) => { e.stopPropagation(); setFormData({ ...formData, main_image_url: '' }) }}>
                                <X className="h-4 w-4" />
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center gap-2 text-zinc-500">
                            {uploading ? <Loader2 className="h-10 w-10 animate-spin text-blue-600" /> : <Upload className="h-10 w-10 text-zinc-400" />}
                            <span className="text-sm font-medium">{uploading ? 'Subiendo...' : 'Haz clic para subir imagen'}</span>
                        </div>
                    )}
                </div>
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100">
                <Button type="button" variant="ghost" onClick={onCancel} className="text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900">
                    Cancelar
                </Button>
                <Button type="submit" disabled={loading || uploading} className="gap-2 px-8 rounded-xl shadow-lg shadow-blue-600/20 bg-blue-600 hover:bg-blue-700 text-white">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    {initialData ? 'Actualizar' : 'Publicar'}
                </Button>
            </div>
        </form>
    )
}
