import { createAdminSupabaseClient } from '@/lib/supabase-admin'
import type { ContextoCliente, ParamsCheckout } from './tipos'

// Atribuicao da cobranca, guardada do nosso lado.
//
// O Purchase da CAPI so casa com o anuncio se levar fbp/fbc, IP e user agent de
// quem clicou. Nada disso existe no webhook: ele vem do servidor do provedor.
// Antes os cookies iam so no metadado da cobranca, mas o payload documentado do
// checkout.completed nao garante devolver o metadado — e IP/user agent nem
// deveriam ir para o provedor. Gravando aqui, no momento da criacao, o webhook
// recupera tudo pelo externalId.
//
// Nunca bloqueia a compra: falhar ao gravar so empobrece o tracking.

const TAMANHO_MAXIMO = 1000

function limitar(valor: string | null | undefined): string | undefined {
  const limpo = valor?.trim()
  return limpo ? limpo.slice(0, TAMANHO_MAXIMO) : undefined
}

function lerCookie(cabecalho: string | null, nome: string): string | undefined {
  if (!cabecalho) return undefined
  for (const parte of cabecalho.split(';')) {
    const [chave, ...resto] = parte.trim().split('=')
    if (chave === nome) {
      try {
        return limitar(decodeURIComponent(resto.join('=')))
      } catch {
        return limitar(resto.join('='))
      }
    }
  }
  return undefined
}

function urlHttp(valor: string | null): string | undefined {
  if (!valor) return undefined
  try {
    const url = new URL(valor)
    return url.protocol === 'https:' || url.protocol === 'http:' ? limitar(url.toString()) : undefined
  } catch {
    return undefined
  }
}

/**
 * Le da requisicao de checkout os sinais do navegador.
 *
 * Os cookies _fbp/_fbc chegam sozinhos (a rota e do mesmo dominio da LP e do
 * quiz) e servem de reserva para quando o form ou o JSON nao os trouxe.
 */
export function contextoDaRequisicao(request: Request): {
  cliente: ContextoCliente
  cookies: { fbp?: string; fbc?: string }
} {
  const cabecalhos = request.headers
  // Na Vercel o primeiro IP de x-forwarded-for e o do cliente.
  const ip = limitar(cabecalhos.get('x-forwarded-for')?.split(',')[0])
    ?? limitar(cabecalhos.get('x-real-ip'))
  const cookie = cabecalhos.get('cookie')

  return {
    cliente: {
      ip: ip && ip.length <= 64 ? ip : undefined,
      userAgent: limitar(cabecalhos.get('user-agent')),
      sourceUrl: urlHttp(cabecalhos.get('referer')),
    },
    cookies: {
      fbp: lerCookie(cookie, '_fbp'),
      fbc: lerCookie(cookie, '_fbc'),
    },
  }
}

export async function gravarAtribuicaoCheckout(
  externalId: string,
  provider: string,
  params: ParamsCheckout
): Promise<void> {
  try {
    const { error } = await createAdminSupabaseClient().from('checkout_atribuicao').insert({
      external_id: externalId,
      payment_provider: provider,
      source: params.source,
      fbp: params.fbp ?? null,
      fbc: params.fbc ?? null,
      client_ip: params.cliente?.ip ?? null,
      client_user_agent: params.cliente?.userAgent ?? null,
      source_url: params.cliente?.sourceUrl ?? null,
    })

    if (error) console.error('[checkout-atribuicao] Falha ao gravar:', error.message)
  } catch (error) {
    console.error('[checkout-atribuicao] Falha ao gravar:', error)
  }
}

export type AtribuicaoCheckout = {
  source?: string
  fbp?: string
  fbc?: string
  ip?: string
  userAgent?: string
  sourceUrl?: string
}

export async function buscarAtribuicaoCheckout(
  externalId: string
): Promise<AtribuicaoCheckout | null> {
  try {
    const { data, error } = await createAdminSupabaseClient()
      .from('checkout_atribuicao')
      .select('source, fbp, fbc, client_ip, client_user_agent, source_url')
      .eq('external_id', externalId)
      .maybeSingle()

    if (error) {
      console.error('[checkout-atribuicao] Falha ao consultar:', error.message)
      return null
    }
    if (!data) return null

    return {
      source: data.source ?? undefined,
      fbp: data.fbp ?? undefined,
      fbc: data.fbc ?? undefined,
      ip: data.client_ip ?? undefined,
      userAgent: data.client_user_agent ?? undefined,
      sourceUrl: data.source_url ?? undefined,
    }
  } catch (error) {
    console.error('[checkout-atribuicao] Falha ao consultar:', error)
    return null
  }
}
