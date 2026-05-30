import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendFeedbackPrompt } from '@/lib/email'

// Daily cron. Finds sessions that ended 23–25h ago where the tutor hasn't
// filled in the structured feedback yet → sends a nudge email to the tutor.

export async function GET(request: Request) {
  const secret = request.headers.get('x-cron-secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://mockflow.com.br'

  const from = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString()
  const to   = new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString()

  const { data: sessions, error } = await admin
    .from('sessions')
    .select(`
      id,
      bookings (
        learner_id,
        tutor_profiles (
          user_id,
          profiles ( full_name )
        )
      )
    `)
    .gte('ends_at', from)
    .lte('ends_at', to)

  if (error) {
    console.error('[cron/feedback-prompts]', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Gather session IDs that already have feedback
  const sessionIds = (sessions ?? []).map((s) => s.id)
  const { data: existingFeedback } = sessionIds.length
    ? await admin.from('session_feedback').select('session_id').in('session_id', sessionIds)
    : { data: [] }

  const done = new Set((existingFeedback ?? []).map((f) => f.session_id))

  let sent = 0

  for (const session of sessions ?? []) {
    if (done.has(session.id)) continue

    const booking = session.bookings as unknown as {
      learner_id: string
      tutor_profiles: { user_id: string; profiles: { full_name: string } } | null
    }
    if (!booking?.tutor_profiles) continue

    const tutorName = booking.tutor_profiles.profiles?.full_name ?? 'Entrevistador'

    const { data: tutorAuth } = await admin.auth.admin.getUserById(booking.tutor_profiles.user_id)
    const tutorEmail = tutorAuth?.user?.email
    if (!tutorEmail) continue

    const { data: learnerAuth } = await admin.auth.admin.getUserById(booking.learner_id)
    const learnerName = (learnerAuth?.user?.user_metadata?.full_name as string | undefined) ?? 'Candidato'

    try {
      await sendFeedbackPrompt({ to: tutorEmail, tutorName, learnerName, sessionId: session.id, appUrl })
      sent++
    } catch (e) {
      console.error('[cron/feedback-prompts] send failed:', e)
    }
  }

  return NextResponse.json({ ok: true, sent })
}
