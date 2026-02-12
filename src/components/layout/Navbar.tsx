"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Building2, Phone, Mail, Instagram, Facebook, Heart, GitCompare, User } from "lucide-react"
import { useInteractions } from "@/providers/InteractionsProvider"
import { cn } from "@/lib/utils"
import { MobileMenu } from "./MobileMenu"
import { NAVIGATION_LINKS } from "@/constants/navigation"

interface ContactConfig {
    phone: string;
    email: string;
    instagram: string;
    facebook: string;
    whatsapp: string;
}

interface NavbarProps {
    contactConfig?: any;
}

export function Navbar({ contactConfig }: NavbarProps) {
    const [isScrolled, setIsScrolled] = useState(false)
    const { favorites } = useInteractions()

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50)
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    return (
        <header className="fixed top-0 z-50 w-full transition-all duration-500">
            {/* Top Bar - Manageable */}
            <div className={`w-full border-b transition-all duration-500 overflow-hidden ${isScrolled
                ? "h-0 opacity-0 border-transparent"
                : "h-10 opacity-100 bg-transparent border-white/5"
                }`}>
                <div className="container mx-auto h-full flex items-center justify-between px-4 md:px-6">
                    <div className="flex items-center gap-6">
                        {contactConfig?.phone && (
                            <a href={`tel:${contactConfig.phone}`} className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 hover:text-white transition-colors uppercase tracking-widest">
                                <Phone className="h-3 w-3 text-blue-500" />
                                {contactConfig.phone}
                            </a>
                        )}
                        {contactConfig?.email && (
                            <a href={`mailto:${contactConfig.email}`} className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 hover:text-white transition-colors uppercase tracking-widest hidden sm:flex">
                                <Mail className="h-3 w-3 text-blue-500" />
                                {contactConfig.email}
                            </a>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        {contactConfig?.instagram && (
                            <a href={contactConfig.instagram} target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-white transition-colors">
                                <Instagram className="h-3.5 w-3.5" />
                            </a>
                        )}
                        {contactConfig?.facebook && (
                            <a href={contactConfig.facebook} target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-white transition-colors">
                                <Facebook className="h-3.5 w-3.5" />
                            </a>
                        )}
                        {contactConfig?.whatsapp && (
                            <a href={contactConfig.whatsapp} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[10px] font-bold text-blue-500 hover:text-blue-400 transition-colors uppercase tracking-widest">
                                <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                                WhatsApp
                            </a>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Navbar */}
            <div className={`border-b transition-all duration-500 ${isScrolled
                ? "bg-white/80 backdrop-blur-xl border-zinc-200 shadow-sm"
                : "bg-transparent border-transparent"
                }`}>
                <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6">
                    <Link href="/" className="flex items-center gap-2 transition-transform hover:scale-105">
                        <div className={`${isScrolled ? "bg-blue-600 shadow-blue-500/20" : "bg-white/10 border-white/10 border"} flex items-center justify-center w-10 h-10 rounded-xl transition-all`}>
                            <Building2 className={`h-5 w-5 ${isScrolled ? "text-white" : "text-white"}`} />
                        </div>
                        <span className={`text-xl font-black tracking-tighter transition-colors ${isScrolled ? "text-zinc-900" : "text-white"}`}>
                            Garza Casas <span className="text-blue-500">IA</span>
                        </span>
                    </Link>
                    {/* Navigation Menu */}
                    <nav className="hidden lg:flex items-center gap-1 bg-black/5 backdrop-blur-sm p-1 rounded-full border border-white/5">
                        {NAVIGATION_LINKS.map((link) => (
                            <Link
                                key={link.label}
                                href={link.href}
                                className={`group px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${isScrolled
                                    ? "text-zinc-600 hover:text-blue-600 hover:bg-white"
                                    : "text-zinc-300 hover:text-white hover:bg-white/10"
                                    }`}
                            >
                                <link.icon className={`h-3.5 w-3.5 transition-transform duration-300 group-hover:scale-110 ${isScrolled ? "text-zinc-400 group-hover:text-blue-500" : "text-zinc-400 group-hover:text-white"}`} />
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                    {/* Action Icons & Mobile Menu Trigger */}
                    <div className="flex items-center gap-2 md:gap-4">
                        {/* Desktop Action Icons */}
                        <div className="hidden lg:flex items-center gap-2 md:gap-4">
                            <div className="flex items-center gap-1 md:gap-3 mr-2 md:mr-4 border-r border-zinc-500/10 pr-4">
                                <Link href="/favoritos">
                                    <Button variant="ghost" size="icon" className={`relative rounded-full h-9 w-9 ${isScrolled ? "text-zinc-400 hover:text-red-500 hover:bg-red-50" : "text-zinc-400 hover:text-red-400 hover:bg-white/10"}`}>
                                        <Heart className={cn("h-4 w-4 transition-all", favorites.length > 0 && "fill-red-500 text-red-500 ")} />
                                        {favorites.length > 0 && (
                                            <span className="absolute -top-0 -right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm ring-2 ring-white animate-in zoom-in">
                                                {favorites.length}
                                            </span>
                                        )}
                                    </Button>
                                </Link>
                                <Link href="/comparar">
                                    <Button variant="ghost" size="icon" className={`rounded-full h-9 w-9 ${isScrolled ? "text-zinc-400 hover:text-blue-600 hover:bg-blue-50" : "text-zinc-400 hover:text-blue-400 hover:bg-white/10"}`}>
                                        <GitCompare className="h-4 w-4" />
                                    </Button>
                                </Link>
                            </div>

                            <Link href="/dashboard">
                                <Button className={`font-black uppercase tracking-widest text-[10px] rounded-full shadow-lg transition-all px-6 h-11 flex items-center gap-2 ${isScrolled
                                    ? "bg-blue-600 text-white shadow-blue-600/20 hover:bg-blue-700"
                                    : "bg-white text-zinc-950 hover:bg-zinc-100"
                                    } hover:-translate-y-0.5`}>
                                    <User className="h-4 w-4" />
                                    <span className="hidden sm:inline">Entrar</span>
                                </Button>
                            </Link>
                        </div>

                        {/* Mobile Menu Trigger */}
                        <MobileMenu triggerColor={isScrolled ? "text-zinc-900 hover:bg-zinc-100" : "text-white hover:bg-white/10"} />
                    </div>
                </div>
            </div>
        </header >
    )
}
