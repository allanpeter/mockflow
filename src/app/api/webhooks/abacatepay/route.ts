import { NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'node:crypto'
import { createAdminClient } from '@/lib/supabase/admin'
import { createMeeting } from '@/lib/meeting'
import { sendBookingConfirmedLearner, sendNewBookingTutor } from '@/lib/email'

// AbacatePay signs webhooks with HMAC-SHA256 using their public key.
// The signature is Base64-encoded and sent in X-Webhook-Signature.
const ABACATEPAY_PUBLIC_KEY = 't9dXRhHHo3yDEj5pVDYz0frf7q6bMKyMRmxxCPIPp3RCplBfXRxqlC6ZpiWmOqj4L63qEaeUOtrCI8P0VMUgo6iIga2ri9ogaHFs0WIIywSMg0q7RmBfybe1E5XJcfC4IW3alNqym0tXoAKkzvfEjZxV6bE0oG2zJrNNYmUCKZyV0KZ3JS8Votf9EAWWYdiDkMkpbMdPggfh1EqHlVkMiTady6jOR3hyzGEHrIz2Ret0xHKMbiqkr9HS1JhNHDX9'

function verifySignature(rawBody: string, signature: string): boolean {
  const expected = createHmac('sha256', ABACATEPAY_PUBLIC_KEY)
    .update(Buffer.from(rawBody))
    .digest('base64')
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
  } catch {
    return false
  }
}

export async function POST(request: Request) {
  const rawBody = await request.text()
  const signature = request.headers.get('x-webhook-signature') ?? ''



  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const event = JSON.parse(rawBody) as {
    event: string
    data: {
      billing: {
        id: string
        status: string
        products: { externalId: string }[]
      }
    }
  }

  if (event.event !== 'billing.paid') {
    return NextResponse.json({ ok: true, skipped: true })
  }

  const bookingId = event.data.billing.products[0]?.externalId
  const checkoutId = event.data.billing.id
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
    console.error('[webhook/abacatepay] booking not found:', bookingId)
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  }

  // Idempotency guard
  if (booking.status === 'confirmed') {
    return NextResponse.json({ ok: true, skipped: 'already confirmed' })
  }

  const slot = booking.availability_slots
  const meetingRoom = createMeeting({ bookingId: booking.id })

  await Promise.all([
    admin.from('bookings').update({
      status: 'confirmed',
      pagarme_charge_id: checkoutId,
    }).eq('id', booking.id),

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

  await Promise.allSettled([
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

  return NextResponse.json({ ok: true })
}
