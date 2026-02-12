import { Phone, Mail, Instagram, Facebook } from "lucide-react"

interface FooterProps {
    contactConfig?: {
        phone?: string;
        email?: string;
        instagram?: string;
        facebook?: string;
        whatsapp?: string;
    } | null;
}

export function Footer({ contactConfig }: FooterProps) {
    return (
        <footer className="border-t border-zinc-200 bg-white text-zinc-600">
            <div className="container px-4 md:px-6 mx-auto py-12 md:py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-12">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-1 space-y-4">
                        <div className="text-xl font-black text-zinc-900 px-4 py-1.5 border border-zinc-200 rounded-xl bg-zinc-50 inline-block">
                            Garza Casas <span className="text-blue-600">IA</span>
                        </div>
                        <p className="text-sm text-zinc-500 leading-relaxed">
                            Revolucionando el mercado inmobiliario con inteligencia artificial y un servicio de primera clase.
                        </p>
                    </div>

                    {/* Contact Info */}
                    <div className="col-span-1 md:col-span-2 space-y-4">
                        <h4 className="font-bold text-zinc-900">Contacto</h4>
                        <div className="space-y-3 text-sm">
                            {contactConfig?.phone && (
                                <a href={`tel:${contactConfig.phone}`} className="flex items-center gap-2 hover:text-blue-600 transition-colors">
                                    <Phone className="h-4 w-4 text-zinc-400" />
                                    {contactConfig.phone}
                                </a>
                            )}
                            {contactConfig?.email && (
                                <a href={`mailto:${contactConfig.email}`} className="flex items-center gap-2 hover:text-blue-600 transition-colors">
                                    <Mail className="h-4 w-4 text-zinc-400" />
                                    {contactConfig.email}
                                </a>
                            )}
                            <div className="flex gap-4 pt-2">
                                {contactConfig?.instagram && (
                                    <a href={contactConfig.instagram} target="_blank" rel="noreferrer" className="bg-zinc-100 p-2 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors">
                                        <Instagram className="h-5 w-5" />
                                    </a>
                                )}
                                {contactConfig?.facebook && (
                                    <a href={contactConfig.facebook} target="_blank" rel="noreferrer" className="bg-zinc-100 p-2 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors">
                                        <Facebook className="h-5 w-5" />
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Legal Links */}
                    <div className="space-y-4">
                        <h4 className="font-bold text-zinc-900">Legal</h4>
                        <div className="flex flex-col gap-2 text-sm">
                            <a href="#" className="hover:text-blue-600 transition-colors">Política de Privacidad</a>
                            <a href="#" className="hover:text-blue-600 transition-colors">Términos de Servicio</a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-zinc-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-zinc-400">
                    <p>© {new Date().getFullYear()} Garza Casas IA. Todos los derechos reservados.</p>
                </div>
            </div>
        </footer>
    )
}
