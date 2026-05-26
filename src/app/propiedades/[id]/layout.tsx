import type { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://garzacasas.com'

interface Props {
    params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        const { data: property } = await supabase
            .from('properties')
            .select('title, description, location, price, property_type, listing_type, main_image_url, features')
            .eq('id', params.id)
            .single()

        if (!property) {
            return {
                title: 'Propiedad no encontrada',
                robots: { index: false, follow: false },
            }
        }

        const features = property.features as any || {}
        const priceFormatted = property.price
            ? `$${Number(property.price).toLocaleString('es-MX')} MXN`
            : 'Precio a consultar'

        const title = property.title
        const description = property.description?.substring(0, 155) ||
            `${property.property_type} en ${property.listing_type} en ${property.location}. ${priceFormatted}. ${features.beds ? `${features.beds} hab.` : ''} ${features.baths ? `${features.baths} baños.` : ''} ${features.sqft ? `${features.sqft} m².` : ''}`

        const images = property.main_image_url
            ? [{ url: property.main_image_url, width: 1200, height: 630, alt: title }]
            : [{ url: `/og-default.png`, width: 1200, height: 630, alt: 'Garza Casas IA' }]

        return {
            title,
            description,
            alternates: {
                canonical: `${siteUrl}/propiedades/${params.id}`,
            },
            openGraph: {
                type: 'article',
                locale: 'es_MX',
                url: `${siteUrl}/propiedades/${params.id}`,
                title,
                description,
                siteName: 'Garza Casas IA',
                images,
            },
            twitter: {
                card: 'summary_large_image',
                title,
                description,
                images: [property.main_image_url || `/og-default.png`],
            },
        }
    } catch {
        return { title: 'Propiedad | Garza Casas IA' }
    }
}

export default function PropertyDetailLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}
