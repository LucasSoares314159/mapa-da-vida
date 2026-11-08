// Contrato do Purchase compartilhado entre o Pixel (navegador) e a CAPI (servidor).
//
// Os dois lados mandam o MESMO evento com o MESMO event_id, e a Meta deduplica.
// Para isso funcionar, id, valor e conteudo precisam sair daqui — nao de duas
// copias que um dia divergem. Este arquivo roda no browser: nada de node:crypto.

import { TRILHA_PRECO_VALOR } from '@/lib/empresa'

/**
 * Receita da Trilha em reais, como o navegador a conhece.
 *
 * O navegador nao consulta o pagamento, entao usa o preco de tabela — o mesmo
 * do InitiateCheckout (lib/tracking/eventos.ts). O servidor calcula o mesmo
 * numero a partir do webhook (`receitaDoProdutoEmReais`).
 */
export const VALOR_TRILHA_REAIS = TRILHA_PRECO_VALOR

export const MOEDA_TRILHA = 'BRL'

/** Identificacao do produto nos eventos da Meta, igual nos dois lados. */
export const CONTEUDO_TRILHA = {
  content_name: 'Trilha',
  content_ids: ['trilha'],
  content_type: 'product',
}

/**
 * Identificador deduplicavel de uma compra.
 *
 * Derivado do `externalId` da cobranca, que nos mesmos geramos ao criar o
 * checkout: e o unico identificador que o navegador tambem conhece (chega na
 * pagina de sucesso como `checkout_ref`). O id interno do provedor nao chega ao
 * browser — usa-lo quebraria a deduplicacao e cada venda contaria duas vezes.
 */
export function eventIdDaCompra(referenciaCheckout: string): string {
  return `purchase_${referenciaCheckout}`
}

type ValoresCheckout = {
  paidAmount?: unknown
  amount?: unknown
  customerFee?: unknown
}

function centavos(valor: unknown): number | undefined {
  return typeof valor === 'number' && Number.isFinite(valor) ? valor : undefined
}

/**
 * Valor do Purchase em reais, a partir dos centavos do webhook.
 *
 * O criterio e a RECEITA DO PRODUTO, nao o desembolso do cliente. No cartao
 * parcelado a taxa e repassada ao cliente (`passFeesToCustomer`): `paidAmount`
 * inclui esses juros e `customerFee` os isola. Juros de parcelamento sao custo
 * do cliente com a administradora, nao receita nossa — se entrassem no value, a
 * mesma venda valeria mais no cartao que no PIX e o ROAS ficaria inflado.
 * Tambem e o unico numero que o navegador consegue repetir.
 */
export function receitaDoProdutoEmReais(checkout: ValoresCheckout): number | undefined {
  const pago = centavos(checkout.paidAmount) ?? centavos(checkout.amount)
  if (pago === undefined) return undefined

  const taxaDoCliente = centavos(checkout.customerFee) ?? 0
  const receita = pago - taxaDoCliente
  if (receita <= 0) return undefined

  return Math.round(receita) / 100
}
