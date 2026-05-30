import { createAdminClient } from '@/lib/supabase/admin'
import { createMeeting } from '@/lib/meeting'
import { sendBookingConfirmedLearner, sendNewBookingTutor } from '@/lib/email'

function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999)
}

interface ConfirmBookingParams {
  bookingId: string
  orderId: string
  chargeId: string
}

export async function confirmBooking({ bookingId, orderId, chargeId }: ConfirmBookingParams): Promise<{ confirmed: boolean }> {
  const admin = createAdminClient()

  const { data: booking } = await admin
    .from('bookings')
    .select(`
      id, status, gross_amount, tutor_amount, tutor_id, slot_id, learner_id,
      tutor_profiles ( user_id, profiles ( full_name ) ),
      availability_slots ( starts_at, ends_at )
    `)
    .eq('id', bookingId)
    .single<{
      id: string
      status: string
      gross_amount: number
      tutor_amount: number
      tutor_id: string
      slot_id: string
      learner_id: string
      tutor_profiles: { user_id: string; profiles: { full_name: string } }
      availability_slots: { starts_at: string; ends_at: string }
    }>()

  if (!booking) {
    console.error('[confirmBooking] booking não encontrado:', bookingId)
    return { confirmed: false }
  }

  if (booking.status === 'confirmed') {
    return { confirmed: true }
  }

  const slot = booking.availability_slots
  const meetingRoom = createMeeting({ bookingId: booking.id })

  await Promise.all([
    admin.from('bookings').update({
      status: 'confirmed',
      pagarme_order_id: orderId,
      pagarme_charge_id: chargeId,
    }).eq('id', booking.id),

    admin.from('availability_slots').update({
      is_booked: true,
    }).eq('id', booking.slot_id),

    // upsert guards against duplicate inserts if the webhook and the
    // client-side poller both arrive before the booking status is updated
    admin.from('sessions').upsert({
      booking_id: booking.id,
      starts_at: slot.starts_at,
      ends_at: slot.ends_at,
      whereby_room_url: meetingRoom.roomUrl,
      whereby_host_room_url: meetingRoom.hostRoomUrl,
    }, { onConflict: 'booking_id', ignoreDuplicates: true }),

    admin.from('payouts').upsert({
      booking_id: booking.id,
      tutor_id: booking.tutor_id,
      amount: booking.tutor_amount,
      transfer_id: null,
      paid_at: null,
      release_at: endOfMonth(new Date(slot.ends_at)).toISOString(),
    }, { onConflict: 'booking_id', ignoreDuplicates: true }),
  ])

  const tutorName = booking.tutor_profiles?.profiles?.full_name ?? 'Entrevistador'
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://mockflow.com.br'

  const [{ data: learnerAuth }, { data: tutorAuth }] = await Promise.all([
    admin.auth.admin.getUserById(booking.learner_id),
    admin.auth.admin.getUserById(booking.tutor_profiles?.user_id),
  ])

  const learnerEmail = learnerAuth?.user?.email
  const learnerName = learnerAuth?.user?.user_metadata?.full_name ?? 'Candidato'
  const tutorEmail = tutorAuth?.user?.email

  const emailResults = await Promise.allSettled([
    learnerEmail
      ? sendBookingConfirmedLearner({
          to: learnerEmail,
          learnerName,
          tutorName,
          startsAt: slot.starts_at,
          endsAt: slot.ends_at,
          amount: booking.gross_amount,
          bookingId: booking.id,
          sessionUrl: meetingRoom.roomUrl,
          appUrl,
        })
      : Promise.resolve(),
    tutorEmail
      ? sendNewBookingTutor({
          to: tutorEmail,
          tutorName,
          learnerName,
          startsAt: slot.starts_at,
          sessionUrl: meetingRoom.hostRoomUrl,
          appUrl,
        })
      : Promise.resolve(),
  ])

  emailResults.forEach((result, i) => {
    if (result.status === 'rejected') {
      console.error(`[confirmBooking] email ${i} falhou:`, result.reason)
    }
  })

  return { confirmed: true }
}
