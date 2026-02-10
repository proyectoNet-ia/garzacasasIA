import { createClient } from './src/lib/supabase-server'

async function debug() {
    const supabase = await createClient()

    console.log('--- Checking Properties Table Schema ---')
    const { data: cols, error: colError } = await supabase
        .from('properties')
        .select('*')
        .limit(1)

    if (colError) {
        console.error('Error fetching one property:', colError)
    } else {
        console.log('Sample property keys:', Object.keys(cols[0] || {}))
    }

    console.log('\n--- Checking subscriptions_config ---')
    const { data: plans, error: planError } = await supabase
        .from('subscriptions_config')
        .select('*')

    if (planError) {
        console.error('Error fetching plans:', planError)
    } else {
        console.log('Plans found:', plans.length)
        plans.forEach(p => console.log(`- ${p.name}`))
    }
}

debug()
