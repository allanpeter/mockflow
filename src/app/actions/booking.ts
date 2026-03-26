'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createOrder, confirmOrder } from '@/lib/payment'
import { redirect } from 'next/navigation'

export async function initiateBooking(slotId: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const admin = createAdminClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado.' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single<{ full_name: string; role: string }>()

  if (profile?.role !== 'learner') return { error: 'Apenas candidatos podem agendar sessões.' }

  // Lock slot + create booking atomically via security-definer DB function
  const { data: bookingId, error: bookingError } = await supabase
    .rpc('create_booking', { p_learner_id: user.id, p_slot_id: slotId })

  if (bookingError) {
    if (bookingError.message.includes('slot_unavailable')) {
      return { error: 'Este horário acabou de ser reservado por outra pessoa. Escolha outro.' }
    }
    return { error: bookingError.message }
  }

  // Fetch booking details for payment (admin bypasses RLS)
  const { data: booking } = await admin
    .from('bookings')
    .select(`
      id, gross_amount, tutor_amount, tutor_id,
      tutor_profiles ( tutor: profiles ( full_name ) )
    `)
    .eq('id', bookingId)
    .single<{
      id: string
      gross_amount: number
      tutor_amount: number
      tutor_id: string
      tutor_profiles: { tutor: { full_name: string } }
    }>()

  if (!booking) return { error: 'Erro ao criar reserva.' }

  const tutorName = booking.tutor_profiles?.tutor?.full_name ?? 'Entrevistador'

  // Create payment order
  const order = await createOrder({
    bookingId: booking.id,
    grossAmount: booking.gross_amount,
    tutorAmount: booking.tutor_amount,
    learnerEmail: user.email!,
    learnerName: profile.full_name,
    description: `Mock interview — ${tutorName}`,
  })

  // All writes from here use admin client (no RLS restrictions on internal ops)
  await admin
    .from('bookings')
    .update({ pagarme_order_id: order.orderId })
    .eq('id', booking.id)

  if (order.checkoutUrl) {
    redirect(order.checkoutUrl)
  }

  const confirmation = await confirmOrder(order.orderId)
  if (!confirmation.success) return { error: 'Pagamento recusado. Tente novamente.' }

  await admin
    .from('bookings')
    .update({ status: 'confirmed', pagarme_charge_id: confirmation.chargeId })
    .eq('id', booking.id)

  const { data: slot } = await admin
    .from('availability_slots')
    .select('starts_at, ends_at')
    .eq('id', slotId)
    .single<{ starts_at: string; ends_at: string }>()

  await admin.from('sessions').insert({
    booking_id: booking.id,
    starts_at: slot!.starts_at,
    ends_at: slot!.ends_at,
    whereby_room_url: null,
  })

  await admin.from('payouts').insert({
    booking_id: booking.id,
    tutor_id: booking.tutor_id,
    amount: booking.tutor_amount,
    pagarme_transfer_id: null,
    paid_at: null,
  })

  redirect(`/booking/${booking.id}/confirmation`)
}
