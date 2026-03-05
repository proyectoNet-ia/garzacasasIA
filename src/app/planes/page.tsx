import { Pricing } from "@/components/marketing/Pricing"
import { SecondaryNavbar } from "@/components/layout/SecondaryNavbar"
import { Footer } from "@/components/layout/Footer"
import { getSiteSettings } from "@/lib/settings"
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
    title: 'Planes para Agentes Inmobiliarios',
    description: 'Elige el plan ideal para potenciar tu carrera como agente inmobiliario. Gratis, Pro y Platino con herramientas IA, datos INEGI y más propiedades publicadas.',
    openGraph: {
        title: 'Planes y Precios para Agentes | Garza Casas IA',
        description: 'Potencia tu carrera inmobiliaria con IA y datos INEGI desde cualquier plan.',
    },
}

export default async function PlansPage() {
    const contactConfig = await getSiteSettings('contact_config')

    return (
        <div className="min-h-screen bg-zinc-50">
            <SecondaryNavbar contactConfig={contactConfig} />
            <main className="pt-32">
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
