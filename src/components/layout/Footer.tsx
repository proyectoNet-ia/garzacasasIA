import Link from "next/link"
import { Phone, Mail } from "lucide-react"
import { IconInstagram, IconFacebook, IconWhatsApp, IconLinkedIn } from "@/components/ui/SocialIcons"
import { BrandLogo } from "@/components/brand/BrandLogo"
import { DEFAULT_CONTACT_CONFIG } from "@/lib/settings"

interface FooterProps {
    contactConfig?: {
        phone?: string;
        email?: string;
        instagram?: string;
        facebook?: string;
        whatsapp?: string;
        linkedin?: string;
    } | null;
}

export function Footer({ contactConfig }: FooterProps) {
    const config = {
        phone: contactConfig?.phone || DEFAULT_CONTACT_CONFIG.phone,
        email: contactConfig?.email || DEFAULT_CONTACT_CONFIG.email,
        whatsapp: contactConfig?.whatsapp || DEFAULT_CONTACT_CONFIG.whatsapp,
        instagram: contactConfig?.instagram || DEFAULT_CONTACT_CONFIG.instagram,
        facebook: contactConfig?.facebook || DEFAULT_CONTACT_CONFIG.facebook,
        linkedin: contactConfig?.linkedin || DEFAULT_CONTACT_CONFIG.linkedin,
    }

    return (
        <footer className="border-t border-zinc-200 bg-white text-zinc-600">
            <div className="container px-4 md:px-6 mx-auto py-12 md:py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-12">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-1 space-y-4">
                        <BrandLogo
                            initialSurface="light"
                            imgClassName="h-11 max-w-[220px]"
                            fallback={
                                <>
                                <div className="text-xl font-black text-zinc-900 px-4 py-1.5 border border-zinc-200 rounded-xl bg-zinc-50 inline-block">
                                    Garza <span className="text-blue-600">Casas</span>
                                </div>
                                </>
                            }
                        />
                        <p className="text-sm text-zinc-500 leading-relaxed">
                            Revolucionando el mercado inmobiliario con tecnología de punta y un servicio de primera clase en todo México.
                        </p>
                    </div>

                    {/* Contact Info */}
                    <div className="col-span-1 md:col-span-2 space-y-4">
                        <h4 className="font-bold text-zinc-900">Contacto</h4>
                        <div className="space-y-3 text-sm">
                            {config.phone && (
                                <a href={`tel:${config.phone.replace(/\s+/g, '')}`} className="flex items-center gap-2 hover:text-blue-600 transition-colors">
                                    <Phone className="h-4 w-4 text-zinc-400" />
                                    {config.phone}
                                </a>
                            )}
                            {config.email && (
                                <a href={`mailto:${config.email}`} className="flex items-center gap-2 hover:text-blue-600 transition-colors">
                                    <Mail className="h-4 w-4 text-zinc-400" />
                                    {config.email}
                                </a>
                            )}
                            <div className="flex gap-3 pt-2">
                                {config.instagram && (
                                    <a href={config.instagram} target="_blank" rel="noreferrer"
                                        className="bg-zinc-100 p-2.5 rounded-xl hover:bg-pink-50 hover:text-pink-600 transition-all text-zinc-500"
                                        aria-label="Instagram">
                                        <IconInstagram className="h-5 w-5" />
                                    </a>
                                )}
                                {config.facebook && (
                                    <a href={config.facebook} target="_blank" rel="noreferrer"
                                        className="bg-zinc-100 p-2.5 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all text-zinc-500"
                                        aria-label="Facebook">
                                        <IconFacebook className="h-5 w-5" />
                                    </a>
                                )}
                                {config.linkedin && (
                                    <a href={config.linkedin} target="_blank" rel="noreferrer"
                                        className="bg-zinc-100 p-2.5 rounded-xl hover:bg-blue-50 hover:text-blue-700 transition-all text-zinc-500"
                                        aria-label="LinkedIn">
                                        <IconLinkedIn className="h-5 w-5" />
                                    </a>
                                )}
                                {config.whatsapp && (
                                    <a href={config.whatsapp.startsWith('http') ? config.whatsapp : `https://wa.me/${config.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer"
                                        className="bg-zinc-100 p-2.5 rounded-xl hover:bg-green-50 hover:text-green-600 transition-all text-zinc-500"
                                        aria-label="WhatsApp">
                                        <IconWhatsApp className="h-5 w-5" />
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Legal Links */}
                    <div className="space-y-4">
                        <h4 className="font-bold text-zinc-900">Legal</h4>
                        <div className="flex flex-col gap-2 text-sm">
                            <Link href="/privacidad" className="hover:text-blue-600 transition-colors">Aviso de Privacidad</Link>
                            <Link href="/terminos" className="hover:text-blue-600 transition-colors">Términos de Servicio</Link>
                        </div>
                    </div>
                </div>

                <div className="border-t border-zinc-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-zinc-400">
                    <p>© {new Date().getFullYear()} Garza Casas. Todos los derechos reservados.</p>
                </div>
            </div>
        </footer>
    )
}
