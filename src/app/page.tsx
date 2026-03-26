import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="text-4xl font-bold tracking-tight">MockFlow</h1>
      <p className="max-w-sm text-muted-foreground">
        Pratique entrevistas técnicas com profissionais experientes. Acelere sua carreira.
      </p>
      <div className="flex gap-3">
        <Button render={<Link href="/auth/signup" />}>Criar conta</Button>
        <Button variant="outline" render={<Link href="/auth/login" />}>Entrar</Button>
      </div>
    </main>
  )
}
