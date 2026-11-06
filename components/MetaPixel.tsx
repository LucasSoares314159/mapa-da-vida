'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Script from 'next/script'
import { SCRIPT_PIXEL_META, pageViewMeta } from '@/lib/tracking/meta'

// Monta o Pixel da Meta nas rotas Next.js.
//
// Nao inicializa nada: so carrega public/js/rastreio-meta.js, o modulo unico que
// faz o fbq('init') para o site inteiro (inclusive a pagina estatica /trilha).
// O `id` fixo faz o next/script inserir o arquivo uma vez por documento, mesmo
// que dois layouts montem este componente.
//
// PageView dispara a cada troca de pathname, uma vez so — o carregador ignora a
// repeticao da mesma rota, entao remontagem e StrictMode nao duplicam.

type Props = {
  /** PageView automatico. A pagina de sucesso quer Purchase, nao PageView. */
  comPageView?: boolean
}

export function MetaPixel({ comPageView = true }: Props) {
  const pathname = usePathname()

  useEffect(() => {
    if (comPageView) pageViewMeta()
  }, [pathname, comPageView])

  return <Script id="meta-pixel" src={SCRIPT_PIXEL_META} strategy="afterInteractive" />
}
