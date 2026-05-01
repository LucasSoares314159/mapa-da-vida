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

  const horasAcordadasDia = 24 - horasSono
  const totalAcordadasSemana = horasAcordadasDia * 7

  const consumidaUtilAcordado = horasTrabalho + horasBasicas
  const consumidaFDSAcordado = horasBasicas

  const totalConsumidoSemana =
    consumidaUtilAcordado * diasTrabalho + consumidaFDSAcordado * (7 - diasTrabalho)

  const horasLivresSemana = Math.round(totalAcordadasSemana - totalConsumidoSemana)
  const percentualLivre = Math.round(
    ((totalAcordadasSemana - totalConsumidoSemana) / totalAcordadasSemana) * 100
  )

  const horasLivresDiaUtil = Math.round((horasAcordadasDia - consumidaUtilAcordado) * 10) / 10
  const horasLivresDiaFDS = Math.round((horasAcordadasDia - consumidaFDSAcordado) * 10) / 10

  const zona = percentualLivre >= 40 ? 'privilegio' : 'sacrificio'
  const fatorHora = totalAcordadasSemana / 100
  const horasZona =
    percentualLivre >= 40
      ? Math.round((percentualLivre - 40) * fatorHora)
      : Math.round((40 - percentualLivre) * fatorHora)

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
  }
}
