'use client'

import { useCallback, useState } from 'react'
import { Check } from 'lucide-react'
import type { ConfigQuiz, Paragrafo, ResultadoQuiz } from '@/lib/quiz/tipos'
import { track, trackInicioCheckout } from '@/lib/tracking/eventos'
import { iniciarCheckoutDoQuiz } from '@/lib/quiz/checkout-cliente'
import { BlocoGarantia } from './BlocoGarantia'
import { BlocoTexto } from './BlocoTexto'
import { BotaoQuiz } from './BotaoQuiz'
import { TextoQuiz } from './TextoQuiz'
import { PreloadVsl, VslPlayer } from './VslPlayer'

// A "virada" do diagnostico e o paragrafo que os docs marcam inteiro em negrito
// (ex. "Talvez voce nao precise de mais um planejamento..."). Separa-lo num
// card de destaque da ao resultado a hierarquia que uma pilha de paragrafos
// iguais nao tem — e o equivalente honesto ao card de numero dos quizzes de
// funil, so que com a frase-pivo aprovada em vez de um valor inventado. O texto
// nao muda: so e tirado da sequencia e exibido em destaque proprio.
function ehDestaque(p: Paragrafo): p is string {
  return typeof p === 'string' && p.startsWith('**') && p.endsWith('**')
}

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
    // A virada sai da sequencia para o card de destaque; os demais paragrafos
    // seguem na ordem. Se o perfil nao tiver paragrafo em negrito, o card
    // simplesmente nao aparece e tudo fica no corpo.
    const destaque = texto.paragrafos.find(ehDestaque)
    const corpo = texto.paragrafos.filter((p) => p !== destaque)

    return (
      <div className="flex flex-1 flex-col justify-center py-2">
        {/* Selo + eyebrow: marca que isto e a conclusao de uma analise, nao
            mais uma tela de texto. Eyebrow em Lora minuscula de apoio, como o
            da LP — a caixa alta espacada saiu do sistema. */}
        <div className="flex flex-col items-center text-center">
          <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-mt-green text-white">
            <Check className="h-6 w-6" strokeWidth={3} aria-hidden="true" />
          </span>
          <p className="mb-2 font-editorial text-lg lowercase text-mt-apoio">seu diagnóstico</p>
          <h1 className="font-satoshi text-[30px] font-medium lowercase leading-[1.1] tracking-[-0.02em] text-mt-green-dark [text-wrap:balance] sm:text-[40px]">
            {texto.titulo}
          </h1>
        </div>

        {destaque && (
          // A frase-pivo e a virada do diagnostico, e ganha o tratamento da
          // virada da LP: painel verde escuro (raio 24, sombra 3), Satoshi 500
          // off-white. E o contraste de fundo — nao uma caixa a mais no claro —
          // que faz o olho parar nela antes da leitura corrida.
          <div className="mt-8 rounded-painel bg-mt-green-dark px-6 py-8 text-center shadow-mt-3 sm:px-10 sm:py-10">
            <p className="mx-auto max-w-[20em] font-satoshi text-[22px] font-medium lowercase leading-[1.2] tracking-[-0.02em] text-mt-off-white [text-wrap:balance] sm:text-[26px]">
              {/* Sem os ** — o painel ja e o destaque, e TextoQuiz os
                  converteria num <strong> redundante. */}
              {destaque.slice(2, -2)}
            </p>
          </div>
        )}

        <div className="mt-8">
          <BlocoTexto paragrafos={corpo} />
        </div>

        <div className="mt-10">
          <BotaoQuiz onClick={() => setMostrandoVsl(true)}>{texto.rotuloBotao}</BotaoQuiz>
        </div>

        <PreloadVsl vsl={config.vsl} />
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
    // Dispara antes do fetch do checkout: a criacao da cobranca leva tempo
    // suficiente para o beacon sair antes do redirect.
    trackInicioCheckout({ quiz_slug: config.slug, result_profile: resultado.perfil })

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
        {/* Chamada na voz do hero da LP: Satoshi 500 minúsculo off-white, o
            trecho *marcado* na config em --verde 700. */}
        <p className="mb-6 font-satoshi text-[28px] font-medium lowercase leading-[1.1] tracking-[-0.02em] text-mt-off-white [text-wrap:balance] sm:text-[34px]">
          <TextoQuiz texto={config.vsl.chamada} tema="escuro" />
        </p>

        {/* Largura total no celular, ate 400px no desktop, sem teto de altura.
            O teto antigo existia para o CTA caber na dobra junto do video
            desde o inicio; agora o CTA so aparece no segundo da oferta. */}
        <VslPlayer vsl={config.vsl} onPlay={registrarPlay} onLiberarCta={liberarCta} />

        {/* Oculto ate a reproducao alcancar config.vsl.ctaAtSeconds — ver
            VslPlayer. Ao aparecer, o comportamento do clique e o de sempre. */}
        {ctaLiberado && (
          <div className="mt-6 w-full max-w-[400px] text-center">
            {/* CTA do hero escuro da LP (.btn-cta-hero): pílula --verde com
                texto branco, foco off-white. Contra o verde escuro da tela o
                botão fica em ~4:1 — se destaca sem precisar do fundo branco. */}
            <BotaoQuiz tema="escuro" onClick={comprar} disabled={indoParaCheckout} className="sm:w-full">
              {indoParaCheckout ? 'Abrindo o pagamento...' : config.vsl.rotuloCta}
            </BotaoQuiz>

            {config.vsl.apoioCta && (
              <p className="mt-3 font-editorial text-[15px] lowercase leading-6 text-mt-off-white/70">
                {config.vsl.apoioCta}
              </p>
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
        </section>
      )}
    </div>
  )
}
