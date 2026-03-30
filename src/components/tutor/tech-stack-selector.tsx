'use client'

import { useState } from 'react'
import { TECH_STACK } from '@/lib/tech-stack'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

interface Props {
  value: string[]
  onChange: (techs: string[]) => void
  error?: string
}

const MAX_TECHS = 15

export function TechStackSelector({ value, onChange, error }: Readonly<Props>) {
  const [search, setSearch] = useState('')

  const toggleTech = (tech: string) => {
    if (value.includes(tech)) {
      onChange(value.filter(t => t !== tech))
    } else if (value.length < MAX_TECHS) {
      onChange([...value, tech])
    }
  }

  const filteredTechs = Object.entries(TECH_STACK).map(([category, techs]) => ({
    category,
    techs: techs.filter(t => t.toLowerCase().includes(search.toLowerCase())),
  }))

  return (
    <div className="space-y-4">
      {/* Search input */}
      <Input
        placeholder="Procurar tecnologia..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className={error ? 'border-destructive' : ''}
      />

      {/* Selected badges */}
      {value.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Selecionadas ({value.length}/{MAX_TECHS})</p>
          <div className="flex flex-wrap gap-2">
            {value.map(tech => (
              <Badge
                key={tech}
                variant="default"
                className="cursor-pointer"
                onClick={() => toggleTech(tech)}
              >
                {tech} ✕
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Categories */}
      <div className="space-y-4">
        {filteredTechs.map(({ category, techs }) =>
          techs.length > 0 ? (
            <div key={category} className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {category}
              </p>
              <div className="flex flex-wrap gap-2">
                {techs.map(tech => (
                  <Badge
                    key={tech}
                    variant={value.includes(tech) ? 'default' : 'secondary'}
                    className="cursor-pointer"
                    onClick={() => toggleTech(tech)}
                  >
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>
          ) : null
        )}
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  )
}
