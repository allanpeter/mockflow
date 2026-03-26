import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Star } from 'lucide-react'

export default async function TutorsPage() {
  const supabase = await createClient()

  const { data: tutors } = await supabase
    .from('tutor_profiles')
    .select(`
      id,
      bio,
      years_experience,
      tech_stack,
      price_per_session,
      profiles ( full_name, avatar_url ),
      reviews ( rating )
    `)
    .eq('is_active', true)
    .order('created_at')

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-10">
      <div>
        <h1 className="text-3xl font-bold">Entrevistadores</h1>
        <p className="mt-1 text-muted-foreground">
          Profissionais disponíveis para mock interviews
        </p>
      </div>

      {!tutors?.length && (
        <p className="text-muted-foreground">
          Nenhum entrevistador disponível no momento. Volte em breve!
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tutors?.map((tutor) => {
          const profile = tutor.profiles as unknown as { full_name: string; avatar_url: string | null }
          const reviews = tutor.reviews as unknown as { rating: number }[]
          const avgRating = reviews?.length
            ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
            : null

          const initials = (profile?.full_name ?? '?')
            .split(' ')
            .map((n: string) => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase()

          return (
            <Link
              key={tutor.id}
              href={`/tutors/${tutor.id}`}
              className="group flex flex-col rounded-xl border bg-card p-5 transition-shadow hover:shadow-md"
            >
              {/* Avatar + name */}
              <div className="flex items-center gap-3">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-muted">
                  {profile?.avatar_url ? (
                    <Image
                      src={profile.avatar_url}
                      alt={profile.full_name}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  ) : (
                    <span className="flex h-full items-center justify-center text-sm font-semibold text-muted-foreground">
                      {initials}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold">{profile?.full_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {tutor.years_experience} {tutor.years_experience === 1 ? 'ano' : 'anos'} de exp.
                  </p>
                </div>
              </div>

              {/* Rating */}
              {avgRating && (
                <div className="mt-3 flex items-center gap-1 text-sm">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span className="font-medium">{avgRating}</span>
                  <span className="text-muted-foreground">({reviews.length})</span>
                </div>
              )}

              {/* Bio */}
              <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{tutor.bio}</p>

              {/* Stack */}
              <div className="mt-3 flex flex-wrap gap-1">
                {tutor.tech_stack.slice(0, 4).map((tech: string) => (
                  <Badge key={tech} variant="secondary" className="text-xs">
                    {tech}
                  </Badge>
                ))}
                {tutor.tech_stack.length > 4 && (
                  <Badge variant="secondary" className="text-xs">
                    +{tutor.tech_stack.length - 4}
                  </Badge>
                )}
              </div>

              {/* Price */}
              <div className="mt-4 flex items-center justify-between">
                <p className="font-semibold">
                  R$ {tutor.price_per_session.toFixed(2).replace('.', ',')}
                  <span className="text-xs font-normal text-muted-foreground"> / sessão</span>
                </p>
                <Button size="sm" className="pointer-events-none group-hover:bg-primary/90">
                  Ver perfil
                </Button>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
