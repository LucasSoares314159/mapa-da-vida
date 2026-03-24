'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { MapaFlow } from './MapaFlow'
import { Button } from '@/components/ui/button'
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
      <div className="relative" style={{ height: '100svh' }}>
        <Link
          href="/dashboard"
          className="absolute left-5 top-5 z-10 flex items-center gap-1.5 rounded-lg bg-white/80 px-3 py-2 text-sm font-medium backdrop-blur-sm transition-colors duration-200 hover:bg-white"
          style={{ color: '#2A3F45' }}
        >
          <ArrowLeft className="size-4" />
          Voltar
        </Link>
        <MapaFlow mapa={mapa} minimal />
      </div>

      <div
        ref={analiseRef}
        className={cn(
          'min-h-screen px-6 py-20 transition-opacity duration-700',
          revealed ? 'opacity-100' : 'opacity-0'
        )}
        style={{ backgroundColor: '#2A3F45' }}
      >
        <div className="mx-auto flex max-w-lg flex-col gap-12">
          <div className="flex flex-col gap-6">
            <p className="text-[1.35rem] font-medium leading-relaxed text-white">{analise}</p>
            <div className="flex gap-6">
              <span className="flex items-center gap-2 text-sm" style={{ color: '#a8c4bc' }}>🟢 <span className="font-medium text-white">{totais.verde}</span></span>
              <span className="flex items-center gap-2 text-sm" style={{ color: '#a8c4bc' }}>🟡 <span className="font-medium text-white">{totais.amarelo}</span></span>
              <span className="flex items-center gap-2 text-sm" style={{ color: '#a8c4bc' }}>🔴 <span className="font-medium text-white">{totais.vermelho}</span></span>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <p className="text-[15px] leading-relaxed" style={{ color: '#6f8f87' }}>
              Agora você tem o diagnóstico. A pergunta que fica é: o que você vai fazer com ele?
            </p>
            <Button
              asChild
              className="h-12 w-full bg-white text-zinc-950 hover:bg-zinc-100 sm:w-auto sm:self-start sm:px-8"
            >
              <Link href="/dashboard">Definir meu objetivo</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
