/**
 * Payment service — mock implementation.
 * Swap this file for the real Pagar.me integration when ready.
 *
 * Contract:
 *   createOrder()  → returns an orderId and a checkout URL (or null for mock)
 *   confirmOrder() → simulates/confirms payment, returns success flag
 */

export interface CreateOrderParams {
  bookingId: string
  grossAmount: number   // BRL, e.g. 150.00
  tutorAmount: number   // 90% — for split config later
  learnerEmail: string
  learnerName: string
  description: string   // e.g. "Mock interview — Ana Silva"
}

export interface CreateOrderResult {
  orderId: string
  checkoutUrl: string | null  // null in mock mode (we skip external redirect)
  mock: boolean
}

export async function createOrder(params: CreateOrderParams): Promise<CreateOrderResult> {
  // TODO: replace with real Pagar.me order creation
  // const pagarme = new PagarmeClient({ apiKey: process.env.PAGARME_API_KEY! })
  // const order = await pagarme.orders.create({ ... })

  const mockOrderId = `mock_${params.bookingId}_${Date.now()}`
  return { orderId: mockOrderId, checkoutUrl: null, mock: true }
}

export interface ConfirmOrderResult {
  success: boolean
  chargeId: string
}

export async function confirmOrder(orderId: string): Promise<ConfirmOrderResult> {
  // TODO: in production this is driven by Pagar.me webhook, not called directly
  // Here we just simulate instant approval

  if (!orderId.startsWith('mock_')) {
    throw new Error('confirmOrder called with non-mock orderId in mock mode')
  }

  return { success: true, chargeId: `mock_charge_${Date.now()}` }
}
