'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import { useTypewriter } from '@/hooks/useTypewriter'
import type { NivelFala } from '@/lib/onboarding'

type Props = {
  texto: string
  /** Enquanto false, a fala espera a anterior terminar. */
  ativo?: boolean
  /** Avisa o pai que a escrita terminou, para encadear a fala seguinte. */
  onConcluir?: () => void
  /** Hierarquia: só tamanho e peso, para a tela seguir parecendo um chat. */
  nivel?: NivelFala
  /** Negrito pontual. */
  forte?: boolean
}

/**
 * Fala do guia, escrita caractere a caractere.
 *
 * Acessibilidade: o span animado é aria-hidden e existe só para os olhos; o
 * texto completo vai num nó sr-only, para o leitor de tela anunciar a frase uma
 * vez em vez de tagarelar letra por letra.
 */
export function BolhaGuia({ texto, ativo = true, onConcluir, nivel = 'corpo', forte = false }: Props) {
  const { textoVisivel, concluido, concluirAgora } = useTypewriter(texto, { ativo })

  // Avisa o pai uma única vez por fala, para encadear a seguinte.
  const avisado = useRef(false)
  useEffect(() => {
    if (!concluido) {
      avisado.current = false
      return
    }
    if (avisado.current) return
    avisado.current = true
    onConcluir?.()
  }, [concluido, onConcluir])

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      onClick={concluirAgora}
      className="relative"
    >
      <p
        style={{
          color: '#EDF2EF',
          fontSize: nivel === 'titulo' ? 26 : 18,
          fontWeight: nivel === 'titulo' ? 600 : forte ? 600 : 400,
          lineHeight: nivel === 'titulo' ? 1.35 : 1.7,
        }}
      >
        {/* Camada visual: a digitação. Invisível para leitores de tela. */}
        <span aria-hidden="true">{textoVisivel}</span>
        {/* Cursor piscante enquanto escreve */}
        {!concluido && (
          <span
            aria-hidden="true"
            className="ml-0.5 inline-block animate-pulse"
            style={{ width: 2, height: '1em', backgroundColor: '#57AA8F', verticalAlign: 'text-bottom' }}
          />
        )}
        {/* Camada semântica: o texto inteiro, anunciado uma única vez. */}
        <span className="sr-only">{texto}</span>
      </p>
    </motion.div>
  )
}
