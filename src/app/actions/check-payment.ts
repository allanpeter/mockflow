'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { confirmOrder } from '@/lib/payment'
import { confirmBooking } from '@/lib/confirm-booking'

export async function checkPayment(bookingId: string): Promise<{ confirmed: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { confirmed: false, error: 'Não autenticado.' }

  const admin = createAdminClient()

  const { data: booking } = await admin
    .from('bookings')
    .select('id, status, pagarme_order_id, learner_id')
    .eq('id', bookingId)
    .eq('learner_id', user.id)
    .single<{ id: string; status: string; pagarme_order_id: string | null; learner_id: string }>()

  if (!booking) return { confirmed: false, error: 'Reserva não encontrada.' }
  if (booking.status === 'confirmed') return { confirmed: true }
  if (!booking.pagarme_order_id) return { confirmed: false }

  let chargeId: string
  try {
    const result = await confirmOrder(booking.pagarme_order_id)
    if (!result.success) return { confirmed: false }
    chargeId = result.chargeId
  } catch (err) {
    console.error('[checkPayment] confirmOrder falhou:', err)
    return { confirmed: false }
  }

  const { confirmed } = await confirmBooking({
    bookingId: booking.id,
    orderId: booking.pagarme_order_id,
    chargeId,
  })

  return { confirmed }
}
