import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TutorProfileForm } from '@/components/tutor/profile-form'
import { AvatarUpload } from '@/components/tutor/avatar-upload'
import { ActiveToggle } from '@/components/tutor/active-toggle'
import { Separator } from '@/components/ui/separator'

export default async function TutorProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  // Fetch profile + tutor_profile in parallel
  const [{ data: profile }, { data: tutorProfile }] = await Promise.all([
    supabase
      .from('profiles')
      .select('full_name, avatar_url, role')
      .eq('id', user.id)
      .single<{ full_name: string; avatar_url: string | null; role: string }>(),
    supabase
      .from('tutor_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle(),
  ])

  if (profile?.role !== 'tutor') redirect('/dashboard')

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4 py-8">
      <div>
        <h1 className="text-2xl font-bold">Meu perfil</h1>
        <p className="text-muted-foreground">
          Configure como você aparece para os candidatos
        </p>
      </div>

      {/* Avatar */}
      <AvatarUpload
        currentUrl={profile?.avatar_url ?? null}
        name={profile?.full_name ?? user.email ?? '?'}
      />

      <Separator />

      {/* Go live toggle — only shown if profile exists */}
      {tutorProfile && (
        <>
          <ActiveToggle isActive={tutorProfile.is_active} />
          <Separator />
        </>
      )}

      {/* Profile form */}
      <TutorProfileForm profile={tutorProfile ?? null} />
    </div>
  )
}
