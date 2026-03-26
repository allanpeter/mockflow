/**
 * Payment service — AbacatePay
 * Docs: https://docs.abacatepay.com
 *
 * NOTE: Split payments are not yet supported by AbacatePay.
 * The full amount is collected and tutor payouts are tracked manually
 * in the payouts table for future processing.
 */

const BASE_URL = 'https://api.abacatepay.com/v2'

async function abacate<T>(method: string, path: string, body?: unknown): Promise<T> {
  const key = process.env.ABACATEPAY_API_KEY
  if (!key) throw new Error('ABACATEPAY_API_KEY is not set')

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await res.json()
  if (!res.ok) {
    throw new Error(`AbacatePay ${method} ${path} → ${res.status}: ${JSON.stringify(data)}`)
  }
  return data as T
}

// ---------- createOrder ----------

export interface CreateOrderParams {
  bookingId: string
  grossAmount: number
  tutorAmount: number   // kept for payout tracking, not used in split yet
  learnerEmail: string
  learnerName: string
  description: string
  tutorRecipientId: string | null  // reserved for when AbacatePay adds split support
}

export interface CreateOrderResult {
  orderId: string
  checkoutUrl: string | null
  mock: boolean
}

export async function createOrder(params: CreateOrderParams): Promise<CreateOrderResult> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://mockflow.com.br'

  const response = await abacate<{
    success: boolean
    data: { id: string; url: string }
    error: string | null
  }>('POST', '/checkouts/create', {
    externalId: params.bookingId,
    methods: ['PIX', 'CREDIT_CARD'],
    items: [
      {
        externalId: params.bookingId,
        name: params.description,
        quantity: 1,
        price: Math.round(params.grossAmount * 100), // cents
      },
    ],
    customer: {
      name: params.learnerName,
      email: params.learnerEmail,
    },
    returnUrl: `${appUrl}/tutors`,
    completionUrl: `${appUrl}/booking/${params.bookingId}/confirmation`,
    metadata: {
      bookingId: params.bookingId,
    },
  })

  if (!response.success || !response.data) {
    throw new Error('AbacatePay checkout creation failed: ' + response.error)
  }

  return {
    orderId: response.data.id,
    checkoutUrl: response.data.url,
    mock: false,
  }
}

// ---------- confirmOrder (called by webhook handler) ----------

export interface ConfirmOrderResult {
  success: boolean
  chargeId: string
}

export async function confirmOrder(orderId: string): Promise<ConfirmOrderResult> {
  const response = await abacate<{
    success: boolean
    data: { id: string; status: string }
    error: string | null
  }>('GET', `/checkouts/${orderId}`)

  const paid = response.data?.status === 'PAID'
  return { success: paid, chargeId: orderId }
}

// ---------- refundOrder ----------

export interface RefundOrderResult {
  success: boolean
  refundId: string
  mock: boolean
}

// ---------- sendPayout (PIX transfer to tutor) ----------

export interface SendPayoutParams {
  tutorId: string         // internal ID, used as externalId
  pixKey: string
  pixKeyType: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random'
  amount: number          // BRL (e.g. 135.00)
  description: string
}

export interface SendPayoutResult {
  transferId: string
}

export async function sendPayout(params: SendPayoutParams): Promise<SendPayoutResult> {
  const response = await abacate<{
    success: boolean
    data: { id: string; status: string }
    error: string | null
  }>('POST', '/withdraw/create', {
    externalId: params.tutorId,
    pixKey: params.pixKey,
    pixKeyType: params.pixKeyType.toUpperCase(),
    amount: Math.round(params.amount * 100), // cents
    description: params.description,
  })

  if (!response.success || !response.data) {
    throw new Error('AbacatePay withdraw failed: ' + response.error)
  }

  return { transferId: response.data.id }
}

export async function refundOrder(chargeId: string): Promise<RefundOrderResult> {
  // AbacatePay refund API endpoint — triggers a refund on a completed checkout
  const response = await abacate<{
    success: boolean
    data: { id: string; status: string }
    error: string | null
  }>('POST', `/checkouts/${chargeId}/refund`)

  return {
    success: response.success && response.data?.status === 'REFUNDED',
    refundId: chargeId,
    mock: false,
  }
}
