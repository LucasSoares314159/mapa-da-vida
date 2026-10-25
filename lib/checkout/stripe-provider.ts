import { getStripe } from '@/lib/stripe'
import { montarMetadata, type ParamsCheckout, type ProviderCheckout, type ResultadoCheckout } from './tipos'

// Adapter do Stripe — hoje o unico provider implementado.
//
// O metadata do Checkout e espelhado em payment_intent_data: o webhook le a
// Session, mas um reembolso ou uma consulta pelo Payment Intent nao veem o
// metadata da Session. Sem o espelho, a origem da venda se perde no relatorio
// financeiro do Stripe.

export const stripeProvider: ProviderCheckout = {
  nome: 'stripe',

  async criarCobranca(params: ParamsCheckout, siteUrl: string): Promise<ResultadoCheckout> {
    const priceId = process.env.STRIPE_PRICE_ID
    if (!priceId) {
      throw new Error('STRIPE_PRICE_ID nao configurada')
    }

    const metadata = montarMetadata(params)
    const cancelPath = params.cancelPath ?? '/trilha#comprar'

    const session = await getStripe().checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      customer_creation: 'always',
      locale: 'pt-BR',
      success_url: `${siteUrl}/compra/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}${cancelPath}`,
      metadata,
      payment_intent_data: { metadata },
    })

    if (!session.url) {
      throw new Error('Stripe nao retornou a URL do Checkout')
    }

    return { url: session.url }
  },
}
