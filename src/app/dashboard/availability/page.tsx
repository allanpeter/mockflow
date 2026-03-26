import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { WeekCalendar } from '@/components/availability/week-calendar'

export default async function AvailabilityPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single<{ role: string }>()

  if (profile?.role !== 'tutor') redirect('/dashboard')

  const { data: tutor } = await supabase
    .from('tutor_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single<{ id: string }>()

  if (!tutor) redirect('/dashboard/profile')

  // Fetch slots for the next 8 weeks so the calendar has enough data
  const from = new Date()
  from.setDate(from.getDate() - from.getDay()) // start of current week
  from.setHours(0, 0, 0, 0)

  const to = new Date(from)
  to.setDate(to.getDate() + 56) // 8 weeks

  const { data: slots } = await supabase
    .from('availability_slots')
    .select('id, starts_at, is_booked')
    .eq('tutor_id', tutor.id)
    .gte('starts_at', from.toISOString())
    .lte('starts_at', to.toISOString())
    .order('starts_at')

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-bold">Disponibilidade</h1>
        <p className="text-muted-foreground">
          Toque em um horário para marcar como disponível. Toque novamente para remover.
        </p>
      </div>

      <WeekCalendar initialSlots={slots ?? []} />
    </div>
  )
}
