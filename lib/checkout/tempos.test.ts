import { describe, expect, it, vi } from 'vitest'
import { startCheckout } from './index'
import { abacatePayProvider } from './abacatepay-provider'
import { gravarAtribuicaoCheckout } from './atribuicao-checkout'

vi.mock('./abacatepay-provider', () => ({
  abacatePayProvider: { nome: 'abacatepay', criarCobranca: vi.fn() },
}))
vi.mock('./atribuicao-checkout', () => ({
  gravarAtribuicaoCheckout: vi.fn(),
  contextoDaRequisicao: vi.fn(),
}))

const espera = (ms: number) => new Promise((r) => setTimeout(r, ms))

describe('startCheckout — medicao de tempo', () => {
  it('separa o tempo do provedor do da gravacao da atribuicao', async () => {
    vi.mocked(abacatePayProvider.criarCobranca).mockImplementation(async () => {
      await espera(40)
      return { url: 'https://pagamento.exemplo/1', externalId: 'ext-1' }
    })
    vi.mocked(gravarAtribuicaoCheckout).mockImplementation(async () => {
      await espera(15)
    })

    const tempos: Record<string, number> = {}
    const resultado = await startCheckout({ source: 'lp-trilha' }, 'https://site.exemplo', tempos)

    expect(resultado.url).toBe('https://pagamento.exemplo/1')
    expect(tempos.provedor).toBeGreaterThanOrEqual(35)
    expect(tempos.atribuicao).toBeGreaterThanOrEqual(10)
    expect(tempos.provedor).toBeGreaterThan(tempos.atribuicao)
  })

  it('funciona sem o parametro de tempos', async () => {
    vi.mocked(abacatePayProvider.criarCobranca).mockResolvedValue({ url: 'u', externalId: 'e' })
    await expect(startCheckout({ source: 'quiz' }, 'https://site.exemplo')).resolves.toMatchObject({ url: 'u' })
  })
})
