'use client'

import { useState, type KeyboardEvent } from 'react'
import { X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

const SUGGESTIONS = [
  'TypeScript', 'JavaScript', 'React', 'Next.js', 'Node.js', 'Python',
  'Java', 'Go', 'Rust', 'C#', 'PHP', 'Ruby', 'Vue.js', 'Angular',
  'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Docker', 'AWS', 'GCP',
  'Kubernetes', 'GraphQL', 'REST', 'Spring Boot', 'Django', 'FastAPI',
]

interface Props {
  value: string[]
  onChange: (value: string[]) => void
  error?: string
}

export function TechStackInput({ value, onChange, error }: Readonly<Props>) {
  const [input, setInput] = useState('')

  const filtered = SUGGESTIONS.filter(
    (s) =>
      input.length > 0 &&
      s.toLowerCase().includes(input.toLowerCase()) &&
      !value.includes(s)
  ).slice(0, 6)

  function add(tag: string) {
    const clean = tag.trim()
    if (!clean || value.includes(clean) || value.length >= 10) return
    onChange([...value, clean])
    setInput('')
  }

  function remove(tag: string) {
    onChange(value.filter((t) => t !== tag))
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault()
      add(input)
    }
    if (e.key === 'Backspace' && !input && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  return (
    <div className="space-y-2">
      {/* Hidden inputs for form submission */}
      {value.map((tag) => (
        <input key={tag} type="hidden" name="tech_stack" value={tag} />
      ))}

      <div
        className={`flex min-h-10 flex-wrap gap-1.5 rounded-lg border px-3 py-2 focus-within:ring-2 focus-within:ring-ring/50 ${
          error ? 'border-destructive' : 'border-input'
        }`}
      >
        {value.map((tag) => (
          <Badge key={tag} variant="secondary" className="gap-1 pr-1">
            {tag}
            <button
              type="button"
              onClick={() => remove(tag)}
              className="rounded hover:text-destructive"
              aria-label={`Remover ${tag}`}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={value.length === 0 ? 'Ex: TypeScript, React…' : ''}
          className="min-w-24 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>

      {/* Autocomplete suggestions */}
      {filtered.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {filtered.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => add(s)}
              className="rounded-full border border-dashed px-2 py-0.5 text-xs text-muted-foreground hover:border-primary hover:text-primary"
            >
              + {s}
            </button>
          ))}
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
      <p className="text-xs text-muted-foreground">
        Pressione Enter ou vírgula para adicionar. Máximo 10.
      </p>
    </div>
  )
}
