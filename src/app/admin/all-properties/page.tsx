import { createClient } from '@/lib/supabase-server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Building, Search, Filter, Eye, Edit, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default async function AdminAllProperties() {
    const supabase = await createClient()

    // Fetch all properties from all agents
    const { data: properties, count } = await supabase
        .from('properties')
        .select('*, profiles(full_name, email)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .limit(50)

    const propertiesList = properties || []

    return (
        <div className="p-8 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-zinc-900">Todas las Propiedades</h1>
                    <p className="text-zinc-500 mt-2">
                        {count || 0} propiedades totales en la plataforma
                    </p>
                </div>
            </div>

            {/* Search & Filters */}
            <Card className="border-zinc-200">
                <CardContent className="pt-6">
                    <div className="flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                            <Input
                                placeholder="Buscar por título, ubicación, agente..."
                                className="pl-10 bg-zinc-50 border-zinc-200"
                            />
                        </div>
                        <Button variant="outline" className="gap-2">
                            <Filter className="h-4 w-4" />
                            Filtros
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Properties Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {propertiesList.length === 0 ? (
                    <Card className="border-zinc-200 col-span-full">
                        <CardContent className="text-center py-12">
                            <Building className="h-16 w-16 text-zinc-300 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-zinc-700 mb-2">No hay propiedades</h3>
                            <p className="text-zinc-500">
                                Las propiedades creadas por los agentes aparecerán aquí.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    propertiesList.map((property: any) => (
                        <Card key={property.id} className="border-zinc-200 hover:shadow-lg transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between gap-2">
                                    <CardTitle className="text-base text-zinc-900 line-clamp-2">
                                        {property.title || 'Sin título'}
                                    </CardTitle>
                                    <Badge
                                        variant={property.status === 'active' ? 'default' : 'secondary'}
                                        className="shrink-0"
                                    >
                                        {property.status || 'draft'}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Property Image */}
                                <div className="aspect-video bg-zinc-100 rounded-lg overflow-hidden">
                                    {property.images?.[0] ? (
                                        <img
                                            src={property.images[0]}
                                            alt={property.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Building className="h-12 w-12 text-zinc-300" />
                                        </div>
                                    )}
                                </div>

                                {/* Property Info */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-zinc-600">Precio</span>
                                        <span className="text-lg font-bold text-zinc-900">
                                            ${property.price?.toLocaleString() || 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-zinc-600">Agente</span>
                                        <span className="text-sm font-medium text-zinc-900">
                                            {property.profiles?.full_name || 'Sin asignar'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-zinc-600">Ubicación</span>
                                        <span className="text-sm text-zinc-700">
                                            {property.location || 'N/A'}
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 pt-2">
                                    <Button variant="outline" size="sm" className="flex-1 gap-2">
                                        <Eye className="h-4 w-4" />
                                        Ver
                                    </Button>
                                    <Button variant="outline" size="sm" className="flex-1 gap-2">
                                        <Edit className="h-4 w-4" />
                                        Editar
                                    </Button>
                                    <Button variant="outline" size="sm" className="gap-2 text-red-600 hover:text-red-700">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Pagination */}
            {propertiesList.length > 0 && (
                <div className="flex justify-center gap-2">
                    <Button variant="outline" size="sm">Anterior</Button>
                    <Button variant="outline" size="sm">1</Button>
                    <Button variant="default" size="sm">2</Button>
                    <Button variant="outline" size="sm">3</Button>
                    <Button variant="outline" size="sm">Siguiente</Button>
                </div>
            )}
        </div>
    )
}
