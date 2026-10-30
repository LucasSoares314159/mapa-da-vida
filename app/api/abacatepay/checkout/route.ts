import { randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'
import { startCheckout, type ParamsCheckout } from '@/lib/checkout'
import { PARAMS_UTM } from '@/lib/tracking/atribuicao'

export const runtime = 'nodejs'

type ErroComDetalhes = Error & {
  status?: unknown
  code?: unknown
  cause?: unknown
}

function detalhesDoErro(error: unknown) {
  if (!(error instanceof Error)) {
    return {
      name: 'UnknownError',
      message: String(error),
      type: typeof error,
    }
  }

  const erro = error as ErroComDetalhes
  const cause = erro.cause instanceof Error
    ? { name: erro.cause.name, message: erro.cause.message }
    : undefined

  return {
    name: erro.name,
    message: erro.message,
    status: typeof erro.status === 'number' ? erro.status : undefined,
    code: typeof erro.code === 'string' ? erro.code : undefined,
    cause,
    stack: erro.stack,
  }
}

function texto(valor: unknown): string | undefined {
  return typeof valor === 'string' && valor.trim() ? valor.trim() : undefined
}

async function lerParams(request: Request): Promise<ParamsCheckout> {
  const tipo = request.headers.get('content-type') ?? ''

  try {
    if (tipo.includes('application/json')) {
      const corpo = (await request.json()) as Record<string, unknown>
      const utmBruto = (corpo.utm ?? {}) as Record<string, unknown>
      const utm: Record<string, string | undefined> = {}

      for (const chave of PARAMS_UTM) {
        utm[chave] = texto(utmBruto[chave])
      }

      return {
        source: texto(corpo.source) === 'quiz' ? 'quiz' : 'lp-trilha',
        quizSlug: texto(corpo.quizSlug),
        resultProfile: texto(corpo.resultProfile),
        utm,
        fbp: texto(corpo.fbp),
        fbc: texto(corpo.fbc),
        cancelPath: texto(corpo.cancelPath),
      }
    }

    if (tipo.includes('form')) {
      const form = await request.formData()
      const utm: Record<string, string | undefined> = {}

      for (const chave of PARAMS_UTM) {
        utm[chave] = texto(form.get(chave))
      }

      return {
        source: 'lp-trilha',
        utm,
        fbp: texto(form.get('fbp')),
        fbc: texto(form.get('fbc')),
      }
    }
  } catch {
    // Corpo ausente ou ilegivel: mantem o fluxo da landing page estatica.
  }

  return { source: 'lp-trilha' }
}

async function iniciarCheckout(request: Request) {
  try {
    const requestOrigin = new URL(request.url).origin
    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || requestOrigin).replace(/\/$/, '')
    const params = await lerParams(request)
    const { url } = await startCheckout(params, siteUrl)

    if ((request.headers.get('content-type') ?? '').includes('application/json')) {
      return NextResponse.json({ url })
    }

    return NextResponse.redirect(url, 303)
  } catch (error) {
    const errorId = randomUUID()
    const requestUrl = new URL(request.url)

    // String unica para a Vercel preservar todos os campos no mesmo registro.
    // Somente presenca de configuracao e registrada; valores secretos nunca saem.
    console.error('[abacatepay-checkout]', JSON.stringify({
      event: 'checkout_creation_failed',
      errorId,
      method: request.method,
      path: requestUrl.pathname,
      origin: requestUrl.origin,
      contentType: request.headers.get('content-type'),
      vercelId: request.headers.get('x-vercel-id'),
      config: {
        apiKeyConfigured: Boolean(process.env.ABACATEPAY_API_KEY),
        productIdConfigured: Boolean(process.env.ABACATEPAY_PRODUCT_ID),
        provider: process.env.CHECKOUT_PROVIDER ?? 'abacatepay',
      },
      error: detalhesDoErro(error),
    }))

    return NextResponse.json(
      {
        error: 'Nao foi possivel iniciar o pagamento. Tente novamente.',
        errorId,
      },
      { status: 500 }
    )
  }
}

// Alguns CTAs e links externos podem abrir a rota como uma navegacao direta.
// GET e POST compartilham o mesmo fluxo; requisicoes JSON continuam recebendo
// a URL, enquanto navegacoes do browser recebem o redirect 303.
export const GET = iniciarCheckout
export const POST = iniciarCheckout
