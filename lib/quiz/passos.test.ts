import { describe, expect, it } from 'vitest'
import { quiz1 } from './configs/quiz-1'
import { montarPassos, progressoDoPasso, rotuloEtapa } from './passos'

describe('montarPassos', () => {
  const passos = montarPassos(quiz1)

  // A abertura saiu do fluxo em novembro/2026: quem chega do anuncio cai na
  // pergunta 1. Uma tela antes dela voltaria a pedir um toque sem entregar nada
  // — e deslocaria o indice dos rascunhos salvos (ver `versao`).
  it('comeca direto na pergunta 1', () => {
    expect(passos[0]).toMatchObject({ tipo: 'pergunta', indice: 0 })
    expect(rotuloEtapa(passos[0], quiz1.perguntas.length)).toBe('Pergunta 1 de 6')
  })

  it('a primeira tela ja conta como etapa na barra de progresso', () => {
    expect(progressoDoPasso(passos, 0, quiz1.perguntas.length)).toBeCloseTo(1 / 6)
  })

  it('termina em processando e resultado', () => {
    expect(passos.slice(-2).map((p) => p.tipo)).toEqual(['processando', 'resultado'])
  })

  it('mantem a ponte logo depois da pergunta 3', () => {
    const iPonte = passos.findIndex((p) => p.tipo === 'interstituicao')
    expect(passos[iPonte - 1]).toMatchObject({ tipo: 'pergunta', indice: 2 })
  })
})
