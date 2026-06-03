'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { refundOrder } from '@/lib/payment'
import { sendNoShowReportedLearner, sendNoShowNotifiedTutor } from '@/lib/email'

const REPORT_WINDOW_HOURS = 24

export async function reportNoShow(bookingId: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const admin = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado.' }

  const { data: booking } = await admin
    .from('bookings')
    .select(`
      id, status, gross_amount, pagarme_charge_id, learner_id,
      tutor_profiles ( user_id, profiles ( full_name ) ),
      sessions ( id, starts_at, ends_at, status )
    `)
    .eq('id', bookingId)
    .single<{
      id: string
      status: string
      gross_amount: number
      pagarme_charge_id: string | null
      learner_id: string
      tutor_profiles: { user_id: string; profiles: { full_name: string } }
      sessions: { id: string; starts_at: string; ends_at: string; status: string } | null
    }>()

  if (!booking) return { error: 'Reserva não encontrada.' }
  if (booking.learner_id !== user.id) return { error: 'Sem permissão.' }
  if (booking.status !== 'confirmed') return { error: 'Esta reserva não pode ser reportada.' }

  const session = booking.sessions
  if (!session) return { error: 'Sessão não encontrada.' }

  const now = new Date()
  const endsAt = new Date(session.ends_at)

  if (endsAt > now) return { error: 'A sessão ainda não terminou.' }
  if (session.status === 'no_show') return { error: 'No-show já reportado para esta sessão.' }

  const hoursSinceEnd = (now.getTime() - endsAt.getTime()) / (1000 * 60 * 60)
  if (hoursSinceEnd > REPORT_WINDOW_HOURS) {
    return { error: `O prazo para reportar encerrou (${REPORT_WINDOW_HOURS}h após a sessão).` }
  }

  // Refund the learner
  if (!booking.pagarme_charge_id) {
    console.error(`[report-no-show] booking ${bookingId} has no pagarme_charge_id — skipping refund`)
    return { error: 'Não foi possível processar o reembolso. Entre em contato com o suporte.' }
  }

  const refund = await refundOrder(booking.pagarme_charge_id)
  if (!refund.success) return { error: 'Falha ao processar reembolso. Tente novamente.' }

  await Promise.all([
    admin.from('sessions').update({ status: 'no_show' }).eq('id', session.id),
    admin.from('bookings').update({ status: 'cancelled' }).eq('id', bookingId),
    admin.from('payouts').delete().eq('booking_id', bookingId).eq('status', 'pending'),
  ])

  const tutorName = booking.tutor_profiles?.profiles?.full_name ?? 'Entrevistador'

  const [{ data: learnerAuth }, { data: tutorAuth }] = await Promise.all([
    admin.auth.admin.getUserById(booking.learner_id),
    admin.auth.admin.getUserById(booking.tutor_profiles?.user_id),
  ])

  const learnerEmail = learnerAuth?.user?.email
  const learnerName = learnerAuth?.user?.user_metadata?.full_name ?? 'Candidato'
  const tutorEmail = tutorAuth?.user?.email

  await Promise.allSettled([
    learnerEmail
      ? sendNoShowReportedLearner({
          to: learnerEmail,
          recipientName: learnerName,
          tutorName,
          startsAt: session.starts_at,
          amount: booking.gross_amount,
        })
      : Promise.resolve(),
    tutorEmail
      ? sendNoShowNotifiedTutor({
          to: tutorEmail,
          tutorName,
          learnerName,
          startsAt: session.starts_at,
        })
      : Promise.resolve(),
  ])

  revalidatePath('/agenda')
  return {}
}
