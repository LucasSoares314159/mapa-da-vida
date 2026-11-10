/*
 * Pixel da Meta — inicializacao UNICA do site.
 *
 * Este arquivo e o unico lugar com o id do Pixel e o unico que chama
 * fbq('init'). E JavaScript puro em /public porque precisa ser carregado por
 * dois mundos que nao compartilham bundle: a pagina de vendas estatica
 * (public/trilha/index.html) e as rotas Next.js do funil de quiz e da compra
 * (components/MetaPixel.tsx). Duplicar o snippet em cada um ja levou a dois
 * Pixels diferentes no mesmo site.
 *
 * Expoe em window:
 *   trackMeta(evento, params, opcoes)     -> evento padrao (track)
 *   trackMetaCustom(evento, params, opcoes) -> evento customizado (trackCustom)
 *   pageViewMeta()                        -> PageView, no maximo 1 por rota
 *   trackMetaAntesDeSair(evento, params, continuar) -> dispara e so depois navega
 *
 * Todos verificam se window.fbq existe: com o fbevents.js bloqueado por
 * adblock, a pagina segue funcionando e os eventos sao descartados.
 */
;(function (w, d) {
  'use strict'

  // Carregado duas vezes no mesmo documento (ex.: navegacao client-side entre
  // layouts que montam o componente) — nao reinicializa.
  if (w.__mtPixel) return

  var PIXEL_ID = '2130218701193734'

  /* eslint-disable */
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(w, d,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  /* eslint-enable */

  w.fbq('init', PIXEL_ID)

  function chamar(metodo, evento, params, opcoes) {
    if (typeof w.fbq !== 'function') return false
    try {
      if (opcoes) w.fbq(metodo, evento, params || {}, opcoes)
      else w.fbq(metodo, evento, params || {})
      return true
    } catch (e) {
      return false
    }
  }

  function trackMeta(evento, params, opcoes) {
    return chamar('track', evento, params, opcoes)
  }

  function trackMetaCustom(evento, params, opcoes) {
    return chamar('trackCustom', evento, params, opcoes)
  }

  // Em SPA o mesmo documento atravessa varias rotas; a chave e o pathname, para
  // que remontar o componente (StrictMode, layout) nao gere PageView repetido.
  var ultimoPageView = null
  function pageViewMeta() {
    var caminho = w.location.pathname
    if (caminho === ultimoPageView) return false
    ultimoPageView = caminho
    return trackMeta('PageView')
  }

  /**
   * Dispara o evento e so entao chama `continuar` (o redirect).
   *
   * Navegar no mesmo tick do fbq('track') pode cancelar a requisicao do Pixel.
   * Enquanto o fbevents.js nao terminou de carregar, o evento fica so na fila
   * do stub — por isso espera a biblioteca (callMethod existe so depois dela)
   * por ate 1,5s e da mais 300ms para a requisicao sair. Se o Pixel estiver
   * bloqueado, espera o teto inteiro (o stub do fbq existe mesmo assim, entao
   * callMethod nunca aparece). Sem uso na /trilha desde nov/2026.
   */
  function trackMetaAntesDeSair(evento, params, continuar) {
    var seguiu = false
    function seguir() {
      if (seguiu) return
      seguiu = true
      continuar()
    }

    if (!trackMeta(evento, params)) return seguir()

    var inicio = Date.now()
    ;(function aguardar() {
      var carregado = w.fbq && typeof w.fbq.callMethod === 'function'
      if (carregado) return setTimeout(seguir, 300)
      if (Date.now() - inicio > 1500) return seguir()
      setTimeout(aguardar, 50)
    })()
  }

  w.trackMeta = trackMeta
  w.trackMetaCustom = trackMetaCustom
  w.pageViewMeta = pageViewMeta
  w.trackMetaAntesDeSair = trackMetaAntesDeSair
  w.__mtPixel = { id: PIXEL_ID }
})(window, document)
