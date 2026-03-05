import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { InteractionsProvider } from "@/providers/InteractionsProvider";
import { SearchProvider } from "@/providers/SearchProvider";
import { ComparisonTray } from "@/components/marketing/ComparisonTray";
import { DynamicFavicon } from "@/components/DynamicFavicon";
import { Toaster } from "sonner";
import { ScrollToTop } from "@/components/layout/ScrollToTop";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://garzacasas.com'

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Garza Casas IA | Bienes Raíces Premium en México',
    template: '%s | Garza Casas IA',
  },
  description: 'Plataforma inmobiliaria inteligente con análisis predictivo basado en datos INEGI. Encuentra casas, departamentos y terrenos en México con tecnología IA.',
  keywords: ['bienes raices mexico', 'casas en venta', 'departamentos en renta', 'inmuebles mexico', 'garza casas', 'inteligencia artificial inmobiliaria', 'propiedades INEGI'],
  authors: [{ name: 'Garza Casas IA', url: siteUrl }],
  creator: 'Garza Casas IA',
  publisher: 'Garza Casas IA',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  openGraph: {
    type: 'website',
    locale: 'es_MX',
    url: siteUrl,
    siteName: 'Garza Casas IA',
    title: 'Garza Casas IA | Bienes Raíces Premium en México',
    description: 'Plataforma inmobiliaria inteligente con análisis predictivo basado en datos INEGI.',
    images: [{
      url: `/og-default.png`,
      width: 1200,
      height: 630,
      alt: 'Garza Casas IA — Bienes Raíces Premium',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Garza Casas IA | Bienes Raíces Premium',
    description: 'Plataforma inmobiliaria con IA. Datos INEGI. Propiedades en México.',
    images: [`/og-default.png`],
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${montserrat.variable} font-montserrat antialiased bg-white text-zinc-950 transition-colors duration-300`}>
        <DynamicFavicon />
        <ScrollToTop />
        <InteractionsProvider>
          <SearchProvider>
            {children}
            <ComparisonTray />
            <Toaster position="top-right" richColors />
          </SearchProvider>
        </InteractionsProvider>
      </body>

    </html>
  );
}
