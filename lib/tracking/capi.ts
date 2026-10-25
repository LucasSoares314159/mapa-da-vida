import { createHash } from 'node:crypto'

// Conversions API da Meta — envio server-side de eventos.
//
// Existe por causa do Purchase. O navegador pode fechar antes do redirect do
// Stripe, o adblock pode derrubar o Pixel e o iOS pode cortar o cookie: nos
// tres casos a venda acontece e a Meta nunca sabe. O webhook do Stripe e o
// unico ponto do fluxo que ve o pagamento confirmado com certeza.
//
// O par browser + servidor manda o MESMO event_id, e a Meta deduplica. Sem
// isso, toda venda contaria duas vezes e o ROAS apareceria inflado.

const ENDPOINT_BASE = 'https://graph.facebook.com/v21.0'

/** Dados pessoais vao hasheados em SHA-256, como a Meta exige. */
function hash(valor: string): string {
  return createHash('sha256').update(valor.trim().toLowerCase()).digest('hex')
}

export type EventoCapi = {
  nome: string
  eventId: string
  /** Momento do evento. A Meta recusa eventos com mais de 7 dias. */
  ocorridoEm?: Date
  email?: string
  /** Cookies do Pixel capturados no browser, quando chegaram ate aqui. */
  fbp?: string
  fbc?: string
  valor?: number
  moeda?: string
  /** Virou metadado da cobranca: liga a venda ao quiz de origem. */
  customData?: Record<string, string | number>
  /** URL onde a conversao aconteceu. */
  sourceUrl?: string
}

export function capiConfigurada(): boolean {
  return Boolean(process.env.META_CAPI_ACCESS_TOKEN && process.env.META_PIXEL_ID)
}

/**
 * Envia um evento para a CAPI.
 *
 * Nunca lanca: quem chama e o webhook do Stripe, e falhar ali faria o Stripe
 * reenviar o evento, reprocessando a compra e reenviando o e-mail de acesso.
 * Perder um evento de tracking e muito mais barato que duplicar uma venda.
 */
export async function enviarEventoCapi(evento: EventoCapi): Promise<boolean> {
  const token = process.env.META_CAPI_ACCESS_TOKEN
  const pixelId = process.env.META_PIXEL_ID

  if (!token || !pixelId) {
    console.warn('[capi] META_CAPI_ACCESS_TOKEN ou META_PIXEL_ID ausente; evento nao enviado')
    return false
  }

  const userData: Record<string, string[] | string> = {}
  if (evento.email) userData.em = [hash(evento.email)]
  if (evento.fbp) userData.fbp = evento.fbp
  if (evento.fbc) userData.fbc = evento.fbc

  const corpo = {
    data: [
      {
        event_name: evento.nome,
        event_id: evento.eventId,
        event_time: Math.floor((evento.ocorridoEm ?? new Date()).getTime() / 1000),
        action_source: 'website',
        event_source_url: evento.sourceUrl,
        user_data: userData,
        custom_data: {
          ...evento.customData,
          ...(evento.valor !== undefined ? { value: evento.valor } : {}),
          ...(evento.moeda ? { currency: evento.moeda } : {}),
        },
      },
    ],
    // Preencher no Gerenciador de Eventos ao validar; remover depois, senao os
    // eventos continuam chegando como teste e nao contam para a campanha.
    ...(process.env.META_CAPI_TEST_CODE
      ? { test_event_code: process.env.META_CAPI_TEST_CODE }
      : {}),
  }

  try {
    const resposta = await fetch(`${ENDPOINT_BASE}/${pixelId}/events?access_token=${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(corpo),
    })

    if (!resposta.ok) {
      console.error('[capi] Meta recusou o evento:', resposta.status, await resposta.text())
      return false
    }

    return true
  } catch (error) {
    console.error('[capi] Falha ao enviar evento:', error)
    return false
  }
}

/**
 * Identificador deduplicavel de uma compra.
 *
 * Derivado da Checkout Session, que e unica e estavel: o navegador e o webhook
 * chegam ao mesmo id sem precisar passar nada um para o outro, e um retry do
 * Stripe nao gera um segundo Purchase.
 */
export function eventIdDaCompra(idSessaoCheckout: string): string {
  return `purchase_${idSessaoCheckout}`
}
