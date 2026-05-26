'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export function LogoutButton({ className, showText = true }: { className?: string, showText?: boolean }) {
    const router = useRouter()
    const supabase = createClient()

    const handleLogout = async () => {
        try {
            const { error } = await supabase.auth.signOut()

            if (error) throw error

            toast.success('Sesión cerrada exitosamente')
            router.push('/login')
            router.refresh()
        } catch (error: any) {
            console.error('Logout error:', error)
            toast.error('Error al cerrar sesión')
        }
    }

    return (
        <Button
            onClick={handleLogout}
            variant="ghost"
            className={className}
            title={!showText ? "Cerrar Sesión" : undefined}
        >
            <LogOut className={cn("h-4 w-4", showText && "mr-2")} />
            {showText && <span>Cerrar Sesión</span>}
        </Button>
    )
}
