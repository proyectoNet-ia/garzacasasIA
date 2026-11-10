import { createClient as createBrowserClient } from '@/lib/supabase-client'



export const DEFAULT_CONTACT_CONFIG = {
    phone: "+52 (81) 1234-5678",
    email: "contacto@garzacasas.com",
    whatsapp: "https://wa.me/528112345678",
    instagram: "https://instagram.com",
    facebook: "https://facebook.com",
    linkedin: "",
    twitter: "",
    youtube: "",
}

const COLUMN_MAP: Record<string, string> = {
    hero_config: 'hero_title, hero_subtitle, hero_image_url',
    contact_config: 'contact_phone, contact_email, contact_whatsapp, social_instagram, social_facebook, social_linkedin, social_twitter, social_youtube',
    seo_config: 'seo_title, seo_description, seo_keywords',
    brand_config: 'logo_on_dark_url, logo_on_light_url',
    icon_config: 'site_icon_url'
}

export async function getSiteSettings(key: string): Promise<any> {
    const supabase = createBrowserClient()

    try {
        let columns = COLUMN_MAP[key] || 'hero_title, hero_subtitle, hero_image_url, social_instagram, social_facebook, social_linkedin, social_twitter, social_youtube, seo_title, seo_description, seo_keywords'

        let result: any = await supabase
            .from('site_settings')
            .select(columns)
            .eq('id', 1)
            .maybeSingle()

        // Si falló por columnas que aún no existen (p. ej. contact_phone), reintentar sin ellas
        if (result?.error && key === 'contact_config') {
            result = await supabase
                .from('site_settings')
                .select('social_instagram, social_facebook, social_linkedin, social_twitter, social_youtube')
                .eq('id', 1)
                .maybeSingle()
        }

        const data = result?.data
        const error = result?.error

        if (error || !data) {
            if (key === 'contact_config') return DEFAULT_CONTACT_CONFIG
            return null
        }

        const settings = data as Record<string, any>

        if (key === 'hero_config') {
            return {
                title: settings.hero_title || '',
                subtitle: settings.hero_subtitle || '',
                image_url: settings.hero_image_url || ''
            }
        }

        if (key === 'contact_config') {
            return {
                phone: settings.contact_phone || DEFAULT_CONTACT_CONFIG.phone,
                email: settings.contact_email || DEFAULT_CONTACT_CONFIG.email,
                whatsapp: settings.contact_whatsapp || DEFAULT_CONTACT_CONFIG.whatsapp,
                instagram: settings.social_instagram || DEFAULT_CONTACT_CONFIG.instagram,
                facebook: settings.social_facebook || DEFAULT_CONTACT_CONFIG.facebook,
                linkedin: settings.social_linkedin || DEFAULT_CONTACT_CONFIG.linkedin,
                twitter: settings.social_twitter || DEFAULT_CONTACT_CONFIG.twitter,
                youtube: settings.social_youtube || DEFAULT_CONTACT_CONFIG.youtube
            }
        }

        if (key === 'brand_config') {
            return {
                onDark: settings.logo_on_dark_url || null,
                onLight: settings.logo_on_light_url || null
            }
        }

        if (key === 'icon_config') {
            return {
                site_icon_url: settings.site_icon_url || null
            }
        }

        if (key === 'seo_config') {
            return {
                title: settings.seo_title || '',
                description: settings.seo_description || '',
                keywords: settings.seo_keywords || ''
            }
        }

        return data
    } catch (e) {
        console.error("Critical error fetching site settings:", e)
        return null
    }
}
