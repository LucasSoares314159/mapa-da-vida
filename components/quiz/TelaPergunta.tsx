'use client'

import { useEffect, useRef } from 'react'
import { Check } from 'lucide-react'
import type { Pergunta } from '@/lib/quiz/tipos'

// Tela de uma pergunta. Uma por vez, mobile-first.
//
// As opcoes sao um radiogroup navegavel por setas, nao botoes soltos: sao
// alternativas mutuamente exclusivas de uma mesma pergunta, e com botoes o
// leitor de tela anunciaria quatro acoes independentes sem dizer que escolher
// uma descarta as outras. Mesmo padrao das 3 opcoes do Mapa conversacional.

type Props = {
  pergunta: Pergunta
  selecionada: string | undefined
  onSelecionar: (idOpcao: string) => void
  onAvancar: () => void
}

export function TelaPergunta({ pergunta, selecionada, onSelecionar, onAvancar }: Props) {
  const refs = useRef<(HTMLButtonElement | null)[]>([])

  // Cada pergunta comeca com o foco no grupo, nao no fim da tela anterior.
  useEffect(() => {
    refs.current = []
  }, [pergunta.id])

  function navegar(evento: React.KeyboardEvent, indice: number) {
    const teclas: Record<string, number> = {
      ArrowDown: 1,
      ArrowRight: 1,
      ArrowUp: -1,
      ArrowLeft: -1,
    }
    const passo = teclas[evento.key]
    if (!passo) return

    evento.preventDefault()
    const total = pergunta.opcoes.length

    // Sem nada escolhido ainda, a primeira seta seleciona a opcao focada em vez
    // de pular para a seguinte: quem chega pelo teclado espera que a navegacao
    // comece onde o foco esta, nao um item adiante.
    const proximo = selecionada ? (indice + passo + total) % total : indice

    refs.current[proximo]?.focus()
    onSelecionar(pergunta.opcoes[proximo].id)
  }

  return (
    <div className="flex flex-1 flex-col">
      {pergunta.contexto?.map((linha, i) => (
        <p key={i} className="mb-2 text-base leading-7 text-mt-muted">
          {linha}
        </p>
      ))}

      <h1
        id={`pergunta-${pergunta.id}`}
        className="font-heading text-[26px] font-bold leading-tight text-mt-black sm:text-[30px]"
      >
        {pergunta.enunciado}
      </h1>

      {pergunta.apoio && <p className="mt-3 text-base text-mt-muted">{pergunta.apoio}</p>}

      <div
        role="radiogroup"
        aria-labelledby={`pergunta-${pergunta.id}`}
        className="mt-7 space-y-3"
      >
        {pergunta.opcoes.map((opcao, indice) => {
          const ativa = selecionada === opcao.id

          return (
            <button
              key={opcao.id}
              ref={(el) => {
                refs.current[indice] = el
              }}
              type="button"
              role="radio"
              aria-checked={ativa}
              // Só a opção ativa (ou a primeira) entra na ordem de tabulação:
              // um radiogroup é uma parada de tab, navegada por setas por dentro.
              tabIndex={ativa || (!selecionada && indice === 0) ? 0 : -1}
              onClick={() => onSelecionar(opcao.id)}
              onKeyDown={(e) => navegar(e, indice)}
              className={`flex w-full items-start gap-3 rounded-xl border-2 p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mt-green focus-visible:ring-offset-2 ${
                ativa
                  ? 'border-mt-green bg-mt-green/10'
                  : 'border-mt-border bg-white hover:border-mt-green/60'
              }`}
            >
              {/* O estado não é comunicado só por cor: há o check e o aria-checked. */}
              <span
                aria-hidden="true"
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold ${
                  ativa
                    ? 'border-mt-green bg-mt-green text-white'
                    : 'border-mt-border text-mt-muted'
                }`}
              >
                {ativa ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : opcao.id}
              </span>
              <span className="text-[15px] leading-6 text-mt-green-dark sm:text-base">
                {opcao.texto}
              </span>
            </button>
          )
        })}
      </div>

      <div className="mt-8 pb-2">
        <button
          type="button"
          onClick={onAvancar}
          disabled={!selecionada}
          className="w-full rounded-xl bg-mt-green-dark px-6 py-4 text-sm font-bold uppercase tracking-wide text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mt-green focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-mt-border disabled:text-mt-muted sm:w-auto sm:px-10"
        >
          {pergunta.rotuloBotao}
        </button>
      </div>
    </div>
  )
}
