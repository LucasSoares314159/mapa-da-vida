import { describe, expect, it } from 'vitest'
import {
  ATRIBUTO_BRACO,
  COOKIE_BRACO,
  SCRIPT_SORTEIO_BRACO,
  lerCookieBraco,
  resolverBraco,
} from './braco'

describe('resolverBraco', () => {
  it('sorteia 50/50 e pede para gravar quando nao ha cookie', () => {
    expect(resolverBraco('', null, () => 0.1)).toEqual({ braco: 'a', gravar: true })
    expect(resolverBraco('', null, () => 0.5)).toEqual({ braco: 'b', gravar: true })
    expect(resolverBraco('', undefined, () => 0.99)).toEqual({ braco: 'b', gravar: true })
  })

  it('mantem o braco do cookie valido, sem regravar', () => {
    expect(resolverBraco('', 'b', () => 0.1)).toEqual({ braco: 'b', gravar: false })
    expect(resolverBraco('', 'a', () => 0.9)).toEqual({ braco: 'a', gravar: false })
  })

  it('cookie invalido e ignorado e re-sorteado', () => {
    expect(resolverBraco('', 'x', () => 0.9)).toEqual({ braco: 'b', gravar: true })
  })

  it('?braco= so vale com qa=1 e nunca grava cookie', () => {
    expect(resolverBraco('?qa=1&braco=b', 'a', () => 0.1)).toEqual({ braco: 'b', gravar: false })
    expect(resolverBraco('?braco=b', 'a', () => 0.1)).toEqual({ braco: 'a', gravar: false })
    expect(resolverBraco('?braco=b', null, () => 0.1)).toEqual({ braco: 'a', gravar: true })
  })

  it('distribuicao ~50/50 em 10 mil sorteios', () => {
    let b = 0
    for (let i = 0; i < 10000; i++) if (resolverBraco('', null, Math.random).braco === 'b') b++
    expect(b).toBeGreaterThan(4700)
    expect(b).toBeLessThan(5300)
  })
})

describe('lerCookieBraco', () => {
  it('acha o cookie no meio de outros', () => {
    expect(lerCookieBraco(`x=1; ${COOKIE_BRACO}=b; y=2`)).toBe('b')
    expect(lerCookieBraco(`${COOKIE_BRACO}=a`)).toBe('a')
    expect(lerCookieBraco('x=1')).toBeNull()
  })
})

// O script inline e uma string: executa-la contra um "navegador" falso garante
// que ela nao diverge de resolverBraco nem quebra por erro de sintaxe.
describe('SCRIPT_SORTEIO_BRACO', () => {
  function rodar(search: string, cookie: string, random: number) {
    const attrs: Record<string, string> = {}
    let cookieGravado = ''
    const doc = {
      get cookie() {
        return cookie
      },
      set cookie(v: string) {
        cookieGravado = v
      },
      currentScript: {
        parentElement: { setAttribute: (k: string, v: string) => (attrs[k] = v) },
      },
    }
    const math = { random: () => random }
    new Function('location', 'document', 'Math', 'URLSearchParams', SCRIPT_SORTEIO_BRACO)(
      { search },
      doc,
      math,
      URLSearchParams
    )
    return { attrs, cookieGravado }
  }

  it('sorteia, poe o atributo e grava cookie de 30 dias', () => {
    const r = rodar('', '', 0.7)
    expect(r.attrs[ATRIBUTO_BRACO]).toBe('b')
    expect(r.cookieGravado).toContain(`${COOKIE_BRACO}=b`)
    expect(r.cookieGravado).toContain('max-age=2592000')
    expect(r.cookieGravado).toContain('path=/')
  })

  it('respeita cookie existente e nao regrava', () => {
    const r = rodar('', `a=1; ${COOKIE_BRACO}=a; z=2`, 0.9)
    expect(r.attrs[ATRIBUTO_BRACO]).toBe('a')
    expect(r.cookieGravado).toBe('')
  })

  it('override de QA nao grava cookie', () => {
    const r = rodar('?qa=1&braco=b', `${COOKIE_BRACO}=a`, 0.1)
    expect(r.attrs[ATRIBUTO_BRACO]).toBe('b')
    expect(r.cookieGravado).toBe('')
  })

  it('?braco= sem qa=1 e ignorado', () => {
    const r = rodar('?braco=b', '', 0.1)
    expect(r.attrs[ATRIBUTO_BRACO]).toBe('a')
  })

  it('nao lanca quando o ambiente falha', () => {
    expect(() =>
      new Function('location', 'document', 'Math', 'URLSearchParams', SCRIPT_SORTEIO_BRACO)(
        { search: '' },
        {},
        Math,
        URLSearchParams
      )
    ).not.toThrow()
  })
})
