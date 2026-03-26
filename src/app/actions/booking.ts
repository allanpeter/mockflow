'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendBookingConfirmedLearner, sendNewBookingTutor } from '@/lib/email'
import { createOrder, confirmOrder } from '@/lib/payment'
import { createMeeting } from '@/lib/meeting'
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
      tutor_profiles ( user_id, tutor: profiles ( full_name ) )
    `)
    .eq('id', bookingId)
    .single<{
      id: string
      gross_amount: number
      tutor_amount: number
      tutor_id: string
      tutor_profiles: { user_id: string; tutor: { full_name: string } }
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

  const meetingRoom = createMeeting({ bookingId: booking.id })

  await admin.from('sessions').insert({
    booking_id: booking.id,
    starts_at: slot!.starts_at,
    ends_at: slot!.ends_at,
    whereby_room_url: meetingRoom.roomUrl,
    whereby_host_room_url: meetingRoom.hostRoomUrl,
  })

  await admin.from('payouts').insert({
    booking_id: booking.id,
    tutor_id: booking.tutor_id,
    amount: booking.tutor_amount,
    pagarme_transfer_id: null,
    paid_at: null,
  })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://mockflow.com.br'
  await sendBookingEmails({
    admin,
    appUrl,
    learnerEmail: user.email!,
    learnerName: profile.full_name,
    tutorName,
    tutorUserId: booking.tutor_profiles?.user_id,
    startsAt: slot!.starts_at,
    endsAt: slot!.ends_at,
    amount: booking.gross_amount,
    bookingId: booking.id,
  })

  redirect(`/booking/${booking.id}/confirmation`)
}

// ---------- helpers ----------

type AdminClient = ReturnType<typeof createAdminClient>

async function sendBookingEmails(opts: {
  admin: AdminClient
  appUrl: string
  learnerEmail: string
  learnerName: string
  tutorName: string
  tutorUserId: string | undefined
  startsAt: string
  endsAt: string
  amount: number
  bookingId: string
}) {
  let tutorEmail: string | null = null
  if (opts.tutorUserId) {
    const { data } = await opts.admin.auth.admin.getUserById(opts.tutorUserId)
    tutorEmail = data?.user?.email ?? null
  }

  const results = await Promise.allSettled([
    sendBookingConfirmedLearner({
      to: opts.learnerEmail,
      learnerName: opts.learnerName,
      tutorName: opts.tutorName,
      startsAt: opts.startsAt,
      endsAt: opts.endsAt,
      amount: opts.amount,
      bookingId: opts.bookingId,
      appUrl: opts.appUrl,
    }),
    tutorEmail
      ? sendNewBookingTutor({
          to: tutorEmail,
          tutorName: opts.tutorName,
          learnerName: opts.learnerName,
          startsAt: opts.startsAt,
          appUrl: opts.appUrl,
        })
      : Promise.resolve(),
  ])

  for (const result of results) {
    if (result.status === 'rejected') {
      console.error('[booking] email failed:', result.reason)
    } else if (result.value && 'error' in result.value && result.value.error) {
      console.error('[booking] email error:', result.value.error)
    } else {
      console.log('[booking] email sent:', result.value)
    }
  }
}
