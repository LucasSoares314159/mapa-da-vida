// Captura e persistencia dos parametros de origem do trafego.
//
// O anuncio leva para /quiz/<slug>?utm_...&fbclid=..., mas o checkout acontece
// varias telas depois, e o clique no CTA perde a query string original. Os
// parametros sao capturados na entrada e guardados na sessao para viajar ate a
// cobranca como metadado — e o que liga uma venda ao anuncio que a gerou.

const CHAVE = 'quiz-atribuicao'

export const PARAMS_UTM = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
] as const

export type Utm = Partial<Record<(typeof PARAMS_UTM)[number], string>>

export type Atribuicao = {
  utm: Utm
  fbclid?: string
  /** Cookie _fbp do Pixel: identifica o navegador. */
  fbp?: string
  /** Cookie _fbc do Pixel: deriva do fbclid do clique no anuncio. */
  fbc?: string
  /** Referrer da primeira visita, quando nao ha UTM. */
  referrer?: string
  capturadoEm: string
}

function lerCookie(nome: string): string | undefined {
  if (typeof document === 'undefined') return undefined

  const achado = document.cookie
    .split('; ')
    .find((linha) => linha.startsWith(`${nome}=`))

  return achado?.slice(nome.length + 1) || undefined
}

/**
 * O Pixel grava _fbc a partir do fbclid, mas so depois de carregar. Quando o
 * cookie ainda nao existe, monta-se o valor no formato que a Meta espera
 * (fb.1.<timestamp>.<fbclid>) para nao perder a atribuicao de quem converte
 * rapido.
 */
function derivarFbc(fbclid: string | undefined): string | undefined {
  const cookie = lerCookie('_fbc')
  if (cookie) return cookie
  if (!fbclid) return undefined
  return `fb.1.${Date.now()}.${fbclid}`
}

function capturarDaUrl(): Atribuicao {
  const query = new URLSearchParams(window.location.search)

  const utm: Utm = {}
  for (const chave of PARAMS_UTM) {
    const valor = query.get(chave)
    if (valor) utm[chave] = valor
  }

  const fbclid = query.get('fbclid') ?? undefined

  return {
    utm,
    fbclid,
    fbp: lerCookie('_fbp'),
    fbc: derivarFbc(fbclid),
    referrer: document.referrer || undefined,
    capturadoEm: new Date().toISOString(),
  }
}

function temOrigem(a: Atribuicao): boolean {
  return Object.keys(a.utm).length > 0 || Boolean(a.fbclid)
}

/**
 * Captura a atribuicao na entrada e devolve a versao persistida.
 *
 * A primeira captura com origem real ganha: navegar dentro do quiz nao tem
 * query string, e sobrescrever apagaria o anuncio que trouxe a pessoa. Os
 * cookies do Pixel, por outro lado, sao reatualizados — podem ter sido gravados
 * depois da primeira tela.
 */
export function capturarAtribuicao(): Atribuicao {
  if (typeof window === 'undefined') {
    return { utm: {}, capturadoEm: new Date().toISOString() }
  }

  const agora = capturarDaUrl()
  const guardada = lerAtribuicao()

  if (guardada && !temOrigem(agora)) {
    const atualizada: Atribuicao = {
      ...guardada,
      fbp: agora.fbp ?? guardada.fbp,
      fbc: agora.fbc ?? guardada.fbc,
    }
    gravar(atualizada)
    return atualizada
  }

  gravar(agora)
  return agora
}

export function lerAtribuicao(): Atribuicao | null {
  if (typeof window === 'undefined') return null

  try {
    const bruto = window.sessionStorage.getItem(CHAVE)
    return bruto ? (JSON.parse(bruto) as Atribuicao) : null
  } catch {
    return null
  }
}

function gravar(a: Atribuicao): void {
  try {
    window.sessionStorage.setItem(CHAVE, JSON.stringify(a))
  } catch {
    // Sem atribuicao o funil ainda funciona; so perde a origem.
  }
}
