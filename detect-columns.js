const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function detect() {
    console.log('Fetching properties...');
    const { data, error } = await supabase
        .from('properties')
        .select('*')
        .limit(50);

    if (error) {
        console.error('Error fetching properties:', error);
        return;
    }

    const types = new Set(data.map(p => p.type).filter(Boolean));
    const propertyTypes = new Set(data.map(p => p.property_type).filter(Boolean));
    const statuses = new Set(data.map(p => p.status).filter(Boolean));

    console.log('Unique "type" values:', Array.from(types));
    console.log('Unique "property_type" values:', Array.from(propertyTypes));
    console.log('Unique "status" values:', Array.from(statuses));

    // Check if "operation" or "listing" exists in any record's features
    const listingTypesInFeatures = new Set();
    data.forEach(p => {
        if (p.features) {
            if (p.features.listing_type) listingTypesInFeatures.add(p.features.listing_type);
            if (p.features.operation) listingTypesInFeatures.add(p.features.operation);
            if (p.features.operation_type) listingTypesInFeatures.add(p.features.operation_type);
        }
    });
    console.log('Listing types found in features:', Array.from(listingTypesInFeatures));
}

detect();
