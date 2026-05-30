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
          success_url: `${appUrl}/booking/${params.bookingId}/confirmation`,
          pix: { expires_in: 3600 },
          credit_card: {
            capture: true,
            installments: [{ number: 1, total: amountInCents }],
          },
          // split_rules requires a Pagar.me PSP/marketplace contract.
          // Uncomment once the contract is active:
          // ...(params.tutorRecipientId && {
          //   split_rules: [
          //     { recipient_id: params.tutorRecipientId, amount: Math.round(params.tutorAmount * 100), type: 'flat' }
          //   ]
          // }),
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

// ---------- upsertRecipient ----------
// Creates or updates a Pagar.me recipient (recebedor) for a tutor.
// Requires a PSP/marketplace contract with Pagar.me for split payments at checkout.
// Recipient creation itself works without PSP; split_rules at checkout requires it.

export interface UpsertRecipientParams {
  name: string
  email: string
  cpf: string
  bankCode: string
  bankAgency: string
  bankAccount: string
  bankAccountDigit: string
  bankAccountType: 'checking' | 'savings'
  existingRecipientId?: string | null
}

export interface UpsertRecipientResult {
  recipientId: string
}

export async function upsertRecipient(params: UpsertRecipientParams): Promise<UpsertRecipientResult> {
  const body = {
    register_information: {
      name: params.name,
      email: params.email,
      document: params.cpf.replace(/\D/g, ''),
      type: 'individual',
    },
    default_bank_account: {
      holder_name: params.name,
      holder_type: 'individual',
      holder_document: params.cpf.replace(/\D/g, ''),
      bank: params.bankCode,
      branch_number: params.bankAgency,
      account_number: params.bankAccount,
      account_check_digit: params.bankAccountDigit,
      type: params.bankAccountType === 'checking' ? 'checking' : 'savings',
    },
    transfer_settings: {
      transfer_enabled: true,
      transfer_interval: 'daily',
      transfer_day: 0,
    },
  }

  if (params.existingRecipientId) {
    await pagarme('PUT', `/recipients/${params.existingRecipientId}`, body)
    return { recipientId: params.existingRecipientId }
  }

  const response = await pagarme<{ id: string }>('POST', '/recipients', body)
  return { recipientId: response.id }
}

// ---------- sendPayout ----------
// Split at checkout requires a Pagar.me PSP/marketplace contract.
// Until that's in place, payouts are tracked in the DB and the cron marks
// them as 'paid' once the session ends — the actual bank transfer happens
// automatically via the recipient's transfer_settings (daily withdrawal).

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
  // Payouts are processed manually via /admin/payouts.
  // This will be replaced when a PSP contract or PIX-out service is integrated.
  throw new Error('Repasse manual — marque como pago pelo painel /admin/payouts')
}
