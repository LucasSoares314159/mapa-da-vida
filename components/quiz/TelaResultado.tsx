'use client'

import { useCallback, useState } from 'react'
import type { ConfigQuiz, ResultadoQuiz } from '@/lib/quiz/tipos'
import { track } from '@/lib/tracking/eventos'
import { iniciarCheckoutDoQuiz } from '@/lib/quiz/checkout-cliente'
import { BlocoGarantia } from './BlocoGarantia'
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
    // Fundo solido cobrindo a viewport inteira (fixed): ambiente proprio para
    // assistir, separado da pagina off-white do resto do quiz. overflow-y-auto
    // porque o conteudo agora passa de uma tela — a garantia vive abaixo da
    // dobra.
    //
    // fixed inset-0 em vez de margem negativa porque o padding do <main> pai
    // (QuizConversa) e o unico outro lugar que saberia o valor a compensar.
    <div className="fixed inset-0 z-20 overflow-y-auto bg-mt-green-dark">
      {/* Primeira dobra: chamada + VSL + CTA cabem juntos numa tela. A
          garantia so aparece ao rolar — e a estrutura de VSL que converte:
          foco total no video e na oferta antes de qualquer outra coisa. */}
      <section className="flex min-h-dvh flex-col items-center justify-center px-5 py-8 text-center sm:px-8">
        <p className="mb-5 font-heading text-xl font-bold leading-snug text-white sm:text-2xl">
          {config.vsl.chamada}
        </p>

        <VslPlayer
          vsl={config.vsl}
          onPlay={registrarPlay}
          onLiberarCta={liberarCta}
          // Teto de altura para a VSL deixar espaco para a chamada e o CTA na
          // mesma dobra: sem isso o 9:16 em telas estreitas empurra o botao
          // para fora da tela, que e exatamente o que nao pode acontecer numa
          // VSL — o CTA precisa estar visivel junto do video.
          maxAlturaClasse="max-h-[min(70vh,620px)]"
        />

        {ctaLiberado && (
          <div className="mt-6 w-full max-w-[400px] text-center">
            <button
              type="button"
              onClick={comprar}
              disabled={indoParaCheckout}
              // Fundo claro, nao mt-green-dark: sobre a pagina ja escura, o
              // mesmo tom do botao ficaria quase invisivel.
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
      </section>

      {/* Segunda dobra: a garantia. So entra depois que a oferta ja foi vista,
          como reforco para quem rolou procurando "e se nao for pra mim?". */}
      {ctaLiberado && config.vsl.garantia && (
        <section className="flex flex-col items-center px-5 pb-12 text-center sm:px-8">
          <BlocoGarantia garantia={config.vsl.garantia} />

          <button
            type="button"
            onClick={comprar}
            disabled={indoParaCheckout}
            className="mt-6 w-full max-w-[440px] rounded-xl bg-white px-6 py-4 text-sm font-bold uppercase tracking-wide text-mt-green-dark transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-mt-green-dark disabled:opacity-60"
          >
            {indoParaCheckout ? 'Abrindo o pagamento...' : config.vsl.rotuloCta}
          </button>
        </section>
      )}
    </div>
  )
}
