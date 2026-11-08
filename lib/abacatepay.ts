import { createHmac, timingSafeEqual } from 'node:crypto'

const ABACATEPAY_API_URL = 'https://api.abacatepay.com/v2'

/**
 * Chave publica com que a AbacatePay assina os webhooks (HMAC-SHA256, base64,
 * header X-Webhook-Signature). E a mesma para todas as contas e esta na
 * documentacao deles — nao e segredo. O segredo e o `webhookSecret` da URL.
 */
export const ABACATEPAY_PUBLIC_KEY =
  't9dXRhHHo3yDEj5pVDYz0frf7q6bMKyMRmxxCPIPp3RCplBfXRxqlC6ZpiWmOqj4L63qEaeUOtrCI8P0VMUgo6iIga2ri9ogaHFs0WIIywSMg0q7RmBfybe1E5XJcfC4IW3alNqym0tXoAKkzvfEjZxV6bE0oG2zJrNNYmUCKZyV0KZ3JS8Votf9EAWWYdiDkMkpbMdPggfh1EqHlVkMiTady6jOR3hyzGEHrIz2Ret0xHKMbiqkr9HS1JhNHDX9'

/** Comparacao em tempo constante, para segredo e assinatura. */
export function compararSegredo(recebido: string, esperado: string): boolean {
  const recebidoBuffer = Buffer.from(recebido)
  const esperadoBuffer = Buffer.from(esperado)

  return (
    recebidoBuffer.length === esperadoBuffer.length &&
    timingSafeEqual(recebidoBuffer, esperadoBuffer)
  )
}

/** Assinatura que a AbacatePay mandaria para este corpo bruto. */
export function assinarCorpoWebhook(rawBody: string): string {
  return createHmac('sha256', ABACATEPAY_PUBLIC_KEY)
    .update(Buffer.from(rawBody, 'utf8'))
    .digest('base64')
}

export function assinaturaWebhookValida(rawBody: string, assinatura: string): boolean {
  return compararSegredo(assinatura, assinarCorpoWebhook(rawBody))
}

export type AbacatePayPaymentMethod = 'PIX' | 'CARD'

export interface CreateAbacatePayCheckoutInput {
  items: Array<{
    id: string
    quantity: number
  }>
  methods: AbacatePayPaymentMethod[]
  card?: {
    maxInstallments: number
    passFeesToCustomer: boolean
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
