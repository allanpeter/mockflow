/**
 * Payment service — Pagar.me v5
 * Docs: https://docs.pagar.me/reference
 * Auth: Basic Auth — secret key as username, empty password
 */

const BASE_URL = 'https://api.pagar.me/core/v5'

async function pagarme<T>(method: string, path: string, body?: unknown): Promise<T> {
  const key = process.env.PAGARME_SECRET_KEY
  if (!key) throw new Error('PAGARME_SECRET_KEY is not set')

  const credentials = Buffer.from(`${key}:`).toString('base64')

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await res.json()
  if (!res.ok) {
    throw new Error(`Pagar.me ${method} ${path} → ${res.status}: ${JSON.stringify(data)}`)
  }
  return data as T
}

// ---------- createOrder ----------

export interface CreateOrderParams {
  bookingId: string
  grossAmount: number
  tutorAmount: number
  learnerEmail: string
  learnerName: string
  description: string
  tutorRecipientId: string | null  // reserved for Pagar.me split (recebedores)
  tutorAvatar?: string | null
}

export interface CreateOrderResult {
  orderId: string
  checkoutUrl: string | null
  mock: boolean
}

export async function createOrder(params: CreateOrderParams): Promise<CreateOrderResult> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://mockflow.com.br'
  const amountInCents = Math.round(params.grossAmount * 100)

  const response = await pagarme<{
    id: string
    code: string
    checkouts?: Array<{ id: string; payment_url: string }>
  }>('POST', '/orders', {
    code: params.bookingId,
    items: [
      {
        amount: amountInCents,
        description: params.description,
        quantity: 1,
      },
    ],
    customer: {
      name: params.learnerName,
      email: params.learnerEmail,
      type: 'individual',
    },
    payments: [
      {
        payment_method: 'checkout',
        amount: amountInCents,
        checkout: {
          accepted_payment_methods: ['pix', 'credit_card'],
          customer_editable: true,
          skip_checkout_success_page: true,
          success_url: `${appUrl}/booking/${params.bookingId}/confirmation`,
          pix: { expires_in: 3600 },
          credit_card: {
            capture: true,
            installments: [{ number: 1, total: amountInCents }],
          },
        },
      },
    ],
    metadata: {
      bookingId: params.bookingId,
    },
  })

  return {
    orderId: response.id,
    checkoutUrl: response.checkouts?.[0]?.payment_url ?? null,
    mock: false,
  }
}

// ---------- confirmOrder (fallback manual check) ----------

export interface ConfirmOrderResult {
  success: boolean
  chargeId: string
}

export async function confirmOrder(orderId: string): Promise<ConfirmOrderResult> {
  const response = await pagarme<{
    id: string
    status: string
    charges?: Array<{ id: string; status: string }>
  }>('GET', `/orders/${orderId}`)

  return {
    success: response.status === 'paid',
    chargeId: response.charges?.[0]?.id ?? orderId,
  }
}

// ---------- refundOrder ----------

export interface RefundOrderResult {
  success: boolean
  refundId: string
  mock: boolean
}

export async function refundOrder(chargeId: string): Promise<RefundOrderResult> {
  await pagarme('POST', `/charges/${chargeId}/cancel`, {})
  return { success: true, refundId: chargeId, mock: false }
}

// ---------- sendPayout ----------
// Pagar.me split (recebedores) pendente de decisão de arquitetura.
// O cron de payouts captura esse erro e marca o payout como 'failed'.

export interface SendPayoutParams {
  tutorId: string
  pixKey: string
  pixKeyType: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random'
  amount: number
  description: string
}

export interface SendPayoutResult {
  transferId: string
}

export async function sendPayout(_params: SendPayoutParams): Promise<SendPayoutResult> {
  throw new Error('Payout via Pagar.me ainda não configurado — processe manualmente até implementar recebedores')
}
