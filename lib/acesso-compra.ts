import { createHash, randomBytes } from 'crypto'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'
import { enviarEmail } from '@/lib/email'
import { templateAcessoPlataforma } from '@/lib/email-templates'

const TOKEN_BYTES = 32
const DEFAULT_TTL_HOURS = 7 * 24

function getTokenTtlHours(): number {
  const configured = Number(process.env.ACCESS_LINK_TTL_HOURS ?? DEFAULT_TTL_HOURS)
  return Number.isFinite(configured) && configured > 0 ? configured : DEFAULT_TTL_HOURS
}
export type ConviteCompra = {
  tokenId: string
  compraId: string
  email: string
  expiresAt: string
}

export function normalizarEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function hashTokenAcesso(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export async function criarTokenAcesso(compraId: string): Promise<{
  token: string
  expiresAt: string
}> {
  const supabase = createAdminSupabaseClient()
  const token = randomBytes(TOKEN_BYTES).toString('base64url')
  const tokenHash = hashTokenAcesso(token)
  const ttlHours = getTokenTtlHours()
  const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000).toISOString()

  const { error: invalidationError } = await supabase
    .from('tokens_acesso_compra')
    .update({ invalidated_at: new Date().toISOString() })
    .eq('compra_id', compraId)
    .is('used_at', null)
    .is('invalidated_at', null)

  if (invalidationError) {
    throw new Error(`Falha ao invalidar link anterior: ${invalidationError.message}`)
  }

  const { error } = await supabase.from('tokens_acesso_compra').insert({
    compra_id: compraId,
    token_hash: tokenHash,
    expires_at: expiresAt,
  })

  if (error) {
    throw new Error(`Falha ao criar link de acesso: ${error.message}`)
  }

  return { token, expiresAt }
}

export async function enviarLinkAcessoCompra(compraId: string, email: string): Promise<void> {
  const supabase = createAdminSupabaseClient()
  const { token } = await criarTokenAcesso(compraId)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL

  if (!siteUrl) {
    throw new Error('NEXT_PUBLIC_SITE_URL nao configurada')
  }

  const urlCadastro = `${siteUrl.replace(/\/$/, '')}/auth/cadastro?token=${encodeURIComponent(token)}`
  const { subject, html } = await templateAcessoPlataforma({
    urlCadastro,
    validadeHoras: getTokenTtlHours(),
  })

  await enviarEmail({ to: email, subject, html })

  const { error } = await supabase
    .from('compras')
    .update({
      status: 'link_enviado',
      access_email_sent_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', compraId)

  if (error) {
    throw new Error(`Falha ao registrar envio do link: ${error.message}`)
  }
}
export async function buscarConviteCompra(token: string): Promise<ConviteCompra | null> {
  if (!token || token.length < 32) return null

  const supabase = createAdminSupabaseClient()
  const tokenHash = hashTokenAcesso(token)
  const now = new Date().toISOString()

  const { data: tokenRow, error: tokenError } = await supabase
    .from('tokens_acesso_compra')
    .select('id, compra_id, expires_at')
    .eq('token_hash', tokenHash)
    .is('used_at', null)
    .is('invalidated_at', null)
    .gt('expires_at', now)
    .maybeSingle()

  if (tokenError) {
    throw new Error(`Falha ao validar link de acesso: ${tokenError.message}`)
  }
  if (!tokenRow) return null

  const { data: compra, error: compraError } = await supabase
    .from('compras')
    .select('id, email, status')
    .eq('id', tokenRow.compra_id)
    .maybeSingle()

  if (compraError) {
    throw new Error(`Falha ao buscar compra: ${compraError.message}`)
  }
  if (!compra || compra.status === 'conta_criada') return null

  return {
    tokenId: tokenRow.id,
    compraId: compra.id,
    email: compra.email,
    expiresAt: tokenRow.expires_at,
  }
}
