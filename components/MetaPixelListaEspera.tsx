'use client'

import { MetaPixel } from './MetaPixel'

// Pixel da lista de espera. Mantido como componente proprio porque e o nome
// usado em /lista-espera e /obrigado; a mecanica agora vive em MetaPixel.

export function MetaPixelListaEspera() {
  return (
    <MetaPixel
      pixelId={process.env.NEXT_PUBLIC_META_PIXEL_LISTA_ESPERA_ID}
      id="meta-pixel-lista-espera"
    />
  )
}
