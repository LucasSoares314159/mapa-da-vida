// Saida de QA: com ?qa=1 na URL, nenhum evento de rastreio sai do navegador.
//
// Serve para navegar pelo quiz em producao sem sujar o Pixel nem o GA4. O
// parametro nao e persistido: vale enquanto estiver na URL, inclusive no reload.

/** `search` no formato de window.location.search ("?qa=1&x=2"). */
export function ehModoQa(search: string): boolean {
  return new URLSearchParams(search).get('qa') === '1'
}

export function modoQa(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return ehModoQa(window.location.search)
  } catch {
    return false
  }
}
