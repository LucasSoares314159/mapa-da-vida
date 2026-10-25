'use client'

import { useCallback, useState } from 'react'
import type { ConfigQuiz, ResultadoQuiz } from '@/lib/quiz/tipos'
import { track } from '@/lib/tracking/eventos'
import { iniciarCheckoutDoQuiz } from '@/lib/quiz/checkout-cliente'
import { TextoQuiz } from './TextoQuiz'
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

        <div className="mt-5 space-y-4">
          {texto.paragrafos.map((paragrafo, i) => (
            <p key={i} className="text-base leading-7 text-mt-green-dark sm:text-[17px]">
              <TextoQuiz texto={paragrafo} />
            </p>
          ))}
        </div>

        <div className="mt-10">
          <button
            type="button"
            onClick={() => setMostrandoVsl(true)}
            className="w-full rounded-xl bg-mt-green px-6 py-4 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-mt-green-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mt-green focus-visible:ring-offset-2"
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
    <div className="flex flex-1 flex-col justify-center">
      <h1 className="font-heading text-[22px] font-bold leading-tight text-mt-black sm:text-[28px]">
        {config.vsl.titulo}
      </h1>
      <p className="mt-3 text-base leading-7 text-mt-muted">{config.vsl.subtitulo}</p>

      <div className="mt-7">
        <VslPlayer vsl={config.vsl} onPlay={registrarPlay} onLiberarCta={liberarCta} />
      </div>

      {ctaLiberado && (
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={comprar}
            disabled={indoParaCheckout}
            className="w-full rounded-xl bg-mt-green px-6 py-4 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-mt-green-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mt-green focus-visible:ring-offset-2 disabled:opacity-70"
          >
            {indoParaCheckout ? 'Abrindo o pagamento...' : config.vsl.rotuloCta}
          </button>

          {config.vsl.apoioCta && (
            <p className="mt-3 text-sm leading-6 text-mt-muted">{config.vsl.apoioCta}</p>
          )}

          {erro && (
            <p role="alert" className="mt-3 text-sm font-medium text-mt-red">
              Não foi possível abrir o pagamento. Tente novamente.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
