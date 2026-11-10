import type { Metadata, Viewport } from 'next'
import { MetaPixel } from '@/components/MetaPixel'

// Layout proprio do funil de quiz: sem Header, sem Sidebar, sem rodape.
//
// A pessoa chega de anuncio e tem uma tarefa. Qualquer navegacao visivel aqui e
// uma saida do funil — por isso a pagina nao oferece nenhuma.
//
// O Pixel e montado aqui, uma vez, e nao em cada tela: o quiz e uma rota so,
// com as telas trocando no cliente. O GA4 nao entra aqui: ele so e baixado na
// primeira resposta (lib/tracking/ga.ts), porque a entrada tem um unico
// trabalho — um toque — e ~177 kB de gtag.js nao ajudam nisso.

export const metadata: Metadata = {
  // O quiz nao deve competir com a LP na busca nem aparecer em resultado
  // organico: o trafego e pago e a pagina so faz sentido com a origem do
  // anuncio.
  robots: { index: false, follow: false },
}

// viewport-fit=cover so no funil: sem ele o iOS reporta safe area zero, e a
// barra fixa do botao de compra (TelaResultado) ficaria atras do indicador de
// inicio do iPhone. Com ele, o conteudo pode ir para baixo do notch com o
// celular deitado — por isso o padding lateral de safe area no wrapper abaixo.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function QuizLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MetaPixel />

      <div className="pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">{children}</div>
    </>
  )
}
