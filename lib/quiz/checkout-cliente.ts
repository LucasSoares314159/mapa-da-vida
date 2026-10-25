import { lerAtribuicao } from '@/lib/tracking/atribuicao'

// Ponte do quiz para o checkout, no browser.
//
// Deliberadamente nao importa nada de lib/checkout: aquilo e server-side e
// conhece o provider. Daqui sai um POST para a rota, que resolve qual provider
// esta ativo. E o que mantem components/quiz ignorante de Stripe e AbacatePay.

export type ParamsCheckoutQuiz = {
  quizSlug: string
  resultProfile: string
}

/**
 * Cria a cobranca e devolve a URL de pagamento.
 *
 * Lanca em caso de falha: quem chama precisa reabilitar o botao e avisar a
 * pessoa, nunca deixar um botao morto numa tela de compra.
 */
export async function iniciarCheckoutDoQuiz({
  quizSlug,
  resultProfile,
}: ParamsCheckoutQuiz): Promise<string> {
  const atribuicao = lerAtribuicao()

  const resposta = await fetch('/api/stripe/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      source: 'quiz',
      quizSlug,
      resultProfile,
      utm: atribuicao?.utm ?? {},
      fbp: atribuicao?.fbp,
      fbc: atribuicao?.fbc,
      cancelPath: `/quiz/${quizSlug}`,
    }),
  })

  if (!resposta.ok) {
    throw new Error(`Checkout respondeu ${resposta.status}`)
  }

  const dados = (await resposta.json()) as { url?: string }
  if (!dados.url) {
    throw new Error('Checkout nao retornou URL')
  }

  return dados.url
}
