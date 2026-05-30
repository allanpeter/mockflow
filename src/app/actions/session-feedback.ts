'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { SENIORITY_LEVELS } from '@/lib/tutor-options'

const scoreField = z.coerce.number().int().min(1).max(5).nullable().optional()

const schema = z.object({
  session_id: z.string().uuid(),
  score_communication:    scoreField,
  score_technical:        scoreField,
  score_architecture:     scoreField,
  score_problem_solving:  scoreField,
  score_soft_skills:      scoreField,
  score_maturity:         scoreField,
  estimated_seniority:    z.enum(SENIORITY_LEVELS).nullable().optional(),
  what_went_well:         z.string().max(2000).optional().or(z.literal('')),
  what_to_improve:        z.string().max(2000).optional().or(z.literal('')),
  evolution_plan:         z.string().max(2000).optional().or(z.literal('')),
})

export type FeedbackFormState =
  | { status: 'idle' }
  | { status: 'success' }
  | { status: 'error'; errors: Record<string, string[]> }
  | { status: 'server_error'; message: string }

export async function submitSessionFeedback(
  _prev: FeedbackFormState,
  formData: FormData
): Promise<FeedbackFormState> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { status: 'server_error', message: 'Não autenticado.' }

  // Must be a tutor
  const { data: tutorProfile } = await supabase
    .from('tutor_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single<{ id: string }>()

  if (!tutorProfile) return { status: 'server_error', message: 'Apenas tutores podem enviar feedback.' }

  const nullIfEmpty = (v: FormDataEntryValue | null) =>
    v === '' || v === null ? null : v

  const raw = {
    session_id:            formData.get('session_id'),
    score_communication:   nullIfEmpty(formData.get('score_communication')),
    score_technical:       nullIfEmpty(formData.get('score_technical')),
    score_architecture:    nullIfEmpty(formData.get('score_architecture')),
    score_problem_solving: nullIfEmpty(formData.get('score_problem_solving')),
    score_soft_skills:     nullIfEmpty(formData.get('score_soft_skills')),
    score_maturity:        nullIfEmpty(formData.get('score_maturity')),
    estimated_seniority:   nullIfEmpty(formData.get('estimated_seniority')) ?? undefined,
    what_went_well:        formData.get('what_went_well') || undefined,
    what_to_improve:       formData.get('what_to_improve') || undefined,
    evolution_plan:        formData.get('evolution_plan') || undefined,
  }

  const parsed = schema.safeParse(raw)
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {}
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]?.toString() ?? '_'
      if (!fieldErrors[key]) fieldErrors[key] = []
      fieldErrors[key].push(issue.message)
    }
    return { status: 'error', errors: fieldErrors }
  }

  // Validate: session belongs to this tutor and has ended
  const { data: session } = await supabase
    .from('sessions')
    .select('id, ends_at, booking_id')
    .eq('id', parsed.data.session_id)
    .maybeSingle()

  if (!session) return { status: 'server_error', message: 'Sessão não encontrada.' }
  if (new Date(session.ends_at) > new Date()) {
    return { status: 'server_error', message: 'A sessão ainda não terminou.' }
  }

  const { data: booking } = await supabase
    .from('bookings')
    .select('tutor_id, learner_id')
    .eq('id', session.booking_id)
    .maybeSingle<{ tutor_id: string; learner_id: string }>()

  if (!booking) return { status: 'server_error', message: 'Reserva não encontrada.' }
  if (booking.tutor_id !== tutorProfile.id) {
    return { status: 'server_error', message: 'Você não é o tutor desta sessão.' }
  }

  // Prevent duplicate
  const { data: existing } = await supabase
    .from('session_feedback')
    .select('id')
    .eq('session_id', session.id)
    .maybeSingle()

  if (existing) {
    return { status: 'server_error', message: 'Feedback já enviado para esta sessão.' }
  }

  const { error } = await supabase.from('session_feedback').insert({
    session_id:            session.id,
    tutor_id:              tutorProfile.id,
    learner_id:            booking.learner_id,
    score_communication:   parsed.data.score_communication ?? null,
    score_technical:       parsed.data.score_technical ?? null,
    score_architecture:    parsed.data.score_architecture ?? null,
    score_problem_solving: parsed.data.score_problem_solving ?? null,
    score_soft_skills:     parsed.data.score_soft_skills ?? null,
    score_maturity:        parsed.data.score_maturity ?? null,
    estimated_seniority:   parsed.data.estimated_seniority ?? null,
    what_went_well:        parsed.data.what_went_well || null,
    what_to_improve:       parsed.data.what_to_improve || null,
    evolution_plan:        parsed.data.evolution_plan || null,
  })

  if (error) return { status: 'server_error', message: error.message }

  redirect('/agenda')
}
