import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { TutorsGrid, type TutorCard } from '@/components/tutors/tutors-grid'

export default async function TutorsPage() {
  const supabase = await createClient()

  const [{ data: tutors }, { data: statsRows }, { data: slotRows }] = await Promise.all([
    supabase
      .from('tutor_profiles')
      .select(`
        id,
        bio,
        headline,
        years_experience,
        tech_stack,
        price_per_session,
        languages,
        seniority_levels,
        interview_formats,
        companies,
        profiles ( full_name, avatar_url ),
        reviews ( rating )
      `)
      .eq('is_active', true)
      .order('created_at'),
    supabase.from('tutor_stats').select('tutor_id, completed_sessions, return_rate'),
    supabase
      .from('availability_slots')
      .select('tutor_id, starts_at')
      .eq('is_booked', false)
      .gte('starts_at', new Date().toISOString())
      .order('starts_at'),
  ])

  const statsMap = new Map((statsRows ?? []).map((s) => [s.tutor_id, s]))
  const nextSlotMap = new Map<string, string>()
  for (const slot of slotRows ?? []) {
    if (!nextSlotMap.has(slot.tutor_id)) nextSlotMap.set(slot.tutor_id, slot.starts_at)
  }

  const cards: TutorCard[] = (tutors ?? []).map((t) => {
    const stats = statsMap.get(t.id)
    return {
      ...(t as unknown as Omit<TutorCard, 'completed_sessions' | 'return_rate' | 'next_slot'>),
      completed_sessions: stats?.completed_sessions ?? 0,
      return_rate: stats?.return_rate ?? 0,
      next_slot: nextSlotMap.get(t.id) ?? null,
    }
  })

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      <div>
        <h1 className="text-3xl font-bold">Entrevistadores</h1>
        <p className="mt-1 text-muted-foreground">
          Profissionais reais, prontos para te preparar para a entrevista que importa.
        </p>
      </div>

      {cards.length > 0 ? (
        <TutorsGrid tutors={cards} />
      ) : (
        <div className="rounded-xl border border-dashed p-10 text-center">
          <p className="text-muted-foreground">Nenhum entrevistador disponível no momento.</p>
          <Button className="mt-4" render={<Link href="/auth/signup" />}>
            Seja um entrevistador
          </Button>
        </div>
      )}
    </div>
  )
}
