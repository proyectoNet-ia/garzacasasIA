
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase URL or Anon Key')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function debugConnection() {
    console.log('--- Debugging Supabase Connection ---')
    console.log(`URL: ${supabaseUrl}`)
    console.log(`Key: ${supabaseAnonKey.substring(0, 10)}... (truncated)`)

    console.log('\n--- Listing Buckets ---')
    const { data: buckets, error } = await supabase.storage.listBuckets()

    if (error) {
        console.error('Error listing buckets:', error.message)
    } else if (!buckets || buckets.length === 0) {
        console.log('No buckets visible to this user/role.')
    } else {
        buckets.forEach(b => {
            console.log(`- "${b.name}" (public: ${b.public})`)
        })
    }

    console.log('\n--- Attempting Upload to "marketing" ---')
    const { data: uploadData, error: uploadError } = await supabase.storage
        .from('marketing')
        .upload(`debug-${Date.now()}.txt`, 'Debug content', { upsert: true })

    if (uploadError) {
        const err = uploadError as any
        console.error('❌ Upload failed:', err.message)
        console.error('Details:', err)

        if (err.message && (err.message.includes('row-level security') || err.message.includes('violates row-level security policy'))) {
            console.log('\n💡 Possible Cause: RLS Policy prevents upload. Check policies on "storage.objects".')
        } else if (err.statusCode === '404' || err.error === 'Bucket not found') {
            console.log('\n💡 Possible Cause: The bucket "marketing" does not exist in THIS project.')
        } else if (err.statusCode === '403') {
            console.log('\n💡 Possible Cause: Permission denied (403). Check RLS policies.')
        }
    } else {
        console.log('✅ Upload successful!', uploadData)
        console.log('The bucket exists and accepts uploads.')
    }
}

debugConnection()
