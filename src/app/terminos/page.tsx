import type { Metadata } from "next"
import { SecondaryNavbar } from "@/components/layout/SecondaryNavbar"
import { Footer } from "@/components/layout/Footer"
import { getSiteSettings } from "@/lib/settings"

export const metadata: Metadata = {
    title: "Términos de Servicio",
    description: "Términos y Condiciones de Uso de la plataforma inmobiliaria Garza Casas.",
}

export const dynamic = "force-dynamic"

export default async function TerminosPage() {
    const contactConfig = await getSiteSettings("contact_config")
    const contactEmail = contactConfig?.email || "contacto@garzacasas.com"

    return (
        <div className="min-h-screen bg-zinc-50 text-zinc-800">
            <SecondaryNavbar contactConfig={contactConfig} />

            <main className="pt-32 pb-24">
                <div className="bg-zinc-100 py-16 px-4 text-center border-b border-zinc-200">
                    <h1 className="text-4xl md:text-5xl font-black text-zinc-900 mb-3 tracking-tight">
                        Términos de Servicio
                    </h1>
                    <p className="text-zinc-500 max-w-2xl mx-auto text-sm font-medium">
                        Condiciones generales de acceso, publicación inmobiliaria y planes de suscripción en Garza Casas.
                    </p>
                </div>

                <div className="container mx-auto px-4 md:px-6 max-w-4xl mt-12">
                    <div className="bg-white rounded-[2.5rem] border border-zinc-200 p-8 md:p-14 shadow-sm space-y-8 leading-relaxed text-sm md:text-base text-zinc-600">
                        <section className="space-y-3">
                            <h2 className="text-xl font-black text-zinc-900">1. Objeto de la Plataforma</h2>
                            <p>
                                <strong>Garza Casas</strong> opera como plataforma tecnológica de difusión inmobiliaria y análisis informativo asistido por inteligencia artificial y fuentes públicas oficiales (INEGI / DENUE). Garza Casas no actúa como propietario ni fedatario de las operaciones celebradas entre particulares y agentes independientes.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-xl font-black text-zinc-900">2. Obligaciones de los Agentes Anunciantes</h2>
                            <p>
                                El agente registrado declara contar con facultades legales y autorización vigente para promocionar cada inmueble publicado, obligándose a mantener información veraz, fotografías auténticas y precios actualizados. Queda prohibido publicar contenido fraudulento, duplicado o que infrinja derechos de terceros.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-xl font-black text-zinc-900">3. Suscripciones, Límites y Pagos vía PayPal</h2>
                            <p>
                                Los planes de membresía (<em>Gratis, Pro y Platino / Enterprise</em>) otorgan límites específicos de propiedades activas, imágenes por anuncio y herramientas de inteligencia de mercado. Los cobros de planes de pago se procesan en pesos mexicanos (MXN) a través de <strong>PayPal</strong> por el periodo seleccionado (mensual o anual). Al concluir la vigencia sin renovación, la cuenta se ajusta automáticamente al nivel <em>Gratis</em> conservando el acceso al panel.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-xl font-black text-zinc-900">4. Naturaleza Referencial de Datos INEGI e IA</h2>
                            <p>
                                Los indicadores de plusvalía, servicios cercanos y análisis generados mediante inteligencia artificial constituyen estimaciones estadísticas de apoyo comercial y no sustituyen un avalúo comercial certificado ni asesoría jurídica o fiscal.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-xl font-black text-zinc-900">5. Jurisdicción y Contacto</h2>
                            <p>
                                Estos términos se rigen por las leyes aplicables en los Estados Unidos Mexicanos. Para soporte comercial o aclaraciones sobre facturación y servicio, escríbenos a{" "}
                                <a href={`mailto:${contactEmail}`} className="text-blue-600 font-bold hover:underline">
                                    {contactEmail}
                                </a>.
                            </p>
                        </section>
                    </div>
                </div>
            </main>

            <Footer contactConfig={contactConfig} />
        </div>
    )
}
