'use client'

import { useEffect, useRef, useState } from 'react'
import { IndicadorStatus, PontoStatus } from '@/components/ui/indicador-status'
import { RITMOS } from '@/types'
import type { RitmoObjetivo } from '@/types'

// Semáforo do objetivo: verde avançando, amarelo travado, vermelho parado.
//
// O ritmo é DECLARADO, não calculado a partir do prazo — prazo folgado não
// significa que o objetivo está andando. null = nunca declarou, que é diferente
// de "parado": por isso o estado inicial é neutro e convida ao primeiro toque.
export function SeletorRitmo({
  ritmo,
  textoObjetivo,
  desabilitado,
  onDefinir,
}: {
  ritmo: RitmoObjetivo | null | undefined
  textoObjetivo: string
  desabilitado: boolean
  onDefinir: (ritmo: RitmoObjetivo) => void
}) {
  const [aberto, setAberto] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!aberto) return

    function aoClicarFora(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setAberto(false)
      }
    }
    function aoTeclar(e: KeyboardEvent) {
      if (e.key === 'Escape') setAberto(false)
    }

    document.addEventListener('mousedown', aoClicarFora)
    document.addEventListener('keydown', aoTeclar)
    return () => {
      document.removeEventListener('mousedown', aoClicarFora)
      document.removeEventListener('keydown', aoTeclar)
    }
  }, [aberto])

  const atual = ritmo ? RITMOS[ritmo] : null

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        disabled={desabilitado}
        aria-haspopup="menu"
        aria-expanded={aberto}
        aria-label={`Ritmo de "${textoObjetivo}": ${atual ? atual.label : 'não definido'}`}
        className="transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <IndicadorStatus
          tom={atual ? atual.tom : 'neutro'}
          label={atual ? atual.label : 'Definir ritmo'}
        />
      </button>

      {aberto && (
        <div
          role="menu"
          className="absolute left-0 top-full z-20 mt-1.5 flex w-52 flex-col gap-0.5 rounded-xl border border-mt-border bg-white p-1.5 shadow-lg"
        >
          {(Object.keys(RITMOS) as RitmoObjetivo[]).map((chave) => {
            const r = RITMOS[chave]
            const selecionado = ritmo === chave

            return (
              <button
                key={chave}
                role="menuitemradio"
                aria-checked={selecionado}
                onClick={() => {
                  setAberto(false)
                  if (!selecionado) onDefinir(chave)
                }}
                className={`flex flex-col gap-0.5 rounded-lg px-2.5 py-2 text-left transition-colors ${
                  selecionado ? 'bg-mt-off-white' : 'hover:bg-mt-off-white/60'
                }`}
              >
                <span className="flex items-center gap-2 text-[13px] font-medium text-mt-black">
                  <PontoStatus tom={r.tom} />
                  {r.label}
                </span>
                <span className="pl-[15px] text-[11px] leading-snug text-mt-muted">
                  {r.descricao}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
