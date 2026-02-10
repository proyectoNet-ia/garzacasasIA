import { createClient } from '@/lib/supabase-server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, Plus, Image, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function AdminMyProperties() {
    const supabase = await createClient()

    // Fetch admin's properties
    // For development: mock data
    const properties = []

    return (
        <div className="p-8 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-zinc-900">Mis Propiedades</h1>
                    <p className="text-zinc-500 mt-2">
                        Gestiona tus propiedades - <span className="font-bold text-blue-600">Ilimitadas</span>
                    </p>
                </div>
                <Link href="/admin/my-properties/new">
                    <Button className="gap-2 shadow-lg shadow-blue-500/20">
                        <Plus className="h-5 w-5" />
                        Nueva Propiedad
                    </Button>
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-zinc-200">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-600">
                            Total Propiedades
                        </CardTitle>
                        <Building2 className="h-5 w-5 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-zinc-900">{properties.length}</div>
                        <p className="text-xs text-zinc-500 mt-1">Sin límites</p>
                    </CardContent>
                </Card>

                <Card className="border-zinc-200">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-600">
                            Imágenes Totales
                        </CardTitle>
                        <Image className="h-5 w-5 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-zinc-900">0</div>
                        <p className="text-xs text-zinc-500 mt-1">Ilimitadas por propiedad</p>
                    </CardContent>
                </Card>

                <Card className="border-zinc-200">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-600">
                            Prioridad
                        </CardTitle>
                        <TrendingUp className="h-5 w-5 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-zinc-900">Tier 3</div>
                        <p className="text-xs text-zinc-500 mt-1">Máxima prioridad</p>
                    </CardContent>
                </Card>
            </div>

            {/* Properties List */}
            <Card className="border-zinc-200">
                <CardHeader>
                    <CardTitle className="text-zinc-900">Listado de Propiedades</CardTitle>
                </CardHeader>
                <CardContent>
                    {properties.length === 0 ? (
                        <div className="text-center py-12">
                            <Building2 className="h-16 w-16 text-zinc-300 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-zinc-700 mb-2">No tienes propiedades aún</h3>
                            <p className="text-zinc-500 mb-6">
                                Como Super Agente, puedes crear propiedades ilimitadas sin restricciones.
                            </p>
                            <Link href="/admin/my-properties/new">
                                <Button className="gap-2">
                                    <Plus className="h-5 w-5" />
                                    Crear Primera Propiedad
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Properties will be listed here */}
                            <p className="text-zinc-500">Propiedades aparecerán aquí...</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
