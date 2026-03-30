'use client'

import { useState, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { X, ChevronDown } from 'lucide-react'

interface TutorData {
  id: string
  price_per_session: number
  tech_stack: string[]
}

interface FiltersProps {
  tutors: TutorData[]
  selectedTechs: string[]
  setSelectedTechs: (techs: string[]) => void
  selectedPrice: number | null
  setSelectedPrice: (price: number | null) => void
}

const priceRanges = [
  { label: 'Até R$ 100', min: 0, max: 100 },
  { label: 'R$ 100 - 200', min: 100, max: 200 },
  { label: 'R$ 200+', min: 200, max: Infinity },
]

export function TutorFilters({
  tutors,
  selectedTechs,
  setSelectedTechs,
  selectedPrice,
  setSelectedPrice,
}: Readonly<FiltersProps>) {
  const [isOpen, setIsOpen] = useState(true)

  // Get all unique tech stacks
  const allTechs = useMemo(
    () => [...new Set(tutors.flatMap(t => t.tech_stack))].sort((a, b) => a.localeCompare(b)),
    [tutors]
  )

  const toggleTech = (tech: string) => {
    setSelectedTechs(
      selectedTechs.includes(tech)
        ? selectedTechs.filter(t => t !== tech)
        : [...selectedTechs, tech]
    )
  }

  const clearFilters = () => {
    setSelectedTechs([])
    setSelectedPrice(null)
  }

  const hasActiveFilters = selectedTechs.length > 0 || selectedPrice !== null

  return (
    <div className="rounded-lg border bg-card shadow-sm">
      {/* Header with toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-4 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold">Filtros</h3>
          {hasActiveFilters && (
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground font-medium">
              {(selectedTechs.length > 0 ? 1 : 0) + (selectedPrice !== null ? 1 : 0)}
            </span>
          )}
        </div>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? '' : '-rotate-90'}`}
        />
      </button>

      {/* Collapsible content */}
      {isOpen && (
        <div className="border-t px-4 py-3 space-y-4">
            {/* Clear button */}
            {hasActiveFilters && (
              <div className="flex justify-end">
                <Button variant="ghost" size="sm" onClick={clearFilters} className="h-auto px-2 py-1 text-xs">
                  <X className="mr-1 h-3 w-3" />
                  Limpar filtros
                </Button>
              </div>
            )}

            {/* Price Range */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Preço</p>
              <div className="flex flex-wrap gap-2">
                {priceRanges.map((range, idx) => (
                  <Button
                    key={range.label}
                    variant={selectedPrice === idx ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedPrice(selectedPrice === idx ? null : idx)}
                    className="text-xs"
                  >
                    {range.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Tech Stack */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Tecnologias</p>
              <div className="flex flex-wrap gap-2">
                {allTechs.map(tech => (
                  <Badge
                    key={tech}
                    variant={selectedTechs.includes(tech) ? 'default' : 'secondary'}
                    className="cursor-pointer"
                    onClick={() => toggleTech(tech)}
                  >
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>
        </div>
      )}
    </div>
  )
}
