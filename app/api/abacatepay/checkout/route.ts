import { randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'
import { contextoDaRequisicao, startCheckout, type ParamsCheckout } from '@/lib/checkout'
import { PARAMS_UTM } from '@/lib/tracking/atribuicao'

export const runtime = 'nodejs'

// Medicao do tempo do checkout (clique -> URL de pagamento), visivel no log da
// Vercel e no header Server-Timing. `fria` marca a primeira invocacao do modulo
// naquela instancia: e o cold start, que separa "a funcao demorou para subir"
// de "a AbacatePay demorou para responder".
const modulosCarregadoEm = Date.now()
let invocacoes = 0

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

/**
 * Volta da AbacatePay para a LP sem perder a origem do clique.
 *
 * Montado aqui a partir dos UTMs ja validados, e nao aceito do form: um caminho
 * livre vindo do browser viraria redirect arbitrario na volta do provedor.
 */
function cancelPathTrilha(utm: Record<string, string | undefined>): string {
  const query = new URLSearchParams()
  for (const chave of PARAMS_UTM) {
    const valor = utm[chave]
    if (valor) query.set(chave, valor)
  }
  const busca = query.toString()
  return `/trilha${busca ? `?${busca}` : ''}#comprar`
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
        cancelPath: cancelPathTrilha(utm),
      }
    }
  } catch {
    // Corpo ausente ou ilegivel: mantem o fluxo da landing page estatica.
  }

  return { source: 'lp-trilha' }
}

async function iniciarCheckout(request: Request) {
  const inicio = performance.now()
  const fria = invocacoes++ === 0
  const tempos: Record<string, number> = {}
  const ms = (n: number) => Math.round(n)

  function medicao(): Record<string, number | boolean> {
    const total = performance.now() - inicio
    return {
      fria,
      instanciaAtivaHaMs: fria ? 0 : Date.now() - modulosCarregadoEm,
      total: ms(total),
      ...Object.fromEntries(Object.entries(tempos).map(([k, v]) => [k, ms(v)])),
    }
  }

  function serverTiming() {
    const m = medicao()
    return [
      `total;dur=${m.total}`,
      `provedor;dur=${m.provedor ?? 0}`,
      `atribuicao;dur=${m.atribuicao ?? 0}`,
      `leitura;dur=${m.leitura ?? 0}`,
      `fria;desc="${fria}"`,
    ].join(', ')
  }

  try {
    const requestOrigin = new URL(request.url).origin
    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || requestOrigin).replace(/\/$/, '')
    const params = await lerParams(request)
    tempos.leitura = performance.now() - inicio
    const { cliente, cookies } = contextoDaRequisicao(request)
    const { url } = await startCheckout(
      {
        ...params,
        // O form/JSON ganha: le o cookie no browser, inclusive o _fbc derivado
        // do fbclid. O cookie da requisicao cobre quem chegou sem os campos.
        fbp: params.fbp ?? cookies.fbp,
        fbc: params.fbc ?? cookies.fbc,
        cliente,
      },
      siteUrl,
      tempos
    )

    // Uma linha so, para a Vercel preservar os campos no mesmo registro.
    console.info('[abacatepay-checkout-tempo]', JSON.stringify({ origem: params.source, ...medicao() }))
    const cabecalhos = { 'Server-Timing': serverTiming() }

    if ((request.headers.get('content-type') ?? '').includes('application/json')) {
      return NextResponse.json({ url }, { headers: cabecalhos })
    }

    const redirecionamento = NextResponse.redirect(url, 303)
    redirecionamento.headers.set('Server-Timing', cabecalhos['Server-Timing'])
    return redirecionamento
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
        cardEnabled: process.env.ABACATEPAY_CARD_ENABLED?.trim().toLowerCase() === 'true',
        provider: process.env.CHECKOUT_PROVIDER ?? 'abacatepay',
      },
      tempos: medicao(),
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
