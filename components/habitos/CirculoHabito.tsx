'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { ICONE_HABITO } from './iconesHabito'
import type { IconeHabito } from '@/types'
import type { TipoCelebracao } from '@/hooks/useCelebracao'

// Quanto tempo segurar para marcar. Segurar em vez de tocar evita marcação sem
// querer (o círculo é grande e fica onde o polegar rola a tela) e a espera,
// com o círculo enchendo, faz parte da recompensa. A transição do preenchimento
// usa a mesma duração (duration-[550ms] abaixo) — mudou um, mude o outro.
export const TEMPO_SEGURAR_MS = 550

// Toque mais curto que isso, sem completar, vira a dica "segure para marcar".
const TOQUE_CURTO_MS = 250

// Rotações das partículas. Classes literais para o Tailwind encontrá-las.
const PARTICULAS = [
  { giro: 'rotate-0', cor: 'bg-mt-green', forma: 'rounded-full' },
  { giro: 'rotate-[45deg]', cor: 'bg-mt-green-dark', forma: 'rounded-full' },
  { giro: 'rotate-[72deg]', cor: 'bg-mt-yellow', forma: 'rounded-[2px]' },
  { giro: 'rotate-[117deg]', cor: 'bg-mt-green', forma: 'rounded-full' },
  { giro: 'rotate-[144deg]', cor: 'bg-mt-green-dark', forma: 'rounded-full' },
  { giro: 'rotate-[189deg]', cor: 'bg-mt-yellow', forma: 'rounded-[2px]' },
  { giro: 'rotate-[216deg]', cor: 'bg-mt-green', forma: 'rounded-full' },
  { giro: 'rotate-[261deg]', cor: 'bg-mt-green-dark', forma: 'rounded-full' },
  { giro: 'rotate-[288deg]', cor: 'bg-mt-yellow', forma: 'rounded-[2px]' },
  { giro: 'rotate-[333deg]', cor: 'bg-mt-green', forma: 'rounded-full' },
]

// Anel: um segmento por vez da meta semanal, num círculo de raio 64 (viewBox 140).
const RAIO = 64
const CIRCUNFERENCIA = 2 * Math.PI * RAIO

function trilho(meta: number): string {
  const vao = meta === 1 ? 0 : 7
  return `${(CIRCUNFERENCIA / meta - vao).toFixed(2)} ${vao}`
}

function preenchido(meta: number, n: number): string {
  const vao = meta === 1 ? 0 : 7
  const seg = (CIRCUNFERENCIA / meta - vao).toFixed(2)
  const partes = Array.from({ length: Math.min(n, meta) }, () => `${seg} ${vao}`)
  partes.push(`0 ${CIRCUNFERENCIA.toFixed(2)}`)
  return partes.join(' ')
}

type Props = {
  nome: string
  icone: IconeHabito
  meta: number
  /** Feitos na semana corrente, contando hoje. */
  feitosSemana: number
  feito: boolean
  /** Celebração em curso neste círculo, ou null. */
  celebrando: TipoCelebracao | null
  onAlternar: () => void
  onToqueCurto?: () => void
  /** compacto: a faixa de hábitos no topo da Trilha. */
  tamanho?: 'normal' | 'compacto'
  /** Só desenha (prévia do formulário): sem segurar, sem foco, sem leitor de tela. */
  estatico?: boolean
  /** O nome abaixo do círculo vira link para editar. O círculo continua só marcando. */
  hrefEditar?: string
}

export function CirculoHabito({
  nome,
  icone,
  meta,
  feitosSemana,
  feito,
  celebrando,
  onAlternar,
  onToqueCurto,
  tamanho = 'normal',
  estatico = false,
  hrefEditar,
}: Props) {
  const [segurando, setSegurando] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inicio = useRef(0)
  const completou = useRef(false)

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current)
  }, [])

  const Icone = ICONE_HABITO[icone]
  const compacto = tamanho === 'compacto'
  const cumpriu = feitosSemana >= meta
  // Enquanto segura um hábito feito, o círculo esvazia: é a prévia do desmarcar.
  const cheio = feito !== segurando

  function cancelar() {
    if (timer.current) clearTimeout(timer.current)
    timer.current = null
    setSegurando(false)
  }

  function apertar(e: React.PointerEvent) {
    if (e.button !== 0) return
    inicio.current = Date.now()
    completou.current = false
    setSegurando(true)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      completou.current = true
      timer.current = null
      setSegurando(false)
      onAlternar()
    }, TEMPO_SEGURAR_MS)
  }

  function soltar() {
    const foiToqueCurto = !completou.current && Date.now() - inicio.current < TOQUE_CURTO_MS
    cancelar()
    if (foiToqueCurto) onToqueCurto?.()
  }

  function teclado(e: React.KeyboardEvent) {
    // Teclado não tem "segurar": Enter ou Espaço marcam direto.
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onAlternar()
    }
  }

  const rotuloSemana = cumpriu
    ? 'semana cumprida'
    : meta === 7
      ? `${feitosSemana} de 7 dias`
      : `${feitosSemana} de ${meta} na semana`

  return (
    <div className={cn('flex flex-col items-center', compacto ? 'gap-2' : 'gap-3')}>
      <div className={cn('relative', compacto ? 'size-[72px]' : 'size-[140px]')}>
        {celebrando && (
          <div
            aria-hidden
            className="absolute inset-[10%] animate-habito-onda rounded-full bg-mt-green motion-reduce:hidden"
          />
        )}

        <svg viewBox="0 0 140 140" aria-hidden className="absolute inset-0 size-full -rotate-90">
          <circle cx="70" cy="70" r={RAIO} fill="none" strokeWidth="6" className="stroke-mt-border" strokeDasharray={trilho(meta)} />
          <circle
            cx="70"
            cy="70"
            r={RAIO}
            fill="none"
            strokeWidth="6"
            className="stroke-mt-green-dark transition-[stroke-dasharray] duration-500 ease-out"
            strokeDasharray={preenchido(meta, feitosSemana)}
          />
        </svg>

        {estatico ? (
          <div
            aria-hidden
            className="absolute inset-[10%] flex items-center justify-center overflow-hidden rounded-full border-linha border-mt-border bg-white"
          >
            <Icone className={cn('text-mt-green-dark', compacto ? 'size-6' : 'size-11')} strokeWidth={1.8} />
          </div>
        ) : (
        <button
          type="button"
          aria-pressed={feito}
          aria-label={`${nome}, ${rotuloSemana}. ${feito ? 'Feito hoje. Segure para desmarcar.' : 'Segure para marcar como feito.'}`}
          onPointerDown={apertar}
          onPointerUp={soltar}
          onPointerLeave={cancelar}
          onPointerCancel={cancelar}
          onContextMenu={(e) => e.preventDefault()}
          onKeyDown={teclado}
          className={cn(
            'absolute inset-[10%] flex touch-manipulation select-none items-center justify-center overflow-hidden rounded-full border-linha border-mt-border bg-white transition-transform duration-150 [-webkit-touch-callout:none]',
            'focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-mt-green-dark',
            segurando && 'scale-[0.94]'
          )}
        >
          <span
            aria-hidden
            className={cn(
              'absolute inset-0 rounded-full bg-mt-green',
              cheio ? 'scale-100' : 'scale-0',
              segurando ? 'transition-transform duration-[550ms] ease-linear' : 'transition-transform duration-200 ease-out'
            )}
          />
          <span
            aria-hidden
            className={cn('relative flex', celebrando && 'animate-habito-pop motion-reduce:animate-none')}
          >
            <Icone className={cn('text-mt-green-dark', compacto ? 'size-6' : 'size-11')} strokeWidth={1.8} />
          </span>
        </button>
        )}

        {celebrando && (
          <div aria-hidden className="pointer-events-none absolute inset-0 motion-reduce:hidden">
            {!compacto &&
              PARTICULAS.map((p, i) => (
                <div key={i} className={cn('absolute left-1/2 top-1/2 size-0', p.giro)}>
                  <div className={cn('absolute -ml-[4.5px] -mt-[4.5px] size-[9px] animate-habito-particula', p.cor, p.forma)} />
                </div>
              ))}
            <span className="absolute inset-x-0 -top-3.5 animate-habito-subir text-center font-heading text-lg font-bold text-mt-green-dark">
              {celebrando === 'semana' ? 'semana!' : '+1'}
            </span>
          </div>
        )}
      </div>

      <div className="flex max-w-[150px] flex-col items-center gap-0.5 text-center">
        {hrefEditar ? (
          <Link
            href={hrefEditar}
            aria-label={`Editar ${nome}`}
            className={cn(
              'rounded-sm font-semibold leading-snug text-mt-black underline-offset-4 hover:underline hover:decoration-mt-green focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-mt-green-dark',
              compacto ? 'text-xs' : 'text-sm'
            )}
          >
            {nome}
          </Link>
        ) : (
          <span className={cn('font-semibold leading-snug text-mt-black', compacto ? 'text-xs' : 'text-sm')}>{nome}</span>
        )}
        {!compacto && (
          <span className={cn('text-sm', cumpriu ? 'font-semibold text-mt-green-dark' : 'text-mt-apoio')}>
            {rotuloSemana}
          </span>
        )}
      </div>
    </div>
  )
}
