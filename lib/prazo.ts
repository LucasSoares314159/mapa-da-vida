import type { PrazoObjetivo } from '@/types'

export const PRAZO_LABEL: Record<PrazoObjetivo, string> = {
  curto: 'Curto',
  medio: 'Médio',
  longo: 'Longo',
}

export const PRAZO_SUBLABEL: Record<PrazoObjetivo, string> = {
  curto: 'até 90 dias',
  medio: '6–12 meses',
  longo: '1–3 anos',
}

// Variante em frase corrida (minúscula), usada nos textos dos e-mails de lembrete.
export const PRAZO_LABEL_EMAIL: Record<PrazoObjetivo, string> = {
  curto: 'curto prazo',
  medio: 'médio prazo',
  longo: 'longo prazo',
}

// Faixa de dias (a partir de hoje) aceita para cada prazo — usada para validar
// se a data alvo escolhida é coerente com o prazo selecionado.
export const FAIXA_PRAZO_DIAS: Record<PrazoObjetivo, { min: number; max: number }> = {
  curto: { min: 0, max: 90 },
  medio: { min: 91, max: 365 },
  longo: { min: 366, max: 1095 },
}

export function diasAtePartirDeHoje(dataAlvo: string): number {
  const msPorDia = 1000 * 60 * 60 * 24
  const hoje = new Date()
  const alvo = new Date(dataAlvo + 'T00:00:00')
  const hojeUTC = Date.UTC(hoje.getFullYear(), hoje.getMonth(), hoje.getDate())
  const alvoUTC = Date.UTC(alvo.getFullYear(), alvo.getMonth(), alvo.getDate())
  return Math.round((alvoUTC - hojeUTC) / msPorDia)
}

export function validarPrazoComData(prazo: PrazoObjetivo, dataAlvo: string): string | null {
  const dias = diasAtePartirDeHoje(dataAlvo)
  const faixa = FAIXA_PRAZO_DIAS[prazo]
  if (dias >= faixa.min && dias <= faixa.max) return null

  return `A data alvo não combina com o prazo "${PRAZO_LABEL[prazo]}" (${PRAZO_SUBLABEL[prazo]}). Ajuste a data ou escolha outro prazo.`
}
