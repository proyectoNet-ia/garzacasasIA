
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const envPath = resolve('.env.local')
const envContent = readFileSync(envPath, 'utf-8')
const env = {}
for (const line of envContent.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const [key, ...rest] = trimmed.split('=')
    env[key.trim()] = rest.join('=').trim()
}

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL']
const supabaseKey = env['NEXT_PUBLIC_SUPABASE_ANON_KEY']

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Faltan credenciales de Supabase en .env.local')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
    console.log('🔌 Probando conexión con Supabase...')
    const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true })
    
    if (error) {
        console.error('❌ Error de conexión:', error.message)
    } else {
        console.log('✅ Conexión exitosa con Supabase.')
    }
}

testConnection()
