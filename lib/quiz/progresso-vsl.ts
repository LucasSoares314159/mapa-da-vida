// Quanto da VSL a pessoa de fato assistiu, para liberar o botao de compra.
//
// Nao basta comparar a posicao atual do video com o segundo da oferta: o player
// da VTurb tem botoes de avancar, e a posicao saltaria para depois da oferta sem
// a pessoa ter visto nada. Tambem nao serve um timer da pagina: ele corre com o
// video pausado e zera ao recarregar, enquanto o "continuar assistindo" da VTurb
// retoma o video de onde parou.
//
// O que se mede e a FRONTEIRA ASSISTIDA: o maior segundo alcancado por
// reproducao continua desde o inicio. Ela so avanca quando o novo tempo esta a
// poucos segundos dela — a cadencia normal de reproducao. Um salto maior e um
// avanco manual e nao conta; voltar no video tambem nao muda nada, e ao passar
// de novo pela fronteira a reproducao volta a empurra-la.
//
// A fronteira fica no localStorage, por video. E o mesmo armazenamento e a mesma
// cadencia (um registro por segundo) em que a VTurb guarda a posicao do
// "continuar assistindo": ao recarregar, o video volta para um ponto colado na
// fronteira e a contagem segue de onde parou.

/**
 * Maior salto entre dois `video:timeupdate` que ainda conta como reproducao.
 *
 * A VTurb emite o evento a cada segundo inteiro; com a velocidade acelerada
 * ("turbo") ou um tique atrasado pela aba em segundo plano, dois eventos podem
 * vir com 2s de diferenca. Os botoes de avancar do player pulam bem mais que 3s.
 */
export const SALTO_MAXIMO_SEGUNDOS = 3

/** Nova fronteira depois de o player informar o segundo atual. */
export function avancarFronteira(fronteira: number, tempo: number): number {
  if (!Number.isFinite(tempo) || tempo <= fronteira) return fronteira
  return tempo - fronteira <= SALTO_MAXIMO_SEGUNDOS ? tempo : fronteira
}

const PREFIXO_CHAVE = 'mt-vsl-assistido:'

export function chaveProgressoVsl(videoId: string): string {
  return `${PREFIXO_CHAVE}${videoId}`
}

/**
 * Fronteira gravada para este video. Sem armazenamento (aba privada, bloqueio)
 * devolve 0: a pessoa assiste de novo, e o botao nunca aparece antes da hora.
 */
export function lerProgressoVsl(videoId: string): number {
  try {
    const bruto = window.localStorage.getItem(chaveProgressoVsl(videoId))
    const valor = bruto === null ? 0 : Number(bruto)
    return Number.isFinite(valor) && valor > 0 ? valor : 0
  } catch {
    return 0
  }
}

export function gravarProgressoVsl(videoId: string, fronteira: number): void {
  try {
    window.localStorage.setItem(chaveProgressoVsl(videoId), String(fronteira))
  } catch {
    // Sem armazenamento o controle segue em memoria ate a pagina fechar.
  }
}
