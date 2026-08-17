'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'motion/react'
import type { Diagnostico } from '@/lib/analise'

type Props = {
  mapaId: string
  diagnostico: Diagnostico
  onVerMapa: () => void
}

const COR_STATUS = { vermelho: '#C05050', amarelo: '#D4A843' } as const

/** Cada etapa é uma tela cheia; o clique avança para a próxima. */
type Etapa =
  | { tipo: 'ganho' }
  | { tipo: 'padrao' }
  | { tipo: 'projecao' }
  | { tipo: 'area'; indice: number }
  | { tipo: 'acoes' }

const TRANSICAO = { duration: 0.7, ease: [0.16, 1, 0.3, 1] } as const

/**
 * Revelação do diagnóstico como sequência de telas, no espírito de uma carta
 * sendo aberta: o ganho estimado abre como número em destaque, e cada etapa
 * seguinte ocupa a tela sozinha para que a leitura tenha hierarquia clara.
 *
 * O avanço é por clique (não automático) para que cada pessoa leia no próprio
 * ritmo — o texto varia bastante de tamanho conforme o mapa.
 */
export function RevelacaoDiagnostico({ mapaId, diagnostico, onVerMapa }: Props) {
  const etapas = useMemo<Etapa[]>(
    () => [
      { tipo: 'ganho' },
      { tipo: 'padrao' },
      { tipo: 'projecao' },
      ...diagnostico.areasDestacadas.map((_, indice) => ({ tipo: 'area' as const, indice })),
      { tipo: 'acoes' },
    ],
    [diagnostico.areasDestacadas]
  )

  const [indice, setIndice] = useState(0)
  const etapa = etapas[indice]
  const ehUltima = indice === etapas.length - 1

  function avancar() {
    if (!ehUltima) setIndice((i) => i + 1)
  }

  return (
    <div
      onClick={avancar}
      className="relative flex min-h-[calc(100vh-52px)] flex-col items-center justify-center overflow-hidden px-6 py-16"
      style={{ backgroundColor: '#2A3F45', cursor: ehUltima ? 'default' : 'pointer' }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={indice}
          className="mx-auto flex w-full max-w-lg flex-col items-center"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={TRANSICAO}
        >
          {etapa.tipo === 'ganho' && <TelaGanho diagnostico={diagnostico} />}

          {etapa.tipo === 'padrao' && (
            <p
              className="text-center"
              style={{
                fontFamily: 'var(--font-lora), Lora, serif',
                fontStyle: 'italic',
                fontSize: '1.45rem',
                color: '#EDF2EF',
                lineHeight: 1.65,
              }}
            >
              {diagnostico.padrao}
            </p>
          )}

          {etapa.tipo === 'projecao' && (
            <div className="flex flex-col gap-6">
              {diagnostico.projecao.map((paragrafo, i) => (
                <p
                  key={i}
                  className="text-center"
                  style={{ fontSize: '1.02rem', color: 'rgba(237,242,239,0.85)', lineHeight: 1.75 }}
                >
                  {paragrafo}
                </p>
              ))}
              <p
                className="text-center"
                style={{
                  fontFamily: 'var(--font-lora), Lora, serif',
                  fontStyle: 'italic',
                  fontSize: '1.05rem',
                  color: '#EDF2EF',
                  lineHeight: 1.7,
                  borderTop: '0.5px solid rgba(237,242,239,0.15)',
                  paddingTop: 28,
                }}
              >
                {diagnostico.escolha}
              </p>
            </div>
          )}

          {etapa.tipo === 'area' && <TelaArea area={diagnostico.areasDestacadas[etapa.indice]} />}

          {etapa.tipo === 'acoes' && (
            <TelaAcoes mapaId={mapaId} onVerMapa={onVerMapa} diagnostico={diagnostico} />
          )}
        </motion.div>
      </AnimatePresence>

      {!ehUltima && <IndicadorAvanco indice={indice} total={etapas.length} />}
    </div>
  )
}

/** Clímax: o ganho estimado como número grande, com contagem de entrada. */
function TelaGanho({ diagnostico }: { diagnostico: Diagnostico }) {
  const { valor, unidade } = diagnostico.ganhoEstimado

  return (
    <div className="flex flex-col items-center gap-6">
      <motion.p
        className="text-center uppercase"
        style={{
          fontSize: 12,
          letterSpacing: 2,
          color: 'rgba(237,242,239,0.55)',
          fontFamily: 'var(--font-space-grotesk), sans-serif',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        O que o estudo mostra
      </motion.p>

      <motion.div
        className="flex items-baseline justify-center gap-3"
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <span
          className="leading-none"
          style={{
            fontFamily: 'var(--font-space-grotesk), sans-serif',
            fontSize: 'clamp(4.5rem, 18vw, 8rem)',
            fontWeight: 700,
            color: '#57AA8F',
            letterSpacing: '-0.03em',
          }}
        >
          {valor}
        </span>
      </motion.div>

      <motion.p
        className="max-w-xs text-center"
        style={{ fontSize: '1.05rem', color: '#EDF2EF', lineHeight: 1.6 }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 1.2 }}
      >
        {unidade}
      </motion.p>

      <motion.p
        className="max-w-sm text-center"
        style={{ fontSize: '0.9rem', color: 'rgba(237,242,239,0.6)', lineHeight: 1.65 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 1.6 }}
      >
        É o que separa as populações mais longevas do mundo do resto. Não por genética, por hábito.
      </motion.p>
    </div>
  )
}

/** Uma área crítica ocupando a tela inteira: fundamento e evidência. */
function TelaArea({ area }: { area: Diagnostico['areasDestacadas'][number] }) {
  const { nome, status, base } = area
  const cor = status === 'vermelho' ? COR_STATUS.vermelho : COR_STATUS.amarelo

  return (
    <div className="flex w-full flex-col gap-6">
      <motion.div
        className="flex items-center justify-center gap-2.5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        <span
          style={{
            width: 9,
            height: 9,
            borderRadius: '50%',
            backgroundColor: cor,
            flexShrink: 0,
            display: 'inline-block',
          }}
        />
        <h3
          style={{
            fontFamily: 'var(--font-space-grotesk), sans-serif',
            fontSize: '1.35rem',
            fontWeight: 600,
            color: '#EDF2EF',
          }}
        >
          {nome}
        </h3>
      </motion.div>

      <motion.p
        className="text-center"
        style={{ fontSize: '1.05rem', color: '#EDF2EF', lineHeight: 1.7 }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.35 }}
      >
        {base.fundamento}
      </motion.p>

      <motion.p
        style={{
          fontSize: '0.95rem',
          color: 'rgba(237,242,239,0.8)',
          lineHeight: 1.7,
          borderLeft: '2px solid #57AA8F',
          paddingLeft: 18,
          textAlign: 'left',
        }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        {base.destaque}
      </motion.p>
    </div>
  )
}

/** Tela final: contagem de status e os caminhos possíveis a partir daqui. */
function TelaAcoes({
  mapaId,
  onVerMapa,
  diagnostico,
}: {
  mapaId: string
  onVerMapa: () => void
  diagnostico: Diagnostico
}) {
  const { totais } = diagnostico

  return (
    <div className="flex w-full flex-col items-center gap-8">
      <div className="flex items-center justify-center gap-2">
        {(
          [
            { tipo: 'verde', bg: 'rgba(87,170,143,0.15)', cor: '#57AA8F', count: totais.verde },
            { tipo: 'amarelo', bg: 'rgba(212,168,67,0.15)', cor: '#D4A843', count: totais.amarelo },
            { tipo: 'vermelho', bg: 'rgba(192,80,80,0.15)', cor: '#C05050', count: totais.vermelho },
          ] as const
        ).map(({ tipo, bg, cor, count }) => (
          <span
            key={tipo}
            className="flex items-center text-sm font-medium"
            style={{ backgroundColor: bg, color: cor, borderRadius: 20, padding: '4px 10px', gap: 5 }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: cor,
                flexShrink: 0,
                display: 'inline-block',
              }}
            />
            {count}
          </span>
        ))}
      </div>

      <div className="flex w-full flex-col items-center gap-3">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onVerMapa()
          }}
          className="flex items-center gap-2 text-white transition-opacity hover:opacity-90"
          style={{
            backgroundColor: '#57AA8F',
            borderRadius: 10,
            padding: '14px 28px',
            fontSize: 15,
            fontWeight: 500,
          }}
        >
          Ver mapa completo →
        </button>

        <Link
          href={`/diagnostico/${mapaId}`}
          onClick={(e) => e.stopPropagation()}
          className="text-sm font-medium transition-opacity hover:opacity-80"
          style={{ color: 'rgba(237,242,239,0.7)' }}
        >
          Ver diagnóstico completo
        </Link>
      </div>
    </div>
  )
}

/** Marca o progresso da sequência e sinaliza que dá para avançar. */
function IndicadorAvanco({ indice, total }: { indice: number; total: number }) {
  const [visivel, setVisivel] = useState(false)

  // A dica de "toque para continuar" só aparece depois que a animação da etapa
  // termina, para não competir com o conteúdo que está entrando.
  useEffect(() => {
    setVisivel(false)
    const timer = setTimeout(() => setVisivel(true), 2200)
    return () => clearTimeout(timer)
  }, [indice])

  return (
    <div className="absolute inset-x-0 bottom-8 flex flex-col items-center gap-4">
      <motion.span
        style={{ fontSize: 12, color: 'rgba(237,242,239,0.4)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: visivel ? 1 : 0 }}
        transition={{ duration: 0.6 }}
      >
        toque para continuar
      </motion.span>

      <div className="flex items-center gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            style={{
              width: i === indice ? 18 : 5,
              height: 5,
              borderRadius: 3,
              backgroundColor: i === indice ? '#57AA8F' : 'rgba(237,242,239,0.2)',
              transition: 'width 0.4s ease, background-color 0.4s ease',
              display: 'inline-block',
            }}
          />
        ))}
      </div>
    </div>
  )
}
