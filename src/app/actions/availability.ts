'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const SLOT_DURATION_MS = 60 * 60 * 1000 // 60 min

export async function createSlot(startsAt: string): Promise<{ error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado.' }

  const { data: tutor } = await supabase
    .from('tutor_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single<{ id: string }>()

  if (!tutor) return { error: 'Perfil de tutor não encontrado.' }

  const start = new Date(startsAt)
  if (isNaN(start.getTime())) return { error: 'Data inválida.' }
  if (start < new Date()) return { error: 'Não é possível criar slots no passado.' }

  const end = new Date(start.getTime() + SLOT_DURATION_MS)

  // Check for overlap (same tutor, overlapping time)
  const { data: overlap } = await supabase
    .from('availability_slots')
    .select('id')
    .eq('tutor_id', tutor.id)
    .lt('starts_at', end.toISOString())
    .gt('ends_at', start.toISOString())
    .limit(1)

  if (overlap && overlap.length > 0) return { error: 'Já existe um slot nesse horário.' }

  const { error } = await supabase.from('availability_slots').insert({
    tutor_id: tutor.id,
    starts_at: start.toISOString(),
    ends_at: end.toISOString(),
  })

  if (error) return { error: error.message }

  revalidatePath('/dashboard/availability')
  return {}
}

export async function deleteSlot(slotId: string): Promise<{ error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado.' }

  // Ensure the slot belongs to this tutor and is not booked
  const { data: slot } = await supabase
    .from('availability_slots')
    .select('id, is_booked, tutor_id, tutor_profiles!inner(user_id)')
    .eq('id', slotId)
    .single<{ id: string; is_booked: boolean; tutor_id: string; tutor_profiles: { user_id: string } }>()

  if (!slot) return { error: 'Slot não encontrado.' }
  if (slot.tutor_profiles.user_id !== user.id) return { error: 'Sem permissão.' }
  if (slot.is_booked) return { error: 'Slot já reservado, não pode ser removido.' }

  const { error } = await supabase.from('availability_slots').delete().eq('id', slotId)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/availability')
  return {}
}
