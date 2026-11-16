'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { definirHabitoDia } from '@/app/actions/habitos'
import { existiaNoDia } from '@/lib/habitos'
import { cn } from '@/lib/utils'
import { ICONE_HABITO } from './iconesHabito'
import type { Constancia, DiaCalendario, Placar } from '@/lib/habitos'
import type { IconeHabito, StatusArea } from '@/types'

export type HabitoNoProgresso = {
  id: string
  nome: string
  icone: IconeHabito
  /** "Corpo · Exercícios Físicos" */
  areaLabel: string
  /** Cor da área no último Mapa; ausente sem Mapa. */
  status?: StatusArea
  placar: Placar
  criado_em: string
  arquivado_em: string | null
}

type Props = {
  /** Vezes que a pessoa cumpriu um hábito, desde sempre. */
  repeticoes: number
  /** Ex.: "12 de outubro" — dia do primeiro hábito criado. */
  desde: string | null
  constancia: Constancia
  /** Constância dos últimos 7 dias corridos; null se não há dados ainda. */
  constancia7Dias: number | null
  /** Maior sequência de dias consecutivos com pelo menos 1 hábito feito. */
  melhorSequencia: number
  /** Flat list dos últimos 30 dias, do mais antigo ao mais recente. */
  calendario: DiaCalendario[]
  diasCompletos: number
  habitos: HabitoNoProgresso[]
  /** Chaves "habito_id|dia" dos registros feitos no recorte, para estado inicial do modal. */
  feitosSet: string[]
  hoje: string
  /** Total de hábitos ativos. */
  totalHabitos: number
  /** Quantos hábitos foram feitos hoje. */
  feitosHoje: number
  /** Total de checks (registros feitos) no mês corrente. */
  checksEsteMes: number
}

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

const formatoDiaModal = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' })

export function ProgressoHabitos({
  desde,
  constancia,
  constancia7Dias,
  melhorSequencia,
  calendario,
  habitos,
  feitosSet,
  hoje,
  totalHabitos,
  feitosHoje,
  checksEsteMes,
}: Props) {
  const vazio = desde === null
  const [diaAberto, setDiaAberto] = useState<string | null>(null)
  const [feitos, setFeitos] = useState<Set<string>>(() => new Set(feitosSet))
  const [pending, startTransition] = useTransition()
  const [aviso, setAviso] = useState('')
  // Hábito recém-marcado no modal — dispara a animação dopaminérgica
  const [habitoMarcado, setHabitoMarcado] = useState<string | null>(null)

  function abrirDia(d: DiaCalendario) {
    if (d.futuro || d.existentes === 0) return
    setDiaAberto(d.dia)
    setAviso('')
  }

  function habitosDoDia(dia: string): HabitoNoProgresso[] {
    return habitos.filter((h) => existiaNoDia(h as unknown as Parameters<typeof existiaNoDia>[0], dia))
  }

  function toggleHabito(habitoId: string, dia: string) {
    const key = `${habitoId}|${dia}`
    const novoFeito = !feitos.has(key)
    setFeitos((prev) => {
      const next = new Set(prev)
      if (novoFeito) next.add(key)
      else next.delete(key)
      return next
    })
    if (novoFeito) {
      setHabitoMarcado(habitoId)
      setTimeout(() => setHabitoMarcado((id) => (id === habitoId ? null : id)), 900)
    }
    startTransition(async () => {
      const r = await definirHabitoDia(habitoId, novoFeito, dia)
      if ('error' in r) {
        setFeitos((prev) => {
          const next = new Set(prev)
          if (novoFeito) next.delete(key)
          else next.add(key)
          return next
        })
        setAviso(r.error)
      }
    })
  }

  // Número de constância a exibir
  const pctConstancia = constancia.atual ?? constancia7Dias
  const labelConstancia =
    constancia.atual !== null ? 'constância (4 sem.)' :
    constancia7Dias !== null ? 'constância (7 dias)' : 'constância'

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col px-5 pb-16 pt-6 sm:px-8">
      {/* Título — sem breadcrumb no mobile porque o menu inferior está fixo */}
      <h1 className="mb-titulo font-heading text-titulo font-medium text-mt-green-dark">Consistência</h1>

      {vazio ? (
        <div className="card-mt flex flex-col items-start gap-4 p-card-lg">
          <h2 className="text-subtitulo text-mt-green-dark">Sua consistência começa no primeiro hábito</h2>
          <p className="apoio">crie um hábito e marque o primeiro dia. é daqui que sai a sua constância.</p>
          <Button asChild>
            <Link href="/habitos/novo">Criar primeiro hábito</Link>
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-pilha">
          {/* Calendário + stats: empilhados no mobile, lado a lado no desktop */}
          <div className="flex flex-col gap-pilha md:flex-row md:items-start md:gap-6">

            {/* 1. Calendário de 30 dias — destaque principal */}
            <section className="card-mt flex w-full max-w-md flex-col gap-4 p-card md:flex-1" aria-labelledby="titulo-dias">
              <h2 id="titulo-dias" className="text-titulo-card font-bold text-mt-green-dark">Últimos 30 dias</h2>

              {/* Grade de 7 colunas fluidas — círculos crescem para preencher o card */}
              <div
                className="grid grid-cols-7 gap-1.5 sm:gap-2"
                aria-label="Calendário de hábitos"
              >
                {/* Cabeçalho com letras dos dias */}
                {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((l, i) => (
                  <span key={i} className="flex h-6 items-center justify-center text-xs font-semibold text-mt-apoio" aria-hidden>{l}</span>
                ))}
                {/* Offset: alinha o primeiro dia na coluna correta */}
                {(() => {
                  if (calendario.length === 0) return null
                  const firstDate = new Date(`${calendario[0].dia}T12:00:00Z`)
                  const dow = (firstDate.getUTCDay() + 6) % 7
                  return Array.from({ length: dow }).map((_, i) => <span key={`off-${i}`} className="aspect-square" />)
                })()}
                {calendario.map((d) => {
                  const clicavel = !d.futuro && d.existentes > 0
                  const feitosNoDia = habitos.filter((h) =>
                    existiaNoDia(h as unknown as Parameters<typeof existiaNoDia>[0], d.dia) && feitos.has(`${h.id}|${d.dia}`)
                  ).length
                  const existentesNoDia = habitos.filter((h) => existiaNoDia(h as unknown as Parameters<typeof existiaNoDia>[0], d.dia)).length
                  const nivelDia = (existentesNoDia ? Math.round((3 * feitosNoDia) / existentesNoDia) : 0) as DiaCalendario['nivel']
                  const completoDia = !d.futuro && existentesNoDia > 0 && feitosNoDia === existentesNoDia
                  const diaNum = d.dia.slice(-2).replace(/^0/, '')

                  return clicavel ? (
                    <button
                      key={d.dia}
                      type="button"
                      onClick={() => abrirDia(d)}
                      aria-label={`${d.dia === hoje ? 'Hoje' : formatoDiaModal.format(new Date(`${d.dia}T12:00:00Z`))}: ${feitosNoDia} de ${existentesNoDia}. Toque para editar.`}
                      className={cn(
                        'relative flex aspect-square w-full items-center justify-center rounded-full text-xs font-medium transition-opacity hover:opacity-80 sm:text-sm',
                        NIVEL[nivelDia],
                        d.hoje && 'outline outline-2 outline-offset-1 outline-mt-green-dark',
                        completoDia ? 'text-mt-green-dark' : 'text-mt-apoio'
                      )}
                    >
                      {completoDia ? <Check className="size-3.5 absolute inset-0 m-auto sm:size-4" strokeWidth={3} aria-hidden /> : diaNum}
                    </button>
                  ) : (
                    <span
                      key={d.dia}
                      aria-hidden
                      className={cn(
                        'flex aspect-square w-full items-center justify-center rounded-full text-xs sm:text-sm',
                        d.futuro ? 'border border-dashed border-mt-border text-transparent' : NIVEL[nivelDia],
                        d.hoje && 'outline outline-2 outline-offset-1 outline-mt-green-dark',
                        !d.futuro && 'text-mt-apoio'
                      )}
                    >
                      {!d.futuro && (completoDia ? <Check className="size-3.5 sm:size-4" strokeWidth={3} /> : diaNum)}
                    </span>
                  )
                })}
              </div>

              <div className="flex items-center gap-1.5 text-xs text-mt-apoio" aria-hidden>
                <span>nenhum</span>
                {([0, 1, 2, 3] as const).map((n) => (
                  <span key={n} className={cn('size-3.5 rounded-full', NIVEL[n])} />
                ))}
                <span>todos</span>
              </div>
              <p className="text-xs text-mt-apoio">Toque num dia para marcar ou desmarcar hábitos.</p>
            </section>

            {/* 2. Cards de stats — coluna direita no desktop, abaixo no mobile */}
            <div className="grid grid-cols-2 gap-3 md:flex md:flex-col md:w-52 md:shrink-0">
              {/* Hoje: X de Y hábitos */}
              <div className="card-mt flex flex-col justify-between gap-2 p-4" aria-label="Hábitos hoje">
                <span className="font-heading text-subtitulo font-medium text-mt-green-dark">
                  {feitosHoje}
                  <span className="text-sm font-normal text-mt-apoio"> / {totalHabitos}</span>
                </span>
                <span className="text-xs text-mt-apoio">hoje</span>
              </div>
              {/* Melhor sequência */}
              <div className="card-mt flex flex-col justify-between gap-2 p-4" aria-label="Melhor sequência">
                <span className="font-heading text-subtitulo font-medium text-mt-green-dark">{melhorSequencia}</span>
                <span className="text-xs text-mt-apoio">{melhorSequencia === 1 ? 'dia — melhor sequência' : 'dias — melhor sequência'}</span>
              </div>
              {/* Este mês */}
              <div className="card-mt flex flex-col justify-between gap-2 p-4" aria-label="Checks este mês">
                <span className="font-heading text-subtitulo font-medium text-mt-green-dark">{checksEsteMes}</span>
                <span className="text-xs text-mt-apoio">{checksEsteMes === 1 ? 'check este mês' : 'checks este mês'}</span>
              </div>
              {/* Constância */}
              <div className="card-mt flex flex-col justify-between gap-2 p-4" aria-label="Constância">
                {pctConstancia !== null ? (
                  <>
                    <span className="font-heading text-subtitulo font-medium text-mt-green-dark">{pctConstancia}%</span>
                    <span className="text-xs text-mt-apoio">{labelConstancia}</span>
                  </>
                ) : (
                  <>
                    <span className="font-heading text-subtitulo font-medium text-mt-green-dark">—</span>
                    <span className="text-xs text-mt-apoio">constância</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {constancia.atual === null && constancia7Dias !== null && (
            <p className="text-sm text-mt-apoio">A constância por semana aparece após a primeira semana completa (seg a dom).</p>
          )}

          {/* 3. Por hábito */}
          {habitos.length > 0 && (
            <section className="flex flex-col gap-3" aria-labelledby="titulo-por-habito">
              <h2 id="titulo-por-habito" className="text-titulo-card font-bold text-mt-green-dark">
                Por hábito
              </h2>
              <ul className="flex flex-col gap-3">
                {habitos.map((h) => {
                  const novo = h.placar.possiveis === 0
                  const pct = novo ? null : Math.round((100 * h.placar.cumpridas) / h.placar.possiveis)
                  const Icone = ICONE_HABITO[h.icone]
                  return (
                    <li key={h.id}>
                      <div className="card-mt p-3 flex items-center gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-elemento bg-mt-green-sup">
                          <Icone className="size-5 text-mt-green-dark" strokeWidth={1.8} aria-hidden />
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col gap-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="truncate text-sm font-semibold text-mt-black">{h.nome}</span>
                            <span className="shrink-0 text-sm font-bold text-mt-green-dark">
                              {novo ? 'novo' : `${pct}%`}
                            </span>
                          </div>
                          <span className="flex items-center gap-1.5 text-xs text-mt-apoio">
                            {h.status && (
                              <span
                                role="img"
                                aria-label={`${h.status} no último Mapa`}
                                className={cn('size-2 shrink-0 rounded-full', COR_PONTO[h.status])}
                              />
                            )}
                            {h.areaLabel}
                          </span>
                          {!novo && (
                            <div className="mt-0.5 h-1.5 w-full overflow-hidden rounded-full bg-mt-green-sup" aria-hidden>
                              <div
                                className="h-full rounded-full bg-mt-green transition-all"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </section>
          )}
        </div>
      )}

      {/* Modal para marcar/desmarcar hábitos de um dia passado */}
      <Dialog open={diaAberto !== null} onOpenChange={(open) => { if (!open) setDiaAberto(null) }}>
        <DialogContent>
          <div className="flex flex-col gap-5 p-6">
            <DialogHeader>
              <DialogTitle>
                {diaAberto === hoje
                  ? 'hoje'
                  : diaAberto
                    ? formatoDiaModal.format(new Date(`${diaAberto}T12:00:00Z`))
                    : ''}
              </DialogTitle>
              <DialogDescription>
                Marque ou desmarque os hábitos desse dia.
              </DialogDescription>
            </DialogHeader>

            {diaAberto && (
              <ul className="flex flex-col gap-3">
                {habitosDoDia(diaAberto).map((h) => {
                  const key = `${h.id}|${diaAberto}`
                  const feitoAtual = feitos.has(key)
                  const acabouDeMarcar = habitoMarcado === h.id
                  const Icone = ICONE_HABITO[h.icone]
                  return (
                    <li key={h.id}>
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => toggleHabito(h.id, diaAberto)}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-elemento px-4 py-3 text-left transition-all duration-200',
                          feitoAtual
                            ? 'bg-mt-green-sup text-mt-green-dark'
                            : 'bg-mt-off-white text-mt-black hover:bg-mt-green-sup/50'
                        )}
                      >
                        {/* Ícone do hábito com animação ao marcar */}
                        <span
                          className={cn(
                            'flex size-10 shrink-0 items-center justify-center rounded-full transition-all duration-300',
                            feitoAtual ? 'bg-mt-green' : 'bg-mt-border',
                            acabouDeMarcar && 'animate-habito-pop motion-reduce:animate-none'
                          )}
                        >
                          {feitoAtual
                            ? <Check className={cn('size-5 text-mt-green-dark transition-transform duration-300', acabouDeMarcar && 'scale-110')} strokeWidth={2.8} />
                            : <Icone className="size-5 text-mt-apoio" strokeWidth={1.8} />
                          }
                        </span>
                        <span className="text-sm font-medium">{h.nome}</span>
                        {/* Pulso verde ao marcar */}
                        {acabouDeMarcar && (
                          <span
                            aria-hidden
                            className="ml-auto text-lg animate-habito-subir motion-reduce:hidden select-none"
                          >
                            +1
                          </span>
                        )}
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}

            {aviso && (
              <p className="text-sm text-red-600">{aviso}</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
