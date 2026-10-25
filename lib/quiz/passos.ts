import type { ConfigQuiz, Interstituicao, Pergunta } from './tipos'

// Achata a config na sequencia de telas. Funcoes puras — os componentes so
// renderizam o passo que recebem. Mesmo padrao de lib/onboarding.ts.

export type Passo =
  | { tipo: 'abertura'; tela: Interstituicao }
  | { tipo: 'pergunta'; pergunta: Pergunta; indice: number }
  | { tipo: 'interstituicao'; tela: Interstituicao }
  | { tipo: 'processando' }
  | { tipo: 'resultado' }

/**
 * Monta o fluxo: abertura → perguntas, com as telas de copy intercaladas onde
 * a config manda → processando → resultado.
 */
export function montarPassos(config: ConfigQuiz): Passo[] {
  const passos: Passo[] = [{ tipo: 'abertura', tela: config.abertura }]

  config.perguntas.forEach((pergunta, indice) => {
    passos.push({ tipo: 'pergunta', pergunta, indice })

    for (const { depoisDaPergunta, tela } of config.interstituicoes) {
      if (depoisDaPergunta === pergunta.id) {
        passos.push({ tipo: 'interstituicao', tela })
      }
    }
  })

  passos.push({ tipo: 'processando' }, { tipo: 'resultado' })
  return passos
}

/**
 * Fracao de progresso da barra, de 0 a 1.
 *
 * Mede a posicao no fluxo, nao as respostas preenchidas: restaurar um rascunho
 * faria a barra nascer cheia, e voltar uma pergunta nao a faria recuar. Mesma
 * licao do Mapa conversacional.
 *
 * O denominador conta apenas as perguntas — as telas de copy nao sao etapas
 * que a pessoa "cumpre", e inclui-las faria a barra andar sem ela responder
 * nada.
 */
export function progressoDoPasso(passos: Passo[], indiceAtual: number, total: number): number {
  const passo = passos[indiceAtual]
  if (!passo) return 0
  if (passo.tipo === 'abertura') return 0
  if (passo.tipo === 'processando' || passo.tipo === 'resultado') return 1

  // Quantas perguntas ja foram deixadas para tras, incluindo a atual.
  const perguntasAteAqui = passos
    .slice(0, indiceAtual + 1)
    .filter((p) => p.tipo === 'pergunta').length

  return Math.min(perguntasAteAqui / total, 1)
}

/** Rotulo "Pergunta 3 de 6". Vazio nas telas que nao sao pergunta. */
export function rotuloEtapa(passo: Passo | undefined, total: number): string {
  if (!passo || passo.tipo !== 'pergunta') return ''
  return `Pergunta ${passo.indice + 1} de ${total}`
}
