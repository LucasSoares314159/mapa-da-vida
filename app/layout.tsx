import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: "MindTrail — Construa seu sistema de organização pessoal",
    template: "%s · MindTrail",
  },
  description: "Responda 9 perguntas honestas e descubra o que está sustentando — e o que está consumindo — a sua energia. Diagnóstico gratuito, resultado imediato.",
  metadataBase: new URL("https://mindtrail.com.br"),
  openGraph: {
    title: "MindTrail — Construa seu sistema de organização pessoal",
    description: "Responda 9 perguntas honestas e descubra o que está sustentando — e o que está consumindo — a sua energia.",
    url: "https://mindtrail.com.br",
    siteName: "MindTrail",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MindTrail — Construa seu sistema de organização pessoal",
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
      </body>
    </html>
  )
}
