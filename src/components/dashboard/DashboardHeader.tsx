'use client'

import React from 'react'
import Link from 'next/link'
import { Building2, Menu } from 'lucide-react'
import { NotificationCenter } from './NotificationCenter'
import { Button } from '@/components/ui/button'
import { LogoutButton } from '@/components/auth/LogoutButton'
import { BrandLogo } from '@/components/brand/BrandLogo'

export function DashboardHeader() {
    return (
        <header className="h-16 border-b border-zinc-200 bg-white flex items-center justify-between px-4 lg:px-8 shrink-0 z-40">
            <Link href="/" className="flex items-center gap-2 transition-transform hover:scale-105">
                <BrandLogo
                    initialSurface="light"
                    imgClassName="h-9 max-w-[200px]"
                    fallback={
                        <>
                        <div className="bg-blue-600 shadow-blue-500/20 flex items-center justify-center w-9 h-9 rounded-xl transition-all">
                            <Building2 className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-xl font-black tracking-tighter text-zinc-900">
                            Garza <span className="text-blue-500">Casas</span>
                        </span>
                        </>
                    }
                />
            </Link>

            <div className="flex items-center gap-2">
                <NotificationCenter />

                <div className="h-8 w-[1px] bg-zinc-200 mx-1 hidden sm:block" />

                <div className="hidden sm:block">
                    <LogoutButton
                        showText={false}
                        className="h-9 w-9 text-zinc-500 hover:text-red-600 hover:bg-red-50 transition-all rounded-full"
                    />
                </div>

                <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden text-zinc-500 hover:text-zinc-900"
                    onClick={() => (window as any).__toggleMobileMenu?.()}
                >
                    <Menu className="h-5 w-5" />
                </Button>
            </div>
        </header>
    )
}
