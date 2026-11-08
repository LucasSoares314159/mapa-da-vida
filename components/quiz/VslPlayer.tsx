'use client'

import { useCallback, useEffect, useRef } from 'react'
import Script from 'next/script'
import { Play } from 'lucide-react'
import type { ConfigVsl } from '@/lib/quiz/tipos'
import {
  avancarFronteira,
  gravarProgressoVsl,
  lerProgressoVsl,
} from '@/lib/quiz/progresso-vsl'

// Player da VSL em formato de adapter.
//
// A tela do resultado nao sabe qual provider esta em uso: passa a config e
// recebe um player 9:16 mais o aviso de quando revelar o CTA. Trocar de
// provider e adicionar um branch aqui, sem tocar no quiz.
//
// 9:16 ocupando a largura toda no celular e centralizado em ate 400px no
// desktop: e o formato nativo do criativo de anuncio, e um 9:16 esticado em
// largura de texto ficaria alto demais.

type Props = {
  vsl: ConfigVsl
  /** Chamado uma vez, no primeiro play real (nunca no autoplay mudo). */
  onPlay?: () => void
  /** Chamado quando a reproducao continua alcanca ctaAtSeconds. */
  onLiberarCta?: () => void
}

const CAIXA_9_16 = 'relative mx-auto aspect-[9/16] w-full max-w-[400px] overflow-hidden rounded-2xl'

/** Script do player na VTurb (embed "JavaScript" da aba Embed). */
export function urlScriptVturb(vsl: ConfigVsl): string {
  return `https://scripts.converteai.net/${vsl.contaId}/players/${vsl.videoId}/v4/player.js`
}

/** Biblioteca do web component, comum a todo player v4. */
export const URL_BIBLIOTECA_VTURB = 'https://scripts.converteai.net/lib/js/smartplayer-wc/v4/smartplayer.js'

/**
 * A VSL tem video de verdade para mostrar. A VTurb sem conta nao monta (a URL
 * do script depende dela): tratar como "sem video" mantem a saida de compra,
 * em vez de um player que nunca carrega e um botao que nunca aparece.
 */
export function vslTemVideo(vsl: ConfigVsl): boolean {
  if (!vsl.videoId.trim()) return false
  if (vsl.provider === 'vturb' && !vsl.contaId?.trim()) return false
  return true
}

export function VslPlayer({ vsl, onPlay, onLiberarCta }: Props) {
  const jaDeuPlay = useRef(false)
  const temVideo = vslTemVideo(vsl)

  // vsl_play uma vez por tela: pausar e retomar emite video:play de novo.
  const registrarPlay = useCallback(() => {
    if (jaDeuPlay.current) return
    jaDeuPlay.current = true
    onPlay?.()
  }, [onPlay])

  // Sem video o player nao e montado. Libera o CTA de imediato: um retangulo
  // quebrado seguido de botao escondido deixaria a tela de compra sem saida.
  useEffect(() => {
    if (!temVideo) onLiberarCta?.()
  }, [temVideo, onLiberarCta])

  if (!temVideo) {
    // Mesma caixa 9:16 do player real: o layout nao pula quando o video entra.
    // O icone de play e o gradiente dao cara de "player aguardando video" em
    // vez de area vazia — intencional, nao defeito.
    return (
      <div
        className={`${CAIXA_9_16} flex flex-col items-center justify-center gap-4 border border-white/10 bg-gradient-to-b from-black/40 to-black/20 px-6 text-center`}
      >
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/20">
          <Play className="ml-1 h-7 w-7 fill-white/90 text-white/90" aria-hidden="true" />
        </span>
        <p className="max-w-[220px] font-editorial text-[15px] lowercase leading-6 text-mt-off-white/70">
          Seu vídeo com a análise completa aparece aqui em instantes.
        </p>
      </div>
    )
  }

  if (vsl.provider === 'vturb') {
    return <VturbPlayer vsl={vsl} onPlay={registrarPlay} onLiberarCta={onLiberarCta} />
  }

  return <Html5Player vsl={vsl} onPlay={registrarPlay} onLiberarCta={onLiberarCta} />
}

/**
 * Pre-carrega os scripts da VTurb (a "Otimizacao de Carregamento" do embed).
 *
 * Montado na tela do diagnostico, nao no layout do quiz: a VSL so aparece no
 * fim, e baixar ~900 kB de player no primeiro acesso disputaria banda com as
 * perguntas de quem ainda pode desistir na primeira. Enquanto a pessoa le o
 * diagnostico, o player ja vem chegando.
 */
export function PreloadVsl({ vsl }: { vsl: ConfigVsl }) {
  if (!vslTemVideo(vsl) || vsl.provider !== 'vturb') return null
  return (
    <>
      <link rel="dns-prefetch" href="https://cdn.converteai.net" />
      <link rel="dns-prefetch" href="https://images.converteai.net" />
      <link rel="dns-prefetch" href="https://api.vturb.com.br" />
      <link rel="preload" href={urlScriptVturb(vsl)} as="script" />
      <link rel="preload" href={URL_BIBLIOTECA_VTURB} as="script" />
    </>
  )
}

/**
 * Fronteira assistida -> liberacao do CTA. Devolve a funcao que recebe cada
 * segundo informado pelo player. Ver lib/quiz/progresso-vsl.ts.
 */
function useLiberacaoPorTempo(videoId: string, segundos: number, onLiberarCta?: () => void) {
  const aoLiberar = useRef(onLiberarCta)
  aoLiberar.current = onLiberarCta
  const estado = useRef({ fronteira: 0, liberado: false })

  const liberarSeAlcancou = useCallback(() => {
    const atual = estado.current
    if (atual.liberado || atual.fronteira < segundos) return
    atual.liberado = true
    aoLiberar.current?.()
  }, [segundos])

  // Quem ja tinha passado da oferta e voltou (recarregou, fechou a aba) ve o
  // botao direto: ja viu a oferta, e obriga-lo a dar play de novo so para
  // poder comprar seria atrito sem motivo. E o mesmo que o `persist` da VTurb.
  useEffect(() => {
    estado.current = { fronteira: lerProgressoVsl(videoId), liberado: false }
    liberarSeAlcancou()
  }, [videoId, liberarSeAlcancou])

  return useCallback(
    (tempo: number) => {
      const atual = estado.current
      const nova = avancarFronteira(atual.fronteira, tempo)
      if (nova === atual.fronteira) return
      atual.fronteira = nova
      gravarProgressoVsl(videoId, nova)
      liberarSeAlcancou()
    },
    [videoId, liberarSeAlcancou]
  )
}

/**
 * VTurb (player v4, web component <vturb-smartplayer>).
 *
 * O tempo vem dos eventos que o proprio elemento emite — o mesmo caminho do
 * `onTime`/`displayHiddenElements` da VTurb, que escutam `video:timeupdate`:
 *
 * - `video:timeupdate` ({ time } em segundos inteiros) so e emitido em
 *   reproducao real. O autoplay mudo emite outro evento,
 *   `smartautoplay:timeupdate`, que aqui NAO e escutado: o video mudo atras do
 *   "clique para ouvir" e chamariz, nao exibicao da oferta, e ao clicar a VTurb
 *   recomeca do zero.
 * - `video:play` tambem so sai em reproducao real — e o vsl_play.
 *
 * Nao usamos `displayHiddenElements` direto porque ele compara a posicao: um
 * clique em "avancar" ate depois da oferta liberaria o botao.
 */
function VturbPlayer({ vsl, onPlay, onLiberarCta }: Props) {
  const caixa = useRef<HTMLDivElement>(null)
  const aoDarPlay = useRef(onPlay)
  aoDarPlay.current = onPlay
  const registrarTempo = useLiberacaoPorTempo(vsl.videoId, vsl.ctaAtSeconds, onLiberarCta)

  useEffect(() => {
    const player = caixa.current?.querySelector('vturb-smartplayer')
    if (!player) return

    const aoAtualizar = (evento: Event) => {
      const tempo = (evento as CustomEvent<{ time?: unknown }>).detail?.time
      if (typeof tempo === 'number') registrarTempo(tempo)
    }
    const aoTocar = () => aoDarPlay.current?.()

    player.addEventListener('video:timeupdate', aoAtualizar)
    player.addEventListener('video:play', aoTocar)
    return () => {
      player.removeEventListener('video:timeupdate', aoAtualizar)
      player.removeEventListener('video:play', aoTocar)
    }
  }, [registrarTempo])

  return (
    <div ref={caixa} className={`${CAIXA_9_16} bg-black`}>
      {/* Tag do embed da VTurb. Via innerHTML para o React nunca reconciliar
          o custom element, que a VTurb preenche por conta propria. */}
      <div
        className="absolute inset-0"
        dangerouslySetInnerHTML={{
          __html: `<vturb-smartplayer id="vid-${vsl.videoId}" style="display: block; margin: 0 auto; width: 100%;"></vturb-smartplayer>`,
        }}
      />
      <Script id={`vturb-${vsl.videoId}`} strategy="afterInteractive" src={urlScriptVturb(vsl)} />
    </div>
  )
}

/** Fallback com <video> nativo: usado em teste local e se a VTurb sair. */
function Html5Player({ vsl, onPlay, onLiberarCta }: Props) {
  const ref = useRef<HTMLVideoElement>(null)
  const registrarTempo = useLiberacaoPorTempo(vsl.videoId, vsl.ctaAtSeconds, onLiberarCta)

  return (
    <video
      ref={ref}
      src={vsl.videoId}
      controls
      playsInline
      className={`${CAIXA_9_16} bg-black`}
      onPlay={onPlay}
      onTimeUpdate={() => registrarTempo(Math.floor(ref.current?.currentTime ?? 0))}
    />
  )
}
