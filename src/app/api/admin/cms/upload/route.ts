import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase-server'

export const runtime = 'nodejs'

const ALLOWED_MIME_TYPES = new Set([
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp',
    'image/svg+xml',
    'image/x-icon',
    'image/vnd.microsoft.icon',
])

const ALLOWED_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'webp', 'svg', 'ico'])
const MAX_BYTES = 10 * 1024 * 1024 // 10MB

export async function POST(req: NextRequest) {
    try {
        // 1. Validar autenticación de administrador
        const userClient = await createClient()
        const {
            data: { user },
            error: authError,
        } = await userClient.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'No autenticado.' }, { status: 401 })
        }

        const { data: profile, error: profileError } = await userClient
            .from('profiles')
            .select('role, status')
            .eq('id', user.id)
            .maybeSingle()

        if (profileError || profile?.role !== 'admin' || profile?.status === 'suspended') {
            return NextResponse.json({ error: 'Permisos insuficientes de administrador.' }, { status: 403 })
        }

        // 2. Extraer archivo y prefijo del FormData
        const formData = await req.formData()
        const file = formData.get('file') as File | null
        const prefix = (formData.get('prefix') as string) || 'asset'

        if (!file) {
            return NextResponse.json({ error: 'No se envió ningún archivo.' }, { status: 400 })
        }

        if (file.size > MAX_BYTES) {
            return NextResponse.json({ error: 'El archivo excede el límite máximo de 10 MB.' }, { status: 400 })
        }

        const ext = (file.name.split('.').pop() || '').toLowerCase()
        const mime = file.type || ''

        const isValidMime = mime && ALLOWED_MIME_TYPES.has(mime)
        const isValidExt = ext && ALLOWED_EXTENSIONS.has(ext)

        if (!isValidMime && !isValidExt) {
            return NextResponse.json(
                { error: `Tipo de archivo no permitido (${mime || ext}). Formatos aceptados: PNG, JPG, WEBP, SVG, ICO.` },
                { status: 400 }
            )
        }

        // 3. Subir vía Service Role Client (evita bloqueos de RLS en storage.objects)
        const serviceSupabase = createServiceClient()
        const timestamp = Date.now()
        const sanitizedExt = ext || (mime.includes('svg') ? 'svg' : mime.includes('icon') ? 'ico' : 'png')
        const fileName = `${prefix}-${timestamp}.${sanitizedExt}`
        const filePath = `cms/${fileName}`

        const buffer = Buffer.from(await file.arrayBuffer())

        // Asegurar que el bucket público 'site-assets' exista
        await serviceSupabase.storage
            .createBucket('site-assets', { public: true })
            .catch(() => {})

        const effectiveMime = mime || (sanitizedExt === 'ico' ? 'image/x-icon' : sanitizedExt === 'svg' ? 'image/svg+xml' : 'image/png')

        const { error: uploadError } = await serviceSupabase.storage
            .from('site-assets')
            .upload(filePath, buffer, {
                contentType: effectiveMime,
                upsert: true,
            })

        if (uploadError) {
            console.error('Error subiendo archivo con service role:', uploadError)
            return NextResponse.json({ error: uploadError.message }, { status: 500 })
        }

        const {
            data: { publicUrl },
        } = serviceSupabase.storage.from('site-assets').getPublicUrl(filePath)

        return NextResponse.json({ publicUrl, filePath })
    } catch (error: any) {
        console.error('Excepción en /api/admin/cms/upload:', error)
        return NextResponse.json({ error: error?.message || 'Error interno al procesar el archivo.' }, { status: 500 })
    }
}
