import { createClient as createBrowserClient } from '@/lib/supabase-client'

export async function getSiteSettings(key: string) {
    // We strictly use the browser client here since this utility is being imported 
    // by Client Components that Next.js is trying to bundle for the browser.
    // For Server Components, it's better to fetch via supabase directly.
    const supabase = createBrowserClient()

    // Fetch the settings row (assuming single row for site settings)
    try {
        const { data, error } = await supabase
            .from('site_settings')
            .select('*')
            .single()

        if (error) {
            console.error(`Error fetching site settings (key: ${key}):`, error)
            return null
        }

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
                phone: data.contact_phone, // These might be undefined if columns don't exist
                email: data.contact_email,
                instagram: data.social_instagram,
                facebook: data.social_facebook,
                whatsapp: data.contact_whatsapp,
            }
        }

        // Add other mappings as needed
        return null
    } catch (e) {
        console.error("Critical error fetching site settings:", e)
        return null
    }
}
