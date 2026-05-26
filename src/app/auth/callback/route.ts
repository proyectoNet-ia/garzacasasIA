import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'

// This route handles all Supabase email callback flows:
// - Email confirmation (signup)
// - Password recovery
export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url)
    const error = searchParams.get('error')
    const error_description = searchParams.get('error_description')

    // If Supabase sent an error directly (e.g. link expired, already used)
    if (error) {
        return NextResponse.redirect(`${origin}/login?error=${error}&description=${encodeURIComponent(error_description || '')}`)
    }

    const code = searchParams.get('code')
    const token_hash = searchParams.get('token_hash')
    const type = searchParams.get('type')
    const next = searchParams.get('next')

    // Handle PKCE flow (code-based) — used by newer Supabase versions
    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            // For password recovery, redirect to the reset form
            if (type === 'recovery') {
                return NextResponse.redirect(`${origin}/reset-password`)
            }
            // For email confirmation, redirect to dashboard with welcome flag
            return NextResponse.redirect(next ? `${origin}${next}` : `${origin}/dashboard?verified=true`)
        }
    }

    // Handle email OTP flow (token_hash-based) — used for signup confirmation & recovery
    if (token_hash && type) {
        const supabase = await createClient()
        const { error } = await supabase.auth.verifyOtp({ token_hash, type: type as any })
        if (!error) {
            if (type === 'recovery') {
                return NextResponse.redirect(`${origin}/reset-password`)
            }
            return NextResponse.redirect(`${origin}/dashboard?verified=true`)
        }
    }

    // Redirect to login with error if verification fails
    return NextResponse.redirect(`${origin}/login?error=link-expirado`)
}
