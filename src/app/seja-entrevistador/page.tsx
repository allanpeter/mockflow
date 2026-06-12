import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Check, DollarSign, Clock, Users, Sparkles } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Seja Entrevistador — Monetize sua experiência',
  description: 'Ganhe dinheiro ajudando desenvolvedores a se prepararem para entrevistas técnicas reais.',
}

const howItWorks = [
  {
    step: '01',
    title: 'Crie seu perfil com stack e disponibilidade',
    description: 'Configure sua experiência, tecnologias e horários que você está disponível.',
  },
  {
    step: '02',
    title: 'Defina seu preço por sessão',
    description: 'Você controla quanto quer ganhar. De R$ 80 a R$ 400, você escolhe.',
  },
  {
    step: '03',
    title: 'Receba candidatos e conduza entrevistas',
    description: 'Candidatos agendam suas sessões. Você conduz a entrevista e ganha 90% do valor.',
  },
]

const benefits = [
  {
    icon: DollarSign,
    title: '90% do valor',
    description: 'MockFlow retém apenas 10%. Você fica com tudo o que combinar com o candidato.',
  },
  {
    icon: Clock,
    title: 'Flexibilidade total',
    description: 'Você controla sua agenda. Trabalhe quando quiser, pelos horários que definir.',
  },
  {
    icon: Users,
    title: 'Sem exclusividade',
    description: 'Seja entrevistador aqui e em outras plataformas simultaneamente.',
  },
]

const requirements = [
  '3+ anos de experiência em desenvolvimento de software',
  'Já passou por processos seletivos técnicos em empresas médias ou grandes',
  'Conhecimento profundo em pelo menos uma stack',
  'Inglês não é obrigatório',
  'Disponibilidade mínima de uma sessão por semana',
]

export default function SejaEntrevistador() {
  return (
    <main>
      {/* Hero */}
      <section className="mx-auto max-w-4xl px-4 py-24 text-center space-y-6">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
          Monetize sua experiência ajudando devs a conseguirem vagas melhores
        </h1>

        <p className="mx-auto max-w-2xl text-lg text-muted-foreground leading-relaxed">
          Você já esteve do outro lado da mesa. Sabe o que separa quem passa de quem não passa. Isso vale dinheiro.
        </p>

        <Button size="lg" render={<Link href="/auth/signup?role=tutor" />}>
          Quero ser entrevistador
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>

        <div className="flex justify-center pt-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            <Sparkles className="h-4 w-4" />
            Os primeiros entrevistadores ganham destaque fixo no topo da listagem.
          </div>
        </div>
      </section>

      {/* Earnings section */}
      <section className="mx-auto max-w-4xl px-4 py-20 space-y-8 border-t bg-primary/5">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-bold">Quanto você pode ganhar</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Exemplos reais baseados em entrevistas de 60 minutos
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border bg-card p-6 space-y-4">
            <p className="text-sm font-medium text-muted-foreground">Iniciante</p>
            <div className="space-y-2">
              <p className="text-2xl font-bold">R$ 360</p>
              <p className="text-xs text-muted-foreground">por mês</p>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>1 entrevista por semana</p>
              <p>R$ 100/sessão (você recebe R$ 90)</p>
              <p>4 horas/mês</p>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-6 space-y-4 ring-2 ring-primary">
            <p className="text-sm font-medium text-muted-foreground">Profissional</p>
            <div className="space-y-2">
              <p className="text-3xl font-bold text-primary">R$ 1.800</p>
              <p className="text-xs text-muted-foreground">por mês</p>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>5 entrevistas por semana</p>
              <p>R$ 100/sessão (você recebe R$ 90)</p>
              <p>20 horas/mês</p>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-6 space-y-4">
            <p className="text-sm font-medium text-muted-foreground">Expert</p>
            <div className="space-y-2">
              <p className="text-2xl font-bold">R$ 4.860</p>
              <p className="text-xs text-muted-foreground">por mês</p>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>6 entrevistas por semana</p>
              <p>R$ 225/sessão (você recebe R$ 202,50)</p>
              <p>24 horas/mês</p>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-2xl space-y-4 text-center">
          <p className="text-center text-sm text-muted-foreground">
            Estes são exemplos. Você controla seu preço, sua disponibilidade e quantas entrevistas aceita por semana.
          </p>
          <p className="text-lg font-semibold text-foreground">
            Tudo isso trabalhando apenas <span className="text-primary">1 hora por dia</span>.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-4xl px-4 py-20 space-y-12 border-t">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-bold">Como funciona</h2>
          <p className="text-muted-foreground">3 passos simples para começar a ganhar</p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {howItWorks.map((item) => (
            <div key={item.step} className="space-y-4">
              <div className="text-4xl font-bold text-primary/30">{item.step}</div>
              <h3 className="font-semibold text-lg">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="mx-auto max-w-4xl px-4 py-20 space-y-12 border-t">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-bold">O que você ganha</h2>
          <p className="text-muted-foreground">Sem pegadinhas. Simples e direto.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {benefits.map((benefit) => {
            const Icon = benefit.icon
            return (
              <div key={benefit.title} className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <p className="font-semibold text-lg">{benefit.title}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{benefit.description}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Requirements */}
      <section className="mx-auto max-w-4xl px-4 py-20 space-y-8 border-t">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-bold">Requisitos</h2>
        </div>

        <div className="mx-auto max-w-2xl">
          <ul className="space-y-4">
            {requirements.map((req) => (
              <li key={req} className="flex items-start gap-3">
                <Check className="h-5 w-5 shrink-0 text-primary mt-0.5" />
                <span className="text-muted-foreground">{req}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA Final */}
      <section className="mx-auto max-w-4xl px-4 py-20 text-center space-y-6 border-t">
        <h2 className="text-3xl font-bold">Pronto para começar?</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Crie sua conta e configure seu perfil em minutos. Defina seu preço, sua agenda e comece a receber candidatos.
        </p>
        <Button size="lg" render={<Link href="/auth/signup?role=tutor" />}>
          Criar minha conta de entrevistador
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </section>
    </main>
  )
}
