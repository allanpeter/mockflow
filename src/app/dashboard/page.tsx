import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

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

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-bold">
          Olá, {profile?.full_name ?? user.email} 👋
        </h1>
        <p className="text-muted-foreground">
          {isTutor ? 'Painel do Entrevistador' : 'Painel do Candidato'}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {isTutor && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Meu perfil</CardTitle>
                <CardDescription>Configure bio, stack e preço</CardDescription>
              </CardHeader>
              <CardContent>
                <Button render={<Link href="/dashboard/profile" />} className="w-full">
                  Editar perfil
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Disponibilidade</CardTitle>
                <CardDescription>Gerencie seus horários disponíveis</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" render={<Link href="/dashboard/availability" />} className="w-full">
                  Gerenciar horários
                </Button>
              </CardContent>
            </Card>
          </>
        )}

        {!isTutor && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Agendar entrevista</CardTitle>
              <CardDescription>Encontre um entrevistador disponível</CardDescription>
            </CardHeader>
            <CardContent>
              <Button render={<Link href="/tutors" />} className="w-full">
                Ver entrevistadores
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
