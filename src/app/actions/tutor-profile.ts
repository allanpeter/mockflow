'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { ALL_TECHS } from '@/lib/tech-stack'

const PIX_KEY_TYPES = ['cpf', 'cnpj', 'email', 'phone', 'random'] as const

const schema = z.object({
  bio: z.string().min(50, 'Bio deve ter pelo menos 50 caracteres'),
  years_experience: z.coerce.number().int().min(0).max(50),
  tech_stack: z.array(z.enum(ALL_TECHS as [string, ...string[]])).min(1, 'Adicione pelo menos 1 tecnologia').max(15, 'Máximo 15 tecnologias'),
  price_per_session: z.coerce
    .number()
    .min(30, 'Preço mínimo: R$ 30')
    .max(2000, 'Preço máximo: R$ 2000'),
  pix_key: z.string().min(1).optional().or(z.literal('')),
  pix_key_type: z.enum(PIX_KEY_TYPES).optional(),
})

export type TutorProfileFormState =
  | { status: 'idle' }
  | { status: 'success' }
  | { status: 'error'; errors: Record<string, string[]> }
  | { status: 'server_error'; message: string }

export async function upsertTutorProfile(
  _prev: TutorProfileFormState,
  formData: FormData
): Promise<TutorProfileFormState> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { status: 'server_error', message: 'Não autenticado.' }

  const raw = {
    bio: formData.get('bio'),
    years_experience: formData.get('years_experience'),
    tech_stack: formData.getAll('tech_stack'),
    price_per_session: formData.get('price_per_session'),
    pix_key: formData.get('pix_key') || undefined,
    pix_key_type: formData.get('pix_key_type') || undefined,
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

  const { data: existing } = await supabase
    .from('tutor_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single<{ id: string }>()

  const { error } = existing
    ? await supabase
        .from('tutor_profiles')
        .update(parsed.data)
        .eq('user_id', user.id)
    : await supabase.from('tutor_profiles').insert({
        ...parsed.data,
        pix_key: parsed.data.pix_key ?? null,
        pix_key_type: parsed.data.pix_key_type ?? null,
        user_id: user.id,
        whereby_room_prefix: null,
        pagarme_recipient_id: null,
        is_active: false,
      })

  if (error) return { status: 'server_error', message: error.message }

  revalidatePath('/dashboard/profile')
  return { status: 'success' }
}

export async function toggleTutorActive(is_active: boolean): Promise<{ error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Não autenticado.' }

  // Can only go live if profile is complete
  if (is_active) {
    const { data: profile } = await supabase
      .from('tutor_profiles')
      .select('bio, tech_stack, price_per_session')
      .eq('user_id', user.id)
      .single<{ bio: string; tech_stack: string[]; price_per_session: number }>()

    if (!profile?.bio || !profile.tech_stack?.length || !profile.price_per_session) {
      return { error: 'Complete seu perfil antes de ficar disponível.' }
    }
  }

  const { error } = await supabase
    .from('tutor_profiles')
    .update({ is_active })
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/profile')
  return {}
}

export async function uploadAvatar(formData: FormData): Promise<{ url?: string; error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Não autenticado.' }

  const file = formData.get('avatar') as File
  if (!file || file.size === 0) return { error: 'Nenhum arquivo selecionado.' }
  if (file.size > 2 * 1024 * 1024) return { error: 'Imagem deve ter no máximo 2MB.' }
  if (!file.type.startsWith('image/')) return { error: 'Apenas imagens são permitidas.' }

  const ext = file.name.split('.').pop()
  const path = `avatars/${user.id}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('public-assets')
    .upload(path, file, { upsert: true, contentType: file.type })

  if (uploadError) return { error: uploadError.message }

  const { data } = supabase.storage.from('public-assets').getPublicUrl(path)

  await supabase.from('profiles').update({ avatar_url: data.publicUrl }).eq('id', user.id)

  revalidatePath('/dashboard/profile')
  return { url: data.publicUrl }
}
