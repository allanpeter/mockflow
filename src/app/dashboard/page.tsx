import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { UserCircle, CalendarDays, Search, Calendar } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single<{ full_name: string; role: string }>()

  const isTutor = profile?.role === 'tutor'

  // Fetch session counts for a quick summary
  let upcomingCount = 0
  let totalCount = 0

  if (isTutor) {
    const { data: tutorProfile } = await supabase
      .from('tutor_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single<{ id: string }>()

    if (tutorProfile) {
      const now = new Date().toISOString()
      const { count: upcoming } = await supabase
        .from('sessions')
        .select('id', { count: 'exact', head: true })
        .eq('bookings.tutor_id', tutorProfile.id)
        .gte('starts_at', now)

      const { count: total } = await supabase
        .from('sessions')
        .select('id', { count: 'exact', head: true })
        .eq('bookings.tutor_id', tutorProfile.id)

      upcomingCount = upcoming ?? 0
      totalCount = total ?? 0
    }
  } else {
    const now = new Date().toISOString()
    const { count: upcoming } = await supabase
      .from('sessions')
      .select('id', { count: 'exact', head: true })
      .eq('bookings.learner_id', user.id)
      .gte('starts_at', now)

    const { count: total } = await supabase
      .from('sessions')
      .select('id', { count: 'exact', head: true })
      .eq('bookings.learner_id', user.id)

    upcomingCount = upcoming ?? 0
    totalCount = total ?? 0
  }

  const firstName = profile?.full_name?.split(' ')[0] ?? user.email

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-10">
      {/* Header */}
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">
          {isTutor ? 'Painel do entrevistador' : 'Painel do candidato'}
        </p>
        <h1 className="text-2xl font-bold">Olá, {firstName}</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border bg-card p-5 space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Próximas sessões</p>
          <p className="text-3xl font-bold">{upcomingCount}</p>
        </div>
        <div className="rounded-xl border bg-card p-5 space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Total de sessões</p>
          <p className="text-3xl font-bold">{totalCount}</p>
        </div>
      </div>

      {/* Actions */}
      <div>
        <h2 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wide">Ações rápidas</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {isTutor ? (
            <>
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg border bg-muted">
                      <UserCircle className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Meu perfil</CardTitle>
                      <CardDescription className="text-xs">Bio, stack e preço por sessão</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button render={<Link href="/dashboard/profile" />} className="w-full">
                    Editar perfil
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg border bg-muted">
                      <CalendarDays className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Disponibilidade</CardTitle>
                      <CardDescription className="text-xs">Gerencie seus horários disponíveis</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" render={<Link href="/dashboard/availability" />} className="w-full">
                    Gerenciar horários
                  </Button>
                </CardContent>
              </Card>

              <Card className="sm:col-span-2">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg border bg-muted">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Minha agenda</CardTitle>
                      <CardDescription className="text-xs">Veja seus agendamentos com candidatos</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" render={<Link href="/agenda" />} className="w-full">
                    Ver agenda
                  </Button>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg border bg-muted">
                      <Search className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Agendar entrevista</CardTitle>
                      <CardDescription className="text-xs">Encontre um entrevistador disponível</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button render={<Link href="/tutors" />} className="w-full">
                    Ver entrevistadores
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg border bg-muted">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Minha agenda</CardTitle>
                      <CardDescription className="text-xs">Suas mock interviews agendadas</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" render={<Link href="/agenda" />} className="w-full">
                    Ver agenda
                  </Button>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
