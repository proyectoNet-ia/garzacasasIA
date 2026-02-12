"use client"

import { useInteractions } from "@/providers/InteractionsProvider"
import { Button } from "@/components/ui/button"
import { X, Scale, ArrowRight, Trash2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { useState, useEffect } from "react"
import styles from "./ComparisonTray.module.css"

export function ComparisonTray() {
    const { compareList, toggleCompare, clearCompare } = useInteractions()
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    if (!isMounted || compareList.length === 0) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-4xl px-4"
            >
                <div className="bg-zinc-950/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-3 md:p-4 shadow-[0_30px_60px_-12px_rgba(0,0,0,0.5)] flex items-center justify-between gap-1.5 md:gap-6 text-white transition-colors duration-300">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="h-12 w-12 rounded-2xl bg-blue-600/20 flex items-center justify-center text-blue-400 border border-blue-500/20 hidden sm:flex">
                            <Scale className="h-6 w-6" />
                        </div>
                        <div className="flex flex-col truncate pl-2 md:pl-0">
                            <span className="text-white font-black text-sm uppercase tracking-widest truncate">Comparar</span>
                            <span className="text-zinc-500 text-xs font-bold truncate">{compareList.length} de 3 propiedades</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5 md:gap-3">
                        {compareList.map((property) => (
                            <div key={property.id} className="relative group shrink-0">
                                <div className="h-11 w-11 md:h-14 md:w-14 rounded-2xl overflow-hidden border border-white/10 ring-2 ring-transparent group-hover:ring-red-500/50 transition-all">
                                    <img
                                        src={property.main_image_url || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800"}
                                        alt={property.title}
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                                <button
                                    onClick={() => toggleCompare(property)}
                                    className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white rounded-full flex items-center justify-center scale-0 group-hover:scale-100 transition-transform shadow-lg"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        ))}

                        {/* Empty Slots */}
                        {Array.from({ length: 3 - compareList.length }).map((_, i) => (
                            <div key={`empty-${i}`} className="h-11 w-11 md:h-14 md:w-14 shrink-0 rounded-2xl border-2 border-dashed border-white/5 bg-white/[0.02]" />
                        ))}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={clearCompare}
                            className="h-11 w-11 md:h-12 md:w-12 rounded-2xl text-zinc-500 hover:text-red-500 hover:bg-red-500/10"
                        >
                            <Trash2 className="h-5 w-5" />
                        </Button>
                        <Link href="/comparar">
                            <button
                                className={styles.compareButton}
                                disabled={compareList.length < 2}
                            >
                                <span className="hidden md:inline">Comparar Ahora</span>
                                <ArrowRight className="h-4 w-4" />
                            </button>
                        </Link>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}
