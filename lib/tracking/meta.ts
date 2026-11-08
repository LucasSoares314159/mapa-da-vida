// Ponte do lado React para o Pixel da Meta.
//
// A inicializacao (fbq('init')) NAO vive aqui: vive em public/js/rastreio-meta.js,
// o unico modulo que carrega o Pixel — compartilhado com a pagina estatica
// /trilha, que nao tem bundle do Next. Aqui so ha o caminho para ele e a espera
// pelo carregamento.

/** Caminho publico do carregador unico do Pixel. */
export const SCRIPT_PIXEL_META = '/js/rastreio-meta.js'

/**
 * Id do Pixel para o lado servidor (Conversions API).
 *
 * Constante, e nao variavel de ambiente, de proposito: o browser le o id de
 * public/js/rastreio-meta.js e a CAPI lia de META_PIXEL_ID. Quando o Pixel foi
 * trocado, so o arquivo mudou — o servidor ficou apontando para o Pixel antigo.
 * Um teste (lib/tracking/purchase.test.ts) confere que os dois ids sao iguais.
 */
export const PIXEL_META_ID = '2130218701193734'

type ParamsMeta = Record<string, unknown>
type OpcoesMeta = { eventID?: string }

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
    trackMeta?: (evento: string, params?: ParamsMeta, opcoes?: OpcoesMeta) => boolean
    trackMetaCustom?: (evento: string, params?: ParamsMeta, opcoes?: OpcoesMeta) => boolean
    pageViewMeta?: () => boolean
    __mtPixel?: { id: string }
  }
}

/**
 * Executa `fn` quando o carregador do Pixel estiver pronto.
 *
 * O script entra com strategy="afterInteractive", entao os primeiros eventos
 * (quiz_view na entrada, Purchase na pagina de sucesso) costumam disparar antes
 * dele. Sem a espera, o evento era descartado em silencio. Desiste depois de
 * ~2s: com o script bloqueado por adblock nunca vai carregar.
 */
export function aoCarregarPixel(fn: () => void): void {
  if (typeof window === 'undefined') return
  if (window.__mtPixel) return fn()

  let tentativas = 0
  const intervalo = setInterval(() => {
    tentativas++
    if (window.__mtPixel) {
      clearInterval(intervalo)
      fn()
    } else if (tentativas >= 40) {
      clearInterval(intervalo)
    }
  }, 50)
}

/** Evento padrao da Meta (PageView, ViewContent, Purchase...). */
export function trackMeta(evento: string, params?: ParamsMeta, opcoes?: OpcoesMeta): void {
  aoCarregarPixel(() => {
    window.trackMeta?.(evento, params, opcoes)
  })
}

/** Evento customizado (trackCustom) — os do funil de quiz. */
export function trackMetaCustom(evento: string, params?: ParamsMeta, opcoes?: OpcoesMeta): void {
  aoCarregarPixel(() => {
    window.trackMetaCustom?.(evento, params, opcoes)
  })
}

/** PageView da rota atual; o carregador ignora repeticao no mesmo pathname. */
export function pageViewMeta(): void {
  aoCarregarPixel(() => {
    window.pageViewMeta?.()
  })
}
