'use client'

import { useEffect, useState } from 'react'
import { Check } from 'lucide-react'
import type { ConfigQuiz } from '@/lib/quiz/tipos'

// Tela 09: "Estamos organizando suas respostas...".
//
// O calculo e sincrono e instantaneo — esta tela existe para dar peso ao
// resultado, nao porque ha trabalho a fazer. As linhas sao um checklist que
// preenche de cima para baixo: a linha atual aparece com um anel girando, as
// ja passadas viram um ✓. Dar ao tempo de espera a forma de um trabalho sendo
// concluido vale mais que um spinner solto — e o que faz a tela parecer uma
// analise, nao um carregamento.
//
// Com prefers-reduced-motion todas as linhas aparecem concluidas de uma vez: a
// revelacao progressiva e decorativa, e o avanco automatico continua valendo.

type Props = {
  config: ConfigQuiz
  onConcluir: () => void
}

export function TelaProcessando({ config, onConcluir }: Props) {
  const { titulo, linhas, duracaoMs } = config.processando
  // `concluidas` = quantas ja viraram ✓. A linha de indice `concluidas` e a
  // "em andamento" (anel girando); as seguintes ficam apagadas.
  const [concluidas, setConcluidas] = useState(0)

  useEffect(() => {
    const semAnimacao =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (semAnimacao) setConcluidas(linhas.length)

    const intervalo = duracaoMs / (linhas.length + 1)
    const timers = semAnimacao
      ? []
      : linhas.map((_, i) =>
          setTimeout(() => setConcluidas(i + 1), intervalo * (i + 1))
        )

    const fim = setTimeout(onConcluir, duracaoMs)

    return () => {
      timers.forEach(clearTimeout)
      clearTimeout(fim)
    }
  }, [linhas, duracaoMs, onConcluir])

  return (
    <div
      className="flex flex-1 flex-col items-center justify-center text-center"
      role="status"
      aria-live="polite"
    >
      {/* Anel pulsante com um ponto central: presenca maior que o spinner
          anterior, ancora a tela enquanto o checklist preenche abaixo. */}
      <div className="relative mb-7 flex h-16 w-16 items-center justify-center">
        <span className="absolute inset-0 animate-spin rounded-full border-2 border-mt-border border-t-mt-green motion-reduce:animate-none" />
        <span className="h-9 w-9 rounded-full bg-mt-green-sup" />
      </div>

      <h1 className="font-satoshi text-[28px] font-medium lowercase leading-[1.12] tracking-[-0.02em] text-mt-green-dark sm:text-[34px]">
        {titulo}
      </h1>

      <ul className="mt-7 w-full max-w-sm space-y-3 text-left">
        {linhas.map((linha, i) => {
          const feita = i < concluidas
          const emAndamento = i === concluidas
          // Linhas ainda nao alcancadas ficam invisiveis, para a lista crescer
          // em vez de nascer cheia e so trocar de cor.
          if (!feita && !emAndamento) return null

          return (
            <li key={linha} className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                  feita ? 'bg-mt-green text-white' : 'bg-mt-green-sup'
                }`}
              >
                {feita ? (
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                ) : (
                  <span className="h-2 w-2 animate-pulse rounded-full bg-mt-green motion-reduce:animate-none" />
                )}
              </span>
              {/* Apoio curto: Lora reta minúscula. Feita = leitura primária;
                  em andamento = tom de apoio (o mt-muted reprovava no AA). */}
              <span
                className={`font-editorial text-[17px] lowercase leading-[1.5] ${
                  feita ? 'text-mt-green-dark' : 'text-mt-apoio'
                }`}
              >
                {linha}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
