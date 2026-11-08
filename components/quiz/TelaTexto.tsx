'use client'

import Image from 'next/image'
import type { Interstituicao } from '@/lib/quiz/tipos'
import { BlocoTexto } from './BlocoTexto'
import { BotaoQuiz } from './BotaoQuiz'
import { TextoQuiz } from './TextoQuiz'

// Tela de copy sem pergunta: a abertura e as pontes do meio do fluxo.
//
// As duas vivem no fundo verde escuro (QuizConversa troca o fundo da pagina),
// na linguagem das secoes escuras da LP /trilha:
//
// - A abertura e o hero da LP: mascote dos posts de topo de funil, H1 em
//   Satoshi 500 minusculo com o trecho-chave em --verde 700, apoio em Lora reta
//   minuscula. Quem chega do anuncio reconhece a mesma voz visual — o quiz e a
//   primeira pagina que essa pessoa ve.
//
// - A ponte (tela 05 dos docs) e a virada da LP: a frase-pivo grande e, abaixo,
//   o contexto em prosa. Nao e um diagnostico — nesse ponto so 3 das 6 perguntas
//   foram respondidas, e afirmar um perfil ali seria chute que poderia
//   contradizer o resultado final. A prosa fica numa superficie escura sem
//   borda (regra da LP para superficie escura sobre fundo escuro).
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

export function TelaTexto({ tela, onAvancar, variante = 'abertura' }: Props) {
  if (variante === 'ponte') {
    return (
      <div className="flex flex-1 flex-col justify-center py-4 text-center">
        {tela.titulo && (
          <h1 className={`${TITULO} mx-auto max-w-[17em] text-[30px] leading-[1.08] sm:text-[40px]`}>
            <TextoQuiz texto={tela.titulo} tema="escuro" />
          </h1>
        )}

        <div
          className={`${tela.titulo ? 'mt-8' : ''} rounded-painel bg-white/[0.06] p-6 text-left sm:p-8`}
        >
          <BlocoTexto paragrafos={tela.paragrafos} tema="escuro" />
        </div>

        <div className="mt-8">
          <BotaoQuiz tema="escuro" onClick={() => onAvancar()}>
            {tela.rotuloBotao}
          </BotaoQuiz>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center py-4 text-center">
      {/* Decorativo: o H1 carrega a mensagem. Dimensoes reservam o espaco. */}
      <Image
        src="/trilha/cerebro-540.png"
        alt=""
        width={540}
        height={486}
        priority
        className="mb-6 h-auto w-[120px] sm:mb-7 sm:w-[160px]"
      />

      {tela.titulo && (
        <h1 className={`${TITULO} max-w-[15em] text-[34px] leading-[1.08] sm:text-5xl`}>
          <TextoQuiz texto={tela.titulo} tema="escuro" />
        </h1>
      )}

      {/* Apoio curto: Lora reta minuscula, como o subtitulo do hero. Coluna
          mais estreita que o titulo — e o apoio que recua, nao o titulo. */}
      <div className="mt-5 max-w-[30em] space-y-3">
        {tela.paragrafos.map((paragrafo, i) => (
          <p
            key={i}
            className={`font-editorial lowercase [text-wrap:pretty] ${
              i === 0
                ? 'text-lg leading-[1.6] text-mt-off-white/85 sm:text-[21px]'
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

      <div className="mt-9 w-full sm:w-auto">
        <BotaoQuiz tema="escuro" onClick={() => onAvancar()}>
          {tela.rotuloBotao}
        </BotaoQuiz>
      </div>
    </div>
  )
}
