'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

// Shown to users who signed up via Google OAuth and didn't pre-select a role
export default function SelectRolePage() {
  const [loading, setLoading] = useState<'tutor' | 'learner' | null>(null)
  const router = useRouter()
  const supabase = createClient()

  async function selectRole(role: 'tutor' | 'learner') {
    setLoading(role)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push('/auth/login')
      return
    }

    const { error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', user.id)

    if (error) {
      toast.error('Erro ao salvar perfil. Tente novamente.')
      setLoading(null)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="flex min-h-svh items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Quase lá!</CardTitle>
          <CardDescription>Como você vai usar o MockFlow?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <RoleCard
            title="Sou Entrevistador"
            description="Ofereço sessões de mock interview e recebo por isso"
            emoji="🧑‍💻"
            loading={loading === 'tutor'}
            onSelect={() => selectRole('tutor')}
            disabled={loading !== null}
          />
          <RoleCard
            title="Sou Candidato"
            description="Quero praticar entrevistas com profissionais experientes"
            emoji="🎯"
            loading={loading === 'learner'}
            onSelect={() => selectRole('learner')}
            disabled={loading !== null}
          />
        </CardContent>
      </Card>
    </div>
  )
}

function RoleCard({
  title,
  description,
  emoji,
  loading,
  disabled,
  onSelect,
}: Readonly<{
  title: string
  description: string
  emoji: string
  loading: boolean
  disabled: boolean
  onSelect: () => void
}>) {
  return (
    <Button
      variant="outline"
      className="h-auto w-full justify-start p-4"
      onClick={onSelect}
      disabled={disabled}
    >
      <span className="mr-3 text-2xl">{emoji}</span>
      <span className="text-left">
        <span className="block font-medium">{loading ? 'Salvando…' : title}</span>
        <span className="block text-sm font-normal text-muted-foreground">{description}</span>
      </span>
    </Button>
  )
}
