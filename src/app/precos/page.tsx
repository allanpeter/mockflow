import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'

const learnerFeatures = [
  'Acesso a todos os entrevistadores',
  'Pagamento via PIX ou cartão',
  'Sessões de 60 minutos',
  'Feedback detalhado pós-sessão',
  'Histórico de sessões',
  'Avaliação dos entrevistadores',
]

const tutorFeatures = [
  'Perfil público na plataforma',
  'Defina seu próprio preço',
  'Gerencie sua disponibilidade',
  'Receba 90% do valor por sessão',
  'Pagamento automático pós-sessão',
  'Construa sua reputação',
]

const examples = [
  { price: 80, tutor: 72, fee: 8 },
  { price: 150, tutor: 135, fee: 15 },
  { price: 250, tutor: 225, fee: 25 },
  { price: 400, tutor: 360, fee: 40 },
]

export default function PrecosPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-20 px-4 py-16">

      {/* Hero */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Preços simples e transparentes</h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          Sem mensalidade, sem surpresas. Você paga apenas pelo que usa.
        </p>
      </div>

      {/* Cards */}
      <div className="grid gap-8 md:grid-cols-2">
        {/* Learner */}
        <div className="rounded-2xl border bg-card p-8 space-y-6">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Para candidatos</p>
            <p className="mt-1 text-3xl font-bold">Preço da sessão</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Você paga o valor definido pelo entrevistador. Sem taxas extras.
            </p>
          </div>
          <ul className="space-y-3">
            {learnerFeatures.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 shrink-0 text-primary" />
                {f}
              </li>
            ))}
          </ul>
          <Button className="w-full" render={<Link href="/tutors" />}>
            Ver entrevistadores
          </Button>
        </div>

        {/* Tutor */}
        <div className="rounded-2xl border bg-card p-8 space-y-6 relative overflow-hidden">
          <div className="absolute top-4 right-4 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
            10% de taxa
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Para entrevistadores</p>
            <p className="mt-1 text-3xl font-bold">90% para você</p>
            <p className="mt-1 text-sm text-muted-foreground">
              A MockFlow retém apenas 10% para manter a plataforma. Você fica com o restante.
            </p>
          </div>
          <ul className="space-y-3">
            {tutorFeatures.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 shrink-0 text-primary" />
                {f}
              </li>
            ))}
          </ul>
          <Button variant="outline" className="w-full" render={<Link href="/auth/signup" />}>
            Cadastrar como entrevistador
          </Button>
        </div>
      </div>

      {/* Split examples */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-center">Exemplos de divisão</h2>
        <div className="overflow-hidden rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Preço da sessão</th>
                <th className="px-4 py-3 text-right font-medium">Você recebe (90%)</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Taxa MockFlow (10%)</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {examples.map((ex) => (
                <tr key={ex.price} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">R$ {ex.price},00</td>
                  <td className="px-4 py-3 text-right text-primary font-semibold">R$ {ex.tutor},00</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">R$ {ex.fee},00</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-center text-sm text-muted-foreground">
          O repasse é feito automaticamente via Pagar.me após a conclusão da sessão.
        </p>
      </section>

      {/* CTA */}
      <div className="rounded-2xl bg-primary/5 border border-primary/20 p-10 text-center space-y-4">
        <h2 className="text-2xl font-bold">Pronto para começar?</h2>
        <p className="text-muted-foreground">
          Crie sua conta gratuitamente e agende sua primeira mock interview.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button render={<Link href="/auth/signup" />}>Criar conta grátis</Button>
          <Button variant="outline" render={<Link href="/como-funciona" />}>Como funciona</Button>
        </div>
      </div>
    </div>
  )
}
