import { render } from '@react-email/components'
import LembreteMensal from '@/emails/lembrete-mensal'
import PlanejamentoSemanal from '@/emails/planejamento-semanal'

export async function templateLembreteMensal(opts: {
  nome: string
  diasDesdeUltimoMapa: number
  urlNovoMapa: string
}): Promise<{ subject: string; html: string }> {
  const subject = 'Hora de atualizar seu Mapa da Vida 🗺️'
  const html = await render(
    LembreteMensal({
      nome: opts.nome,
      diasDesdeUltimoMapa: opts.diasDesdeUltimoMapa,
      urlNovoMapa: opts.urlNovoMapa,
    })
  )
  return { subject, html }
}

export async function templatePlanejamentoSemanal(opts: {
  nome: string
  urlDashboard: string
}): Promise<{ subject: string; html: string }> {
  const subject = 'Bora fazer esse planejamento semanal? 📋'
  const html = await render(
    PlanejamentoSemanal({
      nome: opts.nome,
      urlDashboard: opts.urlDashboard,
    })
  )
  return { subject, html }
}
