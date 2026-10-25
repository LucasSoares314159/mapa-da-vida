'use client'

import { MessageCircle } from 'lucide-react'
import type { Interstituicao } from '@/lib/quiz/tipos'
import { BlocoTexto } from './BlocoTexto'

// Tela de copy sem pergunta: a abertura e as pontes do meio do fluxo.
//
// As duas compartilham a estrutura (titulo opcional, paragrafos, botao), mas
// nao o mesmo peso visual. A abertura e uma tela cheia de boas-vindas — titulo
// grande, pagina em branco ao redor, e o primeiro contato com o quiz. Uma
// ponte no meio do fluxo (tela 05 dos docs) e um comentario rapido entre duas
// perguntas: sem moldura, ela se misturava ao fundo da pagina e parecia texto
// solto escapado do layout, nao uma mensagem com conteudo util. O card com
// borda e o icone resolvem isso sem usar o tom literal de balao de chat, que
// destoaria do resto do quiz.

type Props = {
  tela: Interstituicao
  onAvancar: () => void
  variante?: 'abertura' | 'ponte'
}

export function TelaTexto({ tela, onAvancar, variante = 'abertura' }: Props) {
  if (variante === 'ponte') {
    return (
      <div className="flex flex-1 flex-col justify-center">
        <div className="rounded-2xl border border-mt-border bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-mt-green/10">
            <MessageCircle className="h-[18px] w-[18px] text-mt-green-dark" aria-hidden="true" />
          </div>

          {tela.titulo && (
            <h1 className="font-heading text-xl font-bold leading-snug text-mt-black sm:text-2xl">
              {tela.titulo}
            </h1>
          )}

          <div className={tela.titulo ? 'mt-4' : ''}>
            <BlocoTexto paragrafos={tela.paragrafos} />
          </div>
        </div>

        <div className="mt-8">
          <button
            type="button"
            onClick={onAvancar}
            className="w-full rounded-xl bg-mt-green-dark px-6 py-4 text-sm font-bold uppercase tracking-wide text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mt-green focus-visible:ring-offset-2 sm:w-auto sm:px-10"
          >
            {tela.rotuloBotao}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col justify-center">
      {tela.titulo && (
        <h1 className="font-heading text-[26px] font-bold leading-tight text-mt-black sm:text-3xl">
          {tela.titulo}
        </h1>
      )}

      <div className="mt-5">
        <BlocoTexto paragrafos={tela.paragrafos} />
      </div>

      <div className="mt-10">
        <button
          type="button"
          onClick={onAvancar}
          className="w-full rounded-xl bg-mt-green-dark px-6 py-4 text-sm font-bold uppercase tracking-wide text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mt-green focus-visible:ring-offset-2 sm:w-auto sm:px-10"
        >
          {tela.rotuloBotao}
        </button>
      </div>
    </div>
  )
}
