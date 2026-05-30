import { NextResponse } from 'next/server'
import { confirmBooking } from '@/lib/confirm-booking'

type PagarmeEvent = {
  type: string
  data: {
    id: string
    code: string
    status: string
    charges?: Array<{ id: string; status: string; paid_amount: number; payment_method: string }>
    metadata?: { bookingId?: string }
  }
}

export async function POST(request: Request) {
  const event = JSON.parse(await request.text()) as PagarmeEvent

  if (event.type !== 'order.paid') {
    return NextResponse.json({ ok: true, skipped: true })
  }

  const orderId = event.data.id
  const bookingId = event.data.metadata?.bookingId ?? event.data.code

  if (!bookingId) {
    console.error('[webhook/pagarme] bookingId ausente no evento', event)
    return NextResponse.json({ error: 'Missing bookingId' }, { status: 400 })
  }

  // Use the charge ID from the event payload directly.
  // Re-calling the Pagar.me API here causes a race condition: the order status
  // may not yet reflect 'paid' when the webhook fires, leading to spurious 400s
  // and Pagar.me retrying indefinitely.
  const chargeId = event.data.charges?.[0]?.id ?? orderId

  try {
    await confirmBooking({ bookingId, orderId, chargeId })
  } catch (err) {
    console.error('[webhook/pagarme] confirmBooking falhou:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
