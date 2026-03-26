import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Star, Clock, BriefcaseBusiness } from 'lucide-react'
import { SlotPicker } from '@/components/booking/slot-picker'

interface Props {
  params: Promise<Readonly<{ id: string }>>
}

export default async function TutorPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: tutor } = await supabase
    .from('tutor_profiles')
    .select(`
      id,
      bio,
      years_experience,
      tech_stack,
      price_per_session,
      is_active,
      profiles ( full_name, avatar_url ),
      reviews ( rating, comment, created_at, profiles ( full_name, avatar_url ) )
    `)
    .eq('id', id)
    .single()

  if (!tutor?.is_active) notFound()

  const profile = tutor.profiles as unknown as { full_name: string; avatar_url: string | null }
  const reviews = tutor.reviews as unknown as {
    rating: number
    comment: string | null
    created_at: string
    profiles: { full_name: string; avatar_url: string | null }
  }[]

  const avgRating = reviews?.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null

  const initials = (profile?.full_name ?? '?').split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()

  // Fetch available slots (next 4 weeks, not booked)
  const from = new Date().toISOString()
  const to = new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString()

  const { data: slots } = await supabase
    .from('availability_slots')
    .select('id, starts_at, ends_at')
    .eq('tutor_id', tutor.id)
    .eq('is_booked', false)
    .gte('starts_at', from)
    .lte('starts_at', to)
    .order('starts_at')

  // Check if current user is a learner
  let isLearner = false
  if (user) {
    const { data: p } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single<{ role: string }>()
    isLearner = p?.role === 'learner'
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-10">
      {/* Header */}
      <div className="flex items-start gap-5">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-muted">
          {profile?.avatar_url ? (
            <Image src={profile.avatar_url} alt={profile.full_name ?? ''} fill className="object-cover" sizes="80px" />
          ) : (
            <span className="flex h-full items-center justify-center text-xl font-semibold text-muted-foreground">
              {initials}
            </span>
          )}
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">{profile?.full_name ?? 'Entrevistador'}</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <BriefcaseBusiness className="h-4 w-4" />
              {tutor.years_experience} {tutor.years_experience === 1 ? 'ano' : 'anos'} de experiência
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              60 min por sessão
            </span>
            {avgRating && (
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                {avgRating} ({reviews.length} {reviews.length === 1 ? 'avaliação' : 'avaliações'})
              </span>
            )}
          </div>
          <p className="text-lg font-semibold">
            R$ {tutor.price_per_session.toFixed(2).replace('.', ',')}
            <span className="text-sm font-normal text-muted-foreground"> / sessão</span>
          </p>
        </div>
      </div>

      <Separator />

      {/* Bio */}
      <div>
        <h2 className="mb-2 font-semibold">Sobre</h2>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{tutor.bio}</p>
      </div>

      {/* Stack */}
      <div>
        <h2 className="mb-2 font-semibold">Stack</h2>
        <div className="flex flex-wrap gap-2">
          {tutor.tech_stack.map((tech: string) => (
            <Badge key={tech} variant="secondary">{tech}</Badge>
          ))}
        </div>
      </div>

      <Separator />

      {/* Slot picker */}
      <div>
        <h2 className="mb-1 font-semibold">Agendar sessão</h2>
        <p className="mb-4 text-sm text-muted-foreground">Escolha um horário disponível</p>
        <SlotPicker
          slots={slots ?? []}
          tutorName={profile?.full_name ?? 'Entrevistador'}
          price={tutor.price_per_session}
          isLoggedIn={!!user}
          isLearner={isLearner}
        />
      </div>

      {/* Reviews */}
      {reviews.length > 0 && (
        <>
          <Separator />
          <div>
            <h2 className="mb-4 font-semibold">Avaliações</h2>
            <div className="space-y-4">
              {reviews.map((review) => {
                const rProfile = review.profiles as unknown as { full_name: string }
                return (
                  <div key={review.created_at} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{rProfile?.full_name ?? 'Candidato'}</p>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`h-3.5 w-3.5 ${s <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-muted'}`}
                          />
                        ))}
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-muted-foreground">{review.comment}</p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
