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
})
