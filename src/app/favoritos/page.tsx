import { SecondaryNavbar } from "@/components/layout/SecondaryNavbar"
import { Footer } from "@/components/layout/Footer"
import { getSiteSettings } from "@/lib/settings"
import FavoritosClient from "./FavoritosClient"
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
    title: 'Mis Favoritos',
    description: 'Gestiona tus propiedades favoritas guardadas en Garza Casas IA.',
}

export default async function FavoritosPage() {
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
                <FavoritosClient />
            </main>
            <Footer contactConfig={contactConfig} />
        </div>
    )
}
