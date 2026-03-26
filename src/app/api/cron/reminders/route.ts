import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendSessionReminder } from '@/lib/email'

// Called once daily by Vercel Cron (see vercel.json).
// Sends a 24h reminder to both learner and tutor for sessions starting
// between 23h and 25h from now.

export async function GET(request: Request) {
  // Simple secret check to prevent unauthorized calls
  const secret = request.headers.get('x-cron-secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://mockflow.com.br'

  const from = new Date(Date.now() + 23 * 60 * 60 * 1000).toISOString()
  const to = new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString()

  const { data: sessions, error } = await admin
    .from('sessions')
    .select(`
      id, starts_at,
      bookings (
        learner_id, tutor_id,
        tutor_profiles (
          user_id,
          profiles ( full_name )
        )
      )
    `)
    .gte('starts_at', from)
    .lte('starts_at', to)
    .eq('status', 'scheduled')

  if (error) {
    console.error('[cron/reminders]', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  let sent = 0

  for (const session of sessions ?? []) {
    const booking = session.bookings as unknown as {
      learner_id: string
      tutor_id: string
      tutor_profiles: { user_id: string; profiles: { full_name: string } }
    }
    if (!booking) continue

    const tutorName = booking.tutor_profiles?.profiles?.full_name ?? 'Entrevistador'
    const sessionUrl = `${appUrl}/agenda`

    // Fetch learner email
    const { data: learnerAuth } = await admin.auth.admin.getUserById(booking.learner_id)
    const learnerEmail = learnerAuth?.user?.email
    const learnerName = learnerAuth?.user?.user_metadata?.full_name ?? 'Candidato'

    // Fetch tutor email
    const { data: tutorAuth } = await admin.auth.admin.getUserById(booking.tutor_profiles?.user_id)
    const tutorEmail = tutorAuth?.user?.email

    await Promise.allSettled([
      learnerEmail
        ? sendSessionReminder({
            to: learnerEmail,
            recipientName: learnerName,
            otherPartyLabel: 'Entrevistador',
            otherPartyName: tutorName,
            startsAt: session.starts_at,
            sessionUrl,
          })
        : Promise.resolve(),
      tutorEmail
        ? sendSessionReminder({
            to: tutorEmail,
            recipientName: tutorName,
            otherPartyLabel: 'Candidato',
            otherPartyName: learnerName,
            startsAt: session.starts_at,
            sessionUrl,
          })
        : Promise.resolve(),
    ])

    sent++
  }

  return NextResponse.json({ ok: true, sent })
}
