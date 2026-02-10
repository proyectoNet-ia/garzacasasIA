import { Agents } from "@/components/marketing/Agents"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { getSiteSettings } from "@/lib/settings"

export const dynamic = 'force-dynamic'

export default async function AgentsPage() {
    const contactConfig = await getSiteSettings('contact_config')

    return (
        <div className="min-h-screen bg-zinc-50">
            <Navbar contactConfig={contactConfig} />
            <main className="pt-20">
                <div className="bg-zinc-100 py-20 px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-black text-zinc-700 mb-4">Nuestros Agentes</h1>
                    <p className="text-zinc-500 max-w-2xl mx-auto">Conoce al equipo de expertos detrás de cada transacción exitosa.</p>
                </div>
                <Agents />
            </main>
            <Footer />
        </div>
    )
}
