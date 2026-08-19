'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Check, BookOpen } from 'lucide-react'
import { marcarAula } from '@/app/actions/progresso'
import { MODULOS, type Modulo } from '@/lib/modulos'
import type { Bloco } from '@/lib/conteudo-modulos'
import { LeituraModuloOverlay } from './LeituraModuloOverlay'
import { ModulosSidebar } from './ModulosSidebar'

type Props = {
  modulo: Modulo
  index: number
  total: number
  anteriorId: string | null
  proximoId: string | null
  moduloIndex: number
  aulasConcluidas: number[]
  blocos: Bloco[]
}

export function ModuloAula({
  modulo,
  index,
  total,
  anteriorId,
  proximoId,
  moduloIndex,
  aulasConcluidas,
  blocos,
}: Props) {
  const router = useRouter()
  const [concluidas, setConcluidas] = useState<number[]>(aulasConcluidas)
  const [leituraAberta, setLeituraAberta] = useState(false)
  const concluida = concluidas.includes(moduloIndex)

  useEffect(() => {
    if (anteriorId) router.prefetch(`/content/modulo/${anteriorId}`)
    if (proximoId) router.prefetch(`/content/modulo/${proximoId}`)
  }, [anteriorId, proximoId, router])

  function toggleConcluida() {
    if (concluida) {
      setConcluidas(concluidas.filter((i) => i !== moduloIndex))
      marcarAula(moduloIndex, false)
      return
    }

    setConcluidas([...concluidas, moduloIndex])
    marcarAula(moduloIndex, true)

    if (proximoId) {
      router.push(`/content/modulo/${proximoId}`)
    }
  }

  return (
    <div className="flex flex-col">
    <div className="mx-auto w-full max-w-6xl px-6 py-8 pb-28">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
      <div className="flex flex-1 flex-col gap-6 min-w-0">
        {/* Cabeçalho com navegação */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-sm" style={{ color: '#4a6b62' }}>
              Aula {index} de {total}
            </span>
            <h1 className="font-heading text-xl font-bold leading-snug" style={{ color: '#1a2e29' }}>
              {modulo.titulo}
            </h1>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={() => anteriorId && router.push(`/content/modulo/${anteriorId}`)}
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
              onClick={() => proximoId && router.push(`/content/modulo/${proximoId}`)}
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
        {modulo.videoId ? (
          <div
            className="w-full overflow-hidden rounded-xl"
            style={{ aspectRatio: '16/9', backgroundColor: '#0c0f0f' }}
          >
            <iframe
              src={`https://www.youtube.com/embed/${modulo.videoId}`}
              title={modulo.titulo}
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

        {/* Conteúdo escrito */}
        {blocos.length > 0 && (
          <button
            onClick={() => setLeituraAberta(true)}
            className="flex items-center justify-center gap-2 rounded-xl px-5 py-4 text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#f0f7f5', border: '0.5px solid #c8d8d2', color: '#1a2e29' }}
          >
            <BookOpen className="size-4" style={{ color: '#57AA8F' }} />
            Ler conteúdo da aula
          </button>
        )}
      </div>

      <ModulosSidebar modulos={MODULOS} moduloAtualId={modulo.id} concluidas={concluidas} />
      </div>
    </div>

    <LeituraModuloOverlay
      titulo={modulo.titulo}
      blocos={blocos}
      aberto={leituraAberta}
      onFechar={() => setLeituraAberta(false)}
    />

    {/* Ação de conclusão — fixa no rodapé */}
    <div
      className="sticky bottom-0 flex justify-center px-6 py-4"
      style={{ backgroundColor: '#ffffff', borderTop: '0.5px solid #c8d8d2' }}
    >
      <button
        onClick={toggleConcluida}
        className="flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
        style={
          concluida
            ? { backgroundColor: '#ffffff', color: '#57AA8F', border: '1px solid #57AA8F' }
            : { backgroundColor: '#57AA8F', color: '#ffffff' }
        }
        aria-label={concluida ? 'Desmarcar aula como concluída' : 'Marcar aula como concluída'}
      >
        {concluida ? (
          <>
            <Check className="size-4" strokeWidth={3} />
            Aula concluída
          </>
        ) : (
          'Marcar aula como concluída'
        )}
      </button>
    </div>
    </div>
  )
}
