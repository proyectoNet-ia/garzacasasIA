'use client'

import { useState } from 'react'
import { useSearch } from '@/providers/SearchProvider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SlidersHorizontal, BedDouble, Bath, MapPin, Search, FilterX, Building2, Check, RefreshCw } from 'lucide-react'
import { Badge } from "@/components/ui/badge"

export function PropertiesFilterSidebar() {
    const { filters, setFilters, clearFilters } = useSearch()
    const [prices, setPrices] = useState({ min: filters.minPrice || '', max: filters.maxPrice || '' })

    // Available options
    const propertyTypes = ['Casa', 'Departamento', 'Terreno', 'Local', 'Oficina']
    const bedOptions = [1, 2, 3, 4, 5]
    const bathOptions = [1, 2, 3, 4]

    // Quick price ranges
    const applyPriceRange = (min: number | undefined, max: number | undefined) => {
        setFilters({ ...filters, minPrice: min, maxPrice: max })
        setPrices({ min: min?.toString() || '', max: max?.toString() || '' })
    }

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'min' | 'max') => {
        const val = e.target.value
        setPrices(prev => ({ ...prev, [type]: val }))

        const numVal = val === '' ? undefined : Number(val)
        if (type === 'min') {
            setFilters({ ...filters, minPrice: numVal })
        } else {
            setFilters({ ...filters, maxPrice: numVal })
        }
    }

    const FilterContent = () => (
        <div className="space-y-8 pr-1">
            {/* Location Search */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <Label className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Ubicación</Label>
                    {filters.location && (
                        <button
                            onClick={() => setFilters({ ...filters, location: '' })}
                            className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1 font-medium transition-colors"
                        >
                            <FilterX className="h-3 w-3" /> Limpiar
                        </button>
                    )}
                </div>
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-blue-500 transition-colors" />
                    <Input
                        value={filters.location}
                        onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                        placeholder="Buscar por zona, ciudad..."
                        className="pl-9 h-11 bg-zinc-50 border-zinc-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all rounded-xl"
                    />
                </div>
            </div>

            {/* Property Type */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <Label className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Tipo de Propiedad</Label>
                    {filters.type && (
                        <button
                            onClick={() => setFilters({ ...filters, type: '' })}
                            className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1 font-medium transition-colors"
                        >
                            <FilterX className="h-3 w-3" /> Limpiar
                        </button>
                    )}
                </div>
                <div className="flex flex-wrap gap-2">
                    {propertyTypes.map((type) => {
                        const isSelected = filters.type === type
                        return (
                            <button
                                key={type}
                                onClick={() => setFilters({ ...filters, type: isSelected ? '' : type })}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${isSelected
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20'
                                    : 'bg-white text-zinc-600 border-zinc-200 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50'
                                    }`}
                            >
                                {type}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Price Range */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Label className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Rango de Precio (MXN)</Label>
                    {(filters.minPrice || filters.maxPrice) && (
                        <button
                            onClick={() => applyPriceRange(undefined, undefined)}
                            className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1 font-medium transition-colors"
                        >
                            <FilterX className="h-3 w-3" /> Limpiar
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xs font-bold">$</span>
                        <Input
                            type="number"
                            placeholder="Mínimo"
                            value={prices.min}
                            onChange={(e) => handlePriceChange(e, 'min')}
                            className="pl-7 h-11 bg-zinc-50 border-zinc-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all rounded-xl text-sm"
                        />
                    </div>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xs font-bold">$</span>
                        <Input
                            type="number"
                            placeholder="Máximo"
                            value={prices.max}
                            onChange={(e) => handlePriceChange(e, 'max')}
                            className="pl-7 h-11 bg-zinc-50 border-zinc-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all rounded-xl text-sm"
                        />
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                    <Badge variant="secondary" className="cursor-pointer hover:bg-zinc-200 px-3 py-1 font-medium bg-zinc-100 text-zinc-600 border border-zinc-200" onClick={() => applyPriceRange(0, 5000000)}>
                        - $5M
                    </Badge>
                    <Badge variant="secondary" className="cursor-pointer hover:bg-zinc-200 px-3 py-1 font-medium bg-zinc-100 text-zinc-600 border border-zinc-200" onClick={() => applyPriceRange(5000000, 15000000)}>
                        $5M - $15M
                    </Badge>
                    <Badge variant="secondary" className="cursor-pointer hover:bg-zinc-200 px-3 py-1 font-medium bg-zinc-100 text-zinc-600 border border-zinc-200" onClick={() => applyPriceRange(15000000, undefined)}>
                        + $15M
                    </Badge>
                </div>
            </div>

            {/* Bedrooms & Bathrooms */}
            <div className="grid grid-cols-1 gap-6">
                {/* Bedrooms */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <Label className="text-zinc-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                            <BedDouble className="h-4 w-4" /> Recámaras
                        </Label>
                        {filters.beds && (
                            <button
                                onClick={() => setFilters({ ...filters, beds: undefined })}
                                className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1 font-medium transition-colors"
                            >
                                <FilterX className="h-3 w-3" /> Limpiar
                            </button>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {bedOptions.map((num) => {
                            const isSelected = filters.beds === num
                            return (
                                <button
                                    key={num}
                                    onClick={() => setFilters({ ...filters, beds: isSelected ? undefined : num })}
                                    className={`h-10 w-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all border ${isSelected
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20 scale-110'
                                        : 'bg-white text-zinc-600 border-zinc-200 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50'
                                        }`}
                                >
                                    {num}+
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Bathrooms */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <Label className="text-zinc-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                            <Bath className="h-4 w-4" /> Baños
                        </Label>
                        {filters.baths && (
                            <button
                                onClick={() => setFilters({ ...filters, baths: undefined })}
                                className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1 font-medium transition-colors"
                            >
                                <FilterX className="h-3 w-3" /> Limpiar
                            </button>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {bathOptions.map((num) => {
                            const isSelected = filters.baths === num
                            return (
                                <button
                                    key={num}
                                    onClick={() => setFilters({ ...filters, baths: isSelected ? undefined : num })}
                                    className={`h-10 w-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all border ${isSelected
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20 scale-110'
                                        : 'bg-white text-zinc-600 border-zinc-200 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50'
                                        }`}
                                >
                                    {num}+
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Clear All Button */}
            <div className="pt-6 border-t border-zinc-100">
                <Button
                    variant="outline"
                    className="w-full h-12 rounded-xl border-dashed border-2 border-zinc-200 text-zinc-500 hover:text-red-500 hover:border-red-200 hover:bg-red-50 uppercase tracking-widest text-xs font-bold gap-2"
                    onClick={() => {
                        clearFilters()
                        setPrices({ min: '', max: '' })
                    }}
                >
                    <RefreshCw className="h-4 w-4" /> Resetear Todo
                </Button>
            </div>
        </div>
    )

    return (
        <div className="w-full h-full">
            {/* Mobile Filter Button */}
            <div className="lg:hidden mb-6">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button className="w-full h-12 rounded-2xl bg-white text-zinc-800 border border-zinc-200 shadow-sm hover:bg-zinc-50 flex items-center justify-between px-6 font-bold uppercase tracking-widest text-xs">
                            <span className="flex items-center gap-2">
                                <SlidersHorizontal className="h-4 w-4 text-blue-600" />
                                Filtros Inteligentes
                            </span>
                            <Badge variant="secondary" className="bg-zinc-100 text-zinc-600">
                                {Object.values(filters).filter(Boolean).length} activos
                            </Badge>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[85vw] sm:w-[400px] h-full max-h-screen overflow-y-auto pb-20 px-6">
                        <SheetHeader className="mb-8 text-left">
                            <SheetTitle className="text-2xl font-black text-zinc-800 uppercase tracking-tighter">Filtros</SheetTitle>
                            <SheetDescription className="font-medium text-zinc-500">Afina tu búsqueda para encontrar la propiedad ideal</SheetDescription>
                        </SheetHeader>
                        <FilterContent />
                    </SheetContent>
                </Sheet>
            </div>

            {/* Desktop Sidebar */}
            <div className="hidden lg:block w-full space-y-8 sticky top-24 max-h-[calc(100vh-100px)] overflow-y-auto pr-4 scrollbar-hide pb-10">
                <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
                    <h3 className="text-lg font-black text-zinc-800 uppercase tracking-tight flex items-center gap-2">
                        <SlidersHorizontal className="h-5 w-5 text-blue-600" />
                        Filtros
                    </h3>
                    {(Object.values(filters).some(Boolean)) && (
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full uppercase tracking-widest">
                            Activos
                        </span>
                    )}
                </div>
                <FilterContent />
            </div>
        </div>
    )
}
