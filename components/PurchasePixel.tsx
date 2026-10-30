'use client'

import { useEffect } from 'react'

// Purchase do Pixel na pagina de sucesso.
//
// Par browser do Purchase que o webhook manda pela CAPI. O event_id e derivado
// da referencia do checkout nos dois lados, entao a Meta deduplica a venda.
// Sem o par, o funil ficaria cego para quem bloqueia script (so CAPI) ou para
// quem fecha a aba antes do redirect (so Pixel).
//
// O valor nao e enviado daqui: a pagina nao consulta o pagamento, e informar
// valor errado e pior que omiti-lo. Quem manda valor e moeda e a CAPI, que le
// do webhook confirmado pelo provedor.

type Props = {
  /** Referencia estavel devolvida pelo provedor no redirect. */
  idCheckout: string | undefined
}

export function PurchasePixel({ idCheckout }: Props) {
  useEffect(() => {
    if (!idCheckout) return
    if (typeof window === 'undefined' || typeof window.fbq !== 'function') return

    try {
      window.fbq('track', 'Purchase', {}, { eventID: `purchase_${idCheckout}` })
    } catch {
      // Pixel bloqueado: a CAPI ainda registra a venda.
    }
  }, [idCheckout])

  return null
}
