
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase URL or Service Role Key')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

async function fixAdminRole() {
    console.log('--- Fixing Admin Role ---')

    // 1. List Users
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers()

    if (usersError) {
        console.error('Error listing users:', usersError)
        return
    }

    console.log(`Found ${users.length} users.`)

    // 2. Check Profiles for each user
    for (const user of users) {
        console.log(`\nUser: ${user.email} (ID: ${user.id})`)

        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

        if (profileError && profileError.code !== 'PGRST116') {
            console.error('  Error fetching profile:', profileError)
            continue
        }

        if (!profile) {
            console.log('  ❌ No profile found. Creating Admin profile...')
            const { error: insertError } = await supabase
                .from('profiles')
                .insert({
                    id: user.id,
                    email: user.email,
                    role: 'admin', // Force admin role
                    full_name: 'Admin User',
                    updated_at: new Date().toISOString()
                })

            if (insertError) console.error('  Failed to create profile:', insertError)
            else console.log('  ✅ Profile created with ADMIN role.')
        } else {
            console.log(`  Current Role: ${profile.role}`)

            if (profile.role !== 'admin') {
                console.log('  ⚠️ Role is not admin. Updating to ADMIN...')
                const { error: updateError } = await supabase
                    .from('profiles')
                    .update({ role: 'admin' })
                    .eq('id', user.id)

                if (updateError) console.error('  Failed to update role:', updateError)
                else console.log('  ✅ Role updated to ADMIN.')
            } else {
                console.log('  ✅ Already an ADMIN.')
            }
        }
    }
}

fixAdminRole()
