import { Contact } from "@/components/marketing/Contact"
import { SecondaryNavbar } from "@/components/layout/SecondaryNavbar"
import { Footer } from "@/components/layout/Footer"
import { getSiteSettings } from "@/lib/settings"

export const dynamic = 'force-dynamic'

export default async function ContactPage() {
    const contactConfig = await getSiteSettings('contact_config')

    return (
        <div className="min-h-screen bg-zinc-50">
            <SecondaryNavbar contactConfig={contactConfig} />
            <main className="pt-32">
                <div className="bg-zinc-100 py-20 px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-black text-zinc-700 mb-4">Hablemos</h1>
                    <p className="text-zinc-500 max-w-2xl mx-auto">Estamos listos para ayudarte a encontrar tu propiedad ideal o vender la tuya.</p>
                </div>
                <Contact />
            </main>
            <Footer />
        </div>
    )
}
