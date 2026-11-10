import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase-server'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
    try {
        // 1. Validar que el usuario sea un administrador activo
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

        // 2. Extraer datos de configuración del cuerpo de la petición
        const body = await req.json()
        const {
            hero_title,
            hero_subtitle,
            hero_image_url,
            site_icon_url,
            logo_on_dark_url,
            logo_on_light_url,
            social_facebook,
            social_instagram,
            social_linkedin,
            social_twitter,
            social_youtube,
            seo_title,
            seo_description,
            seo_keywords,
        } = body

        // 3. Guardar en base de datos vía Service Role Client (evita bloqueos de RLS)
        const serviceSupabase = createServiceClient()

        const payload: Record<string, any> = {
            id: 1,
            hero_title: hero_title ?? '',
            hero_subtitle: hero_subtitle ?? '',
            hero_image_url: hero_image_url ?? '',
            site_icon_url: site_icon_url ?? null,
            logo_on_dark_url: logo_on_dark_url ?? null,
            logo_on_light_url: logo_on_light_url ?? null,
            social_facebook: social_facebook ?? '',
            social_instagram: social_instagram ?? '',
            social_linkedin: social_linkedin ?? '',
            social_twitter: social_twitter ?? '',
            social_youtube: social_youtube ?? '',
            seo_title: seo_title ?? '',
            seo_description: seo_description ?? '',
            seo_keywords: seo_keywords ?? '',
            updated_at: new Date().toISOString(),
        }

        // Intentar primero UPDATE en id = 1
        const { data: updateData, error: updateError } = await serviceSupabase
            .from('site_settings')
            .update(payload)
            .eq('id', 1)
            .select('id')

        if (updateError) {
            console.error('Error en update site_settings:', updateError)
            // Si falló, intentar upsert
            const { error: upsertError } = await serviceSupabase
                .from('site_settings')
                .upsert(payload, { onConflict: 'id' })

            if (upsertError) {
                console.error('Error en upsert site_settings:', upsertError)
                return NextResponse.json({ error: upsertError.message }, { status: 500 })
            }
        } else if (!updateData || updateData.length === 0) {
            // No existía fila con id=1, insertar
            const { error: insertError } = await serviceSupabase
                .from('site_settings')
                .insert([payload])

            if (insertError) {
                console.error('Error en insert site_settings:', insertError)
                return NextResponse.json({ error: insertError.message }, { status: 500 })
            }
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Excepción en /api/admin/cms/settings:', error)
        return NextResponse.json(
            { error: error?.message || 'Error interno al guardar la configuración.' },
            { status: 500 }
        )
    }
}
