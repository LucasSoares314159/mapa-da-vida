'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react'
import type { MaterialApoio } from '@/lib/materiais'
import { normalizarUrlEmbed } from '@/lib/conteudo-modulos'

type Props = {
  material: MaterialApoio
  index: number
  total: number
  anteriorId: string | null
  proximoId: string | null
}

export function MaterialApoioPagina({
  material,
  index,
  total,
  anteriorId,
  proximoId,
}: Props) {
  const router = useRouter()

  useEffect(() => {
    if (anteriorId) router.prefetch(`/content/material/${anteriorId}`)
    if (proximoId) router.prefetch(`/content/material/${proximoId}`)
  }, [anteriorId, proximoId, router])

  // Mesma allowlist do bloco de embed dos módulos: o quadro monta um iframe,
  // então uma URL de host desconhecido não deve virar frame.
  const quadroUrl = normalizarUrlEmbed(material.quadroUrl)

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-8">
      <div className="flex flex-col gap-6">
        {/* Cabeçalho com navegação */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-sm" style={{ color: '#4a6b62' }}>
              Material {index} de {total}
            </span>
            <h1 className="font-heading text-xl font-bold leading-snug" style={{ color: '#1a2e29' }}>
              {material.titulo}
            </h1>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={() => anteriorId && router.push(`/content/material/${anteriorId}`)}
              disabled={!anteriorId}
              className="flex size-9 items-center justify-center rounded-full transition-opacity"
              style={{
                border: '1px solid #c8d8d2',
                color: '#1a2e29',
                opacity: anteriorId ? 1 : 0.35,
                cursor: anteriorId ? 'pointer' : 'default',
              }}
              aria-label="Material anterior"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              onClick={() => proximoId && router.push(`/content/material/${proximoId}`)}
              disabled={!proximoId}
              className="flex size-9 items-center justify-center rounded-full transition-opacity"
              style={{
                border: '1px solid #c8d8d2',
                color: '#1a2e29',
                opacity: proximoId ? 1 : 0.35,
                cursor: proximoId ? 'pointer' : 'default',
              }}
              aria-label="Próximo material"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>

        {/* Quadro interativo — é o conteúdo principal da página, então ocupa
            altura de viewport em vez da altura de um bloco dentro de texto. */}
        {quadroUrl ? (
          <div className="flex flex-col gap-2">
            <iframe
              src={quadroUrl}
              title={`Quadro: ${material.titulo}`}
              loading="lazy"
              sandbox="allow-scripts allow-same-origin allow-popups"
              referrerPolicy="no-referrer"
              className="w-full rounded-xl"
              style={{
                height: 'min(70vh, 720px)',
                minHeight: 420,
                border: '0.5px solid #c8d8d2',
                backgroundColor: '#ffffff',
              }}
            />
            <a
              href={quadroUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-fit items-center gap-1.5 text-sm transition-opacity hover:opacity-70"
              style={{ color: '#57AA8F' }}
            >
              Abrir o quadro em tela cheia
              <ExternalLink className="size-3" />
            </a>
          </div>
        ) : (
          <div
            className="flex items-center justify-center rounded-xl px-6 py-12 text-center"
            style={{ border: '0.5px solid #c8d8d2', backgroundColor: '#f0f7f5' }}
          >
            <span className="text-sm" style={{ color: '#4a6b62' }}>
              Material em breve.
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
