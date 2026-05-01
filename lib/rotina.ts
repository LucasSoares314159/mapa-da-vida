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
  zona: 'privilegio' | 'sacrificio'
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
  const horasLivresDiaUtil = Math.round((1 - consumidaSemana) * 24)
  const horasLivresDiaFDS = Math.round((1 - consumidaFDS) * 24)

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
  return zona === 'privilegio'
    ? {
        cor: 'bg-mt-green-light',
        textoCor: 'text-mt-green-dark',
        descricao:
          'Você tem espaço na sua agenda. O desafio é escolher com sabedoria o que preenche esse tempo.',
      }
    : {
        cor: 'bg-mt-destructive-light',
        textoCor: 'text-mt-destructive-dark',
        descricao:
          'Sua semana está apertada. O que está ocupando seu tempo não está deixando margem para o importante.',
      }
}
