// "A pagina esta de fato na frente de alguem?"
//
// O quiz_view e o denominador do funil. Uma carga em segundo plano — aba aberta
// atras de outra, pre-renderizacao do navegador, pre-carregamento do navegador
// de um app — executa o JavaScript sem ninguem ver a tela, e contaria como
// visita. No diagnostico de novembro/2026 o Pixel registrou mais quiz_view do
// que a Meta contou de visualizacoes da pagina de destino; disparar so com a
// pagina visivel tira essas cargas da conta.

declare global {
  interface Document {
    /** Chrome: true enquanto a pagina e pre-renderizada (Speculation Rules). */
    prerendering?: boolean
  }
}

function estaVisivel(): boolean {
  return document.visibilityState === 'visible' && !document.prerendering
}

/**
 * Chama `fn` uma vez, assim que a pagina estiver visivel — na hora, se ja
 * estiver. Devolve a limpeza dos listeners (para o retorno de um useEffect).
 */
export function aoFicarVisivel(fn: () => void): () => void {
  if (typeof document === 'undefined') return () => {}

  if (estaVisivel()) {
    fn()
    return () => {}
  }

  const verificar = () => {
    if (!estaVisivel()) return
    limpar()
    fn()
  }
  function limpar() {
    document.removeEventListener('visibilitychange', verificar)
    document.removeEventListener('prerenderingchange', verificar)
  }

  document.addEventListener('visibilitychange', verificar)
  document.addEventListener('prerenderingchange', verificar)
  return limpar
}
