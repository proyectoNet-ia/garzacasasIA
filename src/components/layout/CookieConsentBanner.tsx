"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { COOKIE_CONSENT_KEY } from "@/lib/analytics"

export function CookieConsentBanner() {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        try {
            const stored = localStorage.getItem(COOKIE_CONSENT_KEY)
            if (!stored) {
                setVisible(true)
            }
        } catch {
            // Entornos con almacenamiento restringido
        }
    }, [])

    function handleChoice(choice: "accepted" | "essential") {
        try {
            localStorage.setItem(COOKIE_CONSENT_KEY, choice)
            if (choice === "essential") {
                localStorage.removeItem("analytics_session_id")
            }
        } catch {
            // Ignorar errores de cuota
        }
        setVisible(false)
    }

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ y: 80, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 80, opacity: 0 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="fixed bottom-6 left-4 right-4 md:left-auto md:right-8 z-40 md:max-w-lg"
                >
                    <div className="bg-zinc-950/90 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-5 md:p-6 shadow-[0_30px_60px_-12px_rgba(0,0,0,0.5)] text-white space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="h-11 w-11 rounded-2xl bg-blue-600/20 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                                <ShieldCheck className="h-5 w-5" />
                            </div>
                            <div className="space-y-1.5">
                                <p className="text-xs font-black uppercase tracking-widest text-white">
                                    Privacidad y Cookies
                                </p>
                                <p className="text-xs text-zinc-300 leading-relaxed">
                                    Usamos cookies esenciales para tu sesión segura y analíticas propias para mejorar las recomendaciones inmobiliarias. Consulta nuestro{" "}
                                    <Link href="/privacidad" className="text-blue-400 hover:underline font-semibold">
                                        Aviso de Privacidad
                                    </Link>{" "}
                                    y{" "}
                                    <Link href="/terminos" className="text-blue-400 hover:underline font-semibold">
                                        Términos
                                    </Link>.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2.5 pt-1">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => handleChoice("essential")}
                                className="h-10 rounded-2xl px-4 text-xs font-bold text-zinc-300 hover:text-white hover:bg-white/10"
                            >
                                Solo esenciales
                            </Button>
                            <Button
                                type="button"
                                onClick={() => handleChoice("accepted")}
                                className="h-10 rounded-2xl px-5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-600/20"
                            >
                                Aceptar todo
                            </Button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
