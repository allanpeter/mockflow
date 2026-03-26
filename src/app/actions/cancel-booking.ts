'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { refundOrder } from '@/lib/payment'
import { sendBookingCancelled } from '@/lib/email'

export async function cancelBooking(bookingId: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const admin = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado.' }

  // Load booking with all data needed
  const { data: booking } = await admin
    .from('bookings')
    .select(`
      id, status, gross_amount, pagarme_charge_id, slot_id, learner_id,
      tutor_profiles ( user_id, profiles ( full_name ) ),
      sessions ( id, starts_at )
    `)
    .eq('id', bookingId)
    .single<{
      id: string
      status: string
      gross_amount: number
      pagarme_charge_id: string | null
      slot_id: string
      learner_id: string
      tutor_profiles: { user_id: string; profiles: { full_name: string } }
      sessions: { id: string; starts_at: string } | null
    }>()

  if (!booking) return { error: 'Reserva não encontrada.' }
  if (booking.status !== 'confirmed') return { error: 'Esta reserva não pode ser cancelada.' }

  // Only the learner can cancel
  if (booking.learner_id !== user.id) return { error: 'Sem permissão para cancelar esta reserva.' }

  const startsAt = booking.sessions?.starts_at
  if (!startsAt) return { error: 'Sessão não encontrada.' }

  const hoursUntilSession = (new Date(startsAt).getTime() - Date.now()) / (1000 * 60 * 60)
  const refundEligible = hoursUntilSession > 24

  // Process refund if eligible
  if (refundEligible && booking.pagarme_charge_id) {
    const refund = await refundOrder(booking.pagarme_charge_id)
    if (!refund.success) return { error: 'Falha ao processar reembolso. Tente novamente.' }
  }

  // Cancel booking, free up slot, delete session
  await Promise.all([
    admin.from('bookings').update({ status: 'cancelled' }).eq('id', bookingId),
    admin.from('availability_slots').update({ is_booked: false }).eq('id', booking.slot_id),
    booking.sessions?.id
      ? admin.from('sessions').delete().eq('id', booking.sessions.id)
      : Promise.resolve(),
  ])

  // Send cancellation emails to both parties
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://mockflow.com.br'
  const tutorName = booking.tutor_profiles?.profiles?.full_name ?? 'Entrevistador'

  // Fetch learner + tutor emails
  const [{ data: learnerAuth }, { data: tutorAuth }] = await Promise.all([
    admin.auth.admin.getUserById(booking.learner_id),
    admin.auth.admin.getUserById(booking.tutor_profiles?.user_id),
  ])

  const learnerEmail = learnerAuth?.user?.email
  const learnerName = learnerAuth?.user?.user_metadata?.full_name ?? 'Candidato'
  const tutorEmail = tutorAuth?.user?.email

  await Promise.allSettled([
    learnerEmail
      ? sendBookingCancelled({
          to: learnerEmail,
          recipientName: learnerName,
          otherPartyLabel: 'Entrevistador',
          otherPartyName: tutorName,
          startsAt,
          refunded: refundEligible,
          amount: booking.gross_amount,
        })
      : Promise.resolve(),
    tutorEmail
      ? sendBookingCancelled({
          to: tutorEmail,
          recipientName: tutorName,
          otherPartyLabel: 'Candidato',
          otherPartyName: learnerName,
          startsAt,
          refunded: false,
          amount: booking.gross_amount,
        })
      : Promise.resolve(),
  ])

  revalidatePath('/agenda')
  return {}
}
