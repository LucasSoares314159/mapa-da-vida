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
            <span className="text-sm text-mt-apoio">
              Material {index} de {total}
            </span>
            <h1 className="font-heading text-titulo font-medium text-mt-green-dark">
              {material.titulo}
            </h1>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={() => anteriorId && router.push(`/content/material/${anteriorId}`)}
              disabled={!anteriorId}
              className="flex size-11 items-center justify-center rounded-full border border-mt-border text-mt-green-dark transition-colors hover:border-mt-green disabled:cursor-default disabled:opacity-35"
              aria-label="Material anterior"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              onClick={() => proximoId && router.push(`/content/material/${proximoId}`)}
              disabled={!proximoId}
              className="flex size-11 items-center justify-center rounded-full border border-mt-border text-mt-green-dark transition-colors hover:border-mt-green disabled:cursor-default disabled:opacity-35"
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
              className="h-[min(70vh,720px)] min-h-[420px] w-full rounded-card border-linha border-mt-border bg-white"
            />
            <a
              href={quadroUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-fit items-center gap-1.5 text-sm font-medium text-mt-green-dark transition-colors hover:text-mt-green"
            >
              Abrir o quadro em tela cheia
              <ExternalLink className="size-3" />
            </a>
          </div>
        ) : (
          <div
            className="flex items-center justify-center rounded-xl px-6 py-12 text-center border-linha border-mt-border bg-mt-green-sup"
          >
            <span className="text-sm text-mt-apoio">
              Material em breve.
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
