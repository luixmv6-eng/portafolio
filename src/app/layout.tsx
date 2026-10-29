import type { Metadata } from "next";
import { Archivo, Instrument_Serif, IBM_Plex_Mono, Unbounded } from "next/font/google";
import "./globals.css";
import Cursor from "@/components/Cursor";
import Navbar from "@/components/Navbar";
import SmoothScrolling from "@/components/SmoothScrolling";
import ScrollProgress from "@/components/ScrollProgress";
import BackToTop from "@/components/BackToTop";
import { LanguageProvider } from "@/context/LanguageContext";

// Titulares. Variable con eje de ancho: el diseno usa wdth 100.
const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

// Acentos en cursiva ("digital", "visión"...) y la bio en redonda.
const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument",
  display: "swap",
});

// Etiquetas tecnicas.
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

// Cifras de los contadores.
const unbounded = Unbounded({
  subsets: ["latin"],
  variable: "--font-unbounded",
  display: "swap",
});

const description =
  "Pedro Luis Martinez, Ingeniero Multimedia. Diseno y construyo plataformas web, PWAs y piezas 3D con foco en rendimiento y detalle visual.";

// La tarjeta OG necesita una URL absoluta. Se resuelve del entorno en vez de
// fijar un dominio: en Vercel VERCEL_PROJECT_PRODUCTION_URL ya viene puesta, y
// NEXT_PUBLIC_SITE_URL permite forzar un dominio propio.
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : undefined);

export const metadata: Metadata = {
  ...(siteUrl ? { metadataBase: new URL(siteUrl) } : {}),
  title: "Pedro Luis Martinez | Ingeniero Multimedia & Desarrollador Web",
  description,
  openGraph: {
    title: "Pedro Luis Martinez | Ingeniero Multimedia & Desarrollador Web",
    description,
    siteName: "Pedro Luis Martinez",
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pedro Luis Martinez | Ingeniero Multimedia & Desarrollador Web",
    description,
    creator: "@LuixMv",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Las variables de fuente van en <html>: los tokens de :root las leen.
    <html
      lang="es"
      suppressHydrationWarning
      className={`${archivo.variable} ${instrumentSerif.variable} ${plexMono.variable} ${unbounded.variable}`}
    >
      <body>
        <LanguageProvider>
          <SmoothScrolling>
            <ScrollProgress />
            <Navbar />
            <Cursor />
            <main>{children}</main>
            <BackToTop />
          </SmoothScrolling>
        </LanguageProvider>
      </body>
    </html>
  );
}
