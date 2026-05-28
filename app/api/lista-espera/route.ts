import { NextRequest, NextResponse } from 'next/server'
import { listaEsperaSchema } from '@/lib/validations'

export async function POST(req: NextRequest) {
  const body = await req.json()

  const parsed = listaEsperaSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, errors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const webhookUrl = process.env.MAKE_WEBHOOK_URL
  if (!webhookUrl || webhookUrl.includes('placeholder')) {
    // Webhook não configurado — aceita o lead mas não encaminha
    console.warn('[lista-espera] MAKE_WEBHOOK_URL não configurado. Lead recebido mas não enviado:', parsed.data)
    return NextResponse.json({ ok: true })
  }

  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(parsed.data),
  })

  if (!res.ok) {
    console.error('[lista-espera] Falha ao chamar webhook do Make:', res.status)
    return NextResponse.json({ ok: false, error: 'Erro ao registrar. Tente novamente.' }, { status: 502 })
  }

  return NextResponse.json({ ok: true })
}
