// Contrato de checkout independente de provider.
//
// O quiz nunca importa Stripe nem AbacatePay: chama startCheckout e recebe uma
// URL. Trocar o provider ativo e escrever um adapter novo e mudar uma variavel
// de ambiente — nada em components/quiz muda.

export type OrigemCheckout = 'lp-trilha' | 'quiz'

/**
 * O que o chamador informa para iniciar uma cobranca.
 *
 * Nada aqui identifica a pessoa: o e-mail e coletado pelo provider na propria
 * tela de pagamento. O quiz nao captura contato.
 */
export type ParamsCheckout = {
  /** De onde veio o clique. */
  source: OrigemCheckout
  /** Slug do quiz, quando a origem foi um quiz. */
  quizSlug?: string
  /** Perfil atribuido pelo quiz (A, B, C, geral). */
  resultProfile?: string
  utm?: Record<string, string | undefined>
  /** Cookies do Pixel, repassados para a CAPI reconciliar a venda. */
  fbp?: string
  fbc?: string
  /** URL para onde voltar se a pessoa desistir. */
  cancelPath?: string
}

export type ResultadoCheckout = {
  /** Para onde redirecionar o navegador. */
  url: string
}

export interface ProviderCheckout {
  readonly nome: string
  criarCobranca(params: ParamsCheckout, siteUrl: string): Promise<ResultadoCheckout>
}

/**
 * Metadado da cobranca, em snake_case e chaves curtas.
 *
 * Um provider que imponha limites menores deve truncar aqui, nao no chamador —
 * e por isso que a montagem e compartilhada.
 */
export function montarMetadata(params: ParamsCheckout): Record<string, string> {
  const metadata: Record<string, string> = {
    produto: 'trilha-produtividade',
    source: params.source,
  }

  if (params.quizSlug) metadata.quiz_slug = params.quizSlug
  if (params.resultProfile) metadata.result_profile = params.resultProfile
  if (params.fbp) metadata.fbp = params.fbp
  if (params.fbc) metadata.fbc = params.fbc

  for (const [chave, valor] of Object.entries(params.utm ?? {})) {
    if (valor) metadata[chave] = valor.slice(0, 500)
  }

  return metadata
}
