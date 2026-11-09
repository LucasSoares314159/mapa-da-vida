import { describe, expect, it } from 'vitest'
import { resumoHabitos } from './metricas'

// Quinta, 12/11/2026. Semanas fechadas: 12/10, 19/10, 26/10 e 02/11.
const HOJE = '2026-11-12'

const h = (id: string, user_id: string, meta: number, extra: Partial<{ criado_em: string; arquivado_em: string | null }> = {}) => ({
  id,
  user_id,
  meta_semanal: meta,
  criado_em: '2026-09-01T12:00:00Z',
  arquivado_em: null,
  ...extra,
})
const r = (habito_id: string, user_id: string, dia: string) => ({ habito_id, user_id, dia, status: 'feito' as const })

describe('resumoHabitos', () => {
  it('conta adoção, ativos na semana e constância média sem sair do grupo', () => {
    const habitos = [
      h('a1', 'ana', 1),
      h('a2', 'ana', 1, { arquivado_em: '2026-10-01T12:00:00Z' }),
      h('b1', 'bia', 1, { criado_em: '2026-11-10T12:00:00Z' }), // sem semana fechada
      h('x1', 'interno', 1), // fora do grupo (conta interna)
    ]
    const registros = [
      // ana: 2 das 4 semanas fechadas e marcou nos últimos 7 dias
      r('a1', 'ana', '2026-10-12'),
      r('a1', 'ana', '2026-10-26'),
      r('a1', 'ana', '2026-11-11'),
      r('x1', 'interno', '2026-11-12'),
    ]
    const resumo = resumoHabitos(new Set(['ana', 'bia', 'cris']), habitos, registros, HOJE)
    expect(resumo).toEqual({
      lancamento: '2026-09-01',
      adotaram: 2,
      ativos7d: 1,
      mediaAtivos: 1, // ana tem 1 ativo, bia 1
      constanciaMedia: 50,
      comConstancia: 1,
    })
  })

  it('sem hábitos, tudo zerado e sem constância', () => {
    expect(resumoHabitos(new Set(['ana']), [], [], HOJE)).toEqual({
      lancamento: null,
      adotaram: 0,
      ativos7d: 0,
      mediaAtivos: 0,
      constanciaMedia: null,
      comConstancia: 0,
    })
  })
})
