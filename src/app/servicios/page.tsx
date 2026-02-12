import { Services } from "@/components/marketing/Services"
import { SecondaryNavbar } from "@/components/layout/SecondaryNavbar"
import { Footer } from "@/components/layout/Footer"
import { getSiteSettings } from "@/lib/settings"

export const dynamic = 'force-dynamic'

export default async function ServicesPage() {
    const contactConfig = await getSiteSettings('contact_config')

    return (
        <div className="min-h-screen bg-zinc-50">
            <SecondaryNavbar contactConfig={contactConfig} />
            <main className="pt-32">
                <div className="bg-zinc-100 py-20 px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-black text-zinc-700 mb-4">Servicios Inteligentes</h1>
                    <p className="text-zinc-500 max-w-2xl mx-auto">Tecnología y experiencia humana para potenciar tu inversión.</p>
                </div>
                <Services />
            </main>
            <Footer />
        </div>
    )
}
