import { TrendingUp, ThumbsUp, Target, Lightbulb } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import type { SessionFeedbackRow } from '@/types/supabase'

const dimensions: { key: keyof SessionFeedbackRow; label: string }[] = [
  { key: 'score_communication',    label: 'Comunicação' },
  { key: 'score_technical',        label: 'Conhecimento técnico' },
  { key: 'score_architecture',     label: 'Arquitetura / System Design' },
  { key: 'score_problem_solving',  label: 'Resolução de problemas' },
  { key: 'score_soft_skills',      label: 'Soft skills' },
  { key: 'score_maturity',         label: 'Maturidade profissional' },
]

const scoreLabels: Record<number, string> = {
  1: 'Muito abaixo do esperado',
  2: 'Abaixo do esperado',
  3: 'Dentro do esperado',
  4: 'Acima do esperado',
  5: 'Excepcional',
}

const scoreColor = (score: number): string => {
  if (score <= 2) return 'text-destructive'
  if (score === 3) return 'text-warning-foreground'
  return 'text-success'
}

function ScoreBar({ score }: Readonly<{ score: number }>) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${(score / 5) * 100}%` }}
        />
      </div>
      <span className={`shrink-0 text-sm font-bold tabular-nums ${scoreColor(score)}`}>
        {score}/5
      </span>
    </div>
  )
}

export function FeedbackDisplay({ feedback }: Readonly<{ feedback: SessionFeedbackRow }>) {
  const scored = dimensions.filter((d) => feedback[d.key] != null)
  const avgScore =
    scored.length > 0
      ? scored.reduce((sum, d) => sum + (feedback[d.key] as number), 0) / scored.length
      : null

  return (
    <div className="space-y-8">
      {/* Summary */}
      {(avgScore !== null || feedback.estimated_seniority) && (
        <div className="flex flex-wrap items-center gap-4 rounded-xl border bg-brand-muted p-5">
          {avgScore !== null && (
            <div className="space-y-0.5">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Média geral</p>
              <p className="text-3xl font-bold text-primary">{avgScore.toFixed(1)}<span className="text-lg font-normal">/5</span></p>
              <p className="text-xs text-muted-foreground">{scoreLabels[Math.round(avgScore)]}</p>
            </div>
          )}
          {feedback.estimated_seniority && (
            <div className="space-y-0.5">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Senioridade percebida</p>
              <p className="text-2xl font-bold">{feedback.estimated_seniority}</p>
            </div>
          )}
        </div>
      )}

      {/* Rubric */}
      {scored.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold">Avaliação por dimensão</h3>
          <div className="space-y-4">
            {scored.map((dim) => {
              const score = feedback[dim.key] as number
              return (
                <div key={dim.key} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{dim.label}</span>
                    <span className="text-xs text-muted-foreground">{scoreLabels[score]}</span>
                  </div>
                  <ScoreBar score={score} />
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Text blocks */}
      {(feedback.what_went_well || feedback.what_to_improve || feedback.evolution_plan) && (
        <Separator />
      )}

      {feedback.what_went_well && (
        <div className="space-y-2">
          <h3 className="flex items-center gap-2 font-semibold">
            <ThumbsUp className="h-4 w-4 text-success" />
            O que foi bem
          </h3>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
            {feedback.what_went_well}
          </p>
        </div>
      )}

      {feedback.what_to_improve && (
        <div className="space-y-2">
          <h3 className="flex items-center gap-2 font-semibold">
            <Target className="h-4 w-4 text-warning-foreground" />
            O que melhorar
          </h3>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
            {feedback.what_to_improve}
          </p>
        </div>
      )}

      {feedback.evolution_plan && (
        <div className="space-y-2 rounded-xl border border-primary/20 bg-brand-muted p-5">
          <h3 className="flex items-center gap-2 font-semibold">
            <Lightbulb className="h-4 w-4 text-primary" />
            Plano de evolução
          </h3>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
            {feedback.evolution_plan}
          </p>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Feedback enviado em {new Date(feedback.created_at).toLocaleDateString('pt-BR', {
          day: '2-digit', month: 'long', year: 'numeric',
        })}
      </p>
    </div>
  )
}

// Teaser shown on the agenda when feedback exists but hasn't been opened yet
export function FeedbackTeaser() {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-brand-muted px-3 py-2">
      <TrendingUp className="h-4 w-4 text-primary" />
      <span className="text-sm font-medium text-primary">Feedback disponível</span>
    </div>
  )
}
