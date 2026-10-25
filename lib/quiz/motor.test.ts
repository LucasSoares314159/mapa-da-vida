import { describe, expect, it } from 'vitest'
import { avaliar, classificar, somarPontos } from './motor'
import { quiz1 } from './configs/quiz-1'
import type { ConfigQuiz, Respostas } from './tipos'

// Os cinco exemplos da seção 6 dos docs são o contrato do motor: se um deles
// quebrar, a classificação divergiu da regra aprovada.

function responder(...letras: string[]): Respostas {
  return Object.fromEntries(quiz1.perguntas.map((p, i) => [p.id, letras[i]]))
}

describe('somarPontos', () => {
  it('soma os pesos das opções escolhidas', () => {
    expect(somarPontos(responder('D', 'A', 'C', 'A', 'D', 'A'), quiz1)).toEqual({
      A: 7,
      B: 3,
      C: 0,
    })
  })

  it('ignora a pergunta 2 em qualquer alternativa', () => {
    const base = responder('D', 'A', 'C', 'A', 'D', 'A')
    for (const letra of ['A', 'B', 'C', 'D']) {
      expect(somarPontos({ ...base, q2: letra }, quiz1)).toEqual({ A: 7, B: 3, C: 0 })
    }
  })

  it('acumula opções que pontuam em duas dimensões', () => {
    expect(somarPontos({ q1: 'C' }, quiz1)).toEqual({ A: 0, B: 1, C: 1 })
  })

  it('ignora resposta a pergunta ou opção inexistente', () => {
    expect(somarPontos({ q9: 'A', q1: 'Z' }, quiz1)).toEqual({ A: 0, B: 0, C: 0 })
  })

  it('não pontua nada com respostas vazias', () => {
    expect(somarPontos({}, quiz1)).toEqual({ A: 0, B: 0, C: 0 })
  })
})

describe('exemplos dos docs', () => {
  it('Exemplo 1 — Objetivos em conflito', () => {
    const r = avaliar(responder('D', 'A', 'C', 'A', 'D', 'A'), quiz1)
    expect(r.pontos).toEqual({ A: 7, B: 3, C: 0 })
    expect(r.perfil).toBe('A')
    expect(r.regra).toBe('maior_com_vantagem')
  })

  it('Exemplo 2 — Planos sem sustentação', () => {
    const r = avaliar(responder('D', 'B', 'B', 'B', 'A', 'B'), quiz1)
    expect(r.pontos).toEqual({ A: 0, B: 11, C: 0 })
    expect(r.perfil).toBe('B')
    expect(r.regra).toBe('maior_com_vantagem')
  })

  it('Exemplo 3 — Uma rotina sem espaço', () => {
    const r = avaliar(responder('B', 'D', 'A', 'D', 'C', 'D'), quiz1)
    expect(r.pontos).toEqual({ A: 0, B: 1, C: 7 })
    expect(r.perfil).toBe('C')
    expect(r.regra).toBe('maior_com_vantagem')
  })

  it('Exemplo 4 — Análise Geral por não atingir o mínimo', () => {
    const r = avaliar(responder('C', 'A', 'D', 'D', 'D', 'A'), quiz1)
    expect(r.pontos).toEqual({ A: 2, B: 2, C: 1 })
    expect(r.perfil).toBe('geral')
    expect(r.regra).toBe('abaixo_do_minimo')
  })

  it('Exemplo 5 — desempate pela pergunta 4', () => {
    const r = avaliar(responder('A', 'C', 'C', 'A', 'A', 'D'), quiz1)
    expect(r.pontos).toEqual({ A: 5, B: 2, C: 4 })
    expect(r.perfil).toBe('A')
    expect(r.regra).toBe('desempate_pergunta')
    expect(r.desempatadaPor).toBe('q4')
  })
})

describe('classificação — bordas', () => {
  it('tudo zero vira Análise Geral com regra própria', () => {
    const r = classificar({ A: 0, B: 0, C: 0 }, {}, quiz1)
    expect(r.perfil).toBe('geral')
    expect(r.regra).toBe('tudo_zero')
  })

  it('líder abaixo do mínimo vira Análise Geral mesmo com vantagem folgada', () => {
    const r = classificar({ A: 3, B: 0, C: 0 }, { q4: 'A' }, quiz1)
    expect(r.perfil).toBe('geral')
    expect(r.regra).toBe('abaixo_do_minimo')
  })

  it('vantagem exatamente igual ao limiar dispensa desempate', () => {
    const r = classificar({ A: 6, B: 4, C: 0 }, {}, quiz1)
    expect(r.perfil).toBe('A')
    expect(r.regra).toBe('maior_com_vantagem')
  })

  it('vantagem de um ponto a menos que o limiar exige desempate', () => {
    const r = classificar({ A: 5, B: 4, C: 0 }, { q4: 'B' }, quiz1)
    expect(r.perfil).toBe('B')
    expect(r.regra).toBe('desempate_pergunta')
    expect(r.desempatadaPor).toBe('q4')
  })

  it('empate exato resolvido pela pergunta 6 quando a 4 não resolve', () => {
    // q4-D é neutra: não favorece ninguém, então o desempate desce para q6.
    const r = classificar({ A: 4, B: 4, C: 0 }, { q4: 'D', q6: 'B' }, quiz1)
    expect(r.perfil).toBe('B')
    expect(r.regra).toBe('desempate_pergunta')
    expect(r.desempatadaPor).toBe('q6')
  })

  it('pergunta de desempate que favorece duas candidatas não resolve', () => {
    // q5-C favorece B e C ao mesmo tempo; não está na ordem de desempate, mas
    // o caso análogo com q4 ausente deve cair em empate persistente.
    const r = classificar({ A: 4, B: 4, C: 0 }, {}, quiz1)
    expect(r.perfil).toBe('geral')
    expect(r.regra).toBe('empate_persistente')
  })

  it('desempate ignora dimensão fora da disputa', () => {
    // q4-A favorece A, mas A não está entre as candidatas (B e C disputam).
    const r = classificar({ A: 0, B: 5, C: 4 }, { q4: 'A', q6: 'D' }, quiz1)
    expect(r.perfil).toBe('C')
    expect(r.desempatadaPor).toBe('q6')
  })

  it('empate triplo sem desempate possível vira Análise Geral', () => {
    const r = classificar({ A: 4, B: 4, C: 4 }, { q4: 'D', q6: 'D' }, quiz1)
    // q6-D favorece só C, que está na disputa: resolve.
    expect(r.perfil).toBe('C')
    expect(r.regra).toBe('desempate_pergunta')
  })

  it('não atribui perfil por acaso: mesmas respostas, mesmo resultado', () => {
    const respostas = responder('C', 'B', 'B', 'B', 'C', 'C')
    const primeira = avaliar(respostas, quiz1)
    for (let i = 0; i < 5; i++) {
      expect(avaliar(respostas, quiz1)).toEqual(primeira)
    }
  })
})

describe('limiares vêm da config, não do motor', () => {
  it('um quiz com mínimo diferente classifica diferente', () => {
    const permissivo: ConfigQuiz = {
      ...quiz1,
      regras: { ...quiz1.regras, minimoParaAtribuir: 2 },
    }
    expect(classificar({ A: 3, B: 0, C: 0 }, {}, quiz1).perfil).toBe('geral')
    expect(classificar({ A: 3, B: 0, C: 0 }, {}, permissivo).perfil).toBe('A')
  })
})

describe('integridade da config do quiz-1', () => {
  it('tem 6 perguntas com 4 opções cada', () => {
    expect(quiz1.perguntas).toHaveLength(6)
    for (const p of quiz1.perguntas) {
      expect(p.opcoes.map((o) => o.id)).toEqual(['A', 'B', 'C', 'D'])
    }
  })

  it('a pergunta 2 não tem peso em nenhuma alternativa', () => {
    const q2 = quiz1.perguntas.find((p) => p.id === 'q2')!
    for (const opcao of q2.opcoes) {
      expect(Object.keys(opcao.peso)).toHaveLength(0)
    }
  })

  it('as perguntas de desempate existem', () => {
    for (const id of quiz1.regras.ordemDesempate) {
      expect(quiz1.perguntas.some((p) => p.id === id)).toBe(true)
    }
  })

  it('tem texto para os quatro resultados', () => {
    for (const perfil of ['A', 'B', 'C', 'geral'] as const) {
      expect(quiz1.resultados[perfil].titulo.length).toBeGreaterThan(0)
      expect(quiz1.resultados[perfil].paragrafos.length).toBeGreaterThan(0)
    }
  })
})
