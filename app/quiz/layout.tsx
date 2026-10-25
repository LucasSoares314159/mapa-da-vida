import type { Metadata } from 'next'
import Script from 'next/script'
import { MetaPixel } from '@/components/MetaPixel'

// Layout proprio do funil de quiz: sem Header, sem Sidebar, sem rodape.
//
// A pessoa chega de anuncio e tem uma tarefa. Qualquer navegacao visivel aqui e
// uma saida do funil — por isso a pagina nao oferece nenhuma.
//
// O Pixel e o GA4 sao montados aqui, uma vez, e nao em cada tela: o quiz e uma
// rota so, com as telas trocando no cliente.

const GA_ID = process.env.NEXT_PUBLIC_GA_ID

export const metadata: Metadata = {
  // O quiz nao deve competir com a LP na busca nem aparecer em resultado
  // organico: o trafego e pago e a pagina so faz sentido com a origem do
  // anuncio.
  robots: { index: false, follow: false },
}

export default function QuizLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MetaPixel pixelId={process.env.NEXT_PUBLIC_META_PIXEL_QUIZ_ID} id="meta-pixel-quiz" />

      {GA_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga-quiz" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}');
            `}
          </Script>
        </>
      )}

      {children}
    </>
  )
}
