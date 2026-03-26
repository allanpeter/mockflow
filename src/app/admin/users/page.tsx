import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { UserTable } from '@/components/admin/user-table'

export default async function AdminUsersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single<{ role: string }>()

  if (profile?.role !== 'admin') redirect('/dashboard')

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-10">
      <div>
        <h1 className="text-2xl font-bold">Gerenciar usuários</h1>
        <p className="text-muted-foreground">Lista de todos os usuários cadastrados na plataforma.</p>
      </div>
      <UserTable />
    </div>
  )
}
