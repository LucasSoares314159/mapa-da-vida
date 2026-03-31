import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: "Mapa da Vida — Diagnóstico gratuito das áreas da sua vida",
    template: "%s · Mapa da Vida",
  },
  description: "Responda 9 perguntas honestas e descubra o que está sustentando — e o que está consumindo — a sua energia. Diagnóstico gratuito, resultado imediato.",
  metadataBase: new URL("https://mapadavida.com"),
  openGraph: {
    title: "Mapa da Vida — Diagnóstico gratuito das áreas da sua vida",
    description: "Responda 9 perguntas honestas e descubra o que está sustentando — e o que está consumindo — a sua energia.",
    url: "https://mapadavida.com",
    siteName: "Mapa da Vida",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mapa da Vida — Diagnóstico gratuito das áreas da sua vida",
    description: "Responda 9 perguntas honestas e descubra o que está sustentando — e o que está consumindo — a sua energia.",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
