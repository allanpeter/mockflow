'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function markPayoutPaid(
  payoutId: string,
  transferRef: string
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado.' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single<{ role: string }>()

  if (profile?.role !== 'admin') return { error: 'Sem permissão.' }

  const admin = createAdminClient()
  const { error } = await admin
    .from('payouts')
    .update({
      status: 'paid',
      transfer_id: transferRef || `manual-${Date.now()}`,
      paid_at: new Date().toISOString(),
    })
    .eq('id', payoutId)
    .in('status', ['pending', 'failed'])

  if (error) return { error: error.message }

  revalidatePath('/admin/payouts')
  return {}
}
