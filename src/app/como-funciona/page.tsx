import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Target, Code2 } from 'lucide-react'

const steps = {
  learner: [
    {
      n: '01',
      title: 'Crie sua conta',
      description: 'Cadastre-se como candidato em menos de 2 minutos. Sem cartão de crédito necessário.',
    },
    {
      n: '02',
      title: 'Encontre um entrevistador',
      description: 'Navegue pelos perfis de engenheiros experientes, veja suas stacks e avaliações.',
    },
    {
      n: '03',
      title: 'Escolha um horário',
      description: 'Selecione um slot disponível que encaixa na sua agenda e faça o pagamento via PIX ou cartão.',
    },
    {
      n: '04',
      title: 'Participe da sessão',
      description: 'Na data combinada, entre na videochamada e faça sua mock interview. Receba feedback detalhado ao final.',
    },
  ],
  tutor: [
    {
      n: '01',
      title: 'Crie seu perfil',
      description: 'Complete seu perfil com bio, stack, anos de experiência e defina seu preço por sessão.',
    },
    {
      n: '02',
      title: 'Configure sua agenda',
      description: 'Marque os horários em que você está disponível. Você tem controle total da sua disponibilidade.',
    },
    {
      n: '03',
      title: 'Receba agendamentos',
      description: 'Candidatos encontram seu perfil e reservam sessões. Você é notificado por e-mail.',
    },
    {
      n: '04',
      title: 'Conduza e receba',
      description: 'Conduza a entrevista, dê feedback e receba 90% do valor automaticamente.',
    },
  ],
}

const faqs = [
  {
    q: 'Quanto tempo dura uma sessão?',
    a: 'Todas as sessões têm duração fixa de 60 minutos.',
  },
  {
    q: 'Como funciona o pagamento?',
    a: 'Aceitamos PIX e cartão de crédito via Pagar.me. O valor é debitado no momento do agendamento.',
  },
  {
    q: 'E se o entrevistador não aparecer?',
    a: 'Caso o entrevistador não compareça, você recebe reembolso integral em até 24 horas.',
  },
  {
    q: 'Posso cancelar um agendamento?',
    a: 'Cancelamentos com mais de 24h de antecedência recebem reembolso integral. Abaixo disso, não há reembolso.',
  },
  {
    q: 'Como os entrevistadores são selecionados?',
    a: 'Qualquer profissional com experiência pode se cadastrar. A reputação é construída através das avaliações dos candidatos.',
  },
  {
    q: 'Qual a taxa da plataforma?',
    a: 'A MockFlow retém 10% de cada sessão. Os entrevistadores recebem 90% do valor.',
  },
]

export default function ComoFuncionaPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-20 px-4 py-16">

      {/* Hero */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Como funciona</h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          MockFlow conecta candidatos a vagas de tech com engenheiros experientes para prática de entrevistas reais.
        </p>
      </div>

      {/* For learners */}
      <section className="space-y-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border bg-muted">
            <Target className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">Para candidatos</h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          {steps.learner.map((step) => (
            <div key={step.n} className="flex gap-4">
              <span className="text-3xl font-bold text-primary/20 leading-none">{step.n}</span>
              <div>
                <p className="font-semibold">{step.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
        <Button render={<Link href="/auth/signup" />}>
          Começar como candidato
        </Button>
      </section>

      <Separator />

      {/* For tutors */}
      <section className="space-y-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border bg-muted">
            <Code2 className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">Para entrevistadores</h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          {steps.tutor.map((step) => (
            <div key={step.n} className="flex gap-4">
              <span className="text-3xl font-bold text-primary/20 leading-none">{step.n}</span>
              <div>
                <p className="font-semibold">{step.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
        <Button variant="outline" render={<Link href="/auth/signup" />}>
          Começar como entrevistador
        </Button>
      </section>

      <Separator />

      {/* FAQ */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Perguntas frequentes</h2>
        <div className="space-y-4">
          {faqs.map((faq) => (
            <div key={faq.q} className="rounded-lg border p-4 space-y-1">
              <p className="font-medium">{faq.q}</p>
              <p className="text-sm text-muted-foreground">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
