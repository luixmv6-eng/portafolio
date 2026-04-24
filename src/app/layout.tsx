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
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "Pedro | Creative Developer & Designer",
  description:
    "A premium personal portfolio with a warm minimalist aesthetic and refined interactivity, showcasing high-end digital design and development projects.",
  openGraph: {
    title: "Pedro | Creative Developer",
    description: "Digital experiences that blend aesthetics with robust engineering.",
    url: "https://tu-nombre.vercel.app",
    siteName: "Pedro's Portfolio",
    images: [
      {
        url: "https://fastly.picsum.photos/id/473/1200/630.jpg?hmac=320jOhZlOQY23C2Lh-YtFfL_lFzjA117m1f9z5j74jA",
        width: 1200,
        height: 630,
      },
    ],
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pedro | Creative Developer",
    description: "Digital experiences that blend aesthetics with robust engineering.",
    creator: "@tuusuario",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
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
