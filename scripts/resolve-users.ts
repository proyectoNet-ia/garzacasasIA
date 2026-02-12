
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

async function checkSpecificUsers() {
    console.log('--- Checking Specific Users ---')

    // IDs found in previous step
    const userIds = [
        '381e172c-1f0c-47b9-b2f0-b7f42b5eab9e',
        '1f3e9d52-3065-41c2-a330-5a2a9bfd29bb'
    ]

    for (const uid of userIds) {
        const { data: { user }, error } = await supabase.auth.admin.getUserById(uid)

        if (error) {
            console.error(`Error getting user ${uid}:`, error.message)
        } else if (user) {
            console.log(`Found User: ${user.email} (ID: ${user.id})`)

            // Double check profile role
            const { data: profile } = await supabase.from('profiles').select('role').eq('id', uid).single()
            console.log(`  -> Profile Role: ${profile?.role}`)
        } else {
            console.log(`User ${uid} not found in Auth.`)
        }
    }
}

checkSpecificUsers()
