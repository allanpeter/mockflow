import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendReviewPrompt } from '@/lib/email'

// Daily cron. Finds sessions that ended 23–25h ago with no learner review →
// sends a one-time email nudge to leave a review.
// The 23–25h window ensures each session is targeted exactly once.

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
          profiles ( full_name )
        )
      )
    `)
    .gte('ends_at', from)
    .lte('ends_at', to)

  if (error) {
    console.error('[cron/review-prompts]', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Gather session IDs that already have a review
  const sessionIds = (sessions ?? []).map((s) => s.id)
  const { data: existingReviews } = sessionIds.length
    ? await admin.from('reviews').select('session_id').in('session_id', sessionIds)
    : { data: [] }

  const reviewed = new Set((existingReviews ?? []).map((r) => r.session_id))

  let sent = 0

  for (const session of sessions ?? []) {
    if (reviewed.has(session.id)) continue

    const booking = session.bookings as unknown as {
      learner_id: string
      tutor_profiles: { profiles: { full_name: string } } | null
    }
    if (!booking) continue

    const tutorName = booking.tutor_profiles?.profiles?.full_name ?? 'Entrevistador'

    const { data: learnerAuth } = await admin.auth.admin.getUserById(booking.learner_id)
    const learnerEmail = learnerAuth?.user?.email
    const learnerName = (learnerAuth?.user?.user_metadata?.full_name as string | undefined) ?? 'Candidato'

    if (!learnerEmail) continue

    try {
      await sendReviewPrompt({ to: learnerEmail, learnerName, tutorName, sessionId: session.id, appUrl })
      sent++
    } catch (e) {
      console.error('[cron/review-prompts] send failed:', e)
    }
  }

  return NextResponse.json({ ok: true, sent })
}
