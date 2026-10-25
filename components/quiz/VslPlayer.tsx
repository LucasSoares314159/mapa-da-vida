'use client'

import { useEffect, useRef, useState } from 'react'
import Script from 'next/script'
import { Play } from 'lucide-react'
import type { ConfigVsl } from '@/lib/quiz/tipos'

// Player da VSL em formato de adapter.
//
// A tela do resultado nao sabe qual provider esta em uso: passa a config e
// recebe um player 9:16 mais o aviso de quando revelar o CTA. Trocar de
// provider e adicionar um branch aqui, sem tocar no quiz.
//
// Vertical 9:16 ocupando a largura toda no celular e centralizado em ~400px no
// desktop: e o formato nativo do criativo de anuncio, e um 9:16 esticado em
// largura de texto ficaria alto demais para caber na tela.

type Props = {
  vsl: ConfigVsl
  /** Chamado uma vez, no primeiro play. */
  onPlay?: () => void
  /** Chamado quando ctaAtSeconds e alcancado. */
  onLiberarCta?: () => void
  /**
   * Teto de altura (classe max-h-*) para o player caber na dobra junto com a
   * chamada e o CTA. Como a proporcao 9:16 e mantida, limitar a altura encolhe
   * a largura — o player fica mais estreito que 400px em telas baixas, em vez
   * de empurrar o CTA para fora da tela.
   */
  maxAlturaClasse?: string
}

const LARGURA_DESKTOP = 'sm:max-w-[400px]'

export function VslPlayer({ vsl, onPlay, onLiberarCta, maxAlturaClasse = '' }: Props) {
  const jaDeuPlay = useRef(false)

  // Sem videoId o player nao e montado — ver a pendencia na config. Libera o
  // CTA de imediato: um retangulo quebrado seguido de botao escondido deixaria
  // a tela de compra sem saida.
  const semVideo = !vsl.videoId.trim()

  useEffect(() => {
    if (semVideo) onLiberarCta?.()
  }, [semVideo, onLiberarCta])

  if (semVideo) {
    // Mesma caixa 9:16 do player real (ver VturbPlayer abaixo): o placeholder
    // ocupa exatamente o espaco que a VSL gravada vai ocupar, para o layout
    // nao pular quando o videoId for preenchido.
    //
    // Vazio, um 9:16 so com texto parece um retangulo quebrado. O icone de
    // play centralizado e o gradiente dao cara de "player aguardando video"
    // em vez de area vazia — intencional, nao defeito.
    return (
      <div
        className={`mx-auto flex aspect-[9/16] w-auto max-w-full flex-col items-center justify-center gap-4 rounded-2xl border border-white/10 bg-gradient-to-b from-black/40 to-black/20 px-6 text-center ${maxAlturaClasse} ${LARGURA_DESKTOP}`}
      >
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/20">
          <Play className="ml-1 h-7 w-7 fill-white/90 text-white/90" aria-hidden="true" />
        </span>
        <p className="max-w-[220px] text-sm leading-6 text-white/60">
          Seu vídeo com a análise completa aparece aqui em instantes.
        </p>
      </div>
    )
  }

  if (vsl.provider === 'vturb') {
    return (
      <VturbPlayer
        vsl={vsl}
        maxAlturaClasse={maxAlturaClasse}
        onPlay={() => {
          if (jaDeuPlay.current) return
          jaDeuPlay.current = true
          onPlay?.()
        }}
        onLiberarCta={onLiberarCta}
      />
    )
  }

  return (
    <Html5Player
      vsl={vsl}
      maxAlturaClasse={maxAlturaClasse}
      onPlay={() => {
        if (jaDeuPlay.current) return
        jaDeuPlay.current = true
        onPlay?.()
      }}
      onLiberarCta={onLiberarCta}
    />
  )
}

/**
 * VTurb.
 *
 * O player e um custom element carregado por script externo, que nao expoe
 * evento de progresso de forma estavel. O CTA e liberado por temporizador a
 * partir da montagem, nao do tempo real de reproducao — e aproximacao
 * assumida: quem pausa ve o botao antes do ponto exato do roteiro. Preferir
 * isso a prender o CTA atras de um evento que o provider pode nao emitir.
 */
function VturbPlayer({ vsl, onPlay, onLiberarCta, maxAlturaClasse = '' }: Props) {
  useTemporizadorCta(vsl.ctaAtSeconds, onLiberarCta)

  return (
    <div
      className={`relative mx-auto aspect-[9/16] w-auto max-w-full overflow-hidden rounded-2xl bg-black ${maxAlturaClasse} ${LARGURA_DESKTOP}`}
      onPointerDown={onPlay}
    >
      {/* O embed da VTurb injeta o player dentro deste container. */}
      <div
        id={`vid-${vsl.videoId}`}
        className="absolute inset-0"
        dangerouslySetInnerHTML={{
          __html: `<vturb-smartplayer id="vid-player-${vsl.videoId}" style="display:block;width:100%;height:100%"></vturb-smartplayer>`,
        }}
      />
      <Script
        id={`vturb-${vsl.videoId}`}
        strategy="afterInteractive"
        src={
          vsl.contaId
            ? `https://scripts.converteai.net/${vsl.contaId}/players/${vsl.videoId}/v4/player.js`
            : `https://scripts.converteai.net/players/${vsl.videoId}/player.js`
        }
      />
    </div>
  )
}

/** Fallback com <video> nativo: usado em teste local e se a VTurb sair. */
function Html5Player({ vsl, onPlay, onLiberarCta, maxAlturaClasse = '' }: Props) {
  const ref = useRef<HTMLVideoElement>(null)
  const liberado = useRef(false)

  return (
    <video
      ref={ref}
      src={vsl.videoId}
      controls
      playsInline
      className={`mx-auto aspect-[9/16] w-auto max-w-full rounded-2xl bg-black ${maxAlturaClasse} ${LARGURA_DESKTOP}`}
      onPlay={onPlay}
      onTimeUpdate={() => {
        if (liberado.current) return
        if ((ref.current?.currentTime ?? 0) >= vsl.ctaAtSeconds) {
          liberado.current = true
          onLiberarCta?.()
        }
      }}
    />
  )
}

/** Libera o CTA depois de ctaAtSeconds. Zero libera de imediato. */
function useTemporizadorCta(segundos: number, onLiberarCta?: () => void) {
  const [liberado, setLiberado] = useState(false)

  useEffect(() => {
    if (liberado) return

    if (segundos <= 0) {
      setLiberado(true)
      onLiberarCta?.()
      return
    }

    const id = setTimeout(() => {
      setLiberado(true)
      onLiberarCta?.()
    }, segundos * 1000)

    return () => clearTimeout(id)
  }, [segundos, liberado, onLiberarCta])
}
