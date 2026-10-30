import { NextResponse } from 'next/server'
import { startCheckout, type ParamsCheckout } from '@/lib/checkout'
import { PARAMS_UTM } from '@/lib/tracking/atribuicao'

export const runtime = 'nodejs'

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

export async function POST(request: Request) {
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
    console.error('[abacatepay-checkout] Falha ao criar checkout:', error)
    return NextResponse.json(
      { error: 'Nao foi possivel iniciar o pagamento. Tente novamente.' },
      { status: 500 }
    )
  }
}
