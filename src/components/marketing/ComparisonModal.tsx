"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useInteractions } from "@/providers/InteractionsProvider"
import { BedDouble, Bath, Square, MapPin, X, Check, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ComparisonModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function ComparisonModal({ open, onOpenChange }: ComparisonModalProps) {
    const { compareList, toggleCompare, clearCompare } = useInteractions()

    if (compareList.length === 0 && open) {
        onOpenChange(false)
        return null
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-6xl w-[95vw] bg-zinc-950/95 backdrop-blur-3xl border-white/10 p-0 overflow-hidden rounded-[3rem]">
                <div className="p-8 sm:p-12 space-y-8">
                    <DialogHeader className="flex flex-row items-center justify-between">
                        <div className="space-y-1">
                            <DialogTitle className="text-3xl font-black text-white uppercase tracking-tighter">Comparativa Garza</DialogTitle>
                            <p className="text-zinc-500 font-bold text-sm uppercase tracking-widest">Analiza tus opciones favoritas lado a lado</p>
                        </div>
                    </DialogHeader>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {compareList.map((property) => {
                            const features = property.features || {}
                            return (
                                <div key={property.id} className="relative group bg-white/[0.02] border border-white/5 rounded-[2.5rem] overflow-hidden flex flex-col">
                                    <button
                                        onClick={() => toggleCompare(property)}
                                        className="absolute top-4 right-4 z-10 h-8 w-8 bg-black/50 backdrop-blur-md text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>

                                    <div className="h-48 overflow-hidden relative">
                                        <img src={property.main_image_url} alt={property.title} className="h-full w-full object-cover" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent" />
                                        <div className="absolute bottom-4 left-6">
                                            <div className="text-2xl font-black text-white">
                                                ${new Intl.NumberFormat('es-MX').format(property.price)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-8 space-y-8 flex-1">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-blue-400 text-[10px] font-black uppercase tracking-widest">
                                                <MapPin className="h-3 w-3" />
                                                {property.location}
                                            </div>
                                            <h3 className="text-lg font-bold text-white leading-tight">{property.title}</h3>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4 py-6 border-y border-white/5">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3 text-zinc-500">
                                                    <BedDouble className="h-5 w-5" />
                                                    <span className="text-xs font-bold uppercase tracking-wider">Camas</span>
                                                </div>
                                                <span className="text-white font-bold">{features.beds || '-'}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3 text-zinc-500">
                                                    <Bath className="h-5 w-5" />
                                                    <span className="text-xs font-bold uppercase tracking-wider">Baños</span>
                                                </div>
                                                <span className="text-white font-bold">{features.baths || '-'}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3 text-zinc-500">
                                                    <Square className="h-5 w-5" />
                                                    <span className="text-xs font-bold uppercase tracking-wider">M² Totales</span>
                                                </div>
                                                <span className="text-white font-bold">{features.sqft || '-'}</span>
                                            </div>
                                        </div>

                                        <Button className="w-full h-12 rounded-2xl bg-white text-zinc-700 hover:bg-zinc-200 font-black uppercase tracking-widest text-xs gap-2 mt-auto">
                                            Ver Detalles
                                            <ArrowRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )
                        })}

                        {/* Add more slots if less than 3 */}
                        {compareList.length < 3 && Array.from({ length: 3 - compareList.length }).map((_, i) => (
                            <div key={`empty-slot-${i}`} className="border-2 border-dashed border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center p-12 text-center group cursor-pointer hover:bg-white/[0.02] transition-colors" onClick={() => onOpenChange(false)}>
                                <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center text-zinc-700 group-hover:text-blue-500 transition-colors mb-4">
                                    <Check className="h-8 w-8" />
                                </div>
                                <p className="text-zinc-600 font-bold text-xs uppercase tracking-widest leading-relaxed">Añade otra propiedad para comparar</p>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-between items-center pt-8 border-t border-white/5">
                        <Button variant="ghost" onClick={clearCompare} className="text-zinc-500 hover:text-red-500 hover:bg-red-500/10 font-bold uppercase tracking-widest text-[10px]">
                            Limpiar Selección
                        </Button>
                        <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">Garza Casas IA © 2026</p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
