'use client'

import { useEffect, useRef, useState } from 'react'
import type { DragControls } from 'motion/react'
import { Pencil, Trash2, Pause, RotateCcw, CalendarDays, GripVertical } from 'lucide-react'
import { SeletorRitmo } from './SeletorRitmo'
import { diasAtePartirDeHoje } from '@/lib/prazo'
import type { Objetivo, NomePilar, RitmoObjetivo } from '@/types'

const PILAR_COR: Record<NomePilar, string> = {
  corpo: '#57AA8F',
  mente: '#D4A843',
  espirito: '#6B7FD7',
}

const PILAR_LABEL: Record<NomePilar, string> = {
  corpo: 'Corpo',
  mente: 'Mente',
  espirito: 'Espírito',
}

const formatarDia = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })

export interface ObjetivoCardProps {
  objetivo: Objetivo
  processingId: string | null
  /** Controles de drag do Reorder.Item; ausente em card não arrastável (concluído) */
  dragControls?: DragControls
  /** Move o card com o teclado, para reordenar sem mouse */
  onMoverTeclado?: (direcao: -1 | 1) => void
  onConcluir: (id: string) => void
  onPausar: (id: string) => void
  onRetomar: (id: string) => void
  onEditar: () => void
  onArquivar: (id: string) => void
  onDefinirRitmo: (id: string, ritmo: RitmoObjetivo) => void
}

export function ObjetivoCard({
  objetivo,
  processingId,
  dragControls,
  onMoverTeclado,
  onConcluir,
  onPausar,
  onRetomar,
  onEditar,
  onArquivar,
  onDefinirRitmo,
}: ObjetivoCardProps) {
  const [confirmandoArquivar, setConfirmandoArquivar] = useState(false)
  const confirmRef = useRef<HTMLDivElement>(null)
  const concluido = objetivo.status === 'concluido'
  const isProcessing = processingId !== null

  // Atraso vale para ativo E pausado: um objetivo pausado com prazo vencido
  // continua vencido — antes o aviso só aparecia em 'ativo' e sumia ao pausar.
  const diasRestantes = objetivo.data_alvo ? diasAtePartirDeHoje(objetivo.data_alvo) : null
  const atrasado = !concluido && diasRestantes !== null && diasRestantes < 0
  const diasDeAtraso = atrasado ? Math.abs(diasRestantes!) : 0

  const possivelComparacao =
    objetivo.radar_faz_sentido === false || objetivo.radar_por_mim === false

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (confirmRef.current && !confirmRef.current.contains(event.target as Node)) {
        setConfirmandoArquivar(false)
      }
    }
    if (confirmandoArquivar) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [confirmandoArquivar])

  return (
    <div
      className={`flex flex-col gap-3 rounded-card border p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-[opacity,border-color,background] duration-300 ${
        concluido ? 'border-[#d4e8df] bg-[#f9fdfb] opacity-[0.58]' : 'border-[#e2ece8] bg-white'
      }`}
    >
      <div className="flex items-start gap-2">
        {/* Handle de arraste — só em card reordenável.
            Handle dedicado em vez do card inteiro: no mobile, arrastar para rolar
            a página moveria o card sem intenção. */}
        {dragControls ? (
          <button
            type="button"
            aria-label={`Reordenar: ${objetivo.texto}. Use as setas para cima e para baixo.`}
            onPointerDown={(e) => {
              if (isProcessing) return
              e.preventDefault()
              dragControls.start(e)
            }}
            onKeyDown={(e) => {
              if (!onMoverTeclado) return
              if (e.key === 'ArrowUp') { e.preventDefault(); onMoverTeclado(-1) }
              if (e.key === 'ArrowDown') { e.preventDefault(); onMoverTeclado(1) }
            }}
            disabled={isProcessing}
            className="mt-0.5 flex size-6 shrink-0 cursor-grab touch-none items-center justify-center rounded-md text-mt-border transition-colors hover:bg-mt-off-white hover:text-mt-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mt-green active:cursor-grabbing disabled:cursor-not-allowed"
          >
            <GripVertical size={14} />
          </button>
        ) : (
          <span aria-hidden className="mt-0.5 size-6 shrink-0" />
        )}

        {/* Checkbox de conclusão */}
        <button
          onClick={() => onConcluir(objetivo.id)}
          disabled={isProcessing}
          aria-label={concluido ? `Reabrir: ${objetivo.texto}` : `Concluir: ${objetivo.texto}`}
          className={`mt-0.5 flex size-[22px] shrink-0 items-center justify-center rounded-full border-[1.5px] transition-colors disabled:cursor-not-allowed ${
            concluido
              ? 'border-mt-green bg-mt-green'
              : 'border-mt-border bg-transparent hover:border-mt-green'
          } ${isProcessing && processingId !== objetivo.id ? 'opacity-60' : ''}`}
        >
          <svg
            width="11"
            height="9"
            viewBox="0 0 12 10"
            fill="none"
            aria-hidden
            style={{
              opacity: concluido ? 1 : 0,
              transform: concluido ? 'scale(1)' : 'scale(0.4)',
              transition: 'opacity 0.2s, transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            }}
          >
            <polyline
              points="1.5,5.5 4.5,8.5 10.5,2"
              stroke="white"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Conteúdo */}
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <span
            className={`text-[15px] leading-snug transition-colors duration-300 ${
              concluido ? 'text-mt-muted line-through' : 'text-mt-black'
            }`}
          >
            {objetivo.texto}
          </span>

          {/* Data alvo — em vermelho quando o prazo passou.
              O atraso pinta a data (o fato do calendário) e não o semáforo, que é
              a percepção declarada pela pessoa. São dois sinais diferentes. */}
          {(objetivo.data_alvo || concluido) && (
            <div
              className={`flex items-center gap-1 text-[11px] ${
                atrasado ? 'font-medium text-mt-red' : 'text-mt-muted'
              }`}
            >
              <CalendarDays size={11} />
              {concluido ? (
                objetivo.concluido_em
                  ? `Concluído em ${formatarDia(objetivo.concluido_em)}`
                  : 'Concluído'
              ) : atrasado ? (
                `Até ${formatarDia(objetivo.data_alvo!)} · ${diasDeAtraso} ${diasDeAtraso === 1 ? 'dia' : 'dias'} de atraso`
              ) : (
                `Até ${formatarDia(objetivo.data_alvo!)}`
              )}
            </div>
          )}

          {/* Chips de status */}
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="rounded-badge px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.04em] text-white"
              style={{ background: PILAR_COR[objetivo.pilar] }}
            >
              {PILAR_LABEL[objetivo.pilar]}
            </span>

            {/* Semáforo de ritmo. Objetivo concluído não tem ritmo: o ritmo de
                algo que já terminou não diz nada. */}
            {!concluido && (
              <SeletorRitmo
                ritmo={objetivo.ritmo}
                textoObjetivo={objetivo.texto}
                desabilitado={isProcessing}
                onDefinir={(r) => onDefinirRitmo(objetivo.id, r)}
              />
            )}

            {!concluido && possivelComparacao && (
              <span
                title="O radar de coerência indicou que esse objetivo pode ser fruto de comparação."
                className="rounded-badge border border-mt-red px-2.5 py-[3px] text-[11px] text-mt-red"
                style={{ background: 'rgba(192,80,80,0.1)' }}
              >
                Fruto de comparação?
              </span>
            )}

            {concluido && (
              <span
                className="rounded-badge border px-2.5 py-[3px] text-[11px]"
                style={{ border: '1px solid #a8d5c2', color: '#3d8f72', background: '#f0faf5' }}
              >
                Concluído
              </span>
            )}

            {objetivo.status === 'pausado' && (
              <span
                className="rounded-badge border px-2.5 py-[3px] text-[11px]"
                style={{ border: '1px solid #b88a30', color: '#b88a30', background: 'rgba(212,168,67,0.15)' }}
              >
                Pausado
              </span>
            )}
          </div>
        </div>

        {/* Ações — pausar/retomar vieram da linha de chips para cá: eram chips
            visualmente idênticos aos informativos, então pareciam rótulo, não botão. */}
        <div className="flex shrink-0 items-center gap-0.5">
          {!concluido && objetivo.status === 'ativo' && (
            <button
              onClick={() => onPausar(objetivo.id)}
              disabled={isProcessing}
              aria-label={`Pausar: ${objetivo.texto}`}
              title="Pausar"
              className="flex size-7 items-center justify-center rounded-md text-mt-muted transition-colors hover:bg-mt-off-white hover:text-mt-black disabled:cursor-not-allowed disabled:hover:bg-transparent"
            >
              <Pause size={13} />
            </button>
          )}
          {objetivo.status === 'pausado' && (
            <button
              onClick={() => onRetomar(objetivo.id)}
              disabled={isProcessing}
              aria-label={`Retomar: ${objetivo.texto}`}
              title="Retomar"
              className="flex size-7 items-center justify-center rounded-md text-mt-yellow transition-colors hover:bg-mt-off-white disabled:cursor-not-allowed disabled:hover:bg-transparent"
            >
              <RotateCcw size={13} />
            </button>
          )}
          <button
            onClick={onEditar}
            disabled={isProcessing}
            aria-label={`Editar: ${objetivo.texto}`}
            title="Editar"
            className="flex size-7 items-center justify-center rounded-md text-mt-muted transition-colors hover:bg-mt-off-white hover:text-mt-black disabled:cursor-not-allowed disabled:hover:bg-transparent"
          >
            <Pencil size={13} />
          </button>
          <div className="relative" ref={confirmRef}>
            <button
              onClick={() => setConfirmandoArquivar(true)}
              disabled={isProcessing}
              aria-label={`Arquivar: ${objetivo.texto}`}
              title="Arquivar"
              className="flex size-7 items-center justify-center rounded-md text-mt-muted transition-colors hover:bg-red-50 hover:text-mt-red disabled:cursor-not-allowed disabled:hover:bg-transparent"
            >
              <Trash2 size={13} />
            </button>
            {confirmandoArquivar && (
              <div className="absolute right-0 top-full z-10 mt-1 flex w-40 flex-col gap-2 rounded-lg border border-mt-border bg-white px-3 py-2 shadow-lg">
                <p className="text-[11px] leading-snug text-mt-muted">Arquivar este objetivo?</p>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => { onArquivar(objetivo.id); setConfirmandoArquivar(false) }}
                    className="flex-1 rounded-md bg-mt-red py-1 text-[11px] font-medium text-white transition-opacity hover:opacity-90"
                  >
                    Arquivar
                  </button>
                  <button
                    onClick={() => setConfirmandoArquivar(false)}
                    className="flex-1 rounded-md border border-mt-border py-1 text-[11px] font-medium text-mt-muted transition-colors hover:bg-mt-off-white"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
