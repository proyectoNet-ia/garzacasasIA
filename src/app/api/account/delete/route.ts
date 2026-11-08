import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { deleteAgentAccountCompletely } from '@/lib/admin/agent-lifecycle'

export async function DELETE(req: NextRequest) {
    try {
        const supabase = await createClient()
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Sesión no válida o expirada.' }, { status: 401 })
        }

        const body = await req.json().catch(() => ({}))
        if (body?.confirmText !== 'ELIMINAR') {
            return NextResponse.json(
                { error: 'Debes escribir ELIMINAR para confirmar la baja definitiva.' },
                { status: 400 }
            )
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('id, role')
            .eq('id', user.id)
            .maybeSingle()

        if (profile?.role === 'admin') {
            return NextResponse.json(
                {
                    error: 'Las cuentas de Super Agente (Admin) están protegidas contra auto-eliminación. Otro administrador debe retirar el rol Admin primero.',
                },
                { status: 400 }
            )
        }

        const result = await deleteAgentAccountCompletely(user.id)

        // Cerrar sesión en cookies del servidor tras borrar la cuenta
        await supabase.auth.signOut()

        return NextResponse.json({ success: true, ...result })
    } catch (error: any) {
        console.error('[API Account Delete] Error:', error)
        return NextResponse.json(
            { error: error?.message || 'No se pudo completar la eliminación de tu cuenta.' },
            { status: 500 }
        )
    }
}
