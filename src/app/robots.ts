import { MetadataRoute } from 'next'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://garzacasas.com'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: [
                    '/',
                    '/propiedades',
                    '/propiedades/',
                    '/agentes',
                    '/agentes/',
                    '/planes',
                    '/servicios',
                    '/contacto',
                ],
                disallow: [
                    '/dashboard/',
                    '/admin/',
                    '/api/',
                    '/login',
                    '/registro',
                    '/forgot-password',
                    '/reset-password',
                    '/verifica-correo',
                    '/test-connection',
                    '/comparar',
                ],
            },
            {
                // Block AI training crawlers
                userAgent: ['GPTBot', 'CCBot', 'anthropic-ai', 'Claude-Web'],
                disallow: ['/'],
            },
        ],
        sitemap: `${siteUrl}/sitemap.xml`,
        host: siteUrl,
    }
}
