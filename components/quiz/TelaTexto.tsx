'use client'

import type { Interstituicao } from '@/lib/quiz/tipos'
import { BlocoTexto } from './BlocoTexto'
import { BotaoQuiz } from './BotaoQuiz'
import { TextoQuiz } from './TextoQuiz'

// Tela de copy sem pergunta: a abertura (tela 01 dos docs) e as pontes do meio
// do fluxo (tela 05).
//
// As duas vivem no fundo verde escuro (QuizConversa troca o fundo da pagina),
// na linguagem das secoes escuras da LP /trilha:
//
// - A abertura e o hero: H1 em Satoshi 500 minusculo com o trecho-chave em
//   --verde 700, apoio em Lora reta minuscula, e a linha de reforco ("6
//   perguntas rapidas · sem cadastro") menor logo acima do botao. Quem chega do
//   anuncio reconhece a mesma voz visual — o quiz e a primeira pagina que essa
//   pessoa ve. Sem mascote: a imagem priority era o peso que derrubava a
//   entrada no Android (ver lib/quiz/passos.ts e CLAUDE.md), o H1 carrega a
//   mensagem sozinho.
//
// - A ponte e a virada da LP: a frase-pivo grande e, abaixo, o contexto em
//   prosa. Nao e um diagnostico — nesse ponto so 3 das 6 perguntas foram
//   respondidas, e afirmar um perfil ali seria chute que poderia contradizer o
//   resultado final. A prosa fica numa superficie escura sem borda (regra da LP
//   para superficie escura sobre fundo escuro).
//
// Os titulos usam *destaque* da config (ver TextoQuiz); o minusculo vem do CSS,
// o texto-fonte e o que o leitor de tela anuncia seguem com a grafia dos docs.

type Props = {
  tela: Interstituicao
  onAvancar: () => void
  variante?: 'abertura' | 'ponte'
}

const TITULO =
  'font-satoshi font-medium lowercase tracking-[-0.02em] text-mt-off-white [text-wrap:balance]'

export function TelaTexto({ tela, onAvancar, variante = 'ponte' }: Props) {
  if (variante === 'abertura') {
    return (
      <div className="flex flex-1 flex-col items-center justify-center py-4 text-center">
        {tela.titulo && (
          <h1 className={`${TITULO} max-w-[15em] text-[32px] leading-[1.08] celular-baixo:text-[28px] sm:text-5xl`}>
            <TextoQuiz texto={tela.titulo} tema="escuro" />
          </h1>
        )}

        {/* Apoio curto: Lora reta minuscula, como o subtitulo do hero. Coluna
            mais estreita que o titulo — e o apoio que recua, nao o titulo. O 1o
            paragrafo e o subtitulo; os seguintes (ex. "6 perguntas · sem
            cadastro") sao reforco menor. */}
        <div className="mt-5 max-w-[30em] space-y-3 celular-baixo:mt-4">
          {tela.paragrafos.map((paragrafo, i) => (
            <p
              key={i}
              className={`font-editorial lowercase [text-wrap:pretty] ${
                i === 0
                  ? 'text-lg leading-[1.6] text-mt-off-white/85 celular-baixo:text-base sm:text-[21px]'
                  : 'text-[15px] text-mt-off-white/70'
              }`}
            >
              {Array.isArray(paragrafo) ? (
                paragrafo.join(' ')
              ) : (
                <TextoQuiz texto={paragrafo} tema="escuro" />
              )}
            </p>
          ))}
        </div>

        {/* Botao grudado no rodape no celular, como nas demais telas: num
            Android de 360x600 o botao da abertura ficava a 23px da borda de
            baixo. No desktop volta ao fluxo. */}
        <div className="sticky bottom-0 z-10 -mx-5 mt-8 w-full bg-mt-green-dark px-5 pb-4 pt-3 before:pointer-events-none before:absolute before:inset-x-0 before:-top-6 before:h-6 celular-minimo:pb-2 celular-minimo:pt-2 before:bg-gradient-to-t before:from-mt-green-dark before:to-mt-green-dark/0 sm:static sm:mx-0 sm:mt-9 sm:w-auto sm:bg-transparent sm:px-0 sm:pb-0 sm:pt-0 sm:before:hidden">
          <BotaoQuiz tema="escuro" onClick={() => onAvancar()}>
            {tela.rotuloBotao}
          </BotaoQuiz>
        </div>
      </div>
    )
  }

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
      <div className="sticky bottom-0 z-10 -mx-5 mt-6 bg-mt-green-dark px-5 pb-4 pt-3 before:pointer-events-none before:absolute before:inset-x-0 before:-top-6 before:h-6 celular-minimo:pb-2 celular-minimo:pt-2 celular-minimo:before:-top-3 celular-minimo:before:h-3 before:bg-gradient-to-t before:from-mt-green-dark before:to-mt-green-dark/0 sm:static sm:mx-0 sm:mt-8 sm:bg-transparent sm:px-0 sm:pb-0 sm:pt-0 sm:before:hidden">
        <BotaoQuiz tema="escuro" onClick={() => onAvancar()}>
          {tela.rotuloBotao}
        </BotaoQuiz>
      </div>
    </div>
  )
}
