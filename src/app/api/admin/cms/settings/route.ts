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
            contact_phone,
            contact_email,
            contact_whatsapp,
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
            updated_at: new Date().toISOString(),
        }

        const assignIfDefined = (key: string, val: any) => {
            if (val !== undefined) {
                payload[key] = val
            }
        }

        assignIfDefined('hero_title', hero_title)
        assignIfDefined('hero_subtitle', hero_subtitle)
        assignIfDefined('hero_image_url', hero_image_url)
        assignIfDefined('site_icon_url', site_icon_url)
        assignIfDefined('logo_on_dark_url', logo_on_dark_url)
        assignIfDefined('logo_on_light_url', logo_on_light_url)
        assignIfDefined('contact_phone', contact_phone)
        assignIfDefined('contact_email', contact_email)
        assignIfDefined('contact_whatsapp', contact_whatsapp)
        assignIfDefined('social_facebook', social_facebook)
        assignIfDefined('social_instagram', social_instagram)
        assignIfDefined('social_linkedin', social_linkedin)
        assignIfDefined('social_twitter', social_twitter)
        assignIfDefined('social_youtube', social_youtube)
        assignIfDefined('seo_title', seo_title)
        assignIfDefined('seo_description', seo_description)
        assignIfDefined('seo_keywords', seo_keywords)

        // Intentar primero UPDATE en id = 1
        let { data: updateData, error: updateError } = await serviceSupabase
            .from('site_settings')
            .update(payload)
            .eq('id', 1)
            .select('id')

        // Resiliencia: Si falla por columnas que aún no existen en DB (p. ej. contact_phone o logos)
        if (updateError && (updateError.code === '42703' || updateError.message?.includes('does not exist'))) {
            console.warn('Columnas ausentes detectadas en site_settings, reintentando con payload base:', updateError.message)
            const fallbackPayload = { ...payload }
            delete fallbackPayload.contact_phone
            delete fallbackPayload.contact_email
            delete fallbackPayload.contact_whatsapp
            delete fallbackPayload.logo_on_dark_url
            delete fallbackPayload.logo_on_light_url
            delete fallbackPayload.site_icon_url

            const fallbackRes = await serviceSupabase
                .from('site_settings')
                .update(fallbackPayload)
                .eq('id', 1)
                .select('id')

            updateData = fallbackRes.data
            updateError = fallbackRes.error
        }

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
