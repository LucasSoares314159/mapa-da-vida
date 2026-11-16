// GA4 do funil de quiz, com o carregamento adiado.
//
// O gtag.js pesa ~177 kB, quase um quarto da entrada do quiz. Ate nov/2026 so
// era baixado na primeira resposta; desde a instrumentacao do quiz_accept
// (abertura v3) QuizConversa chama carregarGa() ja na entrada, para que quem
// sai na abertura tambem apareca no GA4. O custo (bytes na entrada) foi aceito.
//
// A fila do gtag (dataLayer + stub) continua montada no primeiro evento, e o
// gtag.js processa a fila inteira ao chegar, na ordem — o mesmo mecanismo do
// snippet oficial. carregarGa() e idempotente.

import { modoQa } from './qa'

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    dataLayer?: unknown[]
  }
}

const GA_ID = process.env.NEXT_PUBLIC_GA_ID

let filaPronta = false
let bibliotecaPedida = false

/**
 * Monta a fila do gtag uma vez: stub, 'js' e 'config' — nessa ordem, antes de
 * qualquer evento, que e a ordem que o gtag.js espera encontrar no dataLayer.
 */
function prepararFila(): boolean {
  if (!GA_ID || typeof window === 'undefined') return false
  // ?qa=1: nem fila, nem gtag.js, nem o page_view automatico (ver ./qa.ts).
  if (modoQa()) return false
  if (filaPronta) return true
  filaPronta = true

  window.dataLayer = window.dataLayer || []
  if (!window.gtag) {
    // O gtag.js so reconhece comandos empilhados como o objeto `arguments`,
    // nao como array: por isso function + arguments, e nao rest params.
    window.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments)
    }
  }
  window.gtag('js', new Date())
  window.gtag('config', GA_ID)
  return true
}

/** Enfileira um evento. Sai de fato quando o gtag.js carregar. */
export function eventoGa(evento: string, params: Record<string, unknown>): void {
  if (!prepararFila()) return
  try {
    window.gtag?.('event', evento, params)
  } catch {
    // Rastreio nunca derruba o quiz.
  }
}

/** Baixa o gtag.js, uma vez por documento. Seguro chamar de novo. */
export function carregarGa(): void {
  if (!prepararFila() || bibliotecaPedida) return
  bibliotecaPedida = true

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
  document.head.appendChild(script)
}
