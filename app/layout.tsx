import type { Metadata } from 'next'
import Script from 'next/script'
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
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID

  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        {children}
        {pixelId && (
          <>
            <Script id="meta-pixel" strategy="afterInteractive">
              {`
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${pixelId}');
                fbq('track', 'PageView');
              `}
            </Script>
            <noscript>
              <img
                height="1"
                width="1"
                style={{ display: 'none' }}
                src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
                alt=""
              />
            </noscript>
          </>
        )}
      </body>
    </html>
  )
}
