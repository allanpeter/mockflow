import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import {
  ArrowRight,
  AlertCircle,
  Brain,
  MessageSquare,
  ShieldCheck,
  CalendarCheck,
  Users,
  Star,
} from 'lucide-react'

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

function avg(reviews: { rating: number }[]): number {
  return reviews?.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0
}

function initialsOf(name: string | null | undefined): string {
  return (name ?? '?')
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  const [{ data: tutorRows }, { data: testimonialRows }] = await Promise.all([
    supabase
      .from('tutor_profiles')
      .select('id, headline, price_per_session, profiles ( full_name, avatar_url ), reviews ( rating )')
      .eq('is_active', true),
    supabase
      .from('reviews')
      .select('rating, comment, created_at, profiles ( full_name, avatar_url )')
      .not('comment', 'is', null)
      .gte('rating', 4)
      .order('created_at', { ascending: false })
      .limit(6),
  ])

  const tutors = (tutorRows ?? []) as unknown as {
    id: string
    headline: string | null
    price_per_session: number
    profiles: { full_name: string; avatar_url: string | null }
    reviews: { rating: number }[]
  }[]

  const featured = [...tutors].sort((a, b) => avg(b.reviews) - avg(a.reviews)).slice(0, 6)
  const avatarStrip = tutors.filter((t) => t.profiles?.avatar_url).slice(0, 5)

  const testimonials = (testimonialRows ?? []) as unknown as {
    rating: number
    comment: string
    created_at: string
    profiles: { full_name: string; avatar_url: string | null }
  }[]

  return (
    <main>
      {/* Hero */}
      <section className="mx-auto max-w-4xl px-4 py-24 text-center space-y-6">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
          Treine para a entrevista que pode mudar sua carreira
        </h1>

        <p className="mx-auto max-w-2xl text-lg text-muted-foreground leading-relaxed">
          Simule entrevistas reais com profissionais experientes, receba feedback detalhado e descubra exatamente o que melhorar antes do processo seletivo.
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

        {/* Social proof: real tutor faces */}
        {avatarStrip.length > 0 && (
          <div className="flex items-center justify-center gap-3 pt-4">
            <div className="flex -space-x-2">
              {avatarStrip.map((t) => (
                <div
                  key={t.id}
                  className="relative h-9 w-9 overflow-hidden rounded-full border-2 border-background bg-muted"
                >
                  {t.profiles.avatar_url ? (
                    <Image
                      src={t.profiles.avatar_url}
                      alt={t.profiles.full_name}
                      fill
                      className="object-cover"
                      sizes="36px"
                    />
                  ) : (
                    <span className="flex h-full items-center justify-center text-xs font-semibold text-muted-foreground">
                      {initialsOf(t.profiles.full_name)}
                    </span>
                  )}
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Entrevistadores reais, prontos para te ajudar agora.
            </p>
          </div>
        )}
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

      {/* Featured tutors */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-5xl px-4 py-20 space-y-10">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold">Entrevistadores em destaque</h2>
            <p className="text-muted-foreground">Engenheiros experientes, avaliados por quem já treinou com eles.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((tutor) => {
              const rating = avg(tutor.reviews)
              return (
                <Link
                  key={tutor.id}
                  href={`/tutors/${tutor.id}`}
                  className="flex flex-col rounded-xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-muted">
                      {tutor.profiles?.avatar_url ? (
                        <Image
                          src={tutor.profiles.avatar_url}
                          alt={tutor.profiles.full_name}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      ) : (
                        <span className="flex h-full items-center justify-center text-sm font-semibold text-muted-foreground">
                          {initialsOf(tutor.profiles?.full_name)}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{tutor.profiles?.full_name}</p>
                      {rating > 0 && (
                        <span className="flex items-center gap-1 text-sm">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          <span className="font-medium">{rating.toFixed(1)}</span>
                          <span className="text-muted-foreground">({tutor.reviews.length})</span>
                        </span>
                      )}
                    </div>
                  </div>
                  {tutor.headline && (
                    <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{tutor.headline}</p>
                  )}
                  <p className="mt-4 font-semibold">
                    R$ {tutor.price_per_session.toFixed(2).replace('.', ',')}
                    <span className="text-xs font-normal text-muted-foreground"> / sessão</span>
                  </p>
                </Link>
              )
            })}
          </div>

          <div className="flex justify-center">
            <Button variant="outline" render={<Link href="/tutors" />}>
              Ver todos os entrevistadores
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </section>
      )}

      {/* Pain section */}
      <section id="por-que" className="mx-auto max-w-4xl px-4 py-20 space-y-12 border-t">
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

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="border-t bg-muted/30">
          <div className="mx-auto max-w-5xl px-4 py-20 space-y-10">
            <div className="text-center space-y-3">
              <h2 className="text-3xl font-bold">Quem treinou, recomenda</h2>
              <p className="text-muted-foreground">Avaliações reais de candidatos após as sessões.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((t) => (
                <div key={t.created_at} className="flex flex-col rounded-xl border bg-card p-5 shadow-sm">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`h-4 w-4 ${s <= t.rating ? 'fill-amber-400 text-amber-400' : 'text-muted'}`}
                      />
                    ))}
                  </div>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                    “{t.comment}”
                  </p>
                  <div className="mt-4 flex items-center gap-2">
                    <div className="relative h-8 w-8 overflow-hidden rounded-full bg-muted">
                      {t.profiles?.avatar_url ? (
                        <Image
                          src={t.profiles.avatar_url}
                          alt={t.profiles.full_name}
                          fill
                          className="object-cover"
                          sizes="32px"
                        />
                      ) : (
                        <span className="flex h-full items-center justify-center text-xs font-semibold text-muted-foreground">
                          {initialsOf(t.profiles?.full_name)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium">{t.profiles?.full_name ?? 'Candidato'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

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
                <p className="mt-0.5 text-xs text-muted-foreground">PIX ou cartão. Processado via Pagar.me.</p>
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
