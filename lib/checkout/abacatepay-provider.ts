import { randomUUID } from 'node:crypto'
import { getAbacatePay } from '@/lib/abacatepay'
import {
  montarMetadata,
  type ParamsCheckout,
  type ProviderCheckout,
  type ResultadoCheckout,
} from './tipos'

export const abacatePayProvider: ProviderCheckout = {
  nome: 'abacatepay',

  async criarCobranca(
    params: ParamsCheckout,
    siteUrl: string
  ): Promise<ResultadoCheckout> {
    const productId = process.env.ABACATEPAY_PRODUCT_ID
    if (!productId) {
      throw new Error('ABACATEPAY_PRODUCT_ID nao configurada')
    }

    const externalId = `trilha-produtividade-${randomUUID()}`
    const cancelPath = params.cancelPath ?? '/trilha#comprar'
    const checkout = await getAbacatePay().createCheckout({
      items: [{ id: productId, quantity: 1 }],
      methods: ['PIX', 'CARD'],
      card: { maxInstallments: 12 },
      externalId,
      metadata: montarMetadata(params),
      returnUrl: `${siteUrl}${cancelPath}`,
      completionUrl: `${siteUrl}/compra/sucesso?checkout_ref=${encodeURIComponent(externalId)}`,
    })

    if (!checkout.url) {
      throw new Error('AbacatePay nao retornou a URL do Checkout')
    }

    return { url: checkout.url }
  },
}

