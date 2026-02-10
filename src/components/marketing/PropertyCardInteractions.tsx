"use client"

import { Button } from "@/components/ui/button"
import { Heart, Scale } from "lucide-react"
import { useInteractions } from "@/providers/InteractionsProvider"
import { cn } from "@/lib/utils"

interface PropertyCardInteractionsProps {
    property: any
    variant: 'like' | 'compare'
}

export function PropertyCardInteractions({ property, variant }: PropertyCardInteractionsProps) {
    const { toggleFavorite, isFavorite, toggleCompare, isComparing } = useInteractions()

    if (variant === 'like') {
        const active = isFavorite(property.id)
        return (
            <Button
                size="icon"
                onClick={(e) => {
                    e.preventDefault()
                    toggleFavorite(property.id)
                }}
                className={cn(
                    "h-12 w-12 rounded-2xl backdrop-blur-xl border transition-all duration-300 active:scale-90 hover:scale-110 shadow-sm",
                    active
                        ? "text-red-500 border-red-500/50 bg-red-500/10 shadow-[0_0_20px_-5px_rgba(239,68,68,0.5)]"
                        : "bg-white/40 text-zinc-700 border-black/10 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 hover:shadow-[0_0_20px_-5px_rgba(239,68,68,0.3)]"
                )}
            >
                <Heart className={cn("h-6 w-6 transition-transform duration-300 group-hover:scale-110", active && "fill-current")} />
            </Button>
        )
    }

    if (variant === 'compare') {
        const active = isComparing(property.id)
        return (
            <Button
                size="icon"
                variant="outline"
                onClick={(e) => {
                    e.preventDefault()
                    toggleCompare(property)
                }}
                className={cn(
                    "h-14 w-14 rounded-2xl border transition-all duration-300 active:scale-90 hover:scale-110 shadow-lg",
                    active
                        ? "bg-blue-600 border-blue-600 text-white shadow-blue-600/20"
                        : "border-black/10 bg-white text-zinc-500 hover:text-zinc-700 hover:bg-black/5 hover:border-black/20 hover:shadow-xl"
                )}
                title="Comparar"
            >
                <Scale className="h-6 w-6 transition-transform duration-300" />
            </Button>
        )
    }

    return null
}
