'use client'

import { useCallback, useState } from 'react'
import type { ConfigQuiz, ResultadoQuiz } from '@/lib/quiz/tipos'
import { track } from '@/lib/tracking/eventos'
import { iniciarCheckoutDoQuiz } from '@/lib/quiz/checkout-cliente'
import { BlocoTexto } from './BlocoTexto'
import { VslPlayer } from './VslPlayer'

// Telas 10 e da Mini-VSL.
//
// As duas vivem no mesmo componente em duas etapas: o diagnostico e, apos o
// clique em "ASSISTIR A MINHA ANALISE", o video. Sao uma rota so porque a
// transicao e imediata e todos os perfis vao para a MESMA VSL — o perfil
// personaliza a leitura, nunca a oferta.

type Props = {
  config: ConfigQuiz
  resultado: ResultadoQuiz
}

export function TelaResultado({ config, resultado }: Props) {
  const [mostrandoVsl, setMostrandoVsl] = useState(false)
  const texto = config.resultados[resultado.perfil]

  if (!mostrandoVsl) {
    return (
      <div className="flex flex-1 flex-col justify-center">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-mt-green">
          Seu diagnóstico
        </p>
        <h1 className="font-heading text-[26px] font-bold leading-tight text-mt-black sm:text-[32px]">
          {texto.titulo}
        </h1>

        <div className="mt-5">
          <BlocoTexto paragrafos={texto.paragrafos} />
        </div>

        <div className="mt-10">
          <button
            type="button"
            onClick={() => setMostrandoVsl(true)}
            className="w-full rounded-xl bg-mt-green-dark px-6 py-4 text-sm font-bold uppercase tracking-wide text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mt-green focus-visible:ring-offset-2"
          >
            {texto.rotuloBotao}
          </button>
        </div>
      </div>
    )
  }

  return <TelaVsl config={config} resultado={resultado} />
}

function TelaVsl({ config, resultado }: Props) {
  const [ctaLiberado, setCtaLiberado] = useState(false)
  const [indoParaCheckout, setIndoParaCheckout] = useState(false)
  const [erro, setErro] = useState(false)

  const liberarCta = useCallback(() => setCtaLiberado(true), [])
  const registrarPlay = useCallback(() => {
    track('vsl_play', { quiz_slug: config.slug, result_profile: resultado.perfil })
  }, [config.slug, resultado.perfil])

  async function comprar() {
    setIndoParaCheckout(true)
    setErro(false)
    track('cta_click', { quiz_slug: config.slug, result_profile: resultado.perfil })

    try {
      window.location.href = await iniciarCheckoutDoQuiz({
        quizSlug: config.slug,
        resultProfile: resultado.perfil,
      })
    } catch {
      // Botao morto numa tela de compra e pior que mensagem de erro.
      setIndoParaCheckout(false)
      setErro(true)
    }
  }

  return (
    // Fundo solido cobrindo a viewport inteira (fixed, nao so a altura do
    // conteudo): e o que da a sensacao de importancia pedida — um ambiente
    // proprio e serio para assistir, nao mais uma secao dentro da pagina
    // off-white do resto do quiz. fixed inset-0 em vez de margem negativa
    // porque o padding do <main> pai (QuizConversa) e o unico outro lugar que
    // sabe o valor exato a compensar, e overflow-y-auto deixa o conteudo
    // rolar se a tela for baixa demais para caber tudo.
    <div className="fixed inset-0 z-20 flex flex-col items-center justify-center overflow-y-auto bg-mt-green-dark px-5 py-10 text-center sm:px-8">
      <p className="mb-6 font-heading text-xl font-bold leading-snug text-white sm:text-2xl">
        {config.vsl.chamada}
      </p>

      <VslPlayer vsl={config.vsl} onPlay={registrarPlay} onLiberarCta={liberarCta} />

      {ctaLiberado && (
        <div className="mt-8 w-full max-w-[400px] text-center">
          <button
            type="button"
            onClick={comprar}
            disabled={indoParaCheckout}
            // Fundo claro, nao mt-green-dark: sobre a pagina inteira ja
            // escura, o mesmo tom do botao ficaria quase invisivel.
            className="w-full rounded-xl bg-white px-6 py-4 text-sm font-bold uppercase tracking-wide text-mt-green-dark transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-mt-green-dark disabled:opacity-60"
          >
            {indoParaCheckout ? 'Abrindo o pagamento...' : config.vsl.rotuloCta}
          </button>

          {config.vsl.apoioCta && (
            <p className="mt-3 text-sm leading-6 text-white/70">{config.vsl.apoioCta}</p>
          )}

          {erro && (
            <p role="alert" className="mt-3 text-sm font-medium text-red-300">
              Não foi possível abrir o pagamento. Tente novamente.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
