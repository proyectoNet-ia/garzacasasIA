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

        const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, bio, company_name, avatar_url')
            .eq('id', params.id)
            .single()

        if (!profile) {
            return {
                title: 'Agente no encontrado',
                robots: { index: false, follow: false },
            }
        }

        const name = profile.full_name || 'Consultor Inmobiliario'
        const company = profile.company_name ? ` — ${profile.company_name}` : ''
        const title = `${name}${company}`
        const description = profile.bio?.substring(0, 155) ||
            `Perfil del agente inmobiliario ${name} en Garza Casas IA. Consulta sus propiedades disponibles y contáctalo directamente.`

        const images = profile.avatar_url
            ? [{ url: profile.avatar_url, width: 400, height: 400, alt: name }]
            : [{ url: `/og-default.png`, width: 1200, height: 630, alt: 'Garza Casas IA' }]

        return {
            title,
            description,
            alternates: {
                canonical: `${siteUrl}/agentes/${params.id}`,
            },
            openGraph: {
                type: 'profile',
                locale: 'es_MX',
                url: `${siteUrl}/agentes/${params.id}`,
                title,
                description,
                siteName: 'Garza Casas IA',
                images,
            },
            twitter: {
                card: 'summary',
                title,
                description,
                images: [profile.avatar_url || `/og-default.png`],
            },
        }
    } catch {
        return { title: 'Agente | Garza Casas IA' }
    }
}

export default function AgentProfileLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}
