import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Star, Users, CalendarCheck, ShieldCheck } from 'lucide-react'

const steps = [
  {
    n: '01',
    title: 'Encontre um entrevistador',
    description: 'Navegue por perfis de engenheiros experientes, veja stacks e avaliações.',
  },
  {
    n: '02',
    title: 'Escolha um horário',
    description: 'Selecione um slot e pague via PIX ou cartão. Tudo em menos de 2 minutos.',
  },
  {
    n: '03',
    title: 'Faça sua mock interview',
    description: 'Entre na videochamada e receba feedback detalhado ao final da sessão.',
  },
]

const stats = [
  { value: '60 min', label: 'por sessão' },
  { value: '90%', label: 'do valor vai ao entrevistador' },
  { value: '24h', label: 'prazo para cancelamento com reembolso' },
]

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <main>
      {/* Hero */}
      <section className="mx-auto max-w-4xl px-4 py-24 text-center space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-3 py-1 text-xs text-muted-foreground">
          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
          Plataforma focada em devs brasileiros
        </div>

        <h1 className="text-5xl font-bold tracking-tight leading-tight">
          Pratique entrevistas técnicas<br />
          <span className="text-primary">com quem já passou por elas</span>
        </h1>

        <p className="mx-auto max-w-xl text-lg text-muted-foreground leading-relaxed">
          Agende uma mock interview com engenheiros experientes do mercado brasileiro. Feedback real, sem rodeios, pelo preço que cabe no bolso.
        </p>

        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button size="lg" render={<Link href="/auth/signup" />}>
            Começar agora
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button size="lg" variant="outline" render={<Link href="/tutors" />}>
            Ver entrevistadores
          </Button>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y bg-muted/30">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <div className="grid grid-cols-3 divide-x text-center">
            {stats.map((s) => (
              <div key={s.label} className="px-4 space-y-1">
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-4xl px-4 py-20 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-bold">Como funciona</h2>
          <p className="text-muted-foreground">Três passos para sua próxima sessão</p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step) => (
            <div key={step.n} className="space-y-3">
              <span className="text-4xl font-bold text-primary/20">{step.n}</span>
              <p className="font-semibold">{step.title}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Button variant="outline" render={<Link href="/como-funciona" />}>
            Ver detalhes completos
          </Button>
        </div>
      </section>

      {/* Trust signals */}
      <section className="border-t bg-muted/30">
        <div className="mx-auto max-w-4xl px-4 py-16">
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="flex gap-4">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border bg-background">
                <ShieldCheck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Pagamento seguro</p>
                <p className="mt-0.5 text-xs text-muted-foreground">Processado via Pagar.me com PIX ou cartão</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border bg-background">
                <CalendarCheck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Reembolso garantido</p>
                <p className="mt-0.5 text-xs text-muted-foreground">Cancelou com 24h de antecedência? Devolvemos tudo.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border bg-background">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Entrevistadores avaliados</p>
                <p className="mt-0.5 text-xs text-muted-foreground">Reputação construída por candidatos reais</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="mx-auto max-w-4xl px-4 py-20 text-center space-y-5">
        <h2 className="text-3xl font-bold">Pronto para se preparar de verdade?</h2>
        <p className="text-muted-foreground">
          Crie sua conta gratuita e agende sua primeira mock interview hoje.
        </p>
        <Button size="lg" render={<Link href="/auth/signup" />}>
          Criar conta grátis
        </Button>
      </section>
    </main>
  )
}
