import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { Hero } from "@/components/marketing/Hero"
import { FeaturedProperties } from "@/components/marketing/FeaturedProperties"
import { BentoFeatures } from "@/components/marketing/BentoFeatures"
import { Agents } from "@/components/marketing/Agents"
import { Services } from "@/components/marketing/Services"
import { Advantages } from "@/components/marketing/Advantages"
import { Pricing } from "@/components/marketing/Pricing"
import { Contact } from "@/components/marketing/Contact"
import { CTA } from "@/components/marketing/CTA"
import { getSiteSettings } from "@/lib/settings"

export const dynamic = 'force-dynamic'

export default async function Home() {
  const heroConfig = await getSiteSettings('hero_config')
  const contactConfig = await getSiteSettings('contact_config')

  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-blue-500/30 selection:text-blue-200 font-sans">
      <Navbar contactConfig={contactConfig} />

      <main>
        <Hero config={heroConfig} />


        {/* Real Data Properties Section */}
        <FeaturedProperties limit={6} randomize={true} />

        {/* Bento Grid Features Section */}
        <BentoFeatures />

        {/* Call to Action Section */}
        <CTA />

        {/* Decorative Quote / Impact Section */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <div className="container mx-auto px-4 text-center md:px-6">
            <div className="max-w-3xl mx-auto space-y-6">
              <h2 className="text-4xl font-black italic tracking-tighter sm:text-5xl opacity-80 font-heading">
                "La IA no reemplaza al agente, lo hace extraordinario."
              </h2>
              <div className="h-1 w-20 bg-blue-600 mx-auto rounded-full" />
              <p className="text-zinc-500 font-medium">Liderando el cambio en el mercado inmobiliario de Nuevo León.</p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
