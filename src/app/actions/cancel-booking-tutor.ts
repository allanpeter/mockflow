'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { refundOrder } from '@/lib/payment'
import { sendBookingCancelledByTutor } from '@/lib/email'

export async function cancelBookingByTutor(bookingId: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const admin = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado.' }

  const { data: booking } = await admin
    .from('bookings')
    .select(`
      id, status, gross_amount, pagarme_charge_id, slot_id, learner_id,
      tutor_profiles ( user_id, profiles ( full_name ) ),
      sessions ( id, starts_at, ends_at )
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
      sessions: { id: string; starts_at: string; ends_at: string } | null
    }>()

  if (!booking) return { error: 'Reserva não encontrada.' }
  if (booking.status !== 'confirmed') return { error: 'Esta reserva não pode ser cancelada.' }

  // Only the tutor that owns this booking can cancel
  if (booking.tutor_profiles?.user_id !== user.id) return { error: 'Sem permissão para cancelar esta reserva.' }

  const startsAt = booking.sessions?.starts_at
  const endsAt = booking.sessions?.ends_at
  if (!startsAt || !endsAt) return { error: 'Sessão não encontrada.' }

  // Cannot cancel a session that already ended
  if (new Date(endsAt) < new Date()) return { error: 'Esta sessão já foi realizada.' }

  // Always refund 100% when tutor cancels
  if (booking.pagarme_charge_id) {
    const refund = await refundOrder(booking.pagarme_charge_id)
    if (!refund.success) return { error: 'Falha ao processar reembolso. Tente novamente.' }
  }

  await Promise.all([
    admin.from('bookings').update({ status: 'cancelled' }).eq('id', bookingId),
    admin.from('availability_slots').update({ is_booked: false }).eq('id', booking.slot_id),
    booking.sessions?.id
      ? admin.from('sessions').delete().eq('id', booking.sessions.id)
      : Promise.resolve(),
    admin.from('payouts').delete().eq('booking_id', bookingId).eq('status', 'pending'),
  ])

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://mockflow.com.br'
  const tutorName = booking.tutor_profiles?.profiles?.full_name ?? 'Entrevistador'

  const [{ data: learnerAuth }, { data: tutorAuth }] = await Promise.all([
    admin.auth.admin.getUserById(booking.learner_id),
    admin.auth.admin.getUserById(booking.tutor_profiles?.user_id),
  ])

  const learnerEmail = learnerAuth?.user?.email
  const learnerName = learnerAuth?.user?.user_metadata?.full_name ?? 'Candidato'
  const tutorEmail = tutorAuth?.user?.email

  await Promise.allSettled([
    learnerEmail
      ? sendBookingCancelledByTutor({
          to: learnerEmail,
          recipientName: learnerName,
          tutorName,
          startsAt,
          amount: booking.gross_amount,
          appUrl,
        })
      : Promise.resolve(),
    tutorEmail
      ? sendBookingCancelledByTutor({
          to: tutorEmail,
          recipientName: tutorName,
          tutorName,
          startsAt,
          amount: booking.gross_amount,
          appUrl,
          isTutorCopy: true,
        })
      : Promise.resolve(),
  ])

  revalidatePath('/agenda')
  return {}
}
