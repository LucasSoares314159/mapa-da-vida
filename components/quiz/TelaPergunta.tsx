'use client'

import { useEffect, useRef } from 'react'
import { Check, MessageCircle } from 'lucide-react'
import type { Pergunta } from '@/lib/quiz/tipos'

// Tela de uma pergunta. Uma por vez, mobile-first.
//
// As opcoes sao um radiogroup navegavel por setas, nao botoes soltos: sao
// alternativas mutuamente exclusivas de uma mesma pergunta, e com botoes o
// leitor de tela anunciaria quatro acoes independentes sem dizer que escolher
// uma descarta as outras. Mesmo padrao das 3 opcoes do Mapa conversacional.
//
// Escolher avanca sozinho (auto-advance), em TODAS as perguntas, inclusive a
// ultima. As perguntas sao de escolha unica, e um botao "Continuar" fixo abaixo
// das opcoes obrigava, no mobile, a rolar ate ele depois de ja ter escolhido —
// dois gestos por pergunta e uma rolagem so para confirmar. Tocar na opcao e a
// propria confirmacao, como nos quizzes de funil que convertem. O id escolhido
// vai explicito para onAvancar: o estado do React ainda nao atualizou no mesmo
// gesto, e sem isso o evento quiz_answer sairia com a opcao anterior (ou vazia).
//
// A pausa de ~320ms antes do avanco e a protecao contra toque duplo: cada toque
// reagenda o timer, entao toques rapidos viram um unico avanco (e quiz_answer,
// deduplicado por etapa em QuizConversa, sai uma vez so). Na ultima pergunta o
// avanco leva ao processando; o quiz_complete nao sai daqui — dispara ao montar
// a tela de resultado, em QuizConversa.

type Props = {
  pergunta: Pergunta
  selecionada: string | undefined
  onSelecionar: (idOpcao: string) => void
  onAvancar: (idOpcao: string) => void
}

export function TelaPergunta({
  pergunta,
  selecionada,
  onSelecionar,
  onAvancar,
}: Props) {
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const timerAvanco = useRef<ReturnType<typeof setTimeout>>()

  // Cada pergunta comeca com o foco no grupo, nao no fim da tela anterior.
  useEffect(() => {
    refs.current = []
  }, [pergunta.id])

  // Se a tela trocar (ou desmontar) com um avanco agendado, cancela: sem isso
  // um clique seguido de "voltar" dispararia o avanco da tela antiga.
  useEffect(() => () => clearTimeout(timerAvanco.current), [])

  // Auto-advance: escolher avanca em qualquer pergunta. O id vai explicito
  // porque o estado do React ainda nao refletiu a escolha.
  //
  // O avanco espera ~320ms para a opcao acender verde antes de a tela trocar:
  // sem a pausa, o auto-advance era tao imediato que a selecao nunca era vista,
  // e a pessoa ficava sem o retorno de "registrou minha escolha". A pausa e o
  // proprio feedback de confirmacao — e o clearTimeout faz toques rapidos
  // reagendarem um unico avanco (protecao contra toque duplo).
  function escolher(idOpcao: string) {
    onSelecionar(idOpcao)
    clearTimeout(timerAvanco.current)
    timerAvanco.current = setTimeout(() => onAvancar(idOpcao), 320)
  }

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
    // Seta navega e seleciona, mas NAO auto-avanca: quem percorre as opcoes por
    // teclado ainda esta comparando. O avanco e no Enter/Espaco (clique do
    // radio), que passa por escolher().
    onSelecionar(pergunta.opcoes[proximo].id)
  }

  return (
    // Centraliza o bloco (título + opções) na vertical quando há altura de
    // sobra, mas volta ao topo em tela baixa (celular-baixo, ≤700px de altura):
    // ali centralizar empurrava o enunciado para baixo nas perguntas curtas e,
    // nas longas, não sobrava espaço para centralizar de qualquer jeito. Acima
    // de 700px sobram 160–280px vazios embaixo, então o conteúdo sobe para o
    // centro óptico.
    <div className="flex flex-1 flex-col justify-center celular-baixo:justify-start">
      {pergunta.contexto && pergunta.contexto.length > 0 && (
        // O contexto e uma observacao/insight antes da pergunta ("E curioso
        // como sempre encontramos tempo para as obrigacoes...") — tem funcao
        // dupla: dar algo de valor para a pessoa ler e manter o engajamento
        // enquanto o quiz avanca.
        //
        // Nao pode parecer uma opcao, e quem garante isso e o sistema da LP
        // /trilha, nao ornamento: superficie --verde-sup sem sombra (a opcao e
        // card branco com sombra) e Lora reta minuscula, a voz do "eyebrow
        // conversacional" da LP (a opcao e Satoshi). O icone de mensagem no
        // circulo verde e o mesmo marcador do FAQ da LP. O rotulo em caixa alta
        // espacada saiu: a LP aboliu caixa alta espacada.
        //
        // Em tela baixa (celular-baixo) tudo encolhe um degrau: num Android de
        // 360x600 dentro do Instagram, a ultima opcao das perguntas 2 a 5
        // ficava ate ~80px abaixo da dobra. Com auto-advance, opcao fora da
        // tela e opcao que a pessoa nem considera.
        <div className="mb-5 flex items-start gap-3 rounded-card bg-mt-green-sup p-3.5 celular-baixo:mb-3 celular-baixo:p-3 celular-minimo:mb-2 celular-minimo:p-2.5 sm:mb-7 sm:p-5">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-mt-green text-white celular-baixo:h-6 celular-baixo:w-6">
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
          </span>
          <div className="space-y-1 pt-px">
            {pergunta.contexto.map((linha, i) => (
              <p
                key={i}
                className="font-editorial text-base lowercase leading-[1.6] text-mt-green-dark celular-baixo:text-[15px] celular-baixo:leading-[1.45] celular-minimo:text-[14px] celular-minimo:leading-[1.4] sm:text-[17px]"
              >
                {linha}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Pergunta = titulo da tela: Satoshi 500 minusculo, como os h2 da LP. */}
      <h1
        id={`pergunta-${pergunta.id}`}
        className="font-satoshi text-[25px] font-medium lowercase leading-[1.12] tracking-[-0.02em] text-mt-green-dark [text-wrap:balance] celular-baixo:text-[22px] celular-minimo:text-[20px] sm:text-[34px]"
      >
        {pergunta.enunciado}
      </h1>

      {pergunta.apoio && (
        <p className="mt-3 font-editorial text-[17px] lowercase leading-[1.6] text-mt-apoio-forte celular-baixo:mt-1.5 celular-baixo:text-[15px] celular-baixo:leading-[1.45]">
          {pergunta.apoio}
        </p>
      )}

      <div
        role="radiogroup"
        aria-labelledby={`pergunta-${pergunta.id}`}
        className="mt-5 space-y-2.5 celular-baixo:mt-3 celular-baixo:space-y-2 celular-minimo:mt-2 celular-minimo:space-y-1 sm:mt-7 sm:space-y-3"
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
              onClick={() => escolher(opcao.id)}
              onKeyDown={(e) => navegar(e, indice)}
              // Card do sistema de superfícies da LP: branco, hairline, raio 16,
              // sombra 1 (2 no hover). Selecionada, o contorno vira indicador de
              // estado — o único caso em que a LP aceita traço de 2px —, feito
              // com ring para não deslocar o layout.
              className={`flex w-full items-center gap-4 rounded-card border-[0.5px] px-4 py-3 text-left celular-baixo:gap-3 celular-baixo:py-2 celular-minimo:py-1.5 shadow-mt-1 transition-[box-shadow,background-color] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mt-green sm:p-4 sm:px-5 ${
                ativa
                  ? 'border-mt-green bg-mt-green-sup ring-2 ring-mt-green'
                  : 'border-mt-border bg-white hover:shadow-mt-2'
              }`}
            >
              {/* O estado não é comunicado só por cor: há o check e o aria-checked. */}
              <span
                aria-hidden="true"
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-satoshi celular-baixo:h-7 celular-baixo:w-7 text-sm font-bold lowercase transition-colors ${
                  ativa ? 'bg-mt-green text-white' : 'bg-mt-green-sup text-mt-green-dark'
                }`}
              >
                {ativa ? <Check className="h-4 w-4" strokeWidth={3} /> : opcao.id}
              </span>
              {/* Opção é controle: Satoshi 500 minúsculo, como chips e
                  perguntas do FAQ da LP. */}
              <span className="font-satoshi text-base font-medium lowercase leading-[1.4] text-mt-green-dark celular-baixo:text-[15px] celular-baixo:leading-[1.35] celular-minimo:text-[14px] sm:text-[17px]">
                {opcao.texto}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
