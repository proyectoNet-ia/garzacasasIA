import type { Metadata } from "next"
import { SecondaryNavbar } from "@/components/layout/SecondaryNavbar"
import { Footer } from "@/components/layout/Footer"
import { getSiteSettings } from "@/lib/settings"

export const metadata: Metadata = {
    title: "Aviso de Privacidad",
    description: "Aviso de Privacidad Integral de Garza Casas IA conforme a la LFPDPPP en México.",
}

export const dynamic = "force-dynamic"

export default async function PrivacidadPage() {
    const contactConfig = await getSiteSettings("contact_config")
    const contactEmail = contactConfig?.email || "contacto@garzacasas.com"

    return (
        <div className="min-h-screen bg-zinc-50 text-zinc-800">
            <SecondaryNavbar contactConfig={contactConfig} />

            <main className="pt-32 pb-24">
                <div className="bg-zinc-100 py-16 px-4 text-center border-b border-zinc-200">
                    <h1 className="text-4xl md:text-5xl font-black text-zinc-900 mb-3 tracking-tight">
                        Aviso de Privacidad
                    </h1>
                    <p className="text-zinc-500 max-w-2xl mx-auto text-sm font-medium">
                        En cumplimiento con la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP).
                    </p>
                </div>

                <div className="container mx-auto px-4 md:px-6 max-w-4xl mt-12">
                    <div className="bg-white rounded-[2.5rem] border border-zinc-200 p-8 md:p-14 shadow-sm space-y-8 leading-relaxed text-sm md:text-base text-zinc-600">
                        <section className="space-y-3">
                            <h2 className="text-xl font-black text-zinc-900">1. Identidad del Responsable</h2>
                            <p>
                                <strong>Garza Casas IA</strong> (con operaciones en el Área Metropolitana de Monterrey, Nuevo León, México) es responsable del uso, tratamiento y protección de los datos personales recabados a través del portal <code>www.garzacasas.com</code>.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-xl font-black text-zinc-900">2. Datos Personales Recabados</h2>
                            <p>
                                Recabamos únicamente los datos necesarios para brindar intermediación tecnológica inmobiliaria: nombre completo, correo electrónico, teléfono o WhatsApp, datos profesionales de agentes registrados e información de inmuebles publicados. Los datos financieros de cobro de suscripciones son procesados directamente por <strong>PayPal</strong> bajo cifrado SSL; Garza Casas IA no almacena números completos de tarjetas bancarias ni códigos CVV.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-xl font-black text-zinc-900">3. Finalidades del Tratamiento</h2>
                            <ul className="list-disc pl-6 space-y-1.5">
                                <li>Gestionar cuentas de agentes inmobiliarios, planes de suscripción y publicación de propiedades.</li>
                                <li>Facilitar el contacto directo entre compradores/arrendatarios interesados y agentes anunciantes.</li>
                                <li>Generar análisis referenciales de zona integrando indicadores públicos del INEGI e inteligencia artificial.</li>
                                <li>Medir estadísticas internas de desempeño de anuncios únicamente cuando el usuario otorga consentimiento analítico.</li>
                            </ul>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-xl font-black text-zinc-900">4. Uso de Cookies y Tecnologías de Almacenamiento</h2>
                            <p>
                                Utilizamos cookies esenciales estrictamente necesarias para mantener la sesión autenticada (Supabase Auth) y almacenamiento local opcional para métricas de interacción en propiedades. Puedes elegir la modalidad <em>&quot;Solo esenciales&quot;</em> en nuestro banner de privacidad para desactivar el registro analítico.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-xl font-black text-zinc-900">5. Derechos ARCO y Contacto</h2>
                            <p>
                                Tienes derecho a Acceder, Rectificar, Cancelar u Oponerte (ARCO) al tratamiento de tus datos personales, así como a revocar tu consentimiento enviando una solicitud al correo electrónico:{" "}
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
