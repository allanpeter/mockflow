import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Star, Clock, BriefcaseBusiness, Globe, Users, BadgeCheck, Repeat } from 'lucide-react'
import { SlotPicker } from '@/components/booking/slot-picker'
import { IntroVideo } from '@/components/tutors/intro-video'
import { CompaniesList } from '@/components/tutors/companies-list'
import type { Company } from '@/types/supabase'

interface Props {
  params: Promise<Readonly<{ id: string }>>
}

export default async function TutorPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: tutor } = await supabase
    .from('tutor_profiles')
    .select(`
      id,
      bio,
      headline,
      intro_video_url,
      companies,
      languages,
      seniority_levels,
      interview_formats,
      certifications,
      years_experience,
      tech_stack,
      price_per_session,
      offers_free_sessions,
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

  const initials = (profile?.full_name ?? '?')
    .split(' ')
    .map((n: string) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  // Aggregated public stats (completed sessions + learner return rate)
  const { data: stats } = await supabase
    .from('tutor_stats')
    .select('completed_sessions, return_rate')
    .eq('tutor_id', tutor.id)
    .maybeSingle()

  const companies = (tutor.companies ?? []) as Company[]
  const isSuperTutor = !!avgRating && Number(avgRating) >= 4.8 && (stats?.completed_sessions ?? 0) >= 10

  // Fetch available slots (next 4 weeks, not booked)
  const now = new Date()
  const from = now.toISOString()
  const to = new Date(now.getTime() + 28 * 24 * 60 * 60 * 1000).toISOString()

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
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
        {/* Main content */}
        <div className="space-y-8">
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
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold">{profile?.full_name ?? 'Entrevistador'}</h1>
                {isSuperTutor && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand-muted px-2 py-0.5 text-xs font-medium text-accent-foreground">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    Super Tutor
                  </span>
                )}
              </div>
              {tutor.headline && <p className="text-sm text-muted-foreground">{tutor.headline}</p>}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <BriefcaseBusiness className="h-4 w-4" />
                  {tutor.years_experience} {tutor.years_experience === 1 ? 'ano' : 'anos'}
                </span>
                {tutor.languages?.length > 0 && (
                  <span className="flex items-center gap-1">
                    <Globe className="h-4 w-4" />
                    {tutor.languages.join(' · ')}
                  </span>
                )}
                {(stats?.completed_sessions ?? 0) > 0 && (
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {stats?.completed_sessions} entrevistas
                  </span>
                )}
                {(stats?.return_rate ?? 0) > 0 && (
                  <span className="flex items-center gap-1">
                    <Repeat className="h-4 w-4" />
                    {stats?.return_rate}% voltam
                  </span>
                )}
                {avgRating && (
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    {avgRating} ({reviews.length})
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Intro video */}
          {tutor.intro_video_url && (
            <IntroVideo url={tutor.intro_video_url} title={profile?.full_name ?? 'Entrevistador'} />
          )}

          {/* Formats */}
          {tutor.interview_formats?.length > 0 && (
            <div>
              <h2 className="mb-2 font-semibold">Formatos de entrevista</h2>
              <div className="flex flex-wrap gap-2">
                {tutor.interview_formats.map((f: string) => (
                  <Badge key={f}>{f}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Companies */}
          {companies.length > 0 && (
            <div>
              <h2 className="mb-2 font-semibold">Experiência</h2>
              <CompaniesList companies={companies} />
            </div>
          )}

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
                <Badge key={tech} variant="secondary">
                  {tech}
                </Badge>
              ))}
            </div>
          </div>

          {/* Seniority */}
          {tutor.seniority_levels?.length > 0 && (
            <div>
              <h2 className="mb-2 font-semibold">Senioridades que entrevista</h2>
              <div className="flex flex-wrap gap-2">
                {tutor.seniority_levels.map((s: string) => (
                  <Badge key={s} variant="secondary">
                    {s}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {tutor.certifications?.length > 0 && (
            <div>
              <h2 className="mb-2 font-semibold">Certificações</h2>
              <div className="flex flex-wrap gap-2">
                {tutor.certifications.map((c: string) => (
                  <Badge key={c} variant="outline">
                    {c}
                  </Badge>
                ))}
              </div>
            </div>
          )}

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
                        {review.comment && <p className="text-sm text-muted-foreground">{review.comment}</p>}
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Booking card (sticky on desktop) */}
        <aside className="lg:sticky lg:top-20">
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            {tutor.offers_free_sessions ? (
              <>
                <p className="text-2xl font-bold text-primary">Grátis</p>
                <p className="mt-0.5 text-sm font-medium text-primary">
                  Primeira entrevista por nossa conta
                </p>
              </>
            ) : (
              <p className="text-2xl font-bold">
                R$ {tutor.price_per_session.toFixed(2).replace('.', ',')}
                <span className="text-sm font-normal text-muted-foreground"> / sessão</span>
              </p>
            )}
            <p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              60 minutos
            </p>

            <Separator className="my-4" />

            <h2 className="mb-1 font-semibold">Agendar sessão</h2>
            <p className="mb-4 text-sm text-muted-foreground">Escolha um horário disponível</p>
            <SlotPicker
              slots={slots ?? []}
              tutorName={profile?.full_name ?? 'Entrevistador'}
              price={tutor.price_per_session}
              isLoggedIn={!!user}
              isLearner={isLearner}
              isFree={tutor.offers_free_sessions}
            />
          </div>
        </aside>
      </div>
    </div>
  )
}
