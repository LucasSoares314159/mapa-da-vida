'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, FileText } from 'lucide-react'
import { MapaFlow } from './MapaFlow'
import { cn } from '@/lib/utils'
import type { Mapa } from '@/types'

type Props = {
  mapa: Mapa
  analise: string
}

export function RevelacaoMapa({ mapa, analise }: Props) {
  const [revealed, setRevealed] = useState(false)
  const analiseRef = useRef<HTMLDivElement>(null)

  const totais = { verde: 0, amarelo: 0, vermelho: 0 }
  for (const area of mapa.areas ?? []) totais[area.status]++

  useEffect(() => {
    const revelarEScrollar = () => {
      setRevealed(true)
      analiseRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    const revelar = () => {
      setRevealed(true)
      clearTimeout(timer)
    }

    const timer = setTimeout(revelarEScrollar, 3000)
    window.addEventListener('scroll', revelar, { once: true })

    return () => {
      clearTimeout(timer)
      window.removeEventListener('scroll', revelar)
    }
  }, [])

  return (
    <div>
      {/* Área do mapa — full screen */}
      <div className="relative" style={{ height: '100svh' }}>
        {/* Header fixo sobre o mapa */}
        <header
          className="absolute top-0 left-0 right-0 z-10 bg-white"
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

            {/* Botão Ver diagnóstico */}
            <div className="flex justify-end">
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
            </div>
          </div>
        </header>

        {/* React Flow — ocupa a área abaixo do header */}
        <div style={{ paddingTop: 52, height: '100%' }}>
          <MapaFlow mapa={mapa} minimal />
        </div>
      </div>

      {/* Card de análise */}
      <div
        ref={analiseRef}
        className={cn(
          'px-6 py-16 transition-opacity duration-700',
          revealed ? 'opacity-100' : 'opacity-0'
        )}
        style={{ backgroundColor: '#f7faf9' }}
      >
        <div
          className="mx-auto flex max-w-lg flex-col items-center gap-8"
          style={{
            backgroundColor: '#2A3F45',
            borderRadius: 12,
            padding: '40px 32px',
          }}
        >
          {/* Texto da análise em Lora itálico */}
          <p
            className="text-center leading-relaxed"
            style={{
              fontFamily: 'var(--font-lora), Lora, serif',
              fontStyle: 'italic',
              fontSize: '1.1rem',
              color: '#EDF2EF',
              lineHeight: 1.75,
            }}
          >
            {analise}
          </p>

          {/* Pills de cores centralizadas */}
          <div className="flex items-center justify-center gap-6">
            <span className="flex items-center gap-2 text-sm" style={{ color: '#a8c4bc' }}>
              🟢 <span className="font-semibold text-white">{totais.verde}</span>
            </span>
            <span className="flex items-center gap-2 text-sm" style={{ color: '#a8c4bc' }}>
              🟡 <span className="font-semibold text-white">{totais.amarelo}</span>
            </span>
            <span className="flex items-center gap-2 text-sm" style={{ color: '#a8c4bc' }}>
              🔴 <span className="font-semibold text-white">{totais.vermelho}</span>
            </span>
          </div>

          {/* Botão Ver diagnóstico completo */}
          <Link
            href={`/diagnostico/${mapa.id}`}
            className="flex items-center gap-2 text-white transition-opacity hover:opacity-90"
            style={{
              backgroundColor: '#57AA8F',
              borderRadius: 10,
              padding: '14px 28px',
              fontSize: 15,
              fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            Ver diagnóstico completo →
          </Link>
        </div>
      </div>
    </div>
  )
}
