import { SiteSettingsForm } from '@/components/dashboard/SiteSettingsForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Configuración del Sitio | Garza Casas IA',
    description: 'Administra la configuración general y de contacto.',
}

export default function SettingsPage() {
    return (
        <div className="space-y-6 p-8">
            <div className="flex items-center justify-between pb-6 border-b border-zinc-200">
                <div>
                    <h2 className="text-3xl font-black tracking-tighter text-zinc-900">Configuración del Sitio</h2>
                    <p className="text-zinc-500 font-medium">
                        Administra la información visible en el encabezado y pie de página.
                    </p>
                </div>
            </div>
            <div className="mx-auto w-full max-w-4xl pt-6">
                <SiteSettingsForm />
            </div>
        </div>
    )
}
