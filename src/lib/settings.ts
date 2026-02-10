import { createClient as createBrowserClient } from '@/lib/supabase-client'

export async function getSiteSettings(key: string) {
    // We strictly use the browser client here since this utility is being imported 
    // by Client Components that Next.js is trying to bundle for the browser.
    // For Server Components, it's better to fetch via supabase directly.
    const supabase = createBrowserClient()

    try {
        const { data, error } = await supabase
            .from('site_settings')
            .select('value')
            .eq('key', key)
            .single()

        if (error) {
            console.error(`Error fetching site settings for key "${key}":`, error)
            return null
        }

        return data?.value || null
    } catch (e) {
        console.error("Critical error fetching site settings:", e)
        return null
    }
}
