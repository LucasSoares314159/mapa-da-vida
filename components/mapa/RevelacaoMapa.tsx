'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowUp, FileText } from 'lucide-react'
import { MapaFlow } from './MapaFlow'
import { NewsletterCTA } from '@/components/NewsletterCTA'
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

  function voltarAoMapa() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

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

      {/* React Flow — altura fixa para não interferir no scroll da página */}
      <div style={{ height: 'calc(100vh - 52px)' }}>
        <MapaFlow mapa={mapa} minimal />
      </div>

      {/* Seção de análise — largura total, fundo escuro */}
      <div
        ref={analiseRef}
        className={cn('transition-opacity duration-700', revealed ? 'opacity-100' : 'opacity-0')}
        style={{ backgroundColor: '#2A3F45', padding: '48px 32px' }}
      >
        <div className="mx-auto flex max-w-lg flex-col items-center gap-8">
          {/* Botão discreto para voltar ao mapa */}
          <button
            onClick={voltarAoMapa}
            className="flex items-center gap-1.5 transition-opacity hover:opacity-70"
            style={{ color: '#a8c4bc', fontSize: 13 }}
          >
            <ArrowUp className="size-3.5" />
            Ver mapa
          </button>

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
          <div className="flex items-center justify-center gap-2">
            {(
              [
                { tipo: 'verde',    bg: 'rgba(87,170,143,0.15)', cor: '#57AA8F', count: totais.verde },
                { tipo: 'amarelo',  bg: 'rgba(212,168,67,0.15)', cor: '#D4A843', count: totais.amarelo },
                { tipo: 'vermelho', bg: 'rgba(192,80,80,0.15)',  cor: '#C05050', count: totais.vermelho },
              ] as const
            ).map(({ tipo, bg, cor, count }) => (
              <span
                key={tipo}
                className="flex items-center text-sm font-medium"
                style={{ backgroundColor: bg, color: cor, borderRadius: 20, padding: '4px 10px', gap: 5 }}
              >
                <span
                  style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: cor, flexShrink: 0, display: 'inline-block' }}
                />
                {count}
              </span>
            ))}
          </div>

          {/* CTA Newsletter */}
          <div className="w-full">
            <NewsletterCTA utm_campaign="pos-mapa" />
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
