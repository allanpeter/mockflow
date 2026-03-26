'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export default function ContatoPage() {
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    // TODO: integrate with email service (Resend / SendGrid)
    await new Promise((r) => setTimeout(r, 800))
    setSent(true)
    setLoading(false)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-10 px-4 py-16">
      <div className="space-y-3">
        <h1 className="text-4xl font-bold tracking-tight">Fale conosco</h1>
        <p className="text-lg text-muted-foreground">
          Tem alguma dúvida, sugestão ou problema? Envie uma mensagem e responderemos em até 24 horas.
        </p>
      </div>

      {sent ? (
        <div className="rounded-2xl border bg-card p-10 text-center space-y-3">
          <p className="text-2xl">✅</p>
          <p className="font-semibold text-lg">Mensagem enviada!</p>
          <p className="text-sm text-muted-foreground">
            Recebemos sua mensagem e responderemos em breve no e-mail informado.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" name="name" placeholder="Seu nome" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" name="email" type="email" placeholder="seu@email.com" required />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="subject">Assunto</Label>
            <Input id="subject" name="subject" placeholder="Como podemos ajudar?" required />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="message">Mensagem</Label>
            <Textarea
              id="message"
              name="message"
              placeholder="Descreva sua dúvida ou problema com o máximo de detalhes..."
              rows={6}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Enviando…' : 'Enviar mensagem'}
          </Button>
        </form>
      )}

      <div className="grid gap-4 sm:grid-cols-2 text-sm">
        <div className="rounded-lg border p-4 space-y-1">
          <p className="font-medium">E-mail</p>
          <p className="text-muted-foreground">suporte@mockflow.com.br</p>
        </div>
        <div className="rounded-lg border p-4 space-y-1">
          <p className="font-medium">Tempo de resposta</p>
          <p className="text-muted-foreground">Até 24 horas em dias úteis</p>
        </div>
      </div>
    </div>
  )
}
