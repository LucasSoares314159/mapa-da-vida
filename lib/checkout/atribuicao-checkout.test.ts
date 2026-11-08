import { describe, expect, it } from 'vitest'
import { contextoDaRequisicao } from './atribuicao-checkout'

function requisicao(cabecalhos: Record<string, string>) {
  return new Request('https://www.mindtrail.com.br/api/abacatepay/checkout', {
    method: 'POST',
    headers: cabecalhos,
  })
}

describe('contextoDaRequisicao', () => {
  it('le IP do cliente, user agent, pagina de origem e cookies do Pixel', () => {
    const { cliente, cookies } = contextoDaRequisicao(
      requisicao({
        'x-forwarded-for': '200.100.50.25, 76.76.21.21',
        'user-agent': 'Mozilla/5.0 (iPhone)',
        referer: 'https://www.mindtrail.com.br/trilha?utm_source=meta',
        cookie: 'outro=1; _fbp=fb.1.1700000000000.123; _fbc=fb.1.1700000000000.AbC',
      })
    )

    expect(cliente).toEqual({
      ip: '200.100.50.25',
      userAgent: 'Mozilla/5.0 (iPhone)',
      sourceUrl: 'https://www.mindtrail.com.br/trilha?utm_source=meta',
    })
    expect(cookies).toEqual({ fbp: 'fb.1.1700000000000.123', fbc: 'fb.1.1700000000000.AbC' })
  })

  it('cai para x-real-ip e ignora referer que nao e URL http', () => {
    const { cliente, cookies } = contextoDaRequisicao(
      requisicao({ 'x-real-ip': '2804:14c::1', referer: 'javascript:alert(1)' })
    )

    expect(cliente.ip).toBe('2804:14c::1')
    expect(cliente.sourceUrl).toBeUndefined()
    expect(cookies).toEqual({ fbp: undefined, fbc: undefined })
  })
})
