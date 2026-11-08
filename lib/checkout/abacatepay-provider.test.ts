import { afterEach, describe, expect, it, vi } from 'vitest'
import { getAbacatePay } from '@/lib/abacatepay'
import { abacatePayProvider } from './abacatepay-provider'

vi.mock('@/lib/abacatepay', () => ({
  getAbacatePay: vi.fn(),
}))

describe('abacatePayProvider', () => {
  afterEach(() => {
    vi.clearAllMocks()
    vi.unstubAllEnvs()
  })

  it('repassa a taxa ao cliente quando o cartao esta habilitado', async () => {
    vi.stubEnv('ABACATEPAY_PRODUCT_ID', 'prod_123')
    vi.stubEnv('ABACATEPAY_CARD_ENABLED', 'true')

    const createCheckout = vi.fn().mockResolvedValue({
      url: 'https://app.abacatepay.com/pay/bill_123',
    })
    vi.mocked(getAbacatePay).mockReturnValue({
      createCheckout,
    } as unknown as ReturnType<typeof getAbacatePay>)

    await abacatePayProvider.criarCobranca(
      { source: 'lp-trilha' },
      'https://www.mindtrail.com.br'
    )

    expect(createCheckout).toHaveBeenCalledWith(
      expect.objectContaining({
        methods: ['PIX', 'CARD'],
        card: {
          maxInstallments: 12,
          passFeesToCustomer: true,
        },
      })
    )
  })
  it('volta para a página de sucesso com a mesma referência que a CAPI usa', async () => {
    vi.stubEnv('ABACATEPAY_PRODUCT_ID', 'prod_123')

    const createCheckout = vi.fn().mockResolvedValue({ url: 'https://app.abacatepay.com/pay/bill_123' })
    vi.mocked(getAbacatePay).mockReturnValue({
      createCheckout,
    } as unknown as ReturnType<typeof getAbacatePay>)

    await abacatePayProvider.criarCobranca({ source: 'lp-trilha' }, 'https://www.mindtrail.com.br')

    // O Pixel da página de sucesso usa purchase_<checkout_ref>; o webhook usa
    // purchase_<externalId>. Se divergirem, a Meta conta a venda duas vezes.
    const { externalId, completionUrl } = createCheckout.mock.calls[0][0]
    expect(completionUrl).toBe(
      `https://www.mindtrail.com.br/compra/sucesso?checkout_ref=${encodeURIComponent(externalId)}`
    )
  })
})
