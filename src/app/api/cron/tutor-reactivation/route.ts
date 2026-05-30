import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendTutorReactivation } from '@/lib/email'

// Weekly cron. Finds active tutors with no future availability slots →
// sends a reactivation nudge so they add slots and stay discoverable.

export async function GET(request: Request) {
  const secret = request.headers.get('x-cron-secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://mockflow.com.br'
  const now = new Date().toISOString()

  // All active tutors
  const { data: tutors, error } = await admin
    .from('tutor_profiles')
    .select('id, user_id, profiles ( full_name )')
    .eq('is_active', true)

  if (error) {
    console.error('[cron/tutor-reactivation]', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Tutors that have at least one future unbooked slot
  const tutorIds = (tutors ?? []).map((t) => t.id)
  const { data: slotsRows } = tutorIds.length
    ? await admin
        .from('availability_slots')
        .select('tutor_id')
        .in('tutor_id', tutorIds)
        .eq('is_booked', false)
        .gte('starts_at', now)
    : { data: [] }

  const hasSlots = new Set((slotsRows ?? []).map((s) => s.tutor_id))

  let sent = 0

  for (const tutor of tutors ?? []) {
    if (hasSlots.has(tutor.id)) continue

    const tutorName = (tutor.profiles as unknown as { full_name: string } | null)?.full_name ?? 'Entrevistador'

    const { data: authUser } = await admin.auth.admin.getUserById(tutor.user_id)
    const email = authUser?.user?.email
    if (!email) continue

    try {
      await sendTutorReactivation({ to: email, tutorName, appUrl })
      sent++
    } catch (e) {
      console.error('[cron/tutor-reactivation] send failed:', e)
    }
  }

  return NextResponse.json({ ok: true, sent })
}
