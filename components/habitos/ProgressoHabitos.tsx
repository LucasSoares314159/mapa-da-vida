import Link from 'next/link'
import { Check, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Constancia, DiaCalendario, Placar } from '@/lib/habitos'
import type { StatusArea } from '@/types'

export type HabitoNoProgresso = {
  id: string
  nome: string
  /** "Corpo · Exercícios Físicos" */
  areaLabel: string
  /** Cor da área no último Mapa; ausente sem Mapa. */
  status?: StatusArea
  placar: Placar
}

type Props = {
  /** Vezes que a pessoa cumpriu um hábito, desde sempre. */
  repeticoes: number
  /** Ex.: "12 de outubro" — dia do primeiro hábito criado. */
  desde: string | null
  constancia: Constancia
  calendario: DiaCalendario[][]
  diasCompletos: number
  habitos: HabitoNoProgresso[]
}

const LETRAS = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D']
const NOMES_DIA = ['segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado', 'domingo']

const NIVEL: Record<DiaCalendario['nivel'], string> = {
  0: 'border-linha border-mt-border bg-white',
  1: 'bg-mt-green/25',
  2: 'bg-mt-green/55',
  3: 'bg-mt-green',
}

const COR_PONTO: Record<StatusArea, string> = {
  verde: 'bg-mt-green',
  amarelo: 'bg-mt-yellow',
  vermelho: 'bg-mt-red',
}

const formatoSemana = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'short', timeZone: 'UTC' })

function rotuloSemana(segunda: string, atual: boolean) {
  if (atual) return 'esta'
  return formatoSemana.format(new Date(`${segunda}T12:00:00Z`)).replace('.', '').replace(' de ', ' ')
}

// Mini-anel do placar por hábito: a fração das metas cumpridas nas 4 semanas.
const R = 16
const CIRC = 2 * Math.PI * R

function textoVariacao(v: number) {
  if (v === 0) return 'igual às 4 semanas anteriores'
  const pontos = Math.abs(v) === 1 ? 'ponto' : 'pontos'
  return `${v > 0 ? '+' : '−'}${Math.abs(v)} ${pontos} sobre as 4 anteriores`
}

export function ProgressoHabitos({ repeticoes, desde, constancia, calendario, diasCompletos, habitos }: Props) {
  const vazio = desde === null

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col px-5 pb-16 pt-6 sm:px-8">
      <Link
        href="/habitos"
        className="-ml-1 mb-4 inline-flex min-h-11 items-center gap-1 self-start rounded-sm text-sm font-medium text-mt-green-dark focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-mt-green-dark"
      >
        <ChevronLeft className="size-4" aria-hidden />
        Hoje
      </Link>
      <h1 className="mb-titulo font-heading text-titulo font-medium text-mt-green-dark">Seu progresso</h1>

      {vazio ? (
        <div className="card-mt flex flex-col items-start gap-4 p-card-lg">
          <h2 className="text-subtitulo text-mt-green-dark">Seu progresso começa no primeiro hábito</h2>
          <p className="apoio">crie um hábito e marque o primeiro dia. é daqui que sai a sua constância.</p>
          <Button asChild>
            <Link href="/habitos/novo">Criar primeiro hábito</Link>
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-pilha">
          <div className="grid grid-cols-1 gap-pilha sm:grid-cols-2">
            <section className="flex flex-col gap-2 rounded-painel bg-mt-green-dark p-card-lg text-mt-off-white" aria-label="Repetições">
              <span className="font-heading text-display font-medium">{repeticoes.toLocaleString('pt-BR')}</span>
              <span className="text-base leading-snug">
                {repeticoes === 1 ? 'vez' : 'vezes'} que você cumpriu um hábito desde {desde}
              </span>
              <span className="text-sm text-mt-off-white/70">Esse número só cresce.</span>
            </section>

            <section className="card-mt flex flex-col gap-2 p-card-lg" aria-label="Constância">
              {constancia.atual === null ? (
                <>
                  <span className="font-heading text-titulo font-medium text-mt-green-dark">—</span>
                  <span className="text-base leading-snug text-mt-black">
                    Sua constância aparece depois da primeira semana completa.
                  </span>
                </>
              ) : (
                <>
                  <span className="font-heading text-display font-medium text-mt-green-dark">{constancia.atual}%</span>
                  <span className="text-base leading-snug text-mt-black">de constância nas últimas 4 semanas</span>
                  {constancia.variacao !== null && (
                    // Queda em tom neutro, nunca vermelho: recompensa sem punição.
                    <span
                      className={cn(
                        'self-start rounded-full px-3 py-1 text-sm font-semibold',
                        constancia.variacao > 0 ? 'bg-mt-green-sup text-mt-green-dark' : 'bg-mt-off-white text-mt-apoio'
                      )}
                    >
                      {textoVariacao(constancia.variacao)}
                    </span>
                  )}
                </>
              )}
            </section>
          </div>

          <section className="card-mt flex flex-col gap-4 p-card" aria-labelledby="titulo-dias">
            <div className="flex items-baseline justify-between gap-3">
              <h2 id="titulo-dias" className="text-titulo-card font-bold text-mt-green-dark">Seus dias</h2>
              <span className="text-sm text-mt-apoio">
                {diasCompletos} {diasCompletos === 1 ? 'dia completo' : 'dias completos'}
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex gap-1.5" aria-hidden>
                <span className="w-12 shrink-0" />
                {LETRAS.map((l, i) => (
                  <span key={i} className="w-9 text-center text-xs text-mt-apoio sm:w-11">
                    {l}
                  </span>
                ))}
              </div>
              {calendario.map((semana, w) => {
                const atual = w === calendario.length - 1
                const resumo = semana
                  .filter((d) => !d.futuro)
                  .map((d, i) => `${NOMES_DIA[i]} ${d.feitos} de ${d.existentes}`)
                  .join(', ')
                return (
                  <div
                    key={semana[0].dia}
                    role="img"
                    aria-label={`Semana ${atual ? 'atual' : `de ${rotuloSemana(semana[0].dia, false)}`}: ${resumo}`}
                    className="flex items-center gap-1.5"
                  >
                    <span aria-hidden className="w-12 shrink-0 text-xs text-mt-apoio">
                      {rotuloSemana(semana[0].dia, atual)}
                    </span>
                    {semana.map((d) => (
                      <span
                        key={d.dia}
                        aria-hidden
                        className={cn(
                          'flex size-9 items-center justify-center rounded-lg sm:size-11',
                          d.futuro ? 'border border-dashed border-mt-border' : NIVEL[d.nivel],
                          d.hoje && 'outline outline-2 outline-offset-1 outline-mt-green-dark'
                        )}
                      >
                        {d.completo && <Check className="size-4 text-mt-green-dark" strokeWidth={3} />}
                      </span>
                    ))}
                  </div>
                )
              })}
            </div>

            <div className="flex items-center gap-1.5 text-xs text-mt-apoio" aria-hidden>
              <span>nenhum</span>
              {([0, 1, 2, 3] as const).map((n) => (
                <span key={n} className={cn('size-3.5 rounded', NIVEL[n])} />
              ))}
              <span>todos</span>
            </div>
          </section>

          {habitos.length > 0 && (
            <section className="card-mt flex flex-col gap-4 p-card" aria-labelledby="titulo-por-habito">
              <h2 id="titulo-por-habito" className="text-titulo-card font-bold text-mt-green-dark">
                Por hábito, nas últimas 4 semanas
              </h2>
              <ul className="flex flex-col gap-4">
                {habitos.map((h) => {
                  const novo = h.placar.possiveis === 0
                  const fracao = novo ? 0 : h.placar.cumpridas / h.placar.possiveis
                  return (
                    <li key={h.id} className="flex items-center gap-3">
                      <svg viewBox="0 0 40 40" aria-hidden className="size-10 shrink-0 -rotate-90">
                        <circle cx="20" cy="20" r={R} fill="none" strokeWidth="5" className="stroke-mt-border" />
                        <circle
                          cx="20"
                          cy="20"
                          r={R}
                          fill="none"
                          strokeWidth="5"
                          strokeLinecap="round"
                          className="stroke-mt-green-dark"
                          strokeDasharray={`${(CIRC * fracao).toFixed(2)} ${CIRC.toFixed(2)}`}
                        />
                      </svg>
                      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className="truncate text-base font-medium text-mt-black">{h.nome}</span>
                        <span className="flex items-center gap-1.5 text-sm text-mt-apoio">
                          {h.status && (
                            <span
                              role="img"
                              aria-label={`${h.status} no último Mapa`}
                              className={cn('size-2 shrink-0 rounded-full', COR_PONTO[h.status])}
                            />
                          )}
                          {h.areaLabel}
                        </span>
                      </div>
                      <span className="whitespace-nowrap text-sm font-semibold text-mt-green-dark">
                        {novo ? 'começou agora' : `${h.placar.cumpridas} de ${h.placar.possiveis}`}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
