import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { UserMenu } from './user-menu'
import { ThemeToggle } from './theme-toggle'
import { Button } from '@/components/ui/button'

export async function Header() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let profile: { full_name: string; avatar_url: string | null; role: string } | null = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('full_name, avatar_url, role')
      .eq('id', user.id)
      .single<{ full_name: string; avatar_url: string | null; role: string }>()
    profile = data
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <span className="text-primary">Mock</span>Flow
        </Link>

        {/* Center nav — hidden on mobile */}
        <nav className="hidden items-center gap-6 text-sm md:flex">
          <Link href="/tutors" className="text-muted-foreground transition-colors hover:text-foreground">
            Entrevistadores
          </Link>
          <Link href="/como-funciona" className="text-muted-foreground transition-colors hover:text-foreground">
            Como funciona
          </Link>
          <Link href="/precos" className="text-muted-foreground transition-colors hover:text-foreground">
            Preços
          </Link>
          {user && (
            <Link href="/agenda" className="text-muted-foreground transition-colors hover:text-foreground">
              Minha Agenda
            </Link>
          )}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user && profile ? (
            <UserMenu profile={profile} />
          ) : (
            <>
              <Button variant="ghost" render={<Link href="/auth/login" />}>
                Entrar
              </Button>
              <Button render={<Link href="/auth/signup" />}>
                Começar grátis
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
