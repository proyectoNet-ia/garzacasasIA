import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://garzacasas.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Fetch all active properties
    const { data: properties } = await supabase
        .from('properties')
        .select('id, updated_at')
        .eq('status', 'active')
        .order('updated_at', { ascending: false })

    // Fetch public agent profiles
    const { data: agents } = await supabase
        .from('profiles')
        .select('id, updated_at')
        .in('role', ['agent', 'super_agent', 'admin'])

    const propertyUrls: MetadataRoute.Sitemap = (properties || []).map((p) => ({
        url: `${siteUrl}/propiedades/${p.id}`,
        lastModified: new Date(p.updated_at),
        changeFrequency: 'weekly',
        priority: 0.8,
    }))

    const agentUrls: MetadataRoute.Sitemap = (agents || []).map((a) => ({
        url: `${siteUrl}/agentes/${a.id}`,
        lastModified: new Date(a.updated_at),
        changeFrequency: 'monthly',
        priority: 0.6,
    }))

    const staticUrls: MetadataRoute.Sitemap = [
        {
            url: siteUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1.0,
        },
        {
            url: `${siteUrl}/propiedades`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${siteUrl}/agentes`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
        },
        {
            url: `${siteUrl}/planes`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.6,
        },
        {
            url: `${siteUrl}/servicios`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: `${siteUrl}/contacto`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
    ]

    return [...staticUrls, ...propertyUrls, ...agentUrls]
}
