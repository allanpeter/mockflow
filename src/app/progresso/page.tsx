import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { GoalForm } from '@/components/progress/goal-form'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  CalendarDays,
  Award,
  ChevronRight,
} from 'lucide-react'
import type { SessionFeedbackRow, SeniorityLevel } from '@/types/supabase'

// Dimension definitions — same order as rubric-form and feedback-display
const DIMENSIONS: { key: keyof SessionFeedbackRow; label: string; short: string }[] = [
  { key: 'score_communication',   label: 'Comunicação',              short: 'Comunic.' },
  { key: 'score_technical',       label: 'Conhecimento técnico',     short: 'Técnico' },
  { key: 'score_architecture',    label: 'Arquitetura / Sys. Design', short: 'Arq.' },
  { key: 'score_problem_solving', label: 'Resolução de problemas',   short: 'Resolução' },
  { key: 'score_soft_skills',     label: 'Soft skills',              short: 'Soft sk.' },
  { key: 'score_maturity',        label: 'Maturidade profissional',  short: 'Maturidade' },
]

const SENIORITY_ORDER: SeniorityLevel[] = ['Júnior', 'Pleno', 'Sênior', 'Staff+']

// Colour helpers
const barColor = (score: number) =>
  score >= 4 ? 'bg-success' : score === 3 ? 'bg-warning' : 'bg-destructive'

const textColor = (score: number) =>
  score >= 4 ? 'text-success' : score === 3 ? 'text-warning-foreground' : 'text-destructive'

export default async function ProgressoPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirectedFrom=/progresso')

  const [{ data: profile }, { data: rawFeedback }] = await Promise.all([
    supabase
      .from('profiles')
      .select('role, full_name, goal_seniority')
      .eq('id', user.id)
      .maybeSingle<{ role: string; full_name: string; goal_seniority: SeniorityLevel | null }>(),
    supabase
      .from('session_feedback')
      .select('*')
      .eq('learner_id', user.id)
      .order('created_at', { ascending: true }),
  ])

  if (profile?.role === 'tutor') redirect('/dashboard')

  const feedbacks = (rawFeedback ?? []) as SessionFeedbackRow[]

  // Fetch session dates + tutor names
  const sessionIds = feedbacks.map((f) => f.session_id)
  let sessionMeta: Record<string, { starts_at: string; tutorName: string }> = {}

  if (sessionIds.length > 0) {
    const { data: sessionRows } = await supabase
      .from('sessions')
      .select('id, starts_at, booking_id')
      .in('id', sessionIds)

    const bookingIds = (sessionRows ?? []).map((s) => s.booking_id)
    const { data: bookingRows } = await supabase
      .from('bookings')
      .select('id, tutor_profiles ( profiles ( full_name ) )')
      .in('id', bookingIds)

    const tutorByBooking: Record<string, string> = {}
    for (const b of bookingRows ?? []) {
      const tp = (b.tutor_profiles as unknown) as { profiles: { full_name: string } } | null
      tutorByBooking[b.id] = tp?.profiles?.full_name ?? 'Entrevistador'
    }

    for (const s of sessionRows ?? []) {
      sessionMeta[s.id] = {
        starts_at: s.starts_at,
        tutorName: tutorByBooking[s.booking_id] ?? 'Entrevistador',
      }
    }
  }

  // Per-session average score
  const sessionAvgs = feedbacks.map((f) => {
    const scores = DIMENSIONS.map((d) => f[d.key] as number | null).filter((v) => v != null) as number[]
    return scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null
  })

  // Overall average (across all sessions)
  const allAvgs = sessionAvgs.filter((v) => v != null) as number[]
  const overallAvg = allAvgs.length > 0 ? allAvgs.reduce((a, b) => a + b, 0) / allAvgs.length : null

  // Per-dimension: first score, last score, delta
  const dimStats = DIMENSIONS.map((dim) => {
    const scores = feedbacks
      .map((f) => f[dim.key] as number | null)
      .filter((v) => v != null) as number[]
    if (scores.length === 0) return { ...dim, first: null, last: null, delta: 0, count: 0 }
    return {
      ...dim,
      first: scores[0],
      last: scores[scores.length - 1],
      delta: scores[scores.length - 1] - scores[0],
      count: scores.length,
    }
  })

  // Latest seniority estimate
  const latestSeniority = [...feedbacks].reverse().find((f) => f.estimated_seniority)?.estimated_seniority ?? null
  const goalSeniority = profile?.goal_seniority ?? null

  // Goal progress index
  const latestIdx = latestSeniority ? SENIORITY_ORDER.indexOf(latestSeniority) : -1
  const goalIdx = goalSeniority ? SENIORITY_ORDER.indexOf(goalSeniority) : -1
  const goalReached = latestIdx >= goalIdx && goalIdx >= 0

  return (
    <div className="mx-auto max-w-3xl space-y-10 px-4 py-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Meu Progresso</h1>
        <p className="mt-0.5 text-muted-foreground">
          Acompanhe sua evolução ao longo das sessões de mock interview.
        </p>
      </div>

      {feedbacks.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border bg-card p-5 space-y-1">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Sessões avaliadas</p>
              <p className="text-3xl font-bold">{feedbacks.length}</p>
            </div>
            {overallAvg !== null && (
              <div className="rounded-xl border bg-card p-5 space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Média geral</p>
                <p className={`text-3xl font-bold ${textColor(Math.round(overallAvg))}`}>
                  {overallAvg.toFixed(1)}
                  <span className="text-base font-normal text-muted-foreground">/5</span>
                </p>
              </div>
            )}
            {latestSeniority && (
              <div className="rounded-xl border bg-card p-5 space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Senioridade atual</p>
                <p className="text-2xl font-bold">{latestSeniority}</p>
              </div>
            )}
          </div>

          {/* Goal */}
          <div className="space-y-4 rounded-xl border bg-card p-6">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">Minha meta</h2>
              {goalReached && (
                <Badge className="bg-success text-success-foreground">Meta atingida!</Badge>
              )}
            </div>
            <GoalForm current={goalSeniority} />
            {goalSeniority && latestSeniority && !goalReached && (
              <GoalProgressBar
                current={latestSeniority}
                goal={goalSeniority}
                levels={SENIORITY_ORDER}
              />
            )}
          </div>

          {/* Dimension evolution */}
          <div className="space-y-4">
            <h2 className="font-semibold">Evolução por dimensão</h2>
            <p className="text-sm text-muted-foreground -mt-2">
              Comparação entre a primeira e a última sessão avaliada em cada dimensão.
            </p>
            <div className="space-y-5">
              {dimStats
                .filter((d) => d.count > 0)
                .map((dim) => (
                  <DimensionRow key={dim.key} dim={dim} />
                ))}
            </div>
            {dimStats.every((d) => d.count === 0) && (
              <p className="text-sm text-muted-foreground">Nenhuma dimensão avaliada ainda.</p>
            )}
          </div>

          <Separator />

          {/* Session timeline */}
          <div className="space-y-4">
            <h2 className="font-semibold">Histórico de sessões</h2>
            <div className="space-y-3">
              {[...feedbacks].reverse().map((feedback, revIdx) => {
                const idx = feedbacks.length - 1 - revIdx
                const meta = sessionMeta[feedback.session_id]
                const avg = sessionAvgs[idx]
                const date = meta?.starts_at
                  ? new Date(meta.starts_at).toLocaleDateString('pt-BR', {
                      day: '2-digit', month: 'short', year: 'numeric',
                    })
                  : '—'

                return (
                  <Link
                    key={feedback.session_id}
                    href={`/agenda/${feedback.session_id}/feedback-view`}
                    className="group flex items-center gap-4 rounded-xl border bg-card p-4 transition-shadow hover:shadow-md"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-brand-muted text-sm font-bold text-primary">
                      {feedbacks.length - revIdx}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{meta?.tutorName ?? 'Entrevistador'}</p>
                        {feedback.estimated_seniority && (
                          <Badge variant="secondary">{feedback.estimated_seniority}</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        <CalendarDays className="mr-1 inline h-3 w-3" />
                        {date}
                      </p>
                    </div>
                    {avg !== null && (
                      <div className={`shrink-0 text-lg font-bold tabular-nums ${textColor(Math.round(avg))}`}>
                        {avg.toFixed(1)}
                        <span className="text-xs font-normal text-muted-foreground">/5</span>
                      </div>
                    )}
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </Link>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ---------- sub-components ----------

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed p-10 text-center space-y-4">
      <Award className="mx-auto h-10 w-10 text-muted-foreground/40" />
      <div>
        <p className="font-medium">Nenhum feedback ainda</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Agende uma sessão e peça ao entrevistador para preencher o feedback estruturado. Seu progresso aparecerá aqui.
        </p>
      </div>
      <Button render={<Link href="/tutors" />}>Ver entrevistadores</Button>
    </div>
  )
}

function GoalProgressBar({
  current,
  goal,
  levels,
}: Readonly<{ current: SeniorityLevel; goal: SeniorityLevel; levels: readonly SeniorityLevel[] }>) {
  const currentIdx = levels.indexOf(current)
  const goalIdx = levels.indexOf(goal)
  const pct = Math.min(100, Math.round(((currentIdx + 1) / (goalIdx + 1)) * 100))

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{current}</span>
        <span className="font-medium text-primary">{goal} (meta)</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

type DimStat = {
  key: keyof SessionFeedbackRow
  label: string
  short: string
  first: number | null
  last: number | null
  delta: number
  count: number
}

function DimensionRow({ dim }: Readonly<{ dim: DimStat }>) {
  const { label, first, last, delta, count } = dim
  if (first === null || last === null) return null

  const TrendIcon =
    delta > 0 ? TrendingUp : delta < 0 ? TrendingDown : Minus
  const trendColor =
    delta > 0 ? 'text-success' : delta < 0 ? 'text-destructive' : 'text-muted-foreground'

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <div className={`flex items-center gap-1 text-xs font-semibold ${trendColor}`}>
          <TrendIcon className="h-3.5 w-3.5" />
          {delta > 0 && '+'}
          {delta !== 0 ? delta : '—'}
          <span className="font-normal text-muted-foreground ml-1">({count} {count === 1 ? 'sessão' : 'sessões'})</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Primeira</p>
          <div className="flex items-center gap-2">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full ${barColor(first)} opacity-50`}
                style={{ width: `${(first / 5) * 100}%` }}
              />
            </div>
            <span className="w-6 shrink-0 text-right text-xs tabular-nums">{first}/5</span>
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Última</p>
          <div className="flex items-center gap-2">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full ${barColor(last)}`}
                style={{ width: `${(last / 5) * 100}%` }}
              />
            </div>
            <span className="w-6 shrink-0 text-right text-xs font-semibold tabular-nums">{last}/5</span>
          </div>
        </div>
      </div>
    </div>
  )
}
