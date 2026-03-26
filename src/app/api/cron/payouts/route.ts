import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendPayout } from '@/lib/payment'

// Called once daily (or more frequently) by a cron job.
// Processes pending payouts for sessions that have already ended.
// Skips tutors without a PIX key configured.

export async function GET(request: Request) {
  const secret = request.headers.get('x-cron-secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()

  // Find pending payouts where the session has ended
  const { data: payouts, error } = await admin
    .from('payouts')
    .select(`
      id, amount, tutor_id,
      bookings (
        id,
        sessions ( id, ends_at, status )
      ),
      tutor_profiles!inner (
        pix_key,
        pix_key_type,
        profiles ( full_name )
      )
    `)
    .eq('status', 'pending')
    .not('tutor_profiles.pix_key', 'is', null)

  if (error) {
    console.error('[cron/payouts]', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  let processed = 0
  let failed = 0

  for (const payout of payouts ?? []) {
    const booking = payout.bookings as unknown as {
      id: string
      sessions: { id: string; ends_at: string; status: string }
    }
    const tutorProfile = payout.tutor_profiles as unknown as {
      pix_key: string
      pix_key_type: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random'
      profiles: { full_name: string }
    }

    const session = booking?.sessions
    if (!session) continue

    // Only pay out for sessions that are done
    const sessionEnded = new Date(session.ends_at) < new Date()
    const sessionDone = session.status === 'completed' || sessionEnded
    if (!sessionDone) continue

    try {
      await admin
        .from('payouts')
        .update({ status: 'processing' })
        .eq('id', payout.id)

      const { transferId } = await sendPayout({
        tutorId: payout.tutor_id,
        pixKey: tutorProfile.pix_key,
        pixKeyType: tutorProfile.pix_key_type,
        amount: payout.amount,
        description: `MockFlow — sessão ${booking.id.slice(0, 8)}`,
      })

      await admin
        .from('payouts')
        .update({
          status: 'paid',
          transfer_id: transferId,
          paid_at: new Date().toISOString(),
        })
        .eq('id', payout.id)

      processed++
    } catch (err) {
      console.error('[cron/payouts] payout failed for', payout.id, err)
      await admin
        .from('payouts')
        .update({ status: 'failed' })
        .eq('id', payout.id)
      failed++
    }
  }

  return NextResponse.json({ ok: true, processed, failed })
}
