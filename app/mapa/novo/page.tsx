'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { criarMapa, type AreaInput } from '@/app/actions/mapa'
import { PILARES, COR_STATUS } from '@/types'
import type { NomePilar, NomeArea, StatusArea } from '@/types'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'

type Respostas = Partial<Record<NomeArea, { status: StatusArea; observacao: string }>>

const ORDEM_PILARES: NomePilar[] = ['corpo', 'mente', 'espirito']

const STATUS_OPTIONS: { value: StatusArea; emoji: string }[] = [
  { value: 'verde', emoji: '🟢' },
  { value: 'amarelo', emoji: '🟡' },
  { value: 'vermelho', emoji: '🔴' },
]

const PILAR_STYLE: Record<NomePilar, { bg: string; border: string; badge: string }> = {
  corpo: { bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-700' },
  mente: { bg: 'bg-purple-50', border: 'border-purple-200', badge: 'bg-purple-100 text-purple-700' },
  espirito: { bg: 'bg-orange-50', border: 'border-orange-200', badge: 'bg-orange-100 text-orange-700' },
}

export default function NovoMapaPage() {
  const [step, setStep] = useState(0)
  const [respostas, setRespostas] = useState<Respostas>({})
  const [erro, setErro] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const pilarAtual = ORDEM_PILARES[step]
  const infosPilar = PILARES[pilarAtual]
  const estilosPilar = PILAR_STYLE[pilarAtual]
  const areasDoStep = infosPilar.areas
  const totalSteps = ORDEM_PILARES.length

  const respostasDoStep = areasDoStep.map((area) => respostas[area])
  const stepCompleto = respostasDoStep.every((r) => r?.status)

  function setStatus(area: NomeArea, status: StatusArea) {
    setRespostas((prev) => ({
      ...prev,
      [area]: { status, observacao: prev[area]?.observacao ?? '' },
    }))
  }

  function setObservacao(area: NomeArea, observacao: string) {
    setRespostas((prev) => ({
      ...prev,
      [area]: { status: prev[area]?.status ?? 'verde', observacao },
    }))
  }

  function avancar() {
    if (step < totalSteps - 1) {
      setStep((s) => s + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      handleSubmit()
    }
  }

  function voltar() {
    setStep((s) => s - 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleSubmit() {
    setErro(null)
    const areas: AreaInput[] = ORDEM_PILARES.flatMap((pilar) =>
      PILARES[pilar].areas.map((area) => ({
        area,
        pilar,
        status: respostas[area]!.status,
        observacao: respostas[area]?.observacao || undefined,
      }))
    )

    startTransition(async () => {
      const resultado = await criarMapa(areas)
      if (resultado?.error) setErro(resultado.error)
    })
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="sticky top-0 z-10 border-b bg-white px-6 py-4">
        <div className="mx-auto grid max-w-xl grid-cols-3 items-center">
          <Link
            href="/mapa/preparacao"
            className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Voltar
          </Link>
          <h1 className="text-center text-base font-semibold">Novo Mapa da Vida</h1>
          <span className="text-right text-sm text-muted-foreground">
            {step + 1} / {totalSteps}
          </span>
        </div>
        <div className="mx-auto mt-3 max-w-xl">
          <div className="flex gap-1.5">
            {ORDEM_PILARES.map((p, i) => (
              <div
                key={p}
                className={cn(
                  'h-1.5 flex-1 rounded-full transition-colors',
                  i < step ? 'bg-primary' : i === step ? 'bg-primary/50' : 'bg-zinc-200'
                )}
              />
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-xl px-4 py-8">
        <div className={cn('mb-6 rounded-xl border p-4', estilosPilar.bg, estilosPilar.border)}>
          <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', estilosPilar.badge)}>
            Pilar
          </span>
          <h2 className="mt-1 text-2xl font-semibold">{infosPilar.label}</h2>
          <p className="text-sm text-muted-foreground">
            Avalie cada área escolhendo um status e adicionando uma observação opcional.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {areasDoStep.map((area) => {
            const resposta = respostas[area]
            const statusSelecionado = resposta?.status

            return (
              <div key={area} className="rounded-xl border bg-white p-4 shadow-sm">
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">{area}</p>
                <h3 className="mb-3 text-[15px] font-medium leading-snug">{infosPilar.perguntas[area]}</h3>

                <div className="mb-3 flex gap-2">
                  {STATUS_OPTIONS.map(({ value, emoji }) => {
                    const cor = COR_STATUS[value]
                    const selecionado = statusSelecionado === value
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setStatus(area, value)}
                        className={cn(
                          'flex flex-1 flex-col items-center gap-1 rounded-lg border-2 py-2.5 text-xs font-medium transition-all',
                          selecionado
                            ? cn(cor.bg, cor.border, 'scale-[1.03] shadow-sm')
                            : 'border-zinc-200 bg-white hover:border-zinc-300'
                        )}
                      >
                        <span className="text-xl">{emoji}</span>
                        <span className="text-center leading-tight">{cor.label}</span>
                      </button>
                    )
                  })}
                </div>

                <Textarea
                  placeholder="O que está por trás dessa escolha?"
                  value={resposta?.observacao ?? ''}
                  onChange={(e) => setObservacao(area, e.target.value)}
                  className="min-h-0 resize-none text-sm"
                  rows={2}
                />
              </div>
            )
          })}
        </div>

        {erro && (
          <Alert variant="destructive" className="mt-4">
            <AlertDescription>{erro}</AlertDescription>
          </Alert>
        )}

        <div className="mt-6 flex gap-3">
          {step > 0 && (
            <Button variant="outline" onClick={voltar} disabled={isPending} className="flex-1">
              Voltar
            </Button>
          )}
          <Button onClick={avancar} disabled={!stepCompleto || isPending} className="flex-1">
            {isPending ? 'Salvando…' : step === totalSteps - 1 ? 'Gerar mapa' : 'Próximo'}
          </Button>
        </div>
      </main>
    </div>
  )
}
