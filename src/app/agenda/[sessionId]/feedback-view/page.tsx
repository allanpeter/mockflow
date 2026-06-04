import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { FeedbackDisplay } from '@/components/feedback/feedback-display'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import type { SessionFeedbackRow } from '@/types/supabase'
import { formatDatePtBr } from '@/lib/date'

interface Props {
  params: Promise<Readonly<{ sessionId: string }>>
}

export default async function FeedbackViewPage({ params }: Props) {
  const { sessionId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirectedFrom=/agenda')

  const { data: feedback } = await supabase
    .from('session_feedback')
    .select('*')
    .eq('session_id', sessionId)
    .maybeSingle<SessionFeedbackRow>()

  if (!feedback) notFound()

  // RLS already enforces access; double-check learner or tutor
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle<{ role: string }>()

  const isTutor = profile?.role === 'tutor'

  // Learner: only their own feedback
  if (!isTutor && feedback.learner_id !== user.id) redirect('/agenda')

  // Tutor: only their own feedback
  if (isTutor) {
    const { data: tutorProfile } = await supabase
      .from('tutor_profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle<{ id: string }>()
    if (!tutorProfile || feedback.tutor_id !== tutorProfile.id) redirect('/agenda')
  }

  // Load session date for header
  const { data: session } = await supabase
    .from('sessions')
    .select('starts_at, booking_id')
    .eq('id', sessionId)
    .maybeSingle()

  const sessionDate = session
    ? formatDatePtBr(session.starts_at, {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : null

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4 py-10">
      <div>
        <Button variant="ghost" size="sm" className="-ml-2 mb-4" render={<Link href="/agenda" />}>
          <ArrowLeft className="mr-1 h-4 w-4" />
          Voltar para a agenda
        </Button>
        <h1 className="text-2xl font-bold">
          {isTutor ? 'Feedback enviado' : 'Seu feedback de entrevista'}
        </h1>
        {sessionDate && (
          <p className="mt-0.5 text-muted-foreground capitalize">{sessionDate}</p>
        )}
        {!isTutor && (
          <p className="mt-1 text-sm text-muted-foreground">
            Este feedback é privado. Apenas você e o entrevistador têm acesso.
          </p>
        )}
      </div>

      <FeedbackDisplay feedback={feedback} />
    </div>
  )
}
