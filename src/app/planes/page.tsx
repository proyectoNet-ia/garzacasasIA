import { Pricing } from "@/components/marketing/Pricing"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { getSiteSettings } from "@/lib/settings"

export const dynamic = 'force-dynamic'

export default async function PlansPage() {
    const contactConfig = await getSiteSettings('contact_config')

    return (
        <div className="min-h-screen bg-zinc-50">
            <Navbar contactConfig={contactConfig} />
            <main className="pt-20">
                <div className="bg-zinc-100 py-20 px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-black text-zinc-700 mb-4">Planes para Agentes</h1>
                    <p className="text-zinc-500 max-w-2xl mx-auto">Potencia tu carrera inmobiliaria con nuestras herramientas premium.</p>
                </div>
                <Pricing />
            </main>
            <Footer />
        </div>
    )
}
