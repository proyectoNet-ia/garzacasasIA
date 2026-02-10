import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { InteractionsProvider } from "@/providers/InteractionsProvider";
import { SearchProvider } from "@/providers/SearchProvider";
import { ComparisonTray } from "@/components/marketing/ComparisonTray";
import { DynamicFavicon } from "@/components/DynamicFavicon";
import { Toaster } from "sonner";


const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Garza Casas IA | Bienes Raíces Premium",
  description: "Plataforma inmobiliaria inteligente con análisis predictivo.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${montserrat.variable} font-montserrat antialiased bg-zinc-950 text-white transition-colors duration-300`}>
        <DynamicFavicon />
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
