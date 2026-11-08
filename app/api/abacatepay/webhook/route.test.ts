import { randomUUID } from 'node:crypto'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { assinarCorpoWebhook } from '@/lib/abacatepay'
import { enviarLinkAcessoCompra } from '@/lib/acesso-compra'
import { sha256 } from '@/lib/tracking/capi'
import { POST } from './route'

// Integracao da rota com Supabase em memoria e fetch da Meta interceptado.
// O que se protege aqui: um pagamento = um Purchase, nunca dois, e nunca
// Purchase para venda ja liberada.

type Linha = Record<string, unknown>

/** Supabase falso: so as operacoes que o webhook e a atribuicao usam. */
function criarSupabaseFalso() {
  const tabelas: Record<string, Linha[]> = {}
  const unicas: Record<string, string[]> = {
    payment_webhook_events: ['provider', 'event_id'],
    checkout_atribuicao: ['external_id'],
  }

  function from(nome: string) {
    let operacao: 'select' | 'insert' | 'upsert' | 'update' | 'delete' = 'select'
    let dados: Linha = {}
    let conflito: string[] = []
    const filtros: Array<[string, unknown]> = []
    const linhas = () => (tabelas[nome] ??= [])
    const mesmaChave = (a: Linha, b: Linha, chaves: string[]) => chaves.every((k) => a[k] === b[k])
    const casa = (linha: Linha) => filtros.every(([k, v]) => linha[k] === v)

    function executar(): { data: Linha[] | null; error: { code?: string; message: string } | null } {
      if (operacao === 'insert') {
        const chaves = unicas[nome]
        if (chaves && linhas().some((l) => mesmaChave(l, dados, chaves))) {
          return { data: null, error: { code: '23505', message: 'duplicate key' } }
        }
        const nova = { id: randomUUID(), ...dados }
        linhas().push(nova)
        return { data: [nova], error: null }
      }
      if (operacao === 'upsert') {
        const existente = linhas().find((l) => mesmaChave(l, dados, conflito))
        if (existente) {
          Object.assign(existente, dados)
          return { data: [existente], error: null }
        }
        const nova = { id: randomUUID(), ...dados }
        linhas().push(nova)
        return { data: [nova], error: null }
      }
      if (operacao === 'update') {
        const alvo = linhas().filter(casa)
        alvo.forEach((l) => Object.assign(l, dados))
        return { data: alvo, error: null }
      }
      if (operacao === 'delete') {
        tabelas[nome] = linhas().filter((l) => !casa(l))
        return { data: null, error: null }
      }
      return { data: linhas().filter(casa), error: null }
    }

    const consulta = {
      select: () => consulta,
      insert: (d: Linha) => ((operacao = 'insert'), (dados = d), consulta),
      upsert: (d: Linha, opcoes: { onConflict: string }) => (
        (operacao = 'upsert'), (dados = d), (conflito = opcoes.onConflict.split(',')), consulta
      ),
      update: (d: Linha) => ((operacao = 'update'), (dados = d), consulta),
      delete: () => ((operacao = 'delete'), consulta),
      eq: (coluna: string, valor: unknown) => (filtros.push([coluna, valor]), consulta),
      maybeSingle: async () => {
        const { data, error } = executar()
        return { data: data?.[0] ?? null, error }
      },
      single: async () => {
        const { data, error } = executar()
        return data?.[0]
          ? { data: data[0], error }
          : { data: null, error: error ?? { message: 'nenhuma linha' } }
      },
      then: (resolver: (r: unknown) => unknown, rejeitar?: (e: unknown) => unknown) =>
        Promise.resolve(executar()).then(resolver, rejeitar),
    }
    return consulta
  }

  return { from, tabelas }
}

const estado = vi.hoisted(() => ({ supabase: null as unknown }))

vi.mock('@/lib/supabase-admin', () => ({
  createAdminSupabaseClient: () => estado.supabase,
}))

// vi.mock e elevado acima dos imports. O envio real do e-mail nao interessa
// aqui; so o efeito no banco.
vi.mock('@/lib/acesso-compra', () => ({
  normalizarEmail: (email: string) => email.trim().toLowerCase(),
  enviarLinkAcessoCompra: vi.fn(async (compraId: string) => {
    const supabase = estado.supabase as ReturnType<typeof criarSupabaseFalso>
    const compra = supabase.tabelas.compras.find((l) => l.id === compraId)
    if (compra) compra.access_email_sent_at = new Date().toISOString()
  }),
}))

const EXTERNAL_ID = 'trilha-produtividade-1b2c3d'

function payloadPago(eventId = 'log_1', checkout: Record<string, unknown> = {}) {
  return {
    id: eventId,
    event: 'checkout.completed',
    apiVersion: 2,
    devMode: true,
    data: {
      checkout: {
        id: 'bill_123',
        externalId: EXTERNAL_ID,
        status: 'PAID',
        amount: 29700,
        paidAmount: 29700,
        customerFee: null,
        customerId: 'cust_123',
        installmentsCount: null,
        updatedAt: new Date().toISOString(),
        items: [{ id: 'prod_trilha', quantity: 1 }],
        ...checkout,
      },
      customer: {
        id: 'cust_123',
        name: 'Maria da Silva',
        email: 'Maria@Exemplo.com',
        taxId: '123.***.***-**',
      },
      payerInformation: { method: 'PIX' },
    },
  }
}

function webhook(corpo: unknown, assinatura?: string) {
  const bruto = JSON.stringify(corpo)
  return POST(
    new Request('https://www.mindtrail.com.br/api/abacatepay/webhook?webhookSecret=segredo', {
      method: 'POST',
      headers: { 'x-webhook-signature': assinatura ?? assinarCorpoWebhook(bruto) },
      body: bruto,
    })
  )
}

const fetchMeta = vi.fn()
const purchasesEnviados = () =>
  fetchMeta.mock.calls.filter(([url]) => String(url).startsWith('https://graph.facebook.com/'))
const corpoDoPurchase = (indice = 0) => JSON.parse(purchasesEnviados()[indice][1].body)

describe('webhook AbacatePay → Purchase', () => {
  let supabase: ReturnType<typeof criarSupabaseFalso>

  beforeEach(() => {
    supabase = criarSupabaseFalso()
    estado.supabase = supabase
    vi.stubEnv('ABACATEPAY_WEBHOOK_SECRET', 'segredo')
    vi.stubEnv('ABACATEPAY_PRODUCT_ID', 'prod_trilha')
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://www.mindtrail.com.br')
    vi.stubEnv('META_CAPI_ACCESS_TOKEN', 'token-secreto')
    vi.stubEnv('META_CAPI_TEST_CODE', '')
    fetchMeta.mockReset().mockResolvedValue(new Response('{"events_received":1}'))
    vi.stubGlobal('fetch', fetchMeta)
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    vi.mocked(enviarLinkAcessoCompra).mockClear()
  })

  it('pagamento confirmado envia um Purchase com valor, event_id e atribuicao', async () => {
    supabase.tabelas.checkout_atribuicao = [{
      external_id: EXTERNAL_ID,
      payment_provider: 'abacatepay',
      source: 'quiz',
      fbp: 'fb.1.1700000000000.123',
      fbc: 'fb.1.1700000000000.AbC',
      client_ip: '200.100.50.25',
      client_user_agent: 'Mozilla/5.0 (iPhone)',
      source_url: 'https://www.mindtrail.com.br/quiz/quiz-1',
    }]

    const resposta = await webhook(payloadPago())

    expect(resposta.status).toBe(200)
    expect(purchasesEnviados()).toHaveLength(1)

    const evento = corpoDoPurchase().data[0]
    expect(evento).toMatchObject({
      event_name: 'Purchase',
      event_id: `purchase_${EXTERNAL_ID}`,
      action_source: 'website',
      event_source_url: 'https://www.mindtrail.com.br/quiz/quiz-1',
      custom_data: {
        value: 297,
        currency: 'BRL',
        content_name: 'Trilha',
        content_ids: ['trilha'],
        content_type: 'product',
        source: 'quiz',
      },
    })
    expect(evento.user_data).toMatchObject({
      em: [sha256('maria@exemplo.com')],
      fn: [sha256('maria')],
      ln: [sha256('silva')],
      fbp: 'fb.1.1700000000000.123',
      fbc: 'fb.1.1700000000000.AbC',
      client_ip_address: '200.100.50.25',
      client_user_agent: 'Mozilla/5.0 (iPhone)',
    })

    const compra = supabase.tabelas.compras[0]
    expect(compra.external_id).toBe(EXTERNAL_ID)
    expect(compra.meta_purchase_enviado_em).toEqual(expect.any(String))
  })

  it('o mesmo webhook duas vezes gera um Purchase', async () => {
    await webhook(payloadPago('log_1'))
    const repetido = await webhook(payloadPago('log_1'))

    expect(repetido.status).toBe(200)
    expect(await repetido.json()).toMatchObject({ duplicate: true })
    expect(purchasesEnviados()).toHaveLength(1)
  })

  it('outro evento da mesma cobranca tambem nao gera segundo Purchase', async () => {
    await webhook(payloadPago('log_1'))
    await webhook(payloadPago('log_2'))

    expect(purchasesEnviados()).toHaveLength(1)
    expect(enviarLinkAcessoCompra).toHaveBeenCalledTimes(1)
  })

  it('venda ja liberada antes do Pixel atual nunca vai para a Meta', async () => {
    supabase.tabelas.compras = [{
      id: 'compra-antiga',
      payment_provider: 'abacatepay',
      provider_checkout_id: 'bill_123',
      access_email_sent_at: '2026-11-04T12:22:04Z',
      meta_purchase_enviado_em: null,
    }]

    const resposta = await webhook(payloadPago('log_reenviado'))

    expect(resposta.status).toBe(200)
    expect(purchasesEnviados()).toHaveLength(0)
    expect(enviarLinkAcessoCompra).not.toHaveBeenCalled()
  })

  it('cartao parcelado: value e a receita do produto, sem os juros do cliente', async () => {
    await webhook(payloadPago('log_1', { amount: 35208, paidAmount: 35208, customerFee: 5508 }))

    expect(corpoDoPurchase().data[0].custom_data.value).toBe(297)
  })

  it('sem a tabela de atribuicao, usa os cookies do metadado da cobranca', async () => {
    await webhook(payloadPago('log_1', { metadata: { fbp: 'fb.1.9.meta', source: 'lp-trilha' } }))

    const evento = corpoDoPurchase().data[0]
    expect(evento.user_data.fbp).toBe('fb.1.9.meta')
    expect(evento.event_source_url).toBe('https://www.mindtrail.com.br/compra/sucesso')
  })

  it('Meta fora do ar nao derruba a resposta nem o acesso, e nao marca envio', async () => {
    fetchMeta.mockRejectedValue(new Error('ECONNRESET'))

    const resposta = await webhook(payloadPago())

    expect(resposta.status).toBe(200)
    expect(enviarLinkAcessoCompra).toHaveBeenCalledTimes(1)
    expect(supabase.tabelas.compras[0].meta_purchase_enviado_em).toBeUndefined()
  })

  it('sem token da CAPI, libera o acesso e avisa no log', async () => {
    vi.stubEnv('META_CAPI_ACCESS_TOKEN', '')

    const resposta = await webhook(payloadPago())

    expect(resposta.status).toBe(200)
    expect(purchasesEnviados()).toHaveLength(0)
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('META_CAPI_ACCESS_TOKEN ausente'))
  })

  it('assinatura invalida e rejeitada antes de qualquer efeito', async () => {
    const resposta = await webhook(payloadPago(), 'assinatura-forjada')

    expect(resposta.status).toBe(401)
    expect(purchasesEnviados()).toHaveLength(0)
    expect(supabase.tabelas.payment_webhook_events).toBeUndefined()
  })

  it('evento que nao e checkout.completed e ignorado', async () => {
    const resposta = await webhook({ ...payloadPago(), event: 'checkout.refunded' })

    expect(resposta.status).toBe(200)
    expect(purchasesEnviados()).toHaveLength(0)
  })

  // Cenários que não envolvem a Meta, mas custam caro se quebrarem.

  it('recusa sem secret na URL ou com secret errado, antes de ler o corpo', async () => {
    const bruto = JSON.stringify(payloadPago())
    const assinatura = assinarCorpoWebhook(bruto)
    for (const url of [
      'https://www.mindtrail.com.br/api/abacatepay/webhook',
      'https://www.mindtrail.com.br/api/abacatepay/webhook?webhookSecret=outro',
    ]) {
      const resposta = await POST(
        new Request(url, { method: 'POST', headers: { 'x-webhook-signature': assinatura }, body: bruto })
      )
      expect(resposta.status).toBe(401)
    }
    expect(enviarLinkAcessoCompra).not.toHaveBeenCalled()
    expect(supabase.tabelas.payment_webhook_events ?? []).toHaveLength(0)
  })

  it('falha no e-mail devolve 500 e libera o evento para o provedor reenviar', async () => {
    vi.mocked(enviarLinkAcessoCompra).mockRejectedValueOnce(new Error('SMTP fora'))

    const resposta = await webhook(payloadPago('log_falha'))

    expect(resposta.status).toBe(500)
    expect(supabase.tabelas.payment_webhook_events ?? []).toHaveLength(0)
    expect(purchasesEnviados()).toHaveLength(0)

    // O reenvio do provedor processa normalmente.
    const reenvio = await webhook(payloadPago('log_falha'))
    expect(reenvio.status).toBe(200)
    expect(enviarLinkAcessoCompra).toHaveBeenCalledTimes(2)
  })

  it('não libera acesso para outro produto nem para cobrança não paga', async () => {
    await webhook(payloadPago('log_outro', { items: [{ id: 'outro_produto', quantity: 1 }] }))
    await webhook(payloadPago('log_pendente', { status: 'PENDING' }))

    expect(supabase.tabelas.compras ?? []).toHaveLength(0)
    expect(enviarLinkAcessoCompra).not.toHaveBeenCalled()
    expect(purchasesEnviados()).toHaveLength(0)
  })
})
