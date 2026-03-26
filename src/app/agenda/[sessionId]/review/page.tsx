import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { submitReview } from '@/app/actions/review'
import { StarRatingInput } from '@/components/review/star-rating-input'

interface Props {
  params: Promise<Readonly<{ sessionId: string }>>
}

export default async function ReviewPage({ params }: Readonly<Props>) {
  const { sessionId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirectedFrom=/agenda')

  // Load session with booking + tutor info
  const { data: session } = await supabase
    .from('sessions')
    .select(`
      id, starts_at, ends_at,
      bookings!inner (
        learner_id,
        tutor_profiles (
          id,
          profiles ( full_name )
        )
      )
    `)
    .eq('id', sessionId)
    .single()

  const booking = session?.bookings as unknown as {
    learner_id: string
    tutor_profiles: { id: string; profiles: { full_name: string } }
  }

  // Must be past, must belong to this learner
  if (
    !session ||
    booking?.learner_id !== user.id ||
    new Date(session.ends_at) > new Date()
  ) {
    notFound()
  }

  const tutorId = booking.tutor_profiles?.id
  const tutorName = booking.tutor_profiles?.profiles?.full_name ?? 'Entrevistador'

  // Already reviewed?
  const { data: existing } = await supabase
    .from('reviews')
    .select('id')
    .eq('session_id', sessionId)
    .maybeSingle()

  if (existing) redirect('/agenda')

  const sessionDate = new Date(session.starts_at).toLocaleDateString('pt-BR', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
  })

  return (
    <div className="mx-auto max-w-lg space-y-8 px-4 py-16">
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground capitalize">{sessionDate}</p>
        <h1 className="text-2xl font-bold">Avaliar sessão</h1>
        <p className="text-muted-foreground">
          Como foi sua experiência com <span className="font-medium text-foreground">{tutorName}</span>?
        </p>
      </div>

      <StarRatingInput
        sessionId={sessionId}
        tutorId={tutorId}
        action={submitReview}
      />
    </div>
  )
}
