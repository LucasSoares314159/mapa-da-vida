'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { criarMapa, type AreaInput } from '@/app/actions/mapa'
import { PILARES } from '@/types'
import type { NomePilar, NomeArea, StatusArea } from '@/types'

type Respostas = Partial<Record<NomeArea, { status: StatusArea; observacao: string }>>

const ORDEM_PILARES: NomePilar[] = ['corpo', 'mente', 'espirito']

// Configuração visual de cada opção de status
const STATUS_OPTIONS: {
  value: StatusArea
  titulo: string
  sublabel: string
  ponto: string
  bgSelecionado: string
  bordaSelecionada: string
  corCheck: string
}[] = [
  {
    value: 'verde',
    titulo: 'Está bem',
    sublabel: 'Me sinto bem nessa área hoje',
    ponto: '#57AA8F',
    bgSelecionado: '#E8F5F1',
    bordaSelecionada: '#57AA8F',
    corCheck: '#57AA8F',
  },
  {
    value: 'amarelo',
    titulo: 'Precisa de atenção',
    sublabel: 'Não está mal, mas poderia ser melhor',
    ponto: '#D4A843',
    bgSelecionado: '#FBF5E6',
    bordaSelecionada: '#D4A843',
    corCheck: '#D4A843',
  },
  {
    value: 'vermelho',
    titulo: 'Precisa mudar',
    sublabel: 'Está impactando minha vida negativamente',
    ponto: '#C05050',
    bgSelecionado: '#FAECEC',
    bordaSelecionada: '#C05050',
    corCheck: '#C05050',
  },
]

export default function NovoMapaPage() {
  const [step, setStep] = useState(0)
  const [respostas, setRespostas] = useState<Respostas>({})
  const [erro, setErro] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const pilarAtual = ORDEM_PILARES[step]
  const infosPilar = PILARES[pilarAtual]
  const areasDoStep = infosPilar.areas
  const totalSteps = ORDEM_PILARES.length

  const stepCompleto = areasDoStep.every((area) => respostas[area]?.status)
  const ehUltimoPilar = step === totalSteps - 1

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
    if (!ehUltimoPilar) {
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
    <div className="min-h-screen" style={{ backgroundColor: '#F7FAF9' }}>
      {/* Header fixo */}
      <header
        className="sticky top-0 z-10 bg-white"
        style={{ borderBottom: '0.5px solid #c8d8d2' }}
      >
        <div
          className="mx-auto grid max-w-xl items-center px-6"
          style={{ gridTemplateColumns: '1fr auto 1fr', height: 52 }}
        >
          {/* Botão voltar */}
          {step === 0 ? (
            <Link
              href="/mapa/preparacao"
              className="flex items-center gap-1.5 text-sm font-medium transition-colors"
              style={{ color: '#57AA8F' }}
            >
              <ArrowLeft className="size-4" />
              Voltar
            </Link>
          ) : (
            <button
              onClick={voltar}
              disabled={isPending}
              className="flex items-center gap-1.5 text-sm font-medium transition-colors"
              style={{ color: '#57AA8F' }}
            >
              <ArrowLeft className="size-4" />
              Voltar
            </button>
          )}

          {/* Título central */}
          <h1
            className="text-center text-sm font-semibold whitespace-nowrap"
            style={{ color: '#2A3F45' }}
          >
            Novo Mapa da Vida
          </h1>

          {/* Indicador de pilar */}
          <span className="text-right text-sm" style={{ color: '#6f8f87' }}>
            {step + 1} de {totalSteps} pilares
          </span>
        </div>

        {/* Barra de progresso */}
        <div className="mx-auto flex max-w-xl gap-1 px-6 pb-3">
          {ORDEM_PILARES.map((_, i) => (
            <div
              key={i}
              className="flex-1 transition-colors duration-300"
              style={{
                height: 3,
                borderRadius: 2,
                backgroundColor: i <= step ? '#57AA8F' : '#c8d8d2',
              }}
            />
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-xl px-4 py-8">
        {/* Badge do pilar */}
        <div className="mb-4 flex items-center gap-2">
          <span
            className="flex items-center gap-1.5 text-xs font-medium"
            style={{
              backgroundColor: '#E8F5F1',
              color: '#2A8F6F',
              borderRadius: 20,
              padding: '4px 10px',
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: '#57AA8F',
                display: 'inline-block',
                flexShrink: 0,
              }}
            />
            Pilar {step + 1} de {totalSteps}
          </span>
        </div>

        {/* Título e subtítulo do pilar */}
        <h2
          className="mb-1"
          style={{
            fontFamily: 'var(--font-space-grotesk), Space Grotesk, sans-serif',
            fontSize: 28,
            fontWeight: 500,
            color: '#2A3F45',
          }}
        >
          {infosPilar.label}
        </h2>
        <p className="mb-8 text-sm" style={{ color: '#6f8f87' }}>
          Responda com o que é verdade hoje — não com o que você gostaria que fosse.
        </p>

        {/* Cards de área */}
        <div className="flex flex-col gap-5">
          {areasDoStep.map((area) => {
            const resposta = respostas[area]
            const statusSelecionado = resposta?.status

            return (
              <div
                key={area}
                className="bg-white"
                style={{
                  border: '0.5px solid #c8d8d2',
                  borderRadius: 12,
                  padding: 24,
                }}
              >
                {/* Label da área */}
                <p
                  className="mb-2 uppercase"
                  style={{
                    color: '#57AA8F',
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: '0.8px',
                  }}
                >
                  {area}
                </p>

                {/* Pergunta reflexiva */}
                <p
                  className="mb-5"
                  style={{ color: '#2A3F45', fontSize: 16, lineHeight: 1.65 }}
                >
                  {infosPilar.perguntas[area]}
                </p>

                {/* Botões de status em lista vertical */}
                <div className="flex flex-col gap-2 mb-4">
                  {STATUS_OPTIONS.map((opt) => {
                    const selecionado = statusSelecionado === opt.value
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setStatus(area, opt.value)}
                        className="flex items-center gap-3 w-full text-left transition-colors duration-150"
                        style={{
                          border: selecionado
                            ? `1.5px solid ${opt.bordaSelecionada}`
                            : '0.5px solid #c8d8d2',
                          backgroundColor: selecionado ? opt.bgSelecionado : '#fff',
                          borderRadius: 10,
                          padding: '12px 14px',
                        }}
                      >
                        {/* Ponto colorido */}
                        <span
                          style={{
                            width: 9,
                            height: 9,
                            borderRadius: '50%',
                            backgroundColor: opt.ponto,
                            flexShrink: 0,
                            display: 'inline-block',
                          }}
                        />

                        {/* Textos */}
                        <span className="flex flex-col gap-0.5 flex-1">
                          <span
                            className="text-sm"
                            style={{ color: '#2A3F45', fontWeight: 500 }}
                          >
                            {opt.titulo}
                          </span>
                          <span className="text-xs" style={{ color: '#6f8f87' }}>
                            {opt.sublabel}
                          </span>
                        </span>

                        {/* Ícone de check quando selecionado */}
                        {selecionado && (
                          <Check
                            className="size-4 flex-shrink-0"
                            style={{ color: opt.corCheck }}
                          />
                        )}
                      </button>
                    )
                  })}
                </div>

                {/* Campo de observação */}
                <textarea
                  placeholder="O que está por trás dessa escolha? (opcional)"
                  value={resposta?.observacao ?? ''}
                  onChange={(e) => setObservacao(area, e.target.value)}
                  rows={2}
                  className="w-full resize-none text-sm outline-none transition-colors placeholder:text-[#a8c4bc]"
                  style={{
                    border: '1.5px solid #c8d8d2',
                    borderRadius: 10,
                    padding: '10px 14px',
                    color: '#2A3F45',
                    height: 68,
                    lineHeight: 1.5,
                    fontFamily: 'inherit',
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = '#57AA8F')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = '#c8d8d2')}
                />
              </div>
            )
          })}
        </div>

        {/* Mensagem de erro */}
        {erro && (
          <div
            className="mt-4 rounded-lg px-4 py-3 text-sm"
            style={{ backgroundColor: '#FAECEC', color: '#903030', border: '1px solid #C05050' }}
          >
            {erro}
          </div>
        )}

        {/* Botão de avanço no rodapé */}
        <button
          onClick={avancar}
          disabled={!stepCompleto || isPending}
          className="mt-8 flex w-full items-center justify-center gap-2 text-white transition-opacity hover:opacity-90 disabled:opacity-40"
          style={{
            backgroundColor: '#57AA8F',
            borderRadius: 10,
            padding: '16px 24px',
            fontSize: 16,
            fontWeight: 500,
          }}
        >
          {isPending
            ? 'Salvando…'
            : ehUltimoPilar
            ? 'Ver meu mapa →'
            : `Próximo pilar →`}
          {!isPending && <ArrowRight className="size-4" />}
        </button>
      </main>
    </div>
  )
}
