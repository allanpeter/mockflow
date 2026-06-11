'use client'

import { useActionState } from 'react'
import { submitInterviewerApplication } from '@/app/actions/interviewer-application'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

export function InterviewerApplicationForm() {
  const [state, action, isPending] = useActionState(submitInterviewerApplication, { status: 'idle' })

  if (state.status === 'success') {
    return (
      <div className="rounded-xl border bg-green-50/50 border-green-200 p-8 text-center space-y-4">
        <div className="flex justify-center">
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-green-900">Interesse manifestado!</h3>
        <p className="text-green-800 max-w-md mx-auto">
          Recebemos seu interesse. Em breve entraremos em contato com você no email fornecido com os próximos passos.
        </p>
      </div>
    )
  }

  return (
    <form action={action} className="space-y-5">
      {state.status === 'server_error' && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-600">
          {state.message}
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="name" className="block text-sm font-medium">
          Nome completo *
        </label>
        <Input
          id="name"
          name="name"
          placeholder="Seu nome"
          required
          className={state.status === 'error' && state.errors.name ? 'border-red-500' : ''}
        />
        {state.status === 'error' && state.errors.name && (
          <p className="text-xs text-red-600">{state.errors.name[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium">
          Email *
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="seu@email.com"
          required
          className={state.status === 'error' && state.errors.email ? 'border-red-500' : ''}
        />
        {state.status === 'error' && state.errors.email && (
          <p className="text-xs text-red-600">{state.errors.email[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="linkedin_url" className="block text-sm font-medium">
          LinkedIn (opcional)
        </label>
        <Input
          id="linkedin_url"
          name="linkedin_url"
          type="url"
          placeholder="https://linkedin.com/in/seu-perfil"
          className={state.status === 'error' && state.errors.linkedin_url ? 'border-red-500' : ''}
        />
        {state.status === 'error' && state.errors.linkedin_url && (
          <p className="text-xs text-red-600">{state.errors.linkedin_url[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="stack" className="block text-sm font-medium">
          Stack principal (ex: React, Node.js, Python, etc) *
        </label>
        <Textarea
          id="stack"
          name="stack"
          placeholder="Descreva suas principais tecnologias e experiências"
          required
          className={state.status === 'error' && state.errors.stack ? 'border-red-500' : ''}
        />
        {state.status === 'error' && state.errors.stack && (
          <p className="text-xs text-red-600">{state.errors.stack[0]}</p>
        )}
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? 'Enviando...' : 'Manifestar interesse'}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        Não compartilhamos seus dados. Você receberá apenas emails sobre seu cadastro como entrevistador.
      </p>
    </form>
  )
}
