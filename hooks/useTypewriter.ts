'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'motion/react'

type Opcoes = {
  /** Milissegundos por caractere. */
  velocidadeMs?: number
  /** Enquanto false, o texto não começa a ser escrito (usado para encadear falas). */
  ativo?: boolean
}

/**
 * Animação de escrita do guia conversacional.
 *
 * Acessibilidade: com "reduzir movimento" ativo o texto aparece inteiro no
 * primeiro frame — nenhum conteúdo depende da animação para existir. Quem está
 * lendo pode interromper a qualquer momento com `concluirAgora()`: esperar a
 * digitação nunca é obrigatório.
 */
export function useTypewriter(texto: string, { velocidadeMs = 24, ativo = true }: Opcoes = {}) {
  const semMovimento = useReducedMotion()
  const instantaneo = semMovimento === true

  const [visiveis, setVisiveis] = useState(() => (instantaneo ? texto.length : 0))
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const limparTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const concluirAgora = useCallback(() => {
    limparTimer()
    setVisiveis(texto.length)
  }, [limparTimer, texto.length])

  useEffect(() => {
    limparTimer()

    if (!ativo) {
      setVisiveis(0)
      return
    }

    if (instantaneo) {
      setVisiveis(texto.length)
      return
    }

    // Reinicia a cada troca de texto — sem isso, avançar rápido entre perguntas
    // deixaria o timer anterior vivo e duas falas se escreveriam ao mesmo tempo.
    setVisiveis(0)
    timerRef.current = setInterval(() => {
      setVisiveis((n) => {
        if (n >= texto.length) {
          limparTimer()
          return texto.length
        }
        return n + 1
      })
    }, velocidadeMs)

    return limparTimer
  }, [texto, ativo, instantaneo, velocidadeMs, limparTimer])

  return {
    textoVisivel: texto.slice(0, visiveis),
    concluido: visiveis >= texto.length,
    concluirAgora,
    instantaneo,
  }
}
