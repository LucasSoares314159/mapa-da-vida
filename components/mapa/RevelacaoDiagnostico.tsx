'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'motion/react'
import { ChevronDown } from 'lucide-react'
import type { Diagnostico } from '@/lib/analise'
import { PILARES } from '@/types'
import type { Area, NomePilar, StatusArea } from '@/types'

type Props = {
  mapaId: string
  diagnostico: Diagnostico
  /** As 9 áreas respondidas, para abrir com o retrato do próprio mapa. */
  areas: Area[]
  onVerMapa: () => void
}

const COR_STATUS = { vermelho: '#C05050', amarelo: '#D4A843' } as const

/** Cada etapa é uma tela cheia; o clique avança para a próxima. */
type Etapa =
  | { tipo: 'retrato' }
  | { tipo: 'padrao' }
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
export function RevelacaoDiagnostico({ mapaId, diagnostico, areas, onVerMapa }: Props) {
  const etapas = useMemo<Etapa[]>(
    () => [
      { tipo: 'retrato' },
      { tipo: 'padrao' },
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
      className="relative flex min-h-[calc(100vh-52px)] flex-col items-center justify-center px-6 py-12"
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
          {etapa.tipo === 'retrato' && <TelaRetrato diagnostico={diagnostico} areas={areas} />}

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
      {/* Fecho que devolve agência. Vinha da tela de projeção, removida por ser
          genérica — mas esta frase é boa e não podia sair junto. */}
      <p
        className="max-w-md text-center"
        style={{
          fontFamily: 'var(--font-lora), Lora, serif',
          fontStyle: 'italic',
          fontSize: '1.05rem',
          color: '#EDF2EF',
          lineHeight: 1.7,
        }}
      >
        {diagnostico.escolha}
      </p>

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

const ORDEM_PILARES_REVELACAO: NomePilar[] = ['corpo', 'mente', 'espirito']

const PONTO_STATUS: Record<StatusArea, string> = {
  verde: '#57AA8F',
  amarelo: '#D4A843',
  vermelho: '#C05050',
}

/**
 * Abertura do diagnóstico: o retrato do próprio mapa.
 *
 * Os três pilares ficam lado a lado, em colunas. Empilhado na vertical a tela
 * passava de 1200px: exigia rolagem, perdia a leitura de conjunto — que é o
 * ponto de um mapa — e empurrava a dica de avanço para cima do texto.
 *
 * Cada pilar entra em sequência, de cima para baixo, para o olho acompanhar a
 * revelação em vez de receber tudo de uma vez.
 */
function TelaRetrato({ diagnostico, areas }: { diagnostico: Diagnostico; areas: Area[] }) {
  const { totais, ganhoEstimado } = diagnostico
  const porArea = new Map(areas.map((a) => [a.area, a.status]))
  const pedemMudanca = totais.vermelho + totais.amarelo

  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-7">
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
        transition={{ duration: 0.5 }}
      >
        Seu mapa hoje
      </motion.p>

      {/* Os três pilares em colunas — leitura de conjunto, sem rolagem */}
      <div className="grid w-full grid-cols-3 gap-3 sm:gap-5">
        {ORDEM_PILARES_REVELACAO.map((pilar, iPilar) => (
          <motion.div
            key={pilar}
            className="flex flex-col gap-2.5"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 + iPilar * 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            <span
              className="uppercase"
              style={{
                fontSize: 10,
                letterSpacing: '1px',
                fontWeight: 700,
                color: 'rgba(237,242,239,0.5)',
                borderBottom: '0.5px solid rgba(237,242,239,0.15)',
                paddingBottom: 8,
              }}
            >
              {PILARES[pilar].label}
            </span>

            {PILARES[pilar].areas.map((area, iArea) => {
              const status = porArea.get(area) ?? 'verde'
              return (
                <motion.div
                  key={area}
                  className="flex items-start gap-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.35, delay: 0.4 + iPilar * 0.22 + iArea * 0.07 }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: PONTO_STATUS[status],
                      flexShrink: 0,
                      display: 'inline-block',
                      marginTop: 6,
                    }}
                  />
                  <span
                    style={{
                      fontSize: 13,
                      color: status === 'verde' ? 'rgba(237,242,239,0.65)' : '#EDF2EF',
                      fontWeight: status === 'vermelho' ? 600 : 400,
                      lineHeight: 1.4,
                    }}
                  >
                    {area}
                  </span>
                </motion.div>
              )
            })}
          </motion.div>
        ))}
      </div>

      {/* O que esse mapa mostra, ligado ao estudo */}
      <motion.div
        className="flex w-full flex-col items-center gap-2.5"
        style={{
          borderTop: '0.5px solid rgba(237,242,239,0.15)',
          paddingTop: 24,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.2 }}
      >
        <p
          className="text-center"
          style={{
            fontSize: '1.15rem',
            color: '#EDF2EF',
            fontWeight: 600,
            lineHeight: 1.4,
          }}
        >
          {pedemMudanca === 0
            ? 'Nenhuma área pedindo mudança hoje.'
            : `${pedemMudanca} ${pedemMudanca === 1 ? 'área pede' : 'áreas pedem'} atenção.`}
        </p>

        {/* Disclaimer: contexto do estudo, em peso menor que o número acima */}
        <p
          className="max-w-md text-center"
          style={{ fontSize: '0.85rem', color: 'rgba(237,242,239,0.55)', lineHeight: 1.6 }}
        >
          {pedemMudanca === 0
            ? `Manter esse resultado é o que dá às populações das Blue Zones ${ganhoEstimado.valor} anos a mais livres de doença.`
            : `São justamente as áreas que as populações mais longevas do mundo protegem — e o que lhes dá ${ganhoEstimado.valor} anos a mais livres de doença.`}
        </p>
      </motion.div>
    </div>
  )
}

/** Marca o progresso da sequência e sinaliza que dá para avançar. */
function IndicadorAvanco({ indice, total }: { indice: number; total: number }) {
  const [visivel, setVisivel] = useState(false)

  // A dica só aparece depois que a animação da etapa termina, para não competir
  // com o conteúdo que está entrando.
  useEffect(() => {
    setVisivel(false)
    const timer = setTimeout(() => setVisivel(true), 1600)
    return () => clearTimeout(timer)
  }, [indice])

  // Fica no fluxo, não em `absolute`: sobreposto ao conteúdo, ele colidia com o
  // texto nas telas mais altas e sumia no meio da leitura.
  return (
    <div className="mt-12 flex w-full flex-col items-center gap-4">
      <motion.span
        className="flex items-center gap-2"
        style={{ fontSize: 13, color: 'rgba(237,242,239,0.75)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: visivel ? 1 : 0, y: visivel ? [0, 3, 0] : 0 }}
        transition={{
          opacity: { duration: 0.5 },
          y: { duration: 1.8, repeat: Infinity, ease: 'easeInOut' },
        }}
      >
        toque para continuar
        <ChevronDown className="size-4" />
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
