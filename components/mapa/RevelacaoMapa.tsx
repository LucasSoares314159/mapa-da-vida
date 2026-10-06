'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { ArrowLeft, FileText, Sparkles } from 'lucide-react'
import { RevelacaoDiagnostico } from './RevelacaoDiagnostico'
import type { Diagnostico } from '@/lib/analise'
import type { Mapa } from '@/types'

/**
 * O fluxograma carrega só quando a aba é aberta.
 *
 * MapaFlow puxa @xyflow/react e seu CSS; importado de forma estática, ninguém
 * via o diagnóstico até todo o fluxograma baixar — mesmo sem nunca abrir esta
 * aba, que é o caso da maioria no primeiro acesso.
 */
const MapaFlow = dynamic(() => import('./MapaFlow').then((m) => m.MapaFlow), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="size-6 animate-spin rounded-full border-2 border-mt-green border-t-transparent" />
        <p className="text-sm text-mt-muted">Desenhando seu mapa…</p>
      </div>
    </div>
  ),
})

type Props = {
  mapa: Mapa
  diagnostico: Diagnostico
}

type Visualizacao = 'diagnostico' | 'mapa'

export function RevelacaoMapa({ mapa, diagnostico }: Props) {
  const [visualizacao, setVisualizacao] = useState<Visualizacao>('diagnostico')

  return (
    <div>
      {/* Header sticky — permanece visível durante o scroll */}
      <header
        className="sticky top-0 z-50 bg-white"
        style={{ borderBottom: '0.5px solid #c8d8d2' }}
      >
        <div
          className="mx-auto grid max-w-5xl items-center px-5"
          style={{ gridTemplateColumns: '1fr auto 1fr', height: 52 }}
        >
          {/* Botão Dashboard */}
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-sm font-medium transition-colors"
            style={{ color: '#57AA8F' }}
          >
            <ArrowLeft className="size-4" />
            Dashboard
          </Link>

          {/* Título central */}
          <h1
            className="text-center text-sm font-semibold whitespace-nowrap"
            style={{
              fontFamily: 'var(--font-space-grotesk), Space Grotesk, sans-serif',
              color: '#2A3F45',
            }}
          >
            Mapa da Vida
          </h1>

          {/* Alterna entre diagnóstico e mapa visual */}
          <div className="flex justify-end">
            {visualizacao === 'diagnostico' ? (
              <button
                onClick={() => setVisualizacao('mapa')}
                className="flex items-center gap-1.5 text-xs font-medium transition-opacity hover:opacity-80"
                style={{
                  backgroundColor: '#2A3F45',
                  color: '#EDF2EF',
                  borderRadius: 8,
                  padding: '6px 12px',
                }}
              >
                <Sparkles className="size-3.5" />
                Ver mapa completo
              </button>
            ) : (
              <Link
                href={`/diagnostico/${mapa.id}`}
                className="flex items-center gap-1.5 text-xs font-medium transition-opacity hover:opacity-80"
                style={{
                  backgroundColor: '#2A3F45',
                  color: '#EDF2EF',
                  borderRadius: 8,
                  padding: '6px 12px',
                }}
              >
                <FileText className="size-3.5" />
                Ver diagnóstico
              </Link>
            )}
          </div>
        </div>
      </header>

      {visualizacao === 'diagnostico' ? (
        <RevelacaoDiagnostico
          mapaId={mapa.id}
          diagnostico={diagnostico}
          onVerMapa={() => setVisualizacao('mapa')}
        />
      ) : (
        <div style={{ height: 'calc(100vh - 52px)' }}>
          <MapaFlow mapa={mapa} minimal />
        </div>
      )}
    </div>
  )
}
