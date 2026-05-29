'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X, ChevronDown } from 'lucide-react'
import { INTERVIEW_FORMATS, SENIORITY_LEVELS, LANGUAGES } from '@/lib/tutor-options'

export type SortKey = 'rating' | 'price_asc' | 'experience'

interface FiltersProps {
  allTechs: string[]
  selectedTechs: string[]
  setSelectedTechs: (techs: string[]) => void
  selectedFormats: string[]
  setSelectedFormats: (v: string[]) => void
  selectedSeniority: string[]
  setSelectedSeniority: (v: string[]) => void
  selectedLanguages: string[]
  setSelectedLanguages: (v: string[]) => void
  companyQuery: string
  setCompanyQuery: (v: string) => void
  selectedPrice: number | null
  setSelectedPrice: (price: number | null) => void
  sortBy: SortKey
  setSortBy: (v: SortKey) => void
}

const priceRanges = [
  { label: 'Até R$ 100' },
  { label: 'R$ 100 - 200' },
  { label: 'R$ 200+' },
]

const sortOptions: { value: SortKey; label: string }[] = [
  { value: 'rating', label: 'Melhor avaliados' },
  { value: 'price_asc', label: 'Menor preço' },
  { value: 'experience', label: 'Mais experientes' },
]

function toggle(value: string, list: string[], set: (v: string[]) => void) {
  set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value])
}

function ChipGroup({
  label,
  options,
  selected,
  onToggle,
}: Readonly<{
  label: string
  options: readonly string[]
  selected: string[]
  onToggle: (v: string) => void
}>) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <Badge
            key={opt}
            variant={selected.includes(opt) ? 'default' : 'secondary'}
            className="cursor-pointer"
            onClick={() => onToggle(opt)}
          >
            {opt}
          </Badge>
        ))}
      </div>
    </div>
  )
}

export function TutorFilters({
  allTechs,
  selectedTechs,
  setSelectedTechs,
  selectedFormats,
  setSelectedFormats,
  selectedSeniority,
  setSelectedSeniority,
  selectedLanguages,
  setSelectedLanguages,
  companyQuery,
  setCompanyQuery,
  selectedPrice,
  setSelectedPrice,
  sortBy,
  setSortBy,
}: Readonly<FiltersProps>) {
  const [isOpen, setIsOpen] = useState(true)

  const activeCount =
    (selectedTechs.length > 0 ? 1 : 0) +
    (selectedFormats.length > 0 ? 1 : 0) +
    (selectedSeniority.length > 0 ? 1 : 0) +
    (selectedLanguages.length > 0 ? 1 : 0) +
    (companyQuery.trim() ? 1 : 0) +
    (selectedPrice !== null ? 1 : 0)

  const clearFilters = () => {
    setSelectedTechs([])
    setSelectedFormats([])
    setSelectedSeniority([])
    setSelectedLanguages([])
    setCompanyQuery('')
    setSelectedPrice(null)
  }

  return (
    <div className="rounded-lg border bg-card shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 p-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-3 transition-colors hover:text-foreground"
        >
          <h3 className="text-sm font-semibold">Filtros</h3>
          {activeCount > 0 && (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-medium text-primary-foreground">
              {activeCount}
            </span>
          )}
          <ChevronDown
            className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? '' : '-rotate-90'}`}
          />
        </button>

        {/* Sort */}
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Ordenar:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
            className="h-9 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            {sortOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Collapsible content */}
      {isOpen && (
        <div className="space-y-4 border-t px-4 py-4">
          {activeCount > 0 && (
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-auto px-2 py-1 text-xs"
              >
                <X className="mr-1 h-3 w-3" />
                Limpar filtros
              </Button>
            </div>
          )}

          {/* Price */}
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Preço</p>
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

          <ChipGroup
            label="Formato"
            options={INTERVIEW_FORMATS}
            selected={selectedFormats}
            onToggle={(v) => toggle(v, selectedFormats, setSelectedFormats)}
          />

          <ChipGroup
            label="Senioridade"
            options={SENIORITY_LEVELS}
            selected={selectedSeniority}
            onToggle={(v) => toggle(v, selectedSeniority, setSelectedSeniority)}
          />

          <ChipGroup
            label="Idioma"
            options={LANGUAGES}
            selected={selectedLanguages}
            onToggle={(v) => toggle(v, selectedLanguages, setSelectedLanguages)}
          />

          {/* Company search */}
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Empresa</p>
            <Input
              value={companyQuery}
              onChange={(e) => setCompanyQuery(e.target.value)}
              placeholder="Ex: Nubank, Google…"
              className="max-w-xs"
            />
          </div>

          {allTechs.length > 0 && (
            <ChipGroup
              label="Tecnologias"
              options={allTechs}
              selected={selectedTechs}
              onToggle={(v) => toggle(v, selectedTechs, setSelectedTechs)}
            />
          )}
        </div>
      )}
    </div>
  )
}
