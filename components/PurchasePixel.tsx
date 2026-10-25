'use client'

import { useEffect } from 'react'

// Purchase do Pixel na pagina de sucesso.
//
// Par browser do Purchase que o webhook manda pela CAPI. O event_id e derivado
// da Checkout Session nos dois lados, entao a Meta deduplica e conta uma venda.
// Sem o par, o funil ficaria cego para quem bloqueia script (so CAPI) ou para
// quem fecha a aba antes do redirect (so Pixel).
//
// O valor nao e enviado daqui: a pagina nao consulta o pagamento, e informar
// valor errado e pior que omiti-lo. Quem manda valor e moeda e a CAPI, que le
// do proprio Stripe.

type Props = {
  /** session_id devolvido pelo Stripe no redirect. */
  idSessao: string | undefined
}

export function PurchasePixel({ idSessao }: Props) {
  useEffect(() => {
    if (!idSessao) return
    if (typeof window === 'undefined' || typeof window.fbq !== 'function') return

    try {
      window.fbq('track', 'Purchase', {}, { eventID: `purchase_${idSessao}` })
    } catch {
      // Pixel bloqueado: a CAPI ainda registra a venda.
    }
  }, [idSessao])

  return null
}
