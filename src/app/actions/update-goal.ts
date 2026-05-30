'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { SENIORITY_LEVELS } from '@/lib/tutor-options'

const schema = z.object({
  goal_seniority: z.enum(SENIORITY_LEVELS).nullable(),
})

export async function updateLearnerGoal(
  _prev: unknown,
  formData: FormData
): Promise<{ error?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado.' }

  const raw = formData.get('goal_seniority') || null
  const parsed = schema.safeParse({ goal_seniority: raw })
  if (!parsed.success) return { error: 'Nível inválido.' }

  const { error } = await supabase
    .from('profiles')
    .update({ goal_seniority: parsed.data.goal_seniority })
    .eq('id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/progresso')
  return {}
}
