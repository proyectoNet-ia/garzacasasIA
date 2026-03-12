'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
    LayoutDashboard,
    Building2,
    BarChart3,
    User,
    Crown,
    LogOut,
    Menu,
    X,
    Loader2,
    Settings,
    ShieldCheck,
    LifeBuoy
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { createClient } from '@/lib/supabase'
import { LogoutButton } from '@/components/auth/LogoutButton'

export function DashboardSidebar() {
    const pathname = usePathname()
    const [collapsed, setCollapsed] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)
    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    // Expose toggle to window for layout access (simple bridge)
    useEffect(() => {
        (window as any).__toggleMobileMenu = () => setMobileOpen(prev => !prev)
    }, [])

    useEffect(() => {
        let channel: any;

        async function fetchProfile() {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                // Initial Fetch
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('*, subscription_plan, is_unlimited, role')
                    .eq('id', user.id)
                    .single()

                const fetchCount = async () => {
                    const { count } = await supabase
                        .from('properties')
                        .select('*', { count: 'exact', head: true })
                        .eq('agent_id', user.id)
                    return count || 0
                }

                const count = await fetchCount()
                setProfile({ ...profileData, properties_count: count, email: user.email })

                // Real-time Subscription
                channel = supabase
                    .channel('properties-count-sync')
                    .on(
                        'postgres_changes',
                        {
                            event: '*',
                            schema: 'public',
                            table: 'properties',
                            filter: `agent_id=eq.${user.id}`
                        },
                        async () => {
                            const newCount = await fetchCount()
                            setProfile((prev: any) => prev ? { ...prev, properties_count: newCount } : null)
                        }
                    )
                    .subscribe()
            }
            setLoading(false)
        }

        fetchProfile()

        return () => {
            if (channel) supabase.removeChannel(channel)
        }
    }, [supabase])

    // Close mobile menu on path change
    useEffect(() => {
        setMobileOpen(false)
    }, [pathname])

    interface SidebarLink {
        label: string
        href: string
        icon: any
        badge?: string | null
        isAdmin?: boolean
        description?: string
    }

    const links: SidebarLink[] = [
        { label: 'Inicio', href: '/dashboard', icon: LayoutDashboard, badge: null },
        {
            label: 'Propiedades',
            href: '/dashboard/listings',
            icon: Building2,
            badge: profile ? `${profile.properties_count || 0}` : null
        },
        { label: 'Estadísticas', href: '/dashboard/stats', icon: BarChart3, badge: null },
        { label: 'Mi Perfil', href: '/dashboard/profile', icon: User, badge: null },
        {
            label: 'Mi Plan',
            href: '/dashboard/suscripcion',
            icon: Crown,
            badge: profile?.role === 'admin' || profile?.is_unlimited ? 'Ilimitado' : (profile?.subscription_plan || 'Básico')
        },
        { label: 'Soporte', href: '/dashboard/support', icon: LifeBuoy, badge: null },
    ]

    if (profile?.role === 'admin') {
        links.push({
            label: 'cPanel Admin',
            href: '/admin',
            icon: ShieldCheck,
            isAdmin: true,
            description: 'Control global'
        })
    }

    const userInitial = profile?.full_name?.charAt(0) || profile?.email?.charAt(0) || '?'

    const SidebarContent = ({ isMobile = false }) => (
        <div className="flex flex-col h-full overflow-hidden select-none bg-white">
            <style dangerouslySetInnerHTML={{
                __html: `
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            `}} />

            {/* Logo Area */}
            <div className={cn(
                "p-6 flex items-center shrink-0",
                collapsed && !isMobile ? "justify-center px-0" : "justify-between"
            )}>
                <Link href="/" className="flex items-center gap-3 overflow-hidden">
                    <div className="bg-blue-600 w-9 h-9 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 shrink-0">
                        <Building2 className="h-5 w-5 text-white" />
                    </div>
                    {(!collapsed || isMobile) && (
                        <span className="text-xl font-black tracking-tighter text-zinc-900 uppercase truncate">
                            Garza <span className="text-blue-600">IA</span>
                        </span>
                    )}
                </Link>
            </div>

            {/* Scrollable Navigation Area */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 scrollbar-hide flex flex-col">
                <nav className="space-y-1 p-4">
                    {links.map((link) => {
                        const isActive = pathname === link.href
                        return (
                            <Link key={link.href} href={link.href}>
                                <div className={cn(
                                    "group relative flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all cursor-pointer overflow-hidden",
                                    isActive
                                        ? "bg-blue-50 text-blue-700"
                                        : link.isAdmin
                                            ? "bg-indigo-50/50 text-indigo-700 hover:bg-indigo-50 border border-indigo-100/50"
                                            : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                                )}>
                                    <div className="flex items-center gap-3 min-w-0">
                                        {isActive && (
                                            <motion.div
                                                layoutId="active-nav-dashboard"
                                                className="absolute left-0 h-8 w-1 rounded-r-full bg-blue-600"
                                            />
                                        )}
                                        <link.icon className={cn(
                                            "h-5 w-5 shrink-0",
                                            isActive
                                                ? "text-blue-600"
                                                : link.isAdmin
                                                    ? "text-indigo-600"
                                                    : "text-zinc-400 group-hover:text-zinc-600"
                                        )} />
                                        {(!collapsed || isMobile) && (
                                            <div className="flex flex-col items-start leading-tight truncate">
                                                <span className="truncate font-bold">
                                                    {link.label}
                                                </span>
                                                {link.description && (
                                                    <span className={cn(
                                                        "text-[9px] font-medium opacity-60 leading-none mt-0.5 truncate",
                                                        link.isAdmin ? "text-indigo-600" : "text-zinc-500"
                                                    )}>
                                                        {link.description}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    {(!collapsed || isMobile) && link.badge && (
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-blue-100 text-blue-700 shrink-0">
                                            {link.badge}
                                        </span>
                                    )}
                                </div>
                            </Link>
                        )
                    })}
                </nav>

                <div className="mt-auto">
                    <Separator className="bg-zinc-100 mx-4" />
                    {(!collapsed || isMobile) && profile && (
                        <div className="p-4 pt-2">
                            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 shadow-sm overflow-hidden">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="h-6 w-6 rounded-lg bg-blue-600/10 flex items-center justify-center">
                                        <Crown className="h-3.5 w-3.5 text-blue-600" />
                                    </div>
                                    <span className="text-[10px] font-black text-blue-900 uppercase tracking-wider truncate">
                                        Plan {profile?.role === 'admin' || profile?.is_unlimited ? 'Ilimitado' : (profile?.subscription_plan || 'Básico')}
                                    </span>
                                </div>
                                <p className="text-[10px] text-zinc-500 mb-3 font-medium truncate">
                                    {profile.properties_count} propiedades activas
                                </p>
                                <Link
                                    href="/dashboard/suscripcion"
                                    className="block text-center text-[10px] font-bold text-blue-600 hover:text-white hover:bg-blue-600 bg-white py-2 rounded-xl transition-all border border-blue-100 shadow-sm"
                                >
                                    Mejorar Plan
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* FIXED BOTTOM SECTION */}
            <div className="shrink-0 border-t border-zinc-100 bg-zinc-50/50 p-4 space-y-3 pb-safe-offset-4 overflow-hidden w-full max-w-full">
                {(!collapsed || isMobile) ? (
                    <Link
                        href="/dashboard/profile"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-white border border-zinc-100 hover:bg-zinc-100 transition-all group cursor-pointer shadow-sm overflow-hidden"
                    >
                        <div className="h-9 w-9 shrink-0 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-xs uppercase group-hover:scale-105 transition-transform shadow-md">
                            {userInitial}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-bold text-zinc-900 truncate tracking-tight">
                                {profile?.full_name || 'Agente'}
                            </p>
                            <p className="text-[9px] text-zinc-500 truncate leading-none font-medium opacity-80">
                                {profile?.email}
                            </p>
                        </div>
                    </Link>
                ) : (
                    <div className="flex justify-center mb-1">
                        <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-xs shadow-md border border-blue-500/20">
                            {userInitial}
                        </div>
                    </div>
                )}

                <LogoutButton
                    showText={!collapsed || isMobile}
                    className={cn(
                        "w-full justify-start gap-3 text-zinc-500 hover:bg-red-50 hover:text-red-700 transition-all h-11 rounded-xl font-bold text-xs border border-transparent hover:border-red-100 overflow-hidden whitespace-nowrap",
                        (collapsed && !isMobile) && "justify-center px-0 h-10 w-10 mx-auto rounded-xl shadow-sm bg-white hover:bg-red-600 hover:text-white border-zinc-200 hover:border-red-500"
                    )}
                />
            </div>
        </div>
    )

    return (
        <>
            <style dangerouslySetInnerHTML={{
                __html: `
                .pb-safe-offset-4 { padding-bottom: calc(1rem + env(safe-area-inset-bottom, 0px)); }
                @media (min-width: 1024px) { .pb-safe-offset-4 { padding-bottom: 2rem; } }
            `}} />

            {/* Desktop Sidebar */}
            <aside
                className={cn(
                    "relative hidden lg:flex h-[100dvh] flex-col border-r border-zinc-200 bg-white text-zinc-700 transition-all duration-300 ease-in-out overflow-hidden shadow-sm",
                    collapsed ? "w-20" : "w-64"
                )}
            >
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar (Drawer) */}
            <div className={cn(
                "fixed inset-0 z-50 lg:hidden transition-opacity duration-300 overflow-hidden backdrop-blur-sm bg-black/40",
                mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            )}>
                {/* Backdrop */}
                <div
                    className="absolute inset-0"
                    onClick={() => setMobileOpen(false)}
                />

                {/* Drawer */}
                <motion.aside
                    initial={{ x: "-100%" }}
                    animate={{ x: mobileOpen ? 0 : "-100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="absolute left-0 top-0 bottom-0 w-72 bg-white flex flex-col shadow-2xl h-[100dvh] overflow-hidden"
                >
                    <SidebarContent isMobile />
                </motion.aside>
            </div>

            {/* Mobile Floating Button */}
            {!mobileOpen && (
                <div className="fixed bottom-6 right-6 z-40 lg:hidden">
                    <Button
                        size="icon"
                        onClick={() => setMobileOpen(true)}
                        className="h-14 w-14 rounded-full bg-blue-600 text-white shadow-xl shadow-blue-500/40 hover:scale-110 active:scale-95 transition-all"
                    >
                        <Menu className="h-6 w-6" />
                    </Button>
                </div>
            )}
        </>
    )
}
