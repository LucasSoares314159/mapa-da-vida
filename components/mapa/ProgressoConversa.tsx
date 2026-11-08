'use client'

import { TOTAL_PERGUNTAS, estimarTempoRestante } from '@/lib/onboarding'

type Props = {
  /**
   * Quantas perguntas ficaram para trás no fluxo (posição, não contagem de
   * respostas preenchidas) — é isso que faz a barra andar junto com a pessoa.
   */
  perguntasConcluidas: number
  /** Número da pergunta sendo exibida (1-based); ausente fora das perguntas. */
  perguntaAtual?: number
}

/**
 * Progresso do fluxo. Mostra expectativa de tempo, nunca contagem regressiva ao
 * vivo: cronômetro correndo induz resposta rápida, o oposto da reflexão.
 */
export function ProgressoConversa({ perguntasConcluidas, perguntaAtual }: Props) {
  const fracao = Math.min(1, perguntasConcluidas / TOTAL_PERGUNTAS)

  return (
    <div className="w-full">
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-xs text-mt-off-white/75">
          {perguntaAtual
            ? `Pergunta ${perguntaAtual} de ${TOTAL_PERGUNTAS}`
            : `${TOTAL_PERGUNTAS} perguntas`}
        </span>
        <span className="text-xs text-mt-off-white/60">
          {estimarTempoRestante(perguntasConcluidas)}
        </span>
      </div>

      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={TOTAL_PERGUNTAS}
        aria-valuenow={perguntasConcluidas}
        aria-label="Progresso do Mapa da Vida"
        className="h-[3px] overflow-hidden rounded-full bg-mt-linha-escura"
      >
        <div
          className="h-full rounded-full bg-mt-green transition-all duration-500 ease-out"
          style={{ width: `${fracao * 100}%` }}
        />
      </div>
    </div>
  )
}
