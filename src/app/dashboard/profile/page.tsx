'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { User, Mail, Phone, Save, Upload, Loader2, Camera, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'

export default function ProfilePage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [profile, setProfile] = useState<any>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const supabase = createClient()

    useEffect(() => {
        fetchProfile()
    }, [])

    async function fetchProfile() {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            if (error) throw error
            setProfile(data)
        } catch (error: any) {
            console.error('Error fetching profile:', error)
            toast.error('No se pudo cargar el perfil')
        } finally {
            setLoading(false)
        }
    }

    async function handleSave() {
        setSaving(true)
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: profile.full_name,
                    phone: profile.phone,
                    whatsapp: profile.whatsapp,
                    bio: profile.bio,
                    company_name: profile.company_name,
                    updated_at: new Date().toISOString()
                })
                .eq('id', profile.id)

            if (error) throw error
            toast.success('Perfil actualizado correctamente')
        } catch (error: any) {
            toast.error('Error al guardar: ' + error.message)
        } finally {
            setSaving(false)
        }
    }

    async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('No hay sesión activa')

            const fileExt = file.name.split('.').pop()
            const filePath = `${user.id}/avatar-${Date.now()}.${fileExt}`

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath)

            // Update profile with new avatar URL
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ avatar_url: publicUrl })
                .eq('id', user.id)

            if (updateError) throw updateError

            setProfile({ ...profile, avatar_url: publicUrl })
            toast.success('Foto de perfil actualizada')
        } catch (error: any) {
            toast.error('Error al subir imagen: ' + error.message)
        } finally {
            setUploading(false)
        }
    }

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        )
    }

    const userInitial = profile?.full_name?.charAt(0) || profile?.email?.charAt(0) || '?'

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-black text-zinc-900">Configuración de Perfil</h1>
                <p className="text-zinc-500 mt-2">Gestiona tu identidad pública y datos de contacto</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Picture Card */}
                <Card className="border-zinc-200 shadow-sm overflow-hidden h-fit">
                    <CardHeader className="bg-zinc-50/50 border-b border-zinc-100">
                        <CardTitle className="text-lg">Tu Identidad</CardTitle>
                        <CardDescription>Esta imagen aparecerá en tus propiedades</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-8 flex flex-col items-center">
                        <div className="relative group p-1 rounded-full border-2 border-dashed border-zinc-200 hover:border-blue-500 transition-colors">
                            <div className="h-32 w-32 rounded-full overflow-hidden bg-zinc-100 flex items-center justify-center text-zinc-400">
                                {profile?.avatar_url ? (
                                    <img src={profile.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                                ) : (
                                    <span className="text-4xl font-bold text-blue-600">{userInitial}</span>
                                )}
                            </div>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                className="absolute bottom-1 right-1 h-10 w-10 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-500 transition-all border-4 border-white disabled:bg-zinc-400"
                            >
                                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleAvatarUpload}
                                className="hidden"
                                accept="image/*"
                            />
                        </div>

                        <div className="mt-6 w-full space-y-2">
                            <div className="flex justify-between items-center text-sm py-2 border-b border-zinc-50">
                                <span className="text-zinc-500">Rol</span>
                                <span className="font-bold text-zinc-900 uppercase tracking-widest text-[10px] bg-zinc-100 px-2 py-1 rounded">
                                    {profile?.role}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm py-2 border-b border-zinc-50">
                                <span className="text-zinc-500">Miembro desde</span>
                                <span className="text-zinc-700 font-medium">
                                    {new Date(profile?.created_at).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Main Form Card */}
                <Card className="lg:col-span-2 border-zinc-200 shadow-sm">
                    <CardHeader className="bg-zinc-50/50 border-b border-zinc-100">
                        <CardTitle className="text-lg">Información Personal</CardTitle>
                        <CardDescription>Completa tus datos profesionales para el catálogo público</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-zinc-700 font-semibold">Nombre Completo</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                                    <Input
                                        id="name"
                                        value={profile?.full_name || ''}
                                        onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                                        className="pl-10 border-zinc-200 focus:ring-blue-500"
                                        placeholder="Ej. Juan Pérez"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-zinc-700 font-semibold">Email Principal</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                                    <Input
                                        id="email"
                                        type="email"
                                        value={profile?.email || ''}
                                        disabled
                                        className="pl-10 bg-zinc-50 border-zinc-200 text-zinc-500 italic"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="phone" className="text-zinc-700 font-semibold">Teléfono de Contacto</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                                    <Input
                                        id="phone"
                                        value={profile?.phone || ''}
                                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                        className="pl-10 border-zinc-200 focus:ring-blue-500"
                                        placeholder="+52 81 0000 0000"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="whatsapp" className="text-zinc-700 font-semibold">WhatsApp Business</Label>
                                <div className="relative">
                                    <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                                    <Input
                                        id="whatsapp"
                                        value={profile?.whatsapp || profile?.phone || ''}
                                        onChange={(e) => setProfile({ ...profile, whatsapp: e.target.value })}
                                        className="pl-10 border-zinc-200 focus:ring-blue-500"
                                        placeholder="+52 81 0000 0000"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="company" className="text-zinc-700 font-semibold">Inmobiliaria / Empresa</Label>
                            <Input
                                id="company"
                                value={profile?.company_name || ''}
                                onChange={(e) => setProfile({ ...profile, company_name: e.target.value })}
                                className="border-zinc-200 focus:ring-blue-500"
                                placeholder="Nombre de tu agencia"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="bio" className="text-zinc-700 font-semibold">Biografía Profesional (Opcional)</Label>
                            <Textarea
                                id="bio"
                                value={profile?.bio || ''}
                                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                                className="min-h-[120px] border-zinc-200 focus:ring-blue-500 resize-none"
                                placeholder="Cuéntanos sobre tu experiencia en el mercado inmobiliario..."
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="bg-zinc-50/50 border-t border-zinc-100 p-6">
                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full md:w-auto ml-auto px-10 bg-blue-600 hover:bg-blue-700 text-white font-bold"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Guardar Perfil
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
