'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const schema = z.object({
  sessionId: z.string().uuid(),
  tutorId: z.string().uuid(),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
})

export async function submitReview(_prev: unknown, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado.' }

  const parsed = schema.safeParse({
    sessionId: formData.get('sessionId'),
    tutorId: formData.get('tutorId'),
    rating: formData.get('rating'),
    comment: formData.get('comment') || undefined,
  })
  if (!parsed.success) return { error: 'Dados inválidos.' }

  const { sessionId, tutorId, rating, comment } = parsed.data

  // Guard: prevent double review
  const { data: existing } = await supabase
    .from('reviews')
    .select('id')
    .eq('session_id', sessionId)
    .maybeSingle()

  if (existing) return { error: 'Você já avaliou esta sessão.' }

  const { error } = await supabase.from('reviews').insert({
    session_id: sessionId,
    reviewer_id: user.id,
    tutor_id: tutorId,
    rating,
    comment: comment ?? null,
  })

  if (error) return { error: 'Erro ao salvar avaliação. Tente novamente.' }

  redirect('/agenda')
}
