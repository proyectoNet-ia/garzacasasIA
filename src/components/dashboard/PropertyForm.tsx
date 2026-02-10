'use client'

import React, { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase'
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

const supabase = createClient()

interface PropertyFormProps {
    initialData?: any
    onSuccess: () => void
    onCancel: () => void
}

export function PropertyForm({ initialData, onSuccess, onCancel }: PropertyFormProps) {
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        description: initialData?.description || '',
        price: initialData?.price || '',
        location: initialData?.location || '',
        property_type: initialData?.property_type || 'Casa',
        main_image_url: initialData?.main_image_url || '',
        status: initialData?.status || 'active'
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

            const { error: uploadError } = await supabase.storage
                .from('properties')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('properties')
                .getPublicUrl(filePath)

            setFormData(prev => ({ ...prev, main_image_url: publicUrl }))
        } catch (error: any) {
            alert('Error al subir imagen: ' + error.message)
        } finally {
            setUploading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            // For now, we assume anonymous/development access
            // In a real app, we'd get the user ID from auth
            const { error } = await supabase
                .from('properties')
                .upsert({
                    ...formData,
                    price: parseFloat(formData.price.toString()),
                    updated_at: new Date().toISOString()
                })

            if (error) throw error
            onSuccess()
        } catch (error: any) {
            alert('Error al guardar: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="title" className="text-zinc-400">Título del Inmueble</Label>
                    <Input
                        id="title"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="bg-zinc-900 border-white/10 text-white"
                        placeholder="Ej: Penthouse con vista al Campestre"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="price" className="text-zinc-400">Precio (MXN)</Label>
                    <Input
                        id="price"
                        type="number"
                        required
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="bg-zinc-900 border-white/10 text-white"
                        placeholder="0.00"
                    />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="location" className="text-zinc-400">Ubicación / Zona</Label>
                    <Input
                        id="location"
                        required
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="bg-zinc-900 border-white/10 text-white"
                        placeholder="Ej: San Pedro Garza García, NL"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="property_type" className="text-zinc-400">Tipo de Propiedad</Label>
                    <Select
                        value={formData.property_type}
                        onValueChange={(val) => setFormData({ ...formData, property_type: val })}
                    >
                        <SelectTrigger className="bg-zinc-900 border-white/10 text-white">
                            <SelectValue placeholder="Selecciona tipo" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-white/10 text-white">
                            <SelectItem value="Casa">Casa</SelectItem>
                            <SelectItem value="Departamento">Departamento</SelectItem>
                            <SelectItem value="Terreno">Terreno</SelectItem>
                            <SelectItem value="Local">Local Comercial</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="description" className="text-zinc-400">Descripción Detallada</Label>
                <Textarea
                    id="description"
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="bg-zinc-900 border-white/10 text-white"
                    placeholder="Describe las características principales..."
                />
            </div>

            <div className="space-y-2">
                <Label className="text-zinc-400">Imagen Principal</Label>
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                        "relative flex aspect-video cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/10 bg-zinc-900/50 transition-all hover:bg-zinc-900",
                        formData.main_image_url && "border-primary/50"
                    )}
                >
                    {formData.main_image_url ? (
                        <>
                            <img src={formData.main_image_url} alt="Preview" className="h-full w-full object-cover rounded-lg" />
                            <div className="absolute top-2 right-2 bg-black/50 p-1 rounded-full text-white hover:bg-red-500 transition-colors"
                                onClick={(e) => { e.stopPropagation(); setFormData({ ...formData, main_image_url: '' }) }}>
                                <X className="h-4 w-4" />
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center gap-2 text-zinc-500">
                            {uploading ? <Loader2 className="h-10 w-10 animate-spin text-primary" /> : <Upload className="h-10 w-10" />}
                            <span>{uploading ? 'Subiendo...' : 'Haz clic para subir imagen'}</span>
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

            <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <Button type="button" variant="ghost" onClick={onCancel} className="text-zinc-400">
                    Cancelar
                </Button>
                <Button type="submit" disabled={loading || uploading} className="gap-2 px-8 rounded-xl shadow-lg shadow-primary/20">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    {initialData ? 'Actualizar' : 'Publicar'}
                </Button>
            </div>
        </form>
    )
}
