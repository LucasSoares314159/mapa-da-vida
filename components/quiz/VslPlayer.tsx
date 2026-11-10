'use client'

import { useCallback, useEffect, useLayoutEffect, useRef } from 'react'
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
  /**
   * O player nao carregou (script com erro, bloqueador, rede) em
   * ESPERA_MAXIMA_PLAYER_MS. Quem chama libera o botao com um aviso.
   */
  onFalharCarga?: () => void
  /** O player chegou depois de onFalharCarga: o aviso pode sair. */
  onRecuperarCarga?: () => void
}

/**
 * Quanto esperar o player da VTurb antes de liberar o botao sem video.
 *
 * A trava da oferta e para quem esta assistindo, nao para quem ficou sem o
 * video: bloqueador de anuncio, rede ruim ou a VTurb fora do ar nao podem
 * impedir ninguem de comprar.
 */
export const ESPERA_MAXIMA_PLAYER_MS = 15_000

/**
 * Largura do player: a tela inteira no celular, ate 400px no desktop — e nunca
 * mais largo do que a altura da tela comporta.
 *
 * O 9:16 em largura total tem 640px de altura num celular de 360px, mais que os
 * ~600px que sobram dentro do navegador do Instagram ou do Facebook: a base do
 * video (legenda e controles da VTurb) ficava fora da tela. A largura passa a
 * ser limitada pela altura visivel (dvh) menos o que fica acima do player na
 * TelaVsl — a chamada e o respiro, ~10,5rem; ~6,5rem em tela baixa, onde eles
 * encolhem. Se mudar a chamada, conferir esses valores. Em navegador sem dvh o
 * limite e descartado e vale a largura total, o comportamento anterior.
 *
 * Quando o botao de compra aparece, a barra fixa dele cobre a faixa de baixo
 * do video, como antes: reservar esse espaco desde o inicio encolheria o video
 * para todo mundo pelos 4:42 inteiros.
 */
export const LARGURA_VSL =
  'w-full max-w-[min(400px,calc((100dvh-10.5rem)*9/16))] celular-baixo:max-w-[calc((100dvh-6.5rem)*9/16)]'

const CAIXA_9_16 = `relative mx-auto aspect-[9/16] ${LARGURA_VSL} overflow-hidden rounded-2xl`

/** Script do player na VTurb (embed "JavaScript" da aba Embed). */
export function urlScriptVturb(vsl: ConfigVsl): string {
  return `https://scripts.converteai.net/${vsl.contaId}/players/${vsl.videoId}/v4/player.js`
}

/** Biblioteca do web component, comum a todo player v4. */
export const URL_BIBLIOTECA_VTURB = 'https://scripts.converteai.net/lib/js/smartplayer-wc/v4/smartplayer.js'

/** Playlist do arquivo de video (id proprio, diferente do player). */
export function urlVideoVturb(vsl: ConfigVsl): string | null {
  if (!vsl.arquivoVideoId) return null
  return `https://cdn.converteai.net/${vsl.contaId}/${vsl.arquivoVideoId}/main.m3u8`
}

/**
 * Tag do bloco 1 do embed, exatamente como a VTurb entrega — inclusive o
 * placeholder 9:16 preto, que reserva a altura do video antes de o script
 * chegar e evita o layout pular.
 */
function tagEmbedVturb(vsl: ConfigVsl): string {
  return (
    `<vturb-smartplayer id="vid-${vsl.videoId}" style="display: block; margin: 0 auto; width: 100%; max-width: 400px;">` +
    `<div class="vturb-player-placeholder" style="position: relative; width: 100%; padding: 177.77777777777777% 0 0; z-index: 0; background-color: black;"></div>` +
    `</vturb-smartplayer>`
  )
}

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

export function VslPlayer({ vsl, onPlay, onLiberarCta, onFalharCarga, onRecuperarCarga }: Props) {
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
    return (
      <VturbPlayer
        vsl={vsl}
        onPlay={registrarPlay}
        onLiberarCta={onLiberarCta}
        onFalharCarga={onFalharCarga}
        onRecuperarCarga={onRecuperarCarga}
      />
    )
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
  const video = urlVideoVturb(vsl)
  // Bloco 2 do embed, na ordem e com os valores da VTurb. O _plt (marca de
  // tempo que o player usa para medir o proprio carregamento) vai por
  // next/script: um <script> inline renderizado pelo React no cliente nao
  // executa.
  return (
    <>
      <Script id="vturb-plt" strategy="afterInteractive">
        {`!function(i,n){i._plt=i._plt||(n&&n.timeOrigin?n.timeOrigin+n.now():Date.now())}(window,performance);`}
      </Script>
      <link rel="preload" href={urlScriptVturb(vsl)} as="script" />
      <link rel="preload" href={URL_BIBLIOTECA_VTURB} as="script" />
      {video && <link rel="preload" href={video} as="fetch" />}
      <link rel="dns-prefetch" href="https://cdn.converteai.net" />
      <link rel="dns-prefetch" href="https://scripts.converteai.net" />
      <link rel="dns-prefetch" href="https://images.converteai.net" />
      <link rel="dns-prefetch" href="https://license.vturb.com" />
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
function VturbPlayer({ vsl, onPlay, onLiberarCta, onFalharCarga, onRecuperarCarga }: Props) {
  const caixa = useRef<HTMLDivElement>(null)
  const aoDarPlay = useRef(onPlay)
  aoDarPlay.current = onPlay
  const registrarTempo = useLiberacaoPorTempo(vsl.videoId, vsl.ctaAtSeconds, onLiberarCta)
  const { falhar, sinalDeVida } = useVigiaCarga(onFalharCarga, onRecuperarCarga)

  const tag = tagEmbedVturb(vsl)

  // A tag do embed e criada aqui, uma vez, e nao pelo JSX. Com
  // dangerouslySetInnerHTML o React reaplica o innerHTML quando a tela
  // re-renderiza — e ela re-renderiza justamente quando o botao e liberado (ou o
  // fallback dispara): o <vturb-smartplayer> era trocado por um novo, o video
  // voltava a 0:00 pausado e os listeners ficavam presos no elemento antigo.
  // O div hospedeiro vem vazio do JSX, entao o React nunca mexe no conteudo.
  // Layout effect: o placeholder 9:16 entra antes da primeira pintura.
  useLayoutEffect(() => {
    const hospedeiro = caixa.current
    if (hospedeiro && !hospedeiro.querySelector('vturb-smartplayer')) hospedeiro.innerHTML = tag
  }, [tag])

  useEffect(() => {
    const player = caixa.current?.querySelector('vturb-smartplayer')
    if (!player) return

    const aoAtualizar = (evento: Event) => {
      sinalDeVida()
      const tempo = (evento as CustomEvent<{ time?: unknown }>).detail?.time
      if (typeof tempo === 'number') registrarTempo(tempo)
    }
    const aoTocar = () => {
      sinalDeVida()
      aoDarPlay.current?.()
    }
    // player:ready e o sinal oficial de que o player montou; o autoplay mudo
    // conta como vida tambem (o video esta la, so sem som).
    const eventosDeVida = ['player:ready', 'smartautoplay:timeupdate']

    player.addEventListener('video:timeupdate', aoAtualizar)
    player.addEventListener('video:play', aoTocar)
    eventosDeVida.forEach((e) => player.addEventListener(e, sinalDeVida))
    return () => {
      player.removeEventListener('video:timeupdate', aoAtualizar)
      player.removeEventListener('video:play', aoTocar)
      eventosDeVida.forEach((e) => player.removeEventListener(e, sinalDeVida))
    }
  }, [registrarTempo, sinalDeVida])

  return (
    // Sem aspect-ratio proprio: o placeholder do embed ja reserva o 9:16.
    <div className={`relative mx-auto ${LARGURA_VSL} overflow-hidden rounded-2xl bg-black`}>
      {/* Bloco 1 do embed, criado no layout effect acima. Vazio no JSX de
          proposito: o React nao reconcilia o que nao renderizou. */}
      <div ref={caixa} />
      {/* O script inline do embed (createElement + async + appendChild)
          adaptado: next/script carrega uma vez por documento e guarda o src
          carregado, entao re-render, remontagem da tela ou navegacao
          client-side nao reinjeta o player — nem registra o custom element
          de novo. Erro no script (bloqueador, DNS) falha na hora, sem esperar
          os 15s. */}
      <Script
        id={`vturb-${vsl.videoId}`}
        strategy="afterInteractive"
        src={urlScriptVturb(vsl)}
        onError={falhar}
      />
    </div>
  )
}

/**
 * Vigia se o player chegou. Sem sinal de vida em ESPERA_MAXIMA_PLAYER_MS (ou
 * com erro no script), avisa uma vez. Se o player aparecer depois, avisa a
 * recuperacao — o botao ja liberado continua, so o aviso sai.
 */
function useVigiaCarga(onFalhar?: () => void, onRecuperar?: () => void) {
  const aoFalhar = useRef(onFalhar)
  aoFalhar.current = onFalhar
  const aoRecuperar = useRef(onRecuperar)
  aoRecuperar.current = onRecuperar
  const estado = useRef<'aguardando' | 'carregado' | 'falhou'>('aguardando')
  const relogio = useRef<ReturnType<typeof setTimeout>>()

  const falhar = useCallback(() => {
    if (estado.current !== 'aguardando') return
    estado.current = 'falhou'
    clearTimeout(relogio.current)
    aoFalhar.current?.()
  }, [])

  const sinalDeVida = useCallback(() => {
    if (estado.current === 'carregado') return
    const falhouAntes = estado.current === 'falhou'
    estado.current = 'carregado'
    clearTimeout(relogio.current)
    if (falhouAntes) aoRecuperar.current?.()
  }, [])

  useEffect(() => {
    relogio.current = setTimeout(falhar, ESPERA_MAXIMA_PLAYER_MS)
    return () => clearTimeout(relogio.current)
  }, [falhar])

  return { falhar, sinalDeVida }
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
