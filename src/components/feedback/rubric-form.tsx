'use client'

import { useActionState, useState } from 'react'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { submitSessionFeedback, type FeedbackFormState } from '@/app/actions/session-feedback'
import { SENIORITY_LEVELS } from '@/lib/tutor-options'

const initialState: FeedbackFormState = { status: 'idle' }

const dimensions = [
  {
    key: 'score_communication',
    label: 'Comunicação',
    description: 'Clareza ao explicar o raciocínio, linguagem adequada, objetividade',
  },
  {
    key: 'score_technical',
    label: 'Conhecimento técnico',
    description: 'Domínio das tecnologias, precisão nas respostas, profundidade conceitual',
  },
  {
    key: 'score_architecture',
    label: 'Arquitetura / System Design',
    description: 'Capacidade de projetar soluções escaláveis e raciocinar sobre trade-offs',
  },
  {
    key: 'score_problem_solving',
    label: 'Resolução de problemas',
    description: 'Abordagem estruturada, decomposição do problema, criatividade',
  },
  {
    key: 'score_soft_skills',
    label: 'Soft skills',
    description: 'Postura profissional, colaboração, empatia, gestão de pressão',
  },
  {
    key: 'score_maturity',
    label: 'Maturidade profissional',
    description: 'Autonomia, senso de responsabilidade, nível de senioridade percebido',
  },
] as const

const scoreLabels: Record<number, string> = {
  1: 'Muito abaixo do esperado',
  2: 'Abaixo do esperado',
  3: 'Dentro do esperado',
  4: 'Acima do esperado',
  5: 'Excepcional',
}

function DimensionRating({
  name,
  value,
  onChange,
}: Readonly<{ name: string; value: number; onChange: (v: number) => void }>) {
  const [hovered, setHovered] = useState(0)
  const active = hovered || value

  return (
    <>
      <input type="hidden" name={name} value={value || ''} />
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onChange(value === s ? 0 : s)}
            onMouseEnter={() => setHovered(s)}
            onMouseLeave={() => setHovered(0)}
            aria-label={scoreLabels[s]}
            className="flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            style={{
              background: s <= active ? 'hsl(var(--primary))' : undefined,
              color: s <= active ? 'hsl(var(--primary-foreground))' : undefined,
              borderColor: s <= active ? 'hsl(var(--primary))' : undefined,
            }}
          >
            {s}
          </button>
        ))}
        {active > 0 && (
          <span className="ml-2 text-xs text-muted-foreground">{scoreLabels[active]}</span>
        )}
      </div>
    </>
  )
}

export function RubricForm({ sessionId }: Readonly<{ sessionId: string }>) {
  const [scores, setScores] = useState<Record<string, number>>({})
  const [seniority, setSeniority] = useState('')

  const [state, action, isPending] = useActionState(
    async (prev: FeedbackFormState, formData: FormData) => {
      const result = await submitSessionFeedback(prev, formData)
      if (result.status === 'server_error') toast.error(result.message)
      return result
    },
    initialState
  )

  const errors = state.status === 'error' ? state.errors : {}

  const setScore = (key: string, v: number) =>
    setScores((prev) => ({ ...prev, [key]: v }))

  return (
    <form action={action} className="space-y-8">
      <input type="hidden" name="session_id" value={sessionId} />

      {/* Rubric */}
      <div className="space-y-6">
        <h2 className="font-semibold text-lg">Rubrica de avaliação</h2>
        <p className="text-sm text-muted-foreground -mt-4">
          Avalie cada dimensão de 1 a 5. Todas são opcionais — preencha apenas o que é aplicável ao formato da sessão.
        </p>

        {dimensions.map((dim) => (
          <div key={dim.key} className="space-y-1.5">
            <Label className="text-sm font-medium">{dim.label}</Label>
            <p className="text-xs text-muted-foreground">{dim.description}</p>
            <DimensionRating
              name={dim.key}
              value={scores[dim.key] ?? 0}
              onChange={(v) => setScore(dim.key, v)}
            />
          </div>
        ))}
      </div>

      {/* Senioridade estimada */}
      <div className="space-y-2">
        <Label htmlFor="estimated_seniority">Senioridade estimada</Label>
        <p className="text-xs text-muted-foreground">Com base nesta sessão, qual nível o candidato demonstrou?</p>
        <div className="flex flex-wrap gap-2">
          {SENIORITY_LEVELS.map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setSeniority(seniority === level ? '' : level)}
              className="rounded-full border px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              style={
                seniority === level
                  ? {
                      background: 'hsl(var(--primary))',
                      color: 'hsl(var(--primary-foreground))',
                      borderColor: 'hsl(var(--primary))',
                    }
                  : undefined
              }
            >
              {level}
            </button>
          ))}
        </div>
        <input type="hidden" name="estimated_seniority" value={seniority} />
      </div>

      {/* O que foi bem */}
      <div className="space-y-2">
        <Label htmlFor="what_went_well">O que foi bem</Label>
        <Textarea
          id="what_went_well"
          name="what_went_well"
          rows={3}
          maxLength={2000}
          placeholder="Pontos fortes que o candidato demonstrou…"
          aria-invalid={!!errors.what_went_well}
        />
        {errors.what_went_well && (
          <p className="text-sm text-destructive">{errors.what_went_well[0]}</p>
        )}
      </div>

      {/* O que melhorar */}
      <div className="space-y-2">
        <Label htmlFor="what_to_improve">O que melhorar</Label>
        <Textarea
          id="what_to_improve"
          name="what_to_improve"
          rows={3}
          maxLength={2000}
          placeholder="Áreas com maior espaço para crescimento…"
          aria-invalid={!!errors.what_to_improve}
        />
        {errors.what_to_improve && (
          <p className="text-sm text-destructive">{errors.what_to_improve[0]}</p>
        )}
      </div>

      {/* Plano de evolução */}
      <div className="space-y-2">
        <Label htmlFor="evolution_plan">Plano de evolução</Label>
        <p className="text-xs text-muted-foreground">
          Próximos passos concretos e acionáveis para o candidato avançar na carreira.
        </p>
        <Textarea
          id="evolution_plan"
          name="evolution_plan"
          rows={4}
          maxLength={2000}
          placeholder="Ex: Estudar design de sistemas distribuídos (Designing Data-Intensive Applications), praticar comunicação estruturando respostas com STAR, revisitar fundamentos de concorrência…"
          aria-invalid={!!errors.evolution_plan}
        />
        {errors.evolution_plan && (
          <p className="text-sm text-destructive">{errors.evolution_plan[0]}</p>
        )}
      </div>

      {state.status === 'server_error' && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
          {state.message}
        </p>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending} className="flex-1">
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isPending ? 'Enviando…' : 'Enviar feedback'}
        </Button>
        <Button
          type="button"
          variant="outline"
          nativeButton={false}
          render={<a href="/agenda" aria-label="Cancelar e voltar" />}
        >
          Cancelar
        </Button>
      </div>
    </form>
  )
}
