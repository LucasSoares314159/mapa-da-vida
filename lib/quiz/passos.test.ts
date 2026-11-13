import { describe, expect, it } from 'vitest'
import { quiz1 } from './configs/quiz-1'
import { montarPassos, progressoDoPasso, rotuloEtapa } from './passos'

describe('montarPassos', () => {
  const passos = montarPassos(quiz1)

  // A abertura voltou ao fluxo na revisao de copy v2: a landing e o primeiro
  // passo, e a pergunta 1 vem logo depois. O quiz_start nao sai nela — so na
  // primeira resposta (ver QuizConversa).
  it('comeca pela abertura, depois a pergunta 1', () => {
    expect(passos[0]).toMatchObject({ tipo: 'abertura' })
    expect(passos[1]).toMatchObject({ tipo: 'pergunta', indice: 0 })
    expect(rotuloEtapa(passos[1], quiz1.perguntas.length)).toBe('Pergunta 1 de 6')
  })

  // A abertura nao conta na barra; a pergunta 1 e a primeira etapa cumprida.
  it('a abertura nao avanca a barra, a pergunta 1 avanca', () => {
    expect(progressoDoPasso(passos, 0, quiz1.perguntas.length)).toBe(0)
    expect(progressoDoPasso(passos, 1, quiz1.perguntas.length)).toBeCloseTo(1 / 6)
  })

  it('um quiz sem abertura comeca direto na pergunta 1', () => {
    const { abertura, ...semAbertura } = quiz1
    void abertura
    const passosSemAbertura = montarPassos(semAbertura)
    expect(passosSemAbertura[0]).toMatchObject({ tipo: 'pergunta', indice: 0 })
  })

  it('termina em processando e resultado', () => {
    expect(passos.slice(-2).map((p) => p.tipo)).toEqual(['processando', 'resultado'])
  })

  it('mantem a ponte logo depois da pergunta 3', () => {
    const iPonte = passos.findIndex((p) => p.tipo === 'interstituicao')
    expect(passos[iPonte - 1]).toMatchObject({ tipo: 'pergunta', indice: 2 })
  })
})
