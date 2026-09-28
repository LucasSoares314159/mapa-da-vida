import { NextResponse } from 'next/server'
import { z } from 'zod'
import { enviarLinkAcessoCompra, normalizarEmail } from '@/lib/acesso-compra'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'
import { createServerSupabaseClient } from '@/lib/supabase-server'

const bodySchema = z.object({ email: z.string().email() })

export async function POST(request: Request) {
  const sessionClient = createServerSupabaseClient()
  const { data: { user } } = await sessionClient.auth.getUser()
  const admins = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((email) => normalizarEmail(email))
    .filter(Boolean)

  if (!user?.email || !admins.includes(normalizarEmail(user.email))) {
    return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Email invalido' }, { status: 400 })
  }

  const email = normalizarEmail(parsed.data.email)
  const admin = createAdminSupabaseClient()
  const { data: compra, error } = await admin
    .from('compras')
    .select('id, status')
    .eq('email', email)
    .neq('status', 'conta_criada')
    .order('paid_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('[reenviar-acesso] Falha ao buscar compra:', error)
    return NextResponse.json({ error: 'Falha ao buscar compra' }, { status: 500 })
  }
  if (!compra) {
    return NextResponse.json({ error: 'Compra pendente nao encontrada' }, { status: 404 })
  }

  try {
    await enviarLinkAcessoCompra(compra.id, email)
    return NextResponse.json({ ok: true })
  } catch (sendError) {
    console.error('[reenviar-acesso] Falha ao enviar link:', sendError)
    return NextResponse.json({ error: 'Falha ao reenviar link' }, { status: 500 })
  }
}
