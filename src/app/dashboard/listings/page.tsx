'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Search, MoreHorizontal, MapPin, Tag, Loader2, Trash2, Edit, Crown, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { createClient } from '@/lib/supabase'
import { PropertyForm } from '@/components/dashboard/PropertyForm'
import { ListingSkeleton } from '@/components/dashboard/ListingSkeleton'
import { useSubscriptionLimits } from '@/hooks/useSubscriptionLimits'
import { cn } from '@/lib/utils'
import Link from 'next/link'

const supabase = createClient()

export default function ListingsPage() {
    const [properties, setProperties] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingProperty, setEditingProperty] = useState<any>(null)

    const { limits, usage, planName, isUnlimited, checkCanCreateProperty, refreshUsage } = useSubscriptionLimits()

    const fetchProperties = async () => {
        setLoading(true)
        const { data } = await supabase
            .from('properties')
            .select('*')
            .order('created_at', { ascending: false })

        if (data) setProperties(data)
        setLoading(false)
        refreshUsage()
    }

    useEffect(() => {
        fetchProperties()
    }, [])

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar esta propiedad?')) return

        const { error } = await supabase
            .from('properties')
            .delete()
            .eq('id', id)

        if (!error) fetchProperties()
    }

    const handleCreateNew = () => {
        const canCreate = checkCanCreateProperty()

        if (!canCreate.allowed) {
            alert(canCreate.message)
            return
        }

        setEditingProperty(null)
        setIsDialogOpen(true)
    }

    const filteredProperties = properties.filter(p =>
        p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.location?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="p-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-black text-zinc-900">Mis Propiedades</h1>
                    <p className="text-sm text-zinc-500 mt-1">
                        {isUnlimited ? (
                            <span className="font-semibold text-blue-600">Propiedades ilimitadas</span>
                        ) : (
                            <>
                                {usage.properties_count} de {limits.properties_limit} utilizadas
                                {usage.remaining_properties > 0 && (
                                    <span className="text-zinc-400 ml-2 italic text-xs">
                                        ({usage.remaining_properties} libres)
                                    </span>
                                )}
                            </>
                        )}
                    </p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                    setIsDialogOpen(open)
                    if (!open) setEditingProperty(null)
                }}>
                    <Button
                        onClick={handleCreateNew}
                        className="gap-2 shadow-lg shadow-blue-500/20 w-full sm:w-auto py-6 sm:py-2 text-lg sm:text-sm font-bold sm:font-medium"
                        disabled={!usage.can_create_property && !isUnlimited}
                    >
                        <Plus className="h-5 w-5 sm:h-4 sm:w-4" />
                        Nueva Propiedad
                    </Button>
                    <DialogContent className="border-zinc-200 w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-2xl sm:rounded-lg">
                        <DialogHeader>
                            <DialogTitle className="text-zinc-900 text-xl font-bold">
                                {editingProperty ? 'Editar Propiedad' : 'Nueva Propiedad'}
                            </DialogTitle>
                            <DialogDescription className="text-zinc-600">
                                Completa la información básica para publicar tu inmueble.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="mt-4">
                            <PropertyForm
                                initialData={editingProperty}
                                onSuccess={() => {
                                    setIsDialogOpen(false)
                                    fetchProperties()
                                }}
                                onCancel={() => setIsDialogOpen(false)}
                            />
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Limit Warning */}
            {!isUnlimited && usage.remaining_properties <= 2 && usage.remaining_properties > 0 && (
                <Alert className="border-orange-200 bg-orange-50 rounded-xl">
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                    <AlertTitle className="text-orange-900 font-bold">Límite Próximo</AlertTitle>
                    <AlertDescription className="text-orange-700 text-sm">
                        Solo te quedan {usage.remaining_properties} propiedades.
                        <Link href="/dashboard/subscription" className="font-bold underline ml-1 text-orange-800">
                            Mejorar plan
                        </Link>
                    </AlertDescription>
                </Alert>
            )}

            {!isUnlimited && !usage.can_create_property && (
                <Alert className="border-red-200 bg-red-50 rounded-xl">
                    <Crown className="h-4 w-4 text-red-600" />
                    <AlertTitle className="text-red-900 font-bold">Límite Alcanzado</AlertTitle>
                    <AlertDescription className="text-red-700 text-sm">
                        Actualiza a un plan superior para seguir publicando.
                        <Link href="/dashboard/subscription" className="font-bold underline ml-1 text-red-800">
                            Ver Planes
                        </Link>
                    </AlertDescription>
                </Alert>
            )}

            {/* Search */}
            <Card className="border-zinc-200 shadow-sm rounded-xl overflow-hidden">
                <CardContent className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <Input
                            placeholder="Buscar por título, zona..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 bg-zinc-50 border-zinc-200 h-12"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Properties List/Table */}
            <div className="space-y-4">
                {loading ? (
                    <ListingSkeleton />
                ) : filteredProperties.length === 0 ? (
                    <Card className="border-zinc-200 rounded-2xl py-20">
                        <div className="text-center">
                            <div className="text-zinc-200 mb-4">
                                <Tag className="h-16 w-16 mx-auto" />
                            </div>
                            <p className="text-zinc-500 font-medium">
                                {searchTerm ? 'No se encontraron coincidencias.' : 'Aún no tienes propiedades publicadas.'}
                            </p>
                        </div>
                    </Card>
                ) : (
                    <>
                        {/* Mobile Grid */}
                        <div className="grid grid-cols-1 gap-4 lg:hidden">
                            {filteredProperties.map((property) => (
                                <Card key={property.id} className="border-zinc-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex gap-4 p-4">
                                        <div className="h-24 w-24 shrink-0 rounded-xl overflow-hidden bg-zinc-100 relative">
                                            {property.main_image_url ? (
                                                <img
                                                    src={property.main_image_url}
                                                    alt={property.title}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center text-zinc-400 text-xs">N/A</div>
                                            )}
                                            <div className="absolute top-1 left-1">
                                                <Badge className={cn(
                                                    "px-1.5 py-0 text-[8px] font-bold uppercase tracking-tighter border-0",
                                                    property.status === 'active' ? "bg-green-500 text-white" :
                                                        property.status === 'sold' ? "bg-red-500 text-white" : "bg-zinc-500 text-white"
                                                )}>
                                                    {property.status === 'active' ? 'OK' : property.status === 'sold' ? 'VENDIDO' : 'OFF'}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                                            <div>
                                                <h3 className="font-bold text-zinc-900 truncate leading-tight">{property.title}</h3>
                                                <div className="flex items-center gap-1 text-[10px] text-zinc-500 mt-1">
                                                    <MapPin className="h-3 w-3" />
                                                    <span className="truncate">{property.location}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between mt-2">
                                                <span className="text-sm font-black text-blue-600">
                                                    ${(parseFloat(property.price) / 1000000).toFixed(2)}M
                                                </span>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-lg border-zinc-200">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48 rounded-xl border-zinc-200 shadow-xl">
                                                        <DropdownMenuLabel>Gestión</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={() => {
                                                            setEditingProperty(property)
                                                            setIsDialogOpen(true)
                                                        }} className="gap-2 py-3 cursor-pointer">
                                                            <Edit className="h-4 w-4" /> Editar Propiedad
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => handleDelete(property.id)}
                                                            className="text-red-600 gap-2 py-3 cursor-pointer"
                                                        >
                                                            <Trash2 className="h-4 w-4" /> Eliminar permanentemente
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>

                        {/* Desktop Table */}
                        <Card className="hidden lg:block border-zinc-200 overflow-hidden shadow-sm">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-zinc-50">
                                    <tr className="border-b border-zinc-200">
                                        <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Propiedad</th>
                                        <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Ubicación</th>
                                        <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Precio</th>
                                        <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Estado</th>
                                        <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100">
                                    {filteredProperties.map((property) => (
                                        <tr key={property.id} className="group hover:bg-zinc-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-14 rounded-lg overflow-hidden bg-zinc-100 border border-zinc-200">
                                                        {property.main_image_url ? (
                                                            <img src={property.main_image_url} alt={property.title} className="h-full w-full object-cover" />
                                                        ) : (
                                                            <div className="h-full w-full flex items-center justify-center text-[10px] text-zinc-400">N/A</div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-zinc-900 group-hover:text-blue-600 transition-colors">{property.title}</div>
                                                        <div className="text-[10px] text-zinc-500 font-medium uppercase tracking-tighter mt-0.5">{property.property_type}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-zinc-600">
                                                <div className="flex items-center gap-1.5">
                                                    <MapPin className="h-3.5 w-3.5 text-zinc-400" />
                                                    {property.location}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-black text-zinc-900">
                                                ${(parseFloat(property.price) / 1000000).toFixed(2)}M
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge className={cn(
                                                    "rounded-full px-3 py-0.5 text-[10px] font-bold border-0",
                                                    property.status === 'active' ? "bg-green-100 text-green-700" :
                                                        property.status === 'sold' ? "bg-red-100 text-red-700" : "bg-zinc-100 text-zinc-700"
                                                )}>
                                                    {property.status === 'active' ? 'Disponible' : property.status === 'sold' ? 'Vendido' : 'Borrador'}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-900">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48 border-zinc-200 shadow-xl">
                                                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={() => {
                                                            setEditingProperty(property)
                                                            setIsDialogOpen(true)
                                                        }} className="gap-2 cursor-pointer">
                                                            <Edit className="h-4 w-4" /> Editar
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => handleDelete(property.id)}
                                                            className="text-red-600 gap-2 cursor-pointer"
                                                        >
                                                            <Trash2 className="h-4 w-4" /> Eliminar
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </Card>
                    </>
                )}
            </div>
        </div>
    )
}
