import { createClient } from '@/lib/supabase/server'
import { TutorsGrid } from '@/components/tutors/tutors-grid'

export default async function TutorsPage() {
  const supabase = await createClient()

  const { data: tutors } = await supabase
    .from('tutor_profiles')
    .select(`
      id,
      bio,
      years_experience,
      tech_stack,
      price_per_session,
      profiles ( full_name, avatar_url ),
      reviews ( rating )
    `)
    .eq('is_active', true)
    .order('created_at')

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      <div>
        <h1 className="text-3xl font-bold">Entrevistadores</h1>
        <p className="mt-1 text-muted-foreground">
          Profissionais disponíveis para mock interviews
        </p>
      </div>

      {tutors && tutors.length > 0 ? (
        <TutorsGrid tutors={tutors as any} />
      ) : (
        <p className="text-muted-foreground">
          Nenhum entrevistador disponível no momento. Volte em breve!
        </p>
      )}
    </div>
  )
}
