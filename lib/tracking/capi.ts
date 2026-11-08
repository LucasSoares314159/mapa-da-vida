import { createHash } from 'node:crypto'
import { PIXEL_META_ID } from './meta'

// Conversions API da Meta — envio server-side de eventos.
//
// Existe por causa do Purchase. O navegador pode fechar antes do redirect do
// provedor, o adblock pode derrubar o Pixel e o iOS pode cortar o cookie: nos
// tres casos a venda acontece e a Meta nunca sabe. O webhook de pagamento e o
// unico ponto do fluxo que ve o pagamento confirmado com certeza.
//
// O par browser + servidor manda o MESMO event_id, e a Meta deduplica. Sem
// isso, toda venda contaria duas vezes e o ROAS apareceria inflado.

/**
 * Versao da Graph API. A v21 (a anterior aqui) e removida em 21/01/2027; a
 * Meta mantem cada versao por cerca de dois anos depois da seguinte.
 */
const VERSAO_GRAPH = 'v26.0'

/**
 * Teto de espera pela Meta. Quem chama e o webhook do provedor: a resposta 200
 * nao pode ficar refem de uma API de tracking lenta. A AbacatePay desiste em
 * 30s e reenvia, o que reprocessaria a compra.
 */
const TIMEOUT_MS = 4000

/** Dados pessoais vao hasheados em SHA-256, como a Meta exige. */
export function sha256(valor: string): string {
  return createHash('sha256').update(valor, 'utf8').digest('hex')
}

export function normalizarEmailMeta(email: string): string | undefined {
  const normalizado = email.trim().toLowerCase().replace(/\s+/g, '')
  return normalizado.includes('@') ? normalizado : undefined
}

/**
 * Telefone no formato que a Meta espera em `ph`: E.164 sem o "+", so digitos,
 * com DDI. Numero sem DDI e tratado como brasileiro — o checkout e PIX/BRL.
 */
export function normalizarTelefoneMeta(telefone: string): string | undefined {
  const bruto = telefone.trim()
  let digitos = bruto.replace(/\D/g, '')
  if (!digitos) return undefined

  const internacional = bruto.startsWith('+') || digitos.startsWith('00')
  if (digitos.startsWith('00')) digitos = digitos.slice(2)

  if (!internacional) {
    // 0 de discagem interurbana ("011 98888-7777") nao faz parte do numero.
    digitos = digitos.replace(/^0+/, '')
    // DDD + numero (10 ou 11 digitos): falta o DDI do Brasil.
    if (digitos.length === 10 || digitos.length === 11) digitos = `55${digitos}`
  }

  // E.164 tem no maximo 15 digitos; menos de 8 nao e telefone.
  return digitos.length >= 8 && digitos.length <= 15 ? digitos : undefined
}

/**
 * Nome em minusculas, sem pontuacao nem espacos; acentos seguem em UTF-8.
 * A faixa cobre o latim com diacriticos (todo o portugues); o tsconfig mira
 * ES5, sem a flag `u` para \p{L}.
 */
export function normalizarNomeMeta(nome: string): string | undefined {
  const normalizado = nome.normalize('NFC').toLowerCase().replace(/[^a-z\u00e0-\u00f6\u00f8-\u00ff]/g, '')
  return normalizado || undefined
}

/** Primeiro e ultimo nome a partir do nome completo informado no checkout. */
export function separarNome(nomeCompleto: string): { primeiro?: string; ultimo?: string } {
  const partes = nomeCompleto.trim().split(/\s+/).filter(Boolean)
  if (partes.length === 0) return {}
  return {
    primeiro: partes[0],
    ultimo: partes.length > 1 ? partes[partes.length - 1] : undefined,
  }
}

export type DadosUsuarioCapi = {
  email?: string
  telefone?: string
  /** Nome completo; vira fn + ln. */
  nome?: string
  /** Id estavel do cliente no provedor. */
  externalId?: string
  /** Codigo ISO de 2 letras. */
  pais?: string
  /** IP e user agent de quem iniciou o checkout — nao sao hasheados. */
  ip?: string
  userAgent?: string
  /** Cookies do Pixel capturados no browser — nao sao hasheados. */
  fbp?: string
  fbc?: string
}

/** Monta `user_data`: identificadores pessoais em hash, sinais tecnicos crus. */
export function montarUserData(dados: DadosUsuarioCapi): Record<string, string | string[]> {
  const userData: Record<string, string | string[]> = {}

  const email = dados.email ? normalizarEmailMeta(dados.email) : undefined
  if (email) userData.em = [sha256(email)]

  const telefone = dados.telefone ? normalizarTelefoneMeta(dados.telefone) : undefined
  if (telefone) userData.ph = [sha256(telefone)]

  if (dados.nome) {
    const { primeiro, ultimo } = separarNome(dados.nome)
    const fn = primeiro ? normalizarNomeMeta(primeiro) : undefined
    const ln = ultimo ? normalizarNomeMeta(ultimo) : undefined
    if (fn) userData.fn = [sha256(fn)]
    if (ln) userData.ln = [sha256(ln)]
  }

  const externalId = dados.externalId?.trim()
  if (externalId) userData.external_id = [sha256(externalId)]

  const pais = dados.pais?.trim().toLowerCase()
  if (pais) userData.country = [sha256(pais)]

  if (dados.ip) userData.client_ip_address = dados.ip
  if (dados.userAgent) userData.client_user_agent = dados.userAgent
  if (dados.fbp) userData.fbp = dados.fbp
  if (dados.fbc) userData.fbc = dados.fbc

  return userData
}

export type EventoCapi = {
  nome: string
  eventId: string
  /** Momento do evento. A Meta recusa eventos com mais de 7 dias. */
  ocorridoEm?: Date
  usuario: DadosUsuarioCapi
  valor?: number
  moeda?: string
  customData?: Record<string, unknown>
  /** URL onde a conversao aconteceu. */
  sourceUrl?: string
}

/** Corpo do POST /events, sem o token. Funcao pura para poder ser testada. */
export function montarCorpoCapi(evento: EventoCapi, testEventCode?: string) {
  const codigoTeste = testEventCode?.trim()

  return {
    data: [
      {
        event_name: evento.nome,
        event_id: evento.eventId,
        event_time: Math.floor((evento.ocorridoEm ?? new Date()).getTime() / 1000),
        action_source: 'website',
        ...(evento.sourceUrl ? { event_source_url: evento.sourceUrl } : {}),
        user_data: montarUserData(evento.usuario),
        custom_data: {
          ...evento.customData,
          ...(evento.valor !== undefined ? { value: evento.valor } : {}),
          ...(evento.moeda ? { currency: evento.moeda } : {}),
        },
      },
    ],
    // So durante a validacao no Gerenciador de Eventos. Com o codigo, o evento
    // aparece em "Eventos de teste" e NAO conta para a campanha — remover depois.
    ...(codigoTeste ? { test_event_code: codigoTeste } : {}),
  }
}

export function capiConfigurada(): boolean {
  return Boolean(process.env.META_CAPI_ACCESS_TOKEN?.trim())
}

/**
 * Envia um evento para a CAPI. Devolve se a Meta aceitou.
 *
 * Nunca lanca: quem chama e o webhook do provedor, e falhar ali causaria
 * reenviar o evento, reprocessando a compra e reenviando o e-mail de acesso.
 * Perder um evento de tracking e muito mais barato que duplicar uma venda.
 */
export async function enviarEventoCapi(evento: EventoCapi): Promise<boolean> {
  const token = process.env.META_CAPI_ACCESS_TOKEN?.trim()

  if (!token) {
    console.warn('[capi] META_CAPI_ACCESS_TOKEN ausente; evento nao enviado')
    return false
  }

  // O token vai no corpo, nao na query string: URLs acabam em logs.
  const corpo = {
    ...montarCorpoCapi(evento, process.env.META_CAPI_TEST_CODE),
    access_token: token,
  }

  try {
    const resposta = await fetch(
      `https://graph.facebook.com/${VERSAO_GRAPH}/${PIXEL_META_ID}/events`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(corpo),
        signal: AbortSignal.timeout(TIMEOUT_MS),
        cache: 'no-store',
      }
    )

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
