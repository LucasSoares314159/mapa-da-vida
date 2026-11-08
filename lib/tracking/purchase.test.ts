import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { PIXEL_META_ID } from './meta'
import { VALOR_TRILHA_REAIS, eventIdDaCompra, receitaDoProdutoEmReais } from './purchase'

describe('receitaDoProdutoEmReais', () => {
  it('PIX: o valor pago, convertido de centavos', () => {
    expect(receitaDoProdutoEmReais({ paidAmount: 29700, amount: 29700, customerFee: null })).toBe(297)
  })

  it('cartao com taxa repassada: tira os juros do cliente', () => {
    // 12x com juros: o cliente desembolsa mais, a receita do produto e a mesma.
    expect(receitaDoProdutoEmReais({ paidAmount: 35208, amount: 35208, customerFee: 5508 })).toBe(297)
  })

  it('servidor e navegador chegam ao mesmo valor', () => {
    expect(receitaDoProdutoEmReais({ paidAmount: 29700 })).toBe(VALOR_TRILHA_REAIS)
  })

  it('sem paidAmount, usa amount', () => {
    expect(receitaDoProdutoEmReais({ amount: 29700 })).toBe(297)
  })

  it('sem valor legivel, nao inventa numero', () => {
    expect(receitaDoProdutoEmReais({})).toBeUndefined()
    expect(receitaDoProdutoEmReais({ paidAmount: '29700' })).toBeUndefined()
    expect(receitaDoProdutoEmReais({ paidAmount: 100, customerFee: 100 })).toBeUndefined()
  })
})

describe('eventIdDaCompra', () => {
  it('deriva do externalId — o mesmo que a pagina de sucesso recebe', () => {
    expect(eventIdDaCompra('trilha-produtividade-abc')).toBe('purchase_trilha-produtividade-abc')
  })
})

describe('PIXEL_META_ID', () => {
  it('e o mesmo id que o navegador inicializa', () => {
    // Pixel trocado so no browser ja deixou a CAPI mandando para o Pixel antigo.
    const carregador = readFileSync(resolve(__dirname, '../../public/js/rastreio-meta.js'), 'utf8')
    expect(carregador).toContain(`var PIXEL_ID = '${PIXEL_META_ID}'`)
  })
})
