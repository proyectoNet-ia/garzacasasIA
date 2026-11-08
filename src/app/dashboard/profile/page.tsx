'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog'
import {
    User,
    Mail,
    Phone,
    Save,
    Loader2,
    Camera,
    MessageSquare,
    Trash2,
    AlertTriangle,
    ShieldAlert,
} from 'lucide-react'
import { toast } from 'sonner'
import { formatPhone } from '@/hooks/usePhoneFormat'

export default function ProfilePage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [profile, setProfile] = useState<any>(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [deleteConfirmInput, setDeleteConfirmInput] = useState('')
    const [deletingAccount, setDeletingAccount] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const supabase = createClient()

    useEffect(() => {
        fetchProfile()
    }, [])

    async function fetchProfile() {
        try {
            const {
                data: { user },
            } = await supabase.auth.getUser()
            if (!user) return

            const { data, error } = await supabase
                .from('profiles')
                .select('id, full_name, email, role, avatar_url, phone, whatsapp, company_name, bio, created_at')
                .eq('id', user.id)
                .single()

            if (error) throw error
            setProfile({ ...data, email: data.email || user.email })
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
                    updated_at: new Date().toISOString(),
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

        // Validar tamaño (Límite 2MB)
        const MAX_SIZE = 2 * 1024 * 1024
        if (file.size > MAX_SIZE) {
            toast.error('La imagen es demasiado pesada (máximo 2MB)')
            return
        }

        setUploading(true)
        try {
            const {
                data: { user },
            } = await supabase.auth.getUser()
            if (!user) throw new Error('No hay sesión activa')

            const fileExt = file.name.split('.').pop()
            const filePath = `${user.id}/avatar-${Date.now()}.${fileExt}`

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const {
                data: { publicUrl },
            } = supabase.storage.from('avatars').getPublicUrl(filePath)

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

    async function handleDeleteMyAccount() {
        if (deleteConfirmInput.trim() !== 'ELIMINAR') {
            toast.error('Escribe ELIMINAR en mayúsculas para confirmar.')
            return
        }

        setDeletingAccount(true)
        try {
            const res = await fetch('/api/account/delete', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ confirmText: 'ELIMINAR' }),
            })
            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'No se pudo eliminar la cuenta.')
            }

            await supabase.auth.signOut()
            toast.success('Tu cuenta y publicaciones han sido eliminadas permanentemente.')
            window.location.href = '/'
        } catch (error: any) {
            toast.error(error?.message || 'Error al eliminar la cuenta')
            setDeletingAccount(false)
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
    const isAdmin = profile?.role === 'admin'

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
                                    {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : '—'}
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
                                        type="tel"
                                        value={profile?.phone || ''}
                                        onChange={(e) => setProfile({ ...profile, phone: formatPhone(e.target.value) })}
                                        className="pl-10 border-zinc-200 focus:ring-blue-500"
                                        placeholder="(812) 000-0000"
                                        maxLength={14}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="whatsapp" className="text-zinc-700 font-semibold">WhatsApp Business</Label>
                                <div className="relative">
                                    <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                                    <Input
                                        id="whatsapp"
                                        type="tel"
                                        value={profile?.whatsapp || profile?.phone || ''}
                                        onChange={(e) => setProfile({ ...profile, whatsapp: formatPhone(e.target.value) })}
                                        className="pl-10 border-zinc-200 focus:ring-blue-500"
                                        placeholder="(812) 000-0000"
                                        maxLength={14}
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

            {/* Danger Zone / Derechos ARCO - Eliminar mi cuenta */}
            <Card className="border-red-200/80 bg-red-50/20 shadow-sm overflow-hidden">
                <CardHeader className="border-b border-red-100/80 bg-red-50/40">
                    <CardTitle className="text-lg text-red-900 flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                        Zona de Peligro · Baja de Cuenta
                    </CardTitle>
                    <CardDescription className="text-red-700/80">
                        Cancela permanentemente tu cuenta de agente, perfil público e inventario de propiedades conforme a tus derechos ARCO.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {isAdmin ? (
                        <div className="flex items-start gap-3 text-sm text-zinc-600">
                            <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                            <p>
                                Tu cuenta posee privilegios de <strong>Super Agente (Admin)</strong> y está protegida contra baja accidental desde este formulario. Si deseas darla de baja, transfiere o retira primero el rol de Administrador.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-1 max-w-xl">
                                <p className="text-sm font-bold text-zinc-900">
                                    Eliminar mi cuenta permanentemente
                                </p>
                                <p className="text-xs text-zinc-500 leading-relaxed">
                                    Al confirmar, se eliminarán de forma irreversible tus credenciales de acceso, tu foto de perfil y todas tus propiedades e imágenes publicadas. Los comprobantes fiscales/contables de pagos previos se conservan de forma disociada conforme a la ley.
                                </p>
                            </div>
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={() => {
                                    setDeleteConfirmInput('')
                                    setDeleteDialogOpen(true)
                                }}
                                className="shrink-0 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl gap-2"
                            >
                                <Trash2 className="h-4 w-4" />
                                Eliminar mi cuenta
                            </Button>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Modal de Confirmación Explícita para Eliminar Cuenta */}
            <Dialog
                open={deleteDialogOpen}
                onOpenChange={(open) => {
                    if (!deletingAccount) setDeleteDialogOpen(open)
                }}
            >
                <DialogContent className="sm:max-w-[440px] rounded-2xl border-zinc-200 p-0 overflow-hidden">
                    <div className="bg-red-50 p-6 flex flex-col items-center text-center gap-3 border-b border-red-100">
                        <div className="h-12 w-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                            <Trash2 className="h-6 w-6" />
                        </div>
                        <DialogHeader className="space-y-1">
                            <DialogTitle className="text-lg font-black text-red-900 text-center">
                                ¿Eliminar tu cuenta definitivamente?
                            </DialogTitle>
                            <DialogDescription className="text-xs text-red-700/90 text-center leading-relaxed">
                                Esta acción no se puede deshacer. Se borrarán tus inmuebles publicados, fotografías en la nube y acceso a Garza Casas IA.
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <div className="p-6 space-y-4 bg-white">
                        <div className="space-y-2">
                            <Label htmlFor="confirm-delete" className="text-xs font-bold text-zinc-700">
                                Escribe <span className="font-mono text-red-600 bg-red-50 px-1.5 py-0.5 rounded">ELIMINAR</span> para confirmar:
                            </Label>
                            <Input
                                id="confirm-delete"
                                value={deleteConfirmInput}
                                onChange={(e) => setDeleteConfirmInput(e.target.value)}
                                placeholder="ELIMINAR"
                                autoComplete="off"
                                disabled={deletingAccount}
                                className="font-mono tracking-widest border-zinc-200 focus:ring-red-500"
                            />
                        </div>

                        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                disabled={deletingAccount}
                                onClick={() => setDeleteDialogOpen(false)}
                                className="w-full sm:w-auto rounded-xl font-bold"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="button"
                                disabled={deletingAccount || deleteConfirmInput.trim() !== 'ELIMINAR'}
                                onClick={handleDeleteMyAccount}
                                className="w-full sm:flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold gap-2"
                            >
                                {deletingAccount ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Eliminando cuenta...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="h-4 w-4" />
                                        Confirmar eliminación
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
