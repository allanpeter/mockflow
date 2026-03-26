'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LayoutDashboard, User, LogOut, CalendarDays } from 'lucide-react'

interface Props {
  profile: {
    full_name: string
    avatar_url: string | null
    role: string
  }
}

export function UserMenu({ profile }: Readonly<Props>) {
  const router = useRouter()
  const supabase = createClient()

  const initials = profile.full_name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Menu do usuário"
      >
        <Avatar>
          <AvatarImage src={profile.avatar_url ?? undefined} alt={profile.full_name} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-normal">
            <p className="font-medium text-foreground">{profile.full_name}</p>
            <p className="text-xs text-muted-foreground capitalize">
              {profile.role === 'tutor' ? 'Entrevistador' : 'Candidato'}
            </p>
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem render={<Link href="/dashboard" />}>
            <LayoutDashboard />
            Dashboard
          </DropdownMenuItem>

          {profile.role === 'tutor' && (
            <>
              <DropdownMenuItem render={<Link href="/dashboard/profile" />}>
                <User />
                Meu perfil
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link href="/dashboard/availability" />}>
                <CalendarDays />
                Disponibilidade
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem variant="destructive" onClick={signOut}>
            <LogOut />
            Sair
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
