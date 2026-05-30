import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Calendar, Clock, Video, Star, ClipboardList, TrendingUp } from 'lucide-react'
import { CancelButton } from '@/components/booking/cancel-button'

export default async function AgendaPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirectedFrom=/agenda')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single<{ role: string }>()

  const isTutor = profile?.role === 'tutor'
  const now = new Date().toISOString()

  let upcoming: SessionItem[] = []
  let past: SessionItem[] = []

  if (isTutor) {
    const { data: tutorProfile } = await supabase
      .from('tutor_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single<{ id: string }>()

    if (tutorProfile) {
      const { data } = await supabase
        .from('bookings')
        .select(`
          id, gross_amount,
          profiles:learner_id ( full_name, avatar_url ),
          sessions!inner ( id, starts_at, ends_at, status, whereby_room_url, whereby_host_room_url )
        `)
        .eq('tutor_id', tutorProfile.id)
        .eq('status', 'confirmed')

      const rows = (data ?? []) as unknown as RawTutorBooking[]
      const sessionIds = rows.map((r) => {
        const s = r.sessions as { id: string }
        return s.id
      })

      // Fetch which sessions already have feedback from this tutor
      const feedbackSet = new Set<string>()
      if (sessionIds.length > 0) {
        const { data: feedbackRows } = await supabase
          .from('session_feedback')
          .select('session_id')
          .in('session_id', sessionIds)
        for (const f of feedbackRows ?? []) feedbackSet.add(f.session_id)
      }

      const allSessions = rows.map((r) => {
        const s = r.sessions as SessionRaw
        return {
          id: s.id,
          starts_at: s.starts_at,
          ends_at: s.ends_at,
          status: s.status,
          whereby_room_url: s.whereby_host_room_url ?? s.whereby_room_url,
          other_name: (r.profiles as NameAvatar)?.full_name ?? 'Candidato',
          other_avatar: (r.profiles as NameAvatar)?.avatar_url ?? null,
          amount: r.gross_amount ?? 0,
          booking_id: r.id,
          has_feedback: feedbackSet.has(s.id),
        }
      })
      upcoming = allSessions.filter((s) => s.ends_at > now).reverse()
      past = allSessions.filter((s) => s.ends_at <= now)
    }
  } else {
    const { data } = await supabase
      .from('bookings')
      .select(`
        id, gross_amount,
        tutor_profiles (
          profiles ( full_name, avatar_url )
        ),
        sessions!inner ( id, starts_at, ends_at, status, whereby_room_url )
      `)
      .eq('learner_id', user.id)
      .eq('status', 'confirmed')

    const rows = (data ?? []) as unknown as RawLearnerBooking[]
    const sessionIds = rows.map((r) => {
      const s = r.sessions as { id: string }
      return s.id
    })

    // Fetch which sessions have feedback available for this learner
    const feedbackSet = new Set<string>()
    if (sessionIds.length > 0) {
      const { data: feedbackRows } = await supabase
        .from('session_feedback')
        .select('session_id')
        .in('session_id', sessionIds)
      for (const f of feedbackRows ?? []) feedbackSet.add(f.session_id)
    }

    // Fetch which sessions already have a review from this learner
    const reviewedSet = new Set<string>()
    if (sessionIds.length > 0) {
      const { data: reviewRows } = await supabase
        .from('reviews')
        .select('session_id')
        .in('session_id', sessionIds)
        .eq('reviewer_id', user.id)
      for (const r of reviewRows ?? []) reviewedSet.add(r.session_id)
    }

    const allSessions = rows.map((r) => {
      const s = r.sessions as SessionRaw
      return {
        id: s.id,
        starts_at: s.starts_at,
        ends_at: s.ends_at,
        status: s.status,
        whereby_room_url: s.whereby_room_url,
        other_name: (r.tutor_profiles as { profiles: NameAvatar })?.profiles?.full_name ?? 'Entrevistador',
        other_avatar: (r.tutor_profiles as { profiles: NameAvatar })?.profiles?.avatar_url ?? null,
        amount: r.gross_amount ?? 0,
        booking_id: r.id,
        has_feedback: feedbackSet.has(s.id),
        has_review: reviewedSet.has(s.id),
      }
    })
    upcoming = allSessions.filter((s) => s.ends_at > now).reverse()
    past = allSessions.filter((s) => s.ends_at <= now)
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
            {upcoming.map((session) => (
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
              {past.map((session) => (
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
  has_feedback?: boolean
  has_review?: boolean
}

interface SessionRaw {
  id: string
  starts_at: string
  ends_at: string
  status: string
  whereby_room_url: string | null
  whereby_host_room_url?: string | null
}

interface NameAvatar {
  full_name: string
  avatar_url: string | null
}

interface RawTutorBooking {
  id: string
  gross_amount: number
  profiles: NameAvatar
  sessions: unknown
}

interface RawLearnerBooking {
  id: string
  gross_amount: number
  tutor_profiles: unknown
  sessions: unknown
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
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
  const time = new Date(session.starts_at).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })

  const sessionEnded = new Date(session.ends_at) < new Date()
  const hoursUntilSession =
    (new Date(session.starts_at).getTime() - Date.now()) / (1000 * 60 * 60)

  const initials = session.other_name
    .split(' ')
    .map((n: string) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="flex items-start gap-4 rounded-xl border bg-card p-4">
      {/* Avatar */}
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-muted">
        {session.other_avatar ? (
          <Image
            src={session.other_avatar}
            alt={session.other_name}
            fill
            className="object-cover"
            sizes="48px"
          />
        ) : (
          <span className="flex h-full items-center justify-center text-sm font-semibold text-muted-foreground">
            {initials}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">
          {isTutor ? 'Candidato' : 'Entrevistador'}: {session.other_name}
        </p>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span className="capitalize">{date}</span>
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {time} (60 min)
          </span>
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">
          R$ {session.amount.toFixed(2).replace('.', ',')}
        </p>

        {/* Feedback teaser for learner */}
        {!upcoming && !isTutor && session.has_feedback && (
          <div className="mt-2 flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium text-primary">Feedback disponível</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex shrink-0 flex-col items-end gap-2">
        {upcoming && session.whereby_room_url && (
          <Button
            size="sm"
            nativeButton={false}
            render={
              <a
                href={session.whereby_room_url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Entrar na sessão"
              />
            }
          >
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

        {/* Tutor: past session without feedback → Dar feedback */}
        {!upcoming && isTutor && sessionEnded && !session.has_feedback && (
          <Button
            size="sm"
            render={<Link href={`/agenda/${session.id}/feedback`} />}
          >
            <ClipboardList className="mr-1 h-3.5 w-3.5" />
            Dar feedback
          </Button>
        )}
        {/* Tutor: already gave feedback */}
        {!upcoming && isTutor && session.has_feedback && (
          <Button
            size="sm"
            variant="outline"
            render={<Link href={`/agenda/${session.id}/feedback-view`} />}
          >
            Ver feedback
          </Button>
        )}

        {/* Learner: review */}
        {!upcoming && !isTutor && !session.has_review && (
          <Button
            size="sm"
            variant="outline"
            render={<Link href={`/agenda/${session.id}/review`} />}
          >
            <Star className="mr-1 h-3.5 w-3.5" />
            Avaliar
          </Button>
        )}
        {/* Learner: see feedback */}
        {!upcoming && !isTutor && session.has_feedback && (
          <Button
            size="sm"
            render={<Link href={`/agenda/${session.id}/feedback-view`} />}
          >
            <TrendingUp className="mr-1 h-3.5 w-3.5" />
            Ver feedback
          </Button>
        )}

        {!upcoming && <Badge variant="secondary" className="text-xs">Concluída</Badge>}
      </div>
    </div>
  )
}
