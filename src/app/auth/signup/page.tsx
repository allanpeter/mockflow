'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GoogleIcon } from '@/components/icons/google-icon'

const schema = z.object({
  full_name: z.string().min(2, 'Informe seu nome completo'),
  email: z.string().check(z.email('E-mail inválido')),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  role: z.enum(['tutor', 'learner'], { error: 'Selecione um perfil' }),
})
type FormValues = z.infer<typeof schema>

type Step = 'role' | 'details' | 'confirm'

export default function SignupPage() {
  const [step, setStep] = useState<Step>('role')
  const [googleLoading, setGoogleLoading] = useState(false)
  const supabase = createClient()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { full_name: '', email: '', password: '', role: undefined },
  })

  const selectedRole = form.watch('role')

  async function onSubmit(values: FormValues) {
    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          full_name: values.full_name,
          role: values.role,
        },
        emailRedirectTo: `${globalThis.location.origin}/auth/callback`,
      },
    })

    if (error) {
      toast.error(error.message)
      return
    }

    setStep('confirm')
  }

  async function signUpWithGoogle(role: 'tutor' | 'learner') {
    setGoogleLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${globalThis.location.origin}/auth/callback`,
        queryParams: { role },  // passed via state, handled in callback
      },
    })
    if (error) {
      toast.error('Erro ao continuar com Google.')
      setGoogleLoading(false)
    }
  }

  if (step === 'confirm') {
    return (
      <div className="flex min-h-svh items-center justify-center p-4">
        <Card className="w-full max-w-sm text-center">
          <CardHeader>
            <CardTitle>Verifique seu e-mail</CardTitle>
            <CardDescription>
              Enviamos um link de confirmação para{' '}
              <strong>{form.getValues('email')}</strong>. Clique no link para
              ativar sua conta.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Não recebeu?{' '}
              <button
                className="underline underline-offset-4"
                onClick={() => setStep('details')}
              >
                Tentar novamente
              </button>
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Criar conta</CardTitle>
          <CardDescription>
            {step === 'role'
              ? 'Como você vai usar o MockFlow?'
              : 'Preencha seus dados'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'role' ? (
            <div className="space-y-3">
              <RoleCard
                title="Sou Entrevistador"
                description="Ofereço sessões de mock interview e recebo por isso"
                emoji="🧑‍💻"
                selected={selectedRole === 'tutor'}
                onSelect={() => {
                  form.setValue('role', 'tutor')
                  setStep('details')
                }}
              />
              <RoleCard
                title="Sou Candidato"
                description="Quero praticar entrevistas com profissionais experientes"
                emoji="🎯"
                selected={selectedRole === 'learner'}
                onSelect={() => {
                  form.setValue('role', 'learner')
                  setStep('details')
                }}
              />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Role badge */}
              <button
                type="button"
                className="text-xs text-muted-foreground underline underline-offset-4"
                onClick={() => setStep('role')}
              >
                ← Voltar ({selectedRole === 'tutor' ? 'Entrevistador' : 'Candidato'})
              </button>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => signUpWithGoogle(selectedRole)}
                disabled={googleLoading}
              >
                <GoogleIcon className="mr-2 h-4 w-4" />
                {googleLoading ? 'Redirecionando…' : 'Continuar com Google'}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">ou</span>
                </div>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome completo</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ana Silva"
                            autoComplete="name"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-mail</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="voce@exemplo.com"
                            inputMode="email"
                            autoComplete="email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Senha</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Mínimo 8 caracteres"
                            autoComplete="new-password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting ? 'Criando conta…' : 'Criar conta'}
                  </Button>
                </form>
              </Form>

              <p className="text-center text-sm text-muted-foreground">
                Já tem conta?{' '}
                <Link href="/auth/login" className="underline underline-offset-4">
                  Entrar
                </Link>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function RoleCard({
  title,
  description,
  emoji,
  selected,
  onSelect,
}: Readonly<{
  title: string
  description: string
  emoji: string
  selected: boolean
  onSelect: () => void
}>) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-lg border-2 p-4 text-left transition-colors ${
        selected
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-primary/50'
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">{emoji}</span>
        <div>
          <p className="font-medium">{title}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </button>
  )
}
