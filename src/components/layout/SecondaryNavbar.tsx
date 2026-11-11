"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Phone, Mail, Heart, GitCompare, User } from "lucide-react"
import { IconInstagram, IconFacebook, IconWhatsApp } from "@/components/ui/SocialIcons"
import { useInteractions } from "@/providers/InteractionsProvider"
import { cn } from "@/lib/utils"
import { MobileMenu } from "./MobileMenu"
import { NAVIGATION_LINKS } from "@/constants/navigation"
import { BrandLogo } from "@/components/brand/BrandLogo"
import { DEFAULT_CONTACT_CONFIG } from "@/lib/settings"

interface ContactConfig {
    phone: string;
    email: string;
    instagram: string;
    facebook: string;
    whatsapp: string;
}

interface SecondaryNavbarProps {
    contactConfig?: any;
}

export function SecondaryNavbar({ contactConfig }: SecondaryNavbarProps) {
    const [isScrolled, setIsScrolled] = useState(false)
    const { favorites } = useInteractions()

    const contact = {
        phone: contactConfig?.phone || DEFAULT_CONTACT_CONFIG.phone,
        email: contactConfig?.email || DEFAULT_CONTACT_CONFIG.email,
        whatsapp: contactConfig?.whatsapp || DEFAULT_CONTACT_CONFIG.whatsapp,
        instagram: contactConfig?.instagram || DEFAULT_CONTACT_CONFIG.instagram,
        facebook: contactConfig?.facebook || DEFAULT_CONTACT_CONFIG.facebook,
    }

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50)
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    return (
        <header className="fixed top-0 z-50 w-full transition-all duration-500">
            {/* Top Bar - Premium Dark */}
            <div className={`w-full transition-all duration-500 overflow-hidden bg-slate-950 text-white border-b border-white/5 ${isScrolled
                ? "h-0 opacity-0"
                : "h-10 opacity-100"
                }`}>
                <div className="container mx-auto h-full flex items-center justify-between px-4 md:px-6">
                    <div className="flex items-center gap-6">
                        {contact.phone && (
                            <a href={`tel:${contact.phone}`} className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 hover:text-white transition-colors uppercase tracking-widest">
                                <Phone className="h-3 w-3 text-blue-500" />
                                {contact.phone}
                            </a>
                        )}
                        {contact.phone && contact.email && (
                            <div className="h-3.5 w-px bg-slate-800 hidden sm:block" />
                        )}
                        {contact.email && (
                            <a href={`mailto:${contact.email}`} className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 hover:text-white transition-colors uppercase tracking-widest hidden sm:flex">
                                <Mail className="h-3 w-3 text-blue-500" />
                                {contact.email}
                            </a>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 pr-4 border-r border-slate-800">
                            {contact.instagram && (
                                <a href={contact.instagram} target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-pink-500 transition-colors">
                                    <IconInstagram className="h-3.5 w-3.5" />
                                </a>
                            )}
                            {contact.facebook && (
                                <a href={contact.facebook} target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-blue-500 transition-colors">
                                    <IconFacebook className="h-3.5 w-3.5" />
                                </a>
                            )}
                        </div>
                        {contact.whatsapp && (
                            <a href={contact.whatsapp} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[10px] font-bold text-green-400 hover:text-green-300 transition-colors uppercase tracking-widest">
                                <IconWhatsApp className="h-3.5 w-3.5" />
                                WhatsApp
                            </a>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Navbar - Light Theme */}
            <div className={`border-b transition-all duration-500 ${isScrolled
                ? "bg-white/95 backdrop-blur-xl border-zinc-200 shadow-md"
                : "bg-white/80 backdrop-blur-3xl border-zinc-200"
                }`}>
                <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6">
                    <Link href="/" className="flex items-center gap-2 transition-transform hover:scale-105">
                        <BrandLogo
                            initialSurface="light"
                            imgClassName="h-10 max-w-[200px]"
                            fallback={
                                <>
                                <div className="bg-zinc-100 border border-zinc-200 px-3 py-1 rounded-xl transition-colors hover:bg-zinc-50 w-fit">
                                    <span className="text-xl font-black tracking-tighter text-zinc-700">
                                        Garza <span className="text-blue-500">Casas</span>
                                    </span>
                                </div>
                                </>
                            }
                        />
                    </Link>

                    {/* Navigation Menu */}
                    <nav className="hidden lg:flex items-center gap-2 ml-auto mr-8">
                        {NAVIGATION_LINKS.map((link) => (
                            <Link
                                key={link.label}
                                href={link.href}
                                className="group flex items-center gap-1 text-[11px] font-bold uppercase tracking-tight transition-all hover:-translate-y-0.5 text-zinc-600 hover:text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-50/50"
                            >
                                <link.icon className="h-3.5 w-3.5 text-zinc-400 group-hover:text-blue-500 transition-colors" />
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Action Icons & Mobile Menu Trigger */}
                    <div className="flex items-center gap-2 md:gap-4">
                        {/* Desktop Action Icons */}
                        <div className="hidden lg:flex items-center gap-2 md:gap-4">
                            <div className="flex items-center gap-1 md:gap-3 mr-2 md:mr-4 border-r border-zinc-200 pr-4">
                                <Link href="/favoritos">
                                    <Button variant="ghost" size="icon" className="relative rounded-full h-9 w-9 text-zinc-500 hover:text-red-500 hover:bg-red-50">
                                        <Heart className={cn("h-4 w-4 transition-all", favorites.length > 0 && "fill-red-500 text-red-500")} />
                                        {favorites.length > 0 && (
                                            <span className="absolute -top-0 -right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm ring-2 ring-white animate-in zoom-in">
                                                {favorites.length}
                                            </span>
                                        )}
                                    </Button>
                                </Link>
                                <Link href="/comparar">
                                    <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 text-zinc-500 hover:text-blue-600 hover:bg-blue-50">
                                        <GitCompare className="h-4 w-4" />
                                    </Button>
                                </Link>
                            </div>

                            <Link href="/dashboard">
                                <Button className="font-black uppercase tracking-widest text-[10px] rounded-full shadow-lg transition-all px-6 h-11 flex items-center gap-2 bg-blue-600 text-white shadow-blue-600/20 hover:bg-blue-700 hover:-translate-y-0.5">
                                    <User className="h-4 w-4" />
                                    <span className="hidden sm:inline">Entrar</span>
                                </Button>
                            </Link>
                        </div>

                        {/* Mobile Menu Trigger */}
                        {/* Mobile Menu Trigger */}
                        <MobileMenu triggerColor={isScrolled ? "text-zinc-900 hover:bg-zinc-100" : "text-zinc-600 hover:bg-zinc-100"} />
                    </div>
                </div>
            </div>
        </header>
    )
}
