import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const priceId = process.env.STRIPE_PRICE_ID
    if (!priceId) {
      throw new Error('STRIPE_PRICE_ID nao configurada')
    }

    const requestOrigin = new URL(request.url).origin
    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || requestOrigin).replace(/\/$/, '')
    const session = await getStripe().checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      customer_creation: 'always',
      locale: 'pt-BR',
      success_url: `${siteUrl}/compra/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/trilha#comprar`,
      metadata: {
        produto: 'trilha-produtividade',
      },
    })

    if (!session.url) {
      throw new Error('Stripe nao retornou a URL do Checkout')
    }

    return NextResponse.redirect(session.url, 303)
  } catch (error) {
    console.error('[stripe-checkout] Falha ao criar sessao:', error)
    return NextResponse.json(
      { error: 'Nao foi possivel iniciar o pagamento. Tente novamente.' },
      { status: 500 }
    )
  }
}
