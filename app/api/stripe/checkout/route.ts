import { NextResponse } from 'next/server'
import { startCheckout, type ParamsCheckout } from '@/lib/checkout'
import { PARAMS_UTM } from '@/lib/tracking/atribuicao'

export const runtime = 'nodejs'

// Rota unica de inicio de pagamento, usada pela LP e pelo quiz.
//
// O caminho da LP (public/trilha/index.html) e um <form method="post"> sem
// corpo, e continua valendo: sem body, a rota cria a cobranca como antes. O
// quiz manda JSON com slug, perfil e atribuicao, que viram metadado da
// cobranca. Por isso a leitura do corpo e tolerante — um corpo invalido nao
// pode impedir alguem de comprar.
//
// O caminho continua em /api/stripe/ apesar de o provider ser configuravel:
// mover a URL quebraria os dois formularios da LP, que e HTML estatico. O que
// decide o provider e CHECKOUT_PROVIDER, nao o caminho da rota.

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

    // Formulario da LP: sem campos hoje, mas se ganhar inputs eles chegam aqui.
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
    // Corpo ilegivel: trata como o POST sem corpo da LP.
  }

  return { source: 'lp-trilha' }
}

export async function POST(request: Request) {
  try {
    const requestOrigin = new URL(request.url).origin
    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || requestOrigin).replace(/\/$/, '')

    const params = await lerParams(request)
    const { url } = await startCheckout(params, siteUrl)

    // O quiz chama por fetch e precisa da URL para redirecionar; a LP posta um
    // formulario e precisa do 303.
    if ((request.headers.get('content-type') ?? '').includes('application/json')) {
      return NextResponse.json({ url })
    }

    return NextResponse.redirect(url, 303)
  } catch (error) {
    console.error('[checkout] Falha ao criar sessao:', error)
    return NextResponse.json(
      { error: 'Nao foi possivel iniciar o pagamento. Tente novamente.' },
      { status: 500 }
    )
  }
}
