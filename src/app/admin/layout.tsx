import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { LayoutDashboard, Settings, Users, Building, Building2, FileText, BarChart3, User } from 'lucide-react'
import Link from 'next/link'
import { LogoutButton } from '@/components/auth/LogoutButton'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    // Check if user is admin
    const { data: profile } = await supabase
        .from('profiles')
        .select('role, full_name, email')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin') {
        redirect('/dashboard')
    }

    const menuItems = [
        { icon: LayoutDashboard, label: 'Overview', href: '/admin', badge: null },
        { icon: Building2, label: 'Mis Propiedades', href: '/admin/my-properties', badge: 'Ilimitadas' },
        { icon: User, label: 'Mi Perfil', href: '/admin/profile', badge: null },
        { icon: Users, label: 'Agentes', href: '/admin/agents', badge: null },
        { icon: Building, label: 'Todas las Propiedades', href: '/admin/all-properties', badge: null },
        { icon: FileText, label: 'CMS', href: '/admin/cms', badge: null },
        { icon: BarChart3, label: 'Analytics', href: '/admin/analytics', badge: null },
        { icon: Settings, label: 'Configuración', href: '/admin/settings', badge: null },
    ]

    const userInitial = profile?.full_name?.charAt(0) || profile?.email?.charAt(0) || 'A'

    return (
        <div className="flex h-screen bg-zinc-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-zinc-200 flex flex-col">
                {/* Logo */}
                <div className="p-6 border-b border-zinc-200">
                    <h1 className="text-xl font-black text-zinc-900">Admin Panel</h1>
                    <p className="text-xs text-zinc-500 mt-1">Super Agente</p>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {menuItems.map((item) => {
                        const Icon = item.icon
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <Icon className="h-5 w-5 text-zinc-400 group-hover:text-blue-600" />
                                    <span>{item.label}</span>
                                </div>
                                {item.badge && (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                                        {item.badge}
                                    </span>
                                )}
                            </Link>
                        )
                    })}
                </nav>

                {/* User Info & Logout */}
                <div className="p-4 border-t border-zinc-200 space-y-2">
                    <Link
                        href="/admin/profile"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-50 hover:bg-zinc-100 transition-colors group cursor-pointer"
                    >
                        <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold uppercase group-hover:scale-105 transition-transform">
                            {userInitial}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-zinc-900 truncate">
                                {profile?.full_name || 'Admin'}
                            </p>
                            <p className="text-xs text-zinc-500 truncate">{profile?.email}</p>
                        </div>
                    </Link>
                    <LogoutButton className="w-full justify-start text-zinc-700 hover:bg-zinc-100 hover:text-red-600" />
                </div>
            </aside>


            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
        </div>
    )
}
