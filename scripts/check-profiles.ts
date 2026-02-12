
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase URL or Service Role Key')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkProfiles() {
    console.log('--- Checking Profiles Table directly ---')

    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')

    if (error) {
        console.error('Error fetching profiles:', error)
    } else {
        console.log(`Found ${profiles.length} profiles:`)
        profiles.forEach(p => {
            console.log(`- ID: ${p.id}, Email: ${p.email}, Role: ${p.role}`)
        })

        // Attempt to update all found profiles to 'admin'
        if (profiles.length > 0) {
            console.log('Updating all existing profiles to ADMIN role...')
            for (const p of profiles) {
                const { error: updateError } = await supabase
                    .from('profiles')
                    .update({ role: 'admin' })
                    .eq('id', p.id)

                if (updateError) console.error(`Failed to update ${p.email}:`, updateError)
                else console.log(`Updated ${p.email} to admin`)
            }
        } else {
            console.log('No profiles found. This is likely why RLS is failing.')
            console.log('The user strictly needs a profile row to be an admin.')
        }
    }
}

checkProfiles()
