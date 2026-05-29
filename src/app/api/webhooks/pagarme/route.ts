import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { confirmOrder } from '@/lib/payment'
import { createMeeting } from '@/lib/meeting'
import { sendBookingConfirmedLearner, sendNewBookingTutor } from '@/lib/email'

// O Pagar.me v5 não gera um segredo de webhook automático.
// Segurança garantida verificando o pedido diretamente na API do Pagar.me
// antes de confirmar o booking — impede webhooks forjados.

type PagarmeEvent = {
  type: string
  data: {
    id: string
    code: string
    status: string
    charges?: Array<{
      id: string
      status: string
      paid_amount: number
      payment_method: string
    }>
    metadata?: { bookingId?: string }
  }
}

export async function POST(request: Request) {
  const rawBody = await request.text()
  const event = JSON.parse(rawBody) as PagarmeEvent

  if (event.type !== 'order.paid') {
    return NextResponse.json({ ok: true, skipped: true })
  }

  const orderId = event.data.id
  const bookingId = event.data.metadata?.bookingId ?? event.data.code

  if (!bookingId) {
    console.error('[webhook/pagarme] bookingId ausente no evento', event)
    return NextResponse.json({ error: 'Missing bookingId' }, { status: 400 })
  }

  // Verificação anti-spoofing: consulta a API do Pagar.me para confirmar o status real
  const { success, chargeId } = await confirmOrder(orderId)
  if (!success) {
    console.warn('[webhook/pagarme] pedido não está pago na verificação:', orderId)
    return NextResponse.json({ error: 'Order not paid' }, { status: 400 })
  }

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
    console.error('[webhook/pagarme] booking não encontrado:', bookingId)
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  }

  // Idempotência: ignora se já confirmado
  if (booking.status === 'confirmed') {
    return NextResponse.json({ ok: true, skipped: 'already confirmed' })
  }

  const slot = booking.availability_slots
  const meetingRoom = createMeeting({ bookingId: booking.id })

  await Promise.all([
    admin.from('bookings').update({
      status: 'confirmed',
      pagarme_charge_id: chargeId,
    }).eq('id', booking.id),

    admin.from('availability_slots').update({
      is_booked: true,
    }).eq('id', booking.slot_id),

    admin.from('sessions').insert({
      booking_id: booking.id,
      starts_at: slot.starts_at,
      ends_at: slot.ends_at,
      whereby_room_url: meetingRoom.roomUrl,
      whereby_host_room_url: meetingRoom.hostRoomUrl,
    }),

    admin.from('payouts').insert({
      booking_id: booking.id,
      tutor_id: booking.tutor_id,
      amount: booking.tutor_amount,
      transfer_id: null,
      paid_at: null,
    }),
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

  console.log('[webhook/pagarme] emails:', { learnerEmail, tutorEmail, tutorName, learnerName })

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
      console.error(`[webhook/pagarme] email ${i} falhou:`, result.reason)
    }
  })

  return NextResponse.json({ ok: true })
}
