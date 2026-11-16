import { describe, expect, it } from 'vitest'
import { ehModoQa } from './qa'

describe('ehModoQa', () => {
  it('liga so com qa=1', () => {
    expect(ehModoQa('?qa=1')).toBe(true)
    expect(ehModoQa('?utm_source=ig&qa=1')).toBe(true)
  })

  it('fica desligado sem o parametro ou com outro valor', () => {
    expect(ehModoQa('')).toBe(false)
    expect(ehModoQa('?utm_source=ig')).toBe(false)
    expect(ehModoQa('?qa=0')).toBe(false)
    expect(ehModoQa('?qa=10')).toBe(false)
    expect(ehModoQa('?x=qa=1')).toBe(false)
  })
})
