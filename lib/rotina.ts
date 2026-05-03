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

export function calcularRotina(input: InputRotina): ResultadoRotina {
  const { horasSono, horasTrabalho, horasBasicas, diasTrabalho, horasTela } = input

  const consumidaSemana = (horasSono + horasTrabalho + horasBasicas + horasTela) / 24
  const consumidaFDS = (horasSono + horasBasicas + horasTela) / 24
  const mediaConsumida =
    (consumidaSemana * diasTrabalho + consumidaFDS * (7 - diasTrabalho)) / 7

  const percentualLivre = Math.round((1 - mediaConsumida) * 100)
  const horasLivresSemana = Math.round((1 - mediaConsumida) * 168)
  const horasLivresDiaUtil = Math.round((1 - consumidaSemana) * 24 * 10) / 10
  const horasLivresDiaFDS = Math.round((1 - consumidaFDS) * 24 * 10) / 10

  const zona = percentualLivre >= 40 ? 'privilegio' : 'sacrificio'
  const horasZona =
    percentualLivre >= 40
      ? Math.round((percentualLivre - 40) * 1.68)
      : Math.round((40 - percentualLivre) * 1.68)

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