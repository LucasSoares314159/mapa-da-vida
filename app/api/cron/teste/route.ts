import { NextRequest, NextResponse } from 'next/server'
import { isCronAuthorized } from '@/lib/cron-auth'
import { enviarEmail } from '@/lib/email'
import { templateLembreteMensal, templatePlanejamentoSemanal } from '@/lib/email-templates'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  if (!isCronAuthorized(req)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const tipo = searchParams.get('tipo') ?? 'mensal'
  const para = searchParams.get('para')

  if (!para) {
    return NextResponse.json({ error: 'Parâmetro "para" é obrigatório' }, { status: 400 })
  }

  if (tipo === 'semanal') {
    const { subject, html } = await templatePlanejamentoSemanal({
      nome: 'Lucas',
      urlDashboard: `${process.env.NEXT_PUBLIC_SITE_URL}/objetivos`,
    })
    await enviarEmail({ to: para, subject, html })
  } else {
    const { subject, html } = await templateLembreteMensal({
      nome: 'Lucas',
      diasDesdeUltimoMapa: 35,
      urlNovoMapa: `${process.env.NEXT_PUBLIC_SITE_URL}/mapa/preparacao`,
    })
    await enviarEmail({ to: para, subject, html })
  }

  return NextResponse.json({ ok: true, tipo, para })
}
