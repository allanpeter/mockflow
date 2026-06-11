'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  email: z.string().email('Email inválido'),
  linkedin_url: z.string().url('URL do LinkedIn inválida').optional().or(z.literal('')),
  stack: z.string().min(2, 'Stack deve ter pelo menos 2 caracteres').max(200),
})

export type InterviewerApplicationFormState =
  | { status: 'idle' }
  | { status: 'success' }
  | { status: 'error'; errors: Record<string, string[]> }
  | { status: 'server_error'; message: string }

export async function submitInterviewerApplication(
  _prev: InterviewerApplicationFormState,
  formData: FormData
): Promise<InterviewerApplicationFormState> {
  const raw = {
    name: formData.get('name'),
    email: formData.get('email'),
    linkedin_url: formData.get('linkedin_url') || undefined,
    stack: formData.get('stack'),
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

  const supabase = await createClient()

  const { error } = await supabase.from('interviewer_applications').insert({
    name: parsed.data.name,
    email: parsed.data.email,
    linkedin_url: parsed.data.linkedin_url || null,
    stack: parsed.data.stack,
  })

  if (error) return { status: 'server_error', message: error.message }

  return { status: 'success' }
}
