'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Star, Globe, Users, BadgeCheck, CalendarClock } from 'lucide-react'
import { TutorFilters, type SortKey } from './filters'
import type { Company } from '@/types/supabase'

export interface TutorCard {
  id: string
  bio: string
  headline: string | null
  years_experience: number
  tech_stack: string[]
  price_per_session: number
  languages: string[]
  seniority_levels: string[]
  interview_formats: string[]
  companies: Company[]
  profiles: { full_name: string; avatar_url: string | null }
  reviews: { rating: number }[]
  completed_sessions: number
  return_rate: number
  next_slot: string | null
}

interface Props {
  tutors: TutorCard[]
}

const priceRanges = [
  { min: 0, max: 100 },
  { min: 100, max: 200 },
  { min: 200, max: Infinity },
]

function avg(reviews: { rating: number }[]): number {
  return reviews?.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0
}

const slotFormatter = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'short',
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
})

export function TutorsGrid({ tutors }: Readonly<Props>) {
  const [selectedTechs, setSelectedTechs] = useState<string[]>([])
  const [selectedFormats, setSelectedFormats] = useState<string[]>([])
  const [selectedSeniority, setSelectedSeniority] = useState<string[]>([])
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([])
  const [companyQuery, setCompanyQuery] = useState('')
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null)
  const [sortBy, setSortBy] = useState<SortKey>('rating')

  const allTechs = useMemo(
    () => [...new Set(tutors.flatMap((t) => t.tech_stack))].sort((a, b) => a.localeCompare(b)),
    [tutors]
  )

  const filtered = useMemo(() => {
    const matched = tutors.filter((tutor) => {
      const matchesTech =
        selectedTechs.length === 0 || selectedTechs.some((tech) => tutor.tech_stack.includes(tech))
      const matchesFormat =
        selectedFormats.length === 0 ||
        selectedFormats.some((f) => tutor.interview_formats?.includes(f))
      const matchesSeniority =
        selectedSeniority.length === 0 ||
        selectedSeniority.some((s) => tutor.seniority_levels?.includes(s))
      const matchesLanguage =
        selectedLanguages.length === 0 ||
        selectedLanguages.some((l) => tutor.languages?.includes(l))
      const matchesCompany =
        companyQuery.trim() === '' ||
        (tutor.companies ?? []).some((c) =>
          c.name.toLowerCase().includes(companyQuery.trim().toLowerCase())
        )
      const matchesPrice =
        selectedPrice === null ||
        (tutor.price_per_session >= priceRanges[selectedPrice].min &&
          tutor.price_per_session <= priceRanges[selectedPrice].max)
      return (
        matchesTech &&
        matchesFormat &&
        matchesSeniority &&
        matchesLanguage &&
        matchesCompany &&
        matchesPrice
      )
    })

    const sorted = [...matched]
    if (sortBy === 'rating') sorted.sort((a, b) => avg(b.reviews) - avg(a.reviews))
    if (sortBy === 'price_asc') sorted.sort((a, b) => a.price_per_session - b.price_per_session)
    if (sortBy === 'experience') sorted.sort((a, b) => b.years_experience - a.years_experience)
    return sorted
  }, [
    tutors,
    selectedTechs,
    selectedFormats,
    selectedSeniority,
    selectedLanguages,
    companyQuery,
    selectedPrice,
    sortBy,
  ])

  return (
    <div className="space-y-6">
      <TutorFilters
        allTechs={allTechs}
        selectedTechs={selectedTechs}
        setSelectedTechs={setSelectedTechs}
        selectedFormats={selectedFormats}
        setSelectedFormats={setSelectedFormats}
        selectedSeniority={selectedSeniority}
        setSelectedSeniority={setSelectedSeniority}
        selectedLanguages={selectedLanguages}
        setSelectedLanguages={setSelectedLanguages}
        companyQuery={companyQuery}
        setCompanyQuery={setCompanyQuery}
        selectedPrice={selectedPrice}
        setSelectedPrice={setSelectedPrice}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      <p className="text-sm text-muted-foreground">
        {filtered.length} {filtered.length === 1 ? 'entrevistador' : 'entrevistadores'}
      </p>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center">
          <p className="text-muted-foreground">Nenhum entrevistador encontrado com esses filtros.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((tutor) => {
            const rating = avg(tutor.reviews)
            const ratingLabel = rating ? rating.toFixed(1) : null
            const isSuperTutor = rating >= 4.8 && tutor.completed_sessions >= 10
            const currentCompany = (tutor.companies ?? []).find((c) => c.current)
            const subtitle =
              tutor.headline ||
              (currentCompany ? `${currentCompany.role ?? ''} @ ${currentCompany.name}`.trim() : null)

            const initials = (tutor.profiles?.full_name ?? '?')
              .split(' ')
              .map((n) => n[0])
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
                <div className="flex items-start gap-3">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-muted">
                    {tutor.profiles?.avatar_url ? (
                      <Image
                        src={tutor.profiles.avatar_url}
                        alt={tutor.profiles.full_name}
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
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate font-semibold">{tutor.profiles?.full_name}</p>
                      {isSuperTutor && (
                        <BadgeCheck className="h-4 w-4 shrink-0 text-primary" aria-label="Super Tutor" />
                      )}
                    </div>
                    {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
                  </div>
                  {ratingLabel && (
                    <div className="flex shrink-0 items-center gap-1 text-sm">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span className="font-medium">{ratingLabel}</span>
                      <span className="text-muted-foreground">({tutor.reviews.length})</span>
                    </div>
                  )}
                </div>

                {/* Meta line */}
                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span>
                    {tutor.years_experience} {tutor.years_experience === 1 ? 'ano' : 'anos'}
                  </span>
                  {tutor.languages?.length > 0 && (
                    <span className="flex items-center gap-1">
                      <Globe className="h-3.5 w-3.5" />
                      {tutor.languages.join('/')}
                    </span>
                  )}
                  {tutor.completed_sessions > 0 && (
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {tutor.completed_sessions} entrevistas
                    </span>
                  )}
                </div>

                {/* Formats */}
                {tutor.interview_formats?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {tutor.interview_formats.slice(0, 3).map((f) => (
                      <Badge key={f} variant="secondary" className="text-xs">
                        {f}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Bio */}
                <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{tutor.bio}</p>

                {/* Next slot */}
                {tutor.next_slot && (
                  <p className="mt-3 flex items-center gap-1 text-xs text-success">
                    <CalendarClock className="h-3.5 w-3.5" />
                    Próx. horário: {slotFormatter.format(new Date(tutor.next_slot))}
                  </p>
                )}

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
  )
}
