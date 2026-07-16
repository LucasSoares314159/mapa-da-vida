import { render } from '@react-email/components'
import LembreteMensal from '@/emails/lembrete-mensal'
import PlanejamentoSemanal from '@/emails/planejamento-semanal'
import LembreteObjetivo from '@/emails/lembrete-objetivo'
import ObjetivoConcluido from '@/emails/objetivo-concluido'

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

export async function templateLembreteObjetivo(opts: {
  nome: string
  textoObjetivo: string
  prazoLabel: string
  diasRestantes: number
  urlObjetivos: string
}): Promise<{ subject: string; html: string }> {
  const subject = 'Não esqueça seu plano 🎯'
  const html = await render(
    LembreteObjetivo({
      nome: opts.nome,
      textoObjetivo: opts.textoObjetivo,
      prazoLabel: opts.prazoLabel,
      diasRestantes: opts.diasRestantes,
      urlObjetivos: opts.urlObjetivos,
    })
  )
  return { subject, html }
}

export async function templateObjetivoConcluido(opts: {
  nome: string
  textoObjetivo: string
  urlObjetivos: string
}): Promise<{ subject: string; html: string }> {
  const subject = 'Bom progresso no seu objetivo 🎯'
  const html = await render(
    ObjetivoConcluido({
      nome: opts.nome,
      textoObjetivo: opts.textoObjetivo,
      urlObjetivos: opts.urlObjetivos,
    })
  )
  return { subject, html }
}
