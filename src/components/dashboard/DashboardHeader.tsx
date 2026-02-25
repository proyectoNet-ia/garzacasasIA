'use client'

import React from 'react'
import Link from 'next/link'
import { Building2, Menu } from 'lucide-react'
import { NotificationCenter } from './NotificationCenter'
import { Button } from '@/components/ui/button'

export function DashboardHeader() {
    return (
        <header className="h-16 border-b border-zinc-200 bg-white flex items-center justify-between px-4 lg:px-8 shrink-0 z-40">
            <Link href="/" className="flex items-center gap-2 transition-transform hover:scale-105">
                <div className="bg-blue-600 shadow-blue-500/20 flex items-center justify-center w-8 h-8 rounded-lg transition-all">
                    <Building2 className="h-4 w-4 text-white" />
                </div>
                <span className="text-lg font-black tracking-tighter text-zinc-900 uppercase">
                    Garza Casas <span className="text-blue-600">IA</span>
                </span>
            </Link>

            <div className="flex items-center gap-2">
                <NotificationCenter />
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
