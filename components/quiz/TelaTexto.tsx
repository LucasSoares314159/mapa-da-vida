'use client'

import type { Interstituicao } from '@/lib/quiz/tipos'
import { TextoQuiz } from './TextoQuiz'

// Tela de copy sem pergunta: a abertura e as pontes do meio do fluxo.
// Uma so implementacao porque as duas tem a mesma forma — titulo, paragrafos,
// um botao de avancar.

type Props = {
  tela: Interstituicao
  onAvancar: () => void
}

export function TelaTexto({ tela, onAvancar }: Props) {
  return (
    <div className="flex flex-1 flex-col justify-center">
      {tela.titulo && (
        <h1 className="font-heading text-[26px] font-bold leading-tight text-mt-black sm:text-3xl">
          {tela.titulo}
        </h1>
      )}

      <div className="mt-5 space-y-4">
        {tela.paragrafos.map((paragrafo, i) => (
          <p key={i} className="text-base leading-7 text-mt-green-dark sm:text-lg">
            <TextoQuiz texto={paragrafo} />
          </p>
        ))}
      </div>

      <div className="mt-10">
        <button
          type="button"
          onClick={onAvancar}
          className="w-full rounded-xl bg-mt-green px-6 py-4 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-mt-green-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mt-green focus-visible:ring-offset-2 sm:w-auto sm:px-10"
        >
          {tela.rotuloBotao}
        </button>
      </div>
    </div>
  )
}
