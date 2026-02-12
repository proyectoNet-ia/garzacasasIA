import { FeaturedProperties } from "@/components/marketing/FeaturedProperties"
import { PropertiesFilterSidebar } from "@/components/marketing/PropertiesFilterSidebar"
import { SecondaryNavbar } from "@/components/layout/SecondaryNavbar"
import { Footer } from "@/components/layout/Footer"
import { getSiteSettings } from "@/lib/settings"

export const dynamic = 'force-dynamic'

export default async function PropertiesPage() {
    const contactConfig = await getSiteSettings('contact_config') || {
        phone: "+52 (81) 1234-5678",
        email: "contacto@garzacasas.com",
        instagram: "https://instagram.com",
        facebook: "https://facebook.com",
        whatsapp: "https://wa.me/528112345678"
    }

    return (
        <div className="min-h-screen bg-zinc-50">
            <SecondaryNavbar contactConfig={contactConfig} />
            <main className="pt-32">
                <div className="bg-zinc-100 py-12 px-4 text-center border-b border-zinc-200">
                    <h1 className="text-3xl md:text-5xl font-black text-zinc-900 mb-2 tracking-tight">Nuestras Propiedades</h1>
                    <p className="text-zinc-500 max-w-2xl mx-auto font-medium">Encuentra el hogar de tus sueños con nuestros filtros inteligentes.</p>
                </div>

                <div className="container mx-auto px-4 md:px-6 py-8 grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8 items-start">
                    <PropertiesFilterSidebar />
                    <div className="w-full min-w-0 min-h-[500px]">
                        <FeaturedProperties sidebarLayout={true} />
                    </div>
                </div>
            </main>
            <Footer contactConfig={contactConfig} />
        </div>
    )
}
