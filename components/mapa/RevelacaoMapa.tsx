'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { ArrowLeft, BookOpen, FileText, Sparkles } from 'lucide-react'
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
          areas={mapa.areas ?? []}
          onVerMapa={() => setVisualizacao('mapa')}
        />
      ) : (
        <div className="flex flex-col" style={{ minHeight: 'calc(100vh - 52px)' }}>
          <div className="flex-1" style={{ minHeight: '60vh' }}>
            <MapaFlow mapa={mapa} minimal />
          </div>

          {/* Saídas da tela do mapa. Sem elas a pessoa fica sem caminho óbvio:
              o diagnóstico completo ficava num link de 12px no header, e não
              havia nenhuma rota de volta para o conteúdo da Trilha. */}
          <div
            className="flex flex-col gap-3 px-6 py-6"
            style={{ borderTop: '0.5px solid #c8d8d2', backgroundColor: '#fff' }}
          >
            <div className="mx-auto flex w-full max-w-md flex-col gap-3">
              <Link
                href={`/diagnostico/${mapa.id}`}
                className="flex items-center justify-center gap-2 text-white transition-opacity hover:opacity-90"
                style={{
                  backgroundColor: '#57AA8F',
                  borderRadius: 10,
                  padding: '16px 24px',
                  fontSize: 16,
                  fontWeight: 500,
                }}
              >
                <FileText className="size-4" />
                Ver diagnóstico completo
              </Link>

              <Link
                href="/content"
                className="flex items-center justify-center gap-2 transition-opacity hover:opacity-80"
                style={{
                  border: '1.5px solid #57AA8F',
                  color: '#2A3F45',
                  borderRadius: 10,
                  padding: '14px 24px',
                  fontSize: 15,
                  fontWeight: 500,
                }}
              >
                <BookOpen className="size-4" />
                Ir para o conteúdo da Trilha
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
