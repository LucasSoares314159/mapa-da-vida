'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react'
import type { Live } from '@/lib/lives'

type Props = {
  live: Live
  index: number
  total: number
  anteriorId: string | null
  proximoId: string | null
}

export function LiveAula({ live, index, total, anteriorId, proximoId }: Props) {
  const router = useRouter()

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-8">
      <div className="flex flex-col gap-6">
        {/* Cabeçalho com navegação */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-sm" style={{ color: '#4a6b62' }}>
              Aula {index} de {total}
            </span>
            <h1 className="font-heading text-xl font-bold leading-snug" style={{ color: '#1a2e29' }}>
              {live.titulo}
            </h1>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={() => anteriorId && router.push(`/content/live/${anteriorId}`)}
              disabled={!anteriorId}
              className="flex size-9 items-center justify-center rounded-full transition-opacity"
              style={{
                border: '1px solid #c8d8d2',
                color: '#1a2e29',
                opacity: anteriorId ? 1 : 0.35,
                cursor: anteriorId ? 'pointer' : 'default',
              }}
              aria-label="Aula anterior"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              onClick={() => proximoId && router.push(`/content/live/${proximoId}`)}
              disabled={!proximoId}
              className="flex size-9 items-center justify-center rounded-full transition-opacity"
              style={{
                border: '1px solid #c8d8d2',
                color: '#1a2e29',
                opacity: proximoId ? 1 : 0.35,
                cursor: proximoId ? 'pointer' : 'default',
              }}
              aria-label="Próxima aula"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>

        {/* Vídeo */}
        {live.videoId ? (
          <div
            className="w-full overflow-hidden rounded-xl"
            style={{ aspectRatio: '16/9', backgroundColor: '#0c0f0f' }}
          >
            <iframe
              src={`https://www.youtube.com/embed/${live.videoId}`}
              title={live.titulo}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="size-full"
              style={{ border: 'none' }}
            />
          </div>
        ) : (
          <div
            className="flex w-full items-center justify-center rounded-xl"
            style={{
              aspectRatio: '16/9',
              backgroundColor: '#f0f7f5',
              border: '0.5px solid #c8d8d2',
            }}
          >
            <span className="text-sm" style={{ color: '#4a6b62' }}>
              Vídeo em breve
            </span>
          </div>
        )}

        {/* Materiais */}
        {live.materiais.length > 0 && (
          <div className="flex flex-col gap-3">
            <span className="text-sm font-semibold" style={{ color: '#1a2e29' }}>
              Material da aula:
            </span>
            <ul className="flex flex-col gap-2">
              {live.materiais.map((material, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span style={{ color: '#4a6b62' }}>•</span>
                  <a
                    href={material.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm transition-opacity hover:opacity-70"
                    style={{ color: '#57AA8F' }}
                  >
                    Acessar material
                    <ExternalLink className="size-3" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
