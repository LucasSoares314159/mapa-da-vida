const ABACATEPAY_API_URL = 'https://api.abacatepay.com/v2'

export type AbacatePayPaymentMethod = 'PIX' | 'CARD'

export interface CreateAbacatePayCheckoutInput {
  items: Array<{
    id: string
    quantity: number
  }>
  methods: AbacatePayPaymentMethod[]
  card: {
    maxInstallments: number
  }
  externalId: string
  metadata: Record<string, unknown>
  returnUrl: string
  completionUrl: string
}

export interface AbacatePayCheckout {
  id: string
  externalId: string | null
  url: string
  amount: number
  status: 'PENDING' | 'EXPIRED' | 'CANCELLED' | 'PAID' | 'REFUNDED' | 'REDEEMED'
  devMode: boolean
}

interface AbacatePayEnvelope<T> {
  data: T | null
  success: boolean
  error: string | null
}

export class AbacatePayApiError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message)
    this.name = 'AbacatePayApiError'
  }
}

class AbacatePayClient {
  constructor(private readonly apiKey: string) {}

  async createCheckout(
    input: CreateAbacatePayCheckoutInput
  ): Promise<AbacatePayCheckout> {
    return this.request<AbacatePayCheckout>('/checkouts/create', input)
  }

  private async request<T>(path: string, body: unknown): Promise<T> {
    const response = await fetch(`${ABACATEPAY_API_URL}${path}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    })

    let envelope: AbacatePayEnvelope<T>

    try {
      envelope = (await response.json()) as AbacatePayEnvelope<T>
    } catch {
      throw new AbacatePayApiError(
        'AbacatePay retornou uma resposta invalida',
        response.status
      )
    }

    if (!response.ok || !envelope.success || !envelope.data) {
      throw new AbacatePayApiError(
        envelope.error || 'Falha ao processar requisicao na AbacatePay',
        response.status
      )
    }

    return envelope.data
  }
}

let abacatePayClient: AbacatePayClient | null = null

export function getAbacatePay(): AbacatePayClient {
  const apiKey = process.env.ABACATEPAY_API_KEY

  if (!apiKey) {
    throw new Error('ABACATEPAY_API_KEY nao configurada')
  }

  abacatePayClient ??= new AbacatePayClient(apiKey)
  return abacatePayClient
}
