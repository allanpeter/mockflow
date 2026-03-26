'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createOrder } from '@/lib/payment'
import { redirect } from 'next/navigation'

export async function initiateBooking(slotId: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const admin = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado.' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single<{ full_name: string; role: string }>()

  if (profile?.role !== 'learner') return { error: 'Apenas candidatos podem agendar sessões.' }

  // Lock slot + create booking atomically
  const { data: bookingId, error: bookingError } = await supabase
    .rpc('create_booking', { p_learner_id: user.id, p_slot_id: slotId })

  if (bookingError) {
    if (bookingError.message.includes('slot_unavailable')) {
      return { error: 'Este horário acabou de ser reservado por outra pessoa. Escolha outro.' }
    }
    return { error: bookingError.message }
  }

  // Fetch booking + tutor recipient ID for split payment
  const { data: booking } = await admin
    .from('bookings')
    .select(`
      id, gross_amount, tutor_amount, tutor_id,
      tutor_profiles ( user_id, pagarme_recipient_id, tutor: profiles ( full_name ) )
    `)
    .eq('id', bookingId)
    .single<{
      id: string
      gross_amount: number
      tutor_amount: number
      tutor_id: string
      tutor_profiles: {
        user_id: string
        pagarme_recipient_id: string | null
        tutor: { full_name: string }
      }
    }>()

  if (!booking) return { error: 'Erro ao criar reserva.' }

  const tutorName = booking.tutor_profiles?.tutor?.full_name ?? 'Entrevistador'

  const order = await createOrder({
    bookingId: booking.id,
    grossAmount: booking.gross_amount,
    tutorAmount: booking.tutor_amount,
    learnerEmail: user.email!,
    learnerName: profile.full_name,
    description: `Mock interview — ${tutorName}`,
    tutorRecipientId: booking.tutor_profiles?.pagarme_recipient_id ?? null,
  })

  await admin
    .from('bookings')
    .update({ pagarme_order_id: order.orderId })
    .eq('id', booking.id)

  // Redirect to Pagar.me hosted checkout
  // Pagar.me will redirect back to /booking/{id}/confirmation after payment
  redirect(order.checkoutUrl!)
}
