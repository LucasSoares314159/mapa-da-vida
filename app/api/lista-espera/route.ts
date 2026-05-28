import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { listaEsperaSchema } from '@/lib/validations'

export async function POST(req: NextRequest) {
  const body = await req.json()

  // Log imediato — garante registro no Vercel Logs mesmo se tudo falhar
  console.log('[lista-espera] Lead recebido:', JSON.stringify(body))

  const parsed = listaEsperaSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, errors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const { nome, email, whatsapp, profissao, utm_source, utm_medium, utm_campaign } = parsed.data

  // Salva no Supabase — falha silenciosa para o usuário
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { error } = await supabase
      .from('leads')
      .insert({ nome, email, whatsapp, profissao, utm_source, utm_medium, utm_campaign })
    if (error) {
      console.error('[lista-espera] Erro ao salvar no Supabase:', error)
    }
  } catch (err) {
    console.error('[lista-espera] Exceção ao salvar no Supabase:', err)
  }

  // Chama webhook do Make — falha silenciosa para o usuário
  const webhookUrl = process.env.MAKE_WEBHOOK_URL
  if (!webhookUrl || webhookUrl.includes('placeholder')) {
    console.warn('[lista-espera] WARNING: MAKE_WEBHOOK_URL não configurado. Dados completos:', JSON.stringify(parsed.data))
    return NextResponse.json({ ok: true })
  }

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed.data),
    })
    if (!res.ok) {
      console.error('[lista-espera] Falha ao chamar webhook do Make:', res.status)
    }
  } catch (err) {
    console.error('[lista-espera] Exceção ao chamar webhook do Make:', err)
  }

  return NextResponse.json({ ok: true })
}
