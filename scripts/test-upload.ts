
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

async function checkStorage() {
    console.log('Checking Supabase Storage...')

    // 1. List Buckets
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets()

    if (bucketError) {
        console.error('Error listing buckets:', bucketError)
        return
    }

    const marketing = buckets.find(b => b.name === 'marketing')

    if (!marketing) {
        console.error('❌ Bucket "marketing" does NOT exist.')
        return
    }

    console.log('✅ Bucket "marketing" found.')

    // 2. Try Upload
    const fileName = `test-upload-${Date.now()}.txt`
    console.log(`Attempting to upload file: ${fileName}...`)

    const { data, error } = await supabase.storage
        .from('marketing')
        .upload(fileName, 'Hello World', { upsert: true })

    if (error) {
        console.error('❌ Upload Failed:', error)
        console.log('Ensure you have a Policy allowing INSERT for Anon/Authenticated users.')
    } else {
        console.log('✅ Upload Successful!', data)
    }
}

checkStorage()
