import type { Metadata, Viewport } from "next";
import { Cinzel, Lato } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const lato = Lato({
  subsets: ["latin"],
  weight: ["100", "300", "400", "700", "900"],
  variable: "--font-sans",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafaf9" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0a09" },
  ],
};

export const metadata: Metadata = {
  title: {
    default: "Varmina Joyas — Joyería de Tendencia",
    template: "%s | Varmina Joyas",
  },
  description: "Descubre piezas únicas de joyería de tendencia. Collares, anillos, aros y pulseras con estilo y calidad. Envíos a todo Chile.",
  keywords: ["joyería de tendencia", "joyas", "collares", "anillos", "aros", "pulseras", "joyería chilena", "Varmina"],
  authors: [{ name: "Varmina Joyas" }],
  creator: "Varmina Joyas",
  metadataBase: new URL("https://varmina.cl"),
  openGraph: {
    type: "website",
    title: "Varmina Joyas — Joyería de Tendencia",
    description: "Descubre piezas únicas de joyería de tendencia. Envíos a todo Chile.",
    siteName: "Varmina Joyas",
    locale: "es_CL",
  },
  twitter: {
    card: "summary_large_image",
    title: "Varmina Joyas — Joyería de Tendencia",
    description: "Joyería de tendencia hecha en Chile.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/file.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${lato.variable} ${cinzel.variable} antialiased bg-stone-50 text-stone-900 dark:bg-stone-950 dark:text-stone-50`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
