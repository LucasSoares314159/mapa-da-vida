import { createHmac } from 'node:crypto'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { enviarLinkAcessoCompra } from '@/lib/acesso-compra'
import { enviarEventoCapi } from '@/lib/tracking/capi'
import { POST } from './route'

// Webhook da AbacatePay com banco, e-mail e CAPI simulados.
//
// Cobre o que custa caro errar em produção: aceitar evento forjado, mandar o
// e-mail de acesso duas vezes, perder a compra quando o e-mail falha (o
// provedor precisa conseguir reenviar) e descasar o event_id do Purchase entre
// a CAPI e o Pixel da página de sucesso.

// Chave pública de assinatura documentada pela AbacatePay (a mesma da rota).
const CHAVE_PUBLICA =
  't9dXRhHHo3yDEj5pVDYz0frf7q6bMKyMRmxxCPIPp3RCplBfXRxqlC6ZpiWmOqj4L63qEaeUOtrCI8P0VMUgo6iIga2ri9ogaHFs0WIIywSMg0q7RmBfybe1E5XJcfC4IW3alNqym0tXoAKkzvfEjZxV6bE0oG2zJrNNYmUCKZyV0KZ3JS8Votf9EAWWYdiDkMkpbMdPggfh1EqHlVkMiTady6jOR3hyzGEHrIz2Ret0xHKMbiqkr9HS1JhNHDX9'

const SECRET = 'segredo-de-teste'
const PRODUTO = 'prod_trilha'

type Banco = {
  eventos: Set<string>
  processados: number
  compraExistente: { id: string; access_email_sent_at: string | null } | null
  upserts: Record<string, unknown>[]
}

const banco: Banco = { eventos: new Set(), processados: 0, compraExistente: null, upserts: [] }

// Builder encadeável mínimo: .eq().eq() e depois await.
function filtro(efeito: () => void) {
  const f = {
    eq: () => f,
    then: (resolve: (v: { error: null }) => void) => {
      efeito()
      resolve({ error: null })
    },
  }
  return f
}

vi.mock('@/lib/supabase-admin', () => ({
  createAdminSupabaseClient: () => ({
    from(tabela: string) {
      if (tabela === 'payment_webhook_events') {
        return {
          insert: async (linha: { event_id: string }) => {
            if (banco.eventos.has(linha.event_id)) return { error: { code: '23505' } }
            banco.eventos.add(linha.event_id)
            return { error: null }
          },
          update: () => filtro(() => { banco.processados += 1 }),
          delete: () => filtro(() => banco.eventos.clear()),
        }
      }
      return {
        select: () => ({
          eq: () => ({
            eq: () => ({
              maybeSingle: async () => ({ data: banco.compraExistente, error: null }),
            }),
          }),
        }),
        upsert: (linha: Record<string, unknown>) => {
          banco.upserts.push(linha)
          return { select: () => ({ single: async () => ({ data: { id: 'compra_1' }, error: null }) }) }
        },
      }
    },
  }),
}))

vi.mock('@/lib/acesso-compra', () => ({
  enviarLinkAcessoCompra: vi.fn(),
  normalizarEmail: (email: string) => email.trim().toLowerCase(),
}))

vi.mock('@/lib/tracking/capi', () => ({
  capiConfigurada: () => true,
  enviarEventoCapi: vi.fn(),
  eventIdDaCompra: (id: string) => `purchase_${id}`,
}))

function evento(sobrescrever: Record<string, unknown> = {}, checkout: Record<string, unknown> = {}) {
  return {
    id: 'evt_1',
    event: 'checkout.completed',
    devMode: false,
    data: {
      checkout: {
        id: 'bill_1',
        externalId: 'trilha-produtividade-abc',
        status: 'PAID',
        amount: 29700,
        paidAmount: 29700,
        items: [{ id: PRODUTO, quantity: 1 }],
        metadata: { source: 'quiz', quiz_slug: 'quiz-1', fbp: 'fb.1.1.1' },
        ...checkout,
      },
      customer: { name: 'Ana', email: '  Ana@Exemplo.com ' },
      payerInformation: { method: 'PIX' },
    },
    ...sobrescrever,
  }
}

function requisicao(
  corpo: unknown,
  { secret = SECRET, assinatura }: { secret?: string | null; assinatura?: string } = {}
) {
  const raw = JSON.stringify(corpo)
  const sig = assinatura ?? createHmac('sha256', CHAVE_PUBLICA).update(raw).digest('base64')
  const url = new URL('https://www.mindtrail.com.br/api/abacatepay/webhook')
  if (secret) url.searchParams.set('webhookSecret', secret)
  return new Request(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-webhook-signature': sig },
    body: raw,
  })
}

describe('webhook AbacatePay', () => {
  beforeEach(() => {
    vi.stubEnv('ABACATEPAY_WEBHOOK_SECRET', SECRET)
    vi.stubEnv('ABACATEPAY_PRODUCT_ID', PRODUTO)
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://www.mindtrail.com.br/')
    banco.eventos.clear()
    banco.processados = 0
    banco.compraExistente = null
    banco.upserts = []
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.unstubAllEnvs()
  })

  it('recusa sem secret, com secret errado e com assinatura inválida', async () => {
    expect((await POST(requisicao(evento(), { secret: null }))).status).toBe(401)
    expect((await POST(requisicao(evento(), { secret: 'outro' }))).status).toBe(401)
    expect((await POST(requisicao(evento(), { assinatura: 'AAAA' }))).status).toBe(401)
    expect(enviarLinkAcessoCompra).not.toHaveBeenCalled()
  })

  it('ignora eventos que não são checkout.completed sem tocar no banco', async () => {
    const resposta = await POST(requisicao(evento({ event: 'checkout.refunded' })))
    expect(resposta.status).toBe(200)
    expect(banco.eventos.size).toBe(0)
  })

  it('registra a compra, envia o acesso e manda o Purchase com o id da página de sucesso', async () => {
    const resposta = await POST(requisicao(evento()))

    expect(resposta.status).toBe(200)
    expect(banco.upserts[0]).toMatchObject({
      provider_checkout_id: 'bill_1',
      email: 'ana@exemplo.com',
      amount_total: 29700,
      payment_method: 'PIX',
      status: 'pago',
    })
    expect(enviarLinkAcessoCompra).toHaveBeenCalledWith('compra_1', 'ana@exemplo.com')
    // A página de sucesso recebe ?checkout_ref=<externalId> e o Pixel usa
    // purchase_<checkout_ref>: os dois lados precisam bater para a Meta deduplicar.
    expect(enviarEventoCapi).toHaveBeenCalledWith(
      expect.objectContaining({
        nome: 'Purchase',
        eventId: 'purchase_trilha-produtividade-abc',
        valor: 297,
        sourceUrl: 'https://www.mindtrail.com.br/compra/sucesso',
      })
    )
    expect(banco.processados).toBe(1)
  })

  it('não reenvia o e-mail quando o provedor repete o mesmo evento', async () => {
    await POST(requisicao(evento()))
    const repetido = await POST(requisicao(evento()))

    expect(await repetido.json()).toMatchObject({ duplicate: true })
    expect(enviarLinkAcessoCompra).toHaveBeenCalledTimes(1)
  })

  it('não reenvia o e-mail quando outro evento chega para compra já atendida', async () => {
    banco.compraExistente = { id: 'compra_1', access_email_sent_at: '2026-11-08T10:00:00Z' }
    const resposta = await POST(requisicao(evento({ id: 'evt_2' })))

    expect(resposta.status).toBe(200)
    expect(enviarLinkAcessoCompra).not.toHaveBeenCalled()
  })

  it('libera o evento para nova tentativa quando o e-mail falha', async () => {
    vi.mocked(enviarLinkAcessoCompra).mockRejectedValueOnce(new Error('SMTP fora'))
    vi.spyOn(console, 'error').mockImplementation(() => {})

    const resposta = await POST(requisicao(evento()))

    expect(resposta.status).toBe(500)
    expect(banco.eventos.size).toBe(0)
    expect(enviarEventoCapi).not.toHaveBeenCalled()
  })

  it('não libera acesso para outro produto nem para checkout não pago', async () => {
    await POST(requisicao(evento({}, { items: [{ id: 'outro', quantity: 1 }] })))
    await POST(requisicao(evento({ id: 'evt_3' }, { status: 'PENDING' })))

    expect(banco.upserts).toHaveLength(0)
    expect(enviarLinkAcessoCompra).not.toHaveBeenCalled()
  })

  it('falha da CAPI não derruba o webhook', async () => {
    vi.mocked(enviarEventoCapi).mockRejectedValueOnce(new Error('Meta fora'))
    vi.spyOn(console, 'error').mockImplementation(() => {})

    const resposta = await POST(requisicao(evento()))

    expect(resposta.status).toBe(200)
    expect(enviarLinkAcessoCompra).toHaveBeenCalledTimes(1)
  })
})
