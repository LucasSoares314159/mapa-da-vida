import { randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'
import { getAbacatePay } from '@/lib/abacatepay'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const productId = process.env.ABACATEPAY_PRODUCT_ID
    if (!productId) {
      throw new Error('ABACATEPAY_PRODUCT_ID nao configurada')
    }

    const requestOrigin = new URL(request.url).origin
    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || requestOrigin).replace(/\/$/, '')
    const checkout = await getAbacatePay().createCheckout({
      items: [{ id: productId, quantity: 1 }],
      methods: ['PIX', 'CARD'],
      card: {
        maxInstallments: 12,
      },
      externalId: `trilha-produtividade-${randomUUID()}`,
      metadata: {
        produto: 'trilha-produtividade',
      },
      returnUrl: `${siteUrl}/trilha#comprar`,
      completionUrl: `${siteUrl}/compra/sucesso`,
    })

    if (!checkout.url) {
      throw new Error('AbacatePay nao retornou a URL do Checkout')
    }

    return NextResponse.redirect(checkout.url, 303)
  } catch (error) {
    console.error('[abacatepay-checkout] Falha ao criar checkout:', error)
    return NextResponse.json(
      { error: 'Nao foi possivel iniciar o pagamento. Tente novamente.' },
      { status: 500 }
    )
  }
}
