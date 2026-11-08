import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  enviarEventoCapi,
  montarCorpoCapi,
  montarUserData,
  normalizarEmailMeta,
  normalizarNomeMeta,
  normalizarTelefoneMeta,
  sha256,
  type EventoCapi,
} from './capi'

// A Meta so casa o Purchase com uma pessoa se o hash bater com o dela. Um
// espaco ou uma maiuscula a mais e o evento chega, mas nao atribui a ninguem.

describe('sha256', () => {
  it('produz o hex minusculo do vetor conhecido', () => {
    expect(sha256('abc')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad')
  })
})

describe('normalizacao antes do hash', () => {
  it('e-mail em minusculas e sem espacos', () => {
    expect(normalizarEmailMeta('  Maria.Silva@Exemplo.COM ')).toBe('maria.silva@exemplo.com')
    expect(normalizarEmailMeta('sem-arroba')).toBeUndefined()
  })

  it('telefone brasileiro sem DDI ganha o 55', () => {
    expect(normalizarTelefoneMeta('(11) 98888-7777')).toBe('5511988887777')
    expect(normalizarTelefoneMeta('11 3333-4444')).toBe('551133334444')
  })

  it('remove o 0 de discagem interurbana', () => {
    expect(normalizarTelefoneMeta('011 98888-7777')).toBe('5511988887777')
  })

  it('preserva numero que ja vem com DDI', () => {
    expect(normalizarTelefoneMeta('+55 11 98888-7777')).toBe('5511988887777')
    expect(normalizarTelefoneMeta('+1 (415) 555-0100')).toBe('14155550100')
    expect(normalizarTelefoneMeta('0055 11 98888-7777')).toBe('5511988887777')
  })

  it('descarta o que nao e telefone', () => {
    expect(normalizarTelefoneMeta('123')).toBeUndefined()
    expect(normalizarTelefoneMeta('sem numero')).toBeUndefined()
  })

  it('nome sem pontuacao nem espaco, com acento em UTF-8', () => {
    expect(normalizarNomeMeta(' João ')).toBe('joão')
    expect(normalizarNomeMeta("D'Ávila")).toBe('dávila')
  })
})

describe('montarUserData', () => {
  it('hasheia identificadores pessoais e manda sinais tecnicos crus', () => {
    const userData = montarUserData({
      email: ' Maria@Exemplo.com ',
      telefone: '(11) 98888-7777',
      nome: 'Maria  da Silva',
      externalId: 'cust_123',
      pais: 'BR',
      ip: '200.100.50.25',
      userAgent: 'Mozilla/5.0',
      fbp: 'fb.1.1700000000000.123',
      fbc: 'fb.1.1700000000000.AbC',
    })

    expect(userData).toEqual({
      em: [sha256('maria@exemplo.com')],
      ph: [sha256('5511988887777')],
      fn: [sha256('maria')],
      ln: [sha256('silva')],
      external_id: [sha256('cust_123')],
      country: [sha256('br')],
      client_ip_address: '200.100.50.25',
      client_user_agent: 'Mozilla/5.0',
      fbp: 'fb.1.1700000000000.123',
      fbc: 'fb.1.1700000000000.AbC',
    })
  })

  it('omite o que nao veio, em vez de mandar hash de string vazia', () => {
    expect(montarUserData({ email: 'a@b.co' })).toEqual({ em: [sha256('a@b.co')] })
    expect(montarUserData({ nome: 'Cher' })).toEqual({ fn: [sha256('cher')] })
  })
})

const purchase: EventoCapi = {
  nome: 'Purchase',
  eventId: 'purchase_trilha-produtividade-abc',
  ocorridoEm: new Date('2026-11-08T12:00:00Z'),
  usuario: { email: 'maria@exemplo.com' },
  valor: 297,
  moeda: 'BRL',
  sourceUrl: 'https://www.mindtrail.com.br/trilha',
  customData: { content_name: 'Trilha', content_ids: ['trilha'], content_type: 'product' },
}

describe('montarCorpoCapi', () => {
  it('monta o Purchase no formato da Conversions API', () => {
    expect(montarCorpoCapi(purchase)).toEqual({
      data: [
        {
          event_name: 'Purchase',
          event_id: 'purchase_trilha-produtividade-abc',
          event_time: 1794139200,
          action_source: 'website',
          event_source_url: 'https://www.mindtrail.com.br/trilha',
          user_data: { em: [sha256('maria@exemplo.com')] },
          custom_data: {
            content_name: 'Trilha',
            content_ids: ['trilha'],
            content_type: 'product',
            value: 297,
            currency: 'BRL',
          },
        },
      ],
    })
  })

  it('inclui test_event_code so quando ha codigo', () => {
    expect(montarCorpoCapi(purchase, 'TEST123')).toHaveProperty('test_event_code', 'TEST123')
    expect(montarCorpoCapi(purchase, '   ')).not.toHaveProperty('test_event_code')
    expect(montarCorpoCapi(purchase, undefined)).not.toHaveProperty('test_event_code')
  })
})

describe('enviarEventoCapi', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('posta no Pixel atual, com o token no corpo e nao na URL', async () => {
    vi.stubEnv('META_CAPI_ACCESS_TOKEN', 'token-secreto')
    vi.stubEnv('META_CAPI_TEST_CODE', 'TEST123')
    const fetchFalso = vi.fn().mockResolvedValue(new Response('{"events_received":1}'))
    vi.stubGlobal('fetch', fetchFalso)

    await expect(enviarEventoCapi(purchase)).resolves.toBe(true)

    const [url, init] = fetchFalso.mock.calls[0]
    expect(url).toBe('https://graph.facebook.com/v26.0/2130218701193734/events')
    expect(url).not.toContain('token')
    const corpo = JSON.parse(init.body)
    expect(corpo.access_token).toBe('token-secreto')
    expect(corpo.test_event_code).toBe('TEST123')
    expect(init.signal).toBeInstanceOf(AbortSignal)
  })

  it('sem token nao chama a Meta', async () => {
    vi.stubEnv('META_CAPI_ACCESS_TOKEN', '')
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const fetchFalso = vi.fn()
    vi.stubGlobal('fetch', fetchFalso)

    await expect(enviarEventoCapi(purchase)).resolves.toBe(false)
    expect(fetchFalso).not.toHaveBeenCalled()
  })

  it('nunca lanca: recusa ou queda da Meta viram false', async () => {
    vi.stubEnv('META_CAPI_ACCESS_TOKEN', 'token-secreto')
    vi.spyOn(console, 'error').mockImplementation(() => {})

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('erro', { status: 400 })))
    await expect(enviarEventoCapi(purchase)).resolves.toBe(false)

    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('timeout')))
    await expect(enviarEventoCapi(purchase)).resolves.toBe(false)
  })
})
