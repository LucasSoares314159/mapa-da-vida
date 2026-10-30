import { createHmac, timingSafeEqual } from 'crypto'
import { NextResponse } from 'next/server'
import { enviarLinkAcessoCompra, normalizarEmail } from '@/lib/acesso-compra'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'
import { capiConfigurada, enviarEventoCapi, eventIdDaCompra } from '@/lib/tracking/capi'

export const runtime = 'nodejs'

const ABACATEPAY_PUBLIC_KEY =
  't9dXRhHHo3yDEj5pVDYz0frf7q6bMKyMRmxxCPIPp3RCplBfXRxqlC6ZpiWmOqj4L63qEaeUOtrCI8P0VMUgo6iIga2ri9ogaHFs0WIIywSMg0q7RmBfybe1E5XJcfC4IW3alNqym0tXoAKkzvfEjZxV6bE0oG2zJrNNYmUCKZyV0KZ3JS8Votf9EAWWYdiDkMkpbMdPggfh1EqHlVkMiTady6jOR3hyzGEHrIz2Ret0xHKMbiqkr9HS1JhNHDX9'

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
    } | null
    payerInformation?: {
      method?: unknown
    }
  }
}

function compararSegredo(recebido: string, esperado: string): boolean {
  const recebidoBuffer = Buffer.from(recebido)
  const esperadoBuffer = Buffer.from(esperado)

  return (
    recebidoBuffer.length === esperadoBuffer.length &&
    timingSafeEqual(recebidoBuffer, esperadoBuffer)
  )
}

function assinaturaValida(rawBody: string, assinatura: string): boolean {
  const esperada = createHmac('sha256', ABACATEPAY_PUBLIC_KEY)
    .update(Buffer.from(rawBody, 'utf8'))
    .digest('base64')

  return compararSegredo(assinatura, esperada)
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
    .select('id')
    .single()

  if (compraError || !compra) {
    throw new Error(`Falha ao registrar compra: ${compraError?.message ?? 'sem retorno'}`)
  }

  await enviarLinkAcessoCompra(compra.id, email)
  await registrarPurchase(payload, email)
}

function metadataString(metadata: Record<string, unknown> | undefined, chave: string) {
  const valor = metadata?.[chave]
  return typeof valor === 'string' ? valor : undefined
}

async function registrarPurchase(payload: AbacatePayEvent, email: string): Promise<void> {
  if (!capiConfigurada()) return

  const checkout = payload.data?.checkout
  if (!checkout || typeof checkout.id !== 'string') return

  const metadata = checkout.metadata
  const referencia = typeof checkout.externalId === 'string'
    ? checkout.externalId
    : checkout.id
  const amount = typeof checkout.paidAmount === 'number'
    ? checkout.paidAmount
    : typeof checkout.amount === 'number'
      ? checkout.amount
      : undefined
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? '').replace(/\/$/, '')

  try {
    await enviarEventoCapi({
      nome: 'Purchase',
      eventId: eventIdDaCompra(referencia),
      email,
      fbp: metadataString(metadata, 'fbp'),
      fbc: metadataString(metadata, 'fbc'),
      valor: amount !== undefined ? amount / 100 : undefined,
      moeda: 'BRL',
      sourceUrl: siteUrl ? `${siteUrl}/compra/sucesso` : undefined,
      customData: {
        source: metadataString(metadata, 'source') ?? 'lp-trilha',
        ...(metadataString(metadata, 'quiz_slug')
          ? { quiz_slug: metadataString(metadata, 'quiz_slug') as string }
          : {}),
        ...(metadataString(metadata, 'result_profile')
          ? { result_profile: metadataString(metadata, 'result_profile') as string }
          : {}),
      },
    })
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
  if (!assinaturaValida(rawBody, signature)) {
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

