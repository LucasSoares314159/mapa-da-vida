'use client'

import { useEffect } from 'react'
import { trackMeta } from '@/lib/tracking/meta'
import {
  CONTEUDO_TRILHA,
  MOEDA_TRILHA,
  VALOR_TRILHA_REAIS,
  eventIdDaCompra,
} from '@/lib/tracking/purchase'

// Purchase do Pixel na pagina de sucesso.
//
// Par browser do Purchase que o webhook manda pela CAPI. O event_id sai da
// mesma funcao nos dois lados (eventIdDaCompra), entao a Meta deduplica a venda.
// Sem o par, o funil ficaria cego para quem bloqueia script (so CAPI) ou para
// quem fecha a aba antes do redirect (so Pixel).
//
// O valor VAI daqui, igual ao do servidor: dos dois eventos deduplicados a Meta
// fica com um so, conforme a ordem de chegada. Se o do navegador chegasse
// primeiro sem valor, a venda entraria sem receita e o ROAS sairia zerado.

type Props = {
  /** externalId da cobranca, devolvido pelo provedor no redirect. */
  idCheckout: string | undefined
}

// Um disparo por compra neste carregamento da pagina. O StrictMode do dev roda o
// efeito duas vezes; a Meta deduplicaria pelo eventID, mas o Gerenciador de
// Eventos mostraria dois Purchase no teste e confundiria a validacao.
const disparados = new Set<string>()

export function PurchasePixel({ idCheckout }: Props) {
  useEffect(() => {
    if (!idCheckout || disparados.has(idCheckout)) return
    disparados.add(idCheckout)
    // Espera o carregador do Pixel: o efeito roda antes do script afterInteractive.
    // Pixel bloqueado: o helper descarta em silencio e a CAPI ainda registra a venda.
    trackMeta(
      'Purchase',
      { value: VALOR_TRILHA_REAIS, currency: MOEDA_TRILHA, ...CONTEUDO_TRILHA },
      { eventID: eventIdDaCompra(idCheckout) }
    )
  }, [idCheckout])

  return null
}
