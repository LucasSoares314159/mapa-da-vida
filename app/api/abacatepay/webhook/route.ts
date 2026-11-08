import { NextResponse } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { assinaturaWebhookValida, compararSegredo } from '@/lib/abacatepay'
import { enviarLinkAcessoCompra, normalizarEmail } from '@/lib/acesso-compra'
import { buscarAtribuicaoCheckout } from '@/lib/checkout/atribuicao-checkout'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'
import { capiConfigurada, enviarEventoCapi } from '@/lib/tracking/capi'
import {
  CONTEUDO_TRILHA,
  MOEDA_TRILHA,
  eventIdDaCompra,
  receitaDoProdutoEmReais,
} from '@/lib/tracking/purchase'

export const runtime = 'nodejs'

type CheckoutItem = {
  id?: unknown
  quantity?: unknown
}

type AbacatePayEvent = {
  id?: unknown
  event?: unknown
  devMode?: unknown
  data?: {
    checkout?: {
      id?: unknown
      externalId?: unknown
      status?: unknown
      amount?: unknown
      paidAmount?: unknown
      /** Taxa do cartao repassada ao cliente; null no PIX. */
      customerFee?: unknown
      customerId?: unknown
      receiptUrl?: unknown
      installmentsCount?: unknown
      updatedAt?: unknown
      items?: CheckoutItem[]
      metadata?: Record<string, unknown>
    }
    customer?: {
      name?: unknown
      email?: unknown
      // Fora do payload documentado da v2. Lido se um dia vier, para o `ph`.
      cellphone?: unknown
      phone?: unknown
    } | null
    payerInformation?: {
      method?: unknown
    }
  }
}

type Checkout = NonNullable<NonNullable<AbacatePayEvent['data']>['checkout']>

function texto(valor: unknown): string | undefined {
  return typeof valor === 'string' && valor.trim() ? valor.trim() : undefined
}

function metadataString(metadata: Record<string, unknown> | undefined, chave: string) {
  return texto(metadata?.[chave])
}

async function processarCheckoutPago(payload: AbacatePayEvent): Promise<void> {
  const checkout = payload.data?.checkout
  const customer = payload.data?.customer
  const productId = process.env.ABACATEPAY_PRODUCT_ID

  if (!checkout || checkout.status !== 'PAID') return
  if (!productId) throw new Error('ABACATEPAY_PRODUCT_ID nao configurada')
  if (typeof checkout.id !== 'string') throw new Error('Checkout sem identificador')

  const produtoCorreto = checkout.items?.some((item) => item.id === productId)
  if (!produtoCorreto) return

  if (!customer || typeof customer.email !== 'string') {
    throw new Error(`Checkout ${checkout.id} sem email do cliente`)
  }

  const email = normalizarEmail(customer.email)
  const supabase = createAdminSupabaseClient()
  const { data: compraExistente, error: existingError } = await supabase
    .from('compras')
    .select('id, access_email_sent_at')
    .eq('payment_provider', 'abacatepay')
    .eq('provider_checkout_id', checkout.id)
    .maybeSingle()

  if (existingError) {
    throw new Error(`Falha ao consultar compra: ${existingError.message}`)
  }
  // Compra ja liberada: e um reenvio. Sai antes do Purchase de proposito — o
  // Purchase so e enviado no processamento que libera o acesso. E o que mantem
  // as vendas anteriores ao Pixel atual (31/10 e 04/11/2026, sem atribuicao)
  // fora da Meta, mesmo que o provedor volte a mandar o evento delas.
  if (compraExistente?.access_email_sent_at) return

  const nomeCliente = typeof customer.name === 'string' ? customer.name : null
  const amountTotal = typeof checkout.paidAmount === 'number'
    ? checkout.paidAmount
    : typeof checkout.amount === 'number'
      ? checkout.amount
      : null
  const customerId = typeof checkout.customerId === 'string' ? checkout.customerId : null
  const paymentMethod = typeof payload.data?.payerInformation?.method === 'string'
    ? payload.data.payerInformation.method
    : null
  const installmentsCount = typeof checkout.installmentsCount === 'number'
    ? checkout.installmentsCount
    : null
  const receiptUrl = typeof checkout.receiptUrl === 'string' ? checkout.receiptUrl : null
  const paidAt = typeof checkout.updatedAt === 'string'
    ? checkout.updatedAt
    : new Date().toISOString()

  const { data: compra, error: compraError } = await supabase
    .from('compras')
    .upsert(
      {
        payment_provider: 'abacatepay',
        provider_checkout_id: checkout.id,
        provider_customer_id: customerId,
        external_id: texto(checkout.externalId) ?? null,
        produto: 'trilha-produtividade',
        email,
        nome_cliente: nomeCliente,
        amount_total: amountTotal,
        currency: 'brl',
        payment_method: paymentMethod,
        installments_count: installmentsCount,
        receipt_url: receiptUrl,
        dev_mode: payload.devMode === true,
        status: 'pago',
        paid_at: paidAt,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'payment_provider,provider_checkout_id' }
    )
    .select('id, meta_purchase_enviado_em')
    .single()

  if (compraError || !compra) {
    throw new Error(`Falha ao registrar compra: ${compraError?.message ?? 'sem retorno'}`)
  }

  await enviarLinkAcessoCompra(compra.id, email)

  // Depois do e-mail: o acesso e o que a pessoa pagou para ter. O Purchase e
  // efeito colateral — nunca lanca, e espera a Meta por no maximo ~4s.
  await registrarPurchase(supabase, {
    compraId: compra.id,
    jaEnviado: Boolean(compra.meta_purchase_enviado_em),
    checkout,
    customer,
    email,
    paidAt,
  })
}

/** Momento do pagamento, nunca no futuro (relogio do provedor adiantado). */
function momentoDoPagamento(paidAt: string): Date {
  const data = new Date(paidAt)
  const agora = new Date()
  return Number.isNaN(data.getTime()) || data > agora ? agora : data
}

async function registrarPurchase(
  supabase: SupabaseClient,
  contexto: {
    compraId: string
    jaEnviado: boolean
    checkout: Checkout
    customer: NonNullable<NonNullable<AbacatePayEvent['data']>['customer']>
    email: string
    paidAt: string
  }
): Promise<void> {
  const { compraId, jaEnviado, checkout, customer, email, paidAt } = contexto

  try {
    // Reprocessamento depois de um envio bem-sucedido (ex.: o e-mail saiu, mas
    // gravar o status falhou e o provedor reenviou). Um Purchase por compra.
    if (jaEnviado) return

    if (!capiConfigurada()) {
      // Sem este aviso a CAPI ficou desligada por semanas sem ninguem notar.
      console.warn('[abacatepay-webhook] META_CAPI_ACCESS_TOKEN ausente; Purchase nao enviado a Meta')
      return
    }

    const externalId = texto(checkout.externalId)
    const referencia = externalId ?? (checkout.id as string)
    const atribuicao = externalId ? await buscarAtribuicaoCheckout(externalId) : null
    const metadata = checkout.metadata
    const valor = receitaDoProdutoEmReais(checkout)
    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? '').replace(/\/$/, '')

    if (valor === undefined) {
      console.warn(`[abacatepay-webhook] Checkout ${referencia} sem valor legivel; Purchase vai sem value`)
    }

    const source = atribuicao?.source ?? metadataString(metadata, 'source') ?? 'lp-trilha'
    const quizSlug = metadataString(metadata, 'quiz_slug')
    const resultProfile = metadataString(metadata, 'result_profile')

    const enviado = await enviarEventoCapi({
      nome: 'Purchase',
      eventId: eventIdDaCompra(referencia),
      ocorridoEm: momentoDoPagamento(paidAt),
      usuario: {
        email,
        nome: texto(customer.name),
        telefone: texto(customer.cellphone) ?? texto(customer.phone),
        externalId: texto(checkout.customerId),
        pais: 'br',
        ip: atribuicao?.ip,
        userAgent: atribuicao?.userAgent,
        // Tabela nossa primeiro; metadado da cobranca cobre checkouts criados
        // antes dela existir.
        fbp: atribuicao?.fbp ?? metadataString(metadata, 'fbp'),
        fbc: atribuicao?.fbc ?? metadataString(metadata, 'fbc'),
      },
      valor,
      moeda: MOEDA_TRILHA,
      sourceUrl: atribuicao?.sourceUrl ?? (siteUrl ? `${siteUrl}/compra/sucesso` : undefined),
      customData: {
        ...CONTEUDO_TRILHA,
        source,
        ...(quizSlug ? { quiz_slug: quizSlug } : {}),
        ...(resultProfile ? { result_profile: resultProfile } : {}),
      },
    })

    if (!enviado) return

    const { error } = await supabase
      .from('compras')
      .update({ meta_purchase_enviado_em: new Date().toISOString() })
      .eq('id', compraId)

    if (error) {
      console.error('[abacatepay-webhook] Purchase enviado, mas falhou ao marcar a compra:', error.message)
    }
  } catch (error) {
    console.error('[abacatepay-webhook] Purchase da CAPI falhou:', error)
  }
}

export async function POST(request: Request) {
  const webhookSecret = process.env.ABACATEPAY_WEBHOOK_SECRET
  const receivedSecret = new URL(request.url).searchParams.get('webhookSecret')
  const signature = request.headers.get('x-webhook-signature')

  if (!webhookSecret || !receivedSecret || !signature) {
    return NextResponse.json({ error: 'Webhook nao configurado' }, { status: 401 })
  }
  if (!compararSegredo(receivedSecret, webhookSecret)) {
    return NextResponse.json({ error: 'Webhook nao autorizado' }, { status: 401 })
  }

  const rawBody = await request.text()
  if (!assinaturaWebhookValida(rawBody, signature)) {
    return NextResponse.json({ error: 'Assinatura invalida' }, { status: 401 })
  }

  let payload: AbacatePayEvent
  try {
    payload = JSON.parse(rawBody) as AbacatePayEvent
  } catch {
    return NextResponse.json({ error: 'Payload invalido' }, { status: 400 })
  }

  if (payload.event !== 'checkout.completed') {
    return NextResponse.json({ received: true })
  }
  if (typeof payload.id !== 'string') {
    return NextResponse.json({ error: 'Evento sem identificador' }, { status: 400 })
  }

  const supabase = createAdminSupabaseClient()
  const { error: claimError } = await supabase.from('payment_webhook_events').insert({
    provider: 'abacatepay',
    event_id: payload.id,
    event_type: payload.event,
  })

  if (claimError?.code === '23505') {
    return NextResponse.json({ received: true, duplicate: true })
  }
  if (claimError) {
    console.error('[abacatepay-webhook] Falha ao registrar evento:', claimError)
    return NextResponse.json({ error: 'Falha ao registrar evento' }, { status: 500 })
  }

  try {
    await processarCheckoutPago(payload)

    await supabase
      .from('payment_webhook_events')
      .update({ processed_at: new Date().toISOString() })
      .eq('provider', 'abacatepay')
      .eq('event_id', payload.id)

    return NextResponse.json({ received: true })
  } catch (error) {
    await supabase
      .from('payment_webhook_events')
      .delete()
      .eq('provider', 'abacatepay')
      .eq('event_id', payload.id)
    console.error('[abacatepay-webhook] Falha ao processar evento:', error)
    return NextResponse.json({ error: 'Falha ao processar evento' }, { status: 500 })
  }
}
