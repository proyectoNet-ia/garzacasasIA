import { SecondaryNavbar } from "@/components/layout/SecondaryNavbar"
import { Footer } from "@/components/layout/Footer"
import { getSiteSettings } from "@/lib/settings"
import CompararClient from "./CompararClient"
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
    title: 'Comparar Propiedades',
    description: 'Compara tus propiedades favoritas lado a lado para tomar la mejor decisión con Garza Casas IA.',
}

export default async function CompararPage() {
    const contactConfig = await getSiteSettings('contact_config') || {
        phone: "+52 (81) 1234-5678",
        email: "contacto@garzacasas.com",
        instagram: "https://instagram.com",
        facebook: "https://facebook.com",
        whatsapp: "https://wa.me/528112345678"
    }

    return (
        <div className="min-h-screen bg-white">
            <SecondaryNavbar contactConfig={contactConfig} />
            <main className="pt-32">
                <CompararClient />
            </main>
            <Footer contactConfig={contactConfig} />
        </div>
    )
}
