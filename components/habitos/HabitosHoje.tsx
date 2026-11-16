'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, ChevronRight, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useMarcarHabitos, type HabitoDoDia } from '@/hooks/useMarcarHabitos'
import { cn } from '@/lib/utils'
import { somarDias, inicioDaSemana } from '@/lib/habitos'
import { CirculoHabito } from './CirculoHabito'
import { ConviteInstalar } from './ConviteInstalar'

type Props = {
  /** Ex.: "quinta-feira, 12 de novembro". */
  dataLabel: string
  habitos: HabitoDoDia[]
  podeCriar: boolean
  /** Dias desta semana (YYYY-MM-DD) em que pelo menos 1 hábito foi feito. */
  diasFeitos: string[]
  /** Hoje em Brasília (YYYY-MM-DD). */
  hoje: string
}

// Rotações das partículas da tela de dia completo (classes literais para o Tailwind).
const PARTICULAS_FESTA = [
  'rotate-0', 'rotate-[20deg]', 'rotate-[40deg]', 'rotate-[60deg]', 'rotate-[80deg]', 'rotate-[100deg]',
  'rotate-[120deg]', 'rotate-[140deg]', 'rotate-[160deg]', 'rotate-[180deg]', 'rotate-[200deg]', 'rotate-[220deg]',
  'rotate-[240deg]', 'rotate-[260deg]', 'rotate-[280deg]', 'rotate-[300deg]', 'rotate-[320deg]', 'rotate-[340deg]',
]
const CORES_FESTA = ['bg-mt-green', 'bg-mt-off-white', 'bg-mt-yellow']

export type { HabitoDoDia }

const DIAS_SEMANA_LABEL = ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom']

export function HabitosHoje({ dataLabel, habitos, podeCriar, diasFeitos, hoje }: Props) {
  const [festa, setFesta] = useState(false)
  const { feitos, celebrando, aviso, avisar, alternar, jaMarcou, depois } = useMarcarHabitos(habitos, {
    onDiaCompleto: () => {
      depois(450, () => setFesta(true))
      depois(3400, () => setFesta(false))
    },
  })

  const feitosHoje = habitos.filter((h) => feitos[h.id]).length

  return (
    // select-none na tela toda, não só no círculo: segurar o círculo no iPhone
    // selecionava o texto vizinho (o nome, o card de constância) e abria o balão
    // "Copiar / Pesquisar". Aqui não há texto que alguém queira copiar.
    <div className="mx-auto flex w-full max-w-4xl select-none flex-col px-5 pb-16 pt-8 [-webkit-touch-callout:none] sm:px-8">
      <ConviteInstalar />
      <div className="mb-6 flex flex-col gap-1">
        <span className="text-sm text-mt-apoio first-letter:uppercase">{dataLabel}</span>
        <div className="flex items-baseline justify-between gap-3">
          <h1 className="font-heading text-titulo font-medium text-mt-green-dark">Hoje</h1>
          {habitos.length > 0 && (
            <span className="font-heading text-subtitulo font-medium text-mt-green-dark">
              {feitosHoje} de {habitos.length}
            </span>
          )}
        </div>
      </div>

      {habitos.length === 0 ? (
        <div className="card-mt flex flex-col items-start gap-4 p-card-lg">
          <h2 className="text-subtitulo text-mt-green-dark">Comece por um hábito</h2>
          <p className="apoio">pequeno o bastante para caber num dia ruim, ligado à área que mais pede atenção no seu mapa.</p>
          <Button asChild>
            <Link href="/habitos/novo">Criar primeiro hábito</Link>
          </Button>
        </div>
      ) : (
        <>
          <ul className="mt-6 grid grid-cols-2 justify-items-center gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4">
            {habitos.map((h) => (
              <li key={h.id}>
                <CirculoHabito
                  nome={h.nome}
                  icone={h.icone}
                  meta={h.meta}
                  feitosSemana={h.feitosAntesDeHoje + (feitos[h.id] ? 1 : 0)}
                  feito={!!feitos[h.id]}
                  celebrando={celebrando?.id === h.id ? celebrando.tipo : null}
                  onAlternar={() => alternar(h)}
                  onToqueCurto={() => avisar('Segure o círculo para marcar.')}
                  hrefEditar={`/habitos/${h.id}`}
                />
              </li>
            ))}
            {podeCriar && (
              <li className="flex flex-col items-center gap-3">
                <div className="flex size-[120px] items-center justify-center">
                  <Link
                    href="/habitos/novo"
                    aria-label="Novo hábito"
                    className="flex size-28 items-center justify-center rounded-full border-2 border-dashed border-mt-apoio text-mt-green-dark transition-[background-color,transform] duration-150 hover:bg-mt-green-sup active:scale-95 active:bg-mt-green-sup motion-reduce:transition-none focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-mt-green-dark"
                  >
                    <Plus className="size-8" aria-hidden />
                  </Link>
                </div>
                <span className="text-sm font-semibold text-mt-apoio">Novo hábito</span>
              </li>
            )}
          </ul>

          {!jaMarcou && feitosHoje === 0 && (
            <p className="mt-10 text-center text-sm text-mt-apoio">Segure o círculo para marcar.</p>
          )}

          {/* Card da semana — mini-calendário + acesso à consistência mensal */}
          {(() => {
            const seg = inicioDaSemana(hoje)
            const diasSemana = Array.from({ length: 7 }, (_, i) => somarDias(seg, i))
            const feitosSet = new Set(diasFeitos)
            return (
              <Link
                href="/habitos/progresso"
                className="mt-8 card-mt flex items-center justify-between gap-4 p-card transition-shadow hover:shadow-mt-2 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-mt-green-dark"
                aria-label={`Semana: ${diasFeitos.length} ${diasFeitos.length === 1 ? 'dia feito' : 'dias feitos'}. Ver consistência.`}
              >
                <span className="flex flex-1 flex-col gap-3">
                  {/* Bolinhas dos 7 dias */}
                  <span className="flex items-center justify-between gap-2" aria-hidden>
                    {diasSemana.map((dia, i) => {
                      const feito = feitosSet.has(dia)
                      const futuro = dia > hoje
                      const ehHoje = dia === hoje
                      return (
                        <span key={dia} className="flex flex-col items-center gap-1.5">
                          <span
                            className={cn(
                              'flex size-9 items-center justify-center rounded-full transition-colors sm:size-10',
                              feito
                                ? 'bg-mt-green text-mt-green-dark'
                                : futuro
                                  ? 'border border-dashed border-mt-border'
                                  : 'bg-mt-green-sup',
                              ehHoje && 'outline outline-2 outline-offset-1 outline-mt-green-dark'
                            )}
                          >
                            {feito && <Check className="size-4 sm:size-5" strokeWidth={2.8} />}
                          </span>
                          <span className={cn('text-[11px] leading-none', ehHoje ? 'font-semibold text-mt-green-dark' : 'text-mt-apoio')}>{DIAS_SEMANA_LABEL[i]}</span>
                        </span>
                      )
                    })}
                  </span>
                  <span className="text-xs text-mt-apoio">
                    {diasFeitos.length} {diasFeitos.length === 1 ? 'dia' : 'dias'} esta semana
                  </span>
                </span>
                <ChevronRight className="size-5 shrink-0 text-mt-green-dark" aria-hidden />
              </Link>
            )
          })()}
        </>
      )}

      <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-4 bottom-24 z-40 lg:bottom-6 flex justify-center">
        {aviso && (
          <span className="animate-habito-entrar rounded-elemento bg-mt-green-dark px-4 py-3 text-sm text-mt-off-white shadow-mt-2 motion-reduce:animate-none">
            {aviso}
          </span>
        )}
      </div>

      {festa && (
        <button
          type="button"
          onClick={() => setFesta(false)}
          aria-label="Dia completo. Toque para fechar."
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 overflow-hidden bg-mt-green-dark px-10 text-mt-off-white"
        >
          <div aria-hidden className="relative flex size-40 items-center justify-center">
            {PARTICULAS_FESTA.map((giro, i) => (
              <div key={giro} className={cn('absolute left-1/2 top-1/2 size-0 motion-reduce:hidden', giro)}>
                <div
                  className={cn(
                    'absolute -ml-1.5 -mt-1.5 size-3 animate-habito-festa',
                    CORES_FESTA[i % CORES_FESTA.length],
                    i % 3 === 2 ? 'rounded-[2px]' : 'rounded-full'
                  )}
                />
              </div>
            ))}
            <div className="flex size-[120px] animate-habito-pop items-center justify-center rounded-full bg-mt-green motion-reduce:animate-none">
              <Check className="size-14 text-mt-green-dark" strokeWidth={2.6} />
            </div>
          </div>
          <span className="animate-habito-entrar font-heading text-display font-medium lowercase motion-reduce:animate-none">
            Dia completo.
          </span>
          <span className="animate-habito-entrar text-center text-base text-mt-off-white/70 motion-reduce:animate-none">
            {habitos.length} de {habitos.length} hábitos feitos hoje. Toque para voltar.
          </span>
        </button>
      )}
    </div>
  )
}
