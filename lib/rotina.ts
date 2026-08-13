export type InputRotina = {
  horasSono: number
  horasTrabalho: number
  horasBasicas: number
  diasTrabalho: number
  horasTela: number
}

export type ResultadoRotina = {
  percentualLivre: number
  horasLivresSemana: number
  horasLivresDiaUtil: number
  horasLivresDiaFDS: number
  zona: 'privilegio' | 'sacrificio'
  horasZona: number
}

// Baseline de referência (horas ocupadas com rotina): jornada CLT (8h) + necessidades
// básicas médias (4h) + tela moderada (2h) num dia útil; sem trabalho no fim de semana.
// Fixa em horas absolutas — não escala com o sono do usuário.
export const BASELINE_OCUPADA_DIA_UTIL = 8 + 4 + 2
export const BASELINE_OCUPADA_FDS = 4 + 2

export function calcularRotina(input: InputRotina): ResultadoRotina {
  const { horasSono, horasTrabalho, horasBasicas, diasTrabalho, horasTela } = input

  // "Livre" é medido sobre as horas acordadas (24h − sono), não sobre o dia inteiro,
  // já que o sono não compete com trabalho/básicas/tela pelo mesmo tempo.
  const horasAcordado = 24 - horasSono
  const consumidaSemana = (horasTrabalho + horasBasicas + horasTela) / horasAcordado
  const consumidaFDS = (horasBasicas + horasTela) / horasAcordado
  const mediaConsumida =
    (consumidaSemana * diasTrabalho + consumidaFDS * (7 - diasTrabalho)) / 7

  const percentualLivre = Math.max(0, Math.round((1 - mediaConsumida) * 100))
  const horasLivresSemana = Math.max(0, Math.round((1 - mediaConsumida) * horasAcordado * 7))
  const horasLivresDiaUtil = Math.max(0, Math.round((1 - consumidaSemana) * horasAcordado * 10) / 10)
  const horasLivresDiaFDS = Math.max(0, Math.round((1 - consumidaFDS) * horasAcordado * 10) / 10)

  // Zona compara a ocupação real (em horas) contra a baseline de referência — não contra
  // um percentual fixo — para que a classificação reflita "acima ou abaixo do padrão
  // esperado", e não apenas "sobrou pouco tempo por dormir mais ou menos".
  const ocupadaDiaUtil = horasTrabalho + horasBasicas + horasTela
  const ocupadaFDS = horasBasicas + horasTela
  const ocupadaMedia = (ocupadaDiaUtil * diasTrabalho + ocupadaFDS * (7 - diasTrabalho)) / 7
  const baselineMedia =
    (BASELINE_OCUPADA_DIA_UTIL * diasTrabalho + BASELINE_OCUPADA_FDS * (7 - diasTrabalho)) / 7

  const zona = ocupadaMedia > baselineMedia ? 'sacrificio' : 'privilegio'
  const horasZona = Math.round(Math.abs(ocupadaMedia - baselineMedia) * 7)

  return {
    percentualLivre,
    horasLivresSemana,
    horasLivresDiaUtil,
    horasLivresDiaFDS,
    zona,
    horasZona,
  }
}

export function getZonaConfig(zona: 'privilegio' | 'sacrificio') {
  if (zona === 'privilegio') {
    return {
      badgeClass: 'bg-[rgba(87,170,143,0.15)]',
      borderColor: '#57AA8F',
      textColor: '#57AA8F',
      percentualCor: '#57AA8F',
      badgeLabel: 'Zona de Privilégio',
      descricao: 'Você tem mais margem do que a média. Use com intenção.',
      cor: 'bg-[rgba(87,170,143,0.1)]',
      badgeCardBorder: 'rgba(42,63,69,0.5)',
      badgeCardBg: 'rgba(42,63,69,0.2)',
      badgeCardText: '#2A3F45',
      percentualCardCor: '#2A3F45',
      cardDescricao: 'Você tem margem. Use com intenção para definir objetivos que importam.',
    }
  }
  return {
    badgeClass: 'bg-[rgba(192,80,80,0.15)]',
    borderColor: '#C05050',
    textColor: '#C05050',
    percentualCor: '#C05050',
    badgeLabel: 'Zona de Sacrifício',
    descricao: 'Sua rotina já está no limite. Objetivos novos exigem remover algo antes.',
    cor: 'bg-[rgba(192,80,80,0.1)]',
    badgeCardBorder: 'rgba(192,80,80,0.7)',
    badgeCardBg: 'rgba(192,80,80,0.25)',
    badgeCardText: '#FFAAAA',
    percentualCardCor: '#FFAAAA',
    cardDescricao: 'Sua rotina já está no limite. Antes de adicionar objetivos, avalie o que pode remover.',
  }
}