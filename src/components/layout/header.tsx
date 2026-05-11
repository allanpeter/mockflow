import { Suspense } from 'react'
import Link from 'next/link'
import { UserMenu } from './user-menu'
import { ThemeToggle } from './theme-toggle'
import { Button } from '@/components/ui/button'
import { getCurrentUser } from '@/lib/auth/get-current-user'

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="font-bold text-lg">
          <span className="text-primary">Mock</span>Flow
        </Link>

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
          <Suspense fallback={null}>
            <HeaderAuthNav />
          </Suspense>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Suspense fallback={<HeaderAuthMenuFallback />}>
            <HeaderAuthMenu />
          </Suspense>
        </div>
      </div>
    </header>
  )
}

async function HeaderAuthNav() {
  const current = await getCurrentUser()
  if (!current) return null
  return (
    <Link href="/agenda" className="text-muted-foreground transition-colors hover:text-foreground">
      Minha Agenda
    </Link>
  )
}

async function HeaderAuthMenu() {
  const current = await getCurrentUser()
  if (current?.profile) {
    return <UserMenu profile={current.profile} />
  }
  return <HeaderAuthMenuFallback />
}

function HeaderAuthMenuFallback() {
  return (
    <>
      <Button variant="ghost" render={<Link href="/auth/login" />}>
        Entrar
      </Button>
      <Button render={<Link href="/auth/signup" />}>
        Começar grátis
      </Button>
    </>
  )
}
