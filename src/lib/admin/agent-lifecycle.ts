import { createServiceClient } from '@/lib/supabase-server'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function isValidUuid(value: string): boolean {
    return UUID_REGEX.test(value)
}

export interface DeleteAgentResult {
    deletedPropertiesCount: number
    deletedStorageFilesCount: number
    preservedPaymentsCount: number
    deletedTrialPaymentsCount: number
}

/**
 * Elimina todos los archivos dentro de la carpeta `{userId}/` en un bucket de Supabase Storage.
 */
async function purgeUserStorageFolder(
    serviceSupabase: ReturnType<typeof createServiceClient>,
    bucketName: string,
    userId: string
): Promise<number> {
    const { data: items, error: listError } = await serviceSupabase.storage
        .from(bucketName)
        .list(userId, { limit: 1000 })

    if (listError || !items || items.length === 0) {
        return 0
    }

    const filePaths = items
        .filter(item => Boolean(item.name))
        .map(item => `${userId}/${item.name}`)

    if (filePaths.length === 0) {
        return 0
    }

    const { error: removeError } = await serviceSupabase.storage
        .from(bucketName)
        .remove(filePaths)

    if (removeError) {
        console.warn(`[AgentLifecycle] Aviso limpiando bucket ${bucketName} para ${userId}:`, removeError.message)
        return 0
    }

    return filePaths.length
}

/**
 * Ejecuta la baja definitiva de una cuenta de agente:
 * 1. Elimina intentos de pago de prueba (`pending`, `cancelled`, `rejected`, `in_process`).
 * 2. Preserva pagos reales (`approved`, `completed`, `refunded`) guardando snapshot y desvinculando `user_id`.
 * 3. Limpia binarios en Storage (`avatars/{id}/*` y `properties/{id}/*`).
 * 4. Elimina propiedades del agente (actualizando conteos de zonas).
 * 5. Elimina el usuario de raíz en `auth.users` (y `public.profiles` en cascada).
 */
export async function deleteAgentAccountCompletely(targetUserId: string): Promise<DeleteAgentResult> {
    if (!isValidUuid(targetUserId)) {
        throw new Error('Identificador de usuario inválido.')
    }

    const serviceSupabase = createServiceClient()

    // 1. Obtener datos actuales del perfil para snapshot contable
    const { data: profile } = await serviceSupabase
        .from('profiles')
        .select('id, full_name, email, role')
        .eq('id', targetUserId)
        .maybeSingle()

    // Obtener email de respaldo desde Auth en caso de no existir en profiles
    const { data: authUserLookup } = await serviceSupabase.auth.admin.getUserById(targetUserId)
    const snapshotName = profile?.full_name?.trim() || authUserLookup?.user?.user_metadata?.full_name || 'Agente Eliminado'
    const snapshotEmail = profile?.email?.trim() || authUserLookup?.user?.email || null

    // 2. Limpiar únicamente intentos de pago de prueba / no capturados
    const { data: deletedTrials, error: deleteTrialsError } = await serviceSupabase
        .from('payments')
        .delete()
        .eq('user_id', targetUserId)
        .in('status', ['pending', 'cancelled', 'rejected', 'in_process'])
        .select('id')

    if (deleteTrialsError) {
        console.warn('[AgentLifecycle] Aviso limpiando pagos de prueba:', deleteTrialsError.message)
    }

    // 3. Preservar pagos reales aprobados/reembolsados para contabilidad en /admin/sales
    const { data: realPayments, error: realPaymentsQueryError } = await serviceSupabase
        .from('payments')
        .select('id')
        .eq('user_id', targetUserId)
        .in('status', ['approved', 'completed', 'refunded'])

    if (realPaymentsQueryError) {
        throw new Error('No se pudo verificar el historial contable del agente: ' + realPaymentsQueryError.message)
    }

    const preservedPaymentsCount = realPayments?.length ?? 0

    if (preservedPaymentsCount > 0) {
        const { error: preserveError } = await serviceSupabase
            .from('payments')
            .update({
                user_id: null,
                agent_name_snapshot: snapshotName,
                agent_email_snapshot: snapshotEmail,
                updated_at: new Date().toISOString(),
            })
            .eq('user_id', targetUserId)
            .in('status', ['approved', 'completed', 'refunded'])

        if (preserveError) {
            throw new Error(
                'Esta cuenta registra pagos reales aprobados. Ejecuta primero la migración SQL 20261107_agent_deletion_accounting_integrity.sql en Supabase para conservar la contabilidad antes de eliminar al agente.'
            )
        }
    }

    // 4. Purgar archivos multimedia en Storage (avatars y properties)
    const [deletedAvatars, deletedPropertyImages] = await Promise.all([
        purgeUserStorageFolder(serviceSupabase, 'avatars', targetUserId),
        purgeUserStorageFolder(serviceSupabase, 'properties', targetUserId),
    ])

    // 5. Eliminar explícitamente las propiedades del agente (evita huérfanos y actualiza conteo de zonas)
    const { data: deletedProps, error: deletePropsError } = await serviceSupabase
        .from('properties')
        .delete()
        .eq('agent_id', targetUserId)
        .select('id')

    if (deletePropsError) {
        throw new Error('Error eliminando propiedades asociadas: ' + deletePropsError.message)
    }

    // 6. Eliminar raíz en auth.users (dispara ON DELETE CASCADE hacia public.profiles y tablas satélite)
    if (authUserLookup?.user) {
        const { error: authDeleteError } = await serviceSupabase.auth.admin.deleteUser(targetUserId)
        if (authDeleteError) {
            throw new Error('Error eliminando credenciales en Supabase Auth: ' + authDeleteError.message)
        }
    }

    // Limpieza defensiva en profiles por si existía un registro huérfano sin auth.users
    await serviceSupabase.from('profiles').delete().eq('id', targetUserId)

    return {
        deletedPropertiesCount: deletedProps?.length ?? 0,
        deletedStorageFilesCount: deletedAvatars + deletedPropertyImages,
        preservedPaymentsCount,
        deletedTrialPaymentsCount: deletedTrials?.length ?? 0,
    }
}

/**
 * Suspende o reactiva un agente a nivel de Auth (`ban_duration`) y base de datos (`profiles.status`).
 * Al suspender, pasa sus propiedades activas a borrador (`draft`) para retirarlas del catálogo público.
 */
export async function setAgentSuspensionState(
    targetUserId: string,
    suspend: boolean
): Promise<{ pausedPropertiesCount: number }> {
    if (!isValidUuid(targetUserId)) {
        throw new Error('Identificador de usuario inválido.')
    }

    const serviceSupabase = createServiceClient()

    const { error: authBanError } = await serviceSupabase.auth.admin.updateUserById(targetUserId, {
        ban_duration: suspend ? '876000h' : 'none',
    })

    if (authBanError) {
        throw new Error('No se pudo actualizar el bloqueo de acceso en Auth: ' + authBanError.message)
    }

    const { error: profileError } = await serviceSupabase
        .from('profiles')
        .update({
            status: suspend ? 'suspended' : 'active',
            updated_at: new Date().toISOString(),
        })
        .eq('id', targetUserId)

    if (profileError) {
        if (suspend) {
            await serviceSupabase.auth.admin.updateUserById(targetUserId, { ban_duration: 'none' })
        }
        if (profileError.code === '42703') {
            throw new Error(
                'Ejecuta primero la migración SQL 20261107_agent_deletion_accounting_integrity.sql en Supabase para habilitar la suspensión de cuentas.'
            )
        }
        throw new Error('No se pudo actualizar el estado del perfil: ' + profileError.message)
    }

    let pausedPropertiesCount = 0

    if (suspend) {
        const { data: pausedProps } = await serviceSupabase
            .from('properties')
            .update({
                status: 'draft',
                updated_at: new Date().toISOString(),
            })
            .eq('agent_id', targetUserId)
            .eq('status', 'active')
            .select('id')

        pausedPropertiesCount = pausedProps?.length ?? 0
    }

    return { pausedPropertiesCount }
}
