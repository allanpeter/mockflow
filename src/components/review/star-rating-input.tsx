'use client'

import { useActionState, useState } from 'react'
import { Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

const labels: Record<number, string> = {
  1: 'Muito ruim',
  2: 'Ruim',
  3: 'Regular',
  4: 'Bom',
  5: 'Excelente',
}

interface Props {
  sessionId: string
  tutorId: string
  action: (prev: unknown, formData: FormData) => Promise<{ error: string }>
}

export function StarRatingInput({ sessionId, tutorId, action }: Readonly<Props>) {
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [state, formAction, pending] = useActionState(action, null)

  const active = hovered || rating

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="sessionId" value={sessionId} />
      <input type="hidden" name="tutorId" value={tutorId} />
      <input type="hidden" name="rating" value={rating} />

      {/* Stars */}
      <div className="space-y-2">
        <Label>Sua nota</Label>
        <fieldset className="flex gap-1 border-0 m-0 p-0" aria-label="Avaliação de 1 a 5 estrelas">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setRating(s)}
              onMouseEnter={() => setHovered(s)}
              onMouseLeave={() => setHovered(0)}
              aria-label={`${s} estrela${s > 1 ? 's' : ''}`}
              className="rounded p-0.5 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Star
                className={`h-8 w-8 transition-colors ${
                  s <= active
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-muted-foreground/30'
                }`}
              />
            </button>
          ))}
        </fieldset>
        {active > 0 && (
          <p className="text-sm text-muted-foreground">{labels[active]}</p>
        )}
      </div>

      {/* Comment */}
      <div className="space-y-1.5">
        <Label htmlFor="comment">Comentário <span className="text-muted-foreground font-normal">(opcional)</span></Label>
        <Textarea
          id="comment"
          name="comment"
          placeholder="Descreva sua experiência: qualidade do feedback, domínio técnico, clareza na comunicação..."
          rows={4}
          maxLength={1000}
        />
        <p className="text-xs text-muted-foreground">Máximo de 1000 caracteres. Seu comentário ficará público no perfil do entrevistador.</p>
      </div>

      {state?.error && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
          {state.error}
        </p>
      )}

      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={rating === 0 || pending}
          className="flex-1"
        >
          {pending ? 'Enviando…' : 'Enviar avaliação'}
        </Button>
        <Button type="button" variant="outline" nativeButton={false} render={<a href="/agenda" aria-label="Cancelar e voltar para agenda" />}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
