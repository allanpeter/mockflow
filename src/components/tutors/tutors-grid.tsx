'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Star } from 'lucide-react'
import { TutorFilters } from './filters'

interface TutorCard {
  id: string
  bio: string
  years_experience: number
  tech_stack: string[]
  price_per_session: number
  profiles: { full_name: string; avatar_url: string | null }
  reviews: { rating: number }[]
}

interface Props {
  tutors: TutorCard[]
}

interface FilteredTutor {
  id: string
  price_per_session: number
  tech_stack: string[]
}

export function TutorsGrid({ tutors }: Readonly<Props>) {
  const [selectedTechs, setSelectedTechs] = useState<string[]>([])
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null)

  const priceRanges = [
    { min: 0, max: 100 },
    { min: 100, max: 200 },
    { min: 200, max: Infinity },
  ]

  // Calculate filtered tutors directly without useState
  const filtered = tutors.filter(tutor => {
    const matchesTech = selectedTechs.length === 0 || selectedTechs.some(tech => tutor.tech_stack.includes(tech))
    const matchesPrice = selectedPrice === null || (
      tutor.price_per_session >= priceRanges[selectedPrice].min &&
      tutor.price_per_session <= priceRanges[selectedPrice].max
    )
    return matchesTech && matchesPrice
  })

  return (
    <div className="space-y-6">
      {/* Filters topbar */}
      <TutorFilters
        tutors={tutors.map(t => ({
          id: t.id,
          price_per_session: t.price_per_session,
          tech_stack: t.tech_stack,
        }))}
        selectedTechs={selectedTechs}
        setSelectedTechs={setSelectedTechs}
        selectedPrice={selectedPrice}
        setSelectedPrice={setSelectedPrice}
      />

      {/* Tutors grid */}
      <div>
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed p-10 text-center">
            <p className="text-muted-foreground">Nenhum entrevistador encontrado com esses filtros.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {filtered.map((tutor) => {
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
                  className="group flex flex-col rounded-xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
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
        )}
      </div>
    </div>
  )
}
