import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Cursor from "@/components/Cursor";
import Navbar from "@/components/Navbar";
import SmoothScrolling from "@/components/SmoothScrolling";
import ScrollProgress from "@/components/ScrollProgress";
import BackToTop from "@/components/BackToTop";
import { LanguageProvider } from "@/context/LanguageContext";
import { ThemeProvider } from "@/context/ThemeContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
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

// Corre antes del primer paint: sin esto, quien eligio tema oscuro ve un
// destello del tema claro mientras React hidrata.
const themeScript = `
(function() {
  try {
    var t = localStorage.getItem('theme');
    if (t === 'dark' || t === 'light') {
      document.documentElement.setAttribute('data-theme', t);
    }
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${inter.variable} ${playfair.variable}`}>
        <ThemeProvider>
          <LanguageProvider>
            <SmoothScrolling>
              <ScrollProgress />
              <Navbar />
              <Cursor />
              <main>{children}</main>
              <BackToTop />
            </SmoothScrolling>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
