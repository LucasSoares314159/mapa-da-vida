import Stripe from 'stripe'
import { NextResponse } from 'next/server'
import { enviarLinkAcessoCompra, normalizarEmail } from '@/lib/acesso-compra'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'
import { getStripe } from '@/lib/stripe'

export const runtime = 'nodejs'

function stripeId(value: string | { id: string } | null): string | null {
  if (!value) return null
  return typeof value === 'string' ? value : value.id
}
async function processarCheckoutPago(session: Stripe.Checkout.Session): Promise<void> {
  if (session.payment_status !== 'paid') return
  if (session.metadata?.produto !== 'trilha-produtividade') return

  const rawEmail = session.customer_details?.email ?? session.customer_email
  if (!rawEmail) {
    throw new Error(`Checkout ${session.id} sem email do cliente`)
  }

  const email = normalizarEmail(rawEmail)
  const supabase = createAdminSupabaseClient()
  const { data: compraExistente, error: existingError } = await supabase
    .from('compras')
    .select('id, access_email_sent_at')
    .eq('stripe_checkout_session_id', session.id)
    .maybeSingle()

  if (existingError) {
    throw new Error(`Falha ao consultar compra: ${existingError.message}`)
  }
  if (compraExistente?.access_email_sent_at) return

  const { data: compra, error: compraError } = await supabase
    .from('compras')
    .upsert(
      {
        stripe_checkout_session_id: session.id,
        stripe_payment_intent_id: stripeId(session.payment_intent),
        stripe_customer_id: stripeId(session.customer),
        produto: 'trilha-produtividade',
        email,
        nome_cliente: session.customer_details?.name ?? null,
        amount_total: session.amount_total,
        currency: session.currency,
        status: 'pago',
        paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'stripe_checkout_session_id' }
    )
    .select('id')
    .single()

  if (compraError || !compra) {
    throw new Error(`Falha ao registrar compra: ${compraError?.message ?? 'sem retorno'}`)
  }

  await enviarLinkAcessoCompra(compra.id, email)
}
export async function POST(request: Request) {
  const signature = request.headers.get('stripe-signature')
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: 'Webhook nao configurado' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    const rawBody = await request.text()
    event = getStripe().webhooks.constructEvent(rawBody, signature, webhookSecret)
  } catch (error) {
    console.error('[stripe-webhook] Assinatura invalida:', error)
    return NextResponse.json({ error: 'Assinatura invalida' }, { status: 400 })
  }

  if (
    event.type !== 'checkout.session.completed' &&
    event.type !== 'checkout.session.async_payment_succeeded'
  ) {
    return NextResponse.json({ received: true })
  }

  const supabase = createAdminSupabaseClient()
  const { error: claimError } = await supabase.from('stripe_webhook_events').insert({
    event_id: event.id,
    event_type: event.type,
  })

  if (claimError?.code === '23505') {
    return NextResponse.json({ received: true, duplicate: true })
  }
  if (claimError) {
    console.error('[stripe-webhook] Falha ao registrar evento:', claimError)
    return NextResponse.json({ error: 'Falha ao registrar evento' }, { status: 500 })
  }

  try {
    await processarCheckoutPago(event.data.object as Stripe.Checkout.Session)

    await supabase
      .from('stripe_webhook_events')
      .update({ processed_at: new Date().toISOString() })
      .eq('event_id', event.id)

    return NextResponse.json({ received: true })
  } catch (error) {
    await supabase.from('stripe_webhook_events').delete().eq('event_id', event.id)
    console.error('[stripe-webhook] Falha ao processar evento:', error)
    return NextResponse.json({ error: 'Falha ao processar evento' }, { status: 500 })
  }
}
