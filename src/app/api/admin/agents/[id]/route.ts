import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase-server'
import {
    deleteAgentAccountCompletely,
    isValidUuid,
    setAgentSuspensionState,
} from '@/lib/admin/agent-lifecycle'

async function verifyAdminCaller(): Promise<
    { error: NextResponse; adminUser?: never } | { error?: never; adminUser: { id: string } }
> {
    const supabase = await createClient()
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
        return { error: NextResponse.json({ error: 'No autenticado.' }, { status: 401 }) }
    }

    let callerProfile: { id: string; role?: string | null; status?: string | null } | null = null
    const { data: primaryCaller, error: callerError } = await supabase
        .from('profiles')
        .select('id, role, status')
        .eq('id', user.id)
        .single()

    if (callerError) {
        const fallback = await supabase
            .from('profiles')
            .select('id, role')
            .eq('id', user.id)
            .single()
        callerProfile = fallback.data ? { ...(fallback.data as any), status: 'active' } : null
    } else {
        callerProfile = primaryCaller as any
    }

    if (callerProfile?.role !== 'admin' || callerProfile?.status === 'suspended') {
        return { error: NextResponse.json({ error: 'Permisos insuficientes.' }, { status: 403 }) }
    }

    return { adminUser: user }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const authCheck = await verifyAdminCaller()
    if (authCheck.error) return authCheck.error

    const { id: targetId } = await params
    if (!isValidUuid(targetId)) {
        return NextResponse.json({ error: 'ID de agente inválido.' }, { status: 400 })
    }

    if (targetId === authCheck.adminUser.id) {
        return NextResponse.json(
            { error: 'Por seguridad, no puedes modificar el rol ni suspender tu propia cuenta.' },
            { status: 400 }
        )
    }

    try {
        const body = await req.json()
        const action = body?.action as 'promote' | 'demote' | 'suspend' | 'reactivate' | undefined

        if (!action || !['promote', 'demote', 'suspend', 'reactivate'].includes(action)) {
            return NextResponse.json({ error: 'Acción no válida.' }, { status: 400 })
        }

        const serviceSupabase = createServiceClient()
        let targetProfile: { id: string; role?: string | null; status?: string | null } | null = null
        let { data: primaryTarget, error: targetError } = await serviceSupabase
            .from('profiles')
            .select('id, role, status')
            .eq('id', targetId)
            .single()

        if (targetError) {
            const fallbackTarget = await serviceSupabase
                .from('profiles')
                .select('id, role')
                .eq('id', targetId)
                .single()
            targetProfile = fallbackTarget.data ? { ...(fallbackTarget.data as any), status: 'active' } : null
            targetError = fallbackTarget.error
        } else {
            targetProfile = primaryTarget as any
        }

        if (targetError || !targetProfile) {
            return NextResponse.json({ error: 'Agente no encontrado.' }, { status: 404 })
        }

        if (action === 'suspend') {
            if (targetProfile.role === 'admin') {
                return NextResponse.json(
                    { error: 'Primero quita los privilegios de Admin antes de suspender esta cuenta.' },
                    { status: 400 }
                )
            }
            const result = await setAgentSuspensionState(targetId, true)
            return NextResponse.json({ success: true, status: 'suspended', ...result })
        }

        if (action === 'reactivate') {
            await setAgentSuspensionState(targetId, false)
            return NextResponse.json({ success: true, status: 'active' })
        }

        const nextRole = action === 'promote' ? 'admin' : 'agent'
        const { error: updateRoleError } = await serviceSupabase
            .from('profiles')
            .update({ role: nextRole, updated_at: new Date().toISOString() })
            .eq('id', targetId)

        if (updateRoleError) {
            return NextResponse.json({ error: updateRoleError.message }, { status: 500 })
        }

        return NextResponse.json({ success: true, role: nextRole })
    } catch (error: any) {
        console.error('[API Admin Agents PATCH] Error:', error)
        return NextResponse.json(
            { error: error?.message || 'Error procesando la acción sobre el agente.' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const authCheck = await verifyAdminCaller()
    if (authCheck.error) return authCheck.error

    const { id: targetId } = await params
    if (!isValidUuid(targetId)) {
        return NextResponse.json({ error: 'ID de agente inválido.' }, { status: 400 })
    }

    if (targetId === authCheck.adminUser.id) {
        return NextResponse.json(
            { error: 'Por seguridad, no puedes eliminar tu propia cuenta de Super Agente.' },
            { status: 400 }
        )
    }

    try {
        const serviceSupabase = createServiceClient()
        const { data: targetProfile } = await serviceSupabase
            .from('profiles')
            .select('id, role')
            .eq('id', targetId)
            .maybeSingle()

        if (targetProfile?.role === 'admin') {
            return NextResponse.json(
                { error: 'Protección activa: quita primero el rol de Super Agente antes de eliminar esta cuenta.' },
                { status: 400 }
            )
        }

        const result = await deleteAgentAccountCompletely(targetId)
        return NextResponse.json({ success: true, ...result })
    } catch (error: any) {
        console.error('[API Admin Agents DELETE] Error:', error)
        return NextResponse.json(
            { error: error?.message || 'Error al eliminar la cuenta del agente.' },
            { status: 500 }
        )
    }
}
