import { createClient as createBrowserClient } from '@/lib/supabase-client'



export async function getSiteSettings(key: string) {
    // We strictly use the browser client here since this utility is being imported 
    // by Client Components that Next.js is trying to bundle for the browser.
    // For Server Components, it's better to fetch via supabase directly.
    const supabase = createBrowserClient()

    try {
        // 1. Try Key-Value approach (New Admin System)
        const { data: kvData } = await supabase
            .from('site_settings')
            .select('value')
            .eq('key', key)
            .single()

        if (kvData?.value) {
            return kvData.value
        }

        // 2. Fallback to Flat Columns System (Old System)
        // This is necessary if the DB hasn't been fully migrated or if we are reading legacy data
        const { data: flatData } = await supabase
            .from('site_settings')
            .select('*')
            // Don't use .single() if we suspect multiple rows (from newly added keys)
            // Just take the first one that looks like a settings row (usually id=1)
            .limit(1)

        const data = flatData?.[0]

        if (!data) return null

        // Map the flat columns to the expected config objects
        if (key === 'hero_config') {
            return {
                title: data.hero_title,
                subtitle: data.hero_subtitle,
                image_url: data.hero_image_url
            }
        }

        if (key === 'contact_config') {
            return {
                phone: data.contact_phone,
                email: data.contact_email,
                instagram: data.social_instagram,
                facebook: data.social_facebook,
                whatsapp: data.contact_whatsapp,
            }
        }

        return null
    } catch (e) {
        console.error("Critical error fetching site settings:", e)
        return null
    }
}
