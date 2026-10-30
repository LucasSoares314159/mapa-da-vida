import { abacatePayProvider } from './abacatepay-provider'
import type { ParamsCheckout, ProviderCheckout, ResultadoCheckout } from './tipos'

export type { ParamsCheckout, ProviderCheckout, ResultadoCheckout, OrigemCheckout } from './tipos'
export { montarMetadata } from './tipos'

/**
 * Providers disponiveis.
 *
 * A pagina e o quiz conhecem apenas este contrato. Detalhes da API e das
 * credenciais ficam isolados no adapter do provedor.
 */
const PROVIDERS: Record<string, ProviderCheckout> = {
  abacatepay: abacatePayProvider,
}

export function providerAtivo(): ProviderCheckout {
  const escolhido = (process.env.CHECKOUT_PROVIDER ?? 'abacatepay').trim().toLowerCase()
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
