import { stripeProvider } from './stripe-provider'
import type { ParamsCheckout, ProviderCheckout, ResultadoCheckout } from './tipos'

export type { ParamsCheckout, ProviderCheckout, ResultadoCheckout, OrigemCheckout } from './tipos'
export { montarMetadata } from './tipos'

/**
 * Providers disponiveis.
 *
 * A AbacatePay entra aqui como uma segunda entrada quando a estrutura dela
 * subir: implementar ProviderCheckout em lib/checkout/abacatepay-provider.ts,
 * registrar abaixo e apontar CHECKOUT_PROVIDER para ela. O quiz nao muda.
 */
const PROVIDERS: Record<string, ProviderCheckout> = {
  stripe: stripeProvider,
}

export function providerAtivo(): ProviderCheckout {
  const escolhido = (process.env.CHECKOUT_PROVIDER ?? 'stripe').trim().toLowerCase()
  const provider = PROVIDERS[escolhido]

  if (!provider) {
    throw new Error(
      `CHECKOUT_PROVIDER="${escolhido}" nao implementado. Disponiveis: ${Object.keys(PROVIDERS).join(', ')}`
    )
  }

  return provider
}

/** Cria a cobranca no provider ativo e devolve a URL de pagamento. */
export async function startCheckout(
  params: ParamsCheckout,
  siteUrl: string
): Promise<ResultadoCheckout> {
  return providerAtivo().criarCobranca(params, siteUrl)
}
