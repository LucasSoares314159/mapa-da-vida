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
      {/* Fontes da LP /trilha, só no funil. Satoshi (títulos) não está no
          Google Fonts — vem da Fontshare, como na LP. Lora 600 é o negrito da
          prosa; o globals.css só carrega o 400. A plataforma não usa nenhuma
          das duas, então não vão para o globals. */}
      <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="" />
      <link
        rel="stylesheet"
        href="https://api.fontshare.com/v2/css?f[]=satoshi@500,700&display=swap"
      />
      {/* A regra pressupõe o pages/_document; aqui a fonte é do funil de
          propósito, não do site. */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Lora:wght@400;600&display=swap"
      />

      <MetaPixel />

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
