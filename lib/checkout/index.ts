import { abacatePayProvider } from './abacatepay-provider'
import { gravarAtribuicaoCheckout } from './atribuicao-checkout'
import type { ParamsCheckout, ProviderCheckout, ResultadoCheckout } from './tipos'

export type { ContextoCliente, ParamsCheckout, ProviderCheckout, ResultadoCheckout, OrigemCheckout } from './tipos'
export { contextoDaRequisicao } from './atribuicao-checkout'
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

/**
 * Cria a cobranca no provider ativo e devolve a URL de pagamento.
 *
 * Grava a atribuicao (cookies do Pixel, IP, user agent, pagina de origem) sob o
 * externalId, para o webhook mandar o Purchase com ela. A gravacao nunca falha
 * a compra.
 */
export async function startCheckout(
  params: ParamsCheckout,
  siteUrl: string
): Promise<ResultadoCheckout> {
  const provider = providerAtivo()
  const resultado = await provider.criarCobranca(params, siteUrl)
  await gravarAtribuicaoCheckout(resultado.externalId, provider.nome, params)
  return resultado
}
