import { NextRequest, NextResponse } from 'next/server'
import { isCronAuthorized } from '@/lib/cron-auth'
import { enviarEmail } from '@/lib/email'
import {
  templateLembreteMensal,
  templatePlanejamentoSemanal,
  templateLembreteObjetivo,
  templateObjetivoConcluido,
} from '@/lib/email-templates'

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
  } else if (tipo === 'objetivo') {
    const { subject, html } = await templateLembreteObjetivo({
      nome: 'Lucas',
      textoObjetivo: 'Treinar 3x por semana',
      prazoLabel: 'curto prazo',
      diasRestantes: 5,
      urlObjetivos: `${process.env.NEXT_PUBLIC_SITE_URL}/objetivos`,
    })
    await enviarEmail({ to: para, subject, html })
  } else if (tipo === 'objetivo-concluido') {
    const { subject, html } = await templateObjetivoConcluido({
      nome: 'Lucas',
      textoObjetivo: 'Treinar 3x por semana',
      urlObjetivos: `${process.env.NEXT_PUBLIC_SITE_URL}/objetivos`,
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
