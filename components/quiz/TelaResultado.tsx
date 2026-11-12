'use client'

import { useCallback, useRef, useState } from 'react'
import { Check } from 'lucide-react'
import type { ConfigQuiz, Paragrafo, ResultadoQuiz } from '@/lib/quiz/tipos'
import { track, trackInicioCheckout } from '@/lib/tracking/eventos'
import type { LiberacaoCta, OrigemLiberacaoCta } from './VslPlayer'
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

        {/* Botao grudado no rodape no celular, como o da ponte e o da pergunta
            6. O diagnostico passa de ~1200px em qualquer celular, e era
            justamente aqui que o funil perdia gente: 6 terminaram o quiz e 2
            deram play na VSL. A pessoa continua rolando e lendo tudo; o botao
            so deixa de exigir que ela chegue ao fim para achar a saida. No
            desktop volta ao fluxo, abaixo do texto. */}
        <div className="sticky bottom-0 z-10 -mx-5 mt-8 bg-mt-off-white px-5 pb-4 pt-3 before:pointer-events-none before:absolute before:inset-x-0 before:-top-6 before:h-6 celular-minimo:pb-2 celular-minimo:pt-2 celular-minimo:before:-top-3 celular-minimo:before:h-3 before:bg-gradient-to-t before:from-mt-off-white before:to-mt-off-white/0 sm:static sm:mx-0 sm:mt-10 sm:bg-transparent sm:px-0 sm:pb-0 sm:pt-0 sm:before:hidden">
          <BotaoQuiz onClick={() => setMostrandoVsl(true)}>{texto.rotuloBotao}</BotaoQuiz>
        </div>

        <PreloadVsl vsl={config.vsl} />
      </div>
    )
  }

  return <TelaVsl config={config} resultado={resultado} />
}

// 'fallback_15s' nao vem do VslPlayer: e o caminho onFalharCarga desta tela.
type OrigemCtaRegistrada = OrigemLiberacaoCta | 'fallback_15s'

function TelaVsl({ config, resultado }: Props) {
  const [ctaLiberado, setCtaLiberado] = useState(false)
  const [videoFalhou, setVideoFalhou] = useState(false)
  const [indoParaCheckout, setIndoParaCheckout] = useState(false)
  const [erro, setErro] = useState(false)

  // Por que o botao apareceu + quanto da VSL ja fora assistido, capturado no
  // momento da liberacao (nao no clique). O primeiro caminho a liberar vence.
  const liberacao = useRef<{ origem: OrigemCtaRegistrada; fronteiraS: number } | null>(null)
  // Cliques nesta tela: o 1o guarda a origem real; os seguintes sao ja_clicou.
  const cliques = useRef(0)

  const registrarLiberacao = useCallback(
    (info: { origem: OrigemCtaRegistrada; fronteiraS: number }) => {
      if (liberacao.current) return // o primeiro caminho a liberar vence
      liberacao.current = info
      setCtaLiberado(true)
      // Denominador: liberacoes por origem, contra cliques.
      track('cta_visivel', {
        quiz_slug: config.slug,
        result_profile: resultado.perfil,
        cta_origem: info.origem,
        vsl_fronteira_s: info.fronteiraS,
      })
    },
    [config.slug, resultado.perfil]
  )

  const liberarCta = useCallback(
    (info: LiberacaoCta) => registrarLiberacao(info),
    [registrarLiberacao]
  )
  // Sem player / fallback de 15s: o botao sai na hora, com aviso. Se o video
  // chegar depois, o aviso some e o botao fica.
  const falharVideo = useCallback(() => {
    setVideoFalhou(true)
    registrarLiberacao({ origem: 'fallback_15s', fronteiraS: 0 })
  }, [registrarLiberacao])
  const recuperarVideo = useCallback(() => setVideoFalhou(false), [])
  const registrarPlay = useCallback(
    (fronteiraS: number) => {
      track('vsl_play', {
        quiz_slug: config.slug,
        result_profile: resultado.perfil,
        vsl_fronteira_s: fronteiraS,
      })
    },
    [config.slug, resultado.perfil]
  )

  async function comprar() {
    setIndoParaCheckout(true)
    setErro(false)
    const registro = liberacao.current
    // O botao so fica clicavel com ctaLiberado, que registrarLiberacao sempre
    // seta: registro nunca e nulo no 1o clique. O ?? e so guarda de tipo.
    const ctaOrigem: OrigemCtaRegistrada | 'ja_clicou' =
      cliques.current > 0 ? 'ja_clicou' : registro?.origem ?? 'fallback_sem_video'
    cliques.current += 1
    const paramsCta = {
      quiz_slug: config.slug,
      result_profile: resultado.perfil,
      cta_origem: ctaOrigem,
      vsl_fronteira_s: registro?.fronteiraS ?? 0,
    }
    track('cta_click', paramsCta)
    // Dispara antes do fetch do checkout: a criacao da cobranca leva tempo
    // suficiente para o beacon sair antes do redirect.
    trackInicioCheckout(paramsCta)

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
    //
    // Com o botao liberado, o pb-40 no celular reserva o espaco da barra fixa:
    // rolando ate o fim, nada (a garantia, o fim do video) fica preso atras dela.
    <div
      className={`fixed inset-0 z-20 overflow-y-auto bg-mt-green-dark pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] ${
        ctaLiberado ? 'pb-40 sm:pb-0' : ''
      }`}
    >
      {/* Primeira dobra: chamada + VSL + CTA cabem juntos numa tela. A
          garantia so aparece ao rolar — e a estrutura de VSL que converte:
          foco total no video e na oferta antes de qualquer outra coisa. */}
      <section className="flex min-h-dvh flex-col items-center justify-center px-5 py-8 text-center celular-baixo:py-4 sm:px-8">
        {/* Chamada na voz do hero da LP: Satoshi 500 minúsculo off-white, o
            trecho *marcado* na config em --verde 700. */}
        {/* Altura desta chamada + padding da secao = o desconto de altura em
            LARGURA_VSL (VslPlayer): mexeu aqui, confira la. */}
        <p className="mb-6 font-satoshi text-[28px] font-medium lowercase leading-[1.1] tracking-[-0.02em] text-mt-off-white [text-wrap:balance] celular-baixo:mb-3 celular-baixo:text-[24px] sm:text-[34px]">
          <TextoQuiz texto={config.vsl.chamada} tema="escuro" />
        </p>

        {/* Largura total no celular, ate 400px no desktop, sem teto de altura.
            O teto antigo existia para o CTA caber na dobra junto do video
            desde o inicio; agora o CTA so aparece no segundo da oferta. */}
        <VslPlayer
          vsl={config.vsl}
          onPlay={registrarPlay}
          onLiberarCta={liberarCta}
          onFalharCarga={falharVideo}
          onRecuperarCarga={recuperarVideo}
        />

        {/* Oculto ate a reproducao alcancar config.vsl.ctaAtSeconds — ver
            VslPlayer. Ao aparecer, o comportamento do clique e o de sempre.

            Celular: barra fixa na base da viewport, por cima do video. Com o
            9:16 em largura total, o botao no fluxo nascia abaixo da dobra e
            quem assistia nao via ele surgir. A barra cobre so a faixa de baixo
            da tela (onde o video ja continua para fora dela) e respeita a safe
            area do iOS. Desktop: volta para o fluxo, abaixo do player. */}
        {ctaLiberado && (
          <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-mt-green-dark/95 pb-[max(0.75rem,env(safe-area-inset-bottom))] pl-[max(1.25rem,env(safe-area-inset-left))] pr-[max(1.25rem,env(safe-area-inset-right))] pt-3 text-center shadow-[0_-8px_24px_rgba(0,0,0,0.25)] backdrop-blur motion-safe:animate-entrada-cta sm:static sm:z-auto sm:mt-6 sm:w-full sm:max-w-[400px] sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none sm:backdrop-blur-none">
            {videoFalhou && (
              <p role="status" className="mb-2 font-editorial text-[15px] lowercase leading-6 text-mt-off-white/80">
                o vídeo não carregou. se preferir, entre direto por aqui:
              </p>
            )}

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
