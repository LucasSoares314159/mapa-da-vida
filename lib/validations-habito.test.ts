import { describe, expect, it } from 'vitest'
import { habitoSchema } from './validations'

const valido = { nome: 'Caminhar 20 min', icone: 'caminhar', area: 'Exercícios Físicos', meta_semanal: 4 }

describe('habitoSchema', () => {
  it('apara o nome e aceita de 3 a 24 caracteres', () => {
    expect(habitoSchema.parse({ ...valido, nome: '  Ler  ' }).nome).toBe('Ler')
    expect(habitoSchema.safeParse({ ...valido, nome: 'ab' }).success).toBe(false)
    expect(habitoSchema.safeParse({ ...valido, nome: 'x'.repeat(25) }).success).toBe(false)
    expect(habitoSchema.safeParse({ ...valido, nome: 'x'.repeat(24) }).success).toBe(true)
  })

  it('âncora vazia ou só com espaços vira null', () => {
    expect(habitoSchema.parse(valido).ancora).toBeNull()
    expect(habitoSchema.parse({ ...valido, ancora: '   ' }).ancora).toBeNull()
    expect(habitoSchema.parse({ ...valido, ancora: ' almoçar ' }).ancora).toBe('almoçar')
  })

  it('recusa ícone e área fora do catálogo', () => {
    expect(habitoSchema.safeParse({ ...valido, icone: 'foguete' }).success).toBe(false)
    expect(habitoSchema.safeParse({ ...valido, area: 'Lazer' }).success).toBe(false)
    expect(habitoSchema.safeParse({ ...valido, icone: '' }).success).toBe(false)
  })

  it('meta é inteiro de 1 a 7', () => {
    for (const meta of [0, 8, 2.5]) expect(habitoSchema.safeParse({ ...valido, meta_semanal: meta }).success).toBe(false)
    for (const meta of [1, 7]) expect(habitoSchema.safeParse({ ...valido, meta_semanal: meta }).success).toBe(true)
  })
})
