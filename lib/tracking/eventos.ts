// Helper unico de tracking do funil de quiz.
//
// Cada evento vai para o Pixel da Meta e para o GA4 na mesma chamada: sao duas
// perguntas diferentes. O Pixel alimenta a otimizacao da campanha; o GA4 monta
// o relatorio de funil com abandono por etapa, que no Gerenciador da Meta
// exigiria criar uma conversao personalizada por passo.
//
// Todo evento carrega event_id. Hoje so o Purchase e deduplicado de fato
// (browser + CAPI), mas gerar o id em todos deixa qualquer evento pronto para
// ganhar par server-side sem mudar quem o dispara.

import { lerAtribuicao } from './atribuicao'

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
    gtag?: (...args: unknown[]) => void
    dataLayer?: unknown[]
  }
}

export type EventoQuiz =
  | 'quiz_view'
  | 'quiz_start'
  | 'quiz_answer'
  | 'quiz_complete'
  | 'vsl_play'
  | 'cta_click'

export type ParamsEvento = Record<string, string | number | boolean | undefined>

/**
 * Gera o identificador de deduplicacao. randomUUID nao existe em contexto nao
 * seguro nem em navegador antigo, por isso o fallback.
 */
export function gerarEventId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

function limpar(params: ParamsEvento): Record<string, string | number | boolean> {
  return Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== '')
  ) as Record<string, string | number | boolean>
}

/**
 * Dispara um evento do funil.
 *
 * Os eventos sao customizados (trackCustom), nao padrao da Meta: nenhum deles
 * corresponde a um evento do catalogo, e mapea-los a Lead ou ViewContent
 * misturaria o funil do quiz com o da lista de espera no mesmo relatorio.
 * Para virarem objetivo de campanha, precisam de conversao personalizada no
 * Gerenciador de Eventos — ver a secao do quiz no CLAUDE.md.
 */
export function track(evento: EventoQuiz, params: ParamsEvento = {}): string {
  const eventId = gerarEventId()

  if (typeof window === 'undefined') return eventId

  const atribuicao = lerAtribuicao()
  const payload = limpar({
    ...atribuicao?.utm,
    ...params,
  })

  dispararPixel(evento, payload, eventId)

  try {
    window.gtag?.('event', evento, { ...payload, event_id: eventId })
  } catch {
    // Idem.
  }

  return eventId
}

/**
 * Envia o evento ao Pixel, esperando o fbq carregar se preciso.
 *
 * O pixel carrega com strategy="afterInteractive", entao os primeiros eventos
 * do funil (quiz_view na entrada) disparam antes de window.fbq existir. Sem
 * essa espera, o fbq?.(...) descartava o evento em silencio e so o PageView
 * do proprio init chegava — o funil inteiro se perdia. Mesmo retry que o
 * useMetaPixel ja usava na lista de espera.
 */
function dispararPixel(evento: string, payload: Record<string, unknown>, eventId: string): void {
  function enviar(): boolean {
    if (typeof window.fbq !== 'function') return false
    try {
      window.fbq('trackCustom', evento, payload, { eventID: eventId })
    } catch {
      // Pixel bloqueado por adblock: nada a fazer, o GA4 e a CAPI cobrem.
    }
    return true
  }

  if (enviar()) return

  // fbq ainda nao carregou — tenta por ate ~2s antes de desistir.
  let tentativas = 0
  const intervalo = setInterval(() => {
    tentativas++
    if (enviar() || tentativas >= 40) clearInterval(intervalo)
  }, 50)
}
