import { describe, expect, it } from 'vitest'
import {
  calendario,
  constancia,
  diaDaSemana,
  diaDeHoje,
  diasCompletos,
  existiaNoDia,
  inicioDaSemana,
  placarDoHabito,
  podeCriarHabito,
  progressoSemanal,
  repeticoesTotais,
  somarDias,
} from './habitos'
import type { Habito, RegistroHabito } from '@/types'

// Quinta-feira, 12/11/2026. A semana corrente começa na segunda, 09/11.
const HOJE = '2026-11-12'

function habito(parcial: Partial<Habito> & { id: string }): Habito {
  return {
    user_id: 'u1',
    nome: 'Caminhar',
    icone: 'caminhar',
    area: 'Exercícios Físicos',
    meta_semanal: 3,
    criado_em: '2026-09-01T12:00:00Z',
    arquivado_em: null,
    ...parcial,
  }
}

function feitos(habitoId: string, ...dias: string[]): RegistroHabito[] {
  return dias.map((dia) => ({ habito_id: habitoId, user_id: 'u1', dia, status: 'feito', criado_em: `${dia}T12:00:00Z` }))
}

// Os dias de uma semana a partir da segunda dada.
function semana(segunda: string, ...indices: number[]): string[] {
  return indices.map((i) => somarDias(segunda, i))
}

describe('datas em Brasília', () => {
  it('22h de Brasília ainda é o mesmo dia, embora já seja o seguinte em UTC', () => {
    // 22h BRT de 12/11 = 01h UTC de 13/11
    expect(diaDeHoje(new Date('2026-11-13T01:00:00Z'))).toBe('2026-11-12')
  })

  it('meia-noite de Brasília já é o dia seguinte', () => {
    expect(diaDeHoje(new Date('2026-11-13T03:00:00Z'))).toBe('2026-11-13')
  })

  it('a semana começa na segunda', () => {
    expect(diaDaSemana('2026-11-09')).toBe(0)
    expect(diaDaSemana('2026-11-15')).toBe(6)
    expect(inicioDaSemana(HOJE)).toBe('2026-11-09')
    expect(inicioDaSemana('2026-11-15')).toBe('2026-11-09')
    expect(inicioDaSemana('2026-11-09')).toBe('2026-11-09')
  })

  it('soma dias atravessando o mês', () => {
    expect(somarDias('2026-10-30', 3)).toBe('2026-11-02')
    expect(somarDias('2026-11-02', -3)).toBe('2026-10-30')
  })
})

describe('progressoSemanal', () => {
  it('conta só de segunda até hoje e marca a meta cumprida', () => {
    const h = habito({ id: 'h1', meta_semanal: 2 })
    const regs = feitos('h1', '2026-11-08', '2026-11-09', HOJE)
    expect(progressoSemanal(h, regs, HOJE)).toEqual({ feitos: 2, meta: 2, cumprida: true, feitoHoje: true })
  })

  it('meta 7 só se cumpre com todos os dias', () => {
    const h = habito({ id: 'h1', meta_semanal: 7 })
    const regs = feitos('h1', ...semana('2026-11-09', 0, 1, 2, 3))
    expect(progressoSemanal(h, regs, HOJE).cumprida).toBe(false)
  })

  it('pulado não conta como feito', () => {
    const h = habito({ id: 'h1' })
    const regs: RegistroHabito[] = [{ habito_id: 'h1', user_id: 'u1', dia: HOJE, status: 'pulado', criado_em: '' }]
    expect(progressoSemanal(h, regs, HOJE)).toMatchObject({ feitos: 0, feitoHoje: false })
  })
})

describe('constância', () => {
  it('soma min(feitos, meta): passar da meta numa semana não compensa outra', () => {
    const h = habito({ id: 'h1', meta_semanal: 2 })
    // 4 semanas completas antes da atual: 12/10, 19/10, 26/10, 02/11
    const regs = [
      ...feitos('h1', ...semana('2026-10-12', 0, 1, 2, 3, 4)), // 5 → conta 2
      ...feitos('h1', ...semana('2026-10-19', 0, 1)), // 2
      ...feitos('h1', ...semana('2026-10-26', 0)), // 1
      // 02/11: nada → 0
    ]
    expect(placarDoHabito(h, regs, HOJE)).toEqual({ cumpridas: 5, possiveis: 8 })
    expect(constancia([h], regs, HOJE).atual).toBe(63)
  })

  it('a semana corrente fica de fora', () => {
    const h = habito({ id: 'h1', meta_semanal: 1 })
    const regs = feitos('h1', '2026-11-09', '2026-11-10')
    expect(placarDoHabito(h, regs, HOJE)).toEqual({ cumpridas: 0, possiveis: 4 })
  })

  it('hábito criado no meio de uma semana só conta a partir da semana seguinte', () => {
    // Criado na quarta 28/10: a semana de 26/10 fica de fora; entra só a de 02/11.
    const h = habito({ id: 'h1', meta_semanal: 1, criado_em: '2026-10-28T15:00:00Z' })
    const regs = feitos('h1', '2026-10-28', '2026-11-03')
    expect(placarDoHabito(h, regs, HOJE)).toEqual({ cumpridas: 1, possiveis: 1 })
  })

  it('hábito criado nesta semana não derruba a constância de quem já tinha outros', () => {
    const antigo = habito({ id: 'h1', meta_semanal: 1 })
    const novo = habito({ id: 'h2', meta_semanal: 7, criado_em: '2026-11-10T12:00:00Z' })
    const regs = feitos('h1', '2026-10-12', '2026-10-19', '2026-10-26', '2026-11-02')
    expect(constancia([antigo], regs, HOJE).atual).toBe(100)
    expect(constancia([antigo, novo], regs, HOJE).atual).toBe(100)
  })

  it('sem nenhuma semana completa, a constância é nula e não 0%', () => {
    const h = habito({ id: 'h1', criado_em: '2026-11-10T12:00:00Z' })
    expect(constancia([h], [], HOJE)).toEqual({ atual: null, anterior: null, variacao: null })
    expect(placarDoHabito(h, [], HOJE)).toEqual({ cumpridas: 0, possiveis: 0 })
  })

  it('compara com as 4 semanas anteriores em pontos', () => {
    const h = habito({ id: 'h1', meta_semanal: 1 })
    const anteriores = feitos('h1', '2026-09-14', '2026-09-21') // 2 de 4 → 50%
    const recentes = feitos('h1', '2026-10-12', '2026-10-19', '2026-10-26') // 3 de 4 → 75%
    expect(constancia([h], [...anteriores, ...recentes], HOJE)).toEqual({ atual: 75, anterior: 50, variacao: 25 })
  })

  it('semana que termina depois do arquivamento sai da conta', () => {
    const h = habito({ id: 'h1', meta_semanal: 1, arquivado_em: '2026-10-29T12:00:00Z' })
    const regs = feitos('h1', '2026-10-12', '2026-10-19')
    // Entram 12/10 e 19/10; 26/10 (arquivado na quinta) e 02/11 ficam de fora.
    expect(placarDoHabito(h, regs, HOJE)).toEqual({ cumpridas: 2, possiveis: 2 })
  })
})

describe('calendário e dias completos', () => {
  it('cada dia conta só os hábitos que já existiam nele', () => {
    const antigo = habito({ id: 'h1' })
    const novo = habito({ id: 'h2', criado_em: '2026-11-11T12:00:00Z' }) // quarta
    const regs = [...feitos('h1', '2026-11-09', '2026-11-10', '2026-11-11', HOJE), ...feitos('h2', HOJE)]
    const cal = calendario([antigo, novo], regs, HOJE)
    const atual = cal[cal.length - 1]

    expect(atual[0]).toMatchObject({ dia: '2026-11-09', existentes: 1, completo: true }) // segunda
    expect(atual[2]).toMatchObject({ dia: '2026-11-11', existentes: 2, feitos: 1, completo: false }) // quarta
    expect(atual[3]).toMatchObject({ dia: HOJE, hoje: true, existentes: 2, feitos: 2, nivel: 3, completo: true })
    expect(atual[4]).toMatchObject({ futuro: true, completo: false })
    expect(diasCompletos(cal)).toBe(3)
  })

  it('tem 5 semanas, de segunda a domingo, terminando na atual', () => {
    const cal = calendario([habito({ id: 'h1' })], [], HOJE)
    expect(cal).toHaveLength(5)
    expect(cal[0][0].dia).toBe('2026-10-12')
    expect(cal[4][6].dia).toBe('2026-11-15')
  })

  it('dia sem hábito existente nunca é completo', () => {
    const h = habito({ id: 'h1', criado_em: '2026-11-11T12:00:00Z' })
    const cal = calendario([h], [], HOJE)
    expect(cal[0].every((d) => d.existentes === 0 && !d.completo)).toBe(true)
  })

  it('hábito arquivado deixa de existir a partir do dia do arquivamento', () => {
    const h = habito({ id: 'h1', arquivado_em: '2026-11-10T15:00:00Z' })
    expect(existiaNoDia(h, '2026-11-09')).toBe(true)
    expect(existiaNoDia(h, '2026-11-10')).toBe(false)
  })
})

describe('regras simples', () => {
  it('repetições só contam feitos', () => {
    const regs: RegistroHabito[] = [
      ...feitos('h1', '2026-11-09', '2026-11-10'),
      { habito_id: 'h1', user_id: 'u1', dia: '2026-11-11', status: 'pulado', criado_em: '' },
    ]
    expect(repeticoesTotais(regs)).toBe(2)
  })

  it('o teto é de 5 hábitos ativos', () => {
    expect(podeCriarHabito(4)).toBe(true)
    expect(podeCriarHabito(5)).toBe(false)
  })
})
