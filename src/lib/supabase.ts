import { createBrowserClient } from '@supabase/ssr'
import { SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | undefined

export function createClient() {
    if (client) return client

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    console.log('Supabase Browser Client Initialization:', {
        hasUrl: !!url,
        hasAnonKey: !!anonKey
    })

    if (!url || !anonKey) {
        console.error('Missing Supabase environment variables! Ensure .env.local is loaded and server is restarted.')
    }

    client = createBrowserClient(
        url!,
        anonKey!
    )

    return client
}
