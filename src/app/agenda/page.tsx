import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Calendar, Clock, Video, Star } from 'lucide-react'
import { CancelButton } from '@/components/booking/cancel-button'

export default async function AgendaPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirectedFrom=/agenda')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single<{ role: string }>()

  const isTutor = profile?.role === 'tutor'
  const now = new Date().toISOString()

  // Fetch sessions differently based on role
  let upcoming: SessionItem[] = []
  let past: SessionItem[] = []

  if (isTutor) {
    const { data: tutor } = await supabase
      .from('tutor_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single<{ id: string }>()

    if (tutor) {
      const { data } = await supabase
        .from('sessions')
        .select(`
          id, starts_at, ends_at, status, whereby_room_url, whereby_host_room_url,
          bookings!inner (
            id, gross_amount, tutor_id,
            profiles:learner_id ( full_name, avatar_url )
          )
        `)
        .eq('bookings.tutor_id', tutor.id)
        .order('starts_at', { ascending: false })

      const rows = (data ?? []) as unknown as RawSession[]
      upcoming = rows.filter(r => r.starts_at >= now).reverse().map(r => ({
        ...r,
        other_name: (r.bookings?.profiles as any)?.full_name ?? 'Candidato',
        other_avatar: (r.bookings?.profiles as any)?.avatar_url ?? null,
        amount: r.bookings?.gross_amount ?? 0,
        booking_id: r.bookings?.id ?? '',
        whereby_room_url: r.whereby_host_room_url ?? r.whereby_room_url,
      }))
      past = rows.filter(r => r.starts_at < now).map(r => ({
        ...r,
        other_name: (r.bookings?.profiles as any)?.full_name ?? 'Candidato',
        other_avatar: (r.bookings?.profiles as any)?.avatar_url ?? null,
        amount: r.bookings?.gross_amount ?? 0,
        booking_id: r.bookings?.id ?? '',
        whereby_room_url: r.whereby_host_room_url ?? r.whereby_room_url,
      }))
    }
  } else {
    const { data } = await supabase
      .from('sessions')
      .select(`
        id, starts_at, ends_at, status, whereby_room_url,
        bookings!inner (
          id, gross_amount, learner_id,
          tutor_profiles (
            profiles ( full_name, avatar_url )
          )
        )
      `)
      .eq('bookings.learner_id', user.id)
      .order('starts_at', { ascending: false })

    const rows = (data ?? []) as unknown as RawSessionLearner[]
    upcoming = rows.filter(r => r.starts_at >= now).reverse().map(r => ({
      ...r,
      other_name: (r.bookings?.tutor_profiles as any)?.profiles?.full_name ?? 'Entrevistador',
      other_avatar: (r.bookings?.tutor_profiles as any)?.profiles?.avatar_url ?? null,
      amount: r.bookings?.gross_amount ?? 0,
      booking_id: r.bookings?.id ?? '',
    }))
    past = rows.filter(r => r.starts_at < now).map(r => ({
      ...r,
      other_name: (r.bookings?.tutor_profiles as any)?.profiles?.full_name ?? 'Entrevistador',
      other_avatar: (r.bookings?.tutor_profiles as any)?.profiles?.avatar_url ?? null,
      amount: r.bookings?.gross_amount ?? 0,
      booking_id: r.bookings?.id ?? '',
    }))
  }

  return (
    <div className="mx-auto max-w-3xl space-y-10 px-4 py-10">
      <div>
        <h1 className="text-2xl font-bold">Minha Agenda</h1>
        <p className="text-muted-foreground">
          {isTutor ? 'Suas sessões agendadas com candidatos' : 'Suas mock interviews agendadas'}
        </p>
      </div>

      {/* Upcoming */}
      <section className="space-y-4">
        <h2 className="font-semibold text-lg">Próximas sessões</h2>
        {upcoming.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <Calendar className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">Nenhuma sessão agendada.</p>
            {!isTutor && (
              <Button className="mt-4" render={<Link href="/tutors" />}>
                Agendar agora
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map(session => (
              <SessionCard key={session.id} session={session} isTutor={isTutor} upcoming />
            ))}
          </div>
        )}
      </section>

      {past.length > 0 && (
        <>
          <Separator />
          <section className="space-y-4">
            <h2 className="font-semibold text-lg">Histórico</h2>
            <div className="space-y-3">
              {past.map(session => (
                <SessionCard key={session.id} session={session} isTutor={isTutor} upcoming={false} />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  )
}

// ---------- types ----------

interface SessionItem {
  id: string
  starts_at: string
  ends_at: string
  status: string
  whereby_room_url: string | null
  other_name: string
  other_avatar: string | null
  amount: number
  booking_id: string
}

interface RawSession {
  id: string
  starts_at: string
  ends_at: string
  status: string
  whereby_room_url: string | null
  whereby_host_room_url: string | null
  bookings: {
    id: string
    gross_amount: number
    tutor_id: string
    profiles: { full_name: string; avatar_url: string | null }
  }
  other_name: string
  other_avatar: string | null
  amount: number
  booking_id: string
}

interface RawSessionLearner {
  id: string
  starts_at: string
  ends_at: string
  status: string
  whereby_room_url: string | null
  whereby_host_room_url: string | null
  bookings: {
    id: string
    gross_amount: number
    learner_id: string
    tutor_profiles: unknown
  }
}

// ---------- SessionCard ----------

function SessionCard({
  session,
  isTutor,
  upcoming,
}: Readonly<{
  session: SessionItem
  isTutor: boolean
  upcoming: boolean
}>) {
  const date = new Date(session.starts_at).toLocaleDateString('pt-BR', {
    weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
  })
  const time = new Date(session.starts_at).toLocaleTimeString('pt-BR', {
    hour: '2-digit', minute: '2-digit',
  })

  const hoursUntilSession = (new Date(session.starts_at).getTime() - Date.now()) / (1000 * 60 * 60)

  const initials = session.other_name
    .split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()

  return (
    <div className="flex items-center gap-4 rounded-xl border bg-card p-4">
      {/* Avatar */}
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-muted">
        {session.other_avatar ? (
          <Image src={session.other_avatar} alt={session.other_name} fill className="object-cover" sizes="48px" />
        ) : (
          <span className="flex h-full items-center justify-center text-sm font-semibold text-muted-foreground">
            {initials}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="font-medium truncate">
          {isTutor ? 'Candidato' : 'Entrevistador'}: {session.other_name}
        </p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-0.5">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span className="capitalize">{date}</span>
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {time} (60 min)
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          R$ {session.amount.toFixed(2).replace('.', ',')}
        </p>
      </div>

      {/* Actions */}
      <div className="flex shrink-0 flex-col items-end gap-2">
        {upcoming && session.whereby_room_url && (
          <Button size="sm" nativeButton={false} render={<a href={session.whereby_room_url} target="_blank" rel="noopener noreferrer" aria-label="Entrar na sessão" />}>
            <Video className="mr-1 h-3.5 w-3.5" />
            Entrar
          </Button>
        )}
        {upcoming && !session.whereby_room_url && (
          <Badge variant="secondary">Link em breve</Badge>
        )}
        {upcoming && !isTutor && (
          <CancelButton bookingId={session.booking_id} hoursUntilSession={hoursUntilSession} />
        )}
        {!upcoming && !isTutor && (
          <Button size="sm" variant="outline" render={<Link href={`/agenda/${session.id}/review`} />}>
            <Star className="mr-1 h-3.5 w-3.5" />
            Avaliar
          </Button>
        )}
        {!upcoming && (
          <Badge variant="secondary" className="text-xs">Concluída</Badge>
        )}
      </div>
    </div>
  )
}
