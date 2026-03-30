import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, AlertCircle, Brain, MessageSquare, ShieldCheck, CalendarCheck, Users } from 'lucide-react'

const painPoints = [
  {
    icon: AlertCircle,
    title: 'Simulações não parecem reais',
    description: 'Plataformas genéricas não reproduzem a pressão e dinâmica de uma entrevista de verdade.',
  },
  {
    icon: Brain,
    title: 'Ansiedade na hora H',
    description: 'Sem prática com entrevistadores reais, você congela quando chega o momento que importa.',
  },
  {
    icon: MessageSquare,
    title: 'Feedback vago ou inexistente',
    description: 'Você precisa saber exatamente o que melhorar, não de respostas genéricas.',
  },
]

const stats = [
  { value: '60 min', label: 'de entrevista focada' },
  { value: '90%', label: 'do valor vai direto pro entrevistador' },
  { value: '24h', label: 'prazo para reembolso total' },
]

const steps = [
  {
    n: '01',
    title: 'Escolha um engenheiro experiente',
    description: 'Veja quem passou por entrevistas nas maiores empresas. Stack, experiência e avaliações reais.',
  },
  {
    n: '02',
    title: 'Agende seu horário',
    description: 'Escolha um slot disponível. Pague via PIX ou cartão. Tudo leva 2 minutos.',
  },
  {
    n: '03',
    title: 'Entrevista real + feedback honesto',
    description: 'Enfrente perguntas reais em tempo real. Saia com feedback prático e acionável.',
  },
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
        <h1 className="text-5xl font-bold tracking-tight leading-tight">
          Você não é ruim em entrevistas.<br />
          <span className="text-primary">Você só nunca treinou em uma de verdade.</span>
        </h1>

        <p className="mx-auto max-w-2xl text-lg text-muted-foreground leading-relaxed">
          O MockFlow conecta você com engenheiros experientes para simulações reais, com pressão real e feedback direto. Para você chegar preparado — não na sorte.
        </p>

        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button size="lg" render={<Link href="/tutors" />}>
            Ver entrevistadores disponíveis
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button size="lg" variant="outline" render={<Link href="#por-que" />}>
            Por que funciona
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

      {/* Pain section */}
      <section id="por-que" className="mx-auto max-w-4xl px-4 py-20 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-bold">Por que você falha em entrevistas técnicas</h2>
          <p className="text-muted-foreground">Não é falta de conhecimento. É falta de prática real.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {painPoints.map((point) => {
            const Icon = point.icon
            return (
              <div key={point.title} className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                  <Icon className="h-5 w-5 text-destructive" />
                </div>
                <p className="font-semibold">{point.title}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{point.description}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-4xl px-4 py-20 space-y-12 border-t">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-bold">Como funciona</h2>
          <p className="text-muted-foreground">Três passos até sua primeira entrevista real</p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step) => (
            <div key={step.n} className="space-y-4">
              <div className="text-4xl font-bold text-primary/30">{step.n}</div>
              <h3 className="font-semibold text-lg">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-center pt-4">
          <Button size="lg" render={<Link href="/tutors" />}>
            Agendar minha entrevista
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Trust signals */}
      <section className="border-t bg-muted/30">
        <div className="mx-auto max-w-4xl px-4 py-16">
          <h3 className="text-center text-xl font-semibold mb-10">Segurança e transparência</h3>
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="flex gap-4">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border bg-background shadow-sm">
                <ShieldCheck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Pagamento seguro</p>
                <p className="mt-0.5 text-xs text-muted-foreground">PIX ou cartão. Processado via AbacatePay.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border bg-background shadow-sm">
                <CalendarCheck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Reembolso sem perguntas</p>
                <p className="mt-0.5 text-xs text-muted-foreground">Cancele com 24h de antecedência. 100% de volta.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border bg-background shadow-sm">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Entrevistadores verificados</p>
                <p className="mt-0.5 text-xs text-muted-foreground">Engenheiros experientes, avaliados por candidatos.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="mx-auto max-w-4xl px-4 py-20 text-center space-y-6">
        <h2 className="text-3xl font-bold">Parou de preparar. Hora de treinar.</h2>
        <p className="text-muted-foreground">
          A diferença entre passar e falhar está na prática com gente que já passou.
        </p>
        <Button size="lg" render={<Link href="/tutors" />}>
          Ver entrevistadores agora
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </section>
    </main>
  )
}
