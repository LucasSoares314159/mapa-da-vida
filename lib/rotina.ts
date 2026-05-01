export type InputRotina = {
  horasSono: number
  horasTrabalho: number
  horasBasicas: number
  diasTrabalho: number
}

export type ResultadoRotina = {
  percentualLivre: number
  horasLivresSemana: number
  horasLivresDiaUtil: number
  horasLivresDiaFDS: number
  zona: 'privilegio' | 'base' | 'sacrificio'
  horasZona: number
}

export function calcularRotina(input: InputRotina): ResultadoRotina {
  const { horasSono, horasTrabalho, horasBasicas, diasTrabalho } = input

  const consumidaSemana = (horasSono + horasTrabalho + horasBasicas) / 24
  const consumidaFDS = (horasSono + horasBasicas) / 24
  const mediaConsumida =
    (consumidaSemana * diasTrabalho + consumidaFDS * (7 - diasTrabalho)) / 7

  const percentualLivre = Math.round((1 - mediaConsumida) * 100)
  const horasLivresSemana = Math.round((1 - mediaConsumida) * 168)
  const horasLivresDiaUtil = Math.round((1 - consumidaSemana) * 24 * 10) / 10
  const horasLivresDiaFDS = Math.round((1 - consumidaFDS) * 24 * 10) / 10

  const zona = percentualLivre > 45 ? 'privilegio' : percentualLivre >= 35 ? 'base' : 'sacrificio'
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

export function getZonaConfig(zona: 'privilegio' | 'base' | 'sacrificio') {
  if (zona === 'privilegio') {
    return {
      badgeClass: 'bg-[rgba(87,170,143,0.15)] border-mt-green text-mt-green',
      percentualCor: '#57AA8F',
      badgeLabel: 'Zona de Privilégio',
      descricao: 'Você tem mais margem do que a média. Use com intenção.',
      cor: 'bg-[rgba(87,170,143,0.1)]',
    }
  }
  if (zona === 'base') {
    return {
      badgeClass: 'bg-[rgba(212,168,67,0.15)] border-mt-yellow text-mt-yellow',
      percentualCor: '#D4A843',
      badgeLabel: 'Zona Base',
      descricao: 'Você está na média. Cada objetivo precisa caber aqui dentro.',
      cor: 'bg-[rgba(212,168,67,0.1)]',
    }
  }
  return {
    badgeClass: 'bg-[rgba(192,80,80,0.15)] border-mt-red text-mt-red',
    percentualCor: '#C05050',
    badgeLabel: 'Zona de Sacrifício',
    descricao: 'Sua rotina já está no limite. Objetivos novos exigem remover algo antes.',
    cor: 'bg-[rgba(192,80,80,0.1)]',
  }
}
