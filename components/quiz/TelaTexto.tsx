'use client'

import type { Interstituicao } from '@/lib/quiz/tipos'
import { BlocoTexto } from './BlocoTexto'
import { BotaoQuiz } from './BotaoQuiz'
import { TextoQuiz } from './TextoQuiz'

// Tela de copy sem pergunta: as pontes do meio do fluxo (tela 05 dos docs).
//
// Vive no fundo verde escuro (QuizConversa troca o fundo da pagina), na
// linguagem da virada da LP /trilha: a frase-pivo grande e, abaixo, o contexto
// em prosa. Nao e um diagnostico — nesse ponto so 3 das 6 perguntas foram
// respondidas, e afirmar um perfil ali seria chute que poderia contradizer o
// resultado final. A prosa fica numa superficie escura sem borda (regra da LP
// para superficie escura sobre fundo escuro).
//
// A abertura (hero com mascote) usava este componente e saiu do fluxo em
// novembro/2026 — ver lib/quiz/passos.ts.
//
// Os titulos usam *destaque* da config (ver TextoQuiz); o minusculo vem do CSS,
// o texto-fonte e o que o leitor de tela anuncia seguem com a grafia dos docs.

type Props = {
  tela: Interstituicao
  onAvancar: () => void
}

const TITULO =
  'font-satoshi font-medium lowercase tracking-[-0.02em] text-mt-off-white [text-wrap:balance]'

export function TelaTexto({ tela, onAvancar }: Props) {
  return (
    <div className="flex flex-1 flex-col justify-center py-4 text-center">
      {tela.titulo && (
        <h1 className={`${TITULO} mx-auto max-w-[17em] text-[30px] leading-[1.08] celular-baixo:text-[26px] sm:text-[40px]`}>
          <TextoQuiz texto={tela.titulo} tema="escuro" />
        </h1>
      )}

      <div
        className={`${tela.titulo ? 'mt-8 celular-baixo:mt-5' : ''} rounded-painel bg-white/[0.06] p-6 text-left celular-baixo:p-5 sm:p-8`}
      >
        <BlocoTexto paragrafos={tela.paragrafos} tema="escuro" />
      </div>

      {/* Botao grudado no rodape no celular, como o da pergunta 6: a prosa da
          ponte passa da altura de qualquer celular (o botao ficava em ~830px
          num Android de 360x600), e quem estava no ritmo do auto-advance nao
          tinha sinal de que precisava rolar para continuar. No desktop cabe:
          volta ao fluxo. */}
      <div className="sticky bottom-0 z-10 -mx-5 mt-6 bg-mt-green-dark px-5 pb-4 pt-3 before:pointer-events-none before:absolute before:inset-x-0 before:-top-6 before:h-6 before:bg-gradient-to-t before:from-mt-green-dark before:to-mt-green-dark/0 sm:static sm:mx-0 sm:mt-8 sm:bg-transparent sm:px-0 sm:pb-0 sm:pt-0 sm:before:hidden">
        <BotaoQuiz tema="escuro" onClick={() => onAvancar()}>
          {tela.rotuloBotao}
        </BotaoQuiz>
      </div>
    </div>
  )
}
