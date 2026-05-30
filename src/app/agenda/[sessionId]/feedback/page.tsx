import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { RubricForm } from '@/components/feedback/rubric-form'
import { ClipboardList } from 'lucide-react'

interface Props {
  params: Promise<Readonly<{ sessionId: string }>>
}

export default async function FeedbackPage({ params }: Props) {
  const { sessionId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirectedFrom=/agenda')

  // Must be a tutor
  const { data: tutorProfile } = await supabase
    .from('tutor_profiles')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle<{ id: string }>()

  if (!tutorProfile) redirect('/agenda')

  // Load session + booking to validate ownership and timing
  const { data: session } = await supabase
    .from('sessions')
    .select('id, ends_at, starts_at, booking_id')
    .eq('id', sessionId)
    .maybeSingle()

  if (!session) notFound()

  if (new Date(session.ends_at) > new Date()) redirect('/agenda')

  const { data: booking } = await supabase
    .from('bookings')
    .select('tutor_id, learner_id, profiles:learner_id ( full_name )')
    .eq('id', session.booking_id)
    .maybeSingle()

  if (!booking || booking.tutor_id !== tutorProfile.id) redirect('/agenda')

  // Already submitted?
  const { data: existing } = await supabase
    .from('session_feedback')
    .select('id')
    .eq('session_id', sessionId)
    .maybeSingle()

  if (existing) redirect('/agenda')

  const learnerName = (booking.profiles as unknown as { full_name: string } | null)?.full_name ?? 'Candidato'
  const sessionDate = new Date(session.starts_at).toLocaleDateString('pt-BR', {
    weekday: 'long', day: '2-digit', month: 'long',
  })

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4 py-10">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-muted">
          <ClipboardList className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Feedback da sessão</h1>
          <p className="mt-0.5 text-muted-foreground">
            Candidato: <strong>{learnerName}</strong> · {sessionDate}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Seu feedback é privado — só o candidato terá acesso. Seja honesto e construtivo.
          </p>
        </div>
      </div>

      <RubricForm sessionId={sessionId} />
    </div>
  )
}
