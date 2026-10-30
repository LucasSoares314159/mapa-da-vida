'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import type { ConfigQuiz } from '@/lib/quiz/tipos'

// Tela 09: "Estamos organizando suas respostas...".
//
// O calculo e sincrono e instantaneo — esta tela existe para dar peso ao
// resultado, nao porque ha trabalho a fazer. As linhas aparecem em sequencia
// dentro da duracao configurada.
//
// Com prefers-reduced-motion as tres linhas aparecem de uma vez: a revelacao
// progressiva e decorativa, e o avanco automatico continua valendo.

type Props = {
  config: ConfigQuiz
  onConcluir: () => void
}

export function TelaProcessando({ config, onConcluir }: Props) {
  const { titulo, linhas, duracaoMs } = config.processando
  const [visiveis, setVisiveis] = useState(1)

  useEffect(() => {
    const semAnimacao =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (semAnimacao) setVisiveis(linhas.length)

    const intervalo = duracaoMs / (linhas.length + 1)
    const timers = semAnimacao
      ? []
      : linhas.map((_, i) =>
          setTimeout(() => setVisiveis(i + 1), intervalo * (i + 1))
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
      <Loader2
        className="mb-6 h-10 w-10 animate-spin text-mt-green motion-reduce:animate-none"
        aria-hidden="true"
      />
      <h1 className="font-heading text-2xl font-bold text-mt-black sm:text-[28px]">{titulo}</h1>

      <div className="mt-6 space-y-2">
        {linhas.slice(0, visiveis).map((linha) => (
          <p key={linha} className="text-base text-mt-muted">
            {linha}
          </p>
        ))}
      </div>
    </div>
  )
}
