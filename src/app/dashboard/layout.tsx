import React from 'react'
import { DashboardSidebar } from '@/components/dashboard/Sidebar'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex h-screen w-full bg-zinc-50 overflow-hidden">
            <DashboardSidebar />
            <main className="flex-1 overflow-y-auto bg-zinc-50 lg:bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] lg:from-zinc-100 lg:via-zinc-50 lg:to-white">
                <div className="container mx-auto p-4 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {children}
                </div>
            </main>
        </div>
    )
}
