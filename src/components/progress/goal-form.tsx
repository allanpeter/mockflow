'use client'

import { useActionState } from 'react'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { updateLearnerGoal } from '@/app/actions/update-goal'
import { SENIORITY_LEVELS } from '@/lib/tutor-options'
import type { SeniorityLevel } from '@/types/supabase'

export function GoalForm({ current }: Readonly<{ current: SeniorityLevel | null }>) {
  const [state, action, isPending] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      const result = await updateLearnerGoal(_prev, formData)
      if (result.error) toast.error(result.error)
      else toast.success('Meta atualizada!')
      return result
    },
    null
  )

  return (
    <form action={action} className="flex flex-wrap items-center gap-3">
      {SENIORITY_LEVELS.map((level) => (
        <label
          key={level}
          className="flex cursor-pointer items-center gap-2"
        >
          <input
            type="radio"
            name="goal_seniority"
            value={level}
            defaultChecked={current === level}
            className="sr-only"
          />
          {/* Visual chip — we handle checked state via JS-free CSS trick using peer */}
          <GoalChip level={level} selected={current === level} />
        </label>
      ))}

      {current && (
        <label className="flex cursor-pointer items-center gap-2">
          <input type="radio" name="goal_seniority" value="" defaultChecked={!current} className="sr-only" />
          <span className="rounded-full border px-4 py-1.5 text-sm text-muted-foreground transition-colors hover:border-destructive hover:text-destructive">
            Limpar meta
          </span>
        </label>
      )}

      <Button type="submit" size="sm" disabled={isPending}>
        {isPending && <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />}
        Salvar
      </Button>

      {state?.error && <p className="w-full text-sm text-destructive">{state.error}</p>}
    </form>
  )
}

function GoalChip({ level, selected }: Readonly<{ level: string; selected: boolean }>) {
  return (
    <span
      className="rounded-full border px-4 py-1.5 text-sm font-medium transition-colors"
      style={
        selected
          ? {
              background: 'hsl(var(--primary))',
              color: 'hsl(var(--primary-foreground))',
              borderColor: 'hsl(var(--primary))',
            }
          : undefined
      }
    >
      {level}
    </span>
  )
}
